import localStorageUtils from '@/store/localStorage.js'
const { useUserStore } = await import('@/store/user')
const { useAuthStore } = await import('@/store/auth')

export function logoutStore() {
  try {
    const userStore = useUserStore()
    const authStore = useAuthStore()

    userStore?.$reset()
    authStore?.$reset()
    localStorageUtils.clearLocalStorage()
  } catch (e) {
    console.error(e)
  }
}

export async function logInStore(userData) {
  try {
    const userStore = useUserStore()
    const authStore = useAuthStore()

    userStore?.setUserData(userData.data)
    authStore?.setAuthData({
      userId: userData.data.id,
      token: userData.token,
      isAuthenticated: true
    })

    localStorageUtils.setAuthToken(userData.token)
    localStorageUtils.setUserData(userData.data)
  } catch (e) {
    console.error(e)
  }
}
