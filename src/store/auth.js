import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const defaultStateModel = {
    userId: 0,
    token: '',
    isAuthenticated: false
  }

  const stateModel = ref(Object.assign({}, defaultStateModel))

  function setAuthData(newState) {
    this.state = newState
  }

  function setToken(token) {
    this.state.token = token
    this.state.isAuthenticated = true
  }

  function $reset() {
    this.state = defaultStateModel
  }

  return { state: stateModel, $reset, setAuthData, setToken }
})
