<template>
  <div>
    <!-- Botão que abre a modal -->
    <v-btn
      class="tooltip-btn"
      title="Dúvidas?"
      color="primary"
      icon="mdi-help-circle"
      @click="showModal = true"
    >
    </v-btn>

    <!-- Modal -->
    <v-dialog v-model="showModal" persistent max-width="1000px">
      <template #default>
        <div class="modal-content">
          <!-- Página 1 -->
          <div v-if="currentPage === 1">
            <h1 class="modal-title">Pontos de Parada</h1>
            <p>
              Sejam bem-vindos ao GeoTrack! Essa página está destinada a
              solucionar possíveis dúvidas sobre como utilizar nossa aplicação.
              A imagem abaixo é referente ao filtro de Pontos de Parada, onde
              você pode buscar os Pontos de Parada de até cinco usuários
              diferentes dentro de um período de trinta dias. Avance para a
              próxima tela para entender melhor como funciona!
            </p>
            <div class="image-container">
              <img
                src="../../assets/infoImgs/interfaceClean.jpg"
                alt="Menu Pontos de Parada"
              />
              <p class="image-caption">Menu Pontos de Parada</p>
            </div>
          </div>

          <!-- Página 2 -->
          <div v-else-if="currentPage === 2">
            <h1 class="modal-title">Pontos de Parada</h1>
            <p>
              Para iniciar a busca, selecione até cinco usuários. Depois utilize
              algum de nossos filtros rápidos de data ou selecione no calendário
              um período de até trinta dias. Feito isso, clique em "Consultar" e
              aguarde o retorno das informações.
            </p>
            <div class="image-grid">
              <div class="image-item">
                <p class="image-caption">Selecionar Usuários</p>
                <img
                  src="../../assets/infoImgs/selecionarUsuarios.png"
                  alt="Selecionar Usuários"
                />
              </div>
              <div class="image-item">
                <p class="image-caption">Selecionar Data</p>
                <img
                  src="../../assets/infoImgs/selecionarData.png"
                  alt="Selecionar Data"
                />
              </div>
            </div>
          </div>

          <!-- Página 3 -->
          <div v-else-if="currentPage === 3">
            <h1 class="modal-title">Pontos de Parada</h1>
            <p>
              Este é um exemplo do retorno de uma consulta. Os Pontos de Parada
              aparecem no mapa e logo abaixo do menu abre uma sessão de detalhes
              com o nome do Usuário, identificação do dispositivo e todos os
              Pontos encontrados dentro daquele período de tempo determinado.
            </p>
            <div class="image-grid">
              <div class="image-item">
                <p class="image-caption">Dados na Tela</p>
                <img
                  src="../../assets/infoImgs/dadosNaTela.png"
                  alt="Dados na Tela"
                />
              </div>
              <div class="image-item">
                <p class="image-caption">Informações Pontos de Parada</p>
                <img
                  src="../../assets/infoImgs/informacoesPontosParada.png"
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
          <v-btn @click="showModal = false">Fechar</v-btn>
        </div>
      </template>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const showModal = ref(false);
const currentPage = ref(1);
const totalPages = 3;
</script>

<style scoped>
.tooltip-btn {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  z-index: 10;
}

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

/* Estilo para o texto */
p {
  font-size: 18px;
  line-height: 1.6;
  color: #444;
}

/* Grade para imagens lado a lado */
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
