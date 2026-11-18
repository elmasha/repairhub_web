export default function ({ $axios, redirect, app }) {
  // Request Interceptor
  $axios.onRequest(config => {
    // Get the token from the cookie-universal-nuxt module
    const token = app.$cookies.get('token')
    
    if (token) {
      // Modern Axios syntax (using config.headers['key'] instead of config.headers.common['key'])
      config.headers['Authorization'] = `Bearer ${token}`
    }
  })

  // Response Interceptor
  $axios.onError(error => {
    const code = parseInt(error.response && error.response.status)
    
    // If the token is expired or invalid, log the user out
    if (code === 401) {
      app.$cookies.remove('token')
      redirect('/login')
    }
  })
}