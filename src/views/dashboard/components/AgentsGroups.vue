<script lang="ts" setup>
import { Delete, Plus } from '@element-plus/icons-vue'
import { reactive, Ref, ref } from 'vue'
import { useValidator } from '@/hooks/web/useValidator'
import { Agent, AgentsGroup, BusinessHour } from '@/types/api'
import { AxiosResponse } from 'axios'
import request from '@/utils/request'
import { remove } from 'lodash'
import { ElMessageBox, TreeNode } from 'element-plus'
import AvMap from '@/components/AvMap.vue'
import {
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  getCollectionPointByLocation,
  getCollectionPointLocationByKeywords,
} from '@/utils/a-map'

interface LocalBusinessHour {
  id?: number
  time: [Date, Date]
}

interface LocalAgentsGroup extends AgentsGroup {
  agents: LocalAgent[]
  hasChildren: true
}

type LocalAgent = Omit<Agent, 'longitude' | 'latitude' | 'businessTime'> & {
  longitude: string
  latitude: string
  businessTime: Ref<LocalBusinessHour>[][]
  group: number
}

const agentsGroups = ref<LocalAgentsGroup[]>([])

request('agents-groups').then((res) => {
  agentsGroups.value = res.data?.map(localizeAgentsGroup) ?? []
})

const showAgentsGroupDialog = ref(false)
const showAgentDialog = ref(false)
const dialogTitle = ref('')

const editingAgentsGroup = reactive<LocalAgentsGroup>({} as LocalAgentsGroup)
const editingAgent = reactive<LocalAgent>({} as LocalAgent)

function setEditingAgentsGroup(localAgentsGroup?: LocalAgentsGroup) {
  editingAgentsGroup.id = localAgentsGroup?.id ?? 0
  editingAgentsGroup.name = localAgentsGroup?.name ?? ''
  editingAgentsGroup.markerImageUrl = localAgentsGroup?.markerImageUrl
}

function setEditingAgent(agentGroupId: number, localAgent?: LocalAgent) {
  editingAgent.id = localAgent?.id ?? 0
  editingAgent.name = localAgent?.name ?? ''
  editingAgent.address = localAgent?.address ?? ''
  editingAgent.longitude = localAgent?.longitude ?? ''
  editingAgent.latitude = localAgent?.latitude ?? ''
  editingAgent.group = agentGroupId
  editingAgent.businessTime = localAgent?.businessTime ?? [[], [], [], [], [], [], []]
}

function addAgentsGroup() {
  showAgentDialog.value = false
  dialogTitle.value = '新增代收组'
  setEditingAgentsGroup()
  showAgentsGroupDialog.value = true
}

function editAgentsGroup(localAgentsGroup: LocalAgentsGroup) {
  showAgentDialog.value = false
  dialogTitle.value = '编辑代收组'
  setEditingAgentsGroup(localAgentsGroup)
  showAgentsGroupDialog.value = true
}

function removeAgentsGroup(localAgentsGroup: LocalAgentsGroup) {
  ElMessageBox.confirm(`此操作将永久删除代收组「${localAgentsGroup.name}」及其附属代收点，是否继续？`, '删除代收组', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error',
  }).then(() => {
    request(`/agents-groups/${Math.abs(localAgentsGroup.id)}`, {
      method: 'DELETE',
    }).then((res) => {
      if (res.status === 200) {
        remove(agentsGroups.value, (group) => group.id === localAgentsGroup.id)
      }
    })
  })
}

function addAgent(localAgentsGroup: LocalAgentsGroup) {
  showAgentsGroupDialog.value = false
  dialogTitle.value = `新增代收点到「${localAgentsGroup.name}」`
  setEditingAgent(localAgentsGroup.id)
  showAgentDialog.value = true
}

function editAgent(localAgent: LocalAgent) {
  showAgentsGroupDialog.value = false
  dialogTitle.value = '编辑代收点'
  setEditingAgent(localAgent.group, localAgent)
  showAgentDialog.value = true
}

function removeAgent(localAgent: LocalAgent) {
  ElMessageBox.confirm(`此操作将永久删除代收点「${localAgent.name}」，是否继续？`, '删除代收点', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    request(`/agents/${localAgent.id}`, {
      method: 'DELETE',
    }).then((res) => {
      if (res.status === 200) {
        const agentsGroup = agentsGroups.value.find((group) => group.id === localAgent.group)
        if (agentsGroup) {
          remove(agentsGroup.agents, (agent) => agent.id === localAgent.id)
        }
      }
    })
  })
}

const { required } = useValidator()
const agentsGroupRule = {
  name: [required()],
}

const agentRule = {
  name: [required()],
  address: [required()],
  longitude: [required()],
  latitude: [required()],
  businessTime: [required()],
}

