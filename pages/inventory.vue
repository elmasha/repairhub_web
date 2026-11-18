<template>
  <div class="inventory-page">
    <!-- Header -->
    <div class="header-section">
      <div>
        <h1 class="page-title">Inventory</h1>
        <p class="page-subtitle">Manage spare parts, accessories, and devices.</p>
      </div>
      <div class="action-buttons">
        <v-btn outlined class="btn-outline" :disabled="loading" @click="$refs.fileInput.click()">
          <v-icon left small>mdi-upload</v-icon> Import CSV
        </v-btn>
        <input ref="fileInput" type="file" accept=".csv" style="display:none" @change="handleFileUpload" />

        <v-btn class="btn-primary ml-3" @click="openCreateDialog">
          <v-icon left small>mdi-plus</v-icon> Add Item
        </v-btn>
      </div>
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
          v-for="t in categories"
          :key="t.value"
          type="button"
          class="segmented-btn"
          :class="{ active: activeCategory === t.value }"
          @click="activeCategory = t.value"
        >
          <v-icon small class="mr-1">{{ t.icon }}</v-icon>
          {{ t.label }}
        </button>
      </div>

      <v-divider />

      <div class="control-body">
        <div class="summary-block">
          <div class="summary-label">
            {{ activeCategoryLabel }} · {{ filteredItems.length }} SKU{{ filteredItems.length === 1 ? '' : 's' }}
          </div>
          <div class="summary-value">KES {{ formatMoney(categoryValue) }}</div>
          <div class="summary-meta">
            <span v-if="lowStockCount" class="warn-text">
              <v-icon x-small color="#D97706" class="mr-1">mdi-alert-outline</v-icon>
              {{ lowStockCount }} low on stock
            </span>
            <span v-else class="ok-text">
              <v-icon x-small color="#059669" class="mr-1">mdi-check-circle</v-icon>
              Stock levels healthy
            </span>
          </div>
        </div>

        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Search by name or SKU..."
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
      <p class="mt-3 text-caption text-grey">Loading inventory...</p>
    </div>

    <!-- DESKTOP: table -->
    <v-card v-else-if="isDesktop" class="custom-table-card" elevation="0">
      <v-simple-table class="premium-table">
        <template #default>
          <thead>
            <tr>
              <th class="text-left">Item</th>
              <th class="text-left">SKU</th>
              <th class="text-left">Stock</th>
              <th class="text-right">Cost</th>
              <th class="text-right">Sell</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="part in filteredItems" :key="part.id" class="table-row">
              <td>
                <div class="item-name">{{ part.name }}</div>
              </td>
              <td>
                <span v-if="part.sku" class="sku-pill">{{ part.sku }}</span>
                <span v-else class="text-grey">—</span>
              </td>
              <td>
                <span class="stock-indicator" :class="stockClass(part.quantity)">
                  <span class="stock-dot" />
                  {{ part.quantity }} left
                </span>
              </td>
              <td class="text-right money-muted">KES {{ formatMoney(part.costPrice) }}</td>
              <td class="text-right money-strong">KES {{ formatMoney(part.sellPrice) }}</td>
              <td class="text-right">
                <v-btn icon small class="edit-btn" title="Edit item" @click="openEditDialog(part)">
                  <v-icon small>mdi-pencil</v-icon>
                </v-btn>
              </td>
            </tr>

            <tr v-if="filteredItems.length === 0">
              <td colspan="6" class="text-center py-10">
                <v-icon size="48" color="grey lighten-2" class="mb-2">mdi-package-variant</v-icon>
                <div class="empty-title">
                  {{ search ? 'No items match your search' : 'No items in this category' }}
                </div>
                <div class="empty-sub">
                  {{ search ? 'Try a different name or SKU.' : 'Add a new item to get started.' }}
                </div>
              </td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-card>

    <!-- MOBILE: cards -->
    <div v-else class="mobile-list">
      <v-card
        v-for="part in filteredItems"
        :key="part.id"
        class="mobile-item-card mb-3"
        elevation="0"
      >
        <div class="d-flex justify-space-between align-start mb-1">
          <div class="item-name flex-grow-1 pr-2">{{ part.name }}</div>
          <v-btn icon x-small class="edit-btn" @click="openEditDialog(part)">
            <v-icon x-small>mdi-pencil</v-icon>
          </v-btn>
        </div>

        <div class="d-flex align-center mb-2">
          <span v-if="part.sku" class="sku-pill mr-2">{{ part.sku }}</span>
          <span class="stock-indicator" :class="stockClass(part.quantity)">
            <span class="stock-dot" />
            {{ part.quantity }} left
          </span>
        </div>

        <v-divider class="my-2" />

        <div class="d-flex justify-space-between text-caption">
          <span class="money-muted">Cost · KES {{ formatMoney(part.costPrice) }}</span>
          <span class="money-strong">Sell · KES {{ formatMoney(part.sellPrice) }}</span>
        </div>
      </v-card>

      <div v-if="filteredItems.length === 0" class="text-center py-10">
        <v-icon size="48" color="grey lighten-2" class="mb-2">mdi-package-variant</v-icon>
        <div class="empty-title">
          {{ search ? 'No items match your search' : 'No items in this category' }}
        </div>
        <div class="empty-sub">
          {{ search ? 'Try a different term.' : 'Add a new item to get started.' }}
        </div>
      </div>
    </div>

    <!-- Add / Edit Dialog -->
    <v-dialog v-model="dialog" max-width="520px" @click:outside="closeDialog">
      <v-card class="dialog-card">
        <div class="dialog-header">
          <h3>{{ isEditing ? 'Edit Item' : 'Add New Item' }}</h3>
          <v-btn icon small color="grey" :disabled="saving" @click="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <v-card-text class="dialog-body pt-4">
          <v-alert v-if="error" type="error" dense outlined class="mb-4 text-left">{{ error }}</v-alert>

          <v-select
            v-model="form.category"
            :items="categoryOptions"
            label="Category"
            outlined dense color="primary" required
            :disabled="saving"
            :error-messages="fieldErrors.category"
            @change="handleCategoryChange"
          />

          <v-text-field
            v-model.trim="form.name"
            label="Item Name"
            outlined dense color="primary"
            :disabled="saving"
            :error-messages="fieldErrors.name"
            @input="generateSku"
          />

          <v-text-field
            v-model.trim="form.sku"
            label="SKU"
            outlined dense color="primary"
            :disabled="saving"
            :error-messages="fieldErrors.sku"
            hint="Auto-generated from the name, but you can edit it."
            persistent-hint
            @input="onSkuInput"
          />

          <v-row dense class="mt-4">
            <v-col cols="12" sm="4">
              <v-text-field
                v-model.number="form.quantity"
                label="Quantity"
                type="number" min="0"
                outlined dense color="primary"
                :disabled="saving"
                :error-messages="fieldErrors.quantity"
              />
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field
                v-model.number="form.costPrice"
                label="Cost Price"
                type="number" min="0"
                outlined dense color="primary"
                :disabled="saving"
                :error-messages="fieldErrors.costPrice"
                prefix="KES"
              />
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field
                v-model.number="form.sellPrice"
                label="Sell Price"
                type="number" min="0"
                outlined dense color="primary"
                :disabled="saving"
                :error-messages="fieldErrors.sellPrice"
                prefix="KES"
              />
            </v-col>
          </v-row>

          <!-- Margin hint -->
          <div v-if="marginPct !== null" class="margin-hint" :class="marginPct < 0 ? 'margin-hint--loss' : 'margin-hint--ok'">
            <v-icon x-small class="mr-1">{{ marginPct < 0 ? 'mdi-alert-circle' : 'mdi-trending-up' }}</v-icon>
            Margin: {{ marginPct }}%
          </div>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn text :disabled="saving" @click="closeDialog">Cancel</v-btn>
          <v-btn class="btn-primary" :loading="saving" :disabled="saving" @click="savePart">
            {{ isEditing ? 'Update Item' : 'Save Item' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" bottom timeout="2500">
      {{ snackbar.text }}
      <template #action="{ attrs }">
        <v-btn text v-bind="attrs" small @click="snackbar.show = false">OK</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import Papa from 'papaparse'

export default {
  data() {
    return {
      dialog: false,
      loading: true,
      saving: false,
      error: '',
      pageError: '',
      fieldErrors: {},
      search: '',
      activeCategory: 'SPARE_PART',
      parts: [],
      isEditing: false,
      editingId: null,
      skuManuallyEdited: false,
      isDesktop: true,
      snackbar: { show: false, text: '', color: 'success' },
      categories: [
        { value: 'SPARE_PART', label: 'Spare Parts', icon: 'mdi-cog' },
        { value: 'ACCESSORY',  label: 'Accessories', icon: 'mdi-headphones' },
        { value: 'DEVICE',     label: 'Devices',     icon: 'mdi-cellphone' },
      ],
      form: {
        name: '',
        sku: '',
        category: 'SPARE_PART',
        quantity: 0,
        costPrice: 0,
        sellPrice: 0,
      },
    }
  },

  computed: {
    categoryOptions() {
      return [
        { text: 'Spare Part', value: 'SPARE_PART' },
        { text: 'Accessory', value: 'ACCESSORY' },
        { text: 'Device (Phone)', value: 'DEVICE' },
      ]
    },

    activeCategoryLabel() {
      const c = this.categories.find(x => x.value === this.activeCategory)
      return c ? c.label : 'Items'
    },

    filteredItems() {
      let items = (this.parts || []).filter(p => p.category === this.activeCategory)
      if (this.search) {
        const q = this.search.toLowerCase()
        items = items.filter(p =>
          p.name?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q)
        )
      }
      return items
    },

    // Total stock value for the active category (cost basis)
    categoryValue() {
      return this.filteredItems.reduce((s, p) => s + (p.costPrice || 0) * (p.quantity || 0), 0)
    },

    lowStockCount() {
      return this.filteredItems.filter(p => p.quantity > 0 && p.quantity < 5).length
    },

    // Margin preview in the dialog (0 = unknown/blank)
    marginPct() {
      const cost = Number(this.form.costPrice)
      const sell = Number(this.form.sellPrice)
      if (!cost || !sell || cost <= 0) return null
      return Math.round(((sell - cost) / cost) * 100)
    },
  },

  async mounted() {
    this.updateViewport()
    if (process.client) window.addEventListener('resize', this.updateViewport)
    await this.fetchParts()
  },

  beforeDestroy() {
    if (process.client) window.removeEventListener('resize', this.updateViewport)
  },

  methods: {
    updateViewport() {
      this.isDesktop = process.client ? window.innerWidth >= 960 : true
    },

    async fetchParts() {
      this.loading = true
      this.pageError = ''
      try {
        const res = await this.$axios.$get('/api/parts', { params: { pageSize: 100 } })
        this.parts = Array.isArray(res) ? res : res.items
      } catch (e) {
        this.pageError = 'Failed to load inventory.'
        this.parts = []
      } finally {
        this.loading = false
      }
    },

    openCreateDialog() {
      this.isEditing = false
      this.editingId = null
      this.skuManuallyEdited = false
      this.error = ''
      this.fieldErrors = {}
      this.form = {
        name: '',
        sku: '',
        category: this.activeCategory,
        quantity: 0,
        costPrice: 0,
        sellPrice: 0,
      }
      this.dialog = true
    },

    openEditDialog(part) {
      this.isEditing = true
      this.editingId = part.id
      this.skuManuallyEdited = true
      this.error = ''
      this.fieldErrors = {}
      this.form = {
        name: part.name,
        sku: part.sku || '',
        category: part.category || 'SPARE_PART',
        quantity: part.quantity,
        costPrice: part.costPrice,
        sellPrice: part.sellPrice,
      }
      this.dialog = true
    },

    closeDialog() {
      if (this.saving) return
      this.dialog = false
    },

    handleCategoryChange() {
      if (!this.isEditing && !this.skuManuallyEdited) this.generateSku()
    },

    generateSku() {
      if (this.isEditing || this.skuManuallyEdited || !this.form.name) return
      const prefix =
        this.form.category === 'ACCESSORY' ? 'ACC-' :
        this.form.category === 'DEVICE'    ? 'DEV-' :
        'SP-'
      const words = this.form.name.trim().split(/\s+/)
      const nameCode = words.map(w => w.substring(0, 3).toUpperCase()).join('-')
      this.form.sku = `${prefix}${nameCode}`
    },

    onSkuInput() {
      this.skuManuallyEdited = true
    },

    parseApiError(err) {
      const apiError = err?.response?.data?.error || err?.data?.error
      this.fieldErrors = {}
      if (!apiError) {
        return err?.message === 'Network Error'
          ? 'Cannot reach server. Check your connection.'
          : 'Failed to save item.'
      }
      if (typeof apiError === 'string') return apiError
      if (apiError.fieldErrors) {
        this.fieldErrors = apiError.fieldErrors
        return 'Please fix the highlighted fields.'
      }
      if (Array.isArray(apiError.formErrors) && apiError.formErrors.length) {
        return apiError.formErrors.join(', ')
      }
      return 'Failed to save item.'
    },

    async savePart() {
      if (this.saving) return
      this.error = ''
      this.fieldErrors = {}

      if (!this.form.name) {
        this.error = 'Item name is required.'
        return
      }
      if (Number(this.form.sellPrice) < Number(this.form.costPrice)) {
        // Soft warning, not a blocker — loss-leader sales are legitimate
        this.error = 'Note: sell price is below cost. You can still save.'
      }

      this.saving = true
      try {
        const payload = {
          name: this.form.name,
          sku: this.form.sku || null,
          category: this.form.category,
          quantity: parseInt(this.form.quantity) || 0,
          costPrice: parseFloat(this.form.costPrice) || 0,
          sellPrice: parseFloat(this.form.sellPrice) || 0,
        }
        if (this.isEditing) {
          await this.$axios.$patch(`/api/parts/${this.editingId}`, payload)
        } else {
          await this.$axios.$post('/api/parts', payload)
        }
        this.dialog = false
        this.notify(this.isEditing ? 'Item updated' : 'Item added')
        await this.fetchParts()
      } catch (err) {
        this.error = this.parseApiError(err)
      } finally {
        this.saving = false
      }
    },

    handleFileUpload(event) {
      const file = event.target.files[0]
      if (!file) return

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            this.loading = true
            const formattedData = results.data.map(row => ({
              name: row.name,
              sku: row.sku || null,
              category: row.category || 'SPARE_PART',
              quantity: parseInt(row.quantity) || 0,
              costPrice: parseFloat(row.costPrice) || 0,
              sellPrice: parseFloat(row.sellPrice) || 0,
            }))
            const response = await this.$axios.$post('/api/parts/bulk', { parts: formattedData })
            this.notify(
              `Imported ${response.created} item${response.created === 1 ? '' : 's'}` +
              (response.skipped > 0 ? ` · ${response.skipped} skipped` : '')
            )
            await this.fetchParts()
          } catch (err) {
            this.pageError = 'Import failed: ' +
              (err.response?.data?.error?.message || err.response?.data?.error || err.message)
          } finally {
            this.loading = false
            event.target.value = ''
          }
        },
      })
    },

    stockClass(q) {
      if (q <= 0) return 'stock-indicator--out'
      if (q < 5) return 'stock-indicator--low'
      return 'stock-indicator--ok'
    },

    formatMoney(val) {
      return new Intl.NumberFormat('en-KE').format(val || 0)
    },

    notify(text, color = 'success') {
      this.snackbar = { show: true, text, color }
    },
  },
}
</script>

