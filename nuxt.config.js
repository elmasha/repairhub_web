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
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/icon.svg' }]
  },

  css: [],

  plugins: [
    '@/plugins/axios-jwt.js',
    '@/plugins/chart.js'
  ],

  router: {
  },

  env: {
    API_BASE_URL: process.env.API_BASE_URL || 'https://repairhubserver-production.up.railway.app/api/v1',
    // Add your IntaSend Publishable Key here so it's available in the browser
    INTASEND_PUBLISHABLE_KEY: process.env.INTASEND_PUBLISHABLE_KEY
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
    'cookie-universal-nuxt',
    '@nuxtjs/proxy' // <-- Add the proxy module
  ],

  axios: {
    baseURL: 'https://repairhubserver-production.up.railway.app',
    credentials: false
  },

  // <-- Proxy configuration
  proxy: {
    '/intasend-api': {
      target: 'https://api.intasend.com',
      pathRewrite: { '^/intasend-api': '' },
      changeOrigin: true
    }
  },

  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      dark: false,
      themes: {
        dark: {
          primary: '#E53935',
          secondary: '#B71C1C',
          accent: '#FF5252',
          error: '#D32F2F',
          warning: '#FFA000',
          info: '#1976D2',
          success: '#388E3C',
          background: '#121212'
        }
      }
    }
  },

  build: {}
}