import { ss } from '@/utils/storage'

const LOCAL_NAME = 'currentUUID'

export function getCurrentUUID() {
  return ss.get(LOCAL_NAME)
}

export function setCurrentUUID(token: string) {
  return ss.set(LOCAL_NAME, token)
}

export function removeCurrentUUID() {
  return ss.remove(LOCAL_NAME)
}