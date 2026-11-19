export default function ({ store, redirect, route }) {
  // 1. If no user is logged in, let the 'authenticated' middleware handle the redirect
  if (!store.state.user) return

  const userRole = store.state.user.role
  const routePath = route.path

  // 2. SUPER_ADMIN bypass (You can go anywhere)
  if (userRole === 'SUPER_ADMIN') {
    return
  }

  // 3. Protect the /admin route (Only SUPER_ADMIN can go here)
  if (routePath.startsWith('/admin')) {
    // If a regular user tries to open /admin, kick them to the dashboard
    return redirect('/dashboard')
  }

  // 4. Protect the Staff page (Owner and Admin only)
  if (routePath.startsWith('/staff')) {
    if (!['OWNER', 'ADMIN'].includes(userRole)) {
      return redirect('/dashboard')
    }
  }

  // 5. Protect the POS page (Owner, Admin, Manager, Cashier)
  if (routePath.startsWith('/pos')) {
    if (!['OWNER', 'ADMIN', 'MANAGER', 'CASHIER'].includes(userRole)) {
      return redirect('/dashboard')
    }
  }

  // 6. Protect the Repairs page (Everyone except Cashier can do repairs)
  if (routePath.startsWith('/repairs')) {
    if (!['OWNER', 'ADMIN', 'MANAGER', 'TECHNICIAN'].includes(userRole)) {
      return redirect('/dashboard')
    }
  }
}