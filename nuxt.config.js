export default {
  ssr: false,

  head: {
    titleTemplate: '%s ',
    title: 'RepairHub',
    htmlAttrs: { lang: 'en' },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' },
      { name: 'robots', content: 'noindex,nofollow' }
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.svg' }]
  },

  css: [],

  plugins: [
    '@/plugins/axios-jwt.js',
    '@/plugins/chart.js'
    // Note: removed mapGoogle, directionsRenderer, axios-auth (Makaazi-only)
    // If you *do* use Google Maps anywhere, uncomment mapGoogle below:
    // '@/plugins/mapGoogle.client.js',
  ],

  router: {
  },

  env: {
    API_BASE_URL: process.env.API_BASE_URL || 'https://repairhubserver-production.up.railway.app/api/v1'
  },

  components: true,

  googleFonts: {
    download: true,
    families: { Lato: true },
    display: 'Lato'
  },

  buildModules: [
    '@nuxtjs/vuetify',
    '@nuxtjs/google-fonts',
    '@nuxtjs/moment',
    '@nuxtjs/dayjs'
  ],

  moment: { timezone: false },

  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/dayjs',
    'cookie-universal-nuxt', // <-- Add this
  ],

  axios: {
    baseURL: 'https://repairhubserver-production.up.railway.app',
    credentials: false
  },

  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      dark: false, // <-- Force dark mode for the black background
      themes: {
        dark: {
          primary: '#E53935',   // Strong Red
          secondary: '#B71C1C', // Darker Red
          accent: '#FF5252',    // Bright Red accent
          error: '#D32F2F',
          warning: '#FFA000',
          info: '#1976D2',
          success: '#388E3C',
          background: '#121212' // Deep Black for Vuetify components
        }
      }
    }
  },

  build: {}
}