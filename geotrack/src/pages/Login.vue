<template>
  <v-container class="fill-height" justify="center" align="center">
    <v-card max-width="400px" class="pa-4">
      <v-card-title>Login</v-card-title>
      <v-card-text>
        <v-form>
          <v-text-field
            v-model="username"
            label="Usuário"
            required
          ></v-text-field>
          <v-text-field
            v-model="password"
            label="Senha"
            type="password"
            required
          ></v-text-field>
          <v-btn @click="handleLogin" color="primary">Entrar</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { ref } from "vue";

export default {
  name: "Login",
  setup() {
    const username = ref("");
    const password = ref("");

    const handleLogin = () => {
      if (username.value === "usuario" && password.value === "senha") {
        localStorage.setItem("isLoggedIn", "true");
      } else {
        alert("Usuário ou senha inválidos");
      }
    };

    return {
      username,
      password,
      handleLogin,
    };
  },
};
</script>
