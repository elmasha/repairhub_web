export const state = () => ({
  authToken: null,
  user: null
})

export const mutations = {
  SET_AUTH(state, { token, user }) {
    state.authToken = token
    state.user = user
  },
  CLEAR_AUTH(state) {
    state.authToken = null
    state.user = null
  }
}

export const actions = {
  async login({ commit }, { email, password }) {
    try {
      const response = await this.$axios.$post('/api/auth/login', { email, password })
      
      // Save the token to a cookie so it persists on refresh
      this.$cookies.set('token', response.accessToken, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        secure: process.env.NODE_ENV === 'production'
      })
      
      commit('SET_AUTH', { token: response.accessToken, user: response.user })
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