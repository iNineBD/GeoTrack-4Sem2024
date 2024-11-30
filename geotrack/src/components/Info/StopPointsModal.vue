<template>
  <div class="modal-content">
    <!-- Página 1 -->
    <div v-if="currentPage === 1">
      <h1 class="modal-title">Pontos de Parada</h1>
      <p>
        Sejam bem-vindos ao GeoTrack! Essa página está destinada a solucionar
        possíveis dúvidas sobre como utilizar nossa aplicação. A imagem abaixo é
        referente ao filtro de Pontos de Parada, onde você pode buscar os Pontos
        de Parada de até cinco usuários diferentes dentro de um período de
        31 dias. Avance para a próxima tela para entender melhor como
        funciona!
      </p>
      <div class="image-container">
        <img
          src="../../assets/infoImgs/StopPointsModal/interfaceClean.png"
          alt="Menu Pontos de Parada"
        />
        <p class="image-caption">Menu Pontos de Parada</p>
      </div>
    </div>

    <!-- Página 2 -->
    <div v-else-if="currentPage === 2">
      <h1 class="modal-title">Pontos de Parada</h1>
      <p>
        Para iniciar a busca, selecione até cinco usuários. Em seguida, use os
        filtros de data ou escolha um período de até 31 dias no calendário.
        Depois, clique em "Consultar" e aguarde os resultados.
      </p>
      <div class="image-grid">
        <div class="image-item">
          <p class="image-caption">Selecionar Usuários</p>
          <img
            src="../../assets/infoImgs/StopPointsModal/selecionarUsuarios.png"
            alt="Selecionar Usuários"
          />
        </div>
        <div class="image-item">
          <p class="image-caption">Selecionar Data</p>
          <img
            src="../../assets/infoImgs/StopPointsModal/selecionarData.png"
            alt="Selecionar Data"
          />
        </div>
      </div>
    </div>

    <!-- Página 3 -->
    <div v-else-if="currentPage === 3">
      <h1 class="modal-title">Pontos de Parada</h1>
      <p>
        Aqui você vê o resultado da consulta. Os Pontos de Parada são exibidos
        no mapa, e abaixo do menu, você encontrará os detalhes, incluindo o nome
        do usuário, identificação do dispositivo e todos os pontos encontrados
        no período selecionado.
      </p>
      <div class="image-grid">
        <div class="image-item">
          <p class="image-caption">Dados na Tela</p>
          <img
            src="../../assets/infoImgs/StopPointsModal/dadosNaTela.png"
            alt="Dados na Tela"
          />
        </div>
        <div class="image-item">
          <p class="image-caption">Informações Pontos de Parada</p>
          <img
            src="../../assets/infoImgs/StopPointsModal/informacoesPontosParada.png"
            alt="Informações Pontos de Parada"
          />
        </div>
      </div>
    </div>

    <!-- Botões de navegação -->
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
