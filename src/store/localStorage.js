import { logoutStore } from '@/store/storeController.js'
import router from '@/router/index.js'

const { useAuthStore } = await import('@/store/auth')
const { useUserStore } = await import('@/store/user.js')
const TOKEN_KEY = 'auth_token'
const USER_KEY = 'user_data'
const TOKEN_TTL_MS = 3600000 // 1 hour

async function initLocalStore() {
  await setAuthTokenToStore()
  bindListener()
}

async function setAuthTokenToStore() {
  const currentToken = await getAuthToken()
  if (currentToken && !isTokenExpired(currentToken.timeStamp)) {
    const authStore = useAuthStore()
    authStore.setToken(currentToken.value)

    await setUserDataToStore()
  } else {
    clearLocalStorage()
  }
}

async function setUserDataToStore() {
  const userData = await getUserData()
  const userStore = useUserStore()
  userStore.setUserData(userData)
}

function bindListener() {
  window.addEventListener('storage', function (e) {
    if ((e.key === TOKEN_KEY && e.newValue === null) || (e.key === null && e.newValue === null)) {
      logoutStore()
      router.replace({ name: 'home' }).catch(console.error)
    }
  })
}

const isTokenExpired = (timeStamp) => {
  if (!timeStamp) return false

  const now = new Date().getTime()
  const diff = now - timeStamp

  return diff > TOKEN_TTL_MS
}

function setAuthToken(access_token) {
  localStorage.setItem(
    TOKEN_KEY,
    JSON.stringify({
      value: access_token,
      timeStamp: new Date().getTime()
    })
  )
}

async function getAuthToken() {
  let result = null
  try {
    const token = localStorage.getItem(TOKEN_KEY)
    token && (result = await JSON.parse(token))
  } catch (error) {
    console.error(error)
  }

  return result
}

function setUserData(data) {
  localStorage.setItem(USER_KEY, JSON.stringify(data))
}

async function getUserData() {
  let result = null
  try {
    const userData = localStorage.getItem(USER_KEY)
    userData && (result = await JSON.parse(userData))
  } catch (error) {
    console.error(error)
  }

  return result
}

function removeAuthToken() {
  localStorage.removeItem(TOKEN_KEY)
}

function clearLocalStorage() {
  localStorage.clear()
}

const localStorageUtils = {
  initLocalStore,
  clearLocalStorage,
  setAuthToken,
  setUserData
}
export default localStorageUtils
