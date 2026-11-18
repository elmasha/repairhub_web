<template>
  <div class="pos-page">
    <!-- Header -->
    <div class="header-section">
      <div>
        <h1 class="page-title">Point of Sale</h1>
        <p class="page-subtitle">Tap an item to add it to the current sale.</p>
      </div>
      <div class="header-meta">
        <v-chip v-if="cart.length" small class="header-chip">
          <v-icon left x-small>mdi-cart</v-icon>
          {{ cart.length }} {{ cart.length === 1 ? 'item' : 'items' }}
        </v-chip>
        <v-chip v-if="cart.length" small class="header-chip header-chip--total">
          KES {{ formatMoney(cartTotal) }}
        </v-chip>
      </div>
    </div>

    <!-- Body -->
    <div class="pos-body">
      <!-- LEFT: products -->
      <section class="products-pane">
        <div class="products-toolbar">
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            label="Search parts by name or SKU..."
            outlined
            dense
            color="primary"
            class="search-bar mb-0"
            clearable
            hide-details
          />
          <div class="results-count">
            {{ filteredParts.length }}
            {{ filteredParts.length === 1 ? 'item' : 'items' }}
          </div>
        </div>

        <div class="products-scroll">
          <!-- Skeleton loading -->
          <v-row v-if="loading" dense>
            <v-col v-for="n in 12" :key="n" cols="6" sm="4" md="3">
              <div class="skeleton-card">
                <v-skeleton-loader type="image" class="skeleton-icon" />
                <v-skeleton-loader type="text" />
                <v-skeleton-loader type="text" width="60%" />
              </div>
            </v-col>
          </v-row>

          <v-row v-else dense>
            <v-col
              v-for="part in filteredParts"
              :key="part.id"
              cols="6"
              sm="4"
              md="3"
            >
              <v-card
                class="pos-product-card"
                :class="{
                  'is-out': part.quantity <= 0,
                  'is-in-cart': cartQty(part.id) > 0,
                }"
                elevation="0"
                @click="addToCart(part)"
              >
                <!-- Quantity badge when in cart -->
                <div v-if="cartQty(part.id)" class="in-cart-badge">
                  {{ cartQty(part.id) }}
                </div>

                <div class="product-icon">
                  <v-icon medium color="#D32F2F">mdi-cellphone</v-icon>
                </div>
                <div class="product-name" :title="part.name">{{ part.name }}</div>
                <div class="product-price">KES {{ formatMoney(part.sellPrice) }}</div>

                <div class="stock-row">
                  <span
                    class="stock-dot"
                    :class="part.quantity <= 0
                      ? 'stock-dot--out'
                      : part.quantity < 5 ? 'stock-dot--low' : 'stock-dot--ok'"
                  />
                  <span class="stock-text">
                    {{ part.quantity <= 0 ? 'Out of stock' : `${part.quantity} left` }}
                  </span>
                </div>
              </v-card>
            </v-col>

            <v-col cols="12" v-if="filteredParts.length === 0">
              <div class="empty-grid">
                <v-icon size="40" color="grey lighten-1">mdi-package-variant</v-icon>
                <div class="empty-title">No parts found</div>
                <div class="empty-sub">
                  {{ search ? 'Try a different search term.' : 'Add stock to your inventory first.' }}
                </div>
              </div>
            </v-col>
          </v-row>
        </div>
      </section>

      <!-- RIGHT: cart -->
      <aside class="cart-pane hidden-sm-and-down">
        <v-card class="cart-card" elevation="0">
          <div class="cart-header">
            <div>
              <span class="cart-title">Current Sale</span>
              <span v-if="cart.length" class="cart-subtitle">
                {{ cart.length }} {{ cart.length === 1 ? 'line' : 'lines' }}
              </span>
            </div>
            <v-btn
              v-if="cart.length"
              text
              x-small
              color="error"
              class="clear-btn"
              @click="clearCart"
            >
              Clear
            </v-btn>
          </div>

          <v-divider />

          <div class="cart-items-container">
            <transition-group v-if="cart.length > 0" name="cart-list" tag="div">
              <div v-for="(item, index) in cart" :key="item.id" class="cart-item">
                <div class="item-details">
                  <div class="item-name">{{ item.name }}</div>
                  <div class="item-price">KES {{ formatMoney(item.sellPrice) }} each</div>
                </div>

                <div class="item-actions">
                  <div class="qty-controls">
                    <button class="qty-btn" @click.stop="decreaseQuantity(index)" aria-label="Decrease">
                      <v-icon x-small>mdi-minus</v-icon>
                    </button>
                    <span class="qty-number">{{ item.quantity }}</span>
                    <button
                      class="qty-btn"
                      :disabled="item.quantity >= item.stock"
                      @click.stop="increaseQuantity(index)"
                      aria-label="Increase"
                    >
                      <v-icon x-small>mdi-plus</v-icon>
                    </button>
                  </div>
                  <button class="remove-btn" @click.stop="removeFromCart(index)" aria-label="Remove">
                    <v-icon x-small>mdi-close</v-icon>
                  </button>
                </div>
              </div>
            </transition-group>

            <div v-else class="empty-cart-state">
              <div class="empty-cart-icon">
                <v-icon size="28" color="#D32F2F">mdi-cart-outline</v-icon>
              </div>
              <div class="empty-cart-title">No items yet</div>
              <div class="empty-cart-sub">Tap a part on the left to start a sale.</div>
            </div>
          </div>

          <!-- Sticky footer -->
          <div class="cart-footer">
            <div class="total-row">
              <span class="total-label">Total</span>
              <span class="total-amount">KES {{ formatMoney(cartTotal) }}</span>
            </div>
            <v-btn
              block
              class="btn-primary mt-3"
              height="46"
              :disabled="cart.length === 0"
              @click="openCheckout"
            >
              <v-icon left small>mdi-credit-card-outline</v-icon>
              Complete Payment
            </v-btn>
          </div>
        </v-card>
      </aside>
    </div>

    <!-- Mobile cart bar -->
    <v-bottom-sheet v-model="mobileCartSheet" class="hidden-md-and-up" max-width="100%">
      <template v-slot:activator="{ on, attrs }">
        <transition name="slide-up">
          <div
            v-if="cart.length > 0"
            class="mobile-cart-bar hidden-md-and-up"
            v-bind="attrs"
            v-on="on"
          >
            <div class="d-flex align-center">
              <div class="cart-icon-wrapper mr-3">
                <v-icon color="white" small>mdi-cart</v-icon>
                <span class="cart-count">{{ cart.length }}</span>
              </div>
              <div>
                <div class="mobile-bar-title">View sale</div>
                <div class="mobile-bar-sub">KES {{ formatMoney(cartTotal) }}</div>
              </div>
            </div>
            <button class="mobile-checkout-btn" @click.stop="openCheckout">
              Checkout
            </button>
          </div>
        </transition>
      </template>

      <v-sheet class="mobile-sheet">
        <div class="sheet-handle" />
        <v-btn icon absolute right top color="grey" class="mt-2 mr-2" @click="mobileCartSheet = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>

        <div class="cart-header pt-5">
          <span class="cart-title">Your Order</span>
          <span class="cart-subtitle">{{ cart.length }} items</span>
        </div>

        <v-divider />

        <div class="mobile-cart-items">
          <div v-for="(item, index) in cart" :key="item.id" class="cart-item">
            <div class="item-details">
              <div class="item-name">{{ item.name }}</div>
              <div class="item-price">KES {{ formatMoney(item.sellPrice) }} each</div>
            </div>
            <div class="item-actions">
              <div class="qty-controls">
                <button class="qty-btn" @click.stop="decreaseQuantity(index)">
                  <v-icon x-small>mdi-minus</v-icon>
                </button>
                <span class="qty-number">{{ item.quantity }}</span>
                <button
                  class="qty-btn"
                  :disabled="item.quantity >= item.stock"
                  @click.stop="increaseQuantity(index)"
                >
                  <v-icon x-small>mdi-plus</v-icon>
                </button>
              </div>
              <button class="remove-btn" @click.stop="removeFromCart(index)">
                <v-icon x-small>mdi-close</v-icon>
              </button>
            </div>
          </div>
        </div>

        <div class="mobile-cart-total">
          <div class="total-row mb-3">
            <span class="total-label">Total</span>
            <span class="total-amount">KES {{ formatMoney(cartTotal) }}</span>
          </div>
          <v-btn block class="btn-primary" height="50" :disabled="cart.length === 0" @click="openCheckout">
            Complete Payment
          </v-btn>
        </div>
      </v-sheet>
    </v-bottom-sheet>

    <!-- Checkout dialog -->
    <v-dialog v-model="checkoutDialog" max-width="420px" persistent>
      <v-card class="dialog-card">
        <div class="dialog-header">
          <h3>Confirm Payment</h3>
          <v-btn icon small color="grey" :disabled="processing" @click="checkoutDialog = false">
            <v-icon small>mdi-close</v-icon>
          </v-btn>
        </div>

        <v-card-text class="py-4">
          <v-alert v-if="checkoutError" type="error" dense outlined class="mb-3 text-left">
            {{ checkoutError }}
          </v-alert>

          <!-- Order summary -->
          <div class="checkout-summary">
            <div class="summary-row">
              <span>Subtotal</span>
              <span>KES {{ formatMoney(cartTotal) }}</span>
            </div>
            <div class="summary-row summary-row--total">
              <span>Amount to pay</span>
              <span>KES {{ formatMoney(cartTotal) }}</span>
            </div>
          </div>

          <div class="field-label">Payment method</div>
          <div class="method-grid mb-4">
            <button
              v-for="m in ['CASH', 'MPESA', 'CARD']"
              :key="m"
              type="button"
              class="method-btn"
              :class="{ active: paymentMethod === m }"
              :disabled="processing"
              @click="paymentMethod = m"
            >
              <v-icon small :color="paymentMethod === m ? '#D32F2F' : '#64748b'">
                {{ m === 'CASH' ? 'mdi-cash' : m === 'MPESA' ? 'mdi-cellphone' : 'mdi-credit-card' }}
              </v-icon>
              <span>{{ m }}</span>
            </button>
          </div>

          <v-text-field
            v-if="paymentMethod === 'MPESA' || paymentMethod === 'CARD'"
            v-model.trim="paymentRef"
            :label="paymentMethod === 'MPESA' ? 'M-Pesa code' : 'Card reference'"
            outlined
            dense
            color="primary"
            prepend-inner-icon="mdi-pound"
            :disabled="processing"
            hide-details
          />
        </v-card-text>

        <v-card-actions class="px-4 pb-4">
          <v-btn text :disabled="processing" @click="checkoutDialog = false">Cancel</v-btn>
          <v-spacer />
          <v-btn
            class="btn-primary px-6"
            height="44"
            :loading="processing"
            :disabled="processing || cart.length === 0"
            @click="processCheckout"
          >
            Charge KES {{ formatMoney(cartTotal) }}
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
export default {
  middleware: ['authenticated', 'role'],
  data() {
    return {
      parts: [],
      cart: [],
      search: '',
      loading: true,
      checkoutDialog: false,
      mobileCartSheet: false,
      paymentMethod: 'CASH',
      paymentRef: '',
      processing: false,
      checkoutError: '',
      snackbar: { show: false, text: '', color: 'success' },
    }
  },
  computed: {
    filteredParts() {
      if (!this.search) return this.parts
      const q = this.search.toLowerCase()
      return this.parts.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q))
      )
    },
    cartTotal() {
      return this.cart.reduce((sum, i) => sum + i.sellPrice * i.quantity, 0)
    },
  },
  async mounted() {
    await this.fetchParts()
  },
  methods: {
    async fetchParts() {
      this.loading = true
      try {
        const res = await this.$axios.$get('/api/parts')
        this.parts = res.items
      } catch (e) {
        this.parts = []
      } finally {
        this.loading = false
      }
    },
    formatMoney(val) {
      return new Intl.NumberFormat('en-KE').format(val || 0)
    },
    cartQty(id) {
      const i = this.cart.find(x => x.id === id)
      return i ? i.quantity : 0
    },
    addToCart(part) {
      if (part.quantity <= 0) return
      const existing = this.cart.find(i => i.id === part.id)
      if (existing) {
        if (existing.quantity < part.quantity) existing.quantity++
      } else {
        this.cart.push({ ...part, stock: part.quantity, quantity: 1 })
      }
    },
    removeFromCart(index) {
      this.cart.splice(index, 1)
    },
    increaseQuantity(index) {
      const item = this.cart[index]
      if (item.quantity < item.stock) item.quantity++
    },
    decreaseQuantity(index) {
      if (this.cart[index].quantity > 1) this.cart[index].quantity--
      else this.removeFromCart(index)
    },
    clearCart() {
      this.cart = []
    },
    openCheckout() {
      this.checkoutError = ''
      this.checkoutDialog = true
    },
    async processCheckout() {
      if (this.processing || this.cart.length === 0) return
      this.checkoutError = ''
      this.processing = true
      try {
        await this.$axios.$post('/api/sales', {
          items: this.cart.map(i => ({ partId: i.id, quantity: i.quantity, unitPrice: i.sellPrice })),
          paymentMethod: this.paymentMethod,
          paymentReference: this.paymentRef,
        })
        this.checkoutDialog = false
        this.mobileCartSheet = false
        this.cart = []
        this.paymentRef = ''
        this.notify('Sale completed')
        await this.fetchParts()
      } catch (e) {
        this.checkoutError = e?.response?.data?.error?.formErrors?.join?.(', ')
          || e?.response?.data?.error
          || 'Checkout failed. Please try again.'
      } finally {
        this.processing = false
      }
    },
    notify(text, color = 'success') {
      this.snackbar = { show: true, text, color }
    },
  },
}
</script>

