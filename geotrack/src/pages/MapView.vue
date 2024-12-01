<template>
  <Sidebar v-show="!isStreetViewActive" @consult="fetchGeoJsonData" @drawCircle="enableCircleDrawing"
    @geographicAreaConsult="handleGeographicAreaConsult" @stopPointsReceived="handleStopPointsOnMap"
    @initializeMap="initializeMap" @removeCircle="removeCircle" @initializeMapDark="initializeMapDark"
    @routesReceived="handleRoutesReceived" />
  <div ref="mapDiv" style="height: 100vh; width: 100%"></div>
  <v-switch v-if="!isStreetViewActive" v-model="isDarkTheme" hide-details inset style="
      position: fixed;
      top: -5px;
      right: 240px;
      z-index: 10;
      transform: scale(1.3);
      transform-origin: top right;
    " @update:modelValue="updateDarkMode">
    <template v-slot:thumb>
      <v-icon>{{
        isDarkTheme ? "mdi-weather-night" : "mdi-weather-sunny"
        }}</v-icon>
    </template>
  </v-switch>

  <div>
    <v-btn v-if="!isStreetViewActive" title="Relátorios de métricas" color="primary" icon="mdi-text-box-search-outline"
      @click="togglePanel"
      style="position: fixed; top: 12px; right: 320px; z-index: 10; width: 40px; height: 40px; border-radius: 50%;"></v-btn>

    <MetricsCard v-if="isPanelOpen && !isStreetViewActive"
      style="position: fixed; top: 7px; right: 370px; z-index: 10; width: 210px; border-radius: 0px;">
    </MetricsCard>
  </div>

  <!-- Modal dialog para detalhes do círculo -->
  <v-dialog v-model="dialog" max-width="420px" @click:outside="removeCircle(false)">
    <v-card rounded="xl" color="primary">
      <v-card-title class="text-center" style="padding: 10px 15px 0px 15px">
        <span class="headline">Detalhes da zona selecionada</span>
      </v-card-title>

      <v-card-text style="padding: 10px 15px 0px 15px">
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
          <v-btn variant="flat" color="#008000" @click="saveCircle" style="margin: 0px 10px 15px 10px" rounded="xl">
            Salvar
          </v-btn>
          <v-btn variant="flat" color="primary_light" @click="removeCircle(true)" style="margin: 0px 10px 15px 10px"
            rounded="xl">
            Remover
          </v-btn>
          <v-btn v-if="!(circleDetails.id == '')" variant="flat" color="primary_light" @click="editCircle"
            style="margin: 0px 10px 15px 10px" rounded="xl">
            Editar
          </v-btn>
          <v-btn v-if="!(circleDetails.id == '')" variant="flat" color="#FF0000" @click="deleteCircle"
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
import vuetify from "@/plugins/vuetify";
import { eventBus } from "@/utils/EventBus"; // Importando o EventBus
import axios from "axios";
import { onMounted, ref, watch } from "vue";
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
  data() {
    return {
      isDark: false,
      isPanelOpen: false,
    };
  },
  setup() {
    const map = ref<google.maps.Map | null>(null);
    const mapDiv = ref<HTMLElement | null>(null);
    const drawingManager = ref<google.maps.drawing.DrawingManager | null>(null);
    const dialog = ref(false);
    const isDarkTheme = ref<boolean>(vuetify.theme.global.name === "dark");
    const themeClass = ref("");

    const isPanelOpen = ref(false);

    const snackbar = ref(false); // Controle de visibilidade do snackbar
    const snackbarColor = ref("success"); // Inicializa a cor do snackbar como "success"
    const snackbarMessage = ref(""); // Mensagem do snackbar
    const isStreetViewActive = ref(false);

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

    // @ts-ignore
    let circleInstance: google.maps.Circle | null = null;
    // @ts-ignore
    const circles = ref<{ circle: google.maps.Circle; details: any }[]>([]);
    // @ts-ignore
    let routeLines: google.maps.Polyline[] = [];

    const isPlaying = ref(false);

    onMounted(() => {
      eventBus.on('animationEnded', () => {
        isPlaying.value = false; // Change to play icon when animation ends
      });
      if (mapDiv.value) {
        initializeDrawingManager();
        initializeMap();

        eventBus.on("navigateToLocation", (coordinates: [number, number]) => {
          navigateToLocation(coordinates);
        });

        eventBus.on("navigateGeoToLocation", (coords: [number, number]) => {
          navigateGeoToLocation(coords);
        });
      }

      eventBus.on("selectedRoute", handleSelectedRoute);
    });

    const handleSelectedRoute = (route: any) => {

      handleRoutesReceived({ routes: [route] });
    };

    const navigateToLocation = (coordinates: [number, number]) => {
      if (map.value) {
        const [latitude, longitude] = coordinates;
        const newPosition = new google.maps.LatLng(longitude, latitude);

        map.value.panTo(newPosition);
        let currentZoom = map.value.getZoom();
        const targetZoom = 16;

        const zoomIn = setInterval(() => {
          if (currentZoom < targetZoom) {
            currentZoom += 1;
            map.value.setZoom(currentZoom);
          } else {
            clearInterval(zoomIn);  // Finaliza a animação de zoom
          }
        }, 20);
      }
    };

    const navigateGeoToLocation = (coords: [number, number]) => {
      if (map.value) {
        const [latitude, longitude] = coords;
        const newPosition = new google.maps.LatLng(latitude, longitude);

        map.value.panTo(newPosition);
        let currentZoom = map.value.getZoom();
        const targetZoom = 16;

        const zoomIn = setInterval(() => {
          if (currentZoom < targetZoom) {
            currentZoom += 1;
            map.value.setZoom(currentZoom);
          } else {
            clearInterval(zoomIn);  // Finaliza a animação de zoom
          }
        }, 20);
      }
    };

    const updateDarkMode = () => {
      darkMode();
      toggleTheme();
      eventBus.emit("changeLogo");
    };

    const darkMode = () => {

      const darkModeStyles = [
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        {
          featureType: "administrative.locality",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "poi",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "poi.park",
          elementType: "geometry",
          stylers: [{ color: "#263c3f" }],
        },
        {
          featureType: "poi.park",
          elementType: "labels.text.fill",
          stylers: [{ color: "#6b9a76" }],
        },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#38414e" }],
        },
        {
          featureType: "road",
          elementType: "geometry.stroke",
          stylers: [{ color: "#212a37" }],
        },
        {
          featureType: "road",
          elementType: "labels.text.fill",
          stylers: [{ color: "#9ca5b3" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry",
          stylers: [{ color: "#746855" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry.stroke",
          stylers: [{ color: "#1f2835" }],
        },
        {
          featureType: "road.highway",
          elementType: "labels.text.fill",
          stylers: [{ color: "#f3d19c" }],
        },
        {
          featureType: "transit",
          elementType: "geometry",
          stylers: [{ color: "#2f3948" }],
        },
        {
          featureType: "transit.station",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#17263c" }],
        },
        {
          featureType: "water",
          elementType: "labels.text.fill",
          stylers: [{ color: "#515c6d" }],
        },
        {
          featureType: "water",
          elementType: "labels.text.stroke",
          stylers: [{ color: "#17263c" }],
        },
      ];

      let estilo = null;

      if (isDarkTheme.value) {
        estilo = darkModeStyles;
      }

      if (map.value) {
        map.value.setOptions({ styles: estilo });
      } else {
        // Caso o mapa ainda não tenha sido inicializado, inicialize-o
        const defaultLocation = { lat: -14.235, lng: -51.9253 };
        map.value = new google.maps.Map(mapDiv.value!, {
          center: defaultLocation,
          zoom: 3,
          minZoom: 4,
          styles: estilo,
        });
      }
    }

    const initializeMapDark = () => {

      circleDetails.value = {
        id: "",
        name: "",
        type: "CIRCLE",
        center: ``,
        radius: ``,
      };

      if (markers.length > 0) {
        clearMarkers();
        removeCircle();
      }

      const darkModeStyles = [
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        {
          featureType: "administrative.locality",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "poi",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "poi.park",
          elementType: "geometry",
          stylers: [{ color: "#263c3f" }],
        },
        {
          featureType: "poi.park",
          elementType: "labels.text.fill",
          stylers: [{ color: "#6b9a76" }],
        },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#38414e" }],
        },
        {
          featureType: "road",
          elementType: "geometry.stroke",
          stylers: [{ color: "#212a37" }],
        },
        {
          featureType: "road",
          elementType: "labels.text.fill",
          stylers: [{ color: "#9ca5b3" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry",
          stylers: [{ color: "#746855" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry.stroke",
          stylers: [{ color: "#1f2835" }],
        },
        {
          featureType: "road.highway",
          elementType: "labels.text.fill",
          stylers: [{ color: "#f3d19c" }],
        },
        {
          featureType: "transit",
          elementType: "geometry",
          stylers: [{ color: "#2f3948" }],
        },
        {
          featureType: "transit.station",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#17263c" }],
        },
        {
          featureType: "water",
          elementType: "labels.text.fill",
          stylers: [{ color: "#515c6d" }],
        },
        {
          featureType: "water",
          elementType: "labels.text.stroke",
          stylers: [{ color: "#17263c" }],
        },
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
              // @ts-ignore
              styles: darkModeStyles,
            });
            addCurrentLocationMarker(userLocation);
          },
          (error) => {
            // Se a localização não for aceita, inicie o mapa com a localização padrão
            const defaultLocation = { lat: -14.235, lng: -51.9253 };
            map.value = new google.maps.Map(mapDiv.value!, {
              center: defaultLocation,
              zoom: 3,
              minZoom: 4, // Limite inferior de zoom
              // @ts-ignore
              styles: darkModeStyles,
            });
            // Não chama addMarker se a geolocalização falhar
          }
        );
      } else {
        const defaultLocation = { lat: 2.8266, lng: -60.6623 };
        map.value = new google.maps.Map(mapDiv.value!, {
          center: defaultLocation,
          zoom: 10,
          minZoom: 4,
          // @ts-ignore
          styles: darkModeStyles,
        });
      }
    }

    const initializeMap = () => {
      circleDetails.value = {
        id: "",
        name: "",
        type: "CIRCLE",
        center: ``,
        radius: ``,
      };

      if (markers.length > 0) {
        clearMarkers();
        removeCircle();
      }

      let estilo = null;

      if (isDarkTheme.value) {
        estilo = updateDarkMode;
      }

      const checkStreetView = () => {
        const streetView = map.value.getStreetView(); // Obtém o Street View associado ao mapa
        return streetView.getVisible(); // Retorna true se o Street View estiver ativo
      };

      // Função para atualizar a variável reativa
      const updateStreetViewState = () => {
        isStreetViewActive.value = checkStreetView();
      };

      const logStreetViewState = () => {
        updateStreetViewState();
        if (checkStreetView()) {

        } else {

        }
      };

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
              styles: estilo, // @ts-ignore
            });

            // Verifica e loga o estado do Street View
            logStreetViewState();

            // Escuta mudanças no estado do Street View
            const streetView = map.value.getStreetView();
            streetView.addListener("visible_changed", logStreetViewState);

            addCurrentLocationMarker(userLocation);
          },
          (error) => {
            // Localização padrão caso o usuário não permita acesso à localização
            const defaultLocation = { lat: -14.235, lng: -51.9253 };
            map.value = new google.maps.Map(mapDiv.value!, {
              center: defaultLocation,
              zoom: 3,
              minZoom: 4, // Limite inferior de zoom
              styles: estilo, // @ts-ignore
            });

            // Verifica e loga o estado do Street View
            logStreetViewState();

            const streetView = map.value.getStreetView();
            streetView.addListener("visible_changed", logStreetViewState);
          }
        );
      } else {
        const defaultLocation = { lat: 2.8266, lng: -60.6623 };
        map.value = new google.maps.Map(mapDiv.value!, {
          center: defaultLocation,
          zoom: 10,
          minZoom: 4,
          styles: estilo, // @ts-ignore
        });

        // Verifica e loga o estado do Street View
        logStreetViewState();

        const streetView = map.value.getStreetView();
        streetView.addListener("visible_changed", logStreetViewState);
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

    const centerMapOnMarker = (position: google.maps.LatLngLiteral, zoom: number) => {
      if (map.value) {
        map.value.panTo(position);
        map.value.setZoom(zoom);
      }
    };

    const clearMarkers = () => {
      markers.forEach((marker) => {
        marker.setMap(null); // Remove o marcador do mapa
      });
      markers = []; // Limpa o array de marcadores
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
                    coords: { latitude: coords[1], longitude: coords[0] },
                  });
                }
              });
            }
          });
          return { success: true, data: geoJsonResponses }
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          if (error.response.status === 404) {

            showSnackbar(error.response.data.message, "error");
            return { success: false, data: [geoJsonResponses] }
          }
        }
      } finally {
        eventBus.emit("stopIsLoading");
      }
    };

    const handleStopPointsOnMap = (points: any) => {
      clearMarkers();
      points.coords.forEach((item: any) => {
        plotPointOnMap({
          userName: points.userName,
          device: points.device,
          coords: { latitude: item.latitude, longitude: item.longitude },
        });
      });
      eventBus.emit("stopIsLoading");
    };

    const handleRoutesReceived = (routes: any) => {
      clearMarkers();

      // Remove as rotas (linhas) existentes
      routeLines.forEach(line => line.setMap(null));
      routeLines = []; // Limpa a lista de linhas

      let totalLat = 0;
      let totalLng = 0;
      let pointCount = 0;

      // Variáveis para calcular as extremidades (bounding box)
      let minLat = Infinity;
      let maxLat = -Infinity;
      let minLng = Infinity;
      let maxLng = -Infinity;

      routes.routes.forEach((route: any) => {
        const routePath: { latitude: number; longitude: number }[] = [];

        route.coordinates.forEach((coord: any, index: number) => {
          const position = { latitude: coord.latitude, longitude: coord.longitude };
          routePath.push(position);

          // Soma os pontos para cálculo do centro
          totalLat += coord.latitude;
          totalLng += coord.longitude;
          pointCount++;

          // Atualiza os limites (bounding box)
          minLat = Math.min(minLat, coord.latitude);
          maxLat = Math.max(maxLat, coord.latitude);
          minLng = Math.min(minLng, coord.longitude);
          maxLng = Math.max(maxLng, coord.longitude);

          let color = "#000B62";
          let scale = 4;
          let label = null;

          if (index === 0) {
            color = "green";
            scale = 8;
            label = { text: "I", color: "white", fontSize: "12px" };
          }

          if (index === route.coordinates.length - 1) {
            color = "red";
            scale = 8;
            label = { text: "F", color: "white", fontSize: "12px" };
          }

          plotPointRouteOnMap(
            {
              device: `Data: ${coord.date}`,
              coords: position,
            },
            color,
            scale,
            label
          );
        });

        // Converte os pontos da rota para o formato Google Maps
        const googleRoutePath = routePath.map(point => ({
          lat: point.latitude,
          lng: point.longitude,
        }));

        // Configuração inicial do símbolo
        const lineSymbol = {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 5,
          strokeColor: "#FF0000",
        };

        // Desenha a linha da rota no mapa
        const routeLine = new google.maps.Polyline({
          path: googleRoutePath,
          geodesic: true,
          strokeColor: '#000B62',
          strokeOpacity: 1.0,
          strokeWeight: 2,
          icons: [],
        });
        routeLine.setMap(map.value);
        routeLines.push(routeLine);

        let count = 0;
        let animationFrameId: number | null = null; // Armazena o ID da animação
        let isPaused = true; // Inicia como pausado
        let speedFactor = 1.0; // Velocidade padrão

        eventBus.on('speedChange', (speed: number) => {
          speedFactor = speed;
        });

        const routeLength = google.maps.geometry.spherical.computeLength(routeLine.getPath());
        const speed = 11; // Velocidade em metros por segundo
        const step = (speed / routeLength) * 100; // Incremento proporcional ao comprimento da rota


        // Função para atualizar o deslocamento do símbolo
        const animate = () => {

          // Interrompe imediatamente se pausado
          if (isPaused) return;
          count += step * speedFactor;

          // Verifica se o deslocamento atingiu ou passou de 100%
          if (count >= 100) {
            pauseAnimation();
            count = 100;
            eventBus.emit('updateButtonState', 'pause');
            eventBus.emit('animationEnded');
            return;
          }

          const icons = routeLine.get("icons");
          if (icons.length > 0) {
            icons[0].offset = `${count}%`;
            routeLine.set("icons", icons);
          }
          animationFrameId = requestAnimationFrame(animate);
        };

        // Função para mostrar o ícone
        const showIcon = () => {
          routeLine.set("icons", [
            {
              icon: lineSymbol,
              offset: `${count}%`,
            },
          ]);
        };

        // Inicia a animação
        const startAnimation = () => {
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId); // Cancela qualquer animação anterior
          }
          isPaused = false; // Retira o estado de pausa
          if (count >= 100) {
            count = 0; // Reinicia o deslocamento se estava no final
          }

          animate(); // Garante que a animação seja iniciada
        };

        // Pausa a animação
        const pauseAnimation = () => {
          isPaused = true;
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId); // Cancela a animação
            animationFrameId = null;
          }

        };

        // Adicionando métodos de controle de play/pause à `routeLine`
        routeLine.play = () => {
          if (!isPaused && count >= 100) return; // Impede múltiplos inícios ou reinício antes do fim

          showIcon() // Garante que o ícone esteja visível
          startAnimation(); // Reinicia a animação
        };

        routeLine.pause = () => {
          if (isPaused) return;

          pauseAnimation()
        };

        // Adicionando o controle de play/pause via eventBus
        eventBus.on('routePlay', () => {

          routeLine.play();
        });

        eventBus.on('routePause', () => {

          routeLine.pause();
        });
      });

      // Ajusta o zoom dinamicamente
      if (pointCount > 0) {
        const centerLat = totalLat / pointCount;
        const centerLng = totalLng / pointCount;

        const latDiff = maxLat - minLat;
        const lngDiff = maxLng - minLng;
        const maxDiff = Math.max(latDiff, lngDiff);

        // Cálculo ajustado para um zoom mais próximo
        const zoomBase = 17; // Base mais alta para aproximação inicial
        const zoomAdjustment = Math.log2(maxDiff + 1) * 1.5; // Multiplicador reduz o impacto
        const zoomLevel = Math.floor(zoomBase - zoomAdjustment);

        map.value.setCenter({ lat: centerLat, lng: centerLng });
        map.value.setZoom(Math.max(2, Math.min(zoomLevel, 21))); // Limita o zoom entre 2 e 21
      }

      eventBus.emit("stopIsLoading");
    };

    function toggleTheme(): void {
      vuetify.theme.global.name.value = isDarkTheme.value ? "dark" : "light";
    };

    // Array para armazenar as coordenadas diretamente
    const coordinates: { lat: number; lng: number }[] = [];


    const plotPointRouteOnMap = (userData: any, color: string, scale: number, label: any) => {
      const position = {
        lat: userData.coords.latitude,
        lng: userData.coords.longitude,
      }; // Coordenadas

      // Salva a coordenada no array
      coordinates.push(position);

      const marker = new google.maps.Marker({
        position,
        map: map.value,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: scale,
          fillColor: color,
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "#ffffff",
        },
        label: label,
      });

      // Adiciona o marcador no array global para controle
      markers.push(marker);

      const infoWindow = new google.maps.InfoWindow({
        content: `<div style="color: black;">
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

      // Calcula os limites (bounding box) da rota
      let minLat = Infinity;
      let maxLat = -Infinity;
      let minLng = Infinity;
      let maxLng = -Infinity;

      coordinates.forEach(coord => {
        if (coord.lat < minLat) minLat = coord.lat;
        if (coord.lat > maxLat) maxLat = coord.lat;
        if (coord.lng < minLng) minLng = coord.lng;
        if (coord.lng > maxLng) maxLng = coord.lng;
      });

      // Calcula o centro do mapa
      const centerLat = (minLat + maxLat) / 2;
      const centerLng = (minLng + maxLng) / 2;

      // Ajusta dinamicamente o zoom
      const latDiff = maxLat - minLat;
      const lngDiff = maxLng - minLng;
      const maxDiff = Math.max(latDiff, lngDiff);

      const zoomBase = 17; // Base inicial para aproximação
      const zoomAdjustment = Math.log2(maxDiff + 1) * 1.5; // Ajuste dinâmico
      const zoomLevel = Math.max(2, Math.min(Math.floor(zoomBase - zoomAdjustment), 21)); // Limita o zoom entre 2 e 21

      // Reposiciona o mapa
      const positionToZoom = {
        lat: centerLat,
        lng: centerLng,
      };

      centerMapOnMarker(positionToZoom, zoomLevel);
    };


    const plotPointOnMap = (userData: any) => {
      const position = {
        lat: userData.coords.latitude,
        lng: userData.coords.longitude,
      }; // Coordenadas

      // Gera as iniciais do usuário
      const initials = userData.userName
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

      // Adiciona o marcador no array global para controle
      markers.push(marker);

      const infoWindow = new google.maps.InfoWindow({
        content: `<div style="color: black;">
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

      centerMapOnMarker(position, 15);
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
          } else {
            circleDetails.value.id = `${id}`;
          }
          circleDetails.value.center = `${center.lat}, ${center.lng}`;
          circleDetails.value.radius = `${radius}`;

          circleForConsult();

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



      // Fecha o dialog inicialmente
      dialog.value = false;

      // Inicia o modo de desenho de círculo
      if (drawingManager.value && map.value) {
        drawingManager.value.setDrawingMode(
          google.maps.drawing.OverlayType.CIRCLE
        );
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



          // Armazenando os dados no localStorage
          localStorage.setItem(
            "circleDetailsCached",
            JSON.stringify(circleDetails.value)
          );

          // Reabre o dialog após o círculo ser desenhado
          dialog.value = true;
        }
      };

      // Adiciona o listener para overlaycomplete
      google.maps.event.addListener(
        drawingManager.value,
        "overlaycomplete",
        overlayCompleteListener
      );


    };

    const circleForConsult = async () => {
      const payload = {
        name: circleDetails.value.name,
        type: "CIRCLE",
        center: {
          longitude: parseFloat(circleDetails.value.center.split(", ")[1]),
          latitude: parseFloat(circleDetails.value.center.split(", ")[0])
        },
        radius: parseFloat(circleDetails.value.radius)
      };

      // Armazenando os dados no localStorage
      localStorage.setItem('cachedCircleDetails', JSON.stringify(payload));

    };

    const saveCircle = async () => {
      const cached = localStorage.getItem("circleDetailsCached");
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
      };

      if (cachedDetails) {
        updateZone.id = cachedDetails.id;
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



      try {
        if (!Number.isInteger(parseInt(updateZone.id, 10))) {
          const response = await axios.post(
            "http://localhost:8080/zone",
            payload
          );


        } else {
          const response = await axios.put(
            "http://localhost:8080/zone",
            updateZone
          );

        }
        showSnackbar("Zona salva com sucesso!", "success");
        dialog.value = false;

        eventBus.emit("reloadGeoArea");

        circleDetails.value.name = "Zona 1"

        localStorage.removeItem("circleDetailsCached")
        if (isDarkTheme.value) {
          initializeMapDark()
        } else {
          initializeMap()
        }

        setTimeout(() => {
          window.location.reload();
        }, 500); // 2000 ms = 2 segundos

      } catch (error) {

        localStorage.removeItem("circleDetailsCached")
        showSnackbar(error.response.data.message, "error");
      }

    };

    const deleteCircle = async () => {
      const cached = localStorage.getItem("circleDetailsCached");
      // @ts-ignore
      const cachedDetails = JSON.parse(cached);

      const payload = {
        id: circleDetails.value.id,
      };

      if (cachedDetails) {
        payload.id = cachedDetails.id;
      }

      try {
        const response = await axios.delete("http://localhost:8080/zone", {
          data: payload,
        });


        showSnackbar("Zona deletada com sucesso!", "success");

        dialog.value = false;
        removeCircle();
        eventBus.emit("reloadGeoArea");
        localStorage.removeItem("circleDetailsCached")
        circleDetails.value.name = "Zona 1"

        if (isDarkTheme.value) {
          initializeMapDark()
        } else {
          initializeMap()
        }
        setTimeout(() => {
          window.location.reload();
        }, 500); // 2000 ms = 2 segundos
      } catch (error) {

        showSnackbar("Erro ao deletar a zona. Tente novamente.", "error");
      }


    };

    const removeCircle = (forceRemove?: boolean) => {
      if (!forceRemove && circleDetails.value.id) {

        return;
      }


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
      }
      localStorage.removeItem("circleDetailsCached");
      localStorage.removeItem("cachedCircleDetails");
      eventBus.emit("clearSelectedGeoArea");
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

      circleDetails.value = {
        id: data.id,
        name: data.name,
        type: "CIRCLE",
        center: `${data.latitude}, ${data.longitude}`,
        radius: `${data.radius}`,
      };

      drawCircleOnMap(data.latitude, data.longitude, data.radius);
    };

    const togglePanel = () => {
      isPanelOpen.value = !isPanelOpen.value;
    };

    // Observando o valor de `isDarkTheme`
    watch(isPanelOpen, (newValue) => {

    });

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

      isDarkTheme,
      themeClass,
      darkMode,
      updateDarkMode,
      initializeMapDark,

      snackbar,
      snackbarColor,
      snackbarMessage,
      showSnackbar,

      drawCircleOnMap,
      handleGeographicAreaConsult,
      handleStopPointsOnMap,
      handleRoutesReceived,

      isPanelOpen,
      togglePanel,
      isStreetViewActive,
      isPlaying,
    };
  },
};
</script>

<style scoped></style>
