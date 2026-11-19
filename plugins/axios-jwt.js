export default function ({ $axios, redirect, app, store }) {
  // Request Interceptor
  $axios.onRequest(config => {
    // Skip admin routes, they manage their own tokens
    if (config.url && config.url.startsWith('/api/system')) return config

    // Get the token from the cookie-universal-nuxt module
    const token = app.$cookies.get('token')
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  })

  // Response Interceptor
  $axios.onError(error => {
    const code = parseInt(error.response && error.response.status)
    const errorMessage = error.response?.data?.error || ''
    
    // 1. Handle Invalid/Expired Tokens (401) -> TRUE LOGOUT
    if (code === 401) {
      app.$cookies.remove('token')
      store.commit('CLEAR_AUTH') // Clear the store so they actually log out
      redirect('/login')
      return Promise.reject(error)
    }

    // 2. Handle Suspended / Expired Subscription (403) -> LOCK UI, DON'T LOGOUT
    if (code === 403 && (
      errorMessage.includes('suspended') || 
      errorMessage.includes('expired') || 
      errorMessage.includes('subscription') ||
      errorMessage.includes('billing')
    )) {
      // Force the layout to lock by updating the store's subscription status
      store.commit('SET_SUBSCRIPTION', { status: 'SUSPENDED' })
      
      // If they try to navigate away from billing, push them to the billing page
      if (app.router.currentRoute.path !== '/billing') {
        app.router.push('/billing')
      }
      
      // We reject the promise so the specific component knows the action failed
      return Promise.reject(error)
    }

    // 3. Handle Plan Limits (403) -> SHOW UPGRADE PROMPT
    if (code === 403 && errorMessage.includes('Plan limit reached')) {
      // The specific component (e.g., Create Repair) will catch this
      return Promise.reject(error)
    }

    return Promise.reject(error)
  })
}