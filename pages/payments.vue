<template>
  <div class="payments-page">
    <!-- Header -->
    <div class="header-section">
      <div>
        <h1 class="page-title">Payments</h1>
        <p class="page-subtitle">Track every repair payment and POS sale in one ledger.</p>
      </div>
      <v-btn text small class="refresh-btn" :loading="loading" @click="fetchPayments(currentType)">
        <v-icon left small>mdi-refresh</v-icon> Refresh
      </v-btn>
    </div>

    <!-- Page-level error -->
    <v-alert
      v-if="pageError"
      type="error"
      dense
      outlined
      class="mb-4 text-left"
      dismissible
      @input="pageError = ''"
    >
      {{ pageError }}
    </v-alert>

    <!-- Control card: segmented tabs + summary + search -->
    <v-card class="control-card mb-6" elevation="0">
      <!-- Segmented tabs -->
      <div class="segmented">
        <button
          v-for="t in tabs"
          :key="t.value"
          type="button"
          class="segmented-btn"
          :class="{ active: currentType === t.value }"
          @click="selectTab(t.value)"
        >
          <v-icon small class="mr-1">{{ t.icon }}</v-icon>
          {{ t.label }}
        </button>
      </div>

      <v-divider />

      <!-- Summary + search -->
      <div class="control-body">
        <div class="summary-block">
          <div class="summary-label">
            Total received · {{ activeTabLabel }}
          </div>
          <div class="summary-value">KES {{ formatMoney(totalAmount) }}</div>
          <div class="summary-meta">
            {{ filteredPayments.length }}
            {{ filteredPayments.length === 1 ? 'transaction' : 'transactions' }}
            <span v-if="search"> (filtered)</span>
          </div>
        </div>

        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Search reference, method, customer, ticket..."
          outlined
          dense
          color="primary"
          class="search-bar"
          clearable
          hide-details
        />
      </div>
    </v-card>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-10">
      <v-progress-circular indeterminate color="primary" size="50" />
      <p class="mt-3 text-caption text-grey">Loading transactions...</p>
    </div>

    <!-- DESKTOP: table — v-if instead of hidden-sm-and-down -->
    <v-card
      v-else-if="isDesktop"
      class="custom-table-card"
      elevation="0"
    >
      <v-simple-table class="premium-table">
        <template #default>
          <thead>
            <tr>
              <th class="text-left">Date</th>
              <th v-if="currentType === 'all'" class="text-left">Type</th>
              <th class="text-left">Details</th>
              <th class="text-left">Method</th>
              <th class="text-left">Reference</th>
              <th class="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="payment in filteredPayments" :key="payment.id" class="table-row">
              <td>
                <div class="date-primary">{{ formatDate(payment.createdAt) }}</div>
                <div class="date-secondary">{{ formatTime(payment.createdAt) }}</div>
              </td>

              <td v-if="currentType === 'all'">
                <span class="type-pill" :class="payment.saleId ? 'type-pill--sale' : 'type-pill--repair'">
                  <v-icon x-small class="mr-1">
                    {{ payment.saleId ? 'mdi-cash-register' : 'mdi-tools' }}
                  </v-icon>
                  {{ payment.saleId ? 'POS Sale' : 'Repair' }}
                </span>
              </td>

              <td>
                <template v-if="payment.repairTicket">
                  <div class="detail-primary">{{ payment.repairTicket.ticketNumber || 'Repair' }}</div>
                  <div class="detail-secondary">{{ payment.repairTicket.customer?.name || '—' }}</div>
                </template>
                <template v-else-if="payment.sale">
                  <div class="detail-primary">{{ payment.sale.saleNumber || 'Walk-in Sale' }}</div>
                  <div class="detail-secondary">
                    {{ payment.sale.items?.length || 0 }} item{{ (payment.sale.items?.length || 0) === 1 ? '' : 's' }}
                  </div>
                </template>
                <template v-else>
                  <div class="detail-primary">—</div>
                </template>
              </td>

              <td>
                <span class="method-pill" :class="`method-pill--${payment.method.toLowerCase()}`">
                  <v-icon x-small class="mr-1">{{ getMethodIcon(payment.method) }}</v-icon>
                  {{ payment.method }}
                </span>
              </td>

              <td class="text-grey-darken-1 ref-cell">{{ payment.reference || '—' }}</td>

              <td class="text-right">
                <span class="amount-text">KES {{ formatMoney(payment.amount) }}</span>
              </td>
            </tr>

            <tr v-if="filteredPayments.length === 0">
              <td :colspan="currentType === 'all' ? 6 : 5" class="text-center py-10">
                <v-icon size="48" color="grey lighten-2" class="mb-2">mdi-receipt</v-icon>
                <div class="empty-title">
                  {{ search ? 'No payments match your search' : 'No payments yet' }}
                </div>
                <div class="empty-sub">
                  {{ search
                    ? 'Try a different reference, method, or customer name.'
                    : 'Repair payments and POS sales will appear here.' }}
                </div>
              </td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-card>

    <!-- MOBILE: cards — v-if instead of hidden-md-and-up -->
    <div v-else class="mobile-list">
      <v-card
        v-for="payment in filteredPayments"
        :key="payment.id"
        class="mobile-payment-card mb-3"
        elevation="0"
      >
        <div class="d-flex justify-space-between align-start mb-2">
          <span class="type-pill" :class="payment.saleId ? 'type-pill--sale' : 'type-pill--repair'">
            <v-icon x-small class="mr-1">
              {{ payment.saleId ? 'mdi-cash-register' : 'mdi-tools' }}
            </v-icon>
            {{ payment.saleId ? 'POS Sale' : 'Repair' }}
          </span>
          <span class="amount-text">KES {{ formatMoney(payment.amount) }}</span>
        </div>

        <div class="mb-2">
          <div class="detail-primary">
            {{ payment.repairTicket
              ? payment.repairTicket.ticketNumber
              : (payment.sale ? payment.sale.saleNumber : '—') }}
          </div>
          <div class="detail-secondary">
            {{ payment.repairTicket
              ? (payment.repairTicket.customer?.name || '—')
              : `${payment.sale?.items?.length || 0} item(s)` }}
          </div>
        </div>

        <v-divider class="my-2" />

        <div class="d-flex justify-space-between align-center text-caption">
          <span class="method-pill" :class="`method-pill--${payment.method.toLowerCase()}`">
            <v-icon x-small class="mr-1">{{ getMethodIcon(payment.method) }}</v-icon>
            {{ payment.method }}
          </span>
          <span class="text-grey">{{ formatDate(payment.createdAt) }} · {{ formatTime(payment.createdAt) }}</span>
        </div>
      </v-card>

      <div v-if="filteredPayments.length === 0" class="text-center py-10">
        <v-icon size="48" color="grey lighten-2" class="mb-2">mdi-receipt</v-icon>
        <div class="empty-title">
          {{ search ? 'No payments match your search' : 'No payments yet' }}
        </div>
        <div class="empty-sub">
          {{ search ? 'Try a different search term.' : 'Transactions will appear here.' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  middleware: 'authenticated',

  data() {
    return {
      loading: true,
      payments: [],
      search: '',
      currentType: 'all',
      totalAmount: 0,
      pageError: '',
      // responsive flag set client-side
      isDesktop: true,
      tabs: [
        { value: 'all',    label: 'All',       icon: 'mdi-list-box' },
        { value: 'repair', label: 'Repairs',   icon: 'mdi-tools' },
        { value: 'sale',   label: 'POS Sales', icon: 'mdi-cash-register' },
      ],
    }
  },

  computed: {
    activeTabLabel() {
      const t = this.tabs.find(x => x.value === this.currentType)
      return t ? t.label : 'All'
    },

    filteredPayments() {
      if (!this.search) return this.payments
      const q = this.search.toLowerCase()
      return this.payments.filter(p => {
        if (p.method?.toLowerCase().includes(q)) return true
        if (p.reference?.toLowerCase().includes(q)) return true
        const cust = p.repairTicket?.customer?.name
        if (cust?.toLowerCase().includes(q)) return true
        if (p.repairTicket?.ticketNumber?.toLowerCase().includes(q)) return true
        if (p.sale?.saleNumber?.toLowerCase().includes(q)) return true
        return false
      })
    },
  },

  async mounted() {
    this.updateViewport()
    if (process.client) window.addEventListener('resize', this.updateViewport)
    await this.fetchPayments('all')
  },

  beforeDestroy() {
    if (process.client) window.removeEventListener('resize', this.updateViewport)
  },

  methods: {
    updateViewport() {
      // Matches Vuetify's "sm-and-down" threshold: < 960px shows mobile cards
      this.isDesktop = process.client ? window.innerWidth >= 960 : true
    },

    selectTab(type) {
      if (this.currentType === type) return
      this.currentType = type
      this.fetchPayments(type)
    },

    async fetchPayments(type = 'all') {
      this.loading = true
      this.pageError = ''
      try {
        const res = await this.$axios.$get('/api/payments', {
          params: {
            type: type === 'all' ? undefined : type,
            pageSize: 100,
          },
        })
        this.payments = res.items
        this.totalAmount = res.totalAmount ?? res.items.reduce((s, p) => s + (p.amount || 0), 0)
      } catch (e) {
        this.pageError = 'Failed to load payments.'
        this.payments = []
        this.totalAmount = 0
      } finally {
        this.loading = false
      }
    },

    formatDate(dateString) {
      if (!dateString) return '—'
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
      })
    },

    formatTime(dateString) {
      if (!dateString) return ''
      return new Date(dateString).toLocaleTimeString('en-GB', {
        hour: '2-digit', minute: '2-digit',
      })
    },

    formatMoney(val) {
      return new Intl.NumberFormat('en-KE').format(val || 0)
    },

    getMethodIcon(method) {
      return {
        CASH: 'mdi-cash',
        MPESA: 'mdi-cellphone',
        CARD: 'mdi-credit-card',
        BANK_TRANSFER: 'mdi-bank',
        CREDIT: 'mdi-account-arrow-right',
      }[method] || 'mdi-cash'
    },
  },
}
</script>

