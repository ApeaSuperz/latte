<script lang="ts" setup>
import { DEFAULT_CENTER, DEFAULT_ZOOM } from '@/utils/a-map'
import { useIdle } from '@vueuse/core'
import { Ref, ref, watch } from 'vue'
import AvMap from '@/components/AvMap.vue'
import { Agent, AgentsGroupWithAgents, BusinessHall, CollectionPoints } from '@/types/api'
import request from '@/utils/request'
import { AxiosResponse } from 'axios'

const businessHalls = ref<BusinessHall[]>([])
const agentsGroups = ref<AgentsGroupWithAgents[]>([])
request('/collection-points').then((res: AxiosResponse<CollectionPoints>) => {
  if (res.status === 200) {
    businessHalls.value = res.data.businessHalls
    agentsGroups.value = res.data.agentsGroups
  }
})

const aMap = ref<InstanceType<typeof AvMap> | null>(null)

const infoWindowPoint: Ref<BusinessHall | Agent | null> = ref(null)

function onPointClick(point: BusinessHall | Agent) {
  aMap.value?.map?.setZoomAndCenter(18, [point.longitude, point.latitude])
  infoWindowPoint.value = point
}

function isBusinessHall(point?: BusinessHall | Agent | null): point is BusinessHall {
  if (!point) return false
  return (point as BusinessHall).landmark !== undefined
}

function isAgent(point?: BusinessHall | Agent | null): point is Agent {
  if (!point) return false
  return (point as BusinessHall).landmark === undefined
}

function reset() {
  infoWindowPoint.value = null
  aMap.value?.reset()
}

const { idle } = useIdle()
watch(idle, (isIdle) => {
  if (isIdle) {
    console.log('已闲置，重置地图')
    reset()
  }
})
</script>

<template>
  <AvMap ref="aMap" :center="DEFAULT_CENTER" :zoom="DEFAULT_ZOOM" class="major-map">
    <AvMapMarker
      v-for="hall in businessHalls"
      :key="hall.name"
      :geo="[hall.longitude, hall.latitude]"
      :title="hall.name"
      @click="onPointClick(hall)"
    />
    <template v-for="agentsGroup in agentsGroups">
      <AvMapMarker
        v-for="agent in agentsGroup.agents"
        :key="agentsGroup.name + '-' + agent.name"
        :geo="[agent.longitude, agent.latitude]"
        :title="agent.name"
        @click="onPointClick(agent)"
      />
    </template>

    <AvMapInfoWindow
      :auto-move="false"
      :geo="[infoWindowPoint?.longitude ?? 0, infoWindowPoint?.latitude ?? 0]"
      :visible="!!infoWindowPoint"
      @update:visible="infoWindowPoint = null"
    >
      <div style="width: 200px; height: 100px; background-color: white; border-radius: 10px; padding: 10px">
        <div class="info-window-title">
          {{ infoWindowPoint?.name }}
          <ElTag v-if="isBusinessHall(infoWindowPoint)" type="success">营业厅</ElTag>
          <ElTag v-else-if="isAgent(infoWindowPoint)">代理点</ElTag>
        </div>
        <div style="font-size: 14px; color: #999999">{{ infoWindowPoint?.address }}</div>
      </div>
    </AvMapInfoWindow>

    <button class="reset-button" @click.stop="reset">
      <ElIcon>
        <IEpAim />
      </ElIcon>
    </button>
  </AvMap>
</template>

<style scoped>
.major-map {
  position: relative;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  padding: 0;
  margin: 0;
}

.reset-button {
  position: absolute;
  right: 40px;
  bottom: 100px;
  font-size: 24px;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
}

.info-window-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #000;
}
</style>
