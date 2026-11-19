<template>
  <div>
    <!-- Page-level error/success -->
    <v-alert
      v-if="pageError" type="error" dense outlined class="mb-4 text-left"
      dismissible @input="pageError = ''"
    >
      {{ pageError }}
    </v-alert>
    <v-alert
      v-if="pageSuccess" type="success" dense outlined class="mb-4 text-left"
      dismissible @input="pageSuccess = ''"
    >
      {{ pageSuccess }}
    </v-alert>

    <v-card outlined>
      <div class="d-flex flex-wrap align-center pa-4 border-bottom">
        <v-select
          v-model="statusFilter"
          :items="statusOptions"
          item-text="text" item-value="value"
          label="Status" outlined dense clearable
          color="primary" style="max-width: 180px;"
        />
        <v-spacer />
        <v-btn small color="#D32F2F" dark @click="openCreateDialog()">
          <v-icon left small>mdi-plus</v-icon> New Invoice
        </v-btn>
      </div>

      <v-simple-table>
        <thead>
          <tr>
            <th class="text-left">Invoice</th>
            <th class="text-left">Business</th>
            <th class="text-left">Amount</th>
            <th class="text-left">Status</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="inv in invoices" :key="inv.id">
            <td>
              <div class="font-weight-bold">{{ inv.invoiceNumber || inv.id.slice(0, 8) }}</div>
              <div class="text-caption text-grey">{{ formatDate(inv.createdAt) }}</div>
            </td>
            <td>
              <div>{{ inv.business?.name || '—' }}</div>
              <div class="text-caption text-grey">{{ inv.business?.email || '' }}</div>
            </td>
            <td>KES {{ formatMoney(inv.amountKes) }}</td>
            <td>
              <v-chip x-small :color="statusColor(inv.status)" dark>
                {{ inv.status.toUpperCase() }}
              </v-chip>
            </td>
            <td class="text-right">
              <v-btn
                v-if="inv.status !== 'paid'"
                x-small color="primary" class="mr-2"
                @click="emailInvoice(inv)"
                :loading="inv.emailing"
              >
                <v-icon left x-small>mdi-email</v-icon> Email
              </v-btn>
              <v-btn
                v-if="inv.status !== 'paid'"
                x-small color="success"
                @click="openPayDialog(inv)"
              >
                Mark Paid
              </v-btn>
              <span v-else class="text-caption text-grey font-weight-bold">
                <v-icon small color="success">mdi-check-circle</v-icon> Paid
              </span>
            </td>
          </tr>
          <tr v-if="invoices.length === 0">
            <td colspan="5" class="text-center py-8 text-grey">
              <v-icon size="48" color="grey lighten-2" class="mb-2">mdi-receipt</v-icon>
              <div>No invoices found.</div>
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
          @input="fetchInvoices"
        />
      </div>
    </v-card>

    <!-- Pay dialog -->
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

    <!-- Create invoice dialog -->
    <v-dialog v-model="createDialog" max-width="460px">
      <v-card class="dialog-card">
        <div class="dialog-header">
          <h3>New Invoice</h3>
          <v-btn icon small color="grey" @click="createDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </div>
        <v-card-text class="pt-4">
          <v-alert v-if="createError" type="error" dense outlined class="mb-4 text-left">
            {{ createError }}
          </v-alert>
          <v-select
            v-model="createForm.businessId"
            :items="businessOptions"
            item-text="name" item-value="id"
            label="Business" outlined dense color="primary"
            :error-messages="createFieldErrors.businessId"
          />
          <v-text-field
            v-model.number="createForm.amountKes"
            type="number" min="1"
            label="Amount (KES)" outlined dense color="primary"
            :error-messages="createFieldErrors.amountKes"
          />
          <v-text-field
            v-model.trim="createForm.description"
            label="Description (optional)" outlined dense color="primary"
            :error-messages="createFieldErrors.description"
          />
          <v-text-field
            v-model="createForm.dueAt"
            type="date"
            label="Due date (optional)" outlined dense color="primary"
            :error-messages="createFieldErrors.dueAt"
          />
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn text :disabled="creating" @click="createDialog = false">Cancel</v-btn>
          <v-btn class="btn-primary" :loading="creating" :disabled="creating" @click="saveInvoice">
            Create Invoice
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
      invoices: [],
      page: 1,
      pageSize: 20,
      total: 0,
      statusFilter: null,
      pageError: '',
      pageSuccess: '',

      payDialog: false,
      payingInvoice: null,
      paying: false,
      payFieldErrors: {},
      payForm: { reference: '' },

      createDialog: false,
      creating: false,
      createError: '',
      createFieldErrors: {},
      createForm: { businessId: null, amountKes: 0, description: '', dueAt: '' },
      businessOptions: [],

      statusOptions: [
        { text: 'All', value: null },
        { text: 'Paid', value: 'paid' },
        { text: 'Sent', value: 'sent' },
        { text: 'Draft', value: 'draft' },
        { text: 'Void', value: 'void' },
      ],
    }
  },
  computed: {
    totalPages() {
      return Math.max(1, Math.ceil(this.total / this.pageSize))
    },
  },
  watch: {
    statusFilter() {
      this.page = 1
      this.fetchInvoices()
    },
  },
  mounted() {
    this.fetchInvoices()
  },
  methods: {
    headers() {
      return { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } }
    },
    async fetchInvoices() {
      try {
        const params = { page: this.page, pageSize: this.pageSize }
        if (this.statusFilter) params.status = this.statusFilter
        const res = await this.$axios.$get('/api/system/invoices', {
          ...this.headers(),
          params,
        })
        this.invoices = res.items || []
        this.total = (res.pagination && res.pagination.total) || 0
      } catch (e) {
        if (e && e.response && e.response.status === 401) return this.$router.push('/admin/login')
        this.pageError = 'Failed to load invoices.'
      }
    },
    async loadBusinessOptions() {
      if (this.businessOptions.length) return
      try {
        const res = await this.$axios.$get('/api/system/businesses', {
          ...this.headers(),
          params: { pageSize: 100 },
        })
        this.businessOptions = res.items || []
      } catch (e) {
        this.createError = 'Could not load business list.'
      }
    },
    async openCreateDialog() {
      this.createForm = { businessId: null, amountKes: 0, description: '', dueAt: '' }
      this.createError = ''
      this.createFieldErrors = {}
      this.createDialog = true
      await this.loadBusinessOptions()
    },
    async saveInvoice() {
      this.createError = ''
      this.createFieldErrors = {}
      this.pageSuccess = ''
      if (!this.createForm.businessId || !this.createForm.amountKes) {
        this.createError = 'Business and amount are required.'
        return
      }
      this.creating = true
      try {
        const payload = {
          businessId: this.createForm.businessId,
          amountKes: this.createForm.amountKes,
        }
        if (this.createForm.description) payload.description = this.createForm.description
        if (this.createForm.dueAt) payload.dueAt = new Date(this.createForm.dueAt).toISOString()

        await this.$axios.$post('/api/system/invoices', payload, this.headers())
        this.createDialog = false
        this.pageSuccess = 'Invoice created and emailed successfully.'
        await this.fetchInvoices()
      } catch (e) {
        const err = e && e.response && e.response.data && e.response.data.error
        if (err && err.fieldErrors) {
          this.createFieldErrors = err.fieldErrors
          this.createError = 'Please fix the highlighted fields.'
        } else {
          this.createError = 'Failed to create invoice.'
        }
      } finally {
        this.creating = false
      }
    },
    async emailInvoice(inv) {
      this.$set(inv, 'emailing', true)
      this.pageSuccess = ''
      this.pageError = ''
      try {
        await this.$axios.$post(`/api/system/invoice/${inv.id}/email`, {}, this.headers())
        this.pageSuccess = 'Invoice emailed successfully.'
      } catch (e) {
        this.pageError = 'Failed to send email. Check if the business owner has an email address.'
      } finally {
        this.$set(inv, 'emailing', false)
      }
    },
    openPayDialog(inv) {
      this.payingInvoice = inv
      this.payForm = { reference: '' }
      this.payFieldErrors = {}
      this.pageError = ''
      this.pageSuccess = ''
      this.payDialog = true
    },
    async confirmMarkPaid() {
      if (!this.payingInvoice) return
      this.paying = true
      this.payFieldErrors = {}
      this.pageError = ''
      this.pageSuccess = ''
      try {
        await this.$axios.$patch(
          `/api/system/invoice/${this.payingInvoice.id}/pay`,
          { reference: this.payForm.reference },
          this.headers()
        )
        this.payDialog = false
        this.pageSuccess = 'Invoice marked as paid. Subscription extended.'
        await this.fetchInvoices()
      } catch (e) {
        const err = e && e.response && e.response.data && e.response.data.error
        if (err && err.fieldErrors) {
          this.payFieldErrors = err.fieldErrors
        } else if (typeof err === 'string') {
          this.pageError = err 
          this.payDialog = false
        } else {
          this.pageError = 'Server error. Check Railway logs.'
          this.payDialog = false
        }
      } finally {
        this.paying = false
      }
    },
    statusColor(status) {
      if (status === 'paid') return 'success'
      if (status === 'void') return 'grey'
      if (status === 'draft') return 'grey'
      return 'warning'
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