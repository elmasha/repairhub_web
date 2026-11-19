<template>
  <div>
    <v-alert
      v-if="pageError" type="error" dense outlined class="mb-4 text-left"
      dismissible @input="pageError = ''"
    >
      {{ pageError }}
    </v-alert>

    <v-card outlined>
      <div class="d-flex flex-wrap align-center pa-4 border-bottom">
        <v-text-field
          v-model.trim="filters.action"
          label="Action (e.g. BUSINESS_SUSPENDED)"
          outlined dense color="primary" class="mr-3"
          style="max-width: 280px;"
        />
        <v-text-field
          v-model.trim="filters.targetId"
          label="Target ID"
          outlined dense color="primary" class="mr-3"
          style="max-width: 220px;"
        />
        <v-spacer />
        <v-btn small text color="primary" @click="resetFilters">Reset</v-btn>
        <v-btn small color="#D32F2F" dark @click="fetchAudit">Apply</v-btn>
      </div>

      <v-simple-table>
        <thead>
          <tr>
            <th class="text-left">When</th>
            <th class="text-left">Action</th>
            <th class="text-left">Target</th>
            <th class="text-left">Actor</th>
            <th class="text-left">IP</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in items" :key="a.id">
            <td class="text-caption">{{ formatDateTime(a.createdAt) }}</td>
            <td class="font-weight-bold">{{ a.action }}</td>
            <td class="text-caption">
              {{ a.targetType }}
              <span v-if="a.targetId" class="text-grey">· {{ a.targetId.slice(0, 8) }}</span>
            </td>
            <td class="text-caption text-grey">
              {{ a.actorId ? a.actorId.slice(0, 8) : '—' }}
            </td>
            <td class="text-caption text-grey">{{ a.ip || '—' }}</td>
          </tr>
          <tr v-if="items.length === 0 && !loading">
            <td colspan="5" class="text-center py-8 text-grey">
              <v-icon size="48" color="grey lighten-2" class="mb-2">mdi-history</v-icon>
              <div>No audit entries match.</div>
            </td>
          </tr>
        </tbody>
      </v-simple-table>

      <div v-if="totalPages > 1" class="d-flex justify-center py-4">
        <v-pagination
          v-model="page"
          :length="totalPages"
          :total-visible="7"
          circle color="#D32F2F"
          @input="fetchAudit"
        />
      </div>
    </v-card>
  </div>
</template>

<script>
export default {
  layout: 'admin',
  middleware: 'admin-auth',
  data() {
    return {
      items: [],
      page: 1,
      pageSize: 50,
      total: 0,
      loading: false,
      pageError: '',
      filters: { action: '', targetId: '' },
    }
  },
  computed: {
    totalPages() {
      return Math.max(1, Math.ceil(this.total / this.pageSize))
    },
  },
  mounted() {
    this.fetchAudit()
  },
  methods: {
    headers() {
      return { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } }
    },
    async fetchAudit() {
      this.loading = true
      try {
        const params = { page: this.page, pageSize: this.pageSize }
        if (this.filters.action) params.action = this.filters.action
        if (this.filters.targetId) params.targetId = this.filters.targetId
        const res = await this.$axios.$get('/api/system/audit', {
          ...this.headers(),
          params,
        })
        this.items = res.items || []
        this.total = (res.pagination && res.pagination.total) || 0
      } catch (e) {
        if (e && e.response && e.response.status === 401) return this.$router.push('/admin/login')
        this.pageError = 'Failed to load audit log.'
      } finally {
        this.loading = false
      }
    },
    resetFilters() {
      this.filters = { action: '', targetId: '' }
      this.page = 1
      this.fetchAudit()
    },
    formatDateTime(val) {
      if (!val) return '—'
      const d = new Date(val)
      return d.toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    },
  },
}
</script>