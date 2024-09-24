<!-- AvatarMarkers.vue -->
<template>
  <div
    v-for="(avatar, index) in avatars"
    :key="index"
    :id="'avatar-' + index"
    class="avatar-marker"
  >
    <v-tooltip
      :open-on-hover="true"
      :text="`${avatar.fullName} (${avatar.coords})`"
    >
      <template v-slot:activator="{ props }">
        <v-avatar v-bind="props" :color="avatar.color">
          <span class="text-h5">{{ avatar.initials }}</span>
        </v-avatar>
      </template>
    </v-tooltip>
  </div>
</template>
<script lang="ts">
import { defineComponent, onMounted, ref, watch, PropType } from 'vue';
import { Overlay } from 'ol';
import { fromLonLat } from 'ol/proj';

interface Avatar {
  fullName: string;
  coords: [number, number];
  color: string;
  initials: string;
}

export default defineComponent({
  name: 'AvatarMarkers',
  props: {
    avatars: {
      type: Array as PropType<Avatar[]>,
      required: true,
    },
    map: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const overlays = ref([] as Overlay[]);

    onMounted(() => {
      // Adiciona marcadores no mapa
      props.avatars.forEach((avatar, index) => {
        const avatarMarker = new Overlay({
          element: document.getElementById('avatar-' + index)!, // Elemento HTML do avatar
          position: fromLonLat(avatar.coords), // Coordenadas do marcador
          positioning: 'center-center', // Posicionamento centralizado
        });
        overlays.value.push(avatarMarker);
        props.map.addOverlay(avatarMarker); // Adiciona o marcador ao mapa
      });
    });

    // Remove os overlays ao desmontar o componente
    watch(
      () => props.avatars,
      (newAvatars, oldAvatars) => {
        if (newAvatars !== oldAvatars) {
          overlays.value.forEach((overlay) => {
            props.map.removeOverlay(overlay);
          });
        }
      },
      { deep: true }
    );

    return {};
  },
});
</script>


<style scoped>
.avatar-marker {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
}
</style>