<style scoped>
.payments-page {
  padding: 24px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Header */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 1.5rem;
  gap: 16px;
  flex-wrap: wrap;
}
.page-title {
  font-size: 1.6rem; font-weight: 800; margin: 0;
  letter-spacing: -0.5px; color: #0f172a;
}
.page-subtitle { color: #64748b; margin: 2px 0 0; font-size: 0.9rem; }

.refresh-btn {
  text-transform: none !important;
  letter-spacing: 0 !important;
  color: #64748b !important;
  font-weight: 600 !important;
}
.refresh-btn:hover { color: #D32F2F !important; }

/* Control card */
.control-card {
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  overflow: hidden;
}

/* Segmented control */
.segmented {
  display: flex;
  gap: 4px;
  padding: 8px;
  background: #f8fafc;
}
.segmented-btn {
  flex: 1 1 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 10px 12px;
  border: 1px solid transparent;
  border-radius: 9px;
  background: transparent;
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}
.segmented-btn:hover {
  background: #ffffff;
  color: #0f172a;
}
.segmented-btn.active {
  background: #ffffff;
  color: #D32F2F;
  border-color: #fecaca;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
}

/* Summary + search row */
.control-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  padding: 18px 20px;
  flex-wrap: wrap;
}
.summary-block { min-width: 220px; }
.summary-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: #64748b;
}
.summary-value {
  font-size: 1.9rem;
  font-weight: 800;
  letter-spacing: -0.8px;
  color: #0f172a;
  line-height: 1.15;
  margin-top: 2px;
}
.summary-meta {
  font-size: 0.78rem;
  color: #94a3b8;
  margin-top: 2px;
}

