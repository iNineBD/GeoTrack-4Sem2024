<template>
  
  <Sidebar @consult="fetchGeoJsonData" @drawCircle="enableCircleDrawing"
    @geographicAreaConsult="handleGeographicAreaConsult" @stopPointsReceived="handleStopPointsOnMap"
    @initializeMap="initializeMap" @removeCircle="removeCircle" />
  <div ref="mapDiv" style="height: 100vh; width: 100%"></div>
  <v-switch
    v-model="isDarkTheme"
    label="Modo Escuro"
    hide-details
    inset
    @change="toggleTheme"
    style="position: fixed; top: 10px; right: 10px; z-index: 10;"
  ></v-switch>  <!-- Modal dialog para detalhes do círculo -->
  <v-dialog v-model="dialog" max-width="420px">
    <v-card rounded="xl">
      <v-card-title class="text-center" style="padding: 10px 15px 0px 15px;">
        <span class="headline">Detalhes da zona selecionada</span>
      </v-card-title>

      <v-card-text style="padding: 10px 15px 0px 15px;">
        <v-form>
          <v-text-field v-model="circleDetails.name" label="Nome" color="primary"></v-text-field>
          <v-text-field v-model="circleDetails.type" label="Tipo" readonly style="opacity: 75%"
            color="primary"></v-text-field>
          <v-text-field v-model="circleDetails.center" label="Coordenadas do Centro (latitude/longitude)" readonly
            style="opacity: 75%" color="primary"></v-text-field>
          <v-text-field v-model="circleDetails.radius" label="Raio (metros)" readonly style="opacity: 75%"
            color="primary"></v-text-field>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-row justify="center">
          <v-btn variant="flat" color="primary" @click="saveCircle" style="margin: 0px 10px 15px 10px" rounded="xl">
            Salvar
          </v-btn>
          <v-btn variant="flat" color="primary_light" @click="removeCircle" style="margin: 0px 10px 15px 10px"
            rounded="xl">
            Remover
          </v-btn>
          <v-btn variant="flat" color="primary_light" @click="editCircle" style="margin: 0px 10px 15px 10px"
            rounded="xl">
            Editar
          </v-btn>
          <v-btn v-if="!(circleDetails.id == '')" variant="flat" color="red" @click="deleteCircle"
            style="margin: 0px 10px 15px 10px" rounded="xl">
            Deletar
          </v-btn>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000" top>
    {{ snackbarMessage }}
  </v-snackbar>
</template>

<script lang="ts">
import { onMounted, ref } from "vue";
import axios from "axios";
import { id } from "vuetify/locale";
import { eventBus } from '@/utils/EventBus'; // Importando o EventBus

interface GeoJsonFeature {
  geometry: {
    coordinates: [number, number];
  };
}

export interface FilterData {
  idDevice: number[];
  startDate: string;
  finalDate: string;
}

