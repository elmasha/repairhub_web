<template>
  <div class="register-wrapper">
    <v-container fluid class="fill-height pa-0 ma-0">
      <v-row no-gutters class="fill-height ma-0">
        
        <!-- LEFT PANEL (Brand & Steps) - Hidden on Mobile -->
        <v-col cols="12" md="6" class="left-panel d-none d-md-flex flex-column align-center justify-center">
          <div class="left-content text-center">
            <!-- Logo -->
            <div class="mb-8 d-flex align-center justify-center">
              <v-icon size="36" color="white" class="mr-3">mdi-cellphone-cog</v-icon>
              <span class="text-h4 font-weight-bold white--text">RepairHub</span>
            </div>
            
            <h1 class="text-h4 font-weight-bold white--text mb-2">Get Started with Us</h1>
            <p class="text-body-1 white--text mb-10" style="opacity: 0.9;">
              Complete these easy steps to register<br>your account.
            </p>

            <!-- Steps -->
            <div class="steps-container">
              <div class="step-item active-step">
                <div class="step-number">1</div>
                <div class="step-text">
                  <div class="font-weight-bold white--text">Sign up your account</div>
                </div>
              </div>
              <div class="step-item">
                <div class="step-number">2</div>
                <div class="step-text">
                  <div class="font-weight-bold white--text">Set up your workspace</div>
                </div>
              </div>
              <div class="step-item">
                <div class="step-number">3</div>
                <div class="step-text">
                  <div class="font-weight-bold white--text">Set up your profile</div>
                </div>
              </div>
            </div>
          </div>
        </v-col>

        <!-- RIGHT PANEL (Form) -->
        <v-col cols="12" md="6" class="right-panel d-flex flex-column align-center justify-center">
          
          <!-- MOBILE HERO HEADER (Hidden on Desktop) -->
          <div class="mobile-hero d-md-none">
            <div class="d-flex align-center mb-4">
              <v-icon size="32" color="white" class="mr-2">mdi-cellphone-cog</v-icon>
              <span class="text-h5 font-weight-bold white--text">RepairHub</span>
            </div>
            <h2 class="text-h5 font-weight-bold white--text mb-1">Get Started with Us</h2>
            <p class="text-body-2 white--text" style="opacity: 0.8;">Complete these easy steps to register your account.</p>
          </div>

          <div class="form-container">
            
            <div class="text-center mb-8 d-none d-md-block">
              <h2 class="text-h5 font-weight-bold white--text mb-1">Sign Up Account</h2>
              <p class="text-body-2 white--text" style="opacity: 0.8;">Enter your personal data to create your account.</p>
            </div>

            <v-form ref="form" v-model="valid" @submit.prevent="handleRegister">
              
              <!-- Business Name -->
              <div class="input-group">
                <label class="input-label">Business Name</label>
                <v-text-field
                  v-model.trim="form.businessName"
                  placeholder="e.g. Fixit Phones"
                  outlined dense dark
                  :rules="[rules.required, rules.min2]"
                  :disabled="loading"
                  @keyup.enter="handleRegister"
                  class="dark-input"
                />
              </div>

              <!-- Business Email -->
              <div class="input-group">
                <label class="input-label">Business Email</label>
                <v-text-field
                  v-model.trim="form.email"
                  placeholder="e.g. john@mail.com"
                  type="email"
                  outlined dense dark
                  :rules="[rules.required, rules.email]"
                  :disabled="loading"
                  @keyup.enter="handleRegister"
                  class="dark-input"
                />
              </div>

              <!-- Owner Name & Password -->
              <v-row dense>
                <v-col cols="12" sm="6">
                  <div class="input-group">
                    <label class="input-label">Owner Name</label>
                    <v-text-field
                      v-model.trim="form.ownerName"
                      placeholder="eg. John"
                      outlined dense dark
                      :rules="[rules.required, rules.min2]"
                      :disabled="loading"
                      @keyup.enter="handleRegister"
                      class="dark-input"
                    />
                  </div>
                </v-col>
                <v-col cols="12" sm="6">
                  <div class="input-group">
                    <label class="input-label">Password</label>
                    <v-text-field
                      v-model="form.password"
                      placeholder="Enter your password"
                      :type="showPassword ? 'text' : 'password'"
                      :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                      @click:append="showPassword = !showPassword"
                      outlined dense dark
                      :rules="[rules.required, rules.min8]"
                      :disabled="loading"
                      @keyup.enter="handleRegister"
                      class="dark-input"
                      hint="Must be at least 8 characters."
                      persistent-hint
                    />
                  </div>
                </v-col>
              </v-row>

              <!-- Errors -->
              <v-alert
                v-if="serverFieldErrors"
                type="error"
                dense
                outlined
                class="mt-4 text-left dark-alert"
              >
                <div class="font-weight-medium mb-1">Please fix the following:</div>
                <ul class="pl-4">
                  <li v-for="(msgs, field) in serverFieldErrors" :key="field">
                    <strong>{{ field }}:</strong> {{ msgs.join(', ') }}
                  </li>
                </ul>
              </v-alert>

              <v-alert
                v-else-if="error"
                type="error"
                dense
                outlined
                class="mt-4 text-left dark-alert"
              >
                {{ error }}
              </v-alert>

              <v-btn
                block
                color="#D32F2F"
                class="white--text font-weight-bold mt-8 text-none"
                height="48"
                elevation="0"
                :loading="loading"
                :disabled="loading"
                @click="handleRegister"
              >
                Sign up
              </v-btn>

              <div class="text-center mt-8 mb-8">
                <span class="text-body-2 white--text" style="opacity: 0.7;">Already have an account? </span>
                <nuxt-link to="/login" class="text-body-2 white--text font-weight-bold text-decoration-none">
                  Log in
                </nuxt-link>
              </div>

            </v-form>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  layout: 'blank',
  data() {
    return {
      form: {
        businessName: '',
        email: '',
        ownerName: '',
        password: '',
      },
      showPassword: false,
      loading: false,
      error: '',
      serverFieldErrors: null,
      valid: false,
      rules: {
        required: (v) => (v !== null && v !== undefined && v !== '') || 'Required',
        min2: (v) => (v && v.trim().length >= 2) || 'At least 2 characters',
        min8: (v) => (v && v.length >= 8) || 'At least 8 characters',
        email: (v) => /.+@.+\..+/.test(v) || 'Enter a valid email',
      },
    }
  },
  methods: {
    generateSlug(name) {
      const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const random = Math.floor(1000 + Math.random() * 9000);
      return `${base}-${random}`;
    },

    async handleRegister() {
      if (this.loading) return
      this.error = ''
      this.serverFieldErrors = null

      if (this.$refs.form && !this.$refs.form.validate()) return

      this.loading = true

      try {
        const slug = this.generateSlug(this.form.businessName)
        const payload = { ...this.form, slug }

        const res = await this.$axios.$post('/api/auth/register', payload)

        await this.$store.dispatch('setSession', {
          accessToken: res.accessToken,
          refreshToken: res.refreshToken,
          user: res.user,
          business: res.business,
          branch: res.branch,
          subscription: res.subscription
        })

        this.$router.push('/dashboard')
      } catch (err) {
        this.handleRegisterError(err)
      } finally {
        this.loading = false
      }
    },

    handleRegisterError(err) {
      const data = err?.response?.data || err?.data
      const apiError = data?.error

      if (apiError && typeof apiError === 'object' && !Array.isArray(apiError)) {
        const fieldErrors = apiError.fieldErrors || {}
        const formErrors = apiError.formErrors || []
        if (Object.keys(fieldErrors).length) {
          this.serverFieldErrors = fieldErrors
          return
        }
        if (formErrors.length) {
          this.error = formErrors.join(', ')
          return
        }
      }

      if (typeof apiError === 'string') {
        this.error = apiError
        return
      }

      if (err?.message === 'Network Error' || !err?.response) {
        this.error = 'Cannot reach the server. Please check your connection.'
        return
      }

      this.error = 'Registration failed. Please check your details and try again.'
    },
  },
}
</script>

