<script lang="ts">
import MapView from './components/MapView.vue'
import MapMarkers from './components/MapMarkers.vue'
import SideMenu from './components/SideMenu.vue'
import { onMounted, ref } from 'vue'
import axios from 'axios'

interface GeoJsonData {
  user: string
  device: string
  geojson: {
    type: string
    features: Array<{
      type: string
      properties: Record<string, any>
      geometry: {
        type: string
        coordinates: number[][]
      }
    }>
  }
}

export default {
  name: 'App',
  components: {
    MapView,
    MapMarkers,
    SideMenu
  },
  setup() {
    const geoJsonData = ref<GeoJsonData | null>(null)

    const fetchGeoJsonData = async () => {
      try {
        const requestData = {
          user: 5432,
          device: 9,
          dataInicio: '2024-01-30T03:59:30.000Z',
          dataFim: '2024-08-08T12:14:22.000Z'
        }

        const response = await axios.post('http://localhost:8080/stop-point', requestData)

        geoJsonData.value = {
          user: response.data.user,
          device: response.data.device,
          geojson: response.data.geoJsonDTO
        }
      } catch (error) {
        console.error('Error fetching points from the backend:', error)
      }
    }

    onMounted(() => {
      fetchGeoJsonData()
    })

    return {
      geoJsonData,
      fetchGeoJsonData
    }
  }
}
</script>

<template>
  <div id="app">
    <MapView>
      <template #default="{ map }">
        <MapMarkers v-if="map && geoJsonData" :map="map" :geoJsonData="geoJsonData" />
      </template>
    </MapView>
    <SideMenu />
  </div>
</template>

<style scoped>
#app {
  margin: 0;
  padding: 0;
  height: 50vh;
  width: 50vw;
}

.content {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
  color: white;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.2);
  padding: 10px 20px;
  font-size: 1rem;
  overflow: hidden;
}
</style>
