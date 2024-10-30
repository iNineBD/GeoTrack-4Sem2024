<template>
  <v-container fluid class="register-container">
    <v-row>
      <v-col class="blue-section" cols="12" md="4">
        <v-card class="register-card" outlined>
          <v-card-title class="text-h5">Crie sua conta</v-card-title>
          <v-card-text>
            <p>Preencha os campos abaixo</p>
            <v-form @submit.prevent="handleRegister">
              <v-text-field
                v-model="name"
                label="Digite seu nome completo"
                required
                class="register-input"
              ></v-text-field>
              <v-text-field
                v-model="email"
                label="Digite seu email"
                required
                class="register-input"
              ></v-text-field>
              <v-text-field
                v-model="password"
                label="Digite sua senha"
                type="password"
                required
                class="register-input"
              ></v-text-field>
              <v-btn type="submit" color="#2B81C4" block>Cadastrar</v-btn>
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
  name: 'Register',
  setup() {
    const name = ref('');
    const email = ref('');
    const password = ref('');
    const router = useRouter();

    const handleRegister = async () => {
      try {
        await axios.post('http://localhost:8080/auth/register', {
          name: name.value,
          email: email.value,
          password: password.value,
        });
        alert('Usuário cadastrado com sucesso!');
        router.push('/login'); // Redireciona para a tela de login após o cadastro
      } catch (error) {
        alert(error.response?.data?.message || 'Erro ao cadastrar usuário');
      }
    };

    return {
      name,
      email,
      password,
      handleRegister,
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

.register-card {
  width: 100%;
  max-width: 400px;
  margin: auto;
}

.register-input {
  width: 100%;
}
</style>
