<script>
import { ref, onMounted } from 'vue';

export default {
  data: () => ({
    today: new Date().toISOString().substr(0, 10),
    loading: false,
    disabledTexts: false,
    date: null,
    users: [],
    selectedUserId: null,
    selectedUserName: null,
    devices: [],
    selectedDevice: null,
    locale: 'pt',
    customDateFormat: 'dd/MM/yyyy',
    isMobile: false, // Adicionando a verificação se é mobile
  }),

  mounted() {
    this.fetchUsers();
    this.checkMobile(); // Verifica se é mobile ao montar
    window.addEventListener('resize', this.checkMobile); // Adiciona o listener de resize
  },

  computed: {
    ButtonDisabled() {
      return !this.selectedUserId || !this.selectedDevice || !this.date;
    },
  },

  methods: {
    checkMobile() {
      this.isMobile = window.innerWidth <= 900; // Define o limite para dispositivos móveis
    },

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
        this.devices = data.listDevices.map(device => ({
          code: device.code,
          idDevice: device.idDevice
        }));
        console.log("Sucesso ao buscar dispositivos:", data);
      } catch (error) {
        console.log("Erro ao buscar dispositivos:", error);
      }
    },

    async handleConsult() {
      if (!this.selectedUserId || !this.selectedDevice || !this.date) return;

      const selectedUser = this.users.find(user => user.id === this.selectedUserId);
      const selectedDevice = this.devices.find(device => device.idDevice === this.selectedDevice);
      const startDate = new Date(this.date[0]).toLocaleDateString('en-CA').toString();
      const finalDate = new Date(this.date[this.date.length - 1]).toLocaleDateString('en-CA').toString();

      const requestData = {
        user: this.selectedUserId,
        userName: selectedUser.name,
        device: this.selectedDevice.idDevice,
        userDevice: this.selectedDevice.code,
        startDate: startDate,
        finalDate: finalDate,
      };

      this.disabledTexts = true;
      console.log("Dados da requisição enviados:", requestData);
      this.$emit('consult', requestData);
    },

    clearFields() {
      this.selectedUserId = null;
      this.selectedDevice = null;
      this.date = null;
      this.devices = [];
      this.disabledTexts = false;
    }
  },

  watch: {
    selectedUserId() {
      this.devices = [];
      this.selectedDevice = null;
      this.fetchDevices();
    },
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
      <!-- Combobox de usuários -->
      <v-combobox :disabled="disabledTexts" label="Usuário" color="primary" v-model="selectedUserId" :items="users" item-value="id"
        item-title="name" :return-object="false"></v-combobox>

      <!-- Combobox de dispositivos -->
      <v-combobox :disabled="disabledTexts" label="Dispositivo" color="primary" v-model="selectedDevice" :items="devices" item-value="idDevice"
        item-title="code"></v-combobox>

      <!-- Seleção de data -->
      <v-date-input v-model="date" label="Selecionar período" multiple="range" color="primary" :max="today" :locale="locale"
        :format="customDateFormat" placeholder="dd/MM/yyyy"></v-date-input>
    </v-container>

    <v-card-actions>
      <v-btn :disabled="ButtonDisabled || loading" :loading="loading" class="text-none mb-4" color="primary" size="large" variant="flat"
        block rounded="lg" @click="handleConsult">
        Consultar
      </v-btn>
    </v-card-actions>
    <v-card-actions>
      <v-btn :disabled="loading" :loading="loading" class="text-none mb-4" color="primary_light" size="large" variant="flat"
        block rounded="lg" @click="clearFields">
        Limpar
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped></style>
