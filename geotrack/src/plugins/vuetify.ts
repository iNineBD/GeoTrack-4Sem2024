import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as labsComponents from 'vuetify/labs/components'
import { pt } from 'vuetify/locale' // Importando locale para português

export default createVuetify({
  theme: {
    defaultTheme: 'light', // Começa com o tema claro
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#f2f3f5',
          primary_light: '#b8beff',
          secondary: '#1A237E',
          secondary_light: "#43A047",
          terceary: "black"
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: '#21374d', 
          primary_light: '#b8beff', 
          secondary: '#6A5ACD', 
          secondary_light: "#1B5E20",
          terceary: "white",
        },
      },
    },
  },
  components: {
    ...components,
    ...labsComponents,
  },
  locale: {
    locale: 'pt', // Definindo o locale para português
    messages: { pt }, // Usando as mensagens de locale
  },
})
