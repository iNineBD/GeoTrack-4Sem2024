<template>
  <v-card class="mx-auto" width="100%"
    style="box-shadow: none; border-radius: 0 0 20px 20px; margin-bottom: 0px; height: 350px;" color="primary">
    <v-col style="padding: 20px 20px 0 20px">
      <!-- Card das áreas geográficas -->
      <v-card-actions class="d-flex justify-space-between">
        <v-row class="d-flex align-center no-gutters">
          <v-col cols="100%" style="padding: 0px">
            <!-- Combobox de áreas geográficas -->
            <v-combobox :disabled="disabledTexts" label="Áreas geográficas" color="secondary" v-model="selectedGeoArea"
              :items="geoAreas" item-value="id" item-title="name" clearable :multiple="false"
              @update:model-value="handleGeoAreaChange" prepend-icon="mdi-map-search">
            </v-combobox>
          </v-col>

          <v-col cols="auto" style="padding: 0px 0px 20px 10px">
            <div class="icon-container">
              <v-btn icon @click="drawCircle" class="no-shadow rounded" :disabled="disableDrawButton">
                <v-icon>mdi-circle-outline</v-icon>
                <v-icon class="plus-icon">mdi-plus</v-icon>
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-card-actions>

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

  <!-- Loading progress circular -->
  <v-col v-if="loadingPage" id="loadingStopPoints" class="d-flex justify-center mt-4">
    <v-progress-circular color="primary" indeterminate>
    </v-progress-circular>
  </v-col>

  <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000" top>
    {{ snackbarMessage }}
  </v-snackbar>
</template>

