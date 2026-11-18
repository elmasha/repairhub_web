<template>
  <div class="customers-page">
    <!-- Header -->
    <div class="header-section">
      <div>
        <h1 class="page-title">Customers</h1>
        <p class="page-subtitle">Manage your client directory and history.</p>
      </div>
      <v-btn class="btn-primary" @click="openCreateDialog">
        <v-icon left small>mdi-plus</v-icon> Add Customer
      </v-btn>
    </div>

    <!-- Page-level error (load failures, delete failures) -->
    <v-alert v-if="pageError" type="error" dense outlined class="mb-4 text-left" dismissible @input="pageError = ''">
      {{ pageError }}
    </v-alert>

    <!-- Search -->
    <v-text-field
      v-model="search"
      prepend-inner-icon="mdi-magnify"
      label="Search by name, phone, or email..."
      outlined dense color="primary"
      class="search-bar mb-6"
      clearable
    />

    <!-- Loading -->
    <div v-if="loading" class="text-center py-10">
      <v-progress-circular indeterminate color="primary" size="50" />
      <p class="mt-3 text-grey">Loading customers...</p>
    </div>

    <!-- Table -->
    <template v-else>
      <v-card class="custom-table-card" elevation="0">
        <v-simple-table class="premium-table">
          <template #default>
            <thead>
              <tr>
                <th class="text-left">Customer Name</th>
                <th class="text-left">Phone Number</th>
                <th class="text-left">Email Address</th>
                <th class="text-left">Joined Date</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="customer in customers" :key="customer.id" class="table-row">
                <td>
                  <div class="d-flex align-center">
                    <v-avatar color="#FEF2F2" size="32" class="mr-3">
                      <span class="font-weight-bold" style="color: #D32F2F;">{{ getInitials(customer.name) }}</span>
                    </v-avatar>
                    <span class="font-weight-bold text-black">{{ customer.name }}</span>
                  </div>
                </td>
                <td class="font-weight-medium">{{ customer.phone }}</td>
                <td class="text-grey-darken-1">{{ customer.email || '-' }}</td>
                <td class="text-grey-darken-1">{{ formatDate(customer.createdAt) }}</td>
                <td class="text-right">
                  <v-btn icon small color="primary" class="edit-btn mr-1" @click="openEditDialog(customer)">
                    <v-icon small>mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn icon small class="delete-btn" @click="askDelete(customer)">
                    <v-icon small>mdi-delete-outline</v-icon>
                  </v-btn>
                </td>
              </tr>
              <tr v-if="customers.length === 0">
                <td colspan="5" class="text-center py-8 text-grey">
                  <v-icon size="48" color="grey lighten-2" class="mb-2">mdi-account-off</v-icon>
                  <div>{{ search ? 'No customers match your search.' : 'No customers yet — add your first one.' }}</div>
                </td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-card>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="d-flex justify-center mt-6">
        <v-pagination
          v-model="page"
          :length="totalPages"
          :total-visible="7"
          circle
          color="#D32F2F"
          @input="fetchCustomers"
        />
      </div>
    </template>

    <!-- Create / Edit dialog -->
    <v-dialog v-model="dialog" max-width="450px" @click:outside="closeDialog">
      <v-card class="dialog-card">
        <div class="dialog-header">
          <h3>{{ isEditing ? 'Edit Customer' : 'Add New Customer' }}</h3>
          <v-btn icon small color="grey" @click="closeDialog"><v-icon>mdi-close</v-icon></v-btn>
        </div>

        <v-card-text class="dialog-body pt-4">
          <v-alert v-if="error" type="error" dense outlined class="mb-4 text-left">{{ error }}</v-alert>

          <v-text-field
            v-model.trim="form.name"
            label="Full Name"
            outlined dense color="primary"
            prepend-inner-icon="mdi-account"
            :error-messages="fieldErrors.name"
            :disabled="saving"
            @keyup.enter="saveCustomer"
          />
          <v-text-field
            v-model.trim="form.phone"
            label="Phone Number"
            outlined dense color="primary"
            prepend-inner-icon="mdi-phone"
            :error-messages="fieldErrors.phone"
            :disabled="saving"
            @keyup.enter="saveCustomer"
          />
          <v-text-field
            v-model.trim="form.email"
            label="Email (Optional)"
            type="email"
            outlined dense color="primary"
            prepend-inner-icon="mdi-email"
            :error-messages="fieldErrors.email"
            :disabled="saving"
            @keyup.enter="saveCustomer"
          />
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn text :disabled="saving" @click="closeDialog">Cancel</v-btn>
          <v-btn class="btn-primary" :loading="saving" :disabled="saving" @click="saveCustomer">
            {{ isEditing ? 'Update Customer' : 'Save Customer' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete confirm -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card class="dialog-card">
        <div class="dialog-header">
          <h3>Delete customer?</h3>
          <v-btn icon small color="grey" @click="deleteDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </div>
        <v-card-text class="pt-4">
          <p class="mb-0">
            <strong>{{ deleting?.name }}</strong> will be removed from your directory.
            Their repair history is kept.
          </p>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn text :disabled="deletingBusy" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="#D32F2F" dark :loading="deletingBusy" :disabled="deletingBusy" @click="confirmDelete">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      dialog: false,
      deleteDialog: false,
      loading: true,
      saving: false,
      deletingBusy: false,
      error: '',
      pageError: '',
      fieldErrors: {},          // { name: [...], phone: [...] } from Zod
      search: '',
      customers: [],
      total: 0,
      page: 1,
      pageSize: 20,
      isEditing: false,
      editingId: null,
      deleting: null,
      form: { name: '', phone: '', email: '' },
      searchTimer: null,
    }
  },

  computed: {
    totalPages() {
      return Math.max(1, Math.ceil(this.total / this.pageSize))
    },
  },

  watch: {
    // debounce server-side search; reset to page 1 on new query
    search() {
      clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => {
        this.page = 1
        this.fetchCustomers()
      }, 300)
    },
  },

  async mounted() {
    await this.fetchCustomers()
  },

  methods: {
    async fetchCustomers() {
      this.loading = true
      this.pageError = ''
      try {
        const params = { page: this.page, pageSize: this.pageSize }
        if (this.search) params.q = this.search
        const res = await this.$axios.$get('/api/customers', { params })
        this.customers = res.items
        this.total = res.total
      } catch (e) {
        this.pageError = 'Failed to load customers. Please refresh.'
        this.customers = []
        this.total = 0
      } finally {
        this.loading = false
      }
    },

    openCreateDialog() {
      this.isEditing = false
      this.editingId = null
      this.form = { name: '', phone: '', email: '' }
      this.error = ''
      this.fieldErrors = {}
      this.dialog = true
    },

    openEditDialog(customer) {
      this.isEditing = true
      this.editingId = customer.id
      this.form = {
        name: customer.name,
        phone: customer.phone,
        email: customer.email || '',
      }
      this.error = ''
      this.fieldErrors = {}
      this.dialog = true
    },

    closeDialog() {
      if (this.saving) return
      this.dialog = false
    },

    parseApiError(err) {
      const data = err?.response?.data || err?.data
      const apiError = data?.error
      this.fieldErrors = {}
      if (!apiError) {
        return err?.message === 'Network Error'
          ? 'Cannot reach server. Check your connection.'
          : 'Failed to save customer.'
      }
      if (typeof apiError === 'string') return apiError
      if (apiError.fieldErrors) {
        this.fieldErrors = apiError.fieldErrors
        return 'Please fix the highlighted fields.'
      }
      if (Array.isArray(apiError.formErrors) && apiError.formErrors.length) {
        return apiError.formErrors.join(', ')
      }
      return 'Failed to save customer.'
    },

    async saveCustomer() {
      if (this.saving) return
      this.error = ''
      this.fieldErrors = {}

      if (!this.form.name || !this.form.phone) {
        this.error = 'Name and Phone number are required.'
        return
      }

      this.saving = true
      try {
        if (this.isEditing) {
          await this.$axios.$patch(`/api/customers/${this.editingId}`, this.form)
        } else {
          await this.$axios.$post('/api/customers', this.form)
        }
        this.dialog = false
        await this.fetchCustomers()
      } catch (err) {
        this.error = this.parseApiError(err)
      } finally {
        this.saving = false
      }
    },

    askDelete(customer) {
      this.deleting = customer
      this.deleteDialog = true
    },

    async confirmDelete() {
      if (!this.deleting || this.deletingBusy) return
      this.deletingBusy = true
      try {
        await this.$axios.$delete(`/api/customers/${this.deleting.id}`)
        this.deleteDialog = false
        this.deleting = null
        await this.fetchCustomers()
      } catch (e) {
        this.pageError = 'Failed to delete customer.'
      } finally {
        this.deletingBusy = false
      }
    },

    formatDate(dateString) {
      if (!dateString) return '-'
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
      })
    },

    getInitials(name) {
      if (!name) return '?'
      const parts = name.trim().split(/\s+/)
      return parts.length > 1
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : name.substring(0, 2).toUpperCase()
    },
  },
}
</script>

