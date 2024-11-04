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
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: '#242f3e', // botao consultar
          primary_light: '#b8beff', //botoes filtro rapidos e limpar
          secondary: '#6A5ACD', // nao sabemos ainda
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