<script>
import { eventBus } from '@/utils/EventBus';


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
    geoAreas: [],
    selectedGeoArea: null,
    latitude: null,
    longitude: null,
    radius: null,
    circleDrawn: false,
    snackbar: false,
    snackbarColor: "success",
    snackbarMessage: "",
  }),

  mounted() {
    this.fetchUsers();
    this.fetchGeoAreas();
    eventBus.on('clearSelectedGeoArea', this.clearSelectedGeoArea);
    eventBus.on('stopIsLoading', this.stopIsLoading);
    eventBus.on('reloadGeoArea', this.reloadGeoArea);
    eventBus.on("novoLogo", this.change)
    eventBus.on("clearFields", this.clearFields);
  },

  computed: {
    disableDrawButton() {
      return this.selectedGeoArea !== null;
    },

    ButtonDisabled() {
      const cachedDetails = localStorage.getItem("cachedCircleDetails");
      const cachedCircle = JSON.parse(cachedDetails);


      console.log('teste: ', cachedCircle)

      return !this.selectedUser || !this.date || (!this.selectedGeoArea && !cachedCircle);
    },
  },

  methods: {
    showSnackbar(message, color = "success") {
      this.snackbarMessage = message; // Define a mensagem
      this.snackbarColor = color; // Define a cor
      this.snackbar = true; // Torna o snackbar visível
    },

    clearSelectedGeoArea() {
      this.selectedGeoArea = null;
    },
    change(newLogo) {
      this.logo = newLogo;
    },

    stopIsLoading() {
      this.loading = false;
    },

    async reloadGeoArea() {
      this.selectedGeoArea = null;
      this.fetchGeoAreas();
    },

    async fetchUsers() {
      try {
        const response = await fetch(
          "http://localhost:8080/filters/users?page=0&qtdPage=1000"
        );
        const data = await response.json();

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

    async fetchGeoAreas() {
      try {
        const response = await fetch("http://localhost:8080/zone");
        const data = await response.json();
        this.geoAreas = data.map((area) => ({
          id: area.id,
          name: area.name,
          latitude: area.center.latitude,
          longitude: area.center.longitude,
          radius: area.radius,
        }));
        console.log("Áreas geográficas carregadas:", data);
      } catch (error) {
        console.log("Erro ao buscar áreas geográficas:", error);
      }
    },

    async handleGeoAreaChange() {
      if (!this.selectedGeoArea) {
        console.log("Área geográfica não selecionada ou foi limpa");
        this.$emit("removeCircle");
        return; // Interrompe a execução da função
      }

      const cachedDetails = localStorage.getItem('cachedCircleDetails');
      const cachedCircle = JSON.parse(cachedDetails);

      const selectedArea = this.geoAreas.find(
        (area) => area.id === this.selectedGeoArea.id
      );

      if (!selectedArea) {
        console.log("Área geográfica não encontrada");
        return;
      }

      const requestData = {
        latitude: selectedArea.latitude,
        longitude: selectedArea.longitude,
        radius: selectedArea.radius,
      };

      const dataCircleAndUser = {
        id: selectedArea.id,
        name: selectedArea.name,
        latitude: selectedArea.latitude,
        longitude: selectedArea.longitude,
        radius: selectedArea.radius,
      };

      this.$emit("consult", dataCircleAndUser);
    },

    async handleConsult() {
      this.loading = true;
      const cachedDetails = localStorage.getItem('cachedCircleDetails');
      const cachedCircle = JSON.parse(cachedDetails);
      let selectedArea = null;

      if (
        !this.selectedUser ||
        !this.date ||
        (!this.selectedGeoArea && !cachedCircle)
      ) {
        console.log("Dados incompletos para a consulta");
        this.loading = false;
        return;
      }

      if (this.selectedGeoArea) {

        selectedArea = this.geoAreas.find(area => area.id === this.selectedGeoArea.id);
        if (!selectedArea) {
          console.log("Área geográfica não encontrada");
          this.loading = false;
          return;
        }
      } else {
        selectedArea = cachedCircle;
        selectedArea.latitude = selectedArea.center.latitude;
        selectedArea.longitude = selectedArea.center.longitude;
        console.log('passooou ', selectedArea)
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
        finalDate: new Date(this.date[this.date.length - 1]).toLocaleDateString(
          "en-CA"
        ),
        latitude: selectedArea.latitude,
        longitude: selectedArea.longitude,
        radius: selectedArea.radius,
      };

      console.log("Dados enviados: ", requestData);

      const url = `http://localhost:8080/stoppointsession/pointsInSession?deviceId=${requestData.deviceId}&startDate=${requestData.startDate}&endDate=${requestData.finalDate}&latitude=${requestData.latitude}&longitude=${requestData.longitude}&radius=${requestData.radius}`;

      console.log("URL: ", url);

      try {
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();

          console.log("Pontos de parada recebidos:", data.stopPoints);

          const dataCircleAndUser = {
            id: selectedArea.id,
            userName: this.selectedUser.name,
            name: selectedArea.name,
            latitude: selectedArea.latitude,
            longitude: selectedArea.longitude,
            radius: selectedArea.radius,
          };

          const coord = data.stopPoints;

          const dados = {
            userName: this.selectedUser.name,
            device: this.selectedUser.device,
            coords: coord, // Definindo corretamente um array para coordenadas
          };

          console.log("DADOS DA CONSULTA AQUI!!!", dados)

          // Dados enviados para plotar o círculo escolhido
          this.$emit("consult", dataCircleAndUser);
          this.$emit("stopPointsReceived", dados);
        } else if (response.status === 404) {
          const errorData = await response.json();

          console.log("Erro 404: ", errorData.message);

          this.showSnackbar("Dados não localizados para este usuário", "error");
          this.$emit("noPointsFound", errorData.message);
          this.loading = false;
        }
      } catch (error) {
        console.log("Erro ao buscar pontos de parada:", error);
      }
    },

    clearFields() {
      this.date = null;
      this.selectedUser = null;
      this.devices = [];
      this.selectedQuickFilter = null;
      this.selectedGeoArea = null;
      this.latitude = null;
      this.longitude = null;
      this.radius = null;
      this.circleDrawn = false;

      console.log("logo novo: ", this.logo)

      if (this.logo == "/src/assets/LogoWhite.svg") {
        this.$emit("initializeMapDark");
        eventBus.emit("clearStopPointsInformation");
      } else {
        this.$emit("initializeMap");
        eventBus.emit("clearStopPointsInformation");
      }
    },

    drawCircle() {
      this.$emit("drawCircle");
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
