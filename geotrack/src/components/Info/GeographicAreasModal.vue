<template>
  <div class="modal-content">
    <h1 class="modal-title">Áreas Geográficas</h1>

    <!-- Página 1 -->
    <div v-if="currentPage === 1">
      <p>
        Sejam bem-vindos ao GeoTrack! Essa página está destinada a solucionar
        possíveis dúvidas sobre como utilizar nossa aplicação. Aqui temos o filtro de Áreas Geográficas, onde você pode criar, editar, deletar Áreas Geograficas e buscar pelos usuários que contém pontos de parada dentro de uma área específica.
      </p>
      <div class="image-container">
        <img
          src="../../assets/infoImgs/GeographicAreasModal/AGInterface.png"
          alt="Menu Áreas Geográficas"
        />
        <p class="image-caption">Menu Áreas Geográficas</p>
      </div>
    </div>

    <!-- Página 2 -->
    <div v-else-if="currentPage === 2">
      <p>
        Para criar uma nova Área Geográfica, clique no ícone (+) e
        desenhe um círculo no mapa. Após verificar os detalhes, clique em
        "Salvar" para registrar a área criada.
      </p>
      <div class="image-grid">
        <div class="image-item">
          <img
            src="../../assets/infoImgs/GeographicAreasModal/AGCriarArea.png"
            alt="Criação de Área Geográfica"
          />
          <p class="image-caption">Exemplo de Criação de Área Geográfica</p>
        </div>
        <div class="image-item">
          <img
            src="../../assets/infoImgs/GeographicAreasModal/AGSalvarZona.png"
            alt="Salvando Área Geográfica"
          />
          <p class="image-caption">Salvando Área Geográfica</p>
        </div>
      </div>
    </div>

    <!-- Página 3 -->
    <div v-else-if="currentPage === 3">
      <p>
        Com a Área Geográfica ativa, selecione um usuário e use os filtros
        rápidos de data ou o calendário para escolher um período de até 31 dias.
        Após isso, clique em "Consultar" e aguarde os resultados.
      </p>
      <div class="image-grid">
        <div class="image-item">
          <img
            src="../../assets/infoImgs/GeographicAreasModal/AGSelecionarUsuario.png"
            alt="Selecionar Usuário"
          />
          <p class="image-caption">Selecionar Usuário</p>
        </div>
        <div class="image-item">
          <img
            src="../../assets/infoImgs/GeographicAreasModal/AGSelecionarData.png"
            alt="Selecionar Data"
          />
          <p class="image-caption">Selecionar Data</p>
        </div>
      </div>
    </div>

    <!-- Página 4 -->
    <div v-else-if="currentPage === 4">
      <p>
        Aqui você vê o resultado da consulta. Os Pontos de Parada são exibidos
        no mapa, e abaixo do menu, você encontrará os detalhes sobre onde o usuário passou, a data e quanto tempo ficou
        parado naquele lugar.
      </p>
      <div class="image-container">
        <img
          src="../../assets/infoImgs/GeographicAreasModal/AGDados.png"
          alt="Dados na Tela"
        />
        <p class="image-caption">Dados na Tela</p>
      </div>
    </div>

    <!-- Navegação -->
    <div class="modal-navigation">
      <v-btn
        :disabled="currentPage === 1"
        @click="currentPage--"
        class="nav-btn"
      >
        Anterior
      </v-btn>
      <v-btn
        :disabled="currentPage === totalPages"
        @click="currentPage++"
        class="nav-btn"
      >
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
const totalPages = 4;
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