function saveAgentsGroup() {
  const agentsGroupData = {
    name: editingAgentsGroup.name,
    markerImageUrl: editingAgentsGroup.markerImageUrl,
  }

  let req: Promise<AxiosResponse<AgentsGroup>>
  if (editingAgentsGroup.id) {
    req = request(`/agents-groups/${Math.abs(editingAgentsGroup.id)}`, {
      method: 'PUT',
      data: agentsGroupData,
    })
  } else {
    req = request('/agents-groups', {
      method: 'POST',
      data: agentsGroupData,
    })
  }

  req
    .then((res) => {
      if (res.status === 200 && res.data) {
        const localAgentsGroup = localizeAgentsGroup(res.data)
        if (editingAgentsGroup.id === 0) {
          agentsGroups.value.unshift(localAgentsGroup)
        } else {
          const index = agentsGroups.value.findIndex((group) => group.id === localAgentsGroup.id)
          agentsGroups.value[index] = localAgentsGroup
        }

        ElMessageBox.alert('保存成功', '提示', {
          confirmButtonText: '确定',
          type: 'success',
        })
        showAgentsGroupDialog.value = false
      }
    })
    .catch((err) => {
      console.log(err)
      ElMessageBox.alert('保存失败', '提示', {
        confirmButtonText: '确定',
        type: 'error',
      })
    })
}

function localizeAgentsGroup(agentsGroup: AgentsGroup): LocalAgentsGroup {
  return {
    ...agentsGroup,
    id: -agentsGroup.id,
    hasChildren: true,
    agents: [],
  }
}

function localizeAgent(agent: Agent, group: number): LocalAgent {
  const localAgent: LocalAgent = {
    ...agent,
    longitude: agent.longitude.toString(),
    latitude: agent.latitude.toString(),
    group,
    businessTime: [[], [], [], [], [], [], []],
  }

  for (const hour of agent.businessTime) {
    localAgent.businessTime[hour.weekday - 1].push(
      ref({
        id: hour.id,
        time: [new Date('1970-1-1 ' + hour.open), new Date('1970-1-1 ' + hour.close)],
      } as LocalBusinessHour)
    )
  }

  return localAgent
}

function loadAgents(row: LocalAgentsGroup, _: TreeNode, resolve: (data: LocalAgent[]) => void) {
  request(`/agents-groups/${-row.id}/agents`).then((res) => {
    const localizedAgents = res.data?.map((agent: Agent) => localizeAgent(agent, row.id)) ?? []
    row.agents = localizedAgents
    resolve(localizedAgents)
  })
}

const selectorMap = ref<InstanceType<typeof AvMap> | null>(null)

function updateSelectorMap() {
  if (editingAgent.longitude.length && editingAgent.latitude.length) {
    selectorMap.value?.map?.setCenter([parseFloat(editingAgent.longitude), parseFloat(editingAgent.latitude)])
  }
}

function makeRange(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, i) => i + start)
}

function addBusinessHours(weekday: number) {
  const hours = ref<LocalBusinessHour>({
    time: [new Date(0, 0, 0, 8, 30, 0), new Date(0, 0, 0, 17, 0, 0)],
  })
  editingAgent.businessTime[weekday].push(hours)
}

function deleteBusinessHours(weekday: number, index: number) {
  editingAgent.businessTime[weekday].splice(index, 1)
}

function fetchGeoByAddress() {
  getCollectionPointLocationByKeywords('bank', editingAgent.name, editingAgent.address)
    .then((geo) => {
      editingAgent.longitude = geo[0].toString()
      editingAgent.latitude = geo[1].toString()
    })
    .catch((err: Error) => {
      ElMessageBox.alert('高德 API 响应：' + err.message, '获取坐标失败', {
        confirmButtonText: '确定',
        type: 'error',
      })
    })
}

function saveAgent() {
  const agentData = {
    name: editingAgent.name,
    address: editingAgent.address,
    longitude: parseFloat(editingAgent.longitude),
    latitude: parseFloat(editingAgent.latitude),
    group: Math.abs(editingAgent.group),
    businessTime: [] as (Omit<BusinessHour, 'id'> & { id?: number })[],
    notes: null, // TODO
  }

  // 添加营业时间
  for (let weekday = 1; weekday <= editingAgent.businessTime.length; weekday++) {
    for (const localBusinessHour of editingAgent.businessTime[weekday - 1]) {
      const [start, end] = localBusinessHour.value.time
      agentData.businessTime.push({
        id: localBusinessHour.value.id,
        weekday,
        open: `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`,
        close: `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`,
      })
    }
  }

  let req: Promise<AxiosResponse<Agent>>
  if (editingAgent.id) {
    req = request(`/agents/${editingAgent.id}`, {
      method: 'PUT',
      data: agentData,
    })
  } else {
    req = request('/agents', {
      method: 'POST',
      data: agentData,
    })
  }

  req
    .then((res) => {
      if (res.status === 200 && res.data) {
        const localAgent = localizeAgent(res.data, editingAgent.group)
        const agentsGroup = agentsGroups.value.find((group) => group.id === editingAgent.group)
        if (editingAgentsGroup.id === 0 && agentsGroup) {
          agentsGroup.agents.unshift(localAgent)
        } else if (agentsGroup) {
          const index = agentsGroup.agents.findIndex((agent) => agent.id === localAgent.id)
          if (index !== -1) {
            agentsGroup.agents[index] = localAgent
          } else {
            agentsGroup.agents.unshift(localAgent)
          }
        }

        ElMessageBox.alert('保存成功', '提示', {
          confirmButtonText: '确定',
          type: 'success',
        })
        showAgentDialog.value = false
      }
    })
    .catch((err) => {
      console.log(err)
      ElMessageBox.alert('保存失败', '提示', {
        confirmButtonText: '确定',
        type: 'error',
      })
    })
}

