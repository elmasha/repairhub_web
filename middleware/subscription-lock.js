export default function ({ store, redirect, route }) {
  const sub = store.state.subscription
  
  // If no subscription data, let them pass (avoids locking on initial load before fetch)
  if (!sub) return

  const isLocked = !['ACTIVE', 'TRIAL'].includes(sub.status)
  const isBillingPage = route.path === '/billing'
  const isLoginPage = route.path === '/login'

  if (isLocked && !isBillingPage && !isLoginPage) {
    return redirect('/billing')
  }
}