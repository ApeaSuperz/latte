<script lang="ts" setup>
  import { NETWORKS, useAMap } from './utils/map.ts'
  import { watch } from 'vue'

  const { map } = useAMap('map-container', {
    viewMode: '3D',
    center: [119.41565, 32.393669],
    zoom: 11.5,
  })
  watch(map, (map) => {
    for (const network of NETWORKS) {
      for (const point of network.points) {
        map?.add(new AMap.Marker({
          position: new AMap.LngLat.from(point.geo),
          content: network.marker,
          offset: new AMap.Pixel(-13, -30),
        }))
      }
    }
  })
</script>

<template>
  <div id="map-container"></div>
</template>

<style scoped>
    #map-container {
        width: 100vw;
        height: 100vh;
    }
</style>
