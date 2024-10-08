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
    isMobile: false, // Adding the check if it's mobile
    quickFilters: [
      { label: "Hoje", range: [new Date(), new Date()] }, // "Today"
      { label: "Últimos 3 dias", range: [new Date(Date.now() - 3 * 864e5), new Date()] }, // "Last 3 days"
      { label: "Última semana", range: [new Date(Date.now() - 7 * 864e5), new Date()] }, // "Last week"
      { label: "Último mês", range: [new Date(Date.now() - 30 * 864e5), new Date()] } // "Last month"
    ],
    selectedQuickFilter: null,
    dateInputDisabled: false,
  }),

  mounted() {
    this.fetchUsers();
    this.checkMobile(); // Check if it's mobile when mounted
    window.addEventListener('resize', this.checkMobile); // Add the resize listener
  },

  computed: {
    ButtonDisabled() {
      return !this.selectedUserId || !this.selectedDevice || !this.date;
    },
  },

  methods: {
    checkMobile() {
      this.isMobile = window.innerWidth <= 900; // Set the limit for mobile devices
    },

    async fetchUsers() {
      try {
        const response = await fetch("http://localhost:8080/filters/users?page=0&qtdPage=1000");
        const data = await response.json();
        this.users = data.listUsers.map(user => ({
          id: user.id,
          name: user.name.toUpperCase()
        }));
        console.log("Successfully fetched users:", data);
      } catch (error) {
        console.log("Error fetching users:", error);
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
        console.log("Successfully fetched devices:", data);
      } catch (error) {
        console.log("Error fetching devices:", error);
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
      console.log("Request data sent:", requestData);
      this.$emit('consult', requestData);
    },

    clearFields() {
      window.location.reload();
    },

    setQuickFilter(range, index) {
      // Toggle button selection
      if (this.selectedQuickFilter === index) {
        this.selectedQuickFilter = null; // Unselect if the same button is clicked again
        this.date = null; // Clear date when unselecting
        this.dateInputDisabled = false; 
      } else {
        this.selectedQuickFilter = index; // Mark the clicked button
        this.date = range.map(date => date.toISOString().substr(0, 10)); // Set the new date
        this.dateInputDisabled = true;
      }
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
      <!-- Users combobox -->
      <v-combobox :disabled="disabledTexts" label="User" color="primary" v-model="selectedUserId" :items="users"
        item-value="id" item-title="name" :return-object="false"></v-combobox>

      <!-- Devices combobox -->
      <v-combobox :disabled="disabledTexts" label="Device" color="primary" v-model="selectedDevice"
        :items="devices" item-value="idDevice" item-title="code"></v-combobox>

      <!-- Quick date filters -->
      <div class="d-flex mb-2" >
        <v-btn
          v-for="(filter, index) in quickFilters"
          :key="filter.label"
          @click="setQuickFilter(filter.range, index)"
          :color="selectedQuickFilter === index ? 'primary' : 'primary_light'"
          style="font-size: 10px; padding: 2px 4px; height: 30px; margin: 8px;"
        >
          {{ filter.label }}
        </v-btn>
      </div>

      <!-- Date selection -->
      <v-date-input v-model="date" label="Select period" multiple="range" color="primary" :max="today"
        :locale="locale" :format="customDateFormat" placeholder="dd/MM/yyyy" :disabled="dateInputDisabled"></v-date-input>
    </v-container>

    <v-card-actions class="d-flex justify-space-between">
      <v-row class="d-flex" no-gutters>
        <v-col cols="8">
          <v-btn :disabled="ButtonDisabled || loading" :loading="loading" class="text-none" color="primary" size="large"
            variant="flat" block rounded="lg" @click="handleConsult">
            Consult
          </v-btn>
        </v-col>
        <v-col cols="4">
          <v-btn :disabled="loading" :loading="loading" class="text-none" color="primary_light" size="large"
            variant="flat" block rounded="lg" @click="clearFields">
            Clear
          </v-btn>
        </v-col>
      </v-row>
    </v-card-actions>

  </v-card>
</template>

<style scoped></style>
