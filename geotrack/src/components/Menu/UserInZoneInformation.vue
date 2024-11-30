<template>
  <v-card class="user-zone-card" width="400px" height="300px" rounded="xl" elevation="4" color="primary">
    <template v-if="userZoneInfo && userZoneInfo.users && userZoneInfo.users.length > 0">
      <v-list class="scrollable-container bg-primary">
        <v-list-item>
          <v-sheet class="pa-2 mb-2" color="primary_light" elevation="0" rounded>
            <v-row align="center" justify="space-between" style="padding: 5px 12px;">
              <span style="font-weight: bold; font-size: 16px;">
                {{ "USUÁRIOS" }}
              </span>
            </v-row>
          </v-sheet>
          <v-list style="padding: 0;" class="bg-primary">
            <v-list-item v-for="(user, userIndex) in userZoneInfo.users" :key="userIndex" style="padding: 0;" color="primary">
              <v-row align="start" no-gutters class="px-2 py-1">
                <v-col cols="1">
                  <v-icon color="secondary" class="mr-1" style="margin-top: -5px;">mdi-account</v-icon>
                </v-col>
                <v-col cols="11">
                  <v-list-item-title>
                    {{ user.toUpperCase() }}
                  </v-list-item-title>
                </v-col>
              </v-row>
              <v-divider v-if="userIndex < userZoneInfo.users.length - 1"></v-divider>
            </v-list-item>
          </v-list>
        </v-list-item>
      </v-list>
    </template>
    <template v-else>
      <v-row justify="center" align="center">
        <v-icon color="grey">mdi-alert</v-icon>
        <span>Nenhuma zona encontrada.</span>
      </v-row>
    </template>
  </v-card>
</template>

<script setup lang="ts">
import { defineProps, watch } from 'vue';

const props = defineProps<{
  userZoneInfo: {
    users: Array<{
      names: string;
    }> | undefined;
  };
}>();

watch(
  () => props.userZoneInfo,
  (newUserZoneInfo) => {
    console.log(newUserZoneInfo?.users);
  },
  { immediate: true }
);
</script>

<style scoped>
.user-zone-card {
  box-shadow: none;
  border-radius: 0;
  position: fixed;
  margin-top: 15px;
}

.scrollable-container {
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
}

.scrollable-container::-webkit-scrollbar {
  width: 10px;
}

.scrollable-container::-webkit-scrollbar-track {
  background: #f0f0f5;
  border-radius: 5px;
}

.scrollable-container::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #c7c9ff, #7a7de9);
  border-radius: 10px;
}

.scrollable-container::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #6b6fe1, #4f51d3);
}

.v-list-item-title {
  word-wrap: break-word;
  white-space: normal;
}
</style>
