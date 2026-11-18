<template>
  <v-app>
    <v-container class="fill-height login-bg" fluid>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="4" lg="3">
          <v-card class="elevation-12 login-card" outlined>

            <v-toolbar color="#121212" dark flat height="72">
              <v-toolbar-title class="font-weight-bold text-h5">
                <span class="brand-red">Repair</span>Hub POS
              </v-toolbar-title>
              <v-spacer></v-spacer>
              <v-btn text color="white" to="/" class="text-none font-weight-medium">
                <v-icon left small>mdi-arrow-left</v-icon> Home
              </v-btn>
            </v-toolbar>

            <v-card-text class="pt-8 px-6">
              <div class="text-h6 font-weight-medium mb-1">Welcome back</div>
              <div class="text-body-2 grey--text mb-6">Sign in to your workspace</div>

              <v-form ref="form" v-model="valid" @submit.prevent="handleLogin">
                <v-text-field
                  v-model.trim="email"
                  label="Email Address"
                  prepend-inner-icon="mdi-account-outline"
                  type="email"
                  autocomplete="username"
                  color="primary"
                  outlined
                  :rules="[rules.required, rules.email]"
                  :disabled="loading"
                  @input="error = ''"
                  @keyup.enter="handleLogin"
                />

                <v-text-field
                  v-model="password"
                  label="Password"
                  prepend-inner-icon="mdi-lock-outline"
                  :type="showPassword ? 'text' : 'password'"
                  :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  autocomplete="current-password"
                  color="primary"
                  outlined
                  :rules="[rules.required]"
                  :disabled="loading"
                  @click:append="showPassword = !showPassword"
                  @input="error = ''"
                  @keyup.enter="handleLogin"
                />

                <v-alert
                  v-if="error"
                  type="error"
                  dense
                  outlined
                  class="mt-2 text-left"
                  transition="fade-transition"
                >
                  {{ error }}
                </v-alert>
              </v-form>
            </v-card-text>

            <v-card-actions class="px-6 pb-6 pt-0">
              <v-btn
                color="#D32F2F"
                block
                large
                depressed
                class="white--text font-weight-bold"
                :loading="loading"
                :disabled="loading || !email || !password"
                @click="handleLogin"
              >
                LOGIN
              </v-btn>
            </v-card-actions>

            <v-divider />

            <v-card-text class="text-center text-body-2 grey--text py-4">
              Don't have an account?
              <NuxtLink to="/register" class="brand-red font-weight-bold text-decoration-none ml-1">
                Create one
              </NuxtLink>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script>
export default {
  layout: 'blank',
  data() {
    return {
      email: '',
      password: '',
      showPassword: false,
      loading: false,
      error: '',
      valid: false,
      rules: {
        required: (v) => !!v || 'Required',
        email: (v) => /.+@.+\..+/.test(v) || 'Enter a valid email',
      },
    }
  },
  methods: {
    async handleLogin() {
      if (this.loading) return

      if (!this.email || !this.password) {
        this.error = 'Please enter both email and password.'
        return
      }
      if (this.$refs.form && !this.$refs.form.validate()) return

      this.loading = true
      this.error = ''

      try {
        await this.$store.dispatch('login', {
          email: this.email,
          password: this.password,
        })

        const redirect = this.$route.query.redirect
        this.$router.replace(typeof redirect === 'string' && redirect.startsWith('/') ? redirect : '/dashboard')
      } catch (err) {
        const apiMsg =
          err?.response?.data?.error ||
          err?.data?.error ||
          (err?.message === 'Network Error' ? 'Cannot reach server. Check your connection.' : null)
        this.error = apiMsg || 'Login failed. Please check your credentials.'
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
.login-bg {
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
}
.login-card {
  border-radius: 12px;
  overflow: hidden;
}
.brand-red {
  color: #d32f2f;
}
@media (max-width: 600px) {
  .login-card {
    margin: 16px 0;
  }
}
</style>