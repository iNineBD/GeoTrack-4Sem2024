<template>
  <v-container fluid class="login-container pa-0">
    <v-row no-gutters style="height: 100%">
      <v-col class="blue-section" cols="12" md="5">
        <v-card class="login-card" elevation="2">
          <v-card-title class="text-h5 font-weight-bold text-center">Entre na sua conta</v-card-title>
          <v-card-text>
            <p class="subtitle-1 mb-6 text-body-2 text-center">Preencha os campos abaixo</p>
            <v-form @submit.prevent="handleLogin">
              <v-text-field
                v-model="email"
                label="Digite seu usuário"
                required
                class="login-input mb-4"
                variant="outlined"
                density="comfortable"
              ></v-text-field>
              
              <v-text-field
                v-model="password"
                label="Digite sua senha"
                type="password"
                required
                class="login-input mb-2"
                variant="outlined"
                density="comfortable"
              ></v-text-field>

              <v-btn 
                type="submit" 
                block 
                class="login-btn"
                size="large"
              >
                Entrar
              </v-btn>

               
              <div class="register text-center mt-4">
                <router-link to="/register">Faça seu cadastro</router-link>
              </div>

            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col class="white-section" cols="12" md="7">
        <div class="content-wrapper">
          <div class="logo-container mb-8">
            <img :src="logoGeoTrack" alt="GeoTrack Logo" class="main-logo">
          </div>
          
          <div class="map-container mb-8">
            <img 
              src="https://i.gifer.com/PX5H.gif" 
              alt="World Animation" 
              class="world-animation"
            >
          </div>
          
          <div class="partner-logos">
            <img :src="logoIto1" alt="ITO1 Logo" class="partner-logo">
            <img :src="logoInine" alt="INine Logo" class="partner-logo">
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import logoGeoTrack from '../assets/GeoTrack-logo.png';
import logoIto1 from '../assets/ito1-logo.png';
import logoInine from '../assets/inine-logo.png';

export default {
  name: 'Login',
  setup() {
    const email = ref('');
    const password = ref('');
    const router = useRouter();

    const handleLogin = async () => {
      try {
        const response = await axios.post('http://localhost:8080/auth/login', {
          email: email.value,
          password: password.value,
        });
        localStorage.setItem('token', response.data.token);
        router.push('/stoppointsfilter');
      } catch (error) {
        alert(error.response?.data?.message || 'Usuário ou senha inválidos');
      }
    };

    return {
      email,
      password,
      handleLogin,
      logoGeoTrack,
      logoIto1,
      logoInine,
    };
  },
};
</script>

<style scoped>
.login-container {
  height: 100vh;
  background-color: white;
}

.blue-section {
  background-image: url('../assets/image-sjc.png');
  background-size: cover;
  background-position: center;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.login-card {
  background: white !important;
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  border-radius: 8px;
}

.login-card :deep(.v-card-title) {
  color: #333;
  padding: 0;
  margin-bottom: 1rem;
}

.login-card :deep(.v-card-text) {
  color: #666;
  padding: 0;
}

.login-input :deep(.v-field) {
  border-radius: 4px;
}

.register {
  text-align: left;
}

.register a {
  color: primary;
  text-decoration: underline;
}

.login-btn {
  background-color: #2B81C4 !important;
  color: white;
  height: 48px;
  font-weight: bold;
}

.white-section {
  background-color: white;
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
}

.logo-container img {
  width: 100%;
  max-width: 400px;
  height: auto; 
}

.main-logo {
  max-width: 250px;
  height: auto;
}

.map-container {
  width: 100%;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

.world-animation {
  width: 100%;
  max-width: 500px;
  height: auto;
  border-radius: 8px;
  object-fit: cover;
}

.partner-logos {
  display: flex;
  justify-content: center;
  gap: 2rem;
  width: 100%;
}

.partner-logo {
  height: 40px;
  width: auto;
}

@media (max-width: 960px) {
  .blue-section {
    min-height: 100vh;
  }
  
  .white-section {
    min-height: 100vh;
  }
  
  .content-wrapper {
    padding: 2rem 0;
  }

  .world-animation {
    max-width: 100%;
  }
}
</style>