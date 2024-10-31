<template>
  <v-container fluid class="register-container pa-0">
    <v-row no-gutters style="height: 100%">
      <v-col class="blue-section" cols="12" md="5">
        <v-card class="register-card" elevation="2">
          <v-card-title class="text-h5 font-weight-bold text-center">Cadastro de Usuário</v-card-title>
          <v-card-text>
            <p class="subtitle-1 mb-6 text-body-2 text-center">Preencha os campos abaixo</p>
            <v-form @submit.prevent="handleRegister">
              <v-text-field
                v-model="name"
                label="Nome completo"
                required
                class="register-input mb-4"
                variant="outlined"
                density="comfortable"
              ></v-text-field>
              <v-text-field
                v-model="email"
                label="Email"
                required
                class="register-input mb-4"
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
        router.push('/');
      } catch (error) {
        alert(error.response?.data?.message || 'Erro ao cadastrar usuário');
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
  background-image: url('../assets/image-sjc.png');
  background-size: cover;
  background-position: center;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.white-section {
  background-color: white;
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

.register-card {
  background: white !important;
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  border-radius: 8px;
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
