export const state = () => ({
  authToken: null,
  user: null,
  subscription: null // <-- Needed for the lock to work
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
  async nuxtServerInit({ commit }, { app }) {
    const token = app.$cookies.get('token')
    if (token) {
      try {
        const res = await app.$axios.$get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        })
        // res now contains { user, business, subscription }
        commit('SET_AUTH', { 
          token, 
          user: res.user, 
          subscription: res.subscription 
        })
      } catch (e) {
        app.$cookies.remove('token')
        commit('CLEAR_AUTH')
      }
    }
  },

  async login({ commit }, { email, password }) {
    const response = await this.$axios.$post('/api/auth/login', { email, password })
    this.$cookies.set('token', response.accessToken, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === 'production'
    })
    commit('SET_AUTH', { 
      token: response.accessToken, 
      user: response.user, 
      subscription: response.subscription 
    })
    return response
  },
  
  logout({ commit }) {
    this.$cookies.remove('token')
    commit('CLEAR_AUTH')
  }
}