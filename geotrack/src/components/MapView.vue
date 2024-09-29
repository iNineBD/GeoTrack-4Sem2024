<template>
  <div id="map" class="map"></div>
  <AvatarMarkers :avatars="avatars" />
  <div v-if="errorMessage" class="error-notification">
    <span>{{ errorMessage }}</span>
    <button class="close-button" @click="closeNotification">X</button>
  </div>
</template>

<script lang="ts">
import { onMounted, ref, watch } from "vue";
import axios from "axios";
import "ol/ol.css";
import { Map, View, Overlay } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";
import { defaults as defaultControls, Zoom } from "ol/control";
import AvatarMarkers from "../components/Markers/AvatarMarkers.vue";
import { boundingExtent } from "ol/extent";
import { useRoute } from "vue-router";

// Definindo o tipo para o Avatar
interface Avatar {
  initials: string;
  fullName: string;
  color: string;
  coords: [number, number]; // Coordenadas de longitude e latitude
}

// Definindo o tipo da resposta GeoJSON
interface GeoJsonFeature {
  geometry: {
    coordinates: [number, number];
  };
}

interface GeoJsonResponse {
  user: string;
  device: number;
  geojson: {
    features: GeoJsonFeature[];
  };
}

export default {
  name: "MapView",
  components: { AvatarMarkers }, // Importando AvatarMarkers
  setup() {
    const route = useRoute();
    const avatars = ref<Avatar[]>([]);
    const errorMessage = ref<string | null>(null);
    const map = ref<Map | null>(null);
    let notificationTimeout: ReturnType<typeof setTimeout>;

    let avatarOverlays: Overlay[] = [];

    const clearAvatarOverlays = () => {
      avatarOverlays.forEach((overlay) => {
        if (map.value) {
          map.value.removeOverlay(overlay);
        }
        const element = overlay.getElement();
        if (element && element.parentNode) {
          element.parentNode.removeChild(element);
        }
      });
      avatarOverlays = [];
      console.log("Overlays de avatares removidos.");
    };

    // Função para buscar dados GeoJSON da API
    const fetchGeoJsonData = async () => {
      errorMessage.value = null;
      try {
        const requestData = {
          user: route.query.user,
          userName: route.query.userName,
          device: route.query.device,
          userDevice: route.query.userDevice,
          startDate: route.query.startDate,
          finalDate: route.query.finalDate,
        };

        console.log("Dados da requisição recebidos: ", requestData);

        const response = await axios.post(
          "http://localhost:8080/stoppoint/find",
          requestData
        );

        console.log("Resposta da API: ", response.data);

        if (response.status === 200) {
          const geoJsonData: GeoJsonResponse = {
            user: response.data.user,
            device: response.data.device,
            geojson: response.data.geoJsonDTO,
          };

          // Preenche os avatares com base nos dados GeoJSON retornados
          avatars.value = geoJsonData.geojson.features.map((feature) => {
            const coords = feature.geometry.coordinates;
            const initials =
              geoJsonData.user.substring(0, 2).toUpperCase() || "NA";
            const fullName = geoJsonData.user || "Unknown";

            console.log(
              `Usuário: ${fullName}, Coordenadas: [${coords[1]}, ${coords[0]}]`
            );

            return {
              initials,
              fullName,
              color: "primary",
              coords,
            };
          });

          // Limpa os avatares existentes antes de adicionar novos
          clearAvatarOverlays();

          // Adiciona os avatares ao mapa
          avatars.value.forEach((avatar, index) => {
            // Criar um novo elemento para o avatar
            const avatarElement = document.createElement("div");
            avatarElement.id = "avatar-" + index;
            avatarElement.className = "avatar-marker";
            avatarElement.innerText = avatar.initials;

            avatarElement.title = `Nome: ${avatar.fullName}\nLatitude: ${avatar.coords[1]}\nLongitude: ${avatar.coords[0]}`;

            // Adiciona o elemento ao corpo do documento
            document.body.appendChild(avatarElement);

            // Cria o Overlay para o marcador
            const avatarMarker = new Overlay({
              element: avatarElement,
              position: fromLonLat(avatar.coords),
              positioning: "center-center",
            });

            if (map.value) {
              map.value.addOverlay(avatarMarker);
            }

            avatarOverlays.push(avatarMarker);
          });

          // Ajusta o zoom para que todos os avatares fiquem visíveis
          if (avatars.value.length > 0) {
            adjustMapToFitAvatars();
          }
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          errorMessage.value =
            "Esse usuário não tem pontos de parada no período selecionado.";
          startNotificationTimeout();
        } else {
          console.error("Erro ao buscar os dados GeoJSON:", error);
        }
      }
    };

    const startNotificationTimeout = () => {
      if (notificationTimeout) {
        clearTimeout(notificationTimeout); // Limpa qualquer timeout anterior
      }
      notificationTimeout = setTimeout(() => {
        errorMessage.value = null; // Remove a mensagem após 5 segundos
      }, 5000); // Tempo em milissegundos (5000ms = 5s)
    };

    const closeNotification = () => {
      errorMessage.value = null; // Remove a mensagem ao clicar no botão
      if (notificationTimeout) {
        clearTimeout(notificationTimeout); // Limpa o timeout se o usuário fechar manualmente
      }
    };

    // Função para ajustar o zoom e a área visível
    const adjustMapToFitAvatars = () => {
      const coordinates = avatars.value.map((avatar) =>
        fromLonLat(avatar.coords)
      );
      // Cria uma extensão que abrange todas as coordenadas
      const extent = boundingExtent(coordinates);
      // Ajusta a visualização do mapa para essa extensão
      if (map.value) {
        map.value
          .getView()
          .fit(extent, { padding: [50, 50, 50, 50], maxZoom: 15 });
      }
    };

    watch(
      () => route.query,
      () => {
        if (
          route.query.user &&
          route.query.device &&
          route.query.startDate &&
          route.query.finalDate
        ) {
          fetchGeoJsonData();
        }
      }
    );

    onMounted(() => {
      // Inicializa o mapa
      map.value = new Map({
        target: "map",
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
        ],
        view: new View({
          center: fromLonLat([-45.88671, -23.21978]), // Centro do mapa (Brasil)
          zoom: 3, // Zoom inicial padrão
          extent: [-20026376.39, -20048966.1, 20026376.39, 20048966.1], // [Limite Oeste, Sul, Leste, Norte] Limite para a projeção EPSG:3857 (usada pelo OSM)
        }),
        controls: defaultControls().extend([new Zoom()]),
      });
    });

    window.addEventListener("clearOverlays", clearAvatarOverlays);
    // Método para ser chamado ao clicar no botão do filtro
    const onFilterApply = () => {
      fetchGeoJsonData();
    };

    return { avatars, onFilterApply, errorMessage, closeNotification };
  },
};
</script>

<style scoped>
.map {
  width: 100%;
  height: 100vh;
}

:global(.ol-zoom) {
  bottom: 0.5em;
  top: auto;
  left: auto;
  right: 0.5em;
}

:global(.ol-attribution ul) {
  display: none;
}

.error-notification {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(255, 0, 0, 0.8);
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  z-index: 1000;
  display: flex;
  /* Para alinhar o texto e o botão */
  justify-content: space-between;
  /* Para dar espaço entre eles */
  align-items: center;
  /* Alinha verticalmente */
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-weight: bold;
  cursor: pointer;
  margin-left: 10px;
  /* Espaço entre o texto e o botão */
}

:global(.avatar-marker) {
  width: 35px;
  height: 35px;
  color: white;
  background-color: #0056b3;
  border-color: #0056b3;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  cursor: pointer;
}

:global(.avatar-marker:hover) {
  background-color: #007bff;
  border: 3px solid rgba(0, 123, 255, 0.6);
}
</style>
