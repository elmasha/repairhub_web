<template>
  <v-app dark style="background: #0f1115;">
    <v-container fluid class="fill-height pa-0 ma-0" style="height: 100vh;">
      <v-row no-gutters class="fill-height ma-0">
        
        <!-- LEFT SIDE: Branding (Hidden on Mobile) -->
        <v-col cols="12" md="5" class="d-none d-md-flex flex-column align-center justify-center red-gradient fill-height">
          <div class="brand-content text-center px-8">
            <div class="d-flex align-center justify-center mb-8">
              <v-icon size="48" color="white" class="mr-3">mdi-tools</v-icon>
              <h1 class="text-h3 font-weight-black white--text" style="letter-spacing: -1px;">RepairHub</h1>
            </div>
            
            <h2 class="text-h4 font-weight-bold white--text mb-4 text-left">Welcome Back!</h2>
            <p class="text-subtitle-1 white--text mb-10 text-left" style="opacity: 0.8;">
              Sign in to manage your repairs, inventory, and sales.
            </p>

            <div class="mt-8 text-left">
              <v-btn text color="white" to="/" class="text-none px-0">
                <v-icon left>mdi-arrow-left</v-icon> Back to Home
              </v-btn>
            </div>
          </div>
        </v-col>

        <!-- RIGHT SIDE: Login Form -->
        <v-col cols="12" md="7" class="d-flex flex-column align-center justify-center dark-bg fill-height position-relative">
          
          <!-- MOBILE HEADER: Gradient & Branding (Hidden on Desktop) -->
          <div class="mobile-hero d-md-none">
            <div class="d-flex align-center mb-4">
              <v-icon size="32" color="white" class="mr-2">mdi-tools</v-icon>
              <span class="text-h5 font-weight-bold white--text">RepairHub</span>
            </div>
            <h2 class="text-h5 font-weight-bold white--text mb-1">Welcome Back!</h2>
            <p class="text-body-2 white--text" style="opacity: 0.8;">Sign in to manage your workspace.</p>
          </div>

          <!-- THE FORM -->
          <div class="form-wrapper px-6 px-md-12" style="width: 100%; max-width: 450px;">
            <div class="mb-8 text-center text-md-left d-none d-md-block">
              <h2 class="text-h4 font-weight-bold white--text mb-2">Sign In</h2>
              <p class="text-body-2 grey--text text--lighten-1">Enter your email and password to access your workspace.</p>
            </div>

            <v-form ref="form" v-model="valid" @submit.prevent="handleLogin">
              
              <v-text-field
                v-model.trim="email"
                label="Email Address"
                placeholder="regan@gmail.com"
                type="email"
                autocomplete="username"
                color="white"
                outlined
                :rules="[rules.required, rules.email]"
                :disabled="loading"
                class="custom-input mb-2"
                @keyup.enter="handleLogin"
              />

              <v-text-field
                v-model="password"
                label="Password"
                placeholder="••••••••"
                :type="showPassword ? 'text' : 'password'"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append="showPassword = !showPassword"
                autocomplete="current-password"
                color="white"
                outlined
                :rules="[rules.required]"
                :disabled="loading"
                class="custom-input mb-2"
                @keyup.enter="handleLogin"
              />

              <div class="d-flex justify-space-between align-center mb-6">
                <v-checkbox
                  v-model="rememberMe"
                  label="Remember me"
                  color="red"
                  hide-details
                  class="mt-0 pt-0 white--text"
                ></v-checkbox>
                
                <NuxtLink to="/forgot-password" class="text-body-2 white--text text-decoration-none font-weight-medium">
                  Forgot password?
                </NuxtLink>
              </div>

              <v-alert
                v-if="error"
                type="error"
                dense
                outlined
                class="mb-6 text-left"
                color="red"
              >
                {{ error }}
              </v-alert>

              <v-btn
                color="#D32F2F"
                block
                x-large
                depressed
                class="white--text font-weight-bold"
                style="border-radius: 8px; font-size: 1rem;"
                :loading="loading"
                :disabled="loading || !email || !password"
                @click="handleLogin"
              >
                Log In
              </v-btn>
            </v-form>

            <div class="text-center mt-8">
              <span class="text-body-2 grey--text">Don't have an account?</span>
              <NuxtLink to="/register" class="white--text font-weight-bold text-decoration-none ml-1">
                Create one
              </NuxtLink>
            </div>

            <!-- Back to Home for Mobile -->
            <div class="text-center mt-6 d-md-none">
              <NuxtLink to="/" class="text-body-2 grey--text text-decoration-none">
                <v-icon small left>mdi-arrow-left</v-icon> Back to Home
              </NuxtLink>
            </div>
          </div>
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
      rememberMe: false,
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
/* Left Side Gradient */
.red-gradient {
  background: linear-gradient(135deg, #C62828 0%, #7F0000 100%);
  position: relative;
}

.brand-content {
  max-width: 400px;
}

/* Right Side Dark Theme */
.dark-bg {
  background-color: #0f1115;
}

/* Custom Dark Inputs */
.custom-input >>> .v-input__slot {
  background-color: rgba(255, 255, 255, 0.03) !important;
  border-radius: 8px !important;
}

.custom-input >>> .v-text-field__slot input {
  color: white !important;
}

.custom-input >>> fieldset {
  border-color: rgba(255, 255, 255, 0.15) !important;
}

.custom-input.v-input--is-focused >>> fieldset {
  border-color: #D32F2F !important;
}

/* Placeholder color */
.custom-input >>> input::placeholder {
  color: rgba(255, 255, 255, 0.3) !important;
}

/* Checkbox label color */
.white--text >>> .v-label {
  color: rgba(255, 255, 255, 0.8) !important;
}

/* Fix to ensure full height across the whole page */
html, body, #__nuxt, #__layout {
  height: 100%;
  margin: 0;
  padding: 0;
}

/* Mobile adjustments */
@media (max-width: 960px) {
  .mobile-hero {
    width: 100%;
    background: linear-gradient(135deg, #C62828 0%, #7F0000 100%);
    padding: 40px 24px;
    border-bottom-left-radius: 24px;
    border-bottom-right-radius: 24px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    margin-bottom: 20px;
  }
  
  .form-wrapper {
    padding: 24px 16px;
  }

  .dark-bg {
    background: radial-gradient(circle at top, rgba(211, 47, 47, 0.1) 0%, #0f1115 40%) !important;
    justify-content: flex-start !important;
    padding-top: 0 !important;
  }
}
</style>