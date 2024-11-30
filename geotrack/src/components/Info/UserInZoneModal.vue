<template>
  <div class="modal-content">
    <h1 class="modal-title">Usuários nas Zonas</h1>

    <!-- Página 1 -->
    <div v-if="currentPage === 1">
      <p>
        Sejam bem-vindos ao GeoTrack! Essa página está destinada a solucionar
        possíveis dúvidas sobre como utilizar nossa aplicação. A imagem abaixo é
        referente ao filtro de pesquisa de usuários em zonas, onde você pode visualizar os usuários que passaram dentro
        de uma área específica.
      </p>
      <div class="image-container">
        <img src="../../assets/infoImgs/UserInZoneModal/telaUserInZone.png" alt="Menu Usuários nas Zonas" />
        <p class="image-caption">Menu Usuários nas Zonas</p>
      </div>
    </div>

    <!-- Página 2 -->
    <div v-else-if="currentPage === 2">
      <p>
        Quando você seleciona uma das Áreas Geográficas ela aparecerá no mapa,
        clicando sobre ela você verá opções como "Editar" e "Deletar".
      </p>
      <div class="image-grid">
        <div class="image-item">
          <img src="../../assets/infoImgs/UserInZoneModal/areas.png" alt="Selecionando Área Geográfica" />
          <p class="image-caption">Selecionando Área Geográfica</p>
        </div>
        <div class="image-item">
          <img src="../../assets/infoImgs/GeographicAreasModal/AGDisplayZona.png" alt="Área Geográfica em Display" />
          <p class="image-caption">Área Geográfica em Display</p>
        </div>
      </div>
    </div>

    <!-- Página 4 -->
    <div v-else-if="currentPage === 3">
      <p>
        Aqui você vê o resultado da consulta. Todos os usuários que passaram nesta área são exibidos
        abaixo do menu.
      </p>
      <div class="image-container">
        <img src="../../assets/infoImgs/UserInZoneModal/dados.png" alt="Dados na Tela" />
        <p class="image-caption">Dados na Tela</p>
      </div>
    </div>

    <!-- Navegação -->
    <div class="modal-navigation">
      <v-btn :disabled="currentPage === 1" @click="currentPage--" class="nav-btn">
        Anterior
      </v-btn>
      <v-btn :disabled="currentPage === totalPages" @click="currentPage++" class="nav-btn">
        Próximo
      </v-btn>
    </div>

    <!-- Botão de fechar -->
    <v-btn @click="$emit('close')">Fechar</v-btn>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const currentPage = ref(1);
const totalPages = 3;
</script>

<style scoped>
.modal-content {
  background: rgba(255, 255, 255, 0.9);
  padding: 20px;
  border-radius: 10px;
  text-align: center;
}

.modal-title {
  font-size: 24px;
  margin-bottom: 16px;
  color: #333;
}

.modal-navigation {
  display: flex;
  justify-content: space-between;
  margin: 20px 0;
}

.nav-btn {
  margin: 0 10px;
}

p {
  font-size: 18px;
  line-height: 1.6;
  color: #444;
}

.image-grid {
  display: flex;
  justify-content: space-around;
  gap: 20px;
  margin-top: 20px;
}

.image-item {
  text-align: center;
}

.image-container img,
.image-item img {
  width: 90%;
  max-width: 600px;
  max-height: 400px;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.image-caption {
  font-size: 16px;
  color: #666;
  margin-top: 8px;
}
</style>
