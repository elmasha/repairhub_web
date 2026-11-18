export default function ({ store, redirect, app }) {
  // Check Vuex state first, fallback to checking the cookie directly
  const token = store.state.authToken || app.$cookies.get('token')
  
  if (!token) {
    return redirect('/login')
  }
}