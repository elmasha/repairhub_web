<template>
  <div class="login-page">
    <v-card class="login-card" elevation="12">
      <v-card-title class="text-h5 font-weight-bold">System Admin</v-card-title>
      <v-card-text>
        <v-alert v-if="error" type="error" dense outlined class="mb-4 text-left">
          {{ error }}
        </v-alert>
        <v-text-field
          v-model.trim="email"
          label="Admin Email"
          outlined dense color="primary"
          prepend-inner-icon="mdi-email"
          :disabled="loading"
          @keyup.enter="login"
        />
        <v-text-field
          v-model="password"
          label="Password"
          type="password"
          outlined dense color="primary"
          prepend-inner-icon="mdi-lock"
          :disabled="loading"
          @keyup.enter="login"
        />
        <v-btn
          block color="#D32F2F" dark class="mt-4"
          :loading="loading" :disabled="loading"
          @click="login"
        >
          Access System
        </v-btn>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  layout: 'blank',
  data() {
    return { email: '', password: '', loading: false, error: '' }
  },
  methods: {
    async login() {
      this.error = ''
      if (!this.email || !this.password) {
        this.error = 'Email and password are required.'
        return
      }
      this.loading = true
      try {
        const res = await this.$axios.$post('/api/system/login', {
          email: this.email,
          password: this.password,
        })
        localStorage.setItem('adminToken', res.token)
        this.$router.replace(this.$route.query.next || '/admin')
      } catch (e) {
        const status = e && e.response && e.response.status
        if (status === 429) this.error = 'Too many attempts. Try again in 15 minutes.'
        else if (status === 401) this.error = 'Invalid admin credentials.'
        else this.error = 'Cannot reach server. Check your connection.'
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
}
.login-card { width: 100%; max-width: 400px; border-radius: 12px; padding: 20px; }
</style>