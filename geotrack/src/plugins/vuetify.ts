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
          primary: '#000B62',
          primary_light: '#d5d9ff',
          secondary: '#FFFFFF',
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: '#242c3c', // botao consultar
          primary_light: '#d5d9ff', //botoes filtro rapidos e limpar
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
