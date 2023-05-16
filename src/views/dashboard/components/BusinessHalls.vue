<script lang="ts" setup>
import request from '@/utils/request'
import { reactive, Ref, ref } from 'vue'
import { Delete, Plus } from '@element-plus/icons-vue'
import { useValidator } from '@/hooks/web/useValidator'
import { ElMessageBox } from 'element-plus'
import AvMap from '@/components/AvMap.vue'
import { BusinessHall, BusinessHour } from '@/types/api'
import { AxiosResponse } from 'axios'
import { getCollectionPointByLocation, getCollectionPointLocationByKeywords } from '@/utils/a-map'

const businessHalls = ref<BusinessHall[]>([])

request('/business-halls').then((res) => {
  businessHalls.value = res.data ?? []
})

interface LocalBusinessHour {
  id?: number
  time: [Date, Date]
}

const showDialog = ref(false)
const dialogTitle = ref('')
const dialogBusinessHall = reactive({
  id: 0,
  name: '',
  address: '',
  landmark: '',
  traffic: '',
  latitude: '',
  longitude: '',
  businessHours: [[], [], [], [], [], [], []] as Ref<LocalBusinessHour>[][],
})
const selectorMap = ref<InstanceType<typeof AvMap> | null>(null)

function setDialogBusinessHall(businessHall?: BusinessHall) {
  dialogBusinessHall.id = businessHall?.id ?? 0
  dialogBusinessHall.name = businessHall?.name ?? ''
  dialogBusinessHall.address = businessHall?.address ?? ''
  dialogBusinessHall.landmark = businessHall?.landmark ?? ''
  dialogBusinessHall.traffic = businessHall?.traffic ?? ''
  dialogBusinessHall.latitude = businessHall?.latitude.toString() ?? ''
  dialogBusinessHall.longitude = businessHall?.longitude.toString() ?? ''

  dialogBusinessHall.businessHours = []
  for (let weekday = 1; weekday <= 7; weekday++) {
    dialogBusinessHall.businessHours.push([])
    if (businessHall?.businessTime) {
      const parsedBusinessHours: Ref<LocalBusinessHour>[] = businessHall.businessTime
        .filter((time) => time.weekday === weekday)
        .map((time) => {
          const [openHour, openMinute] = time.open.split(':')
          const [closeHour, closeMinute] = time.close.split(':')
          return ref({
            id: time.id,
            time: [
              new Date(0, 0, 0, parseInt(openHour, 10), parseInt(openMinute, 10)),
              new Date(0, 0, 0, parseInt(closeHour, 10), parseInt(closeMinute, 10)),
            ],
          } as LocalBusinessHour)
        })
      dialogBusinessHall.businessHours[weekday - 1].push(...parsedBusinessHours)
    }
  }
}

function updateSelectorMap() {
  if (dialogBusinessHall.longitude.length && dialogBusinessHall.latitude.length) {
    selectorMap.value?.map?.setCenter([
      parseFloat(dialogBusinessHall.longitude),
      parseFloat(dialogBusinessHall.latitude),
    ])
  }
}

function addBusinessHall() {
  setDialogBusinessHall()
  dialogTitle.value = '新增营业厅'
  showDialog.value = true
}

const { required } = useValidator()

const rules = {
  name: [required()],
  address: [required()],
  landmark: [required()],
  traffic: [required()],
  latitude: [required()],
  longitude: [required()],
  businessHours: [required()],
}

function fetchGeoByAddress() {
  getCollectionPointLocationByKeywords('hall', dialogBusinessHall.name, dialogBusinessHall.address)
    .then((geo) => {
      dialogBusinessHall.longitude = geo[0].toString()
      dialogBusinessHall.latitude = geo[1].toString()
    })
    .catch((err: Error) => {
      ElMessageBox.alert('高德 API 响应：' + err.message, '获取坐标失败', {
        confirmButtonText: '确定',
        type: 'error',
      })
    })
}

function addBusinessHours(weekday: number) {
  const hours = ref<LocalBusinessHour>({
    time: [new Date(0, 0, 0, 8, 30, 0), new Date(0, 0, 0, 17, 0, 0)],
  })
  dialogBusinessHall.businessHours[weekday].push(hours)
}

function deleteBusinessHours(weekday: number, index: number) {
  dialogBusinessHall.businessHours[weekday].splice(index, 1)
}

function makeRange(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, i) => i + start)
}

function edit(index: number) {
  setDialogBusinessHall(businessHalls.value[index])
  dialogTitle.value = '编辑营业厅'
  showDialog.value = true
}

