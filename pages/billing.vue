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
      <!-- Current Plan Alert -->
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

      <!-- Plans Grid -->
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

      <!-- Payment History Section -->
      <v-card class="mt-10 custom-table-card" outlined elevation="0">
        <v-card-title class="font-weight-bold text-h6">Payment History</v-card-title>
        <v-simple-table class="premium-table">
          <template #default>
            <thead>
              <tr>
                <th class="text-left">Date</th>
                <th class="text-left">Invoice #</th>
                <th class="text-left">Amount</th>
                <th class="text-left">Reference</th>
                <th class="text-left">Status</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="payment in paymentHistory" :key="payment.id">
                <td class="text-caption text-grey-darken-1">{{ formatDate(payment.createdAt) }}</td>
                <td class="font-weight-bold">{{ payment.invoice?.invoiceNumber || '—' }}</td>
                <td class="font-weight-bold">KES {{ formatMoney(payment.amount) }}</td>
                <td class="text-caption">{{ payment.reference || '—' }}</td>
                <td>
                  <v-chip 
                    :color="payment.invoice?.status === 'paid' ? 'success' : 'warning'" 
                    small text-color="white"
                    class="font-weight-bold"
                  >
                    {{ (payment.invoice?.status || 'PENDING').toUpperCase() }}
                  </v-chip>
                </td>
                <td class="text-right">
                  <v-btn 
                    v-if="payment.invoice?.status === 'pending' && payment.invoice?.externalId"
                    x-small 
                    color="primary" 
                    outlined
                    :loading="checkingHistoryId === payment.id"
                    @click="queryHistoryInvoice(payment.invoice.externalId, payment.id)"
                  >
                    Check Status
                  </v-btn>
                  <span v-else-if="payment.invoice?.status === 'paid'" class="text-caption text-grey">
                    <v-icon small color="success">mdi-check-circle</v-icon> Verified
                  </span>
                </td>
              </tr>
              <tr v-if="!paymentHistory || paymentHistory.length === 0">
                <td colspan="6" class="text-center py-6 text-grey">
                  <v-icon size="32" color="grey lighten-2" class="mb-2">mdi-receipt</v-icon>
                  <div>No payment history yet.</div>
                </td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-card>
    </template>

    <!-- Payment Dialog (Automated Only) -->
    <v-dialog v-model="paymentDialog" max-width="500px" persistent>
      <v-card class="dialog-card">
        <div class="dialog-header">
          <h3>Pay for {{ selectedPlan?.name }}</h3>
          <v-btn icon small color="grey" @click="closePaymentDialog" :disabled="processing || checkingStatus"><v-icon>mdi-close</v-icon></v-btn>
        </div>
        
        <v-card-text class="pt-4">
          <div class="amount-banner mb-4">
            <span class="text-caption text-grey-darken-1">Amount to pay</span>
            <h2 class="text-h5 font-weight-bold mb-0" style="color: #121212;">KES {{ formatMoney(selectedPlan?.priceKes) }}</h2>
          </div>

          <!-- AUTOMATED STK PUSH STATE -->
          <div class="mb-6">
            <template v-if="!stkSent">
              <h4 class="font-weight-bold text-subtitle-2 mb-2">Instant Checkout (M-Pesa Prompt)</h4>
              <p class="text-caption text-grey-darken-1 mb-3">
                Enter your M-Pesa phone number. We will send a prompt to your phone to enter your PIN.
              </p>
              <v-text-field
                v-model="phoneNumber"
                label="M-Pesa Phone Number (e.g. 254712345678)"
                outlined dense color="primary"
                prepend-inner-icon="mdi-phone"
                :disabled="processing"
                hide-details
                class="mb-3"
              />
              <v-btn 
                block 
                class="btn-primary" 
                height="44"
                :loading="processing" 
                @click="initiateIntaSend"
              >
                <v-icon left small>mdi-cellphone-arrow-down</v-icon> Send M-Pesa Prompt
              </v-btn>
            </template>

            <!-- WAITING/PROGRESS STATE -->
            <template v-else>
              <div class="text-center py-2">
                <v-icon v-if="pollCountdown > 0" size="48" color="primary" class="mb-2 pulse-animation">mdi-cellphone-message</v-icon>
                <v-icon v-else size="48" color="warning" class="mb-2">mdi-alert-circle-outline</v-icon>

                <h4 class="font-weight-bold text-subtitle-1 mb-1" v-if="pollCountdown > 0">
                  Waiting for M-Pesa...
                </h4>
                <h4 class="font-weight-bold text-subtitle-1 mb-1 text-warning" v-else>
                  Auto-check stopped
                </h4>
                
                <p class="text-caption text-grey-darken-1 mb-4">
                  <span v-if="pollCountdown > 0">Please check your phone and enter your M-Pesa PIN.</span>
                  <span v-else>If you already paid, click <strong>"Query IntaSend Direct"</strong> below to verify.</span>
                </p>

                <!-- Progress Bar -->
                <v-progress-linear 
                  v-if="pollCountdown > 0"
                  v-model="progressPercentage" 
                  color="success" 
                  height="8" 
                  rounded 
                  striped 
                  class="mb-3"
                ></v-progress-linear>

                <!-- Countdown Text -->
                <div class="text-caption font-weight-bold mb-4" :class="pollCountdown > 0 ? 'text-success' : 'text-warning'">
                  <template v-if="pollCountdown > 0">
                    Checking status in {{ pollCountdown }}s...
                  </template>
                  <template v-else>
                    Auto-check stopped.
                  </template>
                </div>

                <!-- Two states: polling active vs stopped -->
                <v-btn 
                  v-if="pollCountdown > 0"
                  block 
                  outlined
                  color="success"
                  height="44"
                  @click="checkStatus"
                  :loading="checkingStatus"
                >
                  <v-icon left small>mdi-refresh</v-icon> Check Status Now
                </v-btn>
                
                <v-btn 
                  v-else
                  block 
                  color="primary"
                  height="44"
                  @click="queryIntaSend"
                  :loading="checkingStatus"
                >
                  <v-icon left small>mdi-api</v-icon> Query IntaSend Direct
                </v-btn>
              </div>
            </template>
          </div>

          <v-alert v-if="paymentError" type="error" dense outlined class="mt-4 text-left">
            {{ paymentError }}
          </v-alert>
        </v-card-text>
        
        <v-card-actions class="px-6 pb-4">
          <v-spacer />
          <v-btn text :disabled="processing || checkingStatus" @click="closePaymentDialog">Close</v-btn>
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
      paymentHistory: [],
      paymentDialog: false,
      selectedPlan: null,
      
      // IntaSend state
      phoneNumber: '',
      processing: false,
      stkSent: false,
      checkingStatus: false,
      currentInvoiceId: null,
      
      // Polling & Progress state
      pollingInterval: null,
      pollCountdown: 30,
      progressPercentage: 0,
      
      paymentError: '',
      
      // History state
      checkingHistoryId: null
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
  beforeDestroy() {
    this.stopPolling()
  },
  methods: {
    async fetchData() {
      this.loading = true
      try {
        const token = this.$store.state.authToken
        const config = { headers: { Authorization: `Bearer ${token}` } }

        const [plansRes, subRes, historyRes] = await Promise.all([
          this.$axios.$get('/api/billing/plans', config),
          this.$axios.$get('/api/billing/subscription', config),
          this.$axios.$get('/api/billing/history', config)
        ])
        
        this.plans = plansRes
        this.subscription = subRes
        this.paymentHistory = historyRes
        
      } catch (e) {
        console.error('Failed to load billing data', e)
      } finally {
        this.loading = false
      }
    },

    openPaymentDialog(plan) {
      this.selectedPlan = plan
      this.phoneNumber = ''
      this.paymentError = ''
      this.stkSent = false
      this.processing = false
      this.checkingStatus = false
      this.pollCountdown = 30
      this.progressPercentage = 0
      this.currentInvoiceId = null
      this.paymentDialog = true
    },

    closePaymentDialog() {
      if (this.processing || this.checkingStatus) return
      this.stopPolling()
      this.paymentDialog = false
    },
    
    // ── IntaSend Automated STK Push ──
    async initiateIntaSend() {
      if (!this.phoneNumber) {
        this.paymentError = 'Please enter your M-Pesa phone number.'
        return
      }
      
      this.processing = true
      this.paymentError = ''
      
      try {
        const token = this.$store.state.authToken
        const res = await this.$axios.$post('/api/billing/intasend-checkout', {
          planCode: this.selectedPlan.code,
          phoneNumber: this.phoneNumber
        }, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        this.currentInvoiceId = res.invoiceId
        this.stkSent = true
        this.startPolling()
        
      } catch (e) {
        console.error("STK Push error:", e.response?.data)
        const errorMessage = e.response?.data?.error 
                          || e.response?.data?.details?.detail 
                          || e.response?.data?.details?.errors?.[0]?.message 
                          || 'Failed to send M-Pesa prompt.'
        this.paymentError = errorMessage
      } finally {
        this.processing = false
      }
    },

    // ── Polling Logic ──
    startPolling() {
      this.stopPolling()
      this.pollCountdown = 30
      this.progressPercentage = 0
      
      this.pollingInterval = setInterval(async () => {
        this.pollCountdown--
        this.progressPercentage = ((30 - this.pollCountdown) / 30) * 100
        
        if (this.pollCountdown % 3 === 0 && this.pollCountdown > 0) {
          try {
            const token = this.$store.state.authToken
            const config = { headers: { Authorization: `Bearer ${token}` } }
            const sub = await this.$axios.$get('/api/billing/subscription', config)
            
            if (sub.status === 'ACTIVE') {
              this.stopPolling()
              this.subscription = sub
              this.paymentDialog = false
              alert('✅ Payment successful! Your account has been upgraded.')
              await this.fetchData()
              return
            }
          } catch (e) {
            // Ignore network blips
          }
        }

        if (this.pollCountdown <= 0) {
          this.stopPolling()
        }
      }, 1000)
    },

    stopPolling() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval)
        this.pollingInterval = null
      }
    },

    // ── Query IntaSend Directly (Fallback) ──
    async queryIntaSend() {
      if (!this.currentInvoiceId) {
        this.paymentError = 'Missing invoice reference. Please contact support.'
        return
      }
      
      this.checkingStatus = true
      this.paymentError = ''
      
      try {
        const token = this.$store.state.authToken
        
        const response = await this.$axios.$get(
          `/api/billing/check-status/${this.currentInvoiceId}`, 
          { headers: { Authorization: `Bearer ${token}` } }
        )

        const state = response.invoice.state

        if (state === 'COMPLETE') {
          alert('✅ Payment confirmed by M-Pesa! Refreshing your account...')
          this.paymentDialog = false
          await this.fetchData()
        } else if (state === 'FAILED') {
          this.paymentError = `Payment failed: ${response.invoice.failed_reason || 'Unknown error'}`
        } else {
          this.paymentError = 'Payment is still processing on M-Pesa. Please wait a moment and try again.'
        }
      } catch (error) {
        console.error('IntaSend Query Error:', error.response?.data)
        this.paymentError = error.response?.data?.error || 'Could not verify status. Please try again.'
      } finally {
        this.checkingStatus = false
      }
    },

    // ── Manual status check (Checks your own DB) ──
    async checkStatus() {
      this.checkingStatus = true
      this.paymentError = ''
      try {
        await this.fetchData()
        if (this.subscription?.status === 'ACTIVE') {
           this.stopPolling()
           this.paymentDialog = false
           alert('Payment successful! Your account has been upgraded.')
        } else {
           this.paymentError = 'Payment not confirmed in our system yet. Wait a moment or try the "Query IntaSend" button.'
        }
      } catch (e) {
        this.paymentError = 'Failed to check status.'
      } finally {
        this.checkingStatus = false
      }
    },

    // ── Query from Payment History Table ──
    async queryHistoryInvoice(externalId, paymentId) {
      this.checkingHistoryId = paymentId
      try {
        const token = this.$store.state.authToken
        
        const response = await this.$axios.$get(
          `/api/billing/check-status/${externalId}`, 
          { headers: { Authorization: `Bearer ${token}` } }
        )

        const state = response.invoice.state

        if (state === 'COMPLETE') {
          alert('✅ Payment confirmed by M-Pesa! Refreshing your account...')
          await this.fetchData()
        } else if (state === 'FAILED') {
          alert(`Payment failed: ${response.invoice.failed_reason || 'Unknown error'}`)
        } else {
          alert('Payment is still processing on M-Pesa.')
        }
      } catch (error) {
        console.error('Query Error:', error.response?.data)
        alert('Could not verify status. Please try again.')
      } finally {
        this.checkingHistoryId = null
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

.amount-banner {
  background: #f8fafc;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
  border: 1px solid #e2e8f0;
}

/* Table Styles */
.custom-table-card { border-radius: 12px !important; border: 1px solid #e2e8f0 !important; background: #ffffff !important; overflow: hidden; }
.premium-table >>> th {
  font-size: 0.75rem !important; text-transform: uppercase; font-weight: 700 !important;
  color: #64748b !important; background-color: #f8fafc !important;
  padding: 16px !important; border-bottom: 1px solid #e2e8f0 !important;
}
.premium-table >>> td {
  padding: 16px !important; border-bottom: 1px solid #f1f5f9 !important;
  font-size: 0.9rem; vertical-align: middle;
}

/* Pulse animation for the phone icon */
.pulse-animation {
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
}
</style>