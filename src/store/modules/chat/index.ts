import { defineStore } from 'pinia'
import { getLocalState, setLocalState, defaultState } from './helper'
import { router } from '@/router'

export const useChatStore = defineStore('chat-store', {
  state: (): Chat.ChatState => defaultState(),

  getters: {
    getChatHistoryByCurrentActive(state: Chat.ChatState) {
      const index = state.history.findIndex(item => item.uuid === state.active)
      if (index !== -1)
        return state.history[index]
      return null
    },

    getChatByUuid(state: Chat.ChatState) {
      return (uuid?: string) => {
        if (uuid)
          return state.chat.find(item => item.uuid === uuid)?.data ?? []
        return state.chat.find(item => item.uuid === state.active)?.data ?? []
      }
    },
  },

  actions: {
    async getHistory() {
      const that = this
      const cb = function (json: any) {
        try {
          // console.warn(json)
          that.$state = json
        } catch (e) {
          console.error(e)
        }

      }
      await getLocalState(cb)


    },
    addHistory(history: Chat.History, chatData: Chat.Chat[] = []) {
      this.history.unshift(history)
      this.chat.unshift({ uuid: history.uuid, data: chatData })
      this.active = history.uuid
      this.reloadRoute(history.uuid)
    },

    updateHistory(uuid: string, edit: Partial<Chat.History>) {
      const index = this.history.findIndex(item => item.uuid === uuid)
      if (index !== -1) {
        this.history[index] = { ...this.history[index], ...edit }
        this.recordState()
      }
    },

    async deleteHistory(index: number) {
      this.history.splice(index, 1)
      this.chat.splice(index, 1)

      if (this.history.length === 0) {
        this.active = null
        this.reloadRoute()
        return
      }

      if (index > 0 && index <= this.history.length) {
        const uuid = this.history[index - 1].uuid
        this.active = uuid
        this.reloadRoute(uuid)
        return
      }

      if (index === 0) {
        if (this.history.length > 0) {
          const uuid = this.history[0].uuid
          this.active = uuid
          this.reloadRoute(uuid)
        }
      }

      if (index > this.history.length) {
        const uuid = this.history[this.history.length - 1].uuid
        this.active = uuid
        this.reloadRoute(uuid)
      }
    },

    async setActive(uuid: string) {
      this.active = uuid
      return await this.reloadRoute(uuid)
    },

    getChatByUuidAndIndex(uuid: string, index: number) {
      if (!uuid) {
        if (this.chat.length)
          return this.chat[0].data[index]
        return null
      }
      const chatIndex = this.chat.findIndex(item => item.uuid === uuid)
      if (chatIndex !== -1)
        return this.chat[chatIndex].data[index]
      return null
    },
    getChatByUuidAndChatId(uuid: string, chatid: string) {
      if (!uuid) {
        if (this.chat.length)
          return this.chat[0].data.filter(((item: any) => item.id === chatid))[0]
        return null
      }
      const chatIndex = this.chat.findIndex(item => item.uuid === uuid)
      if (chatIndex !== -1)
        return this.chat[chatIndex].data.filter(((item: any) => item.id === chatid))[0]
      return null
    },

    addChatByUuid(uuid: string, chat: Chat.Chat) {

      if (!uuid) {
        if (this.history.length === 0) {
          const uuid = Date.now().toString()
          this.history.push({ uuid, title: chat.text, isEdit: false })
          this.chat.push({ uuid, data: [chat] })
          this.active = uuid
          this.recordState()
        }
        else {
          this.chat[0].data.push(chat)
          if (this.history[0].title === 'New Chat')
            this.history[0].title = chat.text
          this.recordState()
        }
      } else {

        const index = this.chat.findIndex(item => item.uuid === uuid)
        console.log('???===>', uuid, chat, index)
        if (index !== -1) {
          this.chat[index].data.push(chat)
          // if (this.history[index].title === 'New Chat')
          //   this.history[index].title = chat.text
          this.recordState()
        } else {
           this.chat= [...this.chat, { uuid, data: [chat] }] 
           this.recordState()
        }
      }
    },

    updateChatByUuid(uuid: string, index: number, chat: Chat.Chat) {
      if (!uuid) {
        if (this.chat.length) {
          this.chat[0].data[index] = chat
          this.recordState()
        }
        return
      }

      const chatIndex = this.chat.findIndex(item => item.uuid === uuid)
      if (chatIndex !== -1) {
        this.chat[chatIndex].data[index] = chat
        this.recordState()
      }
    },

    updateChatSomeByUuid(uuid: string, index: number, chat: Partial<Chat.Chat>) {
      if (!uuid) {
        if (this.chat.length) {
          this.chat[0].data[index] = { ...this.chat[0].data[index], ...chat }
          this.recordState()
        }
        return
      }

      const chatIndex = this.chat.findIndex(item => item.uuid === uuid)
      if (chatIndex !== -1) {
        this.chat[chatIndex].data[index] = { ...this.chat[chatIndex].data[index], ...chat }
        this.recordState()
      }
    },
    updateChatSomeByUuidAndChatid(uuid: string, chatid: string, chat: Partial<Chat.Chat>) {
      if (!uuid) {
        if (this.chat.length) {
          this.chat[0].data = this.chat[0].data.map((item: any) => {
            if (item.id === chatid) {
              const tempChat = this.chat[0].data.filter((item: any) => { item.id === chatid })[0]
              return { ...tempChat, ...chat }
            }
            return item
          })
          this.recordState()
        }
        return
      }

      const chatIndex = this.chat.findIndex(item => item.uuid === uuid)
      if (chatIndex !== -1) {
        this.chat[chatIndex].data = this.chat[chatIndex].data.map((item: any) => {
          if (item.id === chatid) {
            const tempChat = this.chat[chatIndex].data.filter((item: any) => { item.id === chatid })[0]
            return { ...tempChat, ...chat }
          }
          return item
        })
        this.recordState()
      }
    },
    deleteChatByUuid(uuid: string, index: number) {
      if (!uuid) {
        if (this.chat.length) {
          this.chat[0].data.splice(index, 1)
          this.recordState()
        }
        return
      }

      const chatIndex = this.chat.findIndex(item => item.uuid === uuid)
      if (chatIndex !== -1) {
        this.chat[chatIndex].data.splice(index, 1)
        this.recordState()
      }
    },

    clearChatByUuid(uuid: string) {
      if (!uuid) {
        if (this.chat.length) {
          this.chat[0].data = []
          this.recordState()
        }
        return
      }

      const index = this.chat.findIndex(item => item.uuid === uuid)
      if (index !== -1) {
        this.chat[index].data = []
        this.recordState()
      }
    },

    async reloadRoute(uuid?: string) {
      this.recordState()
      await router.push({ name: 'Chat', params: { uuid } })
    },

    recordState() {
      setLocalState(this.$state)
    },
  },
})
