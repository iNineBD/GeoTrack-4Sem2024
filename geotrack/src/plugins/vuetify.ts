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
          primary: '#001dff',
          primary_light:'#d5d9ff',
          secondary: '#FFFFFF',
        },
      },
      dark:{
        colors: {
          primary: '#001dff',
          primary_light:'#d5d9ff',
          secondary: '#FFFFFF',
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
