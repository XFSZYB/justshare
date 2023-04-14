import type { AxiosProgressEvent, GenericAbortSignal } from 'axios'
import { post, get } from '@/utils/request'


export function fetchChatAPI<T = any>(
  prompt: string,
  options?: { conversationId?: string; parentMessageId?: string },
  signal?: GenericAbortSignal,
) {
  return post<T>({
    url: '/chat',
    data: { prompt, options },
    signal,
  })
}

export function fetchChatConfig<T = any>() {
  return post<T>({
    url: '/config',
  })
}

export function fetchChatAPIProcess<T = any>(
  params: {
    prompt: string
    options?: { conversationId?: string; parentMessageId?: string }
    signal?: GenericAbortSignal
    onDownloadProgress?: (progressEvent: AxiosProgressEvent) => void
  },
) {
  return post<T>({
    url: '/chat-process',
    data: { prompt: params.prompt, options: params.options },
    signal: params.signal,
    onDownloadProgress: params.onDownloadProgress,
  })
}

export function fetchSession<T>() {
  return post<T>({
    url: '/session',
  })
}

export function fetchVerify<T>(token: string) {
  return post<T>({
    url: '/verify',
    data: { token },
  })
}

export async function requestToRegister<T>(userName: string, passwd: string) {
  return await post<T>({
    url: '/api/register',
    data: { userName, passwd },
  })
}

export async function requestToSignin<T>(userName: string, passwd: string) {
  return await post<T>({
    url: '/api/login',
    data: { userName, passwd },
  })
}

export function fetchInitialRoomList<T>(groupId: string) {
  return get<T>({
    url: '/api/rooms',
    data: { groupId },
  })
}

export function fetchMyRoomIds<T>(userid: string) {
  return get<T>({
    url: '/api/myroomids',
    data: { userid },
  })

}

export function inviteUser<T>(roomAdmin: string, userId: string, roomId: string) {
  return get<T>({
    url: '/api/invite',
    data: { roomAdmin, userId, roomId },
  })

}

