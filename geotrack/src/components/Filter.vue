<script>
export default {
  data: () => ({
    today: new Date().toISOString().substr(0, 10),
    loading: false,
    date: null,
  }),

  watch: {
    loading(val) {
      if (!val) return

      setTimeout(() => (this.loading = false), 2000)
    },
  },
}
</script>

<template>
  <v-card class="mx-auto" width="100%" height="100vh" title="Filtrar" style="box-shadow: none; border-radius: 0;">
    <v-container>
      <v-combobox label="Usuário" color="primary"
        :items="['California', 'Colorado', 'Florida', 'Georgia', 'Texas', 'Wyoming']"></v-combobox>

      <v-combobox label="Dispositivo" color="primary"
        :items="['California', 'Colorado', 'Florida', 'Georgia', 'Texas', 'Wyoming']"></v-combobox>

      <v-date-input v-model="date" label="Select range" multiple="range" color="primary" :max="today"></v-date-input>

    </v-container>

    <v-card-actions>
      <v-btn :disabled="loading" :loading="loading" class="text-none mb-4" color="primary" size="large" variant="flat"
        block rounded="lg" @click="loading = !loading">
        Consultar
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped></style>
