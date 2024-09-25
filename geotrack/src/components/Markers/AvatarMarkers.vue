<template>
  <div v-for="(avatar, index) in avatars" :key="index" :id="'avatar-' + index">
    <v-tooltip :open-on-hover="true" :text="`${avatar.fullName} (${avatar.coords})`">
      <template v-slot:activator="{ props }">
        <v-avatar v-bind="props" :color="avatar.color" style="width: 25px; height: 25px;">
          <span class="text-subtitle-2">{{ avatar.initials }}</span>
        </v-avatar>
      </template>
    </v-tooltip>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

// Definindo o tipo para o Avatar
interface Avatar {
  initials: string;
  fullName: string;
  color: string;
  coords: [number, number]; // Coordenadas de longitude e latitude
}

export default defineComponent({
  name: 'AvatarMarkers',
  props: {
    avatars: {
      type: Array as () => Avatar[], // Definindo o tipo do prop avatars
      required: true
    }
  }
});
</script>
