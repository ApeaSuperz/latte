<script lang="ts" setup>
import request from '@/utils/request'
import { reactive, Ref, ref } from 'vue'
import { Delete, Plus } from '@element-plus/icons-vue'
import { useValidator } from '@/hooks/web/useValidator'
import { ElMessageBox } from 'element-plus'
import AvMap from '@/components/AvMap.vue'
import { BusinessHall, BusinessHour } from '@/types/api'
import { AxiosResponse } from 'axios'
import {
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  getCollectionPointByLocation,
  getCollectionPointLocationByKeywords,
} from '@/utils/a-map'

const businessHalls = ref<LocalBusinessHall[]>([])

request('/business-halls').then((res) => {
  businessHalls.value = res.data?.map(localizeBusinessHall) ?? []
})

interface LocalBusinessHour {
  id?: number
  time: [Date, Date]
}

type LocalBusinessHall = Omit<BusinessHall, 'longitude' | 'latitude' | 'businessTime'> & {
  longitude: string
  latitude: string
  businessTime: Ref<LocalBusinessHour>[][]
}

const showDialog = ref(false)
const dialogTitle = ref('')
const editingBusinessHall = reactive<LocalBusinessHall>({} as LocalBusinessHall)
const selectorMap = ref<InstanceType<typeof AvMap> | null>(null)

function localizeBusinessHall(businessHall: BusinessHall): LocalBusinessHall {
  const localBusinessHall: LocalBusinessHall = {
    ...businessHall,
    longitude: businessHall.longitude.toString(),
    latitude: businessHall.latitude.toString(),
    businessTime: [[], [], [], [], [], [], []],
  }

  for (const hour of businessHall.businessTime) {
    localBusinessHall.businessTime[hour.weekday - 1].push(
      ref({
        id: hour.id,
        time: [new Date('1970-1-1 ' + hour.open), new Date('1970-1-1 ' + hour.close)],
      } as LocalBusinessHour)
    )
  }

  return localBusinessHall
}

function setEditingBusinessHall(localBusinessHall?: LocalBusinessHall) {
  editingBusinessHall.id = localBusinessHall?.id ?? 0
  editingBusinessHall.name = localBusinessHall?.name ?? ''
  editingBusinessHall.address = localBusinessHall?.address ?? ''
  editingBusinessHall.landmark = localBusinessHall?.landmark ?? ''
  editingBusinessHall.traffic = localBusinessHall?.traffic ?? ''
  editingBusinessHall.latitude = localBusinessHall?.latitude.toString() ?? ''
  editingBusinessHall.longitude = localBusinessHall?.longitude.toString() ?? ''
  editingBusinessHall.businessTime = localBusinessHall?.businessTime ?? [[], [], [], [], [], [], []]
  editingBusinessHall.notes = localBusinessHall?.notes
}

function updateSelectorMap() {
  if (editingBusinessHall.longitude.length && editingBusinessHall.latitude.length) {
    selectorMap.value?.map?.setCenter([
      parseFloat(editingBusinessHall.longitude),
      parseFloat(editingBusinessHall.latitude),
    ])
  }
}

function addBusinessHall() {
  setEditingBusinessHall()
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
  getCollectionPointLocationByKeywords('hall', editingBusinessHall.name, editingBusinessHall.address)
    .then((geo) => {
      editingBusinessHall.longitude = geo[0].toString()
      editingBusinessHall.latitude = geo[1].toString()
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
  editingBusinessHall.businessTime[weekday].push(hours)
}

function deleteBusinessHours(weekday: number, index: number) {
  editingBusinessHall.businessTime[weekday].splice(index, 1)
}

function makeRange(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, i) => i + start)
}

