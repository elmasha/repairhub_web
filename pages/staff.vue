<template>
  <div class="staff-page">
    <!-- Header Section -->
    <div class="header-section">
      <div>
        <h1 class="page-title">Staff Management</h1>
        <p class="page-subtitle">Add technicians and cashiers to your shop.</p>
      </div>
      <v-btn class="btn-primary" @click="openCreateDialog">
        <v-icon left small>mdi-plus</v-icon> Add Staff
      </v-btn>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-10">
      <v-progress-circular indeterminate color="primary" size="50"></v-progress-circular>
    </div>

    <!-- Staff Table -->
    <v-card v-else class="custom-table-card" elevation="0">
      <v-simple-table class="premium-table">
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-left">Name</th>
              <th class="text-left">Email</th>
              <th class="text-left">Role</th>
              <th class="text-left">Joined</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="staff in staffList" :key="staff.id" class="table-row">
              <td>
                <div class="d-flex align-center">
                  <v-avatar color="#FEF2F2" size="32" class="mr-3">
                    <span class="primary--text font-weight-bold" style="color: #D32F2F;">{{ getInitials(staff.name) }}</span>
                  </v-avatar>
                  <span class="font-weight-bold text-black">{{ staff.name }}</span>
                </div>
              </td>
              <td class="text-grey-darken-1">{{ staff.email }}</td>
              <td>
                <v-chip 
                  small 
                  :color="getRoleColor(staff.role)" 
                  text-color="white" 
                  class="font-weight-bold"
                >
                  {{ staff.role }}
                </v-chip>
              </td>
              <td class="text-grey-darken-1">{{ formatDate(staff.createdAt) }}</td>
            </tr>
            <tr v-if="staffList.length === 0">
              <td colspan="4" class="text-center py-8 text-grey">
                <v-icon size="48" color="grey lighten-2" class="mb-2">mdi-account-group</v-icon>
                <div>No staff members found. Add one to get started.</div>
              </td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-card>

    <!-- Add Staff Dialog -->
    <v-dialog v-model="dialog" max-width="450px">
      <v-card class="dialog-card">
        <div class="dialog-header">
          <h3>Add New Staff</h3>
          <v-btn icon small color="grey" @click="dialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </div>
        
        <v-card-text class="dialog-body pt-4">
          <v-alert v-if="error" type="error" dense class="mb-4 text-left">{{ error }}</v-alert>
          
          <v-text-field 
            v-model="form.name" 
            label="Full Name" 
            outlined dense color="primary"
            prepend-inner-icon="mdi-account"
          ></v-text-field>
          
          <v-text-field 
            v-model="form.email" 
            label="Email Address" 
            outlined dense color="primary"
            prepend-inner-icon="mdi-email"
          ></v-text-field>
          
          <v-text-field 
            v-model="form.password" 
            label="Password" 
            type="password"
            outlined dense color="primary"
            prepend-inner-icon="mdi-lock"
            hint="At least 8 characters"
          ></v-text-field>
          
          <v-select 
            v-model="form.role" 
            :items="['ADMIN', 'TECHNICIAN', 'CASHIER']" 
            label="Role" 
            outlined dense color="primary"
            prepend-inner-icon="mdi-badge-account"
          ></v-select>
        </v-card-text>
        
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn text @click="dialog = false">Cancel</v-btn>
          <v-btn class="btn-primary" :loading="saving" @click="saveStaff">
            Save Staff
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
          <v-icon size="64" color="#D32F2F" class="mb-4">mdi-account-alert</v-icon>
          <p class="text-body-1 font-weight-medium mb-2">{{ upgradeMessage }}</p>
          <p class="text-caption text-grey">Upgrade your plan to add more staff members.</p>
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
  </div>
</template>

<script>
export default {
  layout: 'default',
  middleware: ['authenticated', 'role'], // <--- Add 'role' here
  
  data() {
    return {
      showUpgradeDialog: false,
      upgradeMessage: '',
      dialog: false,
      loading: true,
      saving: false,
      error: '',
      staffList: [],
      form: {
        name: '',
        email: '',
        password: '',
        role: 'TECHNICIAN'
      }
    }
  },

  async mounted() {
    await this.fetchStaff()
  },

  methods: {
    async fetchStaff() {
      this.loading = true
      try {
        this.staffList = await this.$axios.$get('/api/auth/staff')
      } catch (error) {
        console.error('Failed to load staff:', error)
        if (error.response?.status === 403) {
          this.error = 'You do not have permission to view staff.'
        }
      } finally {
        this.loading = false
      }
    },

    openCreateDialog() {
      this.form = { name: '', email: '', password: '', role: 'TECHNICIAN' }
      this.error = ''
      this.dialog = true
    },

        async saveStaff() {
      if (!this.form.name || !this.form.email || !this.form.password) {
        this.error = 'Name, Email, and Password are required.'
        return
      }

      this.saving = true
      this.error = ''
      
      try {
        await this.$axios.$post('/api/auth/staff', this.form)
        this.dialog = false
        await this.fetchStaff()
      } catch (err) {
        // CATCH THE PLAN LIMIT ERROR HERE
        const status = err.response?.status
        const errorData = err.response?.data?.error

        if (status === 403 && typeof errorData === 'string' && errorData.includes('Plan limit')) {
          this.dialog = false // Close the add staff dialog
          this.upgradeMessage = errorData
          this.showUpgradeDialog = true
        } else {
          this.error = errorData || 'Failed to save staff.'
        }
      } finally {
        this.saving = false
      }
    },

    getRoleColor(role) {
      return {
        'OWNER': 'error',
        'ADMIN': 'primary',
        'MANAGER': 'info',
        'TECHNICIAN': 'success',
        'CASHIER': 'warning'
      }[role] || 'grey'
    },

    getInitials(name) {
      if (!name) return '?'
      const parts = name.split(' ')
      if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase()
      return name.substring(0, 2).toUpperCase()
    },

    formatDate(dateString) {
      if (!dateString) return '-'
      return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    }
  }
}
</script>

<style scoped>
.staff-page { padding: 24px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
.header-section { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; }
.page-title { font-size: 1.75rem; font-weight: 800; margin: 0; letter-spacing: -0.5px; color: #121212; }
.page-subtitle { color: #64748b; margin: 0; font-size: 0.95rem; }

.btn-primary {
  background-color: #D32F2F !important;
  color: white !important;
  font-weight: 600 !important;
  text-transform: none !important;
  border-radius: 8px !important;
  letter-spacing: 0 !important;
  transition: all 0.2s ease;
}
.btn-primary:hover { background-color: #B71C1C !important; transform: translateY(-1px); }

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

.dialog-card { border-radius: 16px !important; overflow: hidden; }
.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}
.dialog-header h3 { margin: 0; font-weight: 800; font-size: 1.2rem; color: #121212; }
.dialog-body { padding: 1.5rem !important; }
</style>