<style scoped>
.customers-page { padding: 24px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
.header-section { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; }
.page-title { font-size: 1.75rem; font-weight: 800; margin: 0; letter-spacing: -0.5px; color: #121212; }
.page-subtitle { color: #64748b; margin: 0; font-size: 0.95rem; }

.btn-primary {
  background-color: #D32F2F !important; color: white !important;
  font-weight: 600 !important; text-transform: none !important;
  border-radius: 8px !important; letter-spacing: 0 !important;
  transition: all 0.2s ease;
}
.btn-primary:hover { background-color: #B71C1C !important; transform: translateY(-1px); }

.search-bar >>> .v-input__slot { background: #ffffff !important; border-radius: 8px !important; box-shadow: none !important; }

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
.table-row { transition: background 0.2s ease; }
.table-row:hover { background-color: #f8fafc !important; }

.edit-btn { background-color: #FEF2F2 !important; color: #D32F2F !important; transition: all 0.2s ease; }
.edit-btn:hover { background-color: #D32F2F !important; color: #ffffff !important; }
.delete-btn { color: #94a3b8 !important; transition: all 0.2s ease; }
.delete-btn:hover { color: #D32F2F !important; background-color: #FEF2F2 !important; }

.dialog-card { border-radius: 16px !important; overflow: hidden; }
.dialog-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1.25rem 1.5rem; border-bottom: 1px solid #e2e8f0; background: #f8fafc;
}
.dialog-header h3 { margin: 0; font-weight: 800; font-size: 1.2rem; color: #121212; }
.dialog-body { padding: 1.5rem !important; }
</style>