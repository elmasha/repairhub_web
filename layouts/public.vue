<template>
  <v-app>
    <header class="public-header">
      <div class="container d-flex align-center justify-space-between">
        <div class="brand font-weight-black text-h5">
          <span style="color: #D32F2F;">Repair</span>Hub POS
        </div>
        <div class="nav-links d-flex align-center">
          <NuxtLink to="/login" class="text-decoration-none font-weight-bold text-black mr-4">Login</NuxtLink>
          <v-btn color="#D32F2F" dark class="text-none font-weight-bold" to="/register">
            Get Started
          </v-btn>
        </div>
      </div>
    </header>

    <v-main>
      <slot />
    </v-main>

    <footer class="public-footer text-center py-6 text-grey">
      &copy; {{ new Date().getFullYear() }} RepairHub POS. All rights reserved.
    </footer>
  </v-app>
</template>

<style scoped>
.public-header {
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  padding: 16px 0;
}
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  width: 100%;
}
.public-footer {
  border-top: 1px solid #e2e8f0;
  background: #ffffff;
}
</style>