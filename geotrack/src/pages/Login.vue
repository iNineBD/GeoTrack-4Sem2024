<template>
  <v-container fluid class="login-container pa-0">
    <v-row class="row">
      <v-col class="blue-section custom-col" cols="6">
        <v-card class="login-card" >
          <div class="logo-container">
            <img
              :src="logoGeoTrack"
              alt="GeoTrack Logo"
              class="main-logo mb-2"
            />
          </div>
          <v-card-title class="text-h5 font-weight-bold text-center"
            >Entre na sua conta</v-card-title
          >
          <v-card-text>
            <p class="subtitle-1 mb-4 text-body-2 text-center">
              Preencha os campos abaixo
            </p>
            <v-form @submit.prevent="handleLogin">
              <v-text-field
                v-model="email"
                label="Digite seu usuário"
                required
                class="login-input mb-2"
                variant="outlined"
                density="comfortable"
                style="width: 300px"
              ></v-text-field>

              <v-text-field
                v-model="password"
                label="Digite sua senha"
                type="password"
                required
                class="login-input mb-4"
                variant="outlined"
                density="comfortable"
              ></v-text-field>

              <v-btn type="submit" block class="login-btn" size="large">
                Entrar
              </v-btn>

              <div class="register text-center mt-4">
                <router-link to="/register">Faça seu cadastro</router-link>
              </div>
            </v-form>
          </v-card-text>

          <div class="partner-logos mt-6">
            <img :src="logoIto1" alt="ITO1 Logo" class="partner-logo" />
            <img :src="logoInine" alt="INine Logo" class="partner-logo" />
          </div>
        </v-card>
      </v-col>
    </v-row>
    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000" top>
      {{ snackbarMessage }}
    </v-snackbar>
  </v-container>
</template>

<script lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import logoGeoTrack from "../assets/GeoTrack-logo.png";
import logoIto1 from "../assets/ito1-logo.png";
import logoInine from "../assets/inine-logo.png";

export default {
  name: "Login",
  setup() {
    const email = ref("");
    const password = ref("");
    const router = useRouter();

    const snackbar = ref(false);
    const snackbarMessage = ref("");
    const snackbarColor = ref("");

    const handleLogin = async () => {
      try {
        const response = await axios.post("http://localhost:8080/auth/login", {
          email: email.value,
          password: password.value,
        });

        console.info("Login bem-sucedido:", response.data);
        localStorage.setItem("token", response.data.token);

        snackbarMessage.value = "Login bem-sucedido!";
        snackbarColor.value = "success";
        snackbar.value = true;

        router.push("/stoppointsfilter");
      } catch (error) {
        console.error("Erro no login:", error.response?.data || error.message);

        snackbarMessage.value =
          error.response?.data?.message || "Erro desconhecido no login";
        snackbarColor.value = "error";
        snackbar.value = true;
      }
    };

    return {
      email,
      password,
      handleLogin,
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

.custom-col {
  flex: 1 1 auto;
  max-width: 100%;
}

.login-container {
  height: 100vh;
  background-image: url('../assets/terra.png');
  background-position: center;
  background-size: cover;
  display: flex;
  flex-direction: column;
}

.blue-section {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 10px;
  border-radius: 20px;
}

.yellow-section {
  background-position: center;
  
  display: flex;
  justify-content: center;
  align-items: center;
 
  border-radius: 20px;
}

.login-card {
  background: white !important;
  width: min(90vw, 420px);
  padding: 2vw;
  border-radius: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
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

.register a {
  color: primary;
  text-decoration: underline;
}

.login-btn {
  background-color: #2b81c4 !important;
  color: white;
  height: 48px;
  font-weight: bold;
}

@media (max-width: 960px) {
  .blue-section {
    min-height: 100vh;
  }
}
</style>
