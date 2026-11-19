<template>
  <div class="admin-page">
    <!-- Login overlay — covers the default layout until authenticated -->
    <div v-if="!token" class="login-overlay">
      <v-card class="login-card" elevation="12">
        <v-card-title class="text-h5 font-weight-bold">System Admin</v-card-title>
        <v-card-text>
          <v-alert v-if="loginError" type="error" dense outlined class="mb-4 text-left">
            {{ loginError }}
          </v-alert>
          <v-text-field
            v-model.trim="email"
            label="Admin Email"
            outlined dense color="primary"
            prepend-inner-icon="mdi-email"
            :disabled="loading"
            @keyup.enter="login"
          />
          <v-text-field
            v-model="password"
            label="Password"
            type="password"
            outlined dense color="primary"
            prepend-inner-icon="mdi-lock"
            :disabled="loading"
            @keyup.enter="login"
          />
          <v-btn
            block color="#D32F2F" dark class="mt-4"
            :loading="loading" :disabled="loading"
            @click="login"
          >
            Access System
          </v-btn>
        </v-card-text>
      </v-card>
    </div>

    <!-- Dashboard -->
    <template v-else>
      <div class="header-section">
        <div>
          <h1 class="page-title">Platform Master Control</h1>
          <p class="page-subtitle">Global overview of all RepairHub tenants.</p>
        </div>
        <div class="d-flex align-center">
          <v-btn text small color="primary" class="mr-2 hidden-xs-only" @click="showAudit = true">
            <v-icon left small>mdi-history</v-icon> Audit Log
          </v-btn>
          <v-btn text small color="primary" class="mr-2 d-sm-none" @click="showAudit = true">
            <v-icon small>mdi-history</v-icon>
          </v-btn>
          <v-btn text color="error" @click="logout">Logout</v-btn>
        </div>
      </div>

      <v-alert
        v-if="pageError" type="error" dense outlined class="mb-4 text-left"
        dismissible @input="pageError = ''"
      >
        {{ pageError }}
      </v-alert>

      <!-- Metrics (Grid on Mobile) -->
      <v-row class="mb-6">
        <v-col cols="6" sm="6" md="3">
          <v-card outlined class="stat-card" style="border-left: 4px solid #10b981;">
            <div class="stat-label">Platform MRR</div>
            <div class="stat-value text-success">KES {{ formatMoney(stats.platformMRR) }}</div>
            <div class="stat-caption d-none d-sm-block">Recurring monthly revenue</div>
          </v-card>
        </v-col>
        <v-col cols="6" sm="6" md="3">
          <v-card outlined class="stat-card" style="border-left: 4px solid #3b82f6;">
            <div class="stat-label">Total Invoiced</div>
            <div class="stat-value text-primary">KES {{ formatMoney(stats.totalInvoiced) }}</div>
            <div class="stat-caption d-none d-sm-block">Actual money collected</div>
          </v-card>
        </v-col>
        <v-col cols="6" sm="6" md="3">
          <v-card outlined class="stat-card" style="border-left: 4px solid #8b5cf6;">
            <div class="stat-label">Merchant Volume</div>
            <div class="stat-value">KES {{ formatMoney(stats.totalMerchantRevenue) }}</div>
            <div class="stat-caption d-none d-sm-block">Processed by your tenants</div>
          </v-card>
        </v-col>
        <v-col cols="6" sm="6" md="3">
          <v-card outlined class="stat-card" style="border-left: 4px solid #f59e0b;">
            <div class="stat-label">Total Businesses</div>
            <div class="stat-value">{{ stats.totalBusinesses }}</div>
            <div class="stat-caption d-none d-sm-block">Shops on the platform</div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Tabs -->
      <v-tabs v-model="activeTab" background-color="transparent" color="#D32F2F" class="mb-4" show-arrows>
        <v-tab>Businesses</v-tab>
        <v-tab>Plans</v-tab>
        <v-tab>Invoices</v-tab>
        <v-tab>Payments</v-tab>
      </v-tabs>

      <v-tabs-items v-model="activeTab">
        <!-- Businesses Tab -->
        <v-tab-item>
          <v-card outlined>
            <div class="d-flex flex-wrap align-center pa-4 border-bottom">
              <v-text-field
                v-model.trim="businessSearch"
                prepend-inner-icon="mdi-magnify"
                label="Search by name or owner email..."
                outlined dense clearable
                color="primary" class="flex-grow-1 mr-2 mb-2 mb-sm-0"
                style="max-width: 380px;"
              />
              <v-select
                v-model="businessStatusFilter"
                :items="[{text:'All statuses', value:null},{text:'Active', value:'ACTIVE'},{text:'Trial', value:'TRIAL'},{text:'Suspended', value:'SUSPENDED'},{text:'Cancelled', value:'CANCELLED'}]"
                item-text="text" item-value="value"
                label="Status" outlined dense clearable
                color="primary" style="max-width: 180px;"
              />
            </div>

            <!-- Responsive Table Wrapper -->
            <div class="table-responsive">
              <v-simple-table class="responsive-table">
                <thead>
                  <tr>
                    <th class="text-left">Business</th>
                    <th class="text-left d-none d-sm-table-cell">Plan</th>
                    <th class="text-left">Status</th>
                    <th class="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="b in businesses" :key="b.id">
                    <td>
                      <div class="font-weight-bold">{{ b.name }}</div>
                      <div class="text-caption text-grey">{{ b.email || b.users?.[0]?.email || '—' }}</div>
                      <v-chip x-small color="primary" class="d-sm-none mt-1">
                        {{ b.subscription?.plan?.name || 'None' }}
                      </v-chip>
                    </td>
                    <td class="d-none d-sm-table-cell">
                      <v-chip x-small color="primary">
                        {{ b.subscription?.plan?.name || 'None' }}
                      </v-chip>
                    </td>
                    <td>
                      <v-chip x-small :color="statusColor(b.status)" dark>{{ b.status }}</v-chip>
                    </td>
                    <td class="text-right">
                      <v-btn x-small color="info" class="mr-1 px-2" @click="viewTenant(b)">
                        <span class="d-none d-sm-inline">Manage</span>
                        <v-icon small class="d-sm-none">mdi-cog</v-icon>
                      </v-btn>
                      <v-btn
                        x-small
                        :color="b.status === 'SUSPENDED' ? 'success' : 'error'"
                        class="px-2"
                        @click="toggleStatus(b)"
                      >
                        <span class="d-none d-sm-inline">{{ b.status === 'SUSPENDED' ? 'Activate' : 'Deactivate' }}</span>
                        <v-icon small class="d-sm-none">{{ b.status === 'SUSPENDED' ? 'mdi-lock-open' : 'mdi-lock' }}</v-icon>
                      </v-btn>
                    </td>
                  </tr>
                  <tr v-if="businesses.length === 0 && !loadingBusinesses">
                    <td colspan="4" class="text-center py-8 text-grey">
                      <v-icon size="48" color="grey lighten-2" class="mb-2">mdi-store-off</v-icon>
                      <div>{{ businessSearch ? 'No businesses match your search.' : 'No businesses yet.' }}</div>
                    </td>
                  </tr>
                </tbody>
              </v-simple-table>
            </div>

            <div v-if="businessTotalPages > 1" class="d-flex justify-center py-4">
              <v-pagination
                v-model="businessPage"
                :length="businessTotalPages"
                :total-visible="5"
                circle color="#D32F2F"
                @input="fetchBusinesses"
              />
            </div>
          </v-card>
        </v-tab-item>

        <!-- Plans Tab -->
        <v-tab-item>
          <v-card outlined>
            <div class="d-flex justify-space-between align-center pa-4 border-bottom">
              <v-card-title class="text-subtitle-1 font-weight-bold py-0">Subscription Plans</v-card-title>
              <v-btn small color="#D32F2F" dark @click="openPlanDialog()">
                <v-icon left small>mdi-plus</v-icon> Add Plan
              </v-btn>
            </div>
            <div class="table-responsive">
              <v-simple-table>
                <thead>
                  <tr>
                    <th class="text-left">Plan Name</th>
                    <th class="text-left d-none d-sm-table-cell">Code</th>
                    <th class="text-left">Price (KES)</th>
                    <th class="text-left d-none d-sm-table-cell">Limits</th>
                    <th class="text-left d-none d-sm-table-cell">Status</th>
                    <th class="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="p in plans" :key="p.id">
                    <td>
                      <div class="font-weight-bold">{{ p.name }}</div>
                      <div class="text-caption text-grey d-sm-none">{{ p.maxRepairs || '∞' }} repairs</div>
                    </td>
                    <td class="text-caption text-grey d-none d-sm-table-cell">{{ p.code }}</td>
                    <td>{{ formatMoney(p.priceKes) }}</td>
                    <td class="text-caption d-none d-sm-table-cell">
                      {{ p.maxBranches }} Branch · {{ p.maxUsers }} Users · {{ p.maxRepairs || '∞' }} Repairs
                    </td>
                    <td class="d-none d-sm-table-cell">
                      <v-chip x-small :color="p.isActive ? 'success' : 'grey'" dark>
                        {{ p.isActive ? 'ACTIVE' : 'HIDDEN' }}
                      </v-chip>
                    </td>
                    <td class="text-right">
                      <v-btn icon x-small color="primary" class="mr-1" @click="openPlanDialog(p)">
                        <v-icon small>mdi-pencil</v-icon>
                      </v-btn>
                      <v-btn icon x-small color="error" @click="deletePlan(p)">
                        <v-icon small>mdi-delete</v-icon>
                      </v-btn>
                    </td>
                  </tr>
                </tbody>
              </v-simple-table>
            </div>
          </v-card>
        </v-tab-item>

        <!-- Invoices Tab -->
        <v-tab-item>
          <v-card outlined>
            <div class="d-flex flex-wrap align-center pa-4 border-bottom">
              <v-select
                v-model="invoiceStatusFilter"
                :items="[{text:'All', value:null},{text:'Paid', value:'paid'},{text:'Sent', value:'sent'},{text:'Draft', value:'draft'},{text:'Void', value:'void'}]"
                item-text="text" item-value="value"
                label="Status" outlined dense clearable
                color="primary" style="max-width: 180px;"
              />
            </div>
            <div class="table-responsive">
              <v-simple-table>
                <thead>
                  <tr>
                    <th class="text-left">Invoice</th>
                    <th class="text-left d-none d-sm-table-cell">Business</th>
                    <th class="text-left">Amount</th>
                    <th class="text-left">Status</th>
                    <th class="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="inv in invoices" :key="inv.id">
                    <td>
                      <div class="font-weight-bold">{{ inv.invoiceNumber || inv.id.slice(0, 8) }}</div>
                      <div class="text-caption text-grey d-sm-none">{{ inv.business?.name || '—' }}</div>
                      <div class="text-caption text-grey">{{ formatDate(inv.createdAt) }}</div>
                    </td>
                    <td class="d-none d-sm-table-cell">{{ inv.business?.name || '—' }}</td>
                    <td>KES {{ formatMoney(inv.amountKes) }}</td>
                    <td>
                      <v-chip x-small :color="invoiceStatusColor(inv.status)" dark>
                        {{ inv.status.toUpperCase() }}
                      </v-chip>
                    </td>
                    <td class="text-right">
                      <v-btn
                        v-if="inv.status !== 'paid'"
                        x-small color="success"
                        @click="openPayDialog(inv)"
                      >
                        Mark Paid
                      </v-btn>
                      <span v-else class="text-caption text-grey">Verified</span>
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
            </div>
            <div v-if="invoiceTotalPages > 1" class="d-flex justify-center py-4">
              <v-pagination
                v-model="invoicePage"
                :length="invoiceTotalPages"
                :total-visible="5"
                circle color="#D32F2F"
                @input="fetchInvoices"
              />
            </div>
          </v-card>
        </v-tab-item>

        <!-- Payments Tab -->
        <v-tab-item>
          <v-card outlined>
            <v-row class="ma-0 pa-4" style="border-bottom: 1px solid #e2e8f0; background: #f8fafc;">
              <v-col cols="6" md="4" class="py-2">
                <div class="text-caption text-grey text-uppercase font-weight-bold">Total Collected</div>
                <div class="text-h6 font-weight-black text-success">
                  KES {{ formatMoney(paymentSummary.paidTotal) }}
                </div>
                <div class="text-caption text-grey">{{ paymentSummary.paidCount }} paid</div>
              </v-col>
              <v-col cols="6" md="4" class="py-2">
                <div class="text-caption text-grey text-uppercase font-weight-bold">Pending</div>
                <div class="text-h6 font-weight-black" style="color: #f59e0b;">
                  KES {{ formatMoney(paymentSummary.pendingTotal) }}
                </div>
                <div class="text-caption text-grey">{{ paymentSummary.pendingCount }} awaiting</div>
              </v-col>
              <v-col cols="12" md="4" class="py-2 d-none d-md-flex align-center justify-end">
                <v-btn small text color="primary" to="/admin/payments">
                  <v-icon left small>mdi-open-in-new</v-icon> Full view
                </v-btn>
              </v-col>
            </v-row>

            <div class="d-flex flex-wrap align-center pa-4 border-bottom">
              <v-text-field
                v-model.trim="paymentSearch"
                prepend-inner-icon="mdi-magnify"
                label="Invoice # or M-Pesa ref..."
                outlined dense clearable color="primary"
                class="mr-2 mb-2 mb-sm-0 flex-grow-1" style="max-width: 280px;"
                @keyup.enter="paymentPage = 1; fetchPayments()"
              />
              <v-select
                v-model="paymentStatusFilter"
                :items="[{text:'All', value:null},{text:'Pending', value:'pending'},{text:'Paid', value:'paid'},{text:'Failed', value:'failed'}]"
                item-text="text" item-value="value"
                label="Status" outlined dense clearable color="primary"
                style="max-width: 160px;"
              />
            </div>

            <div class="table-responsive">
              <v-simple-table>
                <thead>
                  <tr>
                    <th class="text-left d-none d-sm-table-cell">Date</th>
                    <th class="text-left">Business</th>
                    <th class="text-left d-none d-sm-table-cell">Plan</th>
                    <th class="text-left d-none d-sm-table-cell">Invoice #</th>
                    <th class="text-left">Amount</th>
                    <th class="text-left d-none d-sm-table-cell">Reference</th>
                    <th class="text-left">Status</th>
                    <th class="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="p in payments" :key="p.id">
                    <td class="text-caption d-none d-sm-table-cell">{{ formatDate(p.createdAt) }}</td>
                    <td>
                      <div class="font-weight-bold">{{ p.businessName }}</div>
                      <div class="text-caption text-grey d-sm-none">{{ formatDate(p.createdAt) }} · {{ p.invoiceNumber }}</div>
                      <v-chip x-small :color="statusColor(p.businessStatus)" dark class="mt-1">
                        {{ p.businessStatus }}
                      </v-chip>
                    </td>
                    <td class="d-none d-sm-table-cell">{{ p.planName }}</td>
                    <td class="text-caption d-none d-sm-table-cell">{{ p.invoiceNumber }}</td>
                    <td class="font-weight-bold">KES {{ formatMoney(p.amountKes) }}</td>
                    <td class="text-caption d-none d-sm-table-cell">{{ p.reference || p.externalId || '—' }}</td>
                    <td>
                      <v-chip x-small :color="paymentStatusColor(p.status)" dark>
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
                  <tr v-if="payments.length === 0 && !loadingPayments">
                    <td colspan="8" class="text-center py-8 text-grey">
                      <v-icon size="48" color="grey lighten-2" class="mb-2">mdi-cash-multiple</v-icon>
                      <div>No payments found.</div>
                    </td>
                  </tr>
                </tbody>
              </v-simple-table>
            </div>

            <div v-if="paymentTotalPages > 1" class="d-flex justify-center py-4">
              <v-pagination
                v-model="paymentPage"
                :length="paymentTotalPages"
                :total-visible="5"
                circle color="#D32F2F"
                @input="fetchPayments"
              />
            </div>
          </v-card>
        </v-tab-item>
      </v-tabs-items>

      <!-- Manage Tenant Dialog -->
      <v-dialog v-model="drawer" max-width="500px" @click:outside="drawer = false">
        <v-card class="dialog-card" v-if="activeTenant">
          <div class="dialog-header">
            <div>
              <h3>{{ activeTenant.name }}</h3>
              <p class="text-caption text-grey mb-0">{{ activeTenant.email || activeTenant.users?.[0]?.email }}</p>
            </div>
            <v-btn icon small color="grey" @click="drawer = false"><v-icon>mdi-close</v-icon></v-btn>
          </div>
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
                    <div v-if="inv.reference" class="text-caption mt-1">
                      M-Pesa Code: <strong>{{ inv.reference }}</strong>
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

      <!-- Plan Edit Dialog -->
      <v-dialog v-model="planDialog" max-width="500px" persistent>
        <v-card class="dialog-card">
          <div class="dialog-header">
            <h3>{{ editingPlan ? 'Edit Plan' : 'Create Plan' }}</h3>
            <v-btn icon small color="grey" @click="planDialog = false"><v-icon>mdi-close</v-icon></v-btn>
          </div>
          <v-card-text class="pt-4">
            <v-alert v-if="planError" type="error" dense outlined class="mb-4 text-left">{{ planError }}</v-alert>
            <v-text-field
              v-model.trim="planForm.name" label="Plan Name (e.g. Pro)"
              outlined dense color="primary"
              :error-messages="planFieldErrors.name"
            />
            <v-text-field
              v-model.trim="planForm.code" label="Plan Code (e.g. pro)"
              outlined dense color="primary"
              :disabled="!!editingPlan"
              :error-messages="planFieldErrors.code"
            />
            <v-row dense>
              <v-col cols="6">
                <v-text-field v-model.number="planForm.priceKes" type="number" label="Price (KES)" outlined dense color="primary" :error-messages="planFieldErrors.priceKes" />
              </v-col>
              <v-col cols="6">
                <v-text-field v-model.number="planForm.maxBranches" type="number" label="Max Branches" outlined dense color="primary" :error-messages="planFieldErrors.maxBranches" />
              </v-col>
              <v-col cols="6">
                <v-text-field v-model.number="planForm.maxUsers" type="number" label="Max Users" outlined dense color="primary" :error-messages="planFieldErrors.maxUsers" />
              </v-col>
              <v-col cols="6">
                <v-text-field v-model.number="planForm.maxRepairs" type="number" label="Max Repairs (empty = ∞)" outlined dense color="primary" :error-messages="planFieldErrors.maxRepairs" />
              </v-col>
            </v-row>
            <v-switch v-model="planForm.isActive" label="Visible to merchants" color="success" />
          </v-card-text>
          <v-card-actions class="px-4 pb-4">
            <v-spacer />
            <v-btn text :disabled="savingPlan" @click="planDialog = false">Cancel</v-btn>
            <v-btn class="btn-primary" :loading="savingPlan" :disabled="savingPlan" @click="savePlan">
              Save Plan
            </v-btn>
          </v-card-actions>
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

      <!-- Audit Log Dialog -->
      <v-dialog v-model="showAudit" max-width="720px">
        <v-card class="dialog-card">
          <div class="dialog-header">
            <h3>Audit Log</h3>
            <v-btn icon small color="grey" @click="showAudit = false"><v-icon>mdi-close</v-icon></v-btn>
          </div>
          <v-card-text class="pt-4" style="max-height: 60vh; overflow-y: auto;">
            <div v-if="auditLoading" class="text-center py-6">
              <v-progress-circular indeterminate color="primary" />
            </div>
            <v-list dense v-else-if="auditItems.length">
              <v-list-item v-for="a in auditItems" :key="a.id">
                <v-list-item-content>
                  <v-list-item-title>
                    <strong>{{ a.action }}</strong>
                    <span class="text-caption text-grey ml-2">{{ formatDate(a.createdAt) }}</span>
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-caption">
                    {{ a.targetType }} {{ a.targetId ? '· ' + a.targetId.slice(0, 8) : '' }}
                    <span v-if="a.ip" class="ml-2">· {{ a.ip }}</span>
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
            <div v-else class="text-center py-6 text-grey">No audit entries yet.</div>
          </v-card-text>
        </v-card>
      </v-dialog>
    </template>
  </div>
