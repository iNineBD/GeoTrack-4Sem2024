import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as labsComponents from 'vuetify/labs/components'
import { pt } from 'vuetify/locale' // Importando locale para português

export default createVuetify({
  theme: {
    defaultTheme: 'dark',
    themes: {
      light: {
        colors: {
          primary: '#1976D2',
          secondary: '#424242',
        },
      },
      dark:{
        colors: {
          primary: '#BB86FC',
          secondary: '#03DAC6'
        },
      }

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
