<template>
  <div class="billing-page">
    <div class="header-section">
      <div>
        <h1 class="page-title">Billing & Subscription</h1>
        <p class="page-subtitle">Manage your plan and payment details.</p>
      </div>
    </div>

    <div v-if="loading" class="text-center py-10">
      <v-progress-circular indeterminate color="primary" size="50"></v-progress-circular>
    </div>

    <template v-else>
      <v-alert v-if="subscription" :type="alertType" outlined class="mb-6 text-left">
        <div class="font-weight-bold text-subtitle-1 mb-1">
          Current Plan: {{ subscription.plan.name }}
        </div>
        <div v-if="subscription.status === 'TRIAL'">
          Your free trial ends on <strong>{{ formatDate(subscription.trialEndsAt) }}</strong>.
        </div>
        <div v-if="subscription.status === 'ACTIVE'">
          Next billing date: <strong>{{ formatDate(subscription.currentPeriodEnd) }}</strong>.
        </div>
        <div v-if="subscription.status === 'PAST_DUE' || subscription.status === 'SUSPENDED'" class="font-weight-bold">
          Your account is locked. Please select a plan below to reactivate.
        </div>
      </v-alert>

      <v-row>
        <v-col v-for="plan in plans" :key="plan.code" cols="12" md="6" lg="4">
          <v-card class="plan-card" :class="{ 'active-plan': subscription?.planId === plan.id }" outlined elevation="0">
            <div class="plan-header">
              <h2 class="plan-name">{{ plan.name }}</h2>
              <div class="plan-price">KES {{ formatMoney(plan.priceKes) }} <span class="price-period">/ month</span></div>
            </div>
            <v-divider></v-divider>
            <v-card-text class="py-4">
              <ul class="feature-list">
                <li><v-icon small color="#10b981" class="mr-2">mdi-check-circle</v-icon> <strong>{{ plan.maxBranches }}</strong> Branch{{ plan.maxBranches > 1 ? 'es' : '' }}</li>
                <li><v-icon small color="#10b981" class="mr-2">mdi-check-circle</v-icon> <strong>{{ plan.maxUsers }}</strong> Staff account{{ plan.maxUsers > 1 ? 's' : '' }}</li>
                <li><v-icon small color="#10b981" class="mr-2">mdi-check-circle</v-icon> {{ plan.maxRepairs ? plan.maxRepairs + ' Repairs / mo' : 'Unlimited Repairs' }}</li>
              </ul>
            </v-card-text>
            <v-card-actions class="pa-4">
              <v-btn block class="btn-primary" :disabled="isCurrentActivePlan(plan)" @click="openPaymentDialog(plan)">
                {{ isCurrentActivePlan(plan) ? 'Current Plan' : 'Upgrade to ' + plan.name }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- Manual Payment Dialog -->
    <v-dialog v-model="paymentDialog" max-width="480px" persistent>
      <v-card class="dialog-card">
        <div class="dialog-header">
          <h3>Pay via M-Pesa</h3>
          <v-btn icon small color="grey" @click="paymentDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </div>
        
        <v-card-text class="pt-4">
          <v-alert color="info" outlined dense class="mb-4">
            <div class="font-weight-bold text-subtitle-1 mb-1">Pay KES {{ formatMoney(selectedPlan?.priceKes) }}</div>
            <div>Pochi la Biashara: <strong>0746291229</strong></div>
            <div>Account Name: <strong>RepairHub Subscription</strong></div>
          </v-alert>

          <p class="text-body-2 mb-4">
            After completing the payment on your phone, enter the M-Pesa receipt code below to activate your account.
          </p>

          <v-text-field
            v-model="mpesaCode"
            label="M-Pesa Receipt Code (e.g. SGR7XK2LQ9)"
            outlined dense color="primary"
            :disabled="processing"
            hide-details
          />

          <v-alert v-if="paymentError" type="error" dense outlined class="mt-4">
            {{ paymentError }}
          </v-alert>
        </v-card-text>
        
        <v-card-actions class="px-6 pb-6">
          <v-spacer />
          <v-btn text :disabled="processing" @click="paymentDialog = false">Cancel</v-btn>
          <v-btn class="btn-primary" :loading="processing" @click="submitManualPayment">
            Confirm Payment
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  middleware: ['authenticated'],
  data() {
    return {
      loading: true,
      plans: [],
      subscription: null,
      paymentDialog: false,
      selectedPlan: null,
      mpesaCode: '',
      processing: false,
      paymentError: ''
    }
  },
  computed: {
    alertType() {
      if (!this.subscription) return 'info'
      if (this.subscription.status === 'ACTIVE') return 'success'
      if (this.subscription.status === 'TRIAL') return 'warning'
      return 'error'
    }
  },
  async mounted() {
    await this.fetchData()
  },
  methods: {
    async fetchData() {
      this.loading = true
      try {
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
    openPaymentDialog(plan) {
      this.selectedPlan = plan
      this.mpesaCode = ''
      this.paymentError = ''
      this.paymentDialog = true
    },
    async submitManualPayment() {
      if (!this.mpesaCode || this.mpesaCode.length < 8) {
        this.paymentError = 'Please enter a valid M-Pesa receipt code.'
        return
      }
      this.processing = true
      this.paymentError = ''
      try {
        await this.$axios.$post('/api/billing/manual-subscribe', {
          planCode: this.selectedPlan.code,
          mpesaCode: this.mpesaCode.toUpperCase().trim()
        })
        this.paymentDialog = false
        alert('Payment submitted! We will verify your code and activate your account shortly.')
        await this.fetchData()
      } catch (e) {
        this.paymentError = e.response?.data?.error || 'Failed to submit payment.'
      } finally {
        this.processing = false
      }
    },
    isCurrentActivePlan(plan) {
      return this.subscription?.status === 'ACTIVE' && this.subscription?.planId === plan.id
    },
    formatMoney(val) { return new Intl.NumberFormat('en-KE').format(val || 0) },
    formatDate(val) { 
      if (!val) return '—'
      return new Date(val).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) 
    }
  }
}
</script>

<style scoped>
.billing-page { padding: 24px; max-width: 1000px; margin: 0 auto; font-family: 'Inter', sans-serif; }
.header-section { margin-bottom: 2rem; text-align: center; }
.page-title { font-size: 1.75rem; font-weight: 800; margin: 0; color: #121212; }
.page-subtitle { color: #64748b; margin: 4px 0 0; font-size: 0.95rem; }
.plan-card { border-radius: 16px; border: 1px solid #e2e8f0; height: 100%; display: flex; flex-direction: column; }
.active-plan { border: 2px solid #D32F2F; background: #FFF7F7; }
.plan-header { padding: 24px; text-align: center; }
.plan-name { font-size: 1.25rem; font-weight: 800; color: #121212; margin: 0 0 8px 0; }
.plan-price { font-size: 1.8rem; font-weight: 800; color: #D32F2F; }
.price-period { font-size: 0.9rem; font-weight: 600; color: #64748b; }
.feature-list { list-style: none; padding: 0; margin: 0; }
.feature-list li { display: flex; align-items: center; margin-bottom: 12px; font-size: 0.9rem; color: #334155; }
.btn-primary { background-color: #D32F2F !important; color: white !important; font-weight: 600 !important; text-transform: none !important; border-radius: 8px !important; }
.btn-primary:disabled { background-color: #e2e8f0 !important; color: #94a3b8 !important; }
.dialog-card { border-radius: 16px !important; }
.dialog-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid #e2e8f0; background: #f8fafc; }
.dialog-header h3 { margin: 0; font-weight: 800; font-size: 1.2rem; color: #0f172a; }
</style>