export default function ({ store, redirect, route }) {
  const sub = store.state.subscription
  
  // If no subscription data yet, let them pass (avoids locking on initial load)
  if (!sub) return

  const status = sub.status?.toUpperCase() || ''
  const now = new Date()
  
  // 1. Check if they are explicitly blocked
  if (['SUSPENDED', 'CANCELLED', 'PAST_DUE'].includes(status)) {
    return handleLockout(route, redirect)
  }

  // 2. Check if their TRIAL has expired
  if (status === 'TRIAL') {
    if (!sub.trialEndsAt || new Date(sub.trialEndsAt) < now) {
      return handleLockout(route, redirect)
    }
  }

  // 3. Check if their ACTIVE subscription has expired
  if (status === 'ACTIVE') {
    if (sub.currentPeriodEnd && new Date(sub.currentPeriodEnd) < now) {
      return handleLockout(route, redirect)
    }
  }
}

function handleLockout(route, redirect) {
  // Allow them to access billing so they can pay, and login/logout
  const allowedPaths = ['/billing', '/login', '/register', '/logout']
  
  if (!allowedPaths.includes(route.path)) {
    return redirect('/billing')
  }
}