<template>
  <v-card
    class="users-list-card"
    width="400px"
    height="300px"
    rounded="xl"
    elevation="4"
    color="primary"
  >
    <template v-if="users && users.length > 0">
      <v-list-item
        v-for="(users, index) in users"
        :key="index"
        class="mb-1"
      >
        <v-sheet class="pa-2 mb-2" color="primary_light" elevation="0" rounded>
          <v-row
            align="center"
            justify="space-between"
            style="padding: 5px 12px"
          >
            <span style="font-weight: bold; font-size: 16px">
              {{ users }}
            </span>
          </v-row>
        </v-sheet>
      </v-list-item>
    </template>
    <template v-else>
      <v-row justify="center">
        <v-icon color="grey">mdi-alert</v-icon>
        <span>Nenhum usuário encontrado.</span>
      </v-row>
    </template>
  </v-card>
</template>

<script>
import { eventBus } from "@/utils/EventBus";

export default {
  data() {
    return {
      users: [], // Lista de usuários que será populada pelo evento
    };
  },
  mounted() {
    // Escutando o evento 'users' para atualizar a lista de usuários
    eventBus.on("usersReceived", this.updateUsers);
    console.log("UserInZoneInformation mounted", this.users);
  },
  beforeUnmount() {
    // Removendo o ouvinte do evento quando o componente for desmontado
    eventBus.off("users", this.updateUsers);
  },
  methods: {
    updateUsers(users) {
      console.log("Dados recebidos:", users);
      this.users = users; // Atualizando a lista de usuários com os dados recebidos
    },
  },
};
</script>

<style>
.user-list-card {
  background-color: #000000;
}

.icon-container {
  position: relative;
}

.plus-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 16px;
  color: terceary;
}

.title-text {
  font-weight: bold;
  font-size: 16px;
}

.no-shadow {
  box-shadow: none !important;
}

.rounded {
  border-radius: 0 !important;
}
</style>
