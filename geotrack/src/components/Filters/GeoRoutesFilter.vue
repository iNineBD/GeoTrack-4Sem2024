<template>
  <v-card class="mx-auto" width="100%"
    style="box-shadow: none; border-radius: 0 0 20px 20px; margin-bottom: 0px; padding-bottom: 20px;" color="primary">
    <v-col style="padding: 20px 20px 0 20px">

      <!-- Users combobox -->
      <v-combobox v-model="selectedUser" label="Usuário" :items="users" item-title="name" item-value="deviceId"
        prepend-icon="mdi-filter-variant" clearable :multiple="false" color="secondary">
      </v-combobox>

      <!-- Date selection -->
      <v-date-input v-model="date" label="Selecione o período" multiple="range" color="secondary" :max="today"
        :locale="locale" :format="customDateFormat" placeholder="dd/MM/yyyy" :readonly="dateInputDisabled">
      </v-date-input>

      <!-- Quick date filters using chips -->
      <v-col style="padding: 0px; display: flex; justify-content: space-evenly">
        <v-chip style="margin: 0px 2px !important" size="small" v-for="(filter, index) in quickFilters"
          :key="filter.label" @click="setQuickFilter(filter.range, index)"
          :color="selectedQuickFilter === index ? 'primary' : 'primary_light'" :active="selectedQuickFilter === index"
          filter class="ma-2" variant="flat">
          {{ filter.label }}
        </v-chip>
      </v-col>
    </v-col>

    <v-card-actions class="d-flex justify-space-between" style="padding: 20px 20px 0 20px">
      <v-row class="d-flex" no-gutters style="justify-content: space-around">
        <v-col cols="7">
          <v-btn :loading="loading" :disabled="ButtonDisabled || loading" class="text-none" color="secondary"
            size="large" variant="flat" block rounded="xl" @click="handleConsult">
            Consultar
          </v-btn>
        </v-col>
        <v-col cols="4">
          <v-btn class="text-none" color="primary_light" size="large" variant="flat" block rounded="xl"
            @click="clearFields">
            Limpar
          </v-btn>
        </v-col>
      </v-row>
    </v-card-actions>
  </v-card>

  <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000" top>
    {{ snackbarMessage }}
  </v-snackbar>
</template>

<script>
import { eventBus } from '@/utils/EventBus';
import axios from 'axios';


export default {
  data: () => ({
    today: new Date().toISOString().substr(0, 10),
    loading: false,
    logo: "/src/assets/Logo.svg",
    date: null,
    users: [], // Lista de usuários
    selectedUser: null,
    locale: "pt",
    customDateFormat: "dd/MM/yyyy",
    quickFilters: [
      { label: "Hoje", range: [new Date(), new Date()] },
      {
        label: "Últimos 3 dias",
        range: [new Date(Date.now() - 3 * 864e5), new Date()],
      },
      {
        label: "Última semana",
        range: [new Date(Date.now() - 7 * 864e5), new Date()],
      },
      {
        label: "Último mês",
        range: [new Date(Date.now() - 30 * 864e5), new Date()],
      },
    ],
    selectedQuickFilter: null,
    dateInputDisabled: false,
    latitude: null,
    longitude: null,
    snackbar: false,
    snackbarColor: "success",
    snackbarMessage: "",
  }),

  mounted() {
    this.fetchUsers();
    eventBus.on('stopIsLoading', this.stopIsLoading);
    eventBus.on('reloadGeoArea', this.reloadGeoArea);
    eventBus.on("novoLogo", this.change)
    eventBus.on("clearFields", this.clearFields);
  },

  computed: {
    ButtonDisabled() {
      return !this.selectedUser || !this.date;
    },
  },

  methods: {
    showSnackbar(message, color = "success") {
      this.snackbarMessage = message; // Define a mensagem
      this.snackbarColor = color; // Define a cor
      this.snackbar = true; // Torna o snackbar visível
    },

    change(newLogo) {
      this.logo = newLogo;
    },

    stopIsLoading() {
      this.loading = false;
    },

    async fetchUsers() {
      try {
        const response = await axios.get(
          "http://localhost:8080/filters/users?page=0&qtdPage=1000"
        );
        const data = response.data;

        // Mapeando a resposta da API para o formato correto
        this.users = data.listUsers.map((user) => ({
          name: user.userName.toUpperCase(), // Nome do usuário
          deviceId: user.idDevice, // ID do dispositivo associado
          device: user.deviceName,
        }));

        console.log("Sucesso ao buscar usuários: ", this.users);
      } catch (error) {
        console.log("Erro ao buscar usuários: ", error);
      }
    },

    async handleConsult() {
      this.loading = true;

      if (!this.selectedUser || !this.date) {
        this.loading = false;
        return;
      }

      const qtddias = Math.round(
        (new Date(this.date[this.date.length - 1]) - new Date(this.date[0])) /
        (1000 * 60 * 60 * 24)
      );

      if (qtddias > 31) {
        this.showSnackbar("Mais que 31 dias selecionados", "error");
        this.loading = false;
        return;
      }

      const requestData = {
        deviceId: this.selectedUser.deviceId,
        startDate: new Date(this.date[0]).toLocaleDateString("en-CA"),
        finalDate: new Date(this.date[this.date.length - 1]).toLocaleDateString("en-CA"),
      };

      console.log("Dados enviados: ", requestData);

      const url = `http://localhost:8080/routes?deviceId=${requestData.deviceId}&&dateStart=${requestData.startDate}&dateEnd=${requestData.finalDate}`

      try {
        const response = await axios.get(url);
        if (response.status === 200) {
          const data = await response.data;

          console.log("Rotas recebidas:", data.routes);

          const dados = {
            routes: data.routes.map(route => ({
              startDate: route.date_start,
              endDate: route.date_end,
              userName: this.selectedUser.name,
              device: this.selectedUser.device,
              coordinates: route.coordinates.map(coord => ({
                latitude: coord.latitude,
                longitude: coord.longitude,
                date: coord.date
              })),
            })),
          };


          this.$emit("routesReceived", dados);

        } else if (response.status === 404) {
          this.showSnackbar("Dados não localizados para este usuário", "error");
          this.loading = false;
        }
      } catch (error) {
        this.showSnackbar("Dados não localizados para este usuário", "error");
        this.loading = false;
      }
    },

    clearFields() {
      this.date = null;
      this.selectedUser = null;
      this.devices = [];
      this.selectedQuickFilter = null;
      this.latitude = null;
      this.longitude = null;

      if (this.logo == "/src/assets/LogoWhite.svg") {
        this.$emit("initializeMapDark");
        eventBus.emit("clearStopPointsInformation");
      } else {
        this.$emit("initializeMap");
        eventBus.emit("clearStopPointsInformation");
      }
    },

    setQuickFilter(range, index) {
      if (this.selectedQuickFilter === index) {
        this.selectedQuickFilter = null;
        this.date = null;
        this.dateInputDisabled = false;
      } else {
        this.selectedQuickFilter = index;
        this.date = range.map((date) => date.toISOString().substr(0, 10));
        this.dateInputDisabled = true;
      }
    },
  },
};
</script>

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
  color: terceary;
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
