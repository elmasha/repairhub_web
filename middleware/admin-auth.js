export default function ({ redirect, route, store }) {
  if (process.server) return

  const token = localStorage.getItem('adminToken')
  if (!token) {
    return redirect('/admin/login?next=' + encodeURIComponent(route.fullPath))
  }

  // Optional: decode and check role claim without verifying signature.
  // The server is the real gate; this just avoids rendering the shell for
  // a token that obviously isn't an admin token.
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (payload.role !== 'SUPER_ADMIN') {
      localStorage.removeItem('adminToken')
      return redirect('/admin/login')
    }
  } catch (e) {
    localStorage.removeItem('adminToken')
    return redirect('/admin/login')
  }
}