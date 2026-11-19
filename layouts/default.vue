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
        <v-list-item to="/dashboard" exact active-class="bg-red-darken-2">
          <v-list-item-icon><v-icon>mdi-view-dashboard</v-icon></v-list-item-icon>
          <v-list-item-content><v-list-item-title>Dashboard</v-list-item-title></v-list-item-content>
        </v-list-item>
        
        <v-list-item to="/repairs" active-class="bg-red-darken-2">
          <v-list-item-icon><v-icon>mdi-tools</v-icon></v-list-item-icon>
          <v-list-item-content><v-list-item-title>Repair Desk</v-list-item-title></v-list-item-content>
        </v-list-item>
        
        <v-list-item to="/inventory" active-class="bg-red-darken-2">
          <v-list-item-icon><v-icon>mdi-package-variant-closed</v-icon></v-list-item-icon>
          <v-list-item-content><v-list-item-title>Inventory</v-list-item-title></v-list-item-content>
        </v-list-item>
        
        <v-list-item to="/pos" active-class="bg-red-darken-2">
          <v-list-item-icon><v-icon>mdi-cash-register</v-icon></v-list-item-icon>
          <v-list-item-content><v-list-item-title>POS Checkout</v-list-item-title></v-list-item-content>
        </v-list-item>

        <v-list-item to="/customers" active-class="bg-red-darken-2">
          <v-list-item-icon><v-icon>mdi-account-group</v-icon></v-list-item-icon>
          <v-list-item-content><v-list-item-title>Customers</v-list-item-title></v-list-item-content>
        </v-list-item>

        <v-list-item to="/payments" active-class="bg-red-darken-2">
          <v-list-item-icon><v-icon>mdi-receipt</v-icon></v-list-item-icon>
          <v-list-item-content><v-list-item-title>Payments</v-list-item-title></v-list-item-content>
        </v-list-item>

        <!-- STAFF LINK -->
        <v-list-item 
          v-if="['OWNER', 'ADMIN'].includes($store.state.user?.role)" 
          to="/staff" 
          active-class="bg-red-darken-2"
        >
          <v-list-item-icon><v-icon>mdi-account-cog</v-icon></v-list-item-icon>
          <v-list-item-content><v-list-item-title>Staff</v-list-item-title></v-list-item-content>
        </v-list-item>

        <v-list-item to="/billing" active-class="bg-red-darken-2">
          <v-list-item-icon><v-icon>mdi-credit-card</v-icon></v-list-item-icon>
          <v-list-item-content><v-list-item-title>Billing</v-list-item-title></v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Topbar -->
    <v-app-bar app color="#121212" elevation="2" dark>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" class="hidden-md-and-up"></v-app-bar-nav-icon>
      
      <v-spacer></v-spacer>
      <span class="mr-4 text-grey-lighten-1 font-weight-bold hidden-sm-and-down">{{ $store.state.user?.name || 'Admin' }}</span>
      <v-btn text color="primary" class="font-weight-bold text-none px-2" @click="logout">
        Logout
      </v-btn>
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
        Your account is suspended due to unpaid billing. 
      </span>
      <v-btn 
        x-small 
        color="white" 
        class="text-none font-weight-bold red--text" 
        to="/settings/billing"
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
      billingDue: false, // Tracks if the billing is past due
    }
  },

  created() {
    this.drawer = this.$vuetify.breakpoint.mdAndUp
  },

  mounted() {
    this.checkBilling()
  },

  methods: {
    async checkBilling() {
      try {
        // We call a lightweight endpoint to check the sub status
        const res = await this.$axios.$get('/api/billing/subscription')
        // If status is not ACTIVE or TRIAL, they are past due
        if (res && res.status && !['ACTIVE', 'TRIAL'].includes(res.status)) {
          this.billingDue = true
        }
      } catch (e) {
        // If 403 is returned (meaning they are blocked), we show the banner
        if (e.response && e.response.status === 403) {
          this.billingDue = true
        }
      }
    },

    logout() {
      this.$store.dispatch('logout')
      this.$router.push('/login')
    }
  }
}
</script>

<style>
/* Global Reset for scrolling */
html, body {
  height: 100%;
  overflow-y: auto !important;
  overflow-x: hidden;
  font-family: 'Lato', sans-serif;
  -webkit-tap-highlight-color: transparent;
}

/* Prevent iOS bounce */
#__nuxt, #__layout {
  height: 100%;
}

.v-main {
  /* Force v-main to allow scrolling when content is taller than the screen */
  min-height: calc(100vh - 64px) !important; 
  overflow-y: auto !important;
  scroll-behavior: smooth;
}

@media (max-width: 600px) {
  input, select, textarea { font-size: 16px !important; }
  .v-dialog { margin: 12px !important; }
}
</style>