<style scoped>
/* Full viewport layout fix */
html, body, #__nuxt, #__layout {
  height: 100%;
  margin: 0;
  padding: 0;
}

/* Allow scrolling */
.register-wrapper {
  background-color: #121212;
  min-height: 100vh;
  width: 100vw;
  overflow-y: auto;
}

/* LEFT PANEL */
.left-panel {
  background: linear-gradient(135deg, #D32F2F 0%, #8B0000 30%, #121212 100%);
  position: relative;
  padding: 40px;
  min-height: 100vh;
}

.left-content { max-width: 320px; }

/* Steps */
.steps-container { display: flex; flex-direction: column; gap: 12px; text-align: left; width: 100%; }
.step-item {
  display: flex; align-items: center; padding: 16px; border-radius: 12px;
  background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05); transition: all 0.3s ease;
}
.step-item.active-step { background: #D32F2F; border-color: #D32F2F; }
.step-number {
  width: 24px; height: 24px; border-radius: 50%; background: rgba(255, 255, 255, 0.2);
  color: white; display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: bold; margin-right: 12px;
}
.active-step .step-number { background: white; color: #D32F2F; }
.step-text { font-size: 14px; }

/* RIGHT PANEL */
.right-panel { 
  padding: 40px; 
  background-color: #121212; 
  min-height: 100vh;
}
.form-container { width: 100%; max-width: 400px; }

/* Inputs */
.input-group { margin-bottom: 16px; }
.input-label { display: block; color: #e2e8f0; font-size: 12px; font-weight: 600; margin-bottom: 6px; }

.dark-input >>> .v-input__slot {
  background-color: #1a1a1a !important;
  border-color: #333 !important;
  border-radius: 8px !important;
}
.dark-input >>> .v-input__slot:hover { border-color: #555 !important; }
.dark-input >>> .v-input__slot:focus-within { border-color: #D32F2F !important; }
.dark-input >>> input { color: white !important; background-color: transparent !important; }
.dark-input >>> .v-text-field__prefix { color: white !important; }
.dark-input >>> .v-messages__message { color: #a3a3a3 !important; }

/* Alerts */
.dark-alert { background-color: #1a1a1a !important; border-color: #D32F2F !important; }

/* Mobile Adjustments */
@media (max-width: 960px) {
  .right-panel {
    background: radial-gradient(circle at top left, rgba(211, 47, 47, 0.15) 0%, #121212 50%) !important;
    padding: 0 !important; 
    display: flex;
    align-items: flex-start; /* Align to top so the hero sits at the top */
    min-height: 100vh;
  }
  
  .mobile-hero {
    width: 100%;
    background: linear-gradient(135deg, #C62828 0%, #7F0000 100%);
    padding: 40px 24px;
    border-bottom-left-radius: 24px;
    border-bottom-right-radius: 24px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    margin-bottom: 32px;
  }

  .form-container {
    padding: 0 24px 40px 24px; 
  }

  .input-group {
    margin-bottom: 24px !important; 
  }
}
</style>