<style scoped>
.inventory-page {
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
.action-buttons { display: flex; align-items: center; gap: 8px; }

/* Buttons */
.btn-primary {
  background-color: #D32F2F !important;
  color: #ffffff !important;
  font-weight: 600 !important;
  text-transform: none !important;
  border-radius: 8px !important;
  letter-spacing: 0 !important;
  transition: background 0.15s ease, transform 0.15s ease;
}
.btn-primary:hover:not(:disabled) {
  background-color: #B71C1C !important;
  transform: translateY(-1px);
}

.btn-outline {
  border-color: #cbd5e1 !important;
  color: #0f172a !important;
  font-weight: 600 !important;
  text-transform: none !important;
  border-radius: 8px !important;
  letter-spacing: 0 !important;
}
.btn-outline:hover { border-color: #94a3b8 !important; }

/* Control card */
.control-card {
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  overflow: hidden;
}

/* Segmented tabs */
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
.segmented-btn:hover { background: #ffffff; color: #0f172a; }
.segmented-btn.active {
  background: #ffffff;
  color: #D32F2F;
  border-color: #fecaca;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
}

/* Summary + search */
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
.summary-meta { font-size: 0.78rem; color: #94a3b8; margin-top: 2px; }
.warn-text { color: #b45309; }
.ok-text { color: #047857; }

.search-bar { flex: 1 1 320px; max-width: 520px; }
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

.item-name { font-weight: 600; color: #0f172a; font-size: 0.9rem; }

.sku-pill {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 6px;
  background: #f1f5f9;
  color: #475569;
  font-family: 'SFMono-Regular', ui-monospace, Menlo, monospace;
  font-size: 0.72rem;
  font-weight: 600;
}

.stock-indicator {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  font-size: 0.82rem;
}
.stock-dot {
  width: 7px; height: 7px; border-radius: 50%;
  display: inline-block;
}
.stock-indicator--ok  { color: #047857; }
.stock-indicator--ok  .stock-dot { background: #16a34a; }
.stock-indicator--low { color: #b45309; }
.stock-indicator--low .stock-dot { background: #f59e0b; }
.stock-indicator--out { color: #b91c1c; }
.stock-indicator--out .stock-dot { background: #dc2626; }

.money-muted { color: #94a3b8; font-weight: 500; font-size: 0.85rem; }
.money-strong { color: #0f172a; font-weight: 800; font-size: 0.9rem; letter-spacing: -0.2px; }

.edit-btn {
  background-color: #FEF2F2 !important;
  color: #D32F2F !important;
  transition: all 0.15s ease;
}
.edit-btn:hover {
  background-color: #D32F2F !important;
  color: #ffffff !important;
}

/* Empty states */
.empty-title { font-weight: 700; color: #0f172a; font-size: 0.9rem; }
.empty-sub { color: #94a3b8; font-size: 0.8rem; margin-top: 4px; }

/* Mobile cards */
.mobile-item-card {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  padding: 16px;
}

/* Dialog */
.dialog-card { border-radius: 16px !important; overflow: hidden; }
.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}
.dialog-header h3 { margin: 0; font-weight: 800; font-size: 1.2rem; color: #0f172a; }
.dialog-body { padding: 1.5rem !important; }

.margin-hint {
  display: flex;
  align-items: center;
  margin-top: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
}
.margin-hint--ok {
  background: #ecfdf5;
  color: #047857;
}
.margin-hint--loss {
  background: #fef2f2;
  color: #b91c1c;
}

/* Responsive */
@media (max-width: 600px) {
  .inventory-page { padding: 16px; }
  .control-body { flex-direction: column; align-items: stretch; gap: 14px; }
  .search-bar { max-width: 100%; }
  .segmented-btn { font-size: 0.78rem; padding: 9px 6px; }
  .summary-value { font-size: 1.6rem; }
  .action-buttons { width: 100%; justify-content: flex-end; }
}
</style>