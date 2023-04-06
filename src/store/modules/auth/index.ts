import { defineStore } from 'pinia'
import { getToken, removeToken, setToken } from './helper'
import { store } from '@/store'
import { fetchSession } from '@/api'

export interface AuthState {
  token: string | undefined
  session: { auth: boolean } | null
}

export const useAuthStore = defineStore('auth-store', {
  state: (): AuthState => ({
    token: getToken(),
    session: null,
  }),

  actions: {
    async getSession() {
      try {
        // const { data } = await fetchSession<{ auth: boolean }>()
        const userData = localStorage.getItem('userData') || '{}'
        console.log('userData',userData)
        const userName = JSON.parse(userData).name ? true : false
        const data = { auth: userName }
        this.session = { ...data }
        return Promise.resolve(data)
      }
      catch (error) {
        return Promise.reject(error)
      }
    },

    setToken(token: string) {
      this.token = token
      setToken(token)
    },

    removeToken() {
      this.token = undefined
      removeToken()
    },
  },
})

export function useAuthStoreWithout() {
  return useAuthStore(store)
}
