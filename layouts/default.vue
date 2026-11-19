<template>
  <v-app>
    <!-- Sidebar -->
    <v-navigation-drawer 
      v-model="drawer" 
      app 
      width="250" 
      color="#121212" 
      dark
    >
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title class="text-h6 font-weight-bold">
            <span style="color: #D32F2F;">Repair</span>Hub POS
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-divider class="border-opacity-25"></v-divider>

      <v-list dense nav class="mt-4">
        <!-- DASHBOARD -->
        <v-list-item to="/dashboard" exact active-class="bg-red-800">
          <v-list-item-icon><v-icon>mdi-view-dashboard</v-icon></v-list-item-icon>
          <v-list-item-content><v-list-item-title>Dashboard</v-list-item-title></v-list-item-content>
        </v-list-item>

        <!-- LOCKABLE LINKS -->
        <v-list-item to="/repairs" active-class="bg-red-800" :disabled="billingDue" :style="billingDue ? 'opacity: 0.5; pointer-events: none;' : ''">
          <v-list-item-icon><v-icon>mdi-tools</v-icon></v-list-item-icon>
          <v-list-item-content><v-list-item-title>Repair Desk</v-list-item-title></v-list-item-content>
        </v-list-item>
        
        <v-list-item to="/inventory" active-class="bg-red-800" :disabled="billingDue" :style="billingDue ? 'opacity: 0.5; pointer-events: none;' : ''">
          <v-list-item-icon><v-icon>mdi-package-variant-closed</v-icon></v-list-item-icon>
          <v-list-item-content><v-list-item-title>Inventory</v-list-item-title></v-list-item-content>
        </v-list-item>
        
        <v-list-item to="/pos" active-class="bg-red-800" :disabled="billingDue" :style="billingDue ? 'opacity: 0.5; pointer-events: none;' : ''">
          <v-list-item-icon><v-icon>mdi-cash-register</v-icon></v-list-item-icon>
          <v-list-item-content><v-list-item-title>POS Checkout</v-list-item-title></v-list-item-content>
        </v-list-item>

        <v-list-item to="/customers" active-class="bg-red-800" :disabled="billingDue" :style="billingDue ? 'opacity: 0.5; pointer-events: none;' : ''">
          <v-list-item-icon><v-icon>mdi-account-group</v-icon></v-list-item-icon>
          <v-list-item-content><v-list-item-title>Customers</v-list-item-title></v-list-item-content>
        </v-list-item>

        <v-list-item to="/payments" active-class="bg-red-800" :disabled="billingDue" :style="billingDue ? 'opacity: 0.5; pointer-events: none;' : ''">
          <v-list-item-icon><v-icon>mdi-receipt</v-icon></v-list-item-icon>
          <v-list-item-content><v-list-item-title>Payments</v-list-item-title></v-list-item-content>
        </v-list-item>

        <!-- STAFF LINK -->
        <v-list-item 
          v-if="['OWNER', 'ADMIN'].includes($store.state.user?.role)" 
          to="/staff" 
          active-class="bg-red-800"
          :disabled="billingDue"
          :style="billingDue ? 'opacity: 0.5; pointer-events: none;' : ''"
        >
          <v-list-item-icon><v-icon>mdi-account-cog</v-icon></v-list-item-icon>
          <v-list-item-content><v-list-item-title>Staff</v-list-item-title></v-list-item-content>
        </v-list-item>

        <!-- BILLING -->
        <v-list-item to="/billing" active-class="bg-red-800">
          <v-list-item-icon><v-icon>mdi-credit-card</v-icon></v-list-item-icon>
          <v-list-item-content><v-list-item-title>Billing</v-list-item-title></v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Topbar -->
    <v-app-bar app color="#121212" elevation="2" dark>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" class="hidden-md-and-up"></v-app-bar-nav-icon>
      
      <!-- Brand Name visible on mobile only -->
      <v-toolbar-title class="hidden-md-and-up font-weight-bold text-subtitle-1 ml-2">
        <span style="color: #D32F2F;">Repair</span>Hub POS
      </v-toolbar-title>

      <v-spacer></v-spacer>
      
      <!-- 🔥 Logout Icon Only -->
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn 
            icon 
            color="white" 
            v-bind="attrs" 
            v-on="on" 
            @click="logout"
          >
            <v-icon>mdi-logout</v-icon>
          </v-btn>
        </template>
        <span>Logout</span>
      </v-tooltip>
    </v-app-bar>

    <!-- BILLING WARNING BANNER -->
    <v-system-bar 
      v-if="billingDue" 
      color="#D32F2F" 
      dark 
      height="48" 
      app
    >
      <v-icon small class="mr-2">mdi-alert-circle</v-icon>
      <span class="font-weight-bold text-body-2 mr-4">
        {{ billingMessage }}
      </span>
      <v-btn 
        x-small 
        color="white" 
        class="text-none font-weight-bold red--text" 
        to="/billing"
      >
        Update Billing
      </v-btn>
    </v-system-bar>

    <!-- Main Content -->
    <v-main style="background-color: #F5F5F5; overflow-y: auto !important;">
      <v-container fluid class="pa-3 pa-md-6">
        <nuxt />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'DefaultLayout',
  
  data() {
    return {
      drawer: null, 
      billingDue: false,
      billingMessage: 'Your account is suspended due to unpaid billing.',
    }
  },

  created() {
    this.drawer = this.$vuetify.breakpoint.mdAndUp
    this.checkStoreStatus()
  },

  mounted() {
    this.checkLiveApiStatus()
  },

  methods: {
    checkStoreStatus() {
      const bizStatus = (this.$store.state.business?.status || '').toUpperCase()
      const subStatus = (this.$store.state.subscription?.status || '').toUpperCase()
      const trialEndsAt = this.$store.state.subscription?.trialEndsAt
      const periodEnd = this.$store.state.subscription?.currentPeriodEnd
      const now = new Date()

      if (['SUSPENDED', 'CANCELLED'].includes(bizStatus)) {
        this.billingDue = true
        this.billingMessage = `Your business account is ${bizStatus.toLowerCase()}. Please contact support.`
      } else if (['SUSPENDED', 'CANCELLED', 'PAST_DUE'].includes(subStatus)) {
        this.billingDue = true
        this.billingMessage = `Your subscription is ${subStatus.toLowerCase()}. Please update billing.`
      } else if (subStatus === 'TRIAL' && (!trialEndsAt || new Date(trialEndsAt) < now)) {
        this.billingDue = true
        this.billingMessage = 'Your free trial has expired. Please upgrade to continue.'
      } else if (subStatus === 'ACTIVE' && periodEnd && new Date(periodEnd) < now) {
        this.billingDue = true
        this.billingMessage = 'Your subscription has expired. Please renew to continue.'
      }
    },

    async checkLiveApiStatus() {
      try {
        const res = await this.$axios.$get('/api/billing/subscription')
        if (!res) return
        
        const subStatus = (res.status || '').toUpperCase()
        const now = new Date()

        if (['SUSPENDED', 'CANCELLED', 'PAST_DUE'].includes(subStatus) || 
           (subStatus === 'TRIAL' && (!res.trialEndsAt || new Date(res.trialEndsAt) < now)) ||
           (subStatus === 'ACTIVE' && res.currentPeriodEnd && new Date(res.currentPeriodEnd) < now)) {
          this.billingDue = true
          if (this.$route.path !== '/billing') this.$router.push('/billing')
        }
      } catch (e) {
        if (e.response && e.response.status === 403) {
          this.billingDue = true
          this.billingMessage = e.response.data?.error || 'Your access is restricted.'
          if (this.$route.path !== '/billing') this.$router.push('/billing')
        }
      }
    },

    logout() {
      this.$store.dispatch('logout')
      this.$router.push('/login')
    }
  },

  watch: {
    '$route'(to) {
      if (this.billingDue && to.path !== '/billing') {
        this.$router.push('/billing')
      }
    }
  }
}
</script>

<style>
html, body {
  height: 100%;
  overflow-y: auto !important;
  overflow-x: hidden;
  font-family: 'Lato', sans-serif;
  -webkit-tap-highlight-color: transparent;
}

#__nuxt, #__layout {
  height: 100%;
}

.v-main {
  min-height: calc(100vh - 64px) !important; 
  overflow-y: auto !important;
  scroll-behavior: smooth;
}

.v-list-item--disabled {
  pointer-events: none !important;
}

@media (max-width: 600px) {
  input, select, textarea { font-size: 16px !important; }
  .v-dialog { margin: 12px !important; }
}
</style>