export default {
  name: "MapView",
  data () {
      return {
        model: true,
      }
    },

  setup() {
  
    const map = ref<google.maps.Map | null>(null);
    const mapDiv = ref<HTMLElement | null>(null);
    const drawingManager = ref<google.maps.drawing.DrawingManager | null>(null);
    const dialog = ref(false);
    const isDarkTheme = ref(false);
    const themeClass = ref("");

    const snackbar = ref(false); // Controle de visibilidade do snackbar
    const snackbarColor = ref("success"); // Inicializa a cor do snackbar como "success"
    const snackbarMessage = ref(""); // Mensagem do snackbar

    // Método para exibir o snackbar
    //@ts-ignore
    const showSnackbar = (message, color = "success") => {
      snackbarMessage.value = message; // Define a mensagem
      snackbarColor.value = color; // Define a cor
      snackbar.value = true; // Torna o snackbar visível
    };

    let markers: google.maps.Marker[] = [];
    const circleDetails = ref({
      id: "",
      name: "",
      type: "",
      center: "",
      radius: "",
    });
    const toggleTheme = (isDark: boolean) => {
      isDarkTheme.value = isDark;
      themeClass.value = isDark ? "dark-theme" : "light-theme";
    };
    // @ts-ignore
    let circleInstance: google.maps.Circle | null = null;
    // @ts-ignore
    const circles = ref<{ circle: google.maps.Circle; details: any }[]>([]);

    onMounted(() => {
      toggleTheme(isDarkTheme.value);
      if (mapDiv.value) {
        initializeDrawingManager();
        initializeMap();
      }
    });

    const initializeMap = () => {
      if (markers.length > 0) {
        clearMarkers();
      }
      const darkModeStyles = [
        { elementType: 'geometry', stylers: [{ color: '#212121' }] },
        { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
        { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#757575' }] },
        { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
        { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#181818' }] },
        { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#2c2c2c' }] },
        { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#8a8a8a' }] },
        { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#000000' }] },
        { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3d3d3d' }] }
      ];

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };

            map.value = new google.maps.Map(mapDiv.value!, {
              center: userLocation,
              zoom: 12,
              minZoom: 4, // Limite inferior de zoom
              styles: isDarkTheme.value ? darkModeStyles : []  // Adicionando o tema dark
            });
            addCurrentLocationMarker(userLocation);
          },
          (error) => {
            const defaultLocation = { lat: -14.235, lng: -51.9253 };
            map.value = new google.maps.Map(mapDiv.value!, {
              center: defaultLocation,
              zoom: 3,
              minZoom: 4,
              styles: isDarkTheme.value ? darkModeStyles : []// Adicionando o tema dark
            });
          }
        );
      } else {
        const defaultLocation = { lat: 2.8266, lng: -60.6623 };
        map.value = new google.maps.Map(mapDiv.value!, {
          center: defaultLocation,
          zoom: 10,
          minZoom: 4,
          styles: isDarkTheme.value ? darkModeStyles : [] // Adicionando o tema dark
        });
      }
    };
    const addCurrentLocationMarker = (position: google.maps.LatLngLiteral) => {
      if (map.value) {
        new google.maps.Marker({
          position,
          map: map.value,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#4285F4",
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#ffffff",
          },
          title: "Sua Localização Atual",
        });
      }
    };

    const centerMapOnMarker = (position: google.maps.LatLngLiteral) => {
      if (map.value) {
        map.value.panTo(position);
        map.value.setZoom(15);
      }
    };

    const clearMarkers = () => {
      markers.forEach((marker) => {
        marker.setMap(null);  // Remove o marcador do mapa
      });
      markers = [];  // Limpa o array de marcadores
    };

    const fetchGeoJsonData = async (filterData: FilterData) => {
      try {
        const response = await axios.post(
          "http://localhost:8080/stoppoint/find",
          filterData
        );

        // Verifica se a resposta está dentro do intervalo de sucesso
        if (response.status >= 200 && response.status < 300) {
          const geoJsonResponses = response.data;

          // Limpa os marcadores anteriores no mapa
          clearMarkers();

          // Processa cada item da resposta GeoJSON
          geoJsonResponses.forEach((item: any) => {
            const { user, device, geoJsonDTO } = item;

            if (geoJsonDTO.features && geoJsonDTO.features.length > 0) {
              geoJsonDTO.features.forEach((feature: GeoJsonFeature) => {
                const coords = feature.geometry.coordinates;
                if (coords && coords.length >= 2) {
                  // Plota o ponto diretamente no mapa
                  plotPointOnMap({
                    userName: user,
                    device: device,
                    coords: { latitude: coords[1], longitude: coords[0] }
                  });
                }
              });
            }
          });
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          if (error.response.status === 404) {
            console.log("Erro 404: ", error.response.data.message);
            showSnackbar(error.response.data.message, "error");
          } else {
            console.error("Erro ao buscar os dados GeoJSON:", error.response.data);
          }
        } else {
          console.error("Erro de rede ou outro erro:", error);
        }
      } finally {
        eventBus.emit('stopIsLoading');
      }
    };

    const handleStopPointsOnMap = (points: any) => {
      clearMarkers();
      points.coords.forEach((item: any) => {
        plotPointOnMap({
          userName: points.userName,
          device: points.device,
          coords: { latitude: item.latitude, longitude: item.longitude }
        });
      });
      eventBus.emit('stopIsLoading');
    };

    const plotPointOnMap = (userData: any) => {
      const position = { lat: userData.coords.latitude, lng: userData.coords.longitude }; // Coordenadas

      // Gera as iniciais do usuário
      const initials = userData.userName.split(" ")
        .slice(0, 2)
        .map((name: string) => name[0])
        .join("");

      const marker = new google.maps.Marker({
        position,
        map: map.value,
        label: {
          text: initials,
          color: "white",
          fontWeight: "bold",
          fontSize: "14px",
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 15,
          fillColor: "#000B62",
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "#ffffff",
        },
      });

      // Adiciona o marcador no array global para controle
      markers.push(marker);

      const infoWindow = new google.maps.InfoWindow({
        content: `<div>
              <strong>Usuário:</strong> ${userData.userName}<br>
              <strong>Dispositivo:</strong> ${userData.device}<br>
              <strong>Coordenadas:</strong> ${position.lat}, ${position.lng}
            </div>`,
      });

      google.maps.event.addListener(marker, "click", () => {
        infoWindow.open(map.value!, marker);
      });

      google.maps.event.addListener(map.value, "click", () => {
        infoWindow.close();
      });

      centerMapOnMarker(position);
    };

    const initializeDrawingManager = () => {
      drawingManager.value = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.CIRCLE,
        drawingControl: false,
        circleOptions: {
          fillColor: "#18FFFF",
          fillOpacity: 0.3,
          strokeWeight: 2,
          strokeColor: "#0097A7",
          clickable: true,
        },
      });

      // @ts-ignore
      google.maps.event.addListener(
        drawingManager.value,
        "circlecomplete",
        // @ts-ignore
        (circle: google.maps.Circle) => {

          if (circleInstance) {
            circleInstance.setMap(null);
            circleInstance = null;
          }

          const center = circle.getCenter().toJSON(); // {lat, lng}
          const radius = circle.getRadius(); // em metros

          circleInstance = circle;
          if (circleDetails.value.name === "") {
            circleDetails.value.name = "Zona 1";
            circleDetails.value.type = "CIRCLE";
          }
          circleDetails.value.id = `${id}`;
          circleDetails.value.center = `${center.lat}, ${center.lng}`;
          circleDetails.value.radius = `${radius}`;

          // Evento para abrir o modal quando o círculo for clicado
          google.maps.event.addListener(circle, "click", () => {
            dialog.value = true;
          });

          if (drawingManager.value) {
            drawingManager.value.setDrawingMode(null);
            drawingManager.value.setMap(null);
          }
        }
      );
    };

    const enableCircleDrawing = () => {
      if (drawingManager.value && map.value) {
        drawingManager.value.setDrawingMode(
          google.maps.drawing.OverlayType.CIRCLE
        );
        drawingManager.value.setMap(map.value);
      }
    };

    const editCircle = async () => {
      const id = circleDetails.value.id;
      const type = circleDetails.value.type;

      console.log('id antigo', circleDetails.value);

      // Fecha o dialog inicialmente
      dialog.value = false;

      // Inicia o modo de desenho de círculo
      if (drawingManager.value && map.value) {
        drawingManager.value.setDrawingMode(google.maps.drawing.OverlayType.CIRCLE);
        drawingManager.value.setMap(map.value);
      }

      // Se já existir um círculo desenhado, remova-o
      if (circleInstance) {
        circleInstance.setMap(null);
        circleInstance = null;
      }

      // Escuta o evento overlaycomplete para detectar quando o círculo foi desenhado
      const overlayCompleteListener = (event: any) => {
        if (event.type === google.maps.drawing.OverlayType.CIRCLE) {
          // Guarda a nova instância do círculo
          circleInstance = event.overlay;

          // Atualiza os detalhes do círculo com os novos dados
          const newRadius = circleInstance.getRadius();
          const latitude = circleInstance.getCenter().lat();
          const longitude = circleInstance.getCenter().lng();

          // Atualiza o circleDetails com as novas informações
          circleDetails.value = {
            id: id, // mantemos o id antigo
            name: circleDetails.value.name,
            type: type,
            radius: newRadius,
            //@ts-ignore
            center: {
              lat: latitude,
              lng: longitude,
            },
          };

          console.log('Novos detalhes do círculo', circleDetails.value);

          // Armazenando os dados no localStorage
          localStorage.setItem('circleDetailsCached', JSON.stringify(circleDetails.value));

          // Reabre o dialog após o círculo ser desenhado
          dialog.value = true;
        }
      };

      // Adiciona o listener para overlaycomplete
      google.maps.event.addListener(drawingManager.value, 'overlaycomplete', overlayCompleteListener);

      console.log('Esperando o novo círculo ser desenhado...');


    };

    const saveCircle = async () => {
      const cached = localStorage.getItem('circleDetailsCached');
      // @ts-ignore
      const cachedDetails = JSON.parse(cached);


      const updateZone = {
        id: circleDetails.value.id,
        name: circleDetails.value.name,
        type: "CIRCLE",
        center: {
          longitude: parseFloat(circleDetails.value.center.split(", ")[1]),
          latitude: parseFloat(circleDetails.value.center.split(", ")[0]),
        },
        radius: parseFloat(circleDetails.value.radius),
      }

      if (cachedDetails) {
        updateZone.id = cachedDetails.id
      }

      const payload = {
        name: circleDetails.value.name,
        type: "CIRCLE",
        center: {
          longitude: parseFloat(circleDetails.value.center.split(", ")[1]),
          latitude: parseFloat(circleDetails.value.center.split(", ")[0]),
        },
        radius: parseFloat(circleDetails.value.radius),
      };

      console.log("Dados para insert no banco: ", payload);

      try {
        if (!Number.isInteger(parseInt(updateZone.id, 10))) {
          const response = await axios.post(
            "http://localhost:8080/zone",
            payload
          );

          console.log("Dados enviados com sucesso:", response.data);
        }

        else {
          const response = await axios.put(
            "http://localhost:8080/zone",
            updateZone
          );
          console.log("Dados enviados com sucesso para update:", response.data);

        }
        showSnackbar("Zona salva com sucesso!", "success");
        dialog.value = false;

        eventBus.emit('reloadGeoArea');

      } catch (error) {
        console.log("Erro ao enviar os dados:", error);
        showSnackbar("Erro ao salvar a zona. Tente novamente.", "error");
      }

    };

    const deleteCircle = async () => {
      const cached = localStorage.getItem('circleDetailsCached');
      // @ts-ignore
      const cachedDetails = JSON.parse(cached);

      const payload = {
        id: circleDetails.value.id,
      };

      if (cachedDetails) {
        payload.id = cachedDetails.id
      }

      try {
        const response = await axios.delete("http://localhost:8080/zone", {
          data: payload,
        });
        console.log("Dados enviados com sucesso:", response.data);
        console.log({ data: payload });
        showSnackbar("Zona deletada com sucesso!", "success");

        dialog.value = false;
        removeCircle();
        eventBus.emit('reloadGeoArea');
        
      } catch (error) {
        console.log("Erro ao deletar os dados:", error);
        showSnackbar("Erro ao deletar a zona. Tente novamente.", "error");
      }
    };

    const removeCircle = () => {
      circleDetails.value = {
        id: "",
        name: "",
        type: "",
        center: "",
        radius: "",
      };
      dialog.value = false;
      if (circleInstance) {
        circleInstance.setMap(null);
        circleInstance = null;
        localStorage.removeItem('cachedCircleDetails');
      }
      eventBus.emit('clearSelectedGeoArea');
    };

    const drawCircleOnMap = (
      latitude: number,
      longitude: number,
      radius: number
    ) => {
      if (circleInstance) {
        circleInstance.setMap(null);
      }


      const circleCenter = { lat: latitude, lng: longitude };

      // @ts-ignore
      circleInstance = new google.maps.Circle({
        map: map.value,
        center: circleCenter,
        radius: radius,
        fillColor: "#18FFFF",
        fillOpacity: 0.3,
        strokeWeight: 2,
        strokeColor: "#0097A7",
        clickable: true,
      });

      google.maps.event.addListener(circleInstance, "click", () => {
        dialog.value = true;
      });

      map.value?.panTo(circleCenter);
      map.value?.setZoom(14);
    };

    const handleGeographicAreaConsult = (data: any) => {
      console.log("Dados geográficos recebidos do Sidebar:", data);
      circleDetails.value = {
        id: data.id,
        name: data.name,
        type: "CIRCLE",
        center: `${data.latitude}, ${data.longitude}`,
        radius: `${data.radius}`,
      };

      drawCircleOnMap(data.latitude, data.longitude, data.radius);
    };

    return {
      initializeMap,
      map,
      mapDiv,
      fetchGeoJsonData,
      enableCircleDrawing,
      dialog,
      circleDetails,
      editCircle,
      saveCircle,
      deleteCircle,
      removeCircle,

      snackbar,
      snackbarColor,
      snackbarMessage,
      showSnackbar,

      drawCircleOnMap,
      handleGeographicAreaConsult,
      handleStopPointsOnMap,

      isDarkTheme,
      toggleTheme,
      themeClass,
    };
  },
  
};
</script>

<style scoped>
.theme-toggle {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
}

.light-theme {
  background-color: #f5f5f5;
  color: #333;
}

.dark-theme {
  background-color: #121212;
  color: #e0e0e0;
}
</style>