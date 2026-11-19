<template>
  <div>
    <v-alert
      v-if="pageError" type="error" dense outlined class="mb-4 text-left"
      dismissible @input="pageError = ''"
    >
      {{ pageError }}
    </v-alert>

    <v-card outlined>
      <div class="d-flex justify-space-between align-center pa-4 border-bottom">
        <v-card-title class="text-subtitle-1 font-weight-bold py-0">Subscription Plans</v-card-title>
        <v-btn small color="#D32F2F" dark @click="openPlanDialog()">
          <v-icon left small>mdi-plus</v-icon> Add Plan
        </v-btn>
      </div>
      <v-simple-table>
        <thead>
          <tr>
            <th class="text-left">Plan Name</th>
            <th class="text-left">Code</th>
            <th class="text-left">Price (KES)</th>
            <th class="text-left">Limits</th>
            <th class="text-left">Status</th>
            <th class="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in plans" :key="p.id">
            <td class="font-weight-bold">{{ p.name }}</td>
            <td class="text-caption text-grey">{{ p.code }}</td>
            <td>{{ formatMoney(p.priceKes) }}</td>
            <td class="text-caption">
              {{ p.maxBranches }} Branch · {{ p.maxUsers }} Users · {{ p.maxRepairs || '∞' }} Repairs
            </td>
            <td>
              <v-chip x-small :color="p.isActive ? 'success' : 'grey'" dark>
                {{ p.isActive ? 'ACTIVE' : 'HIDDEN' }}
              </v-chip>
            </td>
            <td class="text-right">
              <v-btn icon x-small color="primary" class="mr-2" @click="openPlanDialog(p)">
                <v-icon small>mdi-pencil</v-icon>
              </v-btn>
              <v-btn icon x-small color="error" @click="deletePlan(p)">
                <v-icon small>mdi-delete</v-icon>
              </v-btn>
            </td>
          </tr>
          <tr v-if="plans.length === 0">
            <td colspan="6" class="text-center py-8 text-grey">
              <v-icon size="48" color="grey lighten-2" class="mb-2">mdi-tag-off</v-icon>
              <div>No plans yet — create your first one.</div>
            </td>
          </tr>
        </tbody>
      </v-simple-table>
    </v-card>

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
  </div>
</template>

<script>
export default {
  layout: 'admin',
  middleware: 'admin-auth',
  data() {
    return {
      plans: [],
      pageError: '',
      planDialog: false,
      editingPlan: null,
      savingPlan: false,
      planError: '',
      planFieldErrors: {},
      planForm: {
        name: '', code: '', priceKes: 0,
        maxBranches: 1, maxUsers: 1, maxRepairs: null, isActive: true,
      },
    }
  },
  mounted() {
    this.fetchPlans()
  },
  methods: {
    headers() {
      return { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } }
    },
    async fetchPlans() {
      try {
        this.plans = await this.$axios.$get('/api/system/plans', this.headers())
      } catch (e) {
        if (e && e.response && e.response.status === 401) return this.$router.push('/admin/login')
        this.pageError = 'Failed to load plans.'
      }
    },
    openPlanDialog(plan) {
      this.editingPlan = plan || null
      this.planError = ''
      this.planFieldErrors = {}
      if (plan) {
        this.planForm = {
          name: plan.name, code: plan.code, priceKes: plan.priceKes,
          maxBranches: plan.maxBranches, maxUsers: plan.maxUsers,
          maxRepairs: plan.maxRepairs, isActive: plan.isActive,
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
            this.headers()
          )
        } else {
          await this.$axios.$post('/api/system/plans', this.planForm, this.headers())
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
        await this.$axios.$delete(`/api/system/plans/${plan.id}`, this.headers())
        await this.fetchPlans()
      } catch (e) {
        const err = e && e.response && e.response.data && e.response.data.error
        this.pageError = typeof err === 'string' ? err : 'Failed to delete plan.'
      }
    },
    formatMoney(val) {
      return new Intl.NumberFormat('en-KE').format(val || 0)
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