</template>

<script>
export default {
  layout: 'admin',

  data() {
    return {
      token: null,
      email: '',
      password: '',
      loading: false,
      loginError: '',
      pageError: '',

      stats: {
        totalBusinesses: 0,
        totalRepairs: 0,
        totalMerchantRevenue: 0,
        platformMRR: 0,
        totalInvoiced: 0,
      },

      businesses: [],
      businessSearch: '',
      businessStatusFilter: null,
      businessPage: 1,
      businessPageSize: 20,
      businessTotal: 0,
      loadingBusinesses: false,
      searchTimer: null,

      plans: [],

      invoices: [],
      invoiceStatusFilter: null,
      invoicePage: 1,
      invoicePageSize: 20,
      invoiceTotal: 0,
      invoiceTotalPages: 1,

      payments: [],
      paymentSearch: '',
      paymentStatusFilter: null,
      paymentPage: 1,
      paymentPageSize: 20,
      paymentTotal: 0,
      paymentTotalPages: 1,
      paymentSummary: { paidCount: 0, paidTotal: 0, pendingCount: 0, pendingTotal: 0 },
      loadingPayments: false,
      searchTimerPayments: null,

      activeTab: 0,

      drawer: false,
      activeTenant: null,
      impersonating: false,
      extendDays: 7,
      extending: false,

      planDialog: false,
      editingPlan: null,
      savingPlan: false,
      planError: '',
      planFieldErrors: {},
      planForm: {
        name: '', code: '', priceKes: 0,
        maxBranches: 1, maxUsers: 1, maxRepairs: null, isActive: true,
      },

      payDialog: false,
      payingInvoice: null,
      paying: false,
      payFieldErrors: {},
      payForm: { reference: '' },

      showAudit: false,
      auditItems: [],
      auditLoading: false,
    }
  },

  computed: {
    businessTotalPages() {
      return Math.max(1, Math.ceil(this.businessTotal / this.businessPageSize))
    },
    invoiceTotalPages() {
      return Math.max(1, Math.ceil(this.invoiceTotal / this.invoicePageSize))
    },
    paymentTotalPages() {
      return Math.max(1, Math.ceil(this.paymentTotal / this.paymentPageSize))
    },
  },

  watch: {
    businessSearch() {
      clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => {
        this.businessPage = 1
        this.fetchBusinesses()
      }, 300)
    },
    businessStatusFilter() {
      this.businessPage = 1
      this.fetchBusinesses()
    },
    invoiceStatusFilter() {
      this.invoicePage = 1
      this.fetchInvoices()
    },
    paymentSearch() {
      clearTimeout(this.searchTimerPayments)
      this.searchTimerPayments = setTimeout(() => {
        this.paymentPage = 1
        this.fetchPayments()
      }, 300)
    },
    paymentStatusFilter() {
      this.paymentPage = 1
      this.fetchPayments()
    },
    showAudit(val) {
      if (val && this.auditItems.length === 0) this.fetchAudit()
    },
  },

  mounted() {
    this.token = localStorage.getItem('adminToken')
    if (this.token) this.fetchAll()
  },

  methods: {
    getHeaders() {
      return { headers: { Authorization: `Bearer ${this.token}` } }
    },

    async login() {
      this.loginError = ''
      if (!this.email || !this.password) {
        this.loginError = 'Email and password are required.'
        return
      }
      this.loading = true
      try {
        const res = await this.$axios.$post('/api/system/login', {
          email: this.email,
          password: this.password,
        })
        this.token = res.token
        localStorage.setItem('adminToken', res.token)
        this.password = ''
        await this.fetchAll()
      } catch (e) {
        const status = e && e.response && e.response.status
        if (status === 429) {
          this.loginError = 'Too many attempts. Try again in 15 minutes.'
        } else if (status === 401) {
          this.loginError = 'Invalid admin credentials.'
        } else {
          this.loginError = 'Cannot reach server. Check your connection.'
        }
      } finally {
        this.loading = false
      }
    },

    logout() {
      localStorage.removeItem('adminToken')
      this.token = null
      this.businesses = []
      this.plans = []
      this.invoices = []
      this.payments = []
      this.paymentSummary = { paidCount: 0, paidTotal: 0, pendingCount: 0, pendingTotal: 0 }
      this.activeTenant = null
      this.drawer = false
    },

    async fetchAll() {
      await Promise.all([
        this.fetchMetrics(),
        this.fetchBusinesses(),
        this.fetchPlans(),
        this.fetchInvoices(),
        this.fetchPayments(),
      ])
    },

    async fetchMetrics() {
      try {
        const res = await this.$axios.$get('/api/system/metrics', this.getHeaders())
        this.stats = res.stats
      } catch (e) {
        if (e && e.response && e.response.status === 401) return this.logout()
        this.pageError = 'Failed to load platform metrics.'
      }
    },

    async fetchBusinesses() {
      this.loadingBusinesses = true
      try {
        const params = {
          page: this.businessPage,
          pageSize: this.businessPageSize,
        }
        if (this.businessSearch) params.q = this.businessSearch
        if (this.businessStatusFilter) params.status = this.businessStatusFilter
        const res = await this.$axios.$get('/api/system/businesses', {
          ...this.getHeaders(),
          params,
        })
        this.businesses = res.items || []
        this.businessTotal = (res.pagination && res.pagination.total) || 0
      } catch (e) {
        if (e && e.response && e.response.status === 401) return this.logout()
        this.pageError = 'Failed to load businesses.'
        this.businesses = []
        this.businessTotal = 0
      } finally {
        this.loadingBusinesses = false
      }
    },

    async fetchPlans() {
      try {
        this.plans = await this.$axios.$get('/api/system/plans', this.getHeaders())
      } catch (e) {
        if (e && e.response && e.response.status === 401) return this.logout()
        this.pageError = 'Failed to load plans.'
      }
    },

    async fetchInvoices() {
      try {
        const params = { page: this.invoicePage, pageSize: this.invoicePageSize }
        if (this.invoiceStatusFilter) params.status = this.invoiceStatusFilter
        const res = await this.$axios.$get('/api/system/invoices', {
          ...this.getHeaders(),
          params,
        })
        this.invoices = res.items || []
        this.invoiceTotal = (res.pagination && res.pagination.total) || 0
        this.invoiceTotalPages = (res.pagination && res.pagination.totalPages) || 1
      } catch (e) {
        if (e && e.response && e.response.status === 401) return this.logout()
        this.pageError = 'Failed to load invoices.'
      }
    },

    async fetchPayments() {
      this.loadingPayments = true
      try {
        const params = { page: this.paymentPage, pageSize: this.paymentPageSize }
        if (this.paymentSearch) params.q = this.paymentSearch
        if (this.paymentStatusFilter) params.status = this.paymentStatusFilter
        const res = await this.$axios.$get('/api/system/payments', {
          ...this.getHeaders(),
          params,
        })
        this.payments = res.items || []
        this.paymentSummary = res.summary || this.paymentSummary
        this.paymentTotal = (res.pagination && res.pagination.total) || 0
        this.paymentTotalPages = (res.pagination && res.pagination.totalPages) || 1
      } catch (e) {
        if (e && e.response && e.response.status === 401) return this.logout()
        this.pageError = 'Failed to load payments.'
      } finally {
        this.loadingPayments = false
      }
    },

    async viewTenant(b) {
      this.pageError = ''
      try {
        this.activeTenant = await this.$axios.$get(
          `/api/system/business/${b.id}`,
          this.getHeaders()
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
          this.getHeaders()
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
          this.getHeaders()
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
          this.getHeaders()
        )
        this.drawer = false
        await this.fetchAll()
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
          this.getHeaders()
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
      this.payForm = { reference: inv.reference || '' }
      this.payFieldErrors = {}
      this.payDialog = true
    },

    async confirmMarkPaid() {
      if (!this.payingInvoice) return
      this.paying = true
      this.payFieldErrors = {}
      this.pageError = ''
      try {
        await this.$axios.$patch(
          `/api/system/invoice/${this.payingInvoice.id}/pay`,
          { reference: this.payForm.reference },
          this.getHeaders()
        )
        this.payDialog = false
        await Promise.all([
          this.fetchInvoices(),
          this.fetchPayments(),
          this.fetchMetrics(),
        ])
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

    async failInvoice(p) {
      if (!confirm(`Mark invoice ${p.invoiceNumber} as failed? This does not affect the subscription.`)) return
      try {
        await this.$axios.$patch(
          `/api/system/invoice/${p.id}/fail`,
          { reason: 'Admin marked as failed' },
          this.getHeaders()
        )
        await this.fetchPayments()
      } catch (e) {
        const err = e && e.response && e.response.data && e.response.data.error
        this.pageError = typeof err === 'string' ? err : 'Failed to update invoice.'
      }
    },

    openPlanDialog(plan) {
      this.editingPlan = plan || null
      this.planError = ''
      this.planFieldErrors = {}
      if (plan) {
        this.planForm = {
          name: plan.name,
          code: plan.code,
          priceKes: plan.priceKes,
          maxBranches: plan.maxBranches,
          maxUsers: plan.maxUsers,
          maxRepairs: plan.maxRepairs,
          isActive: plan.isActive,
        }
      } else {
        this.planForm = {
          name: '', code: '', priceKes: 1500,
          maxBranches: 1, maxUsers: 2, maxRepairs: null, isActive: true,
        }
      }
      this.planDialog = true
    },

    async savePlan() {
      this.planError = ''
      this.planFieldErrors = {}
      if (!this.planForm.name || !this.planForm.code) {
        this.planError = 'Name and Code are required.'
        return
      }
      this.savingPlan = true
      try {
        if (this.editingPlan) {
          await this.$axios.$patch(
            `/api/system/plans/${this.editingPlan.id}`,
            this.planForm,
            this.getHeaders()
          )
        } else {
          await this.$axios.$post('/api/system/plans', this.planForm, this.getHeaders())
        }
        this.planDialog = false
        await this.fetchPlans()
      } catch (e) {
        const err = e && e.response && e.response.data && e.response.data.error
        if (err && err.fieldErrors) {
          this.planFieldErrors = err.fieldErrors
          this.planError = 'Please fix the highlighted fields.'
        } else if (typeof err === 'string') {
          this.planError = err
        } else {
          this.planError = 'Failed to save plan.'
        }
      } finally {
        this.savingPlan = false
      }
    },

    async deletePlan(plan) {
      if (!confirm(`Delete plan "${plan.name}"? This cannot be undone.`)) return
      try {
        await this.$axios.$delete(`/api/system/plans/${plan.id}`, this.getHeaders())
        await this.fetchPlans()
      } catch (e) {
        const err = e && e.response && e.response.data && e.response.data.error
        this.pageError = typeof err === 'string' ? err : 'Failed to delete plan.'
      }
    },

    async fetchAudit() {
      this.auditLoading = true
      try {
        const res = await this.$axios.$get('/api/system/audit', {
          ...this.getHeaders(),
          params: { pageSize: 50 },
        })
        this.auditItems = res.items || []
      } catch (e) {
        this.auditItems = []
      } finally {
        this.auditLoading = false
      }
    },

    statusColor(status) {
      if (status === 'SUSPENDED') return 'error'
      if (status === 'CANCELLED') return 'grey'
      if (status === 'TRIAL') return 'warning'
      return 'success'
    },
    invoiceStatusColor(status) {
      if (status === 'paid') return 'success'
      if (status === 'void') return 'grey'
      if (status === 'draft') return 'grey'
      return 'warning'
    },
    paymentStatusColor(status) {
      if (status === 'paid') return 'success'
      if (status === 'failed') return 'error'
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
.admin-page { padding: 24px; font-family: 'Inter', sans-serif; }

/* Login overlay covers the default layout until authenticated */
.login-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card { width: 100%; max-width: 400px; border-radius: 12px; padding: 20px; }

.header-section {
  display: flex; justify-content: space-between; align-items: flex-end;
  margin-bottom: 24px; gap: 16px; flex-wrap: wrap;
}
.page-title { font-size: 1.75rem; font-weight: 800; margin: 0; color: #0f172a; }
.page-subtitle { color: #64748b; margin: 0; font-size: 0.95rem; }

/* Stat Cards Grid */
.stat-card { padding: 16px 20px; border-radius: 8px; height: 100%; transition: transform 0.2s; }
.stat-card:hover { transform: translateY(-2px); }
.stat-label {
  font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
  color: #64748b; letter-spacing: 0.5px;
}
.stat-value {
  font-size: 1.6rem; font-weight: 900; color: #0f172a;
  margin-top: 4px; letter-spacing: -0.5px; white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis;
}
.stat-caption { font-size: 0.75rem; color: #94a3b8; margin-top: 4px; font-weight: 500; }
.text-success { color: #10b981 !important; }
.text-primary { color: #3b82f6 !important; }

/* Dialog styling */
.dialog-card { border-radius: 16px !important; }
.dialog-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1.25rem 1.5rem; border-bottom: 1px solid #e2e8f0; background: #f8fafc;
}
.dialog-header h3 { margin: 0; font-weight: 800; font-size: 1.2rem; color: #0f172a; }
.btn-primary {
  background-color: #D32F2F !important; color: white !important;
  font-weight: 600 !important; text-transform: none !important;
  border-radius: 8px !important; letter-spacing: 0 !important;
}
.btn-primary:hover { background-color: #B71C1C !important; }

/* Responsive Tables */
.table-responsive {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.responsive-table >>> th {
  font-size: 0.75rem !important;
  text-transform: uppercase;
  font-weight: 700 !important;
  color: #64748b !important;
  background-color: #f8fafc !important;
  white-space: nowrap;
}
.responsive-table >>> td {
  font-size: 0.85rem !important;
  vertical-align: middle !important;
}

/* Mobile Adjustments */
@media (max-width: 600px) {
  .admin-page { padding: 12px; }
  
  /* Ensure tables don't squeeze too much */
  .responsive-table >>> table {
    min-width: 600px;
  }

  .stat-value { font-size: 1.3rem; }
  .stat-card { padding: 12px; }
  .stat-label { font-size: 0.65rem; }
  
  /* Scrollable tabs for mobile */
  .v-tabs-bar {
    overflow-x: auto !important;
  }
}
</style>