function edit(index: number) {
  setEditingBusinessHall(businessHalls.value[index])
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
    name: editingBusinessHall.name,
    address: editingBusinessHall.address,
    landmark: editingBusinessHall.landmark,
    traffic: editingBusinessHall.traffic,
    latitude: parseFloat(editingBusinessHall.latitude),
    longitude: parseFloat(editingBusinessHall.longitude),
    businessTime: [] as (Omit<BusinessHour, 'id'> & { id?: number })[],
    markerImageUrl: null,
    notes: editingBusinessHall.notes,
  }

  // 添加营业时间
  for (let weekday = 1; weekday <= editingBusinessHall.businessTime.length; weekday++) {
    for (const localBusinessHour of editingBusinessHall.businessTime[weekday - 1]) {
      const [start, end] = localBusinessHour.value.time
      businessHallData.businessTime.push({
        id: localBusinessHour.value.id,
        weekday,
        open: `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`,
        close: `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`,
      })
    }
  }

  let req: Promise<AxiosResponse<BusinessHall>>
  if (editingBusinessHall.id !== 0) {
    req = request(`/business-halls/${editingBusinessHall.id}`, {
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
      if (res.status === 200 && res.data) {
        // 更新营业厅列表
        const localBusinessHall = localizeBusinessHall(res.data)
        if (editingBusinessHall.id === 0) {
          businessHalls.value.unshift(localBusinessHall)
        } else {
          const index = businessHalls.value.findIndex((hall) => hall.id === editingBusinessHall.id)
          if (index !== -1) {
            businessHalls.value[index] = localBusinessHall
          } else {
            businessHalls.value.unshift(localBusinessHall)
          }
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
    editingBusinessHall.name = poi.name
    editingBusinessHall.address = poi.address
    editingBusinessHall.longitude = poi.location.lng.toString()
    editingBusinessHall.latitude = poi.location.lat.toString()
  }

  getCollectionPointByLocation(lnglat, 'hall')
    .then((poi) => {
      if (editingBusinessHall.name || editingBusinessHall.address) {
        const filled = editingBusinessHall.name ?? editingBusinessHall.address
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
        <ElForm :model="editingBusinessHall" :rules="rules" class="form-in-scrollbar">
          <ElFormItem label="名称" prop="name">
            <ElInput v-model="editingBusinessHall.name" />
          </ElFormItem>
          <ElFormItem label="地址" prop="address">
            <ElInput v-model="editingBusinessHall.address" />
          </ElFormItem>
          <ElFormItem label="地标建筑" prop="landmark">
            <ElInput v-model="editingBusinessHall.landmark" />
          </ElFormItem>
          <ElFormItem label="交通方式" prop="traffic">
            <ElInput v-model="editingBusinessHall.traffic" />
          </ElFormItem>
          <ElRow :gutter="10">
            <ElCol :span="11">
              <ElFormItem label="经度" prop="longitude">
                <ElInput v-model="editingBusinessHall.longitude" @change="updateSelectorMap" />
              </ElFormItem>
            </ElCol>
            <ElCol :span="11">
              <ElFormItem label="纬度" prop="latitude">
                <ElInput v-model="editingBusinessHall.latitude" @change="updateSelectorMap" />
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
                editingBusinessHall.longitude.length && editingBusinessHall.latitude.length
                  ? [parseFloat(editingBusinessHall.longitude), parseFloat(editingBusinessHall.latitude)]
                  : DEFAULT_CENTER
              "
              :zoom="DEFAULT_ZOOM"
              class="selector-map"
              @click="onMapClick"
            >
              <AvMapMarker
                v-if="editingBusinessHall.longitude.length && editingBusinessHall.latitude.length"
                :geo="[parseFloat(editingBusinessHall.longitude), parseFloat(editingBusinessHall.latitude)]"
                :title="editingBusinessHall.name"
              />
            </AvMap>
          </ElFormItem>
          <ElFormItem label="营业时间" prop="businessHours">
            <div class="business-hours-list">
              <div v-for="(day, index) in ['一', '二', '三', '四', '五', '六', '日']" :key="day" class="single-day">
                <div class="header">
                  <div class="weekday">周{{ day }}</div>
                  <ElButton :icon="Plus as any" circle size="small" type="primary" @click="addBusinessHours(index)" />
                </div>
                <span v-if="editingBusinessHall.businessTime[index].length === 0">休息</span>
                <div v-for="(time, i) in editingBusinessHall.businessTime[index]" :key="day + '-' + i" class="values">
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
          <ElFormItem label="备注" prop="notes">
            <ElInput v-model="editingBusinessHall.notes" maxlength="100" show-word-limit type="textarea" />
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
