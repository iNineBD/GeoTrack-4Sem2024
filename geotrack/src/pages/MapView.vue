<template>
  <v-container fluid style="padding: 0;">
    <v-row>
      <v-col v-if="$route.name === 'Filter'" cols="4">
        <Filter @consult="fetchGeoJsonData" />
      </v-col>
      <v-col :cols="$route.name === 'Filter' ? 8 : 12">
        <div ref="mapDiv" style="height: 100vh; width: 100%;"></div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { onMounted, ref } from 'vue';
import axios from 'axios';

interface GeoJsonFeature {
  geometry: {
    coordinates: [number, number];
  };
}

interface FilterData {
  user: string;
  userName: string;
  device: string;
  userDevice: string;
  startDate: string;
  finalDate: string;
}

export default {
  name: 'MapView',
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
            }
          );
        } else {
          const defaultLocation = { lat: 2.8266, lng: -60.6623 };
          map.value = new google.maps.Map(mapDiv.value!, {
            center: defaultLocation,
            zoom: 12,
            minZoom: 4,  // Limite inferior de zoom
          });
          addMarker(defaultLocation);
        }
      }
    });


    const addMarker = (position: google.maps.LatLngLiteral) => {
      if (map.value) {
        new google.maps.Marker({
          position,
          map: map.value,
          title: 'Localização',
        });

        centerMapOnMarker(position);
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
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: '#ffffff',
          },
          title: 'Sua Localização Atual',
        });
      }
    };

    const centerMapOnMarker = (position: google.maps.LatLngLiteral) => {
      if (map.value) {
        map.value.panTo(position);
        map.value.setZoom(15);
      }
    };

    const createCustomMarkerIcon = (userName: string) => {
      const initials = userName
        .split(' ')
        .slice(0, 2)
        .map((name) => name[0])
        .join('');

      const svgMarker = `
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 50 50">
          <circle cx="15" cy="15" r="15" fill="#000B62" />
          <text x="15" y="15" text-anchor="middle" fill="white" font-size="12px" font-family="Arial" dy=".3em">${initials}</text>
        </svg>`;

      return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgMarker)}`;
    };

    const fetchGeoJsonData = async (filterData: FilterData) => {
      try {
        const requestData = { ...filterData };
        console.log('dados recebidos:', requestData);

        const response = await axios.post('http://localhost:8080/stoppoint/find', requestData);
        console.log('response.data:', response.data);

        const geoJsonDTO = response.data.geoJsonDTO || {};
        console.log('geoJsonDTO:', geoJsonDTO);

        if (geoJsonDTO.features && geoJsonDTO.features.length > 0) {
          geoJsonDTO.features.forEach((feature: GeoJsonFeature) => {
            const coords = feature.geometry.coordinates;
            console.log('Coordenadas:', coords);
            if (coords && coords.length >= 2) {
              const position = { lat: coords[1], lng: coords[0] };

              const customIcon = createCustomMarkerIcon(filterData.userName);

              const marker = new google.maps.Marker({
                position,
                map: map.value,
                icon: {
                  url: customIcon,
                  scaledSize: { width: 50, height: 50 },
                },
                title: `Usuário: ${filterData.user}, Dispositivo: ${filterData.device}, Coordenadas: ${position.lat}, ${position.lng}`,
              });

              const infoWindow = new google.maps.InfoWindow({
                content: `<div>
                            <strong>Usuário:</strong> ${filterData.userName}<br>
                            <strong>Dispositivo:</strong> ${filterData.userDevice}<br>
                            <strong>Coordenadas:</strong> ${position.lat}, ${position.lng}
                           </div>`,
              });

              google.maps.event.addListener(marker, 'click', () => {
                infoWindow.open(map.value!, marker);
              });

              google.maps.event.addListener(map.value, 'click', () => {
                infoWindow.close();
              });

              centerMapOnMarker(position);
            }
          });
        } else {
          console.warn('Nenhum dado GeoJSON disponível.');
        }
      } catch (error) {
        console.error('Erro ao buscar os dados GeoJSON:', error);
      }
    };

    return { map, mapDiv, fetchGeoJsonData };
  },
};
</script>

<style scoped></style>
