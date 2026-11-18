export default function ({ store, redirect }) {
  // If the user is not logged in, the 'authenticated' middleware handles it
  if (!store.state.user) return

  const userRole = store.state.user.role
  const routePath = window.location.pathname

  // 1. Protect the Staff page (Owner and Admin only)
  if (routePath.startsWith('/staff')) {
    if (!['OWNER', 'ADMIN'].includes(userRole)) {
      return redirect('/dashboard')
    }
  }

  // 2. Protect the POS page (Owner, Admin, Manager, Cashier)
  if (routePath.startsWith('/pos')) {
    if (!['OWNER', 'ADMIN', 'MANAGER', 'CASHIER'].includes(userRole)) {
      return redirect('/dashboard')
    }
  }

  // 3. Protect the Repairs page (Everyone except Cashier can do repairs, but let's allow all for now)
  // You can add more rules here later!
}