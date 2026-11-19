<template>
  <div class="repairs-page">
    <!-- Header Section -->
    <div class="header-section">
      <div>
        <h1 class="page-title">Repair Desk</h1>
        <p class="page-subtitle">
          Manage device intakes, parts, and payments.
          <span class="text-grey-darken-1">Click a status chip to update it.</span>
        </p>
      </div>
      <v-btn class="btn-primary" @click="openIntakeDialog">
        <v-icon left small>mdi-plus</v-icon> New Intake
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

    <!-- Toolbar: search + status filter -->
    <div class="toolbar mb-4">
      <v-text-field
        v-model="search"
        prepend-inner-icon="mdi-magnify"
        label="Search by ticket, customer, device..."
        outlined
        dense
        color="primary"
        class="search-bar mb-0 flex-grow-1"
        clearable
        hide-details
      />
      <v-select
        v-model="statusFilter"
        :items="statusFilterOptions"
        item-text="label"
        item-value="value"
        label="Status"
        outlined
        dense
        color="primary"
        class="status-filter mb-0"
        hide-details
        clearable
      />
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-10">
      <v-progress-circular indeterminate color="primary" size="50" />
      <p class="mt-3 text-caption text-grey">Loading repair tickets...</p>
    </div>

    <!-- Repairs Table -->
    <template v-else>
      <v-card class="custom-table-card" elevation="0">
        <v-simple-table class="premium-table">
          <template #default>
            <thead>
              <tr>
                <th class="text-left">Ticket</th>
                <th class="text-left">Device</th>
                <th class="text-left">Customer</th>
                <th class="text-left">Status</th>
                <th class="text-left">Opened</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="repair in filteredRepairs" :key="repair.id" class="table-row">
                <td class="font-weight-bold" style="color: #121212;">
                  {{ repair.ticketNumber }}
                </td>
                <td>
                  <div class="font-weight-bold">{{ repair.deviceBrand }} {{ repair.deviceModel }}</div>
                  <small class="text-grey-darken-1">IMEI: {{ repair.imei || 'N/A' }}</small>
                </td>
                <td>
                  <div class="font-weight-medium">{{ repair.customer?.name || '—' }}</div>
                  <small class="text-grey-darken-1">{{ repair.customer?.phone || '—' }}</small>
                </td>
                <td>
                  <v-chip
                    :color="getStatusColor(repair.status)"
                    small
                    text-color="white"
                    class="status-chip status-chip--action"
                    title="Change status"
                    tabindex="0"
                    aria-label="Change status"
                    @click="openStatusDialog(repair)"
                    @keyup.enter="openStatusDialog(repair)"
                    @keyup.space.prevent="openStatusDialog(repair)"
                  >
                    {{ formatStatus(repair.status) }}
                    <v-icon right x-small class="status-chip__pencil">mdi-pencil</v-icon>
                  </v-chip>
                </td>
                <td class="text-grey-darken-1 text-caption">
                  {{ formatDate(repair.createdAt) }}
                </td>
                <td class="text-right">
                  <v-btn
                    icon
                    small
                    class="status-btn mr-1"
                    title="Change status"
                    @click="openStatusDialog(repair)"
                  >
                    <v-icon small>mdi-swap-horizontal</v-icon>
                  </v-btn>
                  <v-btn
                    icon
                    small
                    color="primary"
                    class="edit-btn"
                    title="Manage parts & payments"
                    @click="openActionDialog(repair)"
                  >
                    <v-icon small>mdi-cog</v-icon>
                  </v-btn>
                </td>
              </tr>
              <tr v-if="filteredRepairs.length === 0">
                <td colspan="6" class="text-center py-10 text-grey">
                  <v-icon size="48" color="grey lighten-2" class="mb-2">mdi-tools</v-icon>
                  <div v-if="search || statusFilter">
                    No tickets match your filters.
                  </div>
                  <div v-else>
                    No repairs found. Click "New Intake" to get started.
                  </div>
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
        />
      </div>
    </template>

    <!-- New Intake Dialog -->
    <v-dialog v-model="intakeDialog" max-width="600px" @click:outside="closeIntake">
      <v-card class="dialog-card">
        <div class="dialog-header">
          <h3>New Device Intake</h3>
          <v-btn icon small color="grey" @click="closeIntake"><v-icon>mdi-close</v-icon></v-btn>
        </div>

        <v-card-text class="dialog-body">
          <v-alert v-if="intakeError" type="error" dense outlined class="mb-4 text-left">
            {{ intakeError }}
          </v-alert>

          <v-row dense>
            <v-col cols="12">
              <v-autocomplete
                v-model="intakeForm.customerId"
                :items="customers"
                item-text="name"
                item-value="id"
                label="Select Customer"
                outlined
                dense
                color="primary"
                prepend-inner-icon="mdi-account"
                :error-messages="intakeFieldErrors.customerId"
                :disabled="savingIntake"
                no-data-text="No customers — add one first"
                hide-no-data
              >
                <template #item="{ item }">
                  <div class="d-flex flex-column">
                    <span class="font-weight-medium">{{ item.name }}</span>
                    <span class="text-caption text-grey">{{ item.phone }}</span>
                  </div>
                </template>
              </v-autocomplete>
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model.trim="intakeForm.deviceBrand"
                label="Brand (e.g. Apple)"
                outlined dense color="primary"
                :error-messages="intakeFieldErrors.deviceBrand"
                :disabled="savingIntake"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model.trim="intakeForm.deviceModel"
                label="Model (e.g. iPhone 13)"
                outlined dense color="primary"
                :error-messages="intakeFieldErrors.deviceModel"
                :disabled="savingIntake"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model.trim="intakeForm.imei"
                label="IMEI / Serial"
                outlined dense color="primary"
                :disabled="savingIntake"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="intakeForm.devicePasscode"
                label="Passcode"
                outlined dense color="primary"
                :disabled="savingIntake"
                hint="Needed to test the device"
                persistent-hint
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model.trim="intakeForm.issue"
                label="Issue Description"
                placeholder="e.g. Cracked screen, won't charge, battery drains fast"
                outlined dense color="primary"
                rows="3"
                :disabled="savingIntake"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn text :disabled="savingIntake" @click="closeIntake">Cancel</v-btn>
          <v-btn class="btn-primary" :loading="savingIntake" :disabled="savingIntake" @click="saveIntake">
            Create Ticket
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Manage Repair Dialog (parts + payment) -->
    <v-dialog v-model="actionDialog" max-width="600px" @click:outside="actionDialog = false">
      <v-card v-if="selectedRepair" class="dialog-card">
        <div class="dialog-header">
          <div>
            <h3>Manage Ticket {{ selectedRepair.ticketNumber }}</h3>
            <p class="text-caption text-grey-darken-1 mb-0">
              {{ selectedRepair.deviceBrand }} {{ selectedRepair.deviceModel }}
              <v-chip
                :color="getStatusColor(selectedRepair.status)"
                x-small text-color="white"
                class="ml-2 status-chip"
              >
                {{ formatStatus(selectedRepair.status) }}
              </v-chip>
            </p>
          </div>
          <v-btn icon small color="grey" @click="actionDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </div>

        <v-tabs v-model="activeTab" background-color="#f8fafc" color="primary" grow>
          <v-tab><v-icon left small>mdi-cog</v-icon> Add Parts</v-tab>
          <v-tab><v-icon left small>mdi-cash</v-icon> Take Payment</v-tab>
        </v-tabs>

        <v-card-text class="pt-6">
          <!-- Parts Tab -->
          <div v-if="activeTab === 0">
            <v-row dense align="center">
              <v-col cols="8">
                <v-select
                  v-model="partForm.partId"
                  :items="parts"
                  item-text="name"
                  item-value="id"
                  label="Select Part"
                  outlined dense color="primary"
                  :disabled="addingPart"
                  :error-messages="partFieldErrors.partId"
                  no-data-text="No parts in stock"
                >
                  <template #item="{ item }">
                    <div class="d-flex justify-space-between align-center" style="width: 100%;">
                      <span>{{ item.name }}</span>
                      <span class="text-caption text-grey">{{ item.quantity }} left</span>
                    </div>
                  </template>
                </v-select>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  v-model.number="partForm.quantity"
                  type="number"
                  min="1"
                  :max="selectedPartQuantity"
                  label="Qty"
                  outlined dense color="primary"
                  :disabled="addingPart"
                  :error-messages="partFieldErrors.quantity"
                  :hint="selectedPartQuantity ? `${selectedPartQuantity} available` : ''"
                  persistent-hint
                />
              </v-col>
            </v-row>
            <v-btn
              class="btn-primary mt-3"
              block
              :loading="addingPart"
              :disabled="addingPart || !partForm.partId"
              @click="addPartToRepair"
            >
              Add to Repair
            </v-btn>

            <v-divider class="my-6" />
            <h4 class="font-weight-bold mb-3" style="color: #121212;">Parts Used in this Repair</h4>

            <v-list dense class="parts-used-list">
              <v-list-item v-for="p in selectedRepair.parts" :key="p.id">
                <v-list-item-icon>
                  <v-icon color="#D32F2F">mdi-check-circle</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title class="font-weight-bold">{{ p.part.name }}</v-list-item-title>
                  <v-list-item-subtitle>
                    Qty: {{ p.quantity }} · KES {{ formatMoney(p.sellPrice) }}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item v-if="!selectedRepair.parts || selectedRepair.parts.length === 0">
                <v-list-item-content class="text-center text-grey">No parts added yet.</v-list-item-content>
              </v-list-item>
            </v-list>
          </div>

          <!-- Payment Tab -->
          <div v-if="activeTab === 1">
            <v-text-field
              v-model.number="paymentForm.amount"
              type="number"
              min="0"
              label="Amount (KES)"
              outlined dense color="primary"
              prepend-inner-icon="mdi-currency-usd"
              :disabled="savingPayment"
              :error-messages="paymentFieldErrors.amount"
            />

            <v-select
              v-model="paymentForm.method"
              :items="['CASH', 'MPESA', 'CARD']"
              label="Payment Method"
              outlined dense color="primary"
              prepend-inner-icon="mdi-wallet"
              :disabled="savingPayment"
            />

            <v-text-field
              v-if="paymentForm.method === 'MPESA' || paymentForm.method === 'CARD'"
              v-model.trim="paymentForm.reference"
              label="Transaction Reference / M-Pesa Code"
              outlined dense color="primary"
              prepend-inner-icon="mdi-pound"
              :disabled="savingPayment"
              :error-messages="paymentFieldErrors.reference"
            />

            <v-btn
              class="btn-primary mt-2"
              block height="50"
              :loading="savingPayment"
              :disabled="savingPayment"
              @click="savePayment"
            >
              Record Payment
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Status Change Dialog -->
    <v-dialog v-model="statusDialog" max-width="480px" @click:outside="closeStatusDialog">
      <v-card v-if="statusRepair" class="dialog-card">
        <div class="dialog-header">
          <div>
            <h3>Update Status</h3>
            <p class="text-caption text-grey-darken-1 mb-0">
              Ticket {{ statusRepair.ticketNumber }} · {{ statusRepair.deviceBrand }} {{ statusRepair.deviceModel }}
            </p>
          </div>
          <v-btn icon small color="grey" @click="closeStatusDialog"><v-icon>mdi-close</v-icon></v-btn>
        </div>

        <v-card-text class="dialog-body pt-5">
          <div class="d-flex align-center mb-5">
            <span class="text-caption text-grey-darken-1 mr-2">Current:</span>
            <v-chip :color="getStatusColor(statusRepair.status)" small text-color="white" class="status-chip">
              {{ formatStatus(statusRepair.status) }}
            </v-chip>
          </div>

          <v-alert v-if="statusError" type="error" dense outlined class="mb-4 text-left">
            {{ statusError }}
          </v-alert>

          <div class="text-subtitle-2 font-weight-bold mb-2" style="color:#121212;">
            Move to
          </div>
          <div v-if="allowedNextStatuses.length === 0" class="text-body-2 text-grey mb-4">
            This ticket is in a final state and can't be moved further.
          </div>
          <v-item-group v-model="statusForm.next" class="mb-4">
            <v-row dense>
              <v-col v-for="s in allowedNextStatuses" :key="s" cols="12" sm="6">
                <v-item v-slot="{ active, toggle }">
                  <v-card
                    :color="active ? getStatusColor(s) : '#f8fafc'"
                    :class="['status-option', active ? 'white--text' : '']"
                    outlined
                    @click="toggle"
                  >
                    <v-card-text class="d-flex align-center pa-3">
                      <v-icon small class="mr-2" :color="active ? 'white' : getStatusColor(s)">
                        {{ active ? 'mdi-check-circle' : 'mdi-circle-outline' }}
                      </v-icon>
                      <span class="font-weight-bold text-body-2">{{ formatStatus(s) }}</span>
                    </v-card-text>
                  </v-card>
                </v-item>
              </v-col>
            </v-row>
          </v-item-group>

          <v-textarea
            v-model.trim="statusForm.note"
            label="Note (optional)"
            outlined dense rows="2" color="primary"
            :disabled="updatingStatus"
            hint="Recorded in the ticket history."
            persistent-hint
          />
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn text :disabled="updatingStatus" @click="closeStatusDialog">Cancel</v-btn>
          <v-btn
            class="btn-primary"
            :loading="updatingStatus"
            :disabled="updatingStatus || !statusForm.next"
            @click="confirmStatusChange"
          >
            Update Status
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

        <!-- Upgrade Plan Dialog -->
    <v-dialog v-model="showUpgradeDialog" max-width="400px">
      <v-card class="dialog-card">
        <div class="dialog-header" style="background: #FEF2F2;">
          <h3 style="color: #D32F2F;">Plan Limit Reached</h3>
          <v-btn icon small color="grey" @click="showUpgradeDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </div>
        <v-card-text class="pt-4 text-center">
          <v-icon size="64" color="#D32F2F" class="mb-4">mdi-alert-circle-outline</v-icon>
          <p class="text-body-1 font-weight-medium mb-2">{{ upgradeMessage }}</p>
          <p class="text-caption text-grey">Upgrade your plan to continue creating repairs.</p>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn text @click="showUpgradeDialog = false">Not now</v-btn>
          <v-btn color="#D32F2F" dark to="/billing" @click="showUpgradeDialog = false">
            Upgrade Plan
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar: lightweight success feedback -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" bottom timeout="2500">
      {{ snackbar.text }}
      <template #action="{ attrs }">
        <v-btn text v-bind="attrs" small @click="snackbar.show = false">OK</v-btn>
      </template>
    </v-snackbar>


  </div>
