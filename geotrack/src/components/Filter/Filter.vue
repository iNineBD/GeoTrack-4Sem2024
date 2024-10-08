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
    isMobile: false,
    open: ['geoAreas'],
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

    drawCircle() {
      this.$emit('drawCircle'); // Emite o evento para habilitar o desenho do círculo
    },
    
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
      window.location.reload();
    },

    selectArea(areaType) {
      console.log('Tipo de área selecionado:', areaType);
    },
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
      <v-combobox :disabled="disabledTexts" label="Usuário" color="primary" v-model="selectedUserId" :items="users"
        item-value="id" item-title="name" :return-object="false"></v-combobox>

      <!-- Combobox de dispositivos -->
      <v-combobox :disabled="disabledTexts" label="Dispositivo" color="primary" v-model="selectedDevice"
        :items="devices" item-value="idDevice" item-title="code"></v-combobox>

      <!-- Card das áreas geográficas -->
      <v-card-actions class="d-flex justify-space-between">
        <v-row class="d-flex align-center no-gutters">
          <v-col cols="100%" style="padding: 0px;">
            <v-combobox :disabled="disabledTexts" label="Áreas geográficas" color="primary"></v-combobox>
          </v-col>

          <v-col cols="auto" style="padding: 0px 0px 20px 10px;">
            <div class="icon-container">
              <v-btn icon @click="drawCircle" class="no-shadow rounded">
                <v-icon>mdi-circle-outline</v-icon>
                <v-icon class="plus-icon">mdi-plus</v-icon>
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-card-actions>

      <!-- Seleção de data -->
      <v-date-input v-model="date" label="Selecionar período" multiple="range" color="primary" :max="today"
        :locale="locale" :format="customDateFormat" placeholder="dd/MM/yyyy"></v-date-input>
    </v-container>

    <!-- Botões Consultar e Limpar -->
    <v-card-actions class="d-flex justify-space-between">
      <v-row class="d-flex align-center no-gutters">
        <v-col cols="9" class="pr-2"> <!-- Adicionando padding à direita -->
          <v-btn :disabled="ButtonDisabled || loading" :loading="loading" class="text-none" color="primary" size="small"
            variant="flat" block rounded="lg" @click="handleConsult" style="height: 36px;">
            Consultar
          </v-btn>
        </v-col>
        <v-col cols="3">
          <v-btn :disabled="loading" :loading="loading" class="text-none" color="primary_light" size="small"
            variant="flat" block rounded="lg" @click="clearFields" style="height: 36px;">
            Limpar
          </v-btn>
        </v-col>
      </v-row>
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.icon-container {
  position: relative;
}

.plus-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 16px;
  color: black;
}

.title-text {
  font-weight: bold;
  font-size: 16px;
}

.no-shadow {
  box-shadow: none !important;
}

.rounded {
  border-radius: 0 !important;
}
</style>
