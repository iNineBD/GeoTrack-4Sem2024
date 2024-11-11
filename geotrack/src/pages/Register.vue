<template>
  <v-container fluid class="register-container pa-0">
    <v-row no-gutters style="height: 100%">
      <v-col class="blue-section" cols="12">
        <v-card class="register-card" elevation="2">
          <div class="logo-container">
            <img :src="logoGeoTrack" alt="GeoTrack Logo" class="main-logo mb-2">
          </div>
          <v-card-title class="text-h5 font-weight-bold text-center">Cadastro de Usuário</v-card-title>
          <v-card-text>
            <p class="subtitle-1 mb-4 text-body-2 text-center ">Preencha os campos abaixo</p>
            <v-form @submit.prevent="handleRegister">
              <v-text-field
                v-model="name"
                label="Nome completo"
                required
                class="register-input mb-2"
                variant="outlined"
                density="comfortable"
                style="width: 300px;"
              ></v-text-field>

              <v-text-field
                v-model="email"
                label="Email"
                required
                class="register-input mb-2"
                variant="outlined"
                density="comfortable"
              ></v-text-field>

              <v-text-field
                v-model="password"
                label="Senha"
                type="password"
                required
                class="register-input mb-4"
                variant="outlined"
                density="comfortable"
              ></v-text-field>
              
              <v-btn type="submit" block class="register-btn" size="large">Cadastrar</v-btn>
            </v-form>
            <div class="login text-center mt-4">
              <router-link to="/">Já possui cadastro? Faça login</router-link>
            </div>
          </v-card-text>
          <div class="partner-logos mt-4">
            <img :src="logoIto1" alt="ITO1 Logo" class="partner-logo">
            <img :src="logoInine" alt="INine Logo" class="partner-logo">
          </div>
        </v-card>
        <v-snackbar v-model="snackbar" :color="snackbarColor" top :timeout="3000" class="text-center">
          {{ snackbarMessage }}
        </v-snackbar>
      </v-col>
      
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import logoGeoTrack from '../assets/GeoTrack-logo.png';
import logoInine from '../assets/inine-logo.png';
import logoIto1 from '../assets/ito1-logo.png';

export default {
  name: 'Register',
  setup() {
    const name = ref('');
    const email = ref('');
    const password = ref('');
    const router = useRouter();
    
    const snackbar = ref(false);
    const snackbarMessage = ref('');
    const snackbarColor = ref('');

    const handleRegister = async () => {
      if (!name.value || !email.value || !password.value) {
        snackbarMessage.value = 'Por favor, preencha todos os campos!';
        snackbarColor.value = 'error';
        snackbar.value = true;
        return; 
      }

      try {
        const response = await fetch('http://localhost:8080/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: name.value,
            email: email.value,
            password: password.value,
          }),
        });

        if (!response.ok) {
          throw new Error('Erro ao cadastrar usuário');
        }

        snackbarMessage.value = 'Usuário cadastrado com sucesso!';
        snackbarColor.value = 'success';
        snackbar.value = true;
        setTimeout(() => {
          router.push('/');
        }, 3000);
        

      } catch (error) {
        snackbarMessage.value = error.response?.data?.message || 'Erro ao cadastrar usuário';
        snackbarColor.value = 'error';
        snackbar.value = true;
      }
    };

    return {
      name,
      email,
      password,
      handleRegister,
      logoGeoTrack,
      logoIto1,
      logoInine,
      snackbar,
      snackbarMessage,
      snackbarColor,
    };
  },
};
</script>

<style scoped>
.register-container {
  height: 100vh;
  margin: 0;
  padding: 0;
}

.blue-section {
  background-image: url('../assets/terra.png');
  background-size: cover;
  background-position: center;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.content-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  max-width: 800px;
  margin: 0 auto;
}

.logo-container {
  width: 100%;
  text-align: center;
  margin-bottom: 1rem;
}

.main-logo {
  max-width: 200px;
  height: auto;
}

.map-container {
  width: 100%;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

.partner-logos {
  display: flex;
  justify-content: center;
  gap: 2rem;
  width: 100%;
  margin-top: 2rem;
}

.partner-logo {
  height: 30px;
  width: auto;
}

.register-card {
  background: white !important;
  width: min(90vw, 420px); 
  padding: 2vw; 
  border-radius: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.register-card :deep(.v-card-title) {
  color: #333;
  padding: 0;
  margin-bottom: 1rem;
}

.register-card :deep(.v-card-text) {
  color: #666;
  padding: 0;
}

.register-input {
  width: 100%;
}

.register-btn {
  background-color: #2B81C4 !important;
  color: white;
  height: 48px;
  font-weight: bold;
}

.login-link a {
  color: #2B81C4;
  text-decoration: none;
}

.v-snackbar {
  text-align: center;
}

@media (max-width: 960px) {
  .blue-section {
    min-height: 100vh;
  }
}
</style>
