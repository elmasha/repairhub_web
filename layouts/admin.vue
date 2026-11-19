<template>
  <v-app class="admin-layout">
    <!-- Admin sidebar -->
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="mini"
      app
      color="#0f172a"
      dark
      width="240"
    >
      <!-- Brand -->
      <div class="brand pa-4 d-flex align-center">
        <v-icon color="#D32F2F" class="mr-2">mdi-shield-crown</v-icon>
        <div v-if="!mini">
          <div class="font-weight-bold white--text">RepairHub</div>
          <div class="text-caption" style="color:#94a3b8;">System Admin</div>
        </div>
      </div>

      <v-divider style="border-color:#1e293b;" />

      <!-- Nav -->
      <v-list dense nav class="mt-2">
        <v-list-item
          v-for="item in items"
          :key="item.to"
          :to="item.to"
          color="#D32F2F"
          exact
        >
          <v-list-item-icon>
            <v-icon small>{{ item.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content v-if="!mini">
            <v-list-item-title class="text-body-2">{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <template #append>
        <div class="pa-3">
          <v-btn
            block text small
            class="white--text"
            style="background:#1e293b;"
            @click="logout"
          >
            <v-icon left small>mdi-logout</v-icon>
            <span v-if="!mini">Sign out</span>
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Admin topbar -->
    <v-app-bar app flat color="#ffffff" height="64" class="admin-appbar">
      <v-app-bar-nav-icon @click="mini = !mini" class="hidden-sm-and-down" />
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" class="hidden-md-and-up" />
      
      <v-toolbar-title class="text-body-1 font-weight-bold" style="color:#0f172a;">
        {{ pageTitle }}
      </v-toolbar-title>
      <v-spacer />
      <v-chip small outlined color="#D32F2F" class="mr-3 hidden-xs-only">
        <v-icon left x-small>mdi-shield-check</v-icon>
        Super Admin
      </v-chip>
    </v-app-bar>

    <!-- Content -->
    <v-main style="background:#f8fafc;" class="pb-16">
      <v-container fluid class="pa-6">
        <nuxt />
      </v-container>
    </v-main>

    <!-- ADMIN BOTTOM NAVIGATION (MOBILE ONLY) -->
    <v-bottom-navigation
      app
      fixed
      background-color="#0f172a"
      class="hidden-md-and-up bottom-nav"
      height="64"
    >
      <v-btn to="/admin" exact class="bottom-btn">
        <v-icon color="white" size="22">mdi-view-dashboard</v-icon>
      </v-btn>

      <v-btn to="/admin/businesses" class="bottom-btn">
        <v-icon color="white" size="22">mdi-store</v-icon>
      </v-btn>

      <v-btn to="/admin/plans" class="bottom-btn">
        <v-icon color="white" size="22">mdi-tag-multiple</v-icon>
      </v-btn>

      <!-- REPLACED: mdi-receipt -> mdi-file-document-outline -->
      <v-btn to="/admin/invoices" class="bottom-btn">
        <v-icon color="white" size="22">mdi-file-document-outline</v-icon>
      </v-btn>

      <v-btn to="/admin/payments" class="bottom-btn">
        <v-icon color="white" size="22">mdi-wallet</v-icon>
      </v-btn>

      <v-btn to="/admin/audit" class="bottom-btn">
        <v-icon color="white" size="22">mdi-history</v-icon>
      </v-btn>
    </v-bottom-navigation>
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      drawer: true,
      mini: false,
      items: [
        { title: 'Overview', to: '/admin', icon: 'mdi-view-dashboard' },
        { title: 'Businesses', to: '/admin/businesses', icon: 'mdi-store' },
        { title: 'Plans', to: '/admin/plans', icon: 'mdi-tag-multiple' },
        // REPLACED: mdi-receipt -> mdi-file-document-outline
        { title: 'Invoices', to: '/admin/invoices', icon: 'mdi-file-document-outline' },
        { title: 'Payments', to: '/admin/payments', icon: 'mdi-wallet' }, 
        { title: 'Audit Log', to: '/admin/audit', icon: 'mdi-history' },
      ],
    }
  },
  computed: {
    pageTitle() {
      const match = this.items.find((i) => this.$route.path === i.to)
      return match ? match.title : 'System Admin'
    },
  },
  methods: {
    logout() {
      this.$cookies.remove('adminToken')
      this.$router.push('/admin/login')
    },
  },
}
</script>

<style scoped>
.admin-layout { font-family: 'Inter', sans-serif; }
.brand { height: 64px; }
.admin-appbar { border-bottom: 1px solid #e2e8f0; }

/* Bottom Navigation Styles */
.bottom-nav {
  border-top: 1px solid #1e293b;
  box-shadow: 0 -4px 12px rgba(0,0,0,0.3) !important;
  overflow: hidden;
  display: flex;
  justify-content: space-around;
}

/* Distribute 6 items evenly */
.bottom-btn {
  flex: 1;
  min-width: 0 !important;
  max-width: 60px;
  padding: 0 !important;
}

.bottom-nav .v-btn--active .v-icon {
  color: #D32F2F !important;
}

.bottom-nav .v-btn__content {
  flex-direction: column;
  justify-content: center;
  height: 100%;
}
</style>