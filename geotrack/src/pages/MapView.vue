<template>
  <Sidebar @consult="fetchGeoJsonData" @drawCircle="enableCircleDrawing"
    @geographicAreaConsult="handleGeographicAreaConsult" @stopPointsReceived="handleStopPointsOnMap" />
  <div ref="mapDiv" style="height: 100vh; width: 100%"></div>

  <!-- Modal dialog para detalhes do círculo -->
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
          <v-btn v-if="Number.isInteger(parseInt(circleDetails.id, 10))" variant="flat" color="red" @click="deleteCircle"
            style="margin: 0px 10px 15px 10px" rounded="xl">
            Deletar
          </v-btn>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000" top>
  <span style="font-weight: bold; font-size: 15px; color: white;">  
    {{ snackbarMessage }}
  </span>
  <template v-slot:actions>
    <v-btn
      color="white"
      variant="text"
      style="font-weight: bold; text-transform: uppercase; color: white;"
      @click="snackbar = false"
    >
      Close
    </v-btn>
  </template>  
  </v-snackbar>
</template>

<script lang="ts">
import axios from "axios";
import { onMounted, ref } from "vue";
import { id } from "vuetify/locale";

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
    const snackbarMessage = ref("");
    const snackbarColor = ref("success");
    const circleDetails = ref({
      id: "",
      name: "",
      type: "",
      center: "",
      radius: "",
    });

    // @ts-ignore
    let circleInstance: google.maps.Circle | null = null;
    // @ts-ignore
    const circles = ref<{ circle: google.maps.Circle; details: any }[]>([]);

    const showSnackbar = (message: string, color: string = 'sucess') => {
      snackbarMessage.value = message;
      snackbarColor.value = color;
      snackbar.value = true;
    }

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
                minZoom: 4, // Limite inferior de zoom
              });

              addCurrentLocationMarker(userLocation);
              initializeDrawingManager();
            },
            (error) => {
              // Se a localização não for aceita, inicie o mapa com a localização padrão
              const defaultLocation = { lat: -14.235, lng: -51.9253 };
              map.value = new google.maps.Map(mapDiv.value!, {
                center: defaultLocation,
                zoom: 3,
                minZoom: 4, // Limite inferior de zoom
              });
              // Não chama addMarker se a geolocalização falhar
              showSnackbar('Falha ao obter a localização.Usando localização padrão.','warning');
            }
          );
        } else {
          const defaultLocation = { lat: 2.8266, lng: -60.6623 };
          map.value = new google.maps.Map(mapDiv.value!, {
            center: defaultLocation,
            zoom: 10,
            minZoom: 4, // Limite inferior de zoom
          });
          // Não chama addMarker se geolocalização não estiver disponível
          showSnackbar('Geolocalização não suportada pelo navegador.','error');
        }
      }
    });

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
      console.log("Filter data recebido:", filterData);
      try {
        const requestData = { ...filterData }; // Formato dos dados que você espera no backend

        console.log("dados recebidos:", requestData);

        const response = await axios.post(
          "http://localhost:8080/stoppoint/find",
          requestData
        );

        // Resposta esperada: uma matriz de objetos
        const geoJsonResponses = response.data;
        console.log("geoJsonResponses:", geoJsonResponses);

        geoJsonResponses.forEach((item: any) => {
          const { user, device, geoJsonDTO } = item;

          if (geoJsonDTO.features && geoJsonDTO.features.length > 0) {
            geoJsonDTO.features.forEach((feature: GeoJsonFeature) => {
              const coords = feature.geometry.coordinates;
              if (coords && coords.length >= 2) {
                localStorage.setItem('cachedLoading',JSON.stringify({result: false}));
                const position = { lat: coords[1], lng: coords[0] }; // Coordenadas: lat e lng

                // Gera as iniciais do usuário
                const initials = user
                  .split(" ")
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
            showSnackbar('Nenhum dado GeoJSON disponível para o usuário', 'warning');
            console.warn("Nenhum dado GeoJSON disponível para o usuário:", user);
          }
        });
      } catch (error) {
        showSnackbar('Nenhuma localização encontrada para este período', 'error');
      }
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
        snackbarMessage.value = "Zona salva com sucesso!";
        snackbarColor.value = "success";
        snackbar.value = true;

        dialog.value = false;

        setTimeout(() => {
          window.location.reload();
        }, 500);

      } catch (error) {
        console.log("Erro ao enviar os dados:", error);
        snackbarMessage.value = "Erro ao salvar a zona. Nome Já existe.";
        snackbarColor.value = "error";
        snackbar.value = true;
      }

    };

    const deleteCircle = async () => {
      const cached = localStorage.getItem('circleDetailsCached');
      // @ts-ignore
      const cachedDetails = JSON.parse(cached);

      const payload = {
        id: circleDetails.value.id,
      };

      console.log(payload)

      if (cachedDetails != null && Number.isInteger(parseInt(cachedDetails.id, 10))) {
        payload.id = cachedDetails.id
        localStorage.removeItem('circleDetailsCached')
      }

      try {
        const response = await axios.delete("http://localhost:8080/zone", {
          data: payload,
        });
        console.log("Dados enviados com sucesso:", response.data);
        console.log({ data: payload });
        snackbarMessage.value = "Zona deletada com sucesso!";
        snackbarColor.value = "success";
        snackbar.value = true;

        dialog.value = false;
        
        // setTimeout(() => (dialog.value = false), 1000)
       
        removeCircle()
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } catch (error) {
        showSnackbar('Erro ao enviar os dados.','error');
        console.log('Erro ao enviar os dados:', error);

        snackbarMessage.value = "Erro ao deletar a zona. Tente novamente.";
        snackbarColor.value = "error";
        snackbar.value = true;
      }
    };

    const removeCircle = () => {
      dialog.value = false;
      if (circleInstance) {
        circleInstance.setMap(null);
        circleInstance = null;
        localStorage.removeItem('cachedCircleDetails');
      };
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

  const handleStopPointsOnMap = (points: any) => {
    console.log("Pontos de parada recebidos do Sidebar:", points);

    points.coords.forEach((item: any) => {
      const position = { lat: item.latitude, lng: item.longitude }; // Coordenadas: lat e lng

      console.log('name ', points)

      // Gera as iniciais do usuário
      const initials = points.userName.split(" ")
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
                          <strong>Usuário:</strong> ${points.userName}<br>
                          <strong>Dispositivo:</strong> ${points.device}<br>
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
    });
  };

  return {
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
    snackbarMessage,
    snackbarColor,
    drawCircleOnMap,
    handleGeographicAreaConsult,
    handleStopPointsOnMap,
  };
},
};
</script>

<style scoped></style>
