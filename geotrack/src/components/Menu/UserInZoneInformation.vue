<template>
  <v-card
    class="users-list-card"
    width="400px"
    height="300px"
    rounded="xl"
    elevation="4"
    color="primary"
  >
    <v-row align="center" justify="center" style="padding: 5px 12px; margin-top:10px;">
      <span style="font-weight: bolder; font-size:20px"> Usuários neste perído</span>
    </v-row>
    <v-divider style="margin-top: 10px;"></v-divider>
    <v-card-text style="max-height: 200px; overflow-y: auto;">
      <template v-if="users && users.length > 0">
      <v-list-item v-for="(user, index) in users" :key="index" class="mb-1">
        <v-sheet class="pa-3" color="primary">
        <v-row
          align="center"
          margin-top="5px"
          justify="space-between"
          style="padding: 5px 12px"
        >
          <span style="font-weight: 600; font-size: 15px">
          {{ user }}
          </span>
           <v-divider style="width: 80%; margin: 10px auto;"></v-divider>
        </v-row>
        </v-sheet>
      </v-list-item>
      </template>
      <template v-else>
      <v-row justify="center">
        <v-icon color="grey">mdi-alert</v-icon>
        <span>Nenhum usuário encontrado nesste período.</span>
      </v-row>
      </template>
    </v-card-text>
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
    eventBus.on("usersReceived", this.updateUsers);
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