<style scoped>
/* ── Shell ─────────────────────────────────────────── */
.pos-page {
  height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  padding: 20px;
  box-sizing: border-box;
  overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: #f1f5f9;
}

/* ── Header ────────────────────────────────────────── */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 16px;
  flex: 0 0 auto;
}
.page-title {
  font-size: 1.5rem; font-weight: 800; margin: 0;
  letter-spacing: -0.6px; color: #0f172a;
}
.page-subtitle { color: #64748b; margin: 2px 0 0; font-size: 0.82rem; }

.header-meta { display: flex; gap: 8px; align-items: center; }
.header-chip {
  background: #ffffff !important;
  border: 1px solid #e2e8f0;
  color: #0f172a !important;
  font-weight: 600 !important;
}
.header-chip--total {
  background: #121212 !important;
  color: #ffffff !important;
  border-color: #121212;
}

/* ── Body ──────────────────────────────────────────── */
.pos-body {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  gap: 20px;
}

.products-pane {
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.products-toolbar {
  flex: 0 0 auto;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
}
.search-bar { flex: 1 1 auto; max-width: 520px; }
.search-bar >>> .v-input__slot {
  background: #ffffff !important;
  border-radius: 10px !important;
  box-shadow: none !important;
  min-height: 38px !important;
}
.results-count {
  font-size: 0.78rem;
  color: #94a3b8;
  font-weight: 600;
  white-space: nowrap;
}

.products-scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: 4px 6px 4px 0;   /* room for scrollbar + hover lift */
  margin: -4px 0 -4px -4px; /* let hover shadow breathe */
}

/* ── Product cards ─────────────────────────────────── */
.pos-product-card {
  position: relative;
  padding: 14px 10px 12px;
  text-align: center;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.pos-product-card:hover {
  border-color: #D32F2F;
  transform: translateY(-2px);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
}
.pos-product-card.is-out {
  opacity: 0.55;
  cursor: not-allowed;
  filter: grayscale(100%);
  pointer-events: none;
}
.pos-product-card.is-in-cart {
  border-color: #D32F2F;
  background: #FFF7F7;
}

.in-cart-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 999px;
  background: #D32F2F;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(211, 47, 47, 0.35);
}

.product-icon {
  background: #FEF2F2;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}
.product-name {
  font-weight: 700;
  font-size: 0.8rem;
  color: #0f172a;
  line-height: 1.25;
  margin-bottom: 4px;
  height: 2.5em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.product-price {
  color: #D32F2F;
  font-weight: 800;
  font-size: 0.92rem;
  margin-bottom: 8px;
}

.stock-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.68rem;
  font-weight: 600;
  color: #64748b;
}
.stock-dot {
  width: 7px; height: 7px; border-radius: 50%;
}
.stock-dot--ok { background: #16a34a; }
.stock-dot--low { background: #f59e0b; }
.stock-dot--out { background: #dc2626; }
.stock-text { color: #64748b; }

/* Skeleton */
.skeleton-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px;
}
.skeleton-icon { margin-bottom: 8px; }

/* Empty grid */
.empty-grid {
  padding: 64px 16px;
  text-align: center;
}
.empty-title {
  margin-top: 12px;
  font-weight: 700;
  color: #0f172a;
  font-size: 0.95rem;
}
.empty-sub {
  margin-top: 4px;
  color: #94a3b8;
  font-size: 0.82rem;
}

/* ── Cart ──────────────────────────────────────────── */
.cart-pane {
  flex: 0 0 380px;
  min-height: 0;
  display: flex;
}
.cart-card {
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.cart-header {
  padding: 16px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 0 0 auto;
}
.cart-title {
  font-size: 1rem;
  font-weight: 800;
  color: #0f172a;
  display: block;
}
.cart-subtitle {
  font-size: 0.72rem;
  color: #94a3b8;
  font-weight: 600;
}
.clear-btn { letter-spacing: 0 !important; text-transform: none !important; }

.cart-items-container {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
  gap: 8px;
}
.item-details { flex-grow: 1; min-width: 0; }
.item-name {
  font-weight: 600;
  font-size: 0.84rem;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.item-price { font-size: 0.72rem; color: #94a3b8; margin-top: 1px; }

.item-actions { display: flex; align-items: center; gap: 4px; }

.qty-controls {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}
.qty-btn {
  width: 26px; height: 26px;
  display: flex; align-items: center; justify-content: center;
  background: transparent; border: 0; cursor: pointer;
  color: #64748b;
  transition: background 0.15s ease, color 0.15s ease;
}
.qty-btn:hover:not(:disabled) { background: #e2e8f0; color: #0f172a; }
.qty-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.qty-number {
  min-width: 26px;
  text-align: center;
  font-weight: 700;
  font-size: 0.82rem;
  color: #0f172a;
}

.remove-btn {
  width: 26px; height: 26px;
  border-radius: 6px;
  border: 0;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s ease, color 0.15s ease;
}
.remove-btn:hover { background: #FEF2F2; color: #D32F2F; }

.empty-cart-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 24px;
  text-align: center;
}
.empty-cart-icon {
  width: 56px; height: 56px;
  border-radius: 50%;
  background: #FEF2F2;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 12px;
}
.empty-cart-title { font-weight: 700; color: #0f172a; font-size: 0.9rem; }
.empty-cart-sub { color: #94a3b8; font-size: 0.78rem; margin-top: 4px; }

.cart-footer {
  flex: 0 0 auto;
  padding: 16px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}
.total-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.total-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #64748b;
}
.total-amount {
  font-size: 1.35rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.5px;
}

.btn-primary {
  background-color: #D32F2F !important;
  color: #ffffff !important;
  font-weight: 600 !important;
  text-transform: none !important;
  border-radius: 10px !important;
  letter-spacing: 0 !important;
  transition: background 0.15s ease, transform 0.15s ease;
}
.btn-primary:hover:not(:disabled) {
  background-color: #B71C1C !important;
  transform: translateY(-1px);
}

/* Cart list transition */
.cart-list-enter-active,
.cart-list-leave-active { transition: all 0.18s ease; }
.cart-list-enter { opacity: 0; transform: translateY(-4px); }
.cart-list-leave-to { opacity: 0; transform: translateX(-8px); }
.cart-list-leave-active { position: absolute; width: 100%; }

/* ── Dialog ────────────────────────────────────────── */
.dialog-card { border-radius: 16px !important; overflow: hidden; }
.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}
.dialog-header h3 {
  margin: 0; font-weight: 800; font-size: 1.15rem; color: #0f172a;
}

.checkout-summary {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px 14px;
  margin-bottom: 16px;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.84rem;
  color: #64748b;
  padding: 4px 0;
}
.summary-row--total {
  border-top: 1px dashed #e2e8f0;
  margin-top: 6px;
  padding-top: 10px;
  font-size: 1rem;
  font-weight: 800;
  color: #0f172a;
}

.field-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #64748b;
  margin-bottom: 8px;
}
.method-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.method-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 6px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  cursor: pointer;
  font-size: 0.72rem;
  font-weight: 700;
  color: #64748b;
  transition: all 0.15s ease;
}
.method-btn:hover:not(:disabled) { border-color: #cbd5e1; }
.method-btn.active {
  border-color: #D32F2F;
  background: #FEF2F2;
  color: #D32F2F;
}
.method-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Mobile ────────────────────────────────────────── */
.mobile-cart-bar {
  position: fixed;
  bottom: 16px; left: 16px; right: 16px;
  background-color: #121212;
  border-radius: 14px;
  padding: 10px 12px 10px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  z-index: 100;
  cursor: pointer;
}
.cart-icon-wrapper {
  position: relative;
  width: 38px; height: 38px;
  background: #D32F2F;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.cart-count {
  position: absolute;
  top: -4px; right: -4px;
  min-width: 18px; height: 18px;
  padding: 0 4px;
  background: #ffffff;
  color: #121212;
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: 800;
  display: flex; align-items: center; justify-content: center;
}
.mobile-bar-title {
  font-weight: 700;
  color: #ffffff;
  font-size: 0.85rem;
}
.mobile-bar-sub {
  font-size: 0.72rem;
  color: #94a3b8;
}
.mobile-checkout-btn {
  background: #D32F2F;
  color: #fff;
  border: 0;
  border-radius: 8px;
  padding: 10px 16px;
  font-weight: 700;
  font-size: 0.8rem;
  cursor: pointer;
}
.mobile-checkout-btn:hover { background: #B71C1C; }

.slide-up-enter-active, .slide-up-leave-active { transition: all 0.2s ease; }
.slide-up-enter, .slide-up-leave-to { opacity: 0; transform: translateY(12px); }

.mobile-sheet {
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  padding-bottom: 20px;
}
.sheet-handle {
  width: 36px; height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  margin: 10px auto 0;
}
.mobile-cart-items { max-height: 50vh; overflow-y: auto; }
.mobile-cart-total {
  padding: 16px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

/* ── Responsive ────────────────────────────────────── */
@media (max-width: 959px) {
  .pos-page { height: auto; overflow: visible; padding: 16px 16px 100px; }
  .pos-body { display: block; }
  .products-scroll { overflow: visible; }
}
</style>