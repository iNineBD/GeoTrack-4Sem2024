<template>
  <!-- Contêiner onde o mapa será renderizado -->
  <div id="map" class="map"></div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'; // Importação de funcionalidades do Vue
import 'ol/ol.css'; // CSS padrão do OpenLayers
import { Map, View } from 'ol'; // Importação de classes principais para o mapa e visão
import TileLayer from 'ol/layer/Tile'; // Importação da camada de tiles
import OSM from 'ol/source/OSM'; // Fonte de dados do OpenStreetMap
import { fromLonLat } from 'ol/proj'; // Função para converter coordenadas de latitude/longitude para a projeção utilizada
import VectorLayer from 'ol/layer/Vector'; // Camada vetorial para adicionar marcadores
import VectorSource from 'ol/source/Vector'; // Fonte vetorial para armazenar os recursos dos marcadores
import Feature from 'ol/Feature'; // Classe que define um recurso (ponto no mapa)
import Point from 'ol/geom/Point'; // Geometria de ponto para representar a localização dos marcadores
import Style from 'ol/style/Style'; // Classe para definir o estilo dos recursos
import Icon from 'ol/style/Icon'; // Classe para usar ícones personalizados
import Fill from 'ol/style/Fill'; // Preenchimento do estilo
import Stroke from 'ol/style/Stroke'; // Traço do estilo (bordas)
import Text from 'ol/style/Text'; // Estilo de texto para exibir iniciais nos marcadores
import axios from 'axios'; // Biblioteca para realizar chamadas HTTP

// Interface para armazenar os dados do avatar, incluindo a URL da imagem
interface Avatar {
  fullName: string;
  coords: [number, number];
  color: string;
  initials: string;
  avatarUrl: string; // Adiciona o campo avatarUrl para armazenar a URL da imagem
}

interface GeoJsonData {
  user: string;
  device: string;
  geojson: {
    type: string;
    features: Array<{
      type: string;
      properties: Record<string, any>;
      geometry: {
        type: string;
        coordinates: number[];
      };
    }>;
  };
}

export default defineComponent({
  name: 'MapView',
  setup() {
    const map = ref<Map | null>(null); // Referência ao objeto do mapa
    const vectorSource = new VectorSource(); // Fonte de dados para os marcadores
    const geoJsonData = ref<GeoJsonData | null>(null); // Armazena os dados GeoJSON retornados pela API

    // Função para inicializar o mapa
    const initializeMap = () => {
      map.value = new Map({
        target: 'map', // Conecta o mapa ao div com o id 'map'
        layers: [
          // Camada de tiles (OpenStreetMap) e camada de marcadores (vetorial)
          new TileLayer({
            source: new OSM(), // Fonte OpenStreetMap
          }),
          new VectorLayer({
            source: vectorSource, // Camada vetorial para exibir os marcadores
          }),
        ],
        view: new View({
          center: fromLonLat([-45.88671, -23.21978]), // Converte coordenadas lat/lon para projeção EPSG:3857
          zoom: 3, // Define o nível inicial de zoom
        }),
      });
    };

    // Função para buscar dados GeoJSON da API
    const fetchGeoJsonData = async () => {
      try {
        const requestData = {
          user: 0, // Parâmetros para a chamada da API
          userName: "André",
          device: 2,
          userDevice: "string",
          startDate: "2024-08-24",
          finalDate: "2024-09-24"
        };
        const response = await axios.post('http://localhost:8080/stoppoint/find', requestData);
        geoJsonData.value = {
          user: response.data.user, // Armazena o nome do usuário retornado pela API
          device: response.data.device, // Armazena o ID do dispositivo retornado
          geojson: response.data.geoJsonDTO, // Armazena os dados GeoJSON retornados
        };

        // Adiciona os marcadores ao mapa com base nos dados GeoJSON
        geoJsonData.value.geojson.features.forEach((feature) => {
          const coords = feature.geometry.coordinates as [number, number]; // Obtém as coordenadas do recurso
          const transformedCoords = fromLonLat(coords); // Converte coordenadas lat/lon para a projeção do mapa

          const marker = new Feature({
            geometry: new Point(transformedCoords), // Cria um ponto no mapa com as coordenadas transformadas
          });

          // Aqui você define a URL do avatar gerada pelo AvatarMakers ou qualquer outro serviço
          const avatar: Avatar = {
            initials: geoJsonData.value?.user.substring(0, 2).toUpperCase() || 'NA', // Inicial do usuário
            fullName: geoJsonData.value?.user || 'Unknown', // Nome completo do usuário
            coords: coords, // Coordenadas
            color: 'primary', // Cor primária do marcador
            avatarUrl: `https://avatars.dicebear.com/api/initials/${geoJsonData.value.user}.svg`, // URL do avatar (baseado nas iniciais do usuário)
          };

          // Define o estilo do marcador para usar o avatarUrl como imagem de ícone
          marker.setStyle(new Style({
            image: new Icon({
              src: avatar.avatarUrl, // Usa a URL do avatar gerada
              scale: 0., // Ajuste o tamanho do avatar se necessário
              anchor: [0.5, 1], // Posição do ícone (ajuste conforme necessário)
            }),
            text: new Text({
              text: avatar.initials, // Exibe as iniciais como fallback
              fill: new Fill({ color: 'white' }),
              stroke: new Stroke({
                color: 'black',
                width: 2,
              }),
              offsetY: -15, // Posição do texto
              font: '12px Arial', // Fonte do texto
            }),
          }));

          // Adiciona o marcador à camada vetorial
          vectorSource.addFeature(marker);
        });
      } catch (error) {
        console.error('Error fetching points from the backend:', error); // Exibe o erro caso a requisição falhe
      }
    };

    // Executa a inicialização do mapa e busca de dados quando o componente é montado
    onMounted(() => {
      initializeMap(); // Inicializa o mapa
      fetchGeoJsonData(); // Faz a chamada à API para obter os dados
    });

    return { map }; // Retorna o objeto do mapa para o template
  },
});
</script>

<style scoped>
/* Define o tamanho do mapa para ocupar toda a tela */
.map {
  width: 100%;
  height: 100vh;
}
</style>

