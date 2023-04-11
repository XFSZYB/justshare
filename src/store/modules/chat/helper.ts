// import { ss } from '@/utils/storage'
import {chatDB} from '@/utils/storage/db'

const LOCAL_NAME = 'chatStorage'

export function defaultState(): Chat.ChatState {
  const uuid = 1002
  return { active: uuid, history: [{ uuid, title: 'New Chat', isEdit: false }], chat: [{ uuid, data: [] }] }
}

export async function  getLocalState(cb:any): Promise<Chat.ChatState> {
  // const localState = ss.get(LOCAL_NAME)
  // const localState = await chatDB.get(LOCAL_NAME)
  // return localState 
  return await chatDB.get(LOCAL_NAME,cb) as any
}

export function setLocalState(state: Chat.ChatState) {
  chatDB.set(LOCAL_NAME, state)
}
