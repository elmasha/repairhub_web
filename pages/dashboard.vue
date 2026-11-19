<template>
  <div class="dashboard-container">
    <!-- Header -->
    <div class="header-section">
      <div>
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Welcome back, here is what's happening today.</p>
      </div>
      <div class="action-buttons">
        <v-btn class="btn-primary mr-3" to="/repairs" elevation="0" rounded :disabled="billingDue">
          <v-icon left small>mdi-plus</v-icon> New Repair
        </v-btn>
        <v-btn outlined class="btn-outline" to="/pos" elevation="0" rounded :disabled="billingDue">
          <v-icon left small>mdi-cash-register</v-icon> Open POS
        </v-btn>
      </div>
    </div>

    <!-- BILLING DUE ALERT -->
    <v-alert
      v-if="billingDue"
      type="error"
      prominent
      border="left"
      elevation="2"
      class="mb-6"
    >
      <div class="d-flex align-center flex-wrap">
        <v-icon left large class="mr-3">mdi-alert-octagon</v-icon>
        <div style="flex: 1;">
          <div class="font-weight-bold text-h6">Account Suspended</div>
          <div>{{ billingMessage }} You can still view data, but new repairs and sales are disabled.</div>
        </div>
        <v-btn color="white" dark class="ml-4 text-none font-weight-bold" @click="openBillingDialog">
          Pay Now
        </v-btn>
      </div>
    </v-alert>

    <div v-if="loading" class="text-center py-10">
      <v-progress-circular indeterminate color="primary" size="50" />
    </div>

    <div v-else>
      <!-- Stat Cards -->
      <v-row class="mb-4">
        <v-col cols="6" sm="6" md="3">
          <v-card class="stat-card" elevation="0" :to="billingDue ? null : '/repairs'" :style="billingDue ? 'opacity: 0.6; pointer-events: none;' : ''">
            <div class="stat-border bg-red" />
            <div class="stat-content">
              <div>
                <div class="stat-label">Active Repairs</div>
                <div class="stat-value">{{ stats.activeRepairs }}</div>
              </div>
              <div class="stat-icon-wrapper bg-red-light d-none d-sm-flex">
                <v-icon size="28" color="#D32F2F">mdi-tools</v-icon>
              </div>
            </div>
          </v-card>
        </v-col>

        <v-col cols="6" sm="6" md="3">
          <v-card class="stat-card" elevation="0" :to="billingDue ? null : '/payments'" :style="billingDue ? 'opacity: 0.6; pointer-events: none;' : ''">
            <div class="stat-border bg-green" />
            <div class="stat-content">
              <div>
                <div class="stat-label">Today's Sales</div>
                <div class="stat-value">KES {{ formatMoney(stats.todaySales) }}</div>
              </div>
              <div class="stat-icon-wrapper bg-green-light d-none d-sm-flex">
                <v-icon size="28" color="#4CAF50">mdi-cash</v-icon>
              </div>
            </div>
          </v-card>
        </v-col>

        <v-col cols="6" sm="6" md="3">
          <v-card class="stat-card" elevation="0" :to="billingDue ? null : '/inventory'" :style="billingDue ? 'opacity: 0.6; pointer-events: none;' : ''">
            <div class="stat-border bg-orange" />
            <div class="stat-content">
              <div>
                <div class="stat-label">Low Stock Items</div>
                <div class="stat-value" :class="{ 'text-error': stats.lowStock > 0 }">{{ stats.lowStock }}</div>
              </div>
              <div class="stat-icon-wrapper bg-orange-light d-none d-sm-flex">
                <v-icon size="28" color="#FFC107">mdi-package-variant-closed</v-icon>
              </div>
            </div>
          </v-card>
        </v-col>

        <v-col cols="6" sm="6" md="3">
          <v-card class="stat-card" elevation="0" :to="billingDue ? null : '/customers'" :style="billingDue ? 'opacity: 0.6; pointer-events: none;' : ''">
            <div class="stat-border bg-blue" />
            <div class="stat-content">
              <div>
                <div class="stat-label">Total Customers</div>
                <div class="stat-value">{{ stats.totalCustomers }}</div>
              </div>
              <div class="stat-icon-wrapper bg-blue-light d-none d-sm-flex">
                <v-icon size="28" color="#1976D2">mdi-account-group</v-icon>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Quick Actions -->
      <v-row class="mb-6">
        <v-col cols="12">
          <v-card class="quick-actions-card" elevation="0">
            <v-card-text class="pa-4">
              <v-row dense>
                <v-col cols="6" sm="3" v-for="action in quickActions" :key="action.title">
                  <v-btn
                    block
                    class="action-tile"
                    :to="billingDue ? null : action.to"
                    elevation="0"
                    height="90"
                    :disabled="billingDue"
                  >
                    <div class="d-flex flex-column align-center">
                      <v-icon :color="billingDue ? 'grey' : action.color" size="32" class="mb-2">{{ action.icon }}</v-icon>
                      <span class="action-text" :style="billingDue ? 'color: grey;' : ''">{{ action.title }}</span>
                    </div>
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Main Content Row (Recent Repairs & Low Stock) -->
      <v-row>
        <v-col cols="12" lg="8">
          <v-card class="custom-card" elevation="0" :style="billingDue ? 'opacity: 0.6;' : ''">
            <v-card-title class="card-header">
              <span class="card-title-text">Recent Repairs</span>
              <v-spacer />
              <v-btn text color="#D32F2F" class="font-weight-bold text-none" small :to="billingDue ? null : '/repairs'" :disabled="billingDue">
                View All <v-icon right small>mdi-arrow-right</v-icon>
              </v-btn>
            </v-card-title>
            <v-divider />
            <v-simple-table class="custom-table">
              <template v-slot:default>
                <thead>
                  <tr>
                    <th class="text-left">Ticket</th>
                    <th class="text-left">Customer</th>
                    <th class="text-left">Device</th>
                    <th class="text-left">Status</th>
                    <th class="text-right">Time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="repair in recentRepairs" :key="repair.id" class="repair-row" @click="!billingDue && $router.push('/repairs')">
                    <td class="font-weight-bold" style="color: #121212;">
                      {{ repair.ticketNumber || '#' + repair.id.slice(-4).toUpperCase() }}
                    </td>
                    <td><div class="font-weight-medium">{{ repair.customer?.name || '—' }}</div></td>
                    <td>{{ repair.deviceBrand }} {{ repair.deviceModel }}</td>
                    <td>
                      <v-chip :color="getStatusColor(repair.status)" x-small text-color="white" class="status-chip">
                        {{ formatStatus(repair.status) }}
                      </v-chip>
                    </td>
                    <td class="text-right text-caption text-grey">{{ timeAgo(repair.createdAt) }}</td>
                  </tr>
                  <tr v-if="recentRepairs.length === 0">
                    <td colspan="5" class="text-center py-8 text-grey">
                      <v-icon size="48" color="grey lighten-2" class="mb-2">mdi-tools</v-icon>
                      <div>No recent repairs found.</div>
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </v-card>
        </v-col>

        <v-col cols="12" lg="4">
          <v-card class="custom-card" elevation="0" :style="billingDue ? 'opacity: 0.6; pointer-events: none;' : ''">
            <v-card-title class="card-header">
              <span class="card-title-text">Low Stock Alerts</span>
              <v-spacer />
              <v-chip v-if="lowStockParts.length > 0" color="error" x-small dark>{{ lowStockParts.length }}</v-chip>
            </v-card-title>
            <v-divider />
            <v-list class="alert-list" dense>
              <v-list-item v-for="part in lowStockParts" :key="part.id" class="alert-item">
                <v-list-item-icon>
                  <div :class="part.quantity <= 2 ? 'icon-bg-red' : 'icon-bg-orange'">
                    <v-icon :color="part.quantity <= 2 ? '#D32F2F' : '#FFC107'" small>
                      {{ part.quantity <= 2 ? 'mdi-alert-circle' : 'mdi-alert' }}
                    </v-icon>
                  </div>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title class="font-weight-bold">{{ part.name }}</v-list-item-title>
                  <v-list-item-subtitle :class="part.quantity <= 2 ? 'text-error' : 'text-warning'" class="font-weight-bold text-caption">
                    Only {{ part.quantity }} left in stock
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item v-if="lowStockParts.length === 0">
                <v-list-item-content class="text-center text-grey py-8">
                  <v-icon color="success" size="40" class="mb-2">mdi-check-circle-outline</v-icon>
                  <div class="font-weight-bold">All stock levels are healthy.</div>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- BILLING RENEWAL DIALOG -->
    <v-dialog v-model="billingDialog" max-width="500px" persistent>
      <v-card class="dialog-card">
        <div class="dialog-header bg-white">
          <h3 class="font-weight-bold">Renew Subscription</h3>
          <v-btn icon small color="grey" @click="closeBillingDialog"><v-icon>mdi-close</v-icon></v-btn>
        </div>
        
        <v-card-text class="pt-4">
          <v-alert v-if="!plans.length" type="info" dense outlined>
            Loading available plans...
          </v-alert>

          <div v-else>
            <v-select
              v-model="selectedPlan"
              :items="plans"
              item-text="name"
              item-value="code"
              label="Select a Plan"
              outlined
              dense
              color="primary"
              return-object
              @change="resetPaymentForm"
            >
              <template v-slot:item="{ item }">
                <div class="d-flex justify-space-between align-center" style="width: 100%;">
                  <span>{{ item.name }}</span>
                  <strong class="text-primary">KES {{ formatMoney(item.priceKes) }}/mo</strong>
                </div>
              </template>
            </v-select>

            <v-alert v-if="selectedPlan" color="info" outlined dense class="mt-4 mb-4">
              <div class="font-weight-bold text-subtitle-1 mb-1">Pay KES {{ formatMoney(selectedPlan.priceKes) }}</div>
              <div>Pochi la Biashara: <strong>0746291229</strong></div>
              <div>Account Name: <strong>RepairHub Subscription</strong></div>
            </v-alert>

            <p v-if="selectedPlan" class="text-body-2 mb-4">
              After completing the payment on your phone, enter the M-Pesa receipt code below to activate your account.
            </p>

            <v-text-field
              v-if="selectedPlan"
              v-model="mpesaCode"
              label="M-Pesa Receipt Code (e.g. SGR7XK2LQ9)"
              outlined dense color="primary"
              :disabled="processing"
              hide-details
            />

            <v-alert v-if="paymentError" type="error" dense outlined class="mt-4">
              {{ paymentError }}
            </v-alert>
          </div>
        </v-card-text>
        
        <v-card-actions class="px-6 pb-6">
          <v-spacer />
          <!-- Only allow closing if they aren't hard-locked (to force payment) -->
          <v-btn text :disabled="processing || billingDue" @click="closeBillingDialog">Cancel</v-btn>
          <v-btn class="btn-primary" :loading="processing" :disabled="!selectedPlan || !mpesaCode" @click="submitPayment">
            Confirm Payment
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: 'DashboardPage',
  middleware: 'authenticated',

  data() {
    return {
      loading: true,
      billingDue: false,
      billingMessage: '',
      stats: { activeRepairs: 0, todaySales: 0, lowStock: 0, totalCustomers: 0 },
      periodStats: { today: 0, week: 0, month: 0, allTime: 0 },
      recentRepairs: [],
      lowStockParts: [],
      
      quickActions: [
        { title: 'New Repair', icon: 'mdi-wrench', color: '#D32F2F', to: '/repairs' },
        { title: 'Add Customer', icon: 'mdi-account-plus', color: '#1976D2', to: '/customers' },
        { title: 'Checkout', icon: 'mdi-cash-register', color: '#4CAF50', to: '/pos' },
        { title: 'Add Part', icon: 'mdi-package-variant', color: '#FFC107', to: '/inventory' },
      ],

      // Billing Dialog State
      billingDialog: false,
      plans: [],
      selectedPlan: null,
      mpesaCode: '',
      processing: false,
      paymentError: ''
    }
  },

  async mounted() {
    await this.checkBilling()
    await this.fetchDashboardData()
    
    if (this.billingDue) {
      this.$nextTick(() => {
        this.openBillingDialog()
      })
    }
  },

  methods: {
    async fetchDashboardData() {
      this.loading = true
      try {
        const res = await this.$axios.$get('/api/dashboard')
        this.stats = res.stats
        this.periodStats = res.periodStats
        this.recentRepairs = res.recentRepairs
        this.lowStockParts = res.lowStockParts
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        this.loading = false
      }
    },

    async checkBilling() {
      try {
        const res = await this.$axios.$get('/api/billing/subscription')
        if (!res) return

        const status = (res.status || '').toUpperCase()
        const now = new Date()

        // 1. Inactive status
        if (['SUSPENDED', 'CANCELLED', 'PAST_DUE'].includes(status)) {
          this.billingDue = true
          this.billingMessage = `Your account is ${status.toLowerCase()}. Please settle your billing.`
        }
        
        // 2. Trial Expired
        if (status === 'TRIAL') {
          if (!res.trialEndsAt || new Date(res.trialEndsAt) < now) {
            this.billingDue = true
            this.billingMessage = 'Your free trial has expired. Please upgrade to continue.'
          }
        }

        // 3. Active but expired period
        if (status === 'ACTIVE' && res.currentPeriodEnd && new Date(res.currentPeriodEnd) < now) {
          this.billingDue = true
          this.billingMessage = 'Your subscription has expired. Please renew to continue.'
        }

      } catch (e) {
        if (e.response && e.response.status === 403) {
          this.billingDue = true
          this.billingMessage = 'Your account is restricted. Please check billing.'
        }
      }
    },

    async openBillingDialog() {
      this.billingDialog = true
      this.paymentError = ''
      this.mpesaCode = ''
      
      if (this.plans.length === 0) {
        try {
          const res = await this.$axios.$get('/api/billing/plans')
          this.plans = res
        } catch (e) {
          this.paymentError = 'Failed to load plans.'
        }
      }
    },

    closeBillingDialog() {
      // If billing is due, you can force them to stay, or let them close
      // Here we allow them to close but they'll be redirected if they try to navigate
      if (this.processing) return
      this.billingDialog = false
    },

    resetPaymentForm() {
      this.mpesaCode = ''
      this.paymentError = ''
    },

    async submitPayment() {
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
        
        this.billingDialog = false
        alert('Payment submitted! We will verify your code and activate your account shortly.')
        
        // Force the user to the billing page to verify the status
        this.$router.push('/billing')
        
      } catch (e) {
        this.paymentError = e.response?.data?.error || 'Failed to submit payment.'
      } finally {
        this.processing = false
      }
    },

    formatMoney(val) {
      return new Intl.NumberFormat('en-KE').format(val || 0)
    },

    getStatusColor(status) {
      return {
        PENDING: 'warning',
        DIAGNOSING: 'info',
        AWAITING_PARTS: 'orange darken-2',
        IN_PROGRESS: 'primary',
        COMPLETED: 'success',
        DELIVERED: 'grey darken-2',
        CANCELLED: 'error',
      }[status] || 'grey'
    },

    formatStatus(status) {
      if (!status) return ''
      return status.replace(/_/g, ' ')
    },

    timeAgo(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      const now = new Date()
      const seconds = Math.floor((now - date) / 1000)
      
      let interval = seconds / 31536000
      if (interval > 1) return Math.floor(interval) + " yrs ago"
      interval = seconds / 2592000
      if (interval > 1) return Math.floor(interval) + " mos ago"
      interval = seconds / 86400
      if (interval > 1) return Math.floor(interval) + " days ago"
      interval = seconds / 3600
      if (interval > 1) return Math.floor(interval) + " hrs ago"
      interval = seconds / 60
      if (interval > 1) return Math.floor(interval) + " mins ago"
      return Math.floor(seconds) + " secs ago"
    }
  },
}
</script>

