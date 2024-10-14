<template>
  <Sidebar @consult="fetchGeoJsonData" @drawCircle="enableCircleDrawing" />
  <div ref="mapDiv" style="height: 100vh; width: 100%"></div>

  <!-- Modal dialog para detalhes do círculo -->
  <v-dialog v-model="dialog" max-width="425px" max-height="460px">
    <v-card>
      <v-card-title class="text-center" style="padding: 10px 15px 0px 15px;">
        <span class="headline">Detalhes da zona selecionada</span>
      </v-card-title>

      <v-card-text style="padding: 10px 15px 10px 15px;">
        <v-form>
          <v-text-field v-model="circleDetails.name" label="Nome"></v-text-field>
          <v-text-field v-model="circleDetails.type" label="Tipo" readonly style="opacity: 75%;"></v-text-field>
          <v-text-field v-model="circleDetails.center" label="Coordenadas do Centro (latitude/longitude)" readonly
            style="opacity: 75%;"></v-text-field>
          <v-text-field v-model="circleDetails.radius" label="Raio (metros)" readonly
            style="opacity: 75%;"></v-text-field>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-row justify="center">
          <v-btn variant="flat" color="primary" @click="saveCircle" style="margin: 0px 10px 15px 10px;">
            Salvar
          </v-btn>
          <v-btn variant="flat" color="grey-lighten-2" @click="removeCircle" style="margin: 0px 10px 15px 10px;">
            Remover
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
  setup() {
    const map = ref<google.maps.Map | null>(null);
    const mapDiv = ref<HTMLElement | null>(null);
    const drawingManager = ref<google.maps.drawing.DrawingManager | null>(null);
    const dialog = ref(false);
    const snackbar = ref(false);
    const snackbarMessage = ref('');
    const snackbarColor = ref('success');
    const circleDetails = ref({
      name: 'Zona 1',
      type: 'CIRCLE',
      center: '',
      radius: '',
    });

    // @ts-ignore
    let circleInstance: google.maps.Circle | null = null;

    onMounted(() => {
      if (mapDiv.value) {
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
                minZoom: 4,  // Limite inferior de zoom
              });

              addCurrentLocationMarker(userLocation);
              initializeDrawingManager();
            },
            (error) => {
              // Se a localização não for aceita, inicie o mapa com a localização padrão
              const defaultLocation = { lat: -14.2350, lng: -51.9253 };
              map.value = new google.maps.Map(mapDiv.value!, {
                center: defaultLocation,
                zoom: 3,
                minZoom: 4,  // Limite inferior de zoom
              });
              // Não chama addMarker se a geolocalização falhar
            }
          );
        } else {
          const defaultLocation = { lat: 2.8266, lng: -60.6623 };
          map.value = new google.maps.Map(mapDiv.value!, {
            center: defaultLocation,
            zoom: 10,
            minZoom: 4,  // Limite inferior de zoom
          });
          // Não chama addMarker se geolocalização não estiver disponível
        }
      }
    });

    const initializeDrawingManager = () => {
      drawingManager.value = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.CIRCLE,
        drawingControl: false,
        circleOptions: {
          fillColor: '#18FFFF',
          fillOpacity: 0.3,
          strokeWeight: 2,
          strokeColor: '#0097A7',
          clickable: true,
        },
      });

      // @ts-ignore
      google.maps.event.addListener(drawingManager.value, 'circlecomplete', (circle: google.maps.Circle) => {
        if (circleInstance) {
          circleInstance.setMap(null);
        }

        const center = circle.getCenter().toJSON(); // {lat, lng}
        const radius = circle.getRadius(); // em metros

        circleInstance = circle;

        circleDetails.value.center = `${center.lat}, ${center.lng}`;
        circleDetails.value.radius = `${radius}`;

        // Evento para abrir o modal quando o círculo for clicado
        google.maps.event.addListener(circle, 'click', () => {
          dialog.value = true;
        });

        if (drawingManager.value) {
          drawingManager.value.setDrawingMode(null);
          drawingManager.value.setMap(null);
        }
      });
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

    const fetchGeoJsonData = async (filterData: FilterData) => {
      console.log("Filter data recebido:", filterData)
      try {
        const requestData = { ...filterData }; // Formato dos dados que você espera no backend

        console.log("dados recebidos:", requestData);

        const response = await axios.post("http://localhost:8080/stoppoint/find", requestData);

        // Resposta esperada: uma matriz de objetos
        const geoJsonResponses = response.data;
        console.log("geoJsonResponses:", geoJsonResponses);

        geoJsonResponses.forEach((item: any) => {
          const { user, device, geoJsonDTO } = item;

          if (geoJsonDTO.features && geoJsonDTO.features.length > 0) {
            geoJsonDTO.features.forEach((feature: GeoJsonFeature) => {
              const coords = feature.geometry.coordinates;
              if (coords && coords.length >= 2) {
                const position = { lat: coords[1], lng: coords[0] }; // Coordenadas: lat e lng

                // Gera as iniciais do usuário
                const initials = user.split(" ")
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

                const infoWindow = new google.maps.InfoWindow({
                  content: `<div>
                          <strong>Usuário:</strong> ${user}<br>
                          <strong>Dispositivo:</strong> ${device}<br>
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
              }
            });
          } else {
            console.warn("Nenhum dado GeoJSON disponível para o usuário:", user);
          }
        });
      } catch (error) {
        console.error("Erro ao buscar os dados GeoJSON:", error);
      }
    };

    const enableCircleDrawing = () => {
      if (drawingManager.value && map.value) {
        drawingManager.value.setDrawingMode(google.maps.drawing.OverlayType.CIRCLE);
        drawingManager.value.setMap(map.value);
      }
    };

    const saveCircle = async () => {
      const payload = {
        name: circleDetails.value.name,
        type: "CIRCLE",
        center: {
          longitude: parseFloat(circleDetails.value.center.split(", ")[1]),
          latitude: parseFloat(circleDetails.value.center.split(", ")[0])
        },
        radius: parseFloat(circleDetails.value.radius)
      };

      console.log("Dados para insert no banco: ", payload)

      try {
        const response = await axios.post("http://localhost:8080/zone", payload);
        console.log('Dados enviados com sucesso:', response.data);

        snackbarMessage.value = 'Zona salva com sucesso!';
        snackbarColor.value = 'success';
        snackbar.value = true;

        dialog.value = false;

      } catch (error) {
        console.log('Erro ao enviar os dados:', error);

        snackbarMessage.value = 'Erro ao salvar a zona. Tente novamente.';
        snackbarColor.value = 'error';
        snackbar.value = true;
      }
    };

    const removeCircle = () => {
      dialog.value = false;
      if (circleInstance) {
        circleInstance.setMap(null);
        circleInstance = null;
      }
    };

    return {
      map,
      mapDiv,
      fetchGeoJsonData,
      enableCircleDrawing,
      dialog,
      circleDetails,
      saveCircle,
      removeCircle,
      snackbar,
      snackbarMessage,
      snackbarColor,
    };
  },
};
</script>

<style scoped></style>