function remove(businessHallId: number) {
  const index = businessHalls.value.findIndex((businessHall) => businessHall.id === businessHallId)
  const businessHall = businessHalls.value[index]
  ElMessageBox.confirm(`此操作将永久删除营业厅「${businessHall.name}」, 是否继续?`, '删除营业厅', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      request(`/business-halls/${businessHallId}`, {
        method: 'DELETE',
      })
        .then((res) => {
          if (res.status === 200) {
            businessHalls.value.splice(index, 1)
          }
        })
        .catch((err) => {
          console.error(err)
        })
    })
    .catch(() => {
      // Do nothing
    })
}

function save() {
  const businessHallData = {
    name: dialogBusinessHall.name,
    address: dialogBusinessHall.address,
    landmark: dialogBusinessHall.landmark,
    traffic: dialogBusinessHall.traffic,
    latitude: dialogBusinessHall.latitude,
    longitude: dialogBusinessHall.longitude,
    businessTime: [] as (Omit<BusinessHour, 'id'> & { id?: number })[],
    iconUrl: null, // TODO
    iconColor: null,
    iconBackgroundColor: null,
    markerImageUrl: null,
  }

  // 添加营业时间
  for (let weekday = 1; weekday <= dialogBusinessHall.businessHours.length; weekday++) {
    for (const localBusinessHour of dialogBusinessHall.businessHours[weekday - 1]) {
      const [start, end] = localBusinessHour.value.time
      businessHallData.businessTime.push({
        id: localBusinessHour.value.id,
        weekday,
        open: `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`,
        close: `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`,
      })
    }
  }

  let req: Promise<AxiosResponse<any>>
  if (dialogBusinessHall.id !== 0) {
    req = request(`/business-halls/${dialogBusinessHall.id}`, {
      method: 'PUT',
      data: businessHallData,
    })
  } else {
    req = request('/business-halls', {
      method: 'POST',
      data: businessHallData,
    })
  }

  req
    .then((res) => {
      if (res.status === 200) {
        // 更新营业厅列表
        // FIXME: 转换成 LocalBusinessHall
        if (dialogBusinessHall.id === 0) {
          businessHalls.value.unshift(res.data)
        } else {
          const index = businessHalls.value.findIndex((hall) => hall.id === dialogBusinessHall.id)
          businessHalls.value[index] = res.data
        }

        ElMessageBox.alert('保存成功', '提示', {
          confirmButtonText: '确定',
          type: 'success',
        })
        showDialog.value = false
      }
    })
    .catch((err) => {
      console.log(err)
      ElMessageBox.alert(err.message, '提示', {
        confirmButtonText: '确定',
        type: 'error',
      })
    })
}

function onMapClick(lnglat: [number, number]) {
  function fillBusinessHall(poi: AMap.Poi) {
    dialogBusinessHall.name = poi.name
    dialogBusinessHall.address = poi.address
    dialogBusinessHall.longitude = poi.location.lng.toString()
    dialogBusinessHall.latitude = poi.location.lat.toString()
  }

  getCollectionPointByLocation(lnglat, 'hall')
    .then((poi) => {
      if (dialogBusinessHall.name || dialogBusinessHall.address) {
        const filled = dialogBusinessHall.name ?? dialogBusinessHall.address
        ElMessageBox.confirm(
          `您点击的位置是「${poi.name}」，是否使用该位置替换您已经填写的位置「${filled}」？`,
          '替换已填写位置',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'info',
          }
        )
          .then(() => {
            fillBusinessHall(poi)
          })
          .catch(() => {
            // Do nothing
          })
      } else {
        fillBusinessHall(poi)
      }
    })
    .catch((err: Error) => {
      ElMessageBox.alert('高德 API 响应：' + err.message, '获取点击位置信息失败', {
        confirmButtonText: '确定',
        type: 'error',
      })
    })
}
</script>