</template>

<script>
export default {
  data() {
    return {
      showUpgradeDialog: false,
      upgradeMessage: '',
      loading: true,
      savingIntake: false,
      addingPart: false,
      savingPayment: false,
      updatingStatus: false,

      repairs: [],
      customers: [],
      parts: [],

      search: '',
      statusFilter: null,
      page: 1,
      pageSize: 20,

      pageError: '',

      intakeDialog: false,
      intakeError: '',
      intakeFieldErrors: {},

      actionDialog: false,
      activeTab: 0,
      selectedRepair: null,

      statusDialog: false,
      statusRepair: null,
      statusError: '',
      statusForm: { next: null, note: '' },

      intakeForm: {
        customerId: null,
        deviceBrand: '',
        deviceModel: '',
        imei: '',
        devicePasscode: '',
        issue: '',
      },
      partForm: { partId: null, quantity: 1 },
      paymentForm: { amount: 0, method: 'CASH', reference: '' },

      partFieldErrors: {},
      paymentFieldErrors: {},

      snackbar: { show: false, text: '', color: 'success' },

      transitions: {
        PENDING:        ['DIAGNOSING', 'CANCELLED'],
        DIAGNOSING:     ['AWAITING_PARTS', 'IN_PROGRESS', 'CANCELLED'],
        AWAITING_PARTS: ['IN_PROGRESS', 'CANCELLED'],
        IN_PROGRESS:    ['COMPLETED', 'CANCELLED'],
        COMPLETED:      ['DELIVERED'],
        DELIVERED:      [],
        CANCELLED:      [],
      },
    }
  },

  computed: {
    allowedNextStatuses() {
      if (!this.statusRepair) return []
      return this.transitions[this.statusRepair.status] || []
    },

    statusFilterOptions() {
      return Object.keys(this.transitions).map(s => ({
        label: this.formatStatus(s),
        value: s,
      }))
    },

    filteredRepairs() {
      const q = this.search.trim().toLowerCase()
      return this.repairs.filter(r => {
        if (this.statusFilter && r.status !== this.statusFilter) return false
        if (!q) return true
        const haystack = [
          r.ticketNumber,
          r.deviceBrand,
          r.deviceModel,
          r.imei,
          r.customer?.name,
          r.customer?.phone,
        ].filter(Boolean).join(' ').toLowerCase()
        return haystack.includes(q)
      })
    },

    totalPages() {
      return Math.max(1, Math.ceil(this.filteredRepairs.length / this.pageSize))
    },

    selectedPartQuantity() {
      if (!this.partForm.partId) return null
      const p = this.parts.find(x => x.id === this.partForm.partId)
      return p ? p.quantity : null
    },
  },

  watch: {
    search() { this.page = 1 },
    statusFilter() { this.page = 1 },
  },

  async mounted() {
    await this.fetchData()
  },

  methods: {
    async fetchData() {
      this.loading = true
      this.pageError = ''
      try {
        // Manually attach the token to prevent 401 errors
        const token = this.$store.state.authToken
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        }

        const [repairRes, customerRes, partRes] = await Promise.all([
          this.$axios.$get('/api/repairs', config),
          this.$axios.$get('/api/customers', { ...config, params: { pageSize: 100 } }),
          this.$axios.$get('/api/parts', config),
        ])
        
        this.repairs = repairRes.items || repairRes
        this.customers = customerRes.items || customerRes
        this.parts = partRes.items || partRes
      } catch (e) {
        console.error(e)
        this.pageError = 'Failed to load repair desk data. Please refresh.'
      } finally {
        this.loading = false
      }
    },

    async refreshRepairs() {
      try {
        const token = this.$store.state.authToken
        const res = await this.$axios.$get('/api/repairs', {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.repairs = res.items || res
      } catch (e) {
        this.pageError = 'Failed to refresh repairs.'
      }
    },

    // ── Intake ─────────────────────────────────────────
    openIntakeDialog() {
      this.intakeForm = {
        customerId: null,
        deviceBrand: '',
        deviceModel: '',
        imei: '',
        devicePasscode: '',
        issue: '',
      }
      this.intakeError = ''
      this.intakeFieldErrors = {}
      this.intakeDialog = true
    },

    closeIntake() {
      if (this.savingIntake) return
      this.intakeDialog = false
    },

        async saveIntake() {
      if (this.savingIntake) return
      this.intakeError = ''
      this.intakeFieldErrors = {}

      if (!this.intakeForm.customerId || !this.intakeForm.deviceModel) {
        this.intakeError = 'Please select a customer and enter a device model.'
        return
      }

      this.savingIntake = true
      try {
        const token = this.$store.state.authToken
        await this.$axios.$post('/api/repairs', this.intakeForm, {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.intakeDialog = false
        this.notify('Ticket created')
        await this.refreshRepairs()
      } catch (err) {
        // CATCH THE PLAN LIMIT ERROR HERE
        const status = err.response?.status
        const errorData = err.response?.data?.error
        
        if (status === 403 && typeof errorData === 'string' && errorData.includes('Plan limit')) {
          this.intakeDialog = false // Close the intake dialog
          this.upgradeMessage = errorData
          this.showUpgradeDialog = true
        } else {
          this.intakeError = this.parseApiError(err, this.intakeFieldErrors)
        }
      } finally {
        this.savingIntake = false
      }
    },

    // ── Manage dialog ─────────────────────────────────
    async openActionDialog(repair) {
      this.actionDialog = true
      this.activeTab = 0
      this.partForm = { partId: null, quantity: 1 }
      this.partFieldErrors = {}
      this.paymentForm = { amount: 0, method: 'CASH', reference: '' }
      this.paymentFieldErrors = {}

      try {
        const token = this.$store.state.authToken
        this.selectedRepair = await this.$axios.$get(`/api/repairs/${repair.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } catch (e) {
        this.actionDialog = false
        this.pageError = 'Failed to open repair.'
      }
    },

    async addPartToRepair() {
      if (!this.selectedRepair || this.addingPart) return
      this.partFieldErrors = {}

      if (!this.partForm.partId) {
        this.partFieldErrors = { partId: ['Select a part first'] }
        return
      }
      if (!this.partForm.quantity || this.partForm.quantity < 1) {
        this.partFieldErrors = { quantity: ['Quantity must be at least 1'] }
        return
      }
      if (this.selectedPartQuantity !== null && this.partForm.quantity > this.selectedPartQuantity) {
        this.partFieldErrors = { quantity: [`Only ${this.selectedPartQuantity} in stock`] }
        return
      }

      this.addingPart = true
      try {
        const token = this.$store.state.authToken
        await this.$axios.$post(`/api/repairs/${this.selectedRepair.id}/parts`, this.partForm, {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.selectedRepair = await this.$axios.$get(`/api/repairs/${this.selectedRepair.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.partForm = { partId: null, quantity: 1 }
        this.notify('Part added')
        await this.refreshRepairs()
      } catch (err) {
        this.partFieldErrors = { partId: [this.parseApiError(err, {})] }
      } finally {
        this.addingPart = false
      }
    },

    async savePayment() {
      if (!this.selectedRepair || this.savingPayment) return
      this.paymentFieldErrors = {}

      if (!this.paymentForm.amount || this.paymentForm.amount <= 0) {
        this.paymentFieldErrors = { amount: ['Enter a valid amount'] }
        return
      }

      this.savingPayment = true
      try {
        const token = this.$store.state.authToken
        await this.$axios.$post(
          `/api/repairs/${this.selectedRepair.id}/payments`,
          this.paymentForm,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        this.actionDialog = false
        this.notify('Payment recorded')
        await this.refreshRepairs()
      } catch (err) {
        this.paymentFieldErrors = { amount: [this.parseApiError(err, {})] }
      } finally {
        this.savingPayment = false
      }
    },

    // ── Status workflow ───────────────────────────────
    openStatusDialog(repair) {
      this.statusRepair = repair
      this.statusForm = { next: null, note: '' }
      this.statusError = ''
      this.statusDialog = true
    },

    closeStatusDialog() {
      if (this.updatingStatus) return
      this.statusDialog = false
      this.statusRepair = null
    },

    async confirmStatusChange() {
      if (!this.statusRepair || !this.statusForm.next || this.updatingStatus) return

      this.updatingStatus = true
      this.statusError = ''
      const target = this.statusForm.next
      const label = this.formatStatus(target)

      try {
        const token = this.$store.state.authToken
        await this.$axios.$patch(`/api/repairs/${this.statusRepair.id}/status`, {
          status: target,
          note: this.statusForm.note || undefined,
        }, {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.statusDialog = false
        this.statusRepair = null
        this.notify(`Moved to ${label}`)
        await this.refreshRepairs()
      } catch (err) {
        this.statusError = this.parseApiError(
          err,
          {},
          'Could not change status. The ticket may have been updated elsewhere.'
        )
      } finally {
        this.updatingStatus = false
      }
    },

    // ── Helpers ───────────────────────────────────────
    notify(text, color = 'success') {
      this.snackbar = { show: true, text, color }
    },

    parseApiError(err, fieldTarget = {}, fallback = 'Something went wrong.') {
      const data = err?.response?.data || err?.data
      const apiError = data?.error

      if (!apiError) {
        return err?.message === 'Network Error'
          ? 'Cannot reach server. Check your connection.'
          : fallback
      }
      if (typeof apiError === 'string') return apiError
      if (apiError.fieldErrors) {
        Object.assign(fieldTarget, apiError.fieldErrors)
        return 'Please fix the highlighted fields.'
      }
      if (Array.isArray(apiError.formErrors) && apiError.formErrors.length) {
        return apiError.formErrors.join(', ')
      }
      return fallback
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
      return (status || '').replace(/_/g, ' ')
    },

    formatDate(dateString) {
      if (!dateString) return '—'
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
      })
    },

    formatMoney(val) {
      return new Intl.NumberFormat('en-KE').format(val || 0)
    },
  },
}
</script>

<style scoped>
.repairs-page {
  padding: 24px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 1.5rem;
  gap: 16px;
  flex-wrap: wrap;
}
.page-title {
  font-size: 1.75rem; font-weight: 800; margin: 0;
  letter-spacing: -0.5px; color: #121212;
}
.page-subtitle { color: #64748b; margin: 0; font-size: 0.95rem; }

/* Toolbar */
.toolbar {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.search-bar { max-width: 520px; }
.status-filter { max-width: 200px; }

.btn-primary {
  background-color: #D32F2F !important;
  color: white !important;
  font-weight: 600 !important;
  text-transform: none !important;
  border-radius: 8px !important;
  letter-spacing: 0 !important;
  transition: all 0.2s ease;
}
.btn-primary:hover {
  background-color: #B71C1C !important;
  transform: translateY(-1px);
}

.custom-table-card {
  border-radius: 12px !important;
  border: 1px solid #e2e8f0 !important;
  background: #ffffff !important;
  overflow: hidden;
}
.premium-table >>> th {
  font-size: 0.75rem !important;
  text-transform: uppercase;
  font-weight: 700 !important;
  color: #64748b !important;
  background-color: #f8fafc !important;
  padding: 16px !important;
  border-bottom: 1px solid #e2e8f0 !important;
}
.premium-table >>> td {
  padding: 16px !important;
  border-bottom: 1px solid #f1f5f9 !important;
  font-size: 0.9rem;
  vertical-align: middle;
}
.table-row { transition: background 0.2s ease; }
.table-row:hover { background-color: #f8fafc !important; }

/* Status chip: label + interactive affordance */
.status-chip {
  font-weight: 700 !important;
  letter-spacing: 0.3px;
  border-radius: 6px !important;
}
.status-chip--action {
  cursor: pointer;
  transition: filter 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
}
.status-chip--action:hover {
  filter: brightness(1.08);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
  transform: translateY(-1px);
}
.status-chip--action:focus-visible {
  outline: 2px solid #D32F2F;
  outline-offset: 2px;
}
.status-chip__pencil {
  opacity: 0.7;
  margin-left: 2px;
}
.status-chip--action:hover .status-chip__pencil { opacity: 1; }

/* Status options in dialog */
.status-option {
  border-radius: 10px !important;
  transition: all 0.15s ease;
  cursor: pointer;
}
.status-option:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* Row action buttons */
.status-btn {
  color: #94a3b8 !important;
  background-color: #f1f5f9 !important;
  transition: all 0.2s ease;
}
.status-btn:hover {
  color: #121212 !important;
  background-color: #e2e8f0 !important;
}
.edit-btn {
  background-color: #FEF2F2 !important;
  color: #D32F2F !important;
  transition: all 0.2s ease;
}
.edit-btn:hover {
  background-color: #D32F2F !important;
  color: #ffffff !important;
}

/* Dialogs */
.dialog-card { border-radius: 16px !important; overflow: hidden; }
.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}
.dialog-header h3 {
  margin: 0; font-weight: 800; font-size: 1.2rem; color: #121212;
}
.dialog-body { padding: 1.5rem !important; }

.parts-used-list {
  background: #f8fafc;
  border-radius: 8px;
  padding: 0.5rem;
}

/* Responsive */
@media (max-width: 600px) {
  .repairs-page { padding: 16px; }
  .toolbar { flex-direction: column; }
  .search-bar, .status-filter { max-width: 100%; width: 100%; }
  .header-section { align-items: flex-start; }
  .premium-table >>> th,
  .premium-table >>> td { padding: 12px !important; }
}
</style>