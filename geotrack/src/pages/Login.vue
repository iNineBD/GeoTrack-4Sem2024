<template>
  <v-container fluid class="login-container">
    <v-row>
      <v-col class="blue-section" cols="12" md="4">
        <v-card class="login-card" outlined>
          <v-card-title class="text-h5">Entre na sua conta</v-card-title>
          <v-card-text>
            <p>Preencha os campos abaixo</p>
            <v-form @submit.prevent="handleLogin">
              <v-text-field
                v-model="email"
                label="Digite seu email"
                required
                class="login-input"
              ></v-text-field>
              <v-text-field
                v-model="password"
                label="Digite sua senha"
                type="password"
                required
                class="login-input"
              ></v-text-field>
              
              <div class="primeiroAcesso">
                <router-link to="/register">Primeiro acesso</router-link>
              </div>

              <v-btn type="submit" color="#2B81C4" block>Entrar</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col class="white-section" cols="12" md="8">
        <div class="logo">
          <img :src="logoGeoTrack" alt="GeoTrack Logo">
        </div>
        <div class="mapa">
          <img :src="mapImage" alt="Mapa do mundo">
        </div>
        <div class="logos-parceiros">
          <img :src="logoIto1" alt="ITO1 Logo">
          <img :src="logoInine" alt="INine Logo">
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
import mapImage from '../assets/map.png';
import logoIto1 from '../assets/ito1-logo.png';
import logoInine from '../assets/inine-logo.png';

export default {
  name: 'Login',
  setup() {
    const email = ref(''); // Usando email em vez de username
    const password = ref('');
    const router = useRouter();

    const handleLogin = async () => {
      try {
        const response = await axios.post('http://localhost:8080/auth/login', {
          email: email.value,
          password: password.value,
        });
        localStorage.setItem('token', response.data.token); // Armazena o token
        alert('Login bem-sucedido!');
        router.push('/stoppointsfilter'); // Substitua '/dashboard' pela rota desejada após o login
      } catch (error) {
        alert(error.response?.data?.message || 'Usuário ou senha inválidos');
      }
    };

    return {
      email,
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

.primeiroAcesso {
  text-align: justify;
  margin: 10px 0;
}
</style>
