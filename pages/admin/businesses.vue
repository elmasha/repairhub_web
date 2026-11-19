<template>
  <div>
    <v-alert
      v-if="pageError" type="error" dense outlined class="mb-4 text-left"
      dismissible @input="pageError = ''"
    >
      {{ pageError }}
    </v-alert>

    <v-card outlined>
      <div class="d-flex flex-wrap align-center pa-4 border-bottom">
        <v-text-field
          v-model.trim="search"
          prepend-inner-icon="mdi-magnify"
          label="Search by name or owner email..."
          outlined dense clearable
          color="primary" class="flex-grow-1 mr-3"
          style="max-width: 380px;"
        />
        <v-select
          v-model="statusFilter"
          :items="statusOptions"
          item-text="text" item-value="value"
          label="Status" outlined dense clearable
          color="primary" style="max-width: 180px;"
        />
      </div>

      <v-simple-table>
        <thead>
          <tr>
            <th class="text-left">Business</th>
            <th class="text-left">Plan</th>
            <th class="text-left">Status</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="b in businesses" :key="b.id">
            <td>
              <div class="font-weight-bold">{{ b.name }}</div>
              <div class="text-caption text-grey">{{ b.email || b.users?.[0]?.email || '—' }}</div>
            </td>
            <td>
              <v-chip x-small color="primary">
                {{ b.subscription?.plan?.name || 'None' }}
              </v-chip>
            </td>
            <td>
              <v-chip x-small :color="statusColor(b.status)" dark>{{ b.status }}</v-chip>
            </td>
            <td class="text-right">
              <v-btn x-small color="info" class="mr-2" @click="viewTenant(b)">Manage</v-btn>
              <v-btn
                x-small
                :color="b.status === 'SUSPENDED' ? 'success' : 'error'"
                @click="toggleStatus(b)"
              >
                {{ b.status === 'SUSPENDED' ? 'Activate' : 'Deactivate' }}
              </v-btn>
            </td>
          </tr>
          <tr v-if="businesses.length === 0 && !loading">
            <td colspan="4" class="text-center py-8 text-grey">
              <v-icon size="48" color="grey lighten-2" class="mb-2">mdi-store-off</v-icon>
              <div>{{ search ? 'No businesses match your search.' : 'No businesses yet.' }}</div>
            </td>
          </tr>
        </tbody>
      </v-simple-table>

      <div v-if="totalPages > 1" class="d-flex justify-center py-4">
        <v-pagination
          v-model="page"
          :length="totalPages"
          :total-visible="7"
          circle color="#D32F2F"
          @input="fetchBusinesses"
        />
      </div>
    </v-card>

    <!-- Tenant Manage Dialog -->
    <v-dialog v-model="drawer" max-width="500px" @click:outside="drawer = false">
      <v-card class="dialog-card" v-if="activeTenant">
        <!-- Header -->
        <div class="dialog-header">
          <div>
            <h3>{{ activeTenant.name }}</h3>
            <p class="text-caption text-grey mb-0">{{ activeTenant.email }}</p>
          </div>
          <v-btn icon small color="grey" @click="drawer = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <!-- Body -->
        <v-card-text class="pt-4" style="max-height: 70vh; overflow-y: auto;">
          
          <v-btn
            block color="#D32F2F" dark small class="mb-6"
            :loading="impersonating"
            @click="impersonateTenant"
          >
            <v-icon left small>mdi-account-switch</v-icon> Open shop dashboard (support mode)
          </v-btn>

          <v-divider class="my-4"></v-divider>
          <h4 class="font-weight-bold mb-3">Billing History</h4>
          
          <v-list dense v-if="activeTenant.invoices && activeTenant.invoices.length > 0" class="mb-4">
            <v-list-item v-for="inv in activeTenant.invoices" :key="inv.id" class="px-0">
              <v-list-item-content>
                <v-list-item-title class="font-weight-bold">
                  {{ inv.invoiceNumber || inv.id.slice(0, 8) }} — KES {{ formatMoney(inv.amountKes) }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ formatDate(inv.createdAt) }} ·
                  <span class="font-weight-bold" :class="inv.status === 'paid' ? 'success--text' : 'error--text'">
                    {{ inv.status.toUpperCase() }}
                  </span>
                  <div v-if="inv.reference || inv.paymentReference" class="text-caption mt-1">
                    M-Pesa Code: <strong>{{ inv.reference || inv.paymentReference }}</strong>
                  </div>
                </v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action v-if="inv.status !== 'paid'">
                <v-btn small color="success" @click="openPayDialog(inv)">Mark Paid</v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>
          <div v-else class="text-caption text-grey mb-4">No billing history found.</div>

          <v-divider class="my-4"></v-divider>
          <h4 class="font-weight-bold mb-3">Grant Free Time</h4>
          <div class="d-flex flex-wrap">
            <v-btn small color="success" class="mr-2 mb-2" @click="forceActivate('starter', 30)">
              +30 Days Starter
            </v-btn>
            <v-btn small color="success" class="mb-2" @click="forceActivate('pro', 30)">
              +30 Days Pro
            </v-btn>
          </div>

          <v-divider class="my-4"></v-divider>
          <h4 class="font-weight-bold mb-3">Extend Current Plan</h4>
          <div class="d-flex align-center">
            <v-text-field
              v-model.number="extendDays"
              type="number" min="1" max="365"
              label="Days" outlined dense
              color="primary" style="max-width: 120px;" class="mr-3"
            />
            <v-btn small color="primary" :loading="extending" @click="extendSubscription">
              Extend
            </v-btn>
          </div>
          <div v-if="activeTenant.subscription?.currentPeriodEnd" class="text-caption text-grey mt-2">
            Current period ends: <strong>{{ formatDate(activeTenant.subscription.currentPeriodEnd) }}</strong>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Mark Invoice Paid Dialog -->
    <v-dialog v-model="payDialog" max-width="420px">
      <v-card class="dialog-card" v-if="payingInvoice">
        <div class="dialog-header">
          <h3>Mark Invoice Paid</h3>
          <v-btn icon small color="grey" @click="payDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </div>
        <v-card-text class="pt-4">
          <p class="text-body-2 mb-4">
            Invoice {{ payingInvoice.invoiceNumber || payingInvoice.id.slice(0, 8) }} —
            KES {{ formatMoney(payingInvoice.amountKes) }}
          </p>
          <v-text-field
            v-model.trim="payForm.reference"
            label="M-Pesa / transaction reference"
            outlined dense color="primary"
            :error-messages="payFieldErrors.reference"
            hint="Proof that the money actually arrived."
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
      businesses: [],
      search: '',
      statusFilter: null,
      page: 1,
      pageSize: 20,
      total: 0,
      loading: false,
      searchTimer: null,
      pageError: '',

      // Tenant Manage Dialog
      drawer: false,
      activeTenant: null,
      impersonating: false,
      extendDays: 7,
      extending: false,

      // Pay Invoice Dialog
      payDialog: false,
      payingInvoice: null,
      paying: false,
      payFieldErrors: {},
      payForm: { reference: '' },

      statusOptions: [
        { text: 'All statuses', value: null },
        { text: 'Active', value: 'ACTIVE' },
        { text: 'Trial', value: 'TRIAL' },
        { text: 'Suspended', value: 'SUSPENDED' },
        { text: 'Cancelled', value: 'CANCELLED' },
      ],
    }
  },
  computed: {
    totalPages() {
      return Math.max(1, Math.ceil(this.total / this.pageSize))
    },
  },
  watch: {
    search() {
      clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => {
        this.page = 1
        this.fetchBusinesses()
      }, 300)
    },
    statusFilter() {
      this.page = 1
      this.fetchBusinesses()
    },
  },
  mounted() {
    this.fetchBusinesses()
  },
  methods: {
    headers() {
      return { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } }
    },
    async fetchBusinesses() {
      this.loading = true
      try {
        const params = { page: this.page, pageSize: this.pageSize }
        if (this.search) params.q = this.search
        if (this.statusFilter) params.status = this.statusFilter
        const res = await this.$axios.$get('/api/system/businesses', {
          ...this.headers(),
          params,
        })
        this.businesses = res.items || []
        this.total = (res.pagination && res.pagination.total) || 0
      } catch (e) {
        if (e && e.response && e.response.status === 401) return this.$router.push('/admin/login')
        this.pageError = 'Failed to load businesses.'
        this.businesses = []
        this.total = 0
      } finally {
        this.loading = false
      }
    },
    async viewTenant(b) {
      this.pageError = ''
      try {
        this.activeTenant = await this.$axios.$get(
          `/api/system/business/${b.id}`,
          this.headers()
        )
        this.drawer = true
      } catch (e) {
        this.pageError = 'Failed to load tenant details.'
      }
    },
    async toggleStatus(b) {
      const action = b.status === 'SUSPENDED' ? 'activate' : 'suspend'
      if (!confirm(`Are you sure you want to ${action} ${b.name}?`)) return
      try {
        const res = await this.$axios.$patch(
          `/api/system/business/${b.id}/toggle`,
          {},
          this.headers()
        )
        b.status = res.status
        if (this.activeTenant && this.activeTenant.id === b.id) {
          this.activeTenant.status = res.status
        }
      } catch (e) {
        this.pageError = 'Failed to update business status.'
      }
    },
    async impersonateTenant() {
      if (!this.activeTenant) return
      this.impersonating = true
      try {
        const res = await this.$axios.$post(
          `/api/system/business/${this.activeTenant.id}/impersonate`,
          {},
          this.headers()
        )
        const url = window.location.origin + '/dashboard?impersonate=' + encodeURIComponent(res.token)
        window.open(url, '_blank', 'noopener')
      } catch (e) {
        this.pageError = 'Failed to start impersonation.'
      } finally {
        this.impersonating = false
      }
    },
    async forceActivate(planCode, days) {
      if (!this.activeTenant) return
      if (!confirm(`Give ${this.activeTenant.name} ${days} days of ${planCode}?`)) return
      try {
        await this.$axios.$post(
          `/api/system/business/${this.activeTenant.id}/activate`,
          { planCode, days },
          this.headers()
        )
        this.drawer = false
        await this.fetchBusinesses()
      } catch (e) {
        this.pageError = 'Failed to activate subscription.'
      }
    },
    async extendSubscription() {
      if (!this.activeTenant) return
      this.extending = true
      try {
        await this.$axios.$patch(
          `/api/system/business/${this.activeTenant.id}/extend`,
          { days: this.extendDays },
          this.headers()
        )
        await this.viewTenant(this.activeTenant)
      } catch (e) {
        this.pageError = 'Failed to extend subscription.'
      } finally {
        this.extending = false
      }
    },
    openPayDialog(inv) {
      this.payingInvoice = inv
      this.payForm = { reference: '' }
      this.payFieldErrors = {}
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
        await this.viewTenant(this.activeTenant)
      } catch (e) {
        const err = e && e.response && e.response.data && e.response.data.error
        if (err && err.fieldErrors) this.payFieldErrors = err.fieldErrors
        else this.pageError = 'Failed to mark invoice paid.'
      } finally {
        this.paying = false
      }
    },
    statusColor(status) {
      if (status === 'SUSPENDED') return 'error'
      if (status === 'CANCELLED') return 'grey'
      if (status === 'TRIAL') return 'warning' // Added: Orange for trials
      return 'success'
    },
    formatMoney(val) {
      return new Intl.NumberFormat('en-KE').format(val || 0)
    },
    formatDate(val) {
      if (!val) return 'N/A'
      return new Date(val).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
      })
    },
  },
}
</script>

<style scoped>
.dialog-card { border-radius: 16px !important; }
.dialog-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1.25rem 1.5rem; border-bottom: 1px solid #e2e8f0; background: #f8fafc;
}
.dialog-header h3 { margin: 0; font-weight: 800; font-size: 1.2rem; color: #0f172a; }
.btn-primary {
  background-color: #D32F2F !important; color: white !important;
  font-weight: 600 !important; text-transform: none !important;
  border-radius: 8px !important;
}
</style>