<template>
  <Sidebar @consult="fetchGeoJsonData" />
  <div ref="mapDiv" style="height: 100vh; width: 100%"></div>
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

    return { map, mapDiv, fetchGeoJsonData };
  },
};
</script>

<style scoped></style>
