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
      <v-app-bar-nav-icon @click="mini = !mini" />
      <v-toolbar-title class="text-body-1 font-weight-bold" style="color:#0f172a;">
        {{ pageTitle }}
      </v-toolbar-title>
      <v-spacer />
      <v-chip small outlined color="#D32F2F" class="mr-3">
        <v-icon left x-small>mdi-shield-check</v-icon>
        Super Admin
      </v-chip>
    </v-app-bar>

    <!-- Content -->
    <v-main style="background:#f8fafc;">
      <v-container fluid class="pa-6">
        <nuxt />
      </v-container>
    </v-main>
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
        { title: 'Invoices', to: '/admin/invoices', icon: 'mdi-receipt' },
        { title: 'Payments', to: '/admin/payments', icon: 'mdi-cash-multiple' },
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
      this.$store.commit('admin/clearToken') // or localStorage.removeItem('adminToken')
      localStorage.removeItem('adminToken')
      this.$router.push('/admin/login')
    },
  },
}
</script>

<style scoped>
.admin-layout { font-family: 'Inter', sans-serif; }
.brand { height: 64px; }
.admin-appbar { border-bottom: 1px solid #e2e8f0; }
</style>