.search-bar {
  flex: 1 1 320px;
  max-width: 520px;
}
.search-bar >>> .v-input__slot {
  background: #f8fafc !important;
  border-radius: 10px !important;
  box-shadow: none !important;
  min-height: 40px !important;
}

/* Table */
.custom-table-card {
  border-radius: 14px !important;
  border: 1px solid #e2e8f0 !important;
  background: #ffffff !important;
  overflow: hidden;
}
.premium-table >>> th {
  font-size: 0.72rem !important;
  text-transform: uppercase;
  font-weight: 700 !important;
  color: #64748b !important;
  background-color: #f8fafc !important;
  padding: 14px 16px !important;
  border-bottom: 1px solid #e2e8f0 !important;
  letter-spacing: 0.4px;
}
.premium-table >>> td {
  padding: 14px 16px !important;
  border-bottom: 1px solid #f1f5f9 !important;
  font-size: 0.88rem;
  vertical-align: middle;
}
.table-row { transition: background 0.15s ease; }
.table-row:hover { background-color: #f8fafc !important; }

.date-primary { font-weight: 600; color: #0f172a; font-size: 0.88rem; }
.date-secondary { font-size: 0.74rem; color: #94a3b8; margin-top: 1px; }

.detail-primary { font-weight: 600; color: #0f172a; font-size: 0.88rem; }
.detail-secondary { font-size: 0.76rem; color: #94a3b8; margin-top: 1px; }

.ref-cell {
  font-family: 'SFMono-Regular', ui-monospace, Menlo, monospace;
  font-size: 0.8rem !important;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.amount-text {
  font-size: 1rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.2px;
  white-space: nowrap;
}

/* Pills */
.type-pill,
.method-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.2px;
  white-space: nowrap;
}
.type-pill--sale {
  background: #ecfdf5;
  color: #047857;
}
.type-pill--repair {
  background: #eff6ff;
  color: #1d4ed8;
}

.method-pill--cash          { background: #ecfdf5; color: #047857; }
.method-pill--mpesa         { background: #ecfeff; color: #0e7490; }
.method-pill--card          { background: #eef2ff; color: #4338ca; }
.method-pill--bank_transfer { background: #f5f3ff; color: #6d28d9; }
.method-pill--credit        { background: #fffbeb; color: #b45309; }

/* Empty states */
.empty-title { font-weight: 700; color: #0f172a; font-size: 0.9rem; }
.empty-sub { color: #94a3b8; font-size: 0.8rem; margin-top: 4px; }

/* Mobile cards */
.mobile-payment-card {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  padding: 16px;
}

/* Responsive */
@media (max-width: 600px) {
  .payments-page { padding: 16px; }
  .control-body { flex-direction: column; align-items: stretch; gap: 14px; }
  .search-bar { max-width: 100%; }
  .segmented-btn { font-size: 0.78rem; padding: 9px 6px; }
  .summary-value { font-size: 1.6rem; }
}
</style>