<template>
  <div class="business-halls">
    <div class="operations">
      <ElButton :icon="Plus as any" size="large" type="primary" @click="addBusinessHall">新增</ElButton>
    </div>
    <ElTable :data="businessHalls" table-layout="fixed">
      <ElTableColumn label="ID" prop="id" />
      <ElTableColumn label="名称" prop="name" />
      <ElTableColumn label="地址" prop="address" />
      <ElTableColumn label="操作">
        <template #default="scope">
          <ElButton type="primary" @click="edit(scope.$index)">编辑</ElButton>
          <ElButton type="danger" @click="remove(scope.row.id)">删除</ElButton>
        </template>
      </ElTableColumn>
    </ElTable>

    <ElDialog v-model="showDialog" :close-on-click-modal="false" :title="dialogTitle" destroy-on-close draggable>
      <ElScrollbar height="500px">
        <ElForm :model="dialogBusinessHall" :rules="rules" class="form-in-scrollbar">
          <ElFormItem label="名称" prop="name">
            <ElInput v-model="dialogBusinessHall.name" />
          </ElFormItem>
          <ElFormItem label="地址" prop="address">
            <ElInput v-model="dialogBusinessHall.address" />
          </ElFormItem>
          <ElFormItem label="地标建筑" prop="landmark">
            <ElInput v-model="dialogBusinessHall.landmark" />
          </ElFormItem>
          <ElFormItem label="交通方式" prop="traffic">
            <ElInput v-model="dialogBusinessHall.traffic" />
          </ElFormItem>
          <ElRow :gutter="10">
            <ElCol :span="11">
              <ElFormItem label="经度" prop="longitude">
                <ElInput v-model="dialogBusinessHall.longitude" @change="updateSelectorMap" />
              </ElFormItem>
            </ElCol>
            <ElCol :span="11">
              <ElFormItem label="纬度" prop="latitude">
                <ElInput v-model="dialogBusinessHall.latitude" @change="updateSelectorMap" />
              </ElFormItem>
            </ElCol>
            <ElCol :span="2">
              <ElTooltip content="根据地址推断">
                <ElButton text type="primary" @click="fetchGeoByAddress">
                  <ElIcon size="18px">
                    <IEpMapLocation />
                  </ElIcon>
                </ElButton>
              </ElTooltip>
            </ElCol>
          </ElRow>
          <ElFormItem>
            <AvMap
              ref="selectorMap"
              :center="
                dialogBusinessHall.longitude.length && dialogBusinessHall.latitude.length
                  ? [parseFloat(dialogBusinessHall.longitude), parseFloat(dialogBusinessHall.latitude)]
                  : undefined
              "
              class="selector-map"
              @click="onMapClick"
            >
              <AvMapMarker
                v-if="dialogBusinessHall.longitude.length && dialogBusinessHall.latitude.length"
                :geo="[parseFloat(dialogBusinessHall.longitude), parseFloat(dialogBusinessHall.latitude)]"
                :title="dialogBusinessHall.name"
              />
            </AvMap>
          </ElFormItem>
          <ElFormItem label="营业时间" prop="businessHours">
            <div class="business-hours-list">
              <div v-for="(day, index) in ['一', '二', '三', '四', '五', '六', '天']" :key="day" class="single-day">
                <div class="header">
                  <div class="weekday">周{{ day }}</div>
                  <ElButton :icon="Plus as any" circle size="small" type="primary" @click="addBusinessHours(index)" />
                </div>
                <span v-if="dialogBusinessHall.businessHours[index].length === 0">休息</span>
                <div v-for="(time, i) in dialogBusinessHall.businessHours[index]" :key="day + '-' + i" class="values">
                  <ElTimePicker v-model="time.value.time" :disabled-seconds="() => makeRange(0, 59)" is-range />
                  <ElButton
                    :icon="Delete as any"
                    circle
                    class="delete-business-hours-button"
                    size="small"
                    type="danger"
                    @click="deleteBusinessHours(index, i)"
                  />
                </div>
              </div>
            </div>
          </ElFormItem>
        </ElForm>
      </ElScrollbar>

      <template #footer>
        <ElButton @click="showDialog = false">取消</ElButton>
        <ElButton type="primary" @click="save">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.business-halls {
  position: relative;
  height: 100%;
  background-color: var(--el-bg-color);
  padding: 20px;
  box-sizing: border-box;
}

.operations {
  text-align: start;
  margin-bottom: 20px;
}

.selector-map {
  width: 100%;
  height: 300px;
}

.business-hours-list {
  display: block;
  width: 100%;
}

.business-hours-list .single-day {
  position: relative;
  width: 100%;
  text-align: start;
}

.business-hours-list .single-day .header {
  display: inline-block;
  position: relative;
  width: 100%;
}

.business-hours-list .single-day .header .weekday {
  display: inline-block;
  margin-right: 20px;
}

.business-hours-list .single-day:not(:last-child) {
  margin-bottom: 5px;
}

.business-hours-list .single-day .values {
  display: flex;
  align-items: center;
}

.business-hours-list .single-day .values:not(:last-child) {
  margin-bottom: 2px;
}

.delete-business-hours-button {
  margin-left: 10px;
}

.form-in-scrollbar {
  padding: 0 10px;
  box-sizing: border-box;
}
</style>