<style scoped>
.dashboard-container { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; color: #121212; padding: 24px; }
.header-section { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; }
.page-title { font-size: 1.75rem; font-weight: 800; margin: 0 0 0.25rem 0; letter-spacing: -0.5px; }
.page-subtitle { color: #64748b; margin: 0; font-size: 0.95rem; }
.btn-primary { background-color: #D32F2F !important; color: white !important; font-weight: 600; text-transform: none; letter-spacing: 0; border-radius: 8px; }
.btn-primary:hover { background-color: #B71C1C !important; }
.btn-outline { border-color: #121212 !important; color: #121212 !important; font-weight: 600; text-transform: none; border-radius: 8px; }

/* Stat Cards */
.stat-card { background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; position: relative; overflow: hidden; transition: transform 0.2s ease, box-shadow 0.2s ease; cursor: pointer; height: 100%; }
.stat-card:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.05) !important; }
.stat-border { position: absolute; top: 0; left: 0; bottom: 0; width: 5px; }
.bg-red { background-color: #D32F2F; }
.bg-green { background-color: #4CAF50; }
.bg-orange { background-color: #FFC107; }
.bg-blue { background-color: #1976D2; }
.stat-content { display: flex; justify-content: space-between; align-items: center; padding: 1.2rem; height: 100%; }
.stat-label { font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.5px; }
.stat-value { font-size: 1.8rem; font-weight: 800; color: #121212; margin-top: 0.25rem; line-height: 1.1; }
.stat-icon-wrapper { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.bg-red-light { background: #FEF2F2; }
.bg-green-light { background: #F0FDF4; }
.bg-orange-light { background: #FFFBEB; }
.bg-blue-light { background: #EFF6FF; }

/* Quick Actions Grid */
.quick-actions-card { background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; }
.action-tile { background: #f8fafc !important; border-radius: 12px !important; text-transform: none !important; transition: all 0.2s ease; border: 1px solid transparent; }
.action-tile:hover { background: #ffffff !important; border-color: #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); transform: translateY(-2px); }
.action-text { font-size: 0.8rem; font-weight: 700; color: #121212; letter-spacing: -0.2px; }

/* Sales Overview */
.sales-overview-card { background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; }
.sales-header { padding: 1rem 1.5rem; display: flex; align-items: center; }
.sales-title { font-size: 1rem; font-weight: 700; color: #121212; }
.sales-grid { display: grid; grid-template-columns: repeat(4, 1fr); padding: 1.5rem; gap: 1rem; }
.sales-item { text-align: center; }
.sales-label { font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: #64748b; margin-bottom: 0.5rem; }
.sales-value { font-size: 1.4rem; font-weight: 800; color: #121212; }

/* Tables */
.custom-card { background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; height: 100%; display: flex; flex-direction: column; }
.card-header { padding: 1.25rem 1.5rem; display: flex; align-items: center; }
.card-title-text { font-size: 1.1rem; font-weight: 700; color: #121212; }
.custom-table >>> th { font-size: 0.75rem !important; text-transform: uppercase; font-weight: 700 !important; color: #64748b !important; background-color: #f8fafc !important; padding: 12px 16px !important; }
.custom-table >>> td { padding: 16px !important; border-bottom: 1px solid #f1f5f9 !important; font-size: 0.9rem; }
.repair-row:hover { background-color: #f8fafc !important; cursor: pointer; }
.status-chip { font-weight: 600; letter-spacing: 0.2px; border-radius: 6px; }

/* Alerts */
.alert-list { flex-grow: 1; }
.alert-item { padding: 1rem 1.5rem !important; border-bottom: 1px solid #f1f5f9; }
.icon-bg-red { background: #FEE2E2; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.icon-bg-orange { background: #FEF3C7; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.text-error { color: #D32F2F !important; }
.text-warning { color: #D97706 !important; }

/* Dialog */
.dialog-card { border-radius: 16px !important; }
.dialog-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid #e2e8f0; background: #f8fafc; border-radius: 16px 16px 0 0; }
.dialog-header h3 { margin: 0; font-weight: 800; font-size: 1.2rem; color: #0f172a; }

/* Mobile Responsiveness */
@media (max-width: 600px) { 
  .dashboard-container { padding: 16px; }
  .header-section { flex-direction: column; align-items: flex-start; gap: 1rem; margin-bottom: 1.5rem; }
  .action-buttons { width: 100%; display: flex; gap: 8px; }
  .action-buttons .v-btn { flex: 1; margin: 0 !important; }
  
  .stat-value { font-size: 1.4rem; }
  .stat-label { font-size: 0.65rem; }
  
  .sales-grid { grid-template-columns: repeat(2, 1fr); } 
  
  .custom-table { overflow-x: auto; display: block; }
  .custom-table >>> table { min-width: 500px; }
}
</style>