<script lang="ts">
import { defineComponent, onMounted, ref, watch } from 'vue'
import VectorSource from 'ol/source/Vector'
import VectorLayer from 'ol/layer/Vector'
import { GeoJSON } from 'ol/format'
import { Feature } from 'ol'
import { Point } from 'ol/geom'
import { Map } from 'ol'
import { Style, Icon } from 'ol/style'
import { transform } from 'ol/proj'
import InfoBubble from './InfoBubble.vue'
import { Geometry } from 'ol/geom'

// Definindo a interface para os dados GeoJSON
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
        coordinates: number[][] | number[][][]
      }
    }>
  }
}

export default defineComponent({
  name: 'MapMarkers',
  components: { InfoBubble },
  props: {
    map: {
      type: Object as () => Map | null,
      required: true
    },
    geoJsonData: {
      type: Object as () => GeoJsonData,
      required: true
    }
  },
  setup(props) {
    const vectorSource = ref(new VectorSource<Geometry>())
    const vectorLayer = ref<VectorLayer<VectorSource<Geometry>> | null>(null)
    const infoBubbleData = ref({
      user: '',
      device: '',
      latitude: 0,
      longitude: 0,
      position: [0, 0]
    })
    const isBubbleVisible = ref(false)

    // Cria a camada vetorial com os ícones
    const createVectorLayer = () => {
      return new VectorLayer({
        source: vectorSource.value,
        style: new Style({
          image: new Icon({
            src: new URL('@/assets/images/blueMarker.svg', import.meta.url).href,
            scale: 0.03
          })
        })
      })
    }

    // Adiciona marcadores ao mapa
    const addMarkers = () => {
      const geoJsonFormat = new GeoJSON()
      vectorSource.value.clear()

      const features = geoJsonFormat.readFeatures(props.geoJsonData.geojson, {
        featureProjection: 'EPSG:3857',
        dataProjection: 'EPSG:4326'
      }) as Feature<Geometry>[]

      vectorSource.value.addFeatures(features)
    }

    // Manipula o evento de movimento do ponteiro para mostrar a bolha de informações
    const handlePointerMove = (event: any) => {
      const feature = props.map?.forEachFeatureAtPixel(
        event.pixel,
        (f) => f as Feature<Geometry> | undefined
      )

      if (feature) {
        const geometry = feature.getGeometry() as Point
        const [longitude, latitude] = transform(geometry.getCoordinates(), 'EPSG:3857', 'EPSG:4326')

        // Atualiza as informações da bolha
        infoBubbleData.value = {
          user: props.geoJsonData.user,
          device: props.geoJsonData.device,
          latitude,
          longitude,
          position: event.pixel
        }
        isBubbleVisible.value = true
      } else {
        isBubbleVisible.value = false
      }
    }

    onMounted(() => {
      console.log('GeoJSON Data:', props.geoJsonData)
      console.log('Map:', props.map)
      if (props.map && props.geoJsonData.geojson.features.length > 0) {
        vectorLayer.value = createVectorLayer()
        props.map.addLayer(vectorLayer.value)
        props.map.on('pointermove', handlePointerMove)

        addMarkers()
      } else {
        console.error('Map or GeoJSON data is not properly initialized.')
      }
    })

    watch(() => props.geoJsonData, addMarkers, { deep: true })

    return { infoBubbleData, isBubbleVisible }
  }
})
</script>

<template>
  <InfoBubble
    v-if="isBubbleVisible"
    :user="infoBubbleData.user"
    :device="infoBubbleData.device"
    :latitude="infoBubbleData.latitude"
    :longitude="infoBubbleData.longitude"
    :position="infoBubbleData.position"
  />
</template>

<style scoped></style>
