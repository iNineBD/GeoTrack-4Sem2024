<script lang="ts">
import { defineComponent, ref, computed } from 'vue'

export default defineComponent({
  name: 'InfoBubble',
  props: {
    user: { type: String, required: true },
    device: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    position: { type: Array, required: true }
  },
  setup(props) {
    const visible = ref(true)

    const bubbleStyle = computed(() => {
      const [x, y] = props.position
      return {
        position: 'absolute' as const,
        left: `${x}px`,
        top: `${y}px`,
        zIndex: 10
      } as const
    })

    const formatCoordinate = (coordinate: number, decimalPlaces: number = 6) => {
      return coordinate.toFixed(decimalPlaces)
    }

    return { visible, bubbleStyle, formatCoordinate }
  }
})
</script>

<template>
  <div class="info-bubble" v-if="visible" :style="bubbleStyle">
    <h5 class="bubble-title">Detalhes</h5>
    <p><strong>Usuário:</strong> {{ user }}</p>
    <p><strong>Dispositivo:</strong> {{ device }}</p>
    <p><strong>Lat:</strong> {{ formatCoordinate(latitude) }}</p>
    <p><strong>Lng:</strong> {{ formatCoordinate(longitude) }}</p>
  </div>
</template>

<style scoped>
.info-bubble {
  background-color: #ffffff;
  padding: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition:
    opacity 0.4s ease,
    transform 0.3s ease;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  width: 160px;
  transform: translateY(0);
}

.info-bubble:hover {
  transform: translateY(-2px);
}

.bubble-title {
  margin: 0 0 10px 0;
  font-size: 1em;
  font-weight: 600;
  color: #003366;
  border-bottom: 1px solid rgba(0, 51, 102, 0.2);
  padding-bottom: 6px;
}

.info-bubble p {
  margin: 4px 0;
  font-size: 0.85em;
  color: #333333;
}

.info-bubble strong {
  font-weight: 600;
  color: #003366;
}

/* Mobile responsiveness */
@media (max-width: 600px) {
  .info-bubble {
    width: 140px;
    font-size: 0.9em;
  }
}
</style>
