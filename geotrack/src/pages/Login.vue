<template>
  <v-container fluid class="login-container">
    <v-row>
      <v-col class="blue-section" cols="12" md="4">
        <v-card class="login-card">
          <v-card-title class="text-h5">Login</v-card-title>
          <v-card-text>
            <v-form>
              <v-text-field
                v-model="username"
                label="Usuário"
                required
                class="login-input"
              ></v-text-field>
              <v-text-field
                v-model="password"
                label="Senha"
                type="password"
                required
                class="login-input"
              ></v-text-field>
              <v-btn @click="handleLogin" color="#2B81C4" block>Entrar</v-btn> 
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col class="white-section" cols="12" md="8">
      </v-col>
    </v-row>

  </v-container>
</template>

<script lang="ts">
import { ref } from 'vue';

export default {
  name: 'Login',
  setup() {
    const username = ref('');
    const password = ref('');

    const handleLogin = () => {
      if (username.value === 'usuario' && password.value === 'senha') {
        localStorage.setItem('isLoggedIn', 'true');
      } else {
        alert('Usuário ou senha inválidos');
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

<style scoped>
.login-container {
  height: 100vh; 
  margin: 0; 
  padding: 0; 
}

.blue-section {
  background-color: #3f51b5; 
  color: white;
  display: flex;
  justify-content: center; 
  align-items: center;
  height: 100vh; 
}

.white-section {
  background-color: white; 
}

.login-card {
  width: 100%; 
  max-width: 400px; 
  margin: auto; 
}

.login-input {
  width: 100%;
}

</style>