function onMapClick(lnglat: [number, number]) {
  function fillAgent(poi: AMap.Poi) {
    editingAgent.name = poi.name
    editingAgent.address = poi.address
    editingAgent.longitude = poi.location.lng.toString()
    editingAgent.latitude = poi.location.lat.toString()
  }

  getCollectionPointByLocation(lnglat, 'bank')
    .then((poi) => {
      console.log(poi)
      if (editingAgent.name || editingAgent.address) {
        const filled = editingAgent.name ?? editingAgent.address
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
            fillAgent(poi)
          })
          .catch(() => {
            // Do nothing
          })
      } else {
        fillAgent(poi)
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
  <div class="agents-groups">
    <div class="operations">
      <ElButton :icon="Plus as any" size="large" type="primary" @click="addAgentsGroup">新增代收组</ElButton>
    </div>
    <ElTable
      :data="agentsGroups"
      :load="loadAgents"
      :tree-props="{ children: 'agents', hasChildren: 'hasChildren' }"
      lazy
      row-key="id"
      table-layout="fixed"
    >
      <ElTableColumn label="ID">
        <template #default="{ row }">{{ row.id >= 0 ? row.id : `G${-row.id}` }}</template>
      </ElTableColumn>
      <ElTableColumn label="名称" prop="name" />
      <ElTableColumn label="地址" prop="address" />
      <ElTableColumn label="操作">
        <template #default="scope">
          <ElButton v-if="!scope.row.address" type="primary" @click="addAgent(scope.row)">添加代收点</ElButton>
          <ElButton type="primary" @click="scope.row.address ? editAgent(scope.row) : editAgentsGroup(scope.row)"
            >编辑
          </ElButton>
          <ElButton type="danger" @click="scope.row.address ? removeAgent(scope.row) : removeAgentsGroup(scope.row)"
            >删除
          </ElButton>
        </template>
      </ElTableColumn>
    </ElTable>

    <ElDialog
      v-model="showAgentsGroupDialog"
      :close-on-click-modal="false"
      :title="dialogTitle"
      destroy-on-close
      draggable
    >
      <ElForm :model="editingAgentsGroup" :rules="agentsGroupRule">
        <ElFormItem label="名称" prop="name">
          <ElInput v-model="editingAgentsGroup.name" />
        </ElFormItem>
        <ElFormItem label="标记点图片" prop="markerImageUrl">
          <ElInput v-model="editingAgentsGroup.markerImageUrl" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="showAgentsGroupDialog = false">取消</ElButton>
        <ElButton type="primary" @click="saveAgentsGroup">确定</ElButton>
      </template>
    </ElDialog>

    <ElDialog v-model="showAgentDialog" :close-on-click-modal="false" :title="dialogTitle" destroy-on-close draggable>
      <ElScrollbar height="500px">
        <ElForm :model="editingAgent" :rules="agentRule" class="form-in-scrollbar">
          <ElFormItem label="名称" prop="name">
            <ElInput v-model="editingAgent.name" />
          </ElFormItem>
          <ElFormItem label="地址" prop="address">
            <ElInput v-model="editingAgent.address" />
          </ElFormItem>
          <ElRow :gutter="10">
            <ElCol :span="11">
              <ElFormItem label="经度" prop="longitude">
                <ElInput v-model="editingAgent.longitude" @change="updateSelectorMap" />
              </ElFormItem>
            </ElCol>
            <ElCol :span="11">
              <ElFormItem label="纬度" prop="latitude">
                <ElInput v-model="editingAgent.latitude" @change="updateSelectorMap" />
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
                editingAgent.longitude.length && editingAgent.latitude.length
                  ? [parseFloat(editingAgent.longitude), parseFloat(editingAgent.latitude)]
                  : DEFAULT_CENTER
              "
              :zoom="DEFAULT_ZOOM"
              class="selector-map"
              @click="onMapClick"
            >
              <AvMapMarker
                v-if="editingAgent.longitude.length && editingAgent.latitude.length"
                :geo="[parseFloat(editingAgent.longitude), parseFloat(editingAgent.latitude)]"
                :title="editingAgent.name"
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
                <span v-if="editingAgent.businessTime[index].length === 0">休息</span>
                <div v-for="(time, i) in editingAgent.businessTime[index]" :key="day + '-' + i" class="values">
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
        <ElButton @click="showAgentDialog = false">取消</ElButton>
        <ElButton type="primary" @click="saveAgent">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.agents-groups {
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
