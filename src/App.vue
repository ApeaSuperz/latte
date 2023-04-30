<script lang="ts" setup>
import {CollectionPoint, DEFAULT_CENTER, DEFAULT_ZOOM, Network, NETWORKS} from "./utils/a-map.ts";
import {useIdle} from "@vueuse/core";
import {Ref, ref, watch} from "vue";
import "vant/lib/icon/index.css";
import AvMap from "./components/AvMap.vue";

const aMap = ref<InstanceType<typeof AvMap> | null>(null)

const infoWindowPoint: Ref<CollectionPoint | null> = ref(null)

function onPointClick(network: Network, pointIndex: number) {
  aMap.value?.map?.setZoomAndCenter(20, network.points[pointIndex].geo)
  infoWindowPoint.value = network.points[pointIndex]
}

function reset() {
  infoWindowPoint.value = null
  aMap.value?.reset()
}

const {idle} = useIdle()
watch(idle, (isIdle) => {
  if (isIdle) {
    console.log('已闲置，重置地图')
    reset()
  }
})
</script>

<template>
  <AvMap ref="aMap"
         :center="DEFAULT_CENTER"
         :zoom="DEFAULT_ZOOM"
         class="major-map">
    <template v-for="network in NETWORKS">
      <AvMapMarker v-for="(point, index) in network.points"
                   :key="network.name + '-' + point.name"
                   :geo="point.geo"
                   :offset="[-26, -60]"
                   :title="point.name"
                   @click="onPointClick(network, index)">
        <img :src="network.image" alt="v" style="width: 50px; height: 68px"/>
      </AvMapMarker>
    </template>

    <AvMapInfoWindow :auto-move="false"
                     :geo="infoWindowPoint?.geo ?? [0, 0]"
                     :visible="!!infoWindowPoint"
                     @update:visible="infoWindowPoint = null">
      <div style="width: 200px; height: 100px; background-color: white; border-radius: 10px; padding: 10px">
        <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px">{{ infoWindowPoint?.name }}</div>
        <div style="font-size: 14px; color: #999999">{{ infoWindowPoint?.address }}</div>
      </div>
    </AvMapInfoWindow>

    <button class="reset-button" @click.stop="reset">
      <ElIcon>
        <IEpAim/>
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
    background-color: rgba(0, 0, 0, .3);
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
