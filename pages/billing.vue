<template>
  <div class="billing-page">
    <!-- Header -->
    <div class="header-section">
      <div>
        <h1 class="page-title">Billing & Subscription</h1>
        <p class="page-subtitle">Manage your plan and payment details.</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-10">
      <v-progress-circular indeterminate color="primary" size="50"></v-progress-circular>
      <p class="mt-3 text-grey">Loading billing details...</p>
    </div>

    <template v-else>
      <!-- Status Alert -->
      <v-alert 
        v-if="subscription" 
        :type="alertType" 
        outlined 
        class="mb-6 text-left"
      >
        <div class="font-weight-bold text-subtitle-1 mb-1">
          Current Plan: {{ subscription.plan.name }}
        </div>
        <div v-if="subscription.status === 'TRIAL'">
          Your free trial ends on <strong>{{ formatDate(subscription.trialEndsAt) }}</strong>.
          Upgrade now to keep your shop running without interruption.
        </div>
        <div v-if="subscription.status === 'ACTIVE'">
          Your subscription is active. Next billing date: <strong>{{ formatDate(subscription.currentPeriodEnd) }}</strong>.
        </div>
        <div v-if="subscription.status === 'PAST_DUE' || subscription.status === 'SUSPENDED'" class="font-weight-bold">
          Your account is currently locked because your trial or subscription has expired. 
          Please select a plan below to reactivate your account immediately.
        </div>
      </v-alert>

      <!-- Plans Grid -->
      <v-row>
        <v-col v-for="plan in plans" :key="plan.code" cols="12" md="6" lg="4">
          <v-card 
            class="plan-card" 
            :class="{ 'active-plan': subscription?.planId === plan.id }" 
            outlined 
            elevation="0"
          >
            <div class="plan-header">
              <h2 class="plan-name">{{ plan.name }}</h2>
              <div class="plan-price">
                KES {{ formatMoney(plan.priceKes) }} <span class="price-period">/ month</span>
              </div>
            </div>
            
            <v-divider></v-divider>
            
            <v-card-text class="py-4">
              <ul class="feature-list">
                <li>
                  <v-icon small color="#10b981" class="mr-2">mdi-check-circle</v-icon> 
                  <strong>{{ plan.maxBranches }}</strong> Branch{{ plan.maxBranches > 1 ? 'es' : '' }}
                </li>
                <li>
                  <v-icon small color="#10b981" class="mr-2">mdi-check-circle</v-icon> 
                  <strong>{{ plan.maxUsers }}</strong> Staff account{{ plan.maxUsers > 1 ? 's' : '' }}
                </li>
                <li>
                  <v-icon small color="#10b981" class="mr-2">mdi-check-circle</v-icon> 
                  {{ plan.maxRepairs ? plan.maxRepairs + ' Repairs / mo' : 'Unlimited Repairs' }}
                </li>
                <li>
                  <v-icon small color="#10b981" class="mr-2">mdi-check-circle</v-icon> 
                  POS & Inventory
                </li>
                <li v-if="plan.features?.csvImport">
                  <v-icon small color="#10b981" class="mr-2">mdi-check-circle</v-icon> 
                  Bulk CSV Import
                </li>
              </ul>
            </v-card-text>

            <v-card-actions class="pa-4">
              <v-btn 
                block 
                class="btn-primary" 
                height="46"
                :loading="checkoutLoading === plan.code"
                :disabled="isCurrentActivePlan(plan)"
                @click="subscribe(plan.code)"
              >
                {{ isCurrentActivePlan(plan) ? 'Current Plan' : 'Upgrade to ' + plan.name }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </div>
</template>

<script>
export default {
  // Assuming 'authenticated' is your Nuxt middleware that checks for a token
  middleware: ['authenticated'], 
  
  data() {
    return {
      loading: true,
      checkoutLoading: null,
      plans: [],
      subscription: null,
    }
  },

  computed: {
    alertType() {
      if (!this.subscription) return 'info'
      if (this.subscription.status === 'ACTIVE') return 'success'
      if (this.subscription.status === 'TRIAL') return 'warning'
      return 'error' // PAST_DUE or SUSPENDED
    }
  },

  async mounted() {
    await this.fetchData()
  },

  methods: {
    async fetchData() {
      this.loading = true
      try {
        // Fetch available plans and current subscription in parallel
        const [plansRes, subRes] = await Promise.all([
          this.$axios.$get('/api/billing/plans'),
          this.$axios.$get('/api/billing/subscription')
        ])
        this.plans = plansRes
        this.subscription = subRes
      } catch (e) {
        console.error('Failed to load billing data', e)
      } finally {
        this.loading = false
      }
    },

    async subscribe(planCode) {
      if (this.checkoutLoading) return
      this.checkoutLoading = planCode

      try {
        // In production, this endpoint would return an M-Pesa STK push prompt 
        // or a Stripe checkout URL. Right now, our backend activates it instantly.
        await this.$axios.$post('/api/billing/subscribe', { planCode })
        
        // Re-fetch the subscription to update the UI state immediately
        this.subscription = await this.$axios.$get('/api/billing/subscription')
        
        // Redirect them to the dashboard since they are now paid up
        this.$router.push('/dashboard')
        
      } catch (e) {
        alert(e.response?.data?.error || 'Failed to process subscription. Please try again.')
      } finally {
        this.checkoutLoading = null
      }
    },

    isCurrentActivePlan(plan) {
      return this.subscription?.status === 'ACTIVE' && this.subscription?.planId === plan.id
    },

    formatMoney(val) {
      return new Intl.NumberFormat('en-KE').format(val || 0)
    },

    formatDate(dateString) {
      if (!dateString) return '—'
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
      })
    }
  }
}
</script>

<style scoped>
.billing-page {
  padding: 24px;
  max-width: 1000px;
  margin: 0 auto;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Header */
.header-section { margin-bottom: 2rem; text-align: center; }
.page-title { font-size: 1.75rem; font-weight: 800; margin: 0; letter-spacing: -0.5px; color: #121212; }
.page-subtitle { color: #64748b; margin: 4px 0 0; font-size: 0.95rem; }

/* Plan Cards */
.plan-card {
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.plan-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.04) !important;
}
.active-plan {
  border: 2px solid #D32F2F;
  background: #FFF7F7;
}

.plan-header {
  padding: 24px;
  text-align: center;
}
.plan-name {
  font-size: 1.25rem;
  font-weight: 800;
  color: #121212;
  margin: 0 0 8px 0;
}
.plan-price {
  font-size: 1.8rem;
  font-weight: 800;
  color: #D32F2F;
  letter-spacing: -0.5px;
}
.price-period {
  font-size: 0.9rem;
  font-weight: 600;
  color: #64748b;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.feature-list li {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 0.9rem;
  color: #334155;
}

.btn-primary {
  background-color: #D32F2F !important;
  color: white !important;
  font-weight: 600 !important;
  text-transform: none !important;
  border-radius: 8px !important;
  letter-spacing: 0 !important;
  transition: background 0.2s ease;
}
.btn-primary:hover:not(:disabled) {
  background-color: #B71C1C !important;
}
.btn-primary:disabled {
  background-color: #e2e8f0 !important;
  color: #94a3b8 !important;
}
</style>