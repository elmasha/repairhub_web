<template>
    <v-container class="fill-height reg-bg" fluid>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="10" md="7" lg="6" xl="5">

          <v-card class="elevation-12 reg-card" outlined>

            <!-- Brand bar -->
            <v-toolbar color="#121212" dark flat height="72">
              <v-toolbar-title class="font-weight-bold text-h5">
                <span style="color: #D32F2F;">Repair</span>Hub POS
              </v-toolbar-title>
              <v-spacer></v-spacer>
              <v-btn text color="white" to="/" class="text-none font-weight-medium">
                <v-icon left small>mdi-arrow-left</v-icon> Home
              </v-btn>
            </v-toolbar>

            <v-card-text class="pt-8 px-6">
              <div class="text-center mb-6">
                <h2 class="text-h5 font-weight-bold text--primary">Create Your Account</h2>
                <p class="text-subtitle-2 grey--text mt-1">
                  Set up your business and start managing repairs.
                </p>
              </div>

              <v-form ref="form" v-model="valid" @submit.prevent="handleRegister">

                <!-- Business details -->
                <v-row dense>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model.trim="form.businessName"
                      label="Business Name"
                      prepend-inner-icon="mdi-store-outline"
                      color="primary"
                      outlined
                      :rules="[rules.required, rules.min2]"
                      :disabled="loading"
                      @keyup.enter="handleRegister"
                    />
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model.trim="form.slug"
                      label="Slug (e.g. fixit-phones)"
                      prepend-inner-icon="mdi-link-variant"
                      color="primary"
                      outlined
                      :rules="[rules.required, rules.slug]"
                      :disabled="loading"
                      hint="Lowercase letters, numbers, hyphens only"
                      persistent-hint
                      @keyup.enter="handleRegister"
                    />
                  </v-col>
                </v-row>

                <!-- Business email -->
                <v-text-field
                  v-model.trim="form.email"
                  label="Business Email"
                  prepend-inner-icon="mdi-email-outline"
                  type="email"
                  autocomplete="email"
                  color="primary"
                  outlined
                  :rules="[rules.required, rules.email]"
                  :disabled="loading"
                  @keyup.enter="handleRegister"
                />

                <!-- Owner + password -->
                <v-row dense>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model.trim="form.ownerName"
                      label="Owner Full Name"
                      prepend-inner-icon="mdi-account-outline"
                      color="primary"
                      outlined
                      :rules="[rules.required, rules.min2]"
                      :disabled="loading"
                      @keyup.enter="handleRegister"
                    />
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="form.password"
                      label="Password"
                      prepend-inner-icon="mdi-lock-outline"
                      :type="showPassword ? 'text' : 'password'"
                      :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                      @click:append="showPassword = !showPassword"
                      autocomplete="new-password"
                      color="primary"
                      outlined
                      :rules="[rules.required, rules.min8]"
                      :disabled="loading"
                      @keyup.enter="handleRegister"
                    />
                  </v-col>
                </v-row>

                <!-- Errors -->
                <v-alert
                  v-if="serverFieldErrors"
                  type="error"
                  dense
                  outlined
                  class="mt-2 mb-1 text-left"
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
                  class="mt-2 mb-1 text-left"
                >
                  {{ error }}
                </v-alert>

              </v-form>
            </v-card-text>

            <v-divider />

            <v-card-actions class="px-6 py-4">
              <v-btn text color="#121212" to="/login" class="font-weight-bold text-none">
                Already have an account? Login
              </v-btn>
              <v-spacer />
              <v-btn
                color="#D32F2F"
                :loading="loading"
                :disabled="loading"
                @click="handleRegister"
                class="white--text font-weight-bold px-6 text-none"
                height="44"
              >
                REGISTER
              </v-btn>
            </v-card-actions>
          </v-card>

        </v-col>
      </v-row>
    </v-container>
  
</template>

<script>
export default {
   layout: 'blank' ,
  data() {
    return {
      form: {
        businessName: '',
        slug: '',
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
        slug: (v) =>
          /^[a-z0-9-]{2,}$/.test(v) || 'Lowercase letters, numbers, hyphens (min 2)',
      },
    }
  },

  methods: {
    async handleRegister() {
      if (this.loading) return
      this.error = ''
      this.serverFieldErrors = null

      if (this.$refs.form && !this.$refs.form.validate()) return

      this.loading = true

      try {
        const res = await this.$axios.$post('/api/auth/register', this.form)

        await this.$store.dispatch('setSession', {
          accessToken: res.accessToken,
          refreshToken: res.refreshToken,
          user: res.user,
          business: res.business,
          branch: res.branch,
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
.reg-bg {
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
}
.reg-card {
  border-radius: 12px;
  overflow: hidden;
  transition: box-shadow 0.3s ease;
}
.reg-card:hover {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12) !important;
}
</style>