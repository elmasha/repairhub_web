<template>
  <div class="dashboard-container">
    <div class="header-section">
      <div>
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Welcome back, here is what's happening today.</p>
      </div>
      <div class="action-buttons">
        <v-btn class="btn-primary mr-3" to="/repairs/new" elevation="0">
          <v-icon left small>mdi-plus</v-icon> New Repair
        </v-btn>
        <v-btn outlined class="btn-outline" to="/pos" elevation="0">
          <v-icon left small>mdi-cash-register</v-icon> Open POS
        </v-btn>
      </div>
    </div>

    <div v-if="loading" class="text-center py-10">
      <v-progress-circular indeterminate color="primary" size="50" />
    </div>

    <div v-else>
      <v-row class="mb-2">
        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card" elevation="0">
            <div class="stat-border bg-red" />
            <div class="stat-content">
              <div>
                <div class="stat-label">Active Repairs</div>
                <div class="stat-value">{{ stats.activeRepairs }}</div>
              </div>
              <v-icon size="48" color="#D32F2F" class="stat-icon">mdi-tools</v-icon>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card" elevation="0">
            <div class="stat-border bg-green" />
            <div class="stat-content">
              <div>
                <div class="stat-label">Today's Sales</div>
                <div class="stat-value">KES {{ formatMoney(stats.todaySales) }}</div>
              </div>
              <v-icon size="48" color="#4CAF50" class="stat-icon">mdi-cash</v-icon>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card" elevation="0">
            <div class="stat-border bg-orange" />
            <div class="stat-content">
              <div>
                <div class="stat-label">Low Stock Items</div>
                <div class="stat-value">{{ stats.lowStock }}</div>
              </div>
              <v-icon size="48" color="#FFC107" class="stat-icon">mdi-package-variant-closed</v-icon>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card" elevation="0">
            <div class="stat-border bg-blue" />
            <div class="stat-content">
              <div>
                <div class="stat-label">Total Customers</div>
                <div class="stat-value">{{ stats.totalCustomers }}</div>
              </div>
              <v-icon size="48" color="#1976D2" class="stat-icon">mdi-account-group</v-icon>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mb-6">
        <v-col cols="12">
          <v-card class="sales-overview-card" elevation="0">
            <div class="sales-header">
              <v-icon color="#D32F2F" class="mr-2">mdi-chart-line</v-icon>
              <span class="sales-title">Sales Overview</span>
            </div>
            <v-divider />
            <div class="sales-grid">
              <div class="sales-item">
                <div class="sales-label">Today</div>
                <div class="sales-value">KES {{ formatMoney(periodStats.today) }}</div>
              </div>
              <div class="sales-item">
                <div class="sales-label">This Week</div>
                <div class="sales-value">KES {{ formatMoney(periodStats.week) }}</div>
              </div>
              <div class="sales-item">
                <div class="sales-label">This Month</div>
                <div class="sales-value">KES {{ formatMoney(periodStats.month) }}</div>
              </div>
              <div class="sales-item">
                <div class="sales-label">All Time Total</div>
                <div class="sales-value" style="color: #D32F2F;">
                  KES {{ formatMoney(periodStats.allTime) }}
                </div>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" lg="8">
          <v-card class="custom-card" elevation="0">
            <v-card-title class="card-header">
              <span class="card-title-text">Recent Repairs</span>
              <v-spacer />
              <v-btn text color="#D32F2F" class="font-weight-bold text-none" small to="/repairs">
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
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="repair in recentRepairs" :key="repair.id">
                    <td class="font-weight-bold" style="color: #121212;">
                      {{ repair.ticketNumber || '#' + repair.id.slice(-4).toUpperCase() }}
                    </td>
                    <td>{{ repair.customer?.name || '—' }}</td>
                    <td>{{ repair.deviceBrand }} {{ repair.deviceModel }}</td>
                    <td>
                      <v-chip
                        :color="getStatusColor(repair.status)"
                        small
                        text-color="white"
                        class="status-chip"
                      >
                        {{ formatStatus(repair.status) }}
                      </v-chip>
                    </td>
                  </tr>
                  <tr v-if="recentRepairs.length === 0">
                    <td colspan="4" class="text-center py-6 text-grey">No recent repairs found.</td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </v-card>
        </v-col>

        <v-col cols="12" lg="4">
          <v-card class="custom-card" elevation="0">
            <v-card-title class="card-header">
              <span class="card-title-text">Low Stock Alerts</span>
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
                  <v-list-item-subtitle
                    :class="part.quantity <= 2 ? 'text-error' : 'text-warning'"
                    class="font-weight-bold"
                  >
                    Only {{ part.quantity }} left
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>

              <v-list-item v-if="lowStockParts.length === 0">
                <v-list-item-content class="text-center text-grey py-4">
                  <v-icon color="success" class="mb-2">mdi-check-circle</v-icon>
                  <div>All stock levels are healthy.</div>
                </v-list-item-content>
              </v-list-item>
            </v-list>

            <v-divider />
            <v-card-actions class="pa-3">
              <v-btn block outlined color="#121212" class="font-weight-bold text-none" to="/inventory">
                Manage Inventory
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DashboardPage',
  middleware: 'authenticated',

  data() {
    return {
      loading: true,
      stats: { activeRepairs: 0, todaySales: 0, lowStock: 0, totalCustomers: 0 },
      periodStats: { today: 0, week: 0, month: 0, allTime: 0 },
      recentRepairs: [],
      lowStockParts: [],
    }
  },

  async mounted() {
    await this.fetchDashboardData()
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
      return status.replace(/_/g, ' ')
    },
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
.stat-card { background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; position: relative; overflow: hidden; transition: transform 0.2s ease, box-shadow 0.2s ease; }
.stat-card:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.05) !important; }
.stat-border { position: absolute; top: 0; left: 0; bottom: 0; width: 5px; }
.bg-red { background-color: #D32F2F; }
.bg-green { background-color: #4CAF50; }
.bg-orange { background-color: #FFC107; }
.bg-blue { background-color: #1976D2; }
.stat-content { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; }
.stat-label { font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.5px; }
.stat-value { font-size: 1.8rem; font-weight: 800; color: #121212; margin-top: 0.25rem; }
.stat-icon { opacity: 0.15; }
.sales-overview-card { background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; }
.sales-header { padding: 1rem 1.5rem; display: flex; align-items: center; }
.sales-title { font-size: 1rem; font-weight: 700; color: #121212; }
.sales-grid { display: grid; grid-template-columns: repeat(4, 1fr); padding: 1.5rem; gap: 1rem; }
.sales-item { text-align: center; }
.sales-label { font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: #64748b; margin-bottom: 0.5rem; }
.sales-value { font-size: 1.4rem; font-weight: 800; color: #121212; }
.custom-card { background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; height: 100%; display: flex; flex-direction: column; }
.card-header { padding: 1.25rem 1.5rem; display: flex; align-items: center; }
.card-title-text { font-size: 1.1rem; font-weight: 700; color: #121212; }
.custom-table >>> th { font-size: 0.75rem !important; text-transform: uppercase; font-weight: 700 !important; color: #64748b !important; background-color: #f8fafc !important; padding: 12px 16px !important; }
.custom-table >>> td { padding: 16px !important; border-bottom: 1px solid #f1f5f9 !important; font-size: 0.9rem; }
.status-chip { font-weight: 600; letter-spacing: 0.2px; border-radius: 6px; }
.alert-list { flex-grow: 1; }
.alert-item { padding: 1rem 1.5rem !important; border-bottom: 1px solid #f1f5f9; }
.icon-bg-red { background: #FEE2E2; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.icon-bg-orange { background: #FEF3C7; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.text-error { color: #D32F2F !important; }
.text-warning { color: #D97706 !important; }
@media (max-width: 600px) { .sales-grid { grid-template-columns: repeat(2, 1fr); } }
</style>