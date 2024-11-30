<template>
  <v-card class="mx-auto" width="100%" style="
      box-shadow: none;
      border-radius: 0 0 20px 20px;
      margin-bottom: 0px;
      height: 178px;
    " color="primary">
    <v-col style="padding: 5px 20px 0 20px">
      <v-row style="align-items: center; padding: 0px 0 7px 0; position: relative;">
        <!-- Texto "Pontos de Parada" centralizado -->
        <v-col cols="12" style="text-align: center;">
          <span style="font-size: 23px; font-weight: bold;" color="primary">
            Usuários na Sessão
          </span>
        </v-col>
        <!-- Botão do Painel de Informações no extremo direito -->
        <v-col cols="auto" style="position: absolute; right: 0px; top: 32%; transform: translateY(-40%);">
          <InfoPanel></InfoPanel>
        </v-col>
      </v-row>
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
    </v-col>

    <v-card-actions class="d-flex justify-space-between" style="padding: 4px 20px 0 20px">
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
import { eventBus } from "@/utils/EventBus";
import axios from "axios";
import InfoPanel from "../Info/InfoPanel.vue";

export default {
  data: () => ({
    today: new Date().toISOString().substr(0, 10),
    loading: false,
    logo: "/src/assets/Logo.svg",
    date: null,
    locale: "pt",
    customDateFormat: "dd/MM/yyyy",
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
    this.fetchGeoAreas();
    eventBus.on("clearSelectedGeoArea", this.clearSelectedGeoArea);
    eventBus.on("stopIsLoading", this.stopIsLoading);
    eventBus.on("reloadGeoArea", this.reloadGeoArea);
    eventBus.on("novoLogo", this.change);
    eventBus.on("clearFields", this.clearFields);
  },

  computed: {
    disableDrawButton() {
      return this.selectedGeoArea !== null;
    },

    ButtonDisabled() {
      const cachedDetails = localStorage.getItem("cachedCircleDetails");
      const cachedCircle = JSON.parse(cachedDetails);
      return (!this.selectedGeoArea && !cachedCircle);
    },
  },

  methods: {
    // Função para exibir o snackbar
    showSnackbar(message, color = "success") {
      this.snackbarMessage = message; // Define a mensagem
      this.snackbarColor = color; // Define a cor
      this.snackbar = true; // Torna o snackbar visível
    },
    // Função para limpar a área geográfica selecionada
    clearSelectedGeoArea() {
      this.selectedGeoArea = null;
    },
    // Função para alterar o logo
    change(newLogo) {
      this.logo = newLogo;
    },
    // Função para parar o loading
    stopIsLoading() {
      this.loading = false;
    },
    //
    async reloadGeoArea() {
      this.selectedGeoArea = null;
      this.fetchGeoAreas();
    },
    // Função para buscar as áreas geográficas
    async fetchGeoAreas() {
      try {
        const response = await axios.get("http://localhost:8080/zone");
        const data = response.data;
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
    // Função para lidar com a mudança de área geográfica
    async handleGeoAreaChange() {
      if (!this.selectedGeoArea) {
        console.log("Área geográfica não selecionada ou foi limpa");
        this.$emit("removeCircle");
        return; // Interrompe a execução da função
      }

      const cachedDetails = localStorage.getItem("cachedCircleDetails");
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

      const dataCircle = {
        id: selectedArea.id,
        name: selectedArea.name,
        latitude: selectedArea.latitude,
        longitude: selectedArea.longitude,
        radius: selectedArea.radius,
      };

      this.$emit("consult", dataCircle);
    },
    data() {
      return {
        loading: false,
      };
    },

    async handleConsult() {
      this.loading = true;
      const cachedDetails = localStorage.getItem("cachedCircleDetails");
      const cachedCircle = JSON.parse(cachedDetails);
      let selectedArea = null;

      if (this.selectedGeoArea) {
        selectedArea = this.geoAreas.find(
          (area) => area.id === this.selectedGeoArea.id
        );
        if (!selectedArea) {
          console.log("Área geográfica não encontrada");
          this.loading = false;
          return;
        }
      } else {
        selectedArea = cachedCircle;
        selectedArea.latitude = selectedArea.center.latitude;
        selectedArea.longitude = selectedArea.center.longitude;
      }
      // Ajustando os dados enviados
      const requestData = {
        sessionId: selectedArea.id,
      };

      console.log("Dados enviados: ", requestData);

      // Montando a URL conforme esperado
      const url = `http://localhost:8080/usersInSession?idSession=${requestData.sessionId}`;

      console.log("URL: ", url);

      try {
        // Realizando a requisição GET
        const response = await axios.get(url);
        if (response.status === 200) {
          const data = await response.data;
          console.log("Usuários recebidos:", data.users);
          this.loading = false;

          const users = {
            users: data.users
          }

          this.$emit("usersReceived", users);
        }
      } catch (error) {
        console.log("Erro ao buscar pontos de parada:", error);
        this.showSnackbar(error.response.data.message, "error");
        this.loading = false;
      }
    },

    // Limpa os campos do filtro
    clearFields() {
      this.date = null;
      this.devices = [];
      this.selectedQuickFilter = null;
      this.selectedGeoArea = null;
      this.latitude = null;
      this.longitude = null;
      this.radius = null;
      this.circleDrawn = false;

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
