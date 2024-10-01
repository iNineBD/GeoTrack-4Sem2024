<template>
  <v-bottom-navigation v-if="isMobile" grow color="primary">
    <v-btn value="home" to="/">
      <v-icon>mdi-home</v-icon>
      <span>Home</span>
    </v-btn>
    <v-btn disabled="true" class="logo-btn">
      <img :src="logoPin" alt="Logo Pin" height="32" style="margin: 6px;" />
    </v-btn>
    <v-btn value="filter" to="/filter">
      <v-icon>mdi-filter</v-icon>
      <span>Filtrar</span>
    </v-btn>
  </v-bottom-navigation>
</template>

<script>
import logoPin from '@/assets/LogoPin.svg';
import { ref, onMounted } from 'vue';

export default {
  setup() {
    const isMobile = ref(false);

    const checkMobile = () => {
      isMobile.value = window.innerWidth < 600;
    };

    onMounted(() => {
      checkMobile();
      window.addEventListener('resize', checkMobile);
    });

    return {
      isMobile,
      logoPin,
    };
  },
};
</script>

<style>
/* Remova a opacidade e outros efeitos de desabilitação do botão */
.logo-btn[disabled] {
  opacity: 1 !important;
  pointer-events: none;
}

.logo-btn img {
  opacity: 1; /* Garante que a logo não seja afetada */
}
</style>
