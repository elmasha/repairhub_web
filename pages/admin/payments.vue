<template>
  <div>
    <v-alert v-if="pageError" type="error" dense outlined class="mb-4 text-left"
      dismissible @input="pageError = ''">{{ pageError }}</v-alert>
    <v-alert v-if="pageSuccess" type="success" dense outlined class="mb-4 text-left"
      dismissible @input="pageSuccess = ''">{{ pageSuccess }}</v-alert>

    <!-- Summary cards (Grid on Mobile) -->
    <v-row class="mb-4">
      <v-col cols="6" sm="6" md="4">
        <v-card outlined class="summary-card" style="border-left: 4px solid #10b981;">
          <div class="summary-label">Total Collected</div>
          <div class="summary-value text-success">KES {{ formatMoney(summary.paidTotal) }}</div>
          <div class="summary-caption d-none d-sm-block">{{ summary.paidCount }} paid invoices</div>
        </v-card>
      </v-col>
      <v-col cols="6" sm="6" md="4">
        <v-card outlined class="summary-card" style="border-left: 4px solid #f59e0b;">
          <div class="summary-label">Pending</div>
          <div class="summary-value" style="color: #f59e0b;">KES {{ formatMoney(summary.pendingTotal) }}</div>
          <div class="summary-caption d-none d-sm-block">{{ summary.pendingCount }} awaiting review</div>
        </v-card>
      </v-col>
    </v-row>

    <v-card outlined>
      <!-- Filters (Wrap on mobile) -->
      <div class="d-flex flex-wrap align-center pa-4 border-bottom gap-2">
        <v-text-field
          v-model.trim="filters.q"
          label="Invoice # / M-Pesa ref"
          prepend-inner-icon="mdi-magnify"
          outlined dense clearable color="primary"
          class="flex-grow-1 mb-2 mb-sm-0"
          style="max-width: 280px;"
          @keyup.enter="applyFilters"
        />
        <v-select
          v-model="filters.status"
          :items="statusOptions"
          item-text="text" item-value="value"
          label="Status" outlined dense clearable color="primary"
          class="mr-2 mb-2 mb-sm-0" style="max-width: 160px;"
        />
        <v-select
          v-model="filters.method"
          :items="methodOptions"
          item-text="text" item-value="value"
          label="Method" outlined dense clearable color="primary"
          class="mr-2 mb-2 mb-sm-0" style="max-width: 160px;"
        />
        <v-spacer class="hidden-xs-only" />
        <div class="d-flex w-100 justify-end mt-2 mt-sm-0">
          <v-btn small text color="primary" class="mr-2" @click="resetFilters">Reset</v-btn>
          <v-btn small color="#D32F2F" dark @click="applyFilters">Apply</v-btn>
        </div>
      </div>

      <!-- Responsive Table -->
      <div class="table-responsive">
        <v-simple-table>
          <thead>
            <tr>
              <th class="text-left">Date</th>
              <th class="text-left">Business</th>
              <th class="text-left d-none d-sm-table-cell">Plan</th>
              <th class="text-left d-none d-sm-table-cell">Invoice #</th>
              <th class="text-left">Amount</th>
              <th class="text-left d-none d-sm-table-cell">Method</th>
              <th class="text-left d-none d-sm-table-cell">Reference</th>
              <th class="text-left">Status</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in items" :key="p.id">
              <td class="text-caption">{{ formatDateTime(p.createdAt) }}</td>
              <td>
                <div class="font-weight-bold">{{ p.businessName }}</div>
                <div class="text-caption text-grey d-sm-none">{{ p.invoiceNumber }}</div>
                <v-chip x-small :color="businessStatusColor(p.businessStatus)" dark class="mt-1">
                  {{ p.businessStatus }}
                </v-chip>
              </td>
              <td class="d-none d-sm-table-cell">{{ p.planName }}</td>
              <td class="text-caption d-none d-sm-table-cell">{{ p.invoiceNumber }}</td>
              <td class="font-weight-bold">KES {{ formatMoney(p.amountKes) }}</td>
              <td class="text-caption d-none d-sm-table-cell">{{ p.method || '—' }}</td>
              <td class="text-caption d-none d-sm-table-cell">{{ p.reference || p.externalId || '—' }}</td>
              <td>
                <v-chip x-small :color="statusColor(p.status)" dark>
                  {{ p.status.toUpperCase() }}
                </v-chip>
              </td>
              <td class="text-right">
                <template v-if="p.status === 'pending'">
                  <v-btn x-small color="success" class="mr-1 px-2" @click="openPayDialog(p)">
                    <span class="d-none d-sm-inline">Verify</span>
                    <v-icon small class="d-sm-none">mdi-check</v-icon>
                  </v-btn>
                  <v-btn x-small text color="error" class="px-2" @click="failInvoice(p)">
                    <span class="d-none d-sm-inline">Fail</span>
                    <v-icon small class="d-sm-none">mdi-close</v-icon>
                  </v-btn>
                </template>
                <span v-else-if="p.status === 'paid'" class="text-caption text-grey">
                  <v-icon small color="success">mdi-check-circle</v-icon> Paid
                </span>
                <span v-else class="text-caption text-grey">—</span>
              </td>
            </tr>
            <tr v-if="items.length === 0 && !loading">
              <td colspan="9" class="text-center py-8 text-grey">
                <v-icon size="48" color="grey lighten-2" class="mb-2">mdi-cash-multiple</v-icon>
                <div>No payments match the filters.</div>
              </td>
            </tr>
          </tbody>
        </v-simple-table>
      </div>

      <div v-if="totalPages > 1" class="d-flex justify-center py-4">
        <v-pagination v-model="page" :length="totalPages" :total-visible="5"
          circle color="#D32F2F" @input="fetchPayments" />
      </div>
    </v-card>

    <!-- Pay / Verify dialog -->
    <v-dialog v-model="payDialog" max-width="420px">
      <v-card class="dialog-card" v-if="payingInvoice">
        <div class="dialog-header">
          <h3>Verify Payment</h3>
          <v-btn icon small color="grey" @click="payDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </div>
        <v-card-text class="pt-4">
          <p class="text-body-2 mb-1"><strong>{{ payingInvoice.businessName }}</strong></p>
          <p class="text-body-2 mb-4">
            {{ payingInvoice.invoiceNumber }} — KES {{ formatMoney(payingInvoice.amountKes) }}
          </p>
          <v-text-field
            v-model.trim="payForm.reference"
            label="M-Pesa receipt code"
            outlined dense color="primary"
            :error-messages="payFieldErrors.reference"
            hint="Match this against your M-Pesa statement."
            persistent-hint
          />
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn text :disabled="paying" @click="payDialog = false">Cancel</v-btn>
          <v-btn class="btn-primary" :loading="paying" :disabled="paying" @click="confirmMarkPaid">
            Confirm Paid
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  layout: 'admin',
  middleware: 'admin-auth',
  data() {
    return {
      items: [],
      summary: { paidCount: 0, paidTotal: 0, pendingCount: 0, pendingTotal: 0 },
      page: 1,
      pageSize: 20,
      total: 0,
      loading: false,
      pageError: '',
      pageSuccess: '',

      filters: { q: '', status: null, method: null },

      payDialog: false,
      payingInvoice: null,
      paying: false,
      payFieldErrors: {},
      payForm: { reference: '' },

      statusOptions: [
        { text: 'All', value: null },
        { text: 'Pending', value: 'pending' },
        { text: 'Paid', value: 'paid' },
        { text: 'Failed', value: 'failed' },
      ],
      methodOptions: [
        { text: 'All', value: null },
        { text: 'M-Pesa', value: 'MPESA' },
        { text: 'Card', value: 'CARD' },
        { text: 'Cash', value: 'CASH' },
        { text: 'Bank', value: 'BANK_TRANSFER' },
      ],
    }
  },
  computed: {
    totalPages() {
      return Math.max(1, Math.ceil(this.total / this.pageSize))
    },
  },
  mounted() {
    this.fetchPayments()
  },
  methods: {
    headers() {
      return { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } }
    },
    async fetchPayments() {
      this.loading = true
      try {
        const params = { page: this.page, pageSize: this.pageSize }
        if (this.filters.q) params.q = this.filters.q
        if (this.filters.status) params.status = this.filters.status
        if (this.filters.method) params.method = this.filters.method
        const res = await this.$axios.$get('/api/system/payments', {
          ...this.headers(),
          params,
        })
        this.items = res.items || []
        this.summary = res.summary || this.summary
        this.total = (res.pagination && res.pagination.total) || 0
      } catch (e) {
        if (e && e.response && e.response.status === 401) return this.$router.push('/admin/login')
        this.pageError = 'Failed to load payments.'
      } finally {
        this.loading = false
      }
    },
    applyFilters() {
      this.page = 1
      this.fetchPayments()
    },
    resetFilters() {
      this.filters = { q: '', status: null, method: null }
      this.page = 1
      this.fetchPayments()
    },
    openPayDialog(p) {
      this.payingInvoice = p
      this.payForm = { reference: p.reference || '' }
      this.payFieldErrors = {}
      this.pageError = ''
      this.pageSuccess = ''
      this.payDialog = true
    },
    async confirmMarkPaid() {
      if (!this.payingInvoice) return
      this.paying = true
      this.payFieldErrors = {}
      try {
        await this.$axios.$patch(
          `/api/system/invoice/${this.payingInvoice.id}/pay`,
          { reference: this.payForm.reference },
          this.headers()
        )
        this.payDialog = false
        this.pageSuccess = 'Payment verified and subscription extended.'
        await this.fetchPayments()
      } catch (e) {
        const err = e && e.response && e.response.data && e.response.data.error
        if (err && err.fieldErrors) this.payFieldErrors = err.fieldErrors
        else if (typeof err === 'string') { this.pageError = err; this.payDialog = false }
        else { this.pageError = 'Server error. Check Railway logs.'; this.payDialog = false }
      } finally {
        this.paying = false
      }
    },
    async failInvoice(p) {
      if (!confirm(`Mark ${p.invoiceNumber} as failed? This does not touch the subscription.`)) return
      try {
        await this.$axios.$patch(
          `/api/system/invoice/${p.id}/fail`,
          { reason: 'Admin marked as failed' },
          this.headers()
        )
        this.pageSuccess = 'Invoice marked as failed.'
        await this.fetchPayments()
      } catch (e) {
        const err = e && e.response && e.response.data && e.response.data.error
        this.pageError = typeof err === 'string' ? err : 'Failed to update invoice.'
      }
    },
    statusColor(s) {
      return s === 'paid' ? 'success' : s === 'failed' ? 'error' : 'warning'
    },
    businessStatusColor(s) {
      if (s === 'SUSPENDED') return 'error'
      if (s === 'TRIAL') return 'warning'
      if (s === 'CANCELLED') return 'grey'
      return 'success'
    },
    formatMoney(v) { return new Intl.NumberFormat('en-KE').format(v || 0) },
    formatDateTime(v) {
      if (!v) return '—'
      return new Date(v).toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    },
  },
}
</script>

<style scoped>
.summary-card { padding: 16px; border-radius: 8px; height: 100%; }
.summary-label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #64748b; }
.summary-value { font-size: 1.75rem; font-weight: 900; margin: 6px 0; }
.summary-caption { font-size: 0.75rem; color: #94a3b8; }
.text-success { color: #10b981 !important; }

/* Responsive Tables */
.table-responsive {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

/* Dialog styles */
.dialog-card { border-radius: 16px !important; }
.dialog-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1.25rem 1.5rem; border-bottom: 1px solid #e2e8f0; background: #f8fafc;
}
.dialog-header h3 { margin: 0; font-weight: 800; font-size: 1.2rem; color: #0f172a; }
.btn-primary {
  background-color: #D32F2F !important; color: white !important;
  font-weight: 600 !important; text-transform: none !important; border-radius: 8px !important;
}

/* Mobile */
@media (max-width: 600px) {
  .summary-value { font-size: 1.4rem; }
  .gap-2 { gap: 8px; }
  .responsive-table >>> table { min-width: 700px; }
}
</style>