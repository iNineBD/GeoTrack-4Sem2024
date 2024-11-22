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
    <v-dialog v-model="showModal" persistent max-width="600px">
      <template #default>
        <div class="modal-content">
          <h1 class="modal-title">Informações</h1>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Nemo
            pariatur harum cum iusto deleniti ut ipsum. Repudiandae expedita
            libero, nam quam consequuntur doloremque, hic molestiae facilis aut
            eum est laborum.
          </p>
          <v-btn @click="showModal = false"> Fechar </v-btn>
        </div>
      </template>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const showModal = ref(false);
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
</style>
