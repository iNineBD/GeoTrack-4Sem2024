<script>
export default {
  data: () => ({
    today: new Date().toISOString().substr(0, 10),
    loading: false,
    date: null,
    users: [],
    selectedUserId: null,
    devices: [],
    selectedDevice: null,
  }),

  mounted() {
    this.fetchUsers();
  },

  methods: {
    async fetchUsers() {
      try {
        const response = await fetch("http://localhost:8080/filters/users?page=0&qtdPage=1000");
        const data = await response.json();
        this.users = data.listUsers.map(user => ({
          id: user.id,
          name: user.name.toUpperCase()
        }));
        console.log("Sucesso ao buscar usuários:", data);
      } catch (error) {
        console.log("Erro ao buscar usuários:", error);
      }
    },

    async fetchDevices() {
      if (!this.selectedUserId) return;
      try {
        const response = await fetch(`http://localhost:8080/filters/devices?idUser=${this.selectedUserId}&page=0`);
        const data = await response.json();
        this.devices = data.listDevices.map(device => device.code);
        console.log("Sucesso ao buscar dispositivos:", data);
      } catch (error) {
        console.log("Erro ao buscar dispositivos:", error);
      }
    }
  },

  watch: {
    selectedUserId() {
      this.devices = [];
      this.selectedDevice = null
      this.fetchDevices();
    },
    loading(val) {
      if (!val) return;
      setTimeout(() => (this.loading = false), 1000);
    }
  },
};
</script>

<template>
  <v-card class="mx-auto" width="100%" height="100vh" title="Filtrar" style="box-shadow: none; border-radius: 0;">
    <v-container>
      <!-- Combobox de usuários -->
      <v-combobox label="Usuário" color="primary" v-model="selectedUserId" :items="users" item-value="id" item-title="name" :return-object="false"></v-combobox>

      <!-- Combobox de dispositivos -->
      <v-combobox label="Dispositivo" color="primary" v-model="selectedDevice" :items="devices"></v-combobox>

      <!-- Seleção de data -->
      <v-date-input v-model="date" label="Selecionar intervalo" multiple="range" color="primary" :max="today"></v-date-input>
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
