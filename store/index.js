export const state = () => ({
  authToken: null,
  user: null,
  subscription: null // <-- ADDED: We need to track this
})

export const mutations = {
  SET_AUTH(state, { token, user, subscription }) {
    state.authToken = token
    state.user = user
    state.subscription = subscription
  },
  SET_SUBSCRIPTION(state, subscription) {
    state.subscription = subscription
  },
  CLEAR_AUTH(state) {
    state.authToken = null
    state.user = null
    state.subscription = null
  }
}

export const actions = {
  async nuxtServerInit({ commit, state }, { app }) {
    const token = app.$cookies.get('token')
    if (token) {
      try {
        // Fetch the current user and subscription from the backend
        const res = await app.$axios.$get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        // res includes user and subscription based on our backend fix
        commit('SET_AUTH', { 
          token, 
          user: res.user || res, // Adjust based on how your /me endpoint returns data
          subscription: res.subscription || (res.business ? res.business.subscription : null)
        })
      } catch (e) {
        // Token is invalid or expired
        app.$cookies.remove('token')
        commit('CLEAR_AUTH')
      }
    }
  },

  async login({ commit }, { email, password }) {
    try {
      const response = await this.$axios.$post('/api/auth/login', { email, password })
      
      // Save the token to a cookie so it persists on refresh
      this.$cookies.set('token', response.accessToken, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        secure: process.env.NODE_ENV === 'production'
      })
      
      // Save user AND subscription to Vuex
      commit('SET_AUTH', { 
        token: response.accessToken, 
        user: response.user, 
        subscription: response.subscription 
      })
      
      return response
    } catch (error) {
      throw error
    }
  },
  
  logout({ commit }) {
    this.$cookies.remove('token')
    commit('CLEAR_AUTH')
  }
}