<script>
export default {
  data: () => ({
    today: new Date().toISOString().substr(0, 10),
    loading: false,
    date: null,
    users: [],
  }),

  mounted() {
    this.fetchUsers();
  },

  methods: {
    async fetchUsers() {
      try {
        const response = await fetch("http://localhost:8080/filters/users?page=0&qtdPage=1000");
        const data = await response.json();
        this.users = data.listUsers.map(user => user.name.toUpperCase());
        console.log("Sucesso ao buscar usuários:", data);
      } catch (error) {
        console.log("Erro ao buscar usuários:", error);
      }
    },
  },

  watch: {
    loading(val) {
      if (!val) return;
      setTimeout(() => (this.loading = false), 1000);
    },
  },
};
</script>

<template>
  <v-card class="mx-auto" width="100%" height="100vh" title="Filtrar" style="box-shadow: none; border-radius: 0;">
    <v-container>
      <!-- Combobox preenchido com os dados dos usuários -->
      <v-combobox label="Usuário" color="primary" :items="users"></v-combobox>

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
