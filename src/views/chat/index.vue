<script setup lang='ts'>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute ,useRouter} from 'vue-router'
import { NButton, NInput, useDialog, useMessage, NUpload, NSpin } from 'naive-ui'
// import type { UploadInst, UploadFileInfo } from 'naive-ui'
import html2canvas from 'html2canvas'
import { Message, SearchBox } from './components'
import { useScroll } from './hooks/useScroll'
import { useChat } from './hooks/useChat'
import { useCopyCode } from './hooks/useCopyCode'
import { HoverButton, SvgIcon } from '@/components/common'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { useChatStore, useConnectStore } from '@/store'
import { fetchChatAPIProcess } from '@/api'
import { t } from '@/locales'
import { initConnect } from '../../connect'
import { fetchInitialRoomList, requestToSignin,fetchMyRoomIds } from '../../api'
import { sendTextMsg, sendFileMsg } from '@/connect'

let controller = new AbortController()
const connectStore = useConnectStore()
const ms = useMessage()
// const route = useRoute()
const router = useRouter()
const show = computed(() => connectStore.createRoomLoading)
const resData = async () => {
  const userData: any = JSON.parse(localStorage.getItem('userData') || '{}')
  const verifyLogin: any = await requestToSignin(userData.name, userData.passwd)
  if (!verifyLogin.payload) {
    ms.error('未知错误')
    return
  }
  if (verifyLogin.payload.msg) {
    ms.error(verifyLogin.payload.msg)
    if(verifyLogin.payload.msg==='not find user'){
      router.replace('/signIn')
      return 
    }
    return
  }
  connectStore.setUserId(userData.id)
  connectStore.setUserName(userData.name)
  initConnect(userData.id, userData.name)
  const myRooms:any = await fetchMyRoomIds(userData.id)
  if (!myRooms.payload) {
    ms.error('未知错误')
    return
  }
  if (myRooms.payload.msg) {
    ms.error(myRooms.payload.msg)
    return
  }
  connectStore.setRoomIds(myRooms.payload.roomIds)
  const roomListRes: any = await fetchInitialRoomList('')
  if (roomListRes.status === 'Success') {
    console.log('roomListRes==>', roomListRes)
    connectStore.setRoomList(roomListRes.payload.rooms)
  }

}
// resData()

const dialog = useDialog()


const chatStore = useChatStore()
chatStore.getHistory()


useCopyCode()
const { isMobile } = useBasicLayout()
const { addChat, updateChat, updateChatSome, getChatByUuidAndIndex } = useChat()
const { scrollRef, scrollToBottom } = useScroll()

// const { uuid } = route.params as { uuid: string }
// const uuid = connectStore.currentUUID || ''
// connectStore.setCurrentUUID(uuid)
const dataSources = computed(() => chatStore.getChatByUuid(connectStore.currentUUID))
// const conversationList = computed(() => dataSources.value.filter(item => (!item.inversion && !item.error)))

const prompt = ref<string>('')
const loading = ref<boolean>(false)

function handleSubmit() {
  onConversation()
}
async function onConversation() {
  sendTextMsg(prompt.value)
  // GroupChatService.sendChatMessageToAllPeer(prompt.value);  
  const userId = connectStore.userId
  const userName = connectStore.userName
  const timestamp = (new Date()).getTime();
  const id = `${userId}-${timestamp}`;
  const textMessage = {
    id,
    timestamp,
    userId: userId,
    userName: userName,
    isLocalSender: true,
    // text: prompt.value,
    isRead: true,
    isNew: false,
  };
  const message = prompt.value

  if (loading.value)
    return

  if (!message || message.trim() === '')
    return

  // controller = new AbortController()

  addChat(
    connectStore.currentUUID,
    {
      ...textMessage,
      dateTime: new Date().toLocaleString(),
      text: message,
      inversion: true,
      error: false,
      conversationOptions: null,
      requestOptions: { prompt: message, options: null },
    },
  )
  prompt.value = ''
  scrollToBottom()

}


async function onRegenerate(index: number) {
  if (loading.value)
    return

  controller = new AbortController()

  const { requestOptions } = dataSources.value[index]

  const message = requestOptions?.prompt ?? ''

  let options: Chat.ConversationRequest = {}

  if (requestOptions.options)
    options = { ...requestOptions.options }

  loading.value = true

  updateChat(
    connectStore.currentUUID,
    index,
    {
      dateTime: new Date().toLocaleString(),
      text: '',
      inversion: false,
      error: false,
      loading: true,
      conversationOptions: null,
      requestOptions: { prompt: message, ...options },
    },
  )

  try {
    await fetchChatAPIProcess<Chat.ConversationResponse>({
      prompt: message,
      options,
      signal: controller.signal,
      onDownloadProgress: ({ event }) => {
        const xhr = event.target
        const { responseText } = xhr
        // Always process the final line
        const lastIndex = responseText.lastIndexOf('\n')
        let chunk = responseText
        if (lastIndex !== -1)
          chunk = responseText.substring(lastIndex)
        try {
          const data = JSON.parse(chunk)
          updateChat(
            connectStore.currentUUID,
            index,
            {
              dateTime: new Date().toLocaleString(),
              text: data.text ?? '',
              inversion: false,
              error: false,
              loading: false,
              conversationOptions: { conversationId: data.conversationId, parentMessageId: data.id },
              requestOptions: { prompt: message, ...options },
            },
          )
        }
        catch (error) {
          //
        }
      },
    })
  }
  catch (error: any) {
    if (error.message === 'canceled') {
      updateChatSome(
        connectStore.currentUUID,
        index,
        {
          loading: false,
        },
      )
      return
    }

    const errorMessage = error?.message ?? t('common.wrong')

    updateChat(
      connectStore.currentUUID,
      index,
      {
        dateTime: new Date().toLocaleString(),
        text: errorMessage,
        inversion: false,
        error: true,
        loading: false,
        conversationOptions: null,
        requestOptions: { prompt: message, ...options },
      },
    )
  }
  finally {
    loading.value = false
  }
}

function handleExport() {
  if (loading.value)
    return

  const d = dialog.warning({
    title: t('chat.exportImage'),
    content: t('chat.exportImageConfirm'),
    positiveText: t('common.yes'),
    negativeText: t('common.no'),
    onPositiveClick: async () => {
      try {
        d.loading = true
        const ele = document.getElementById('image-wrapper')
        const canvas = await html2canvas(ele as HTMLDivElement)
        const imgUrl = canvas.toDataURL('image/png')
        const tempLink = document.createElement('a')
        tempLink.style.display = 'none'
        tempLink.href = imgUrl
        tempLink.setAttribute('download', 'chat-shot.png')
        if (typeof tempLink.download === 'undefined')
          tempLink.setAttribute('target', '_blank')

        document.body.appendChild(tempLink)
        tempLink.click()
        document.body.removeChild(tempLink)
        window.URL.revokeObjectURL(imgUrl)
        d.loading = false
        ms.success(t('chat.exportSuccess'))
        Promise.resolve()
      }
      catch (error: any) {
        ms.error(t('chat.exportFailed'))
      }
      finally {
        d.loading = false
      }
    },
  })
}

function handleDelete(index: number) {
  if (loading.value)
    return

  dialog.warning({
    title: t('chat.deleteMessage'),
    content: t('chat.deleteMessageConfirm'),
    positiveText: t('common.yes'),
    negativeText: t('common.no'),
    onPositiveClick: () => {
      chatStore.deleteChatByUuid(connectStore.currentUUID, index)
    },
  })
}
function handleUploadFile() {

}
function handleClear() {
  if (loading.value)
    return

  dialog.warning({
    title: t('chat.clearChat'),
    content: t('chat.clearChatConfirm'),
    positiveText: t('common.yes'),
    negativeText: t('common.no'),
    onPositiveClick: () => {
      chatStore.clearChatByUuid(connectStore.currentUUID)
    },
  })
}

function handleEnter(event: KeyboardEvent) {
  if (!isMobile.value) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit()
    }
  }
  else {
    if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault()
      handleSubmit()
    }
  }
}

function handleStop() {
  if (loading.value) {
    controller.abort()
    loading.value = false
  }
}

const placeholder = computed(() => {
  if (isMobile.value)
    return t('chat.placeholderMobile')
  return t('chat.placeholder')
})

const buttonDisabled = computed(() => {
  return loading.value || !prompt.value || prompt.value.trim() === ''
})

const wrapClass = computed(() => {
  if (isMobile.value)
    return ['pt-14']
  return []
})

const footerClass = computed(() => {
  let classes = ['p-4']
  if (isMobile.value)
    classes = ['sticky', 'left-0', 'bottom-0', 'right-0', 'p-2', 'pr-4', 'overflow-hidden']
  return classes
})
let timeout: any = null
onMounted(() => {
  // console.warn('==onMounted==')
  timeout = setTimeout(() => {
    resData()
  }, 1000)
  // if(!getConnectStatus()){
  //   resData()
  // }
  scrollToBottom()
})

onUnmounted(() => {
  clearTimeout(timeout)
  // console.warn('==onUnmounted==')
  if (loading.value)
    controller.abort()
})
function handleChange(e: any) {
  console.log(e)
  if (e.fileList.length > 0) {
    const fileList: File[] = e.fileList.map((item: any) => {
      return item.file
    })
    sendFileMsg(fileList)
  }

}
</script>

<template>
  <div class="flex flex-col w-full h-full" :class="wrapClass">

    <main class="flex-1 overflow-hidden">
      <n-spin :show="show">
        <div id="scrollRef" ref="scrollRef" class="h-full overflow-hidden overflow-y-auto">
          <div v-if="!isMobile" class="flex w-full p-4">

            <SearchBox />
          </div>

          <div id="image-wrapper" class="w-full max-w-screen-xl m-auto" :class="[isMobile ? 'p-2' : 'p-4']">
            <template v-if="!dataSources.length">
              <div class="flex items-center justify-center mt-4 text-center text-neutral-300">
                <SvgIcon icon="ri:bubble-chart-fill" class="mr-2 text-3xl" />
                <span>Aha~</span>
              </div>
            </template>
            <template v-else>
              <div>
                <Message v-for="(item, index) of dataSources" :key="index" :msg-type="item.msgType"
                  :date-time="item.dateTime" :text="item.text" :href="item.href" :download="item.download"
                  :inversion="item.inversion" :error="item.error" :loading="item.loading" :all-data="item"
                  @regenerate="onRegenerate(index)" @delete="handleDelete(index)" />
                <div class="sticky bottom-0 left-0 flex justify-center">
                  <NButton v-if="loading" type="warning" @click="handleStop">
                    <template #icon>
                      <SvgIcon icon="ri:stop-circle-line" />
                    </template>
                    Stop Responding
                  </NButton>
                </div>
              </div>
            </template>
          </div>
        </div>
        <template #description>
          正在创建，请稍后...
        </template>
      </n-spin>
    </main>



    <footer :class="footerClass">
      <div class="w-full max-w-screen-xl m-auto">
        <div class="flex items-center justify-between space-x-2">
          <HoverButton>
            <n-upload ref="upload" :default-upload="false" :show-file-list="false" multiple @change="handleChange">
              <span class="text-xl text-[#4f555e] dark:text-white">
                <SvgIcon icon="material-symbols:upload-sharp" />
              </span>
            </n-upload>
            <!-- <span class="text-xl text-[#4f555e] dark:text-white">
                        <SvgIcon icon="material-symbols:upload-sharp" />
                      </span> -->
          </HoverButton>
          <HoverButton @click="handleExport">
            <span class="text-xl text-[#4f555e] dark:text-white">
              <SvgIcon icon="ri:download-2-line" />
            </span>
          </HoverButton>
          <NInput v-model:value="prompt" type="textarea" :autosize="{ minRows: 1, maxRows: 2 }" :placeholder="placeholder"
            @keypress="handleEnter" />
          <NButton type="primary" :disabled="buttonDisabled" @click="handleSubmit">
            <template #icon>
              <span class="dark:text-black">
                <SvgIcon icon="ri:send-plane-fill" />
              </span>
            </template>
          </NButton>
        </div>
      </div>
    </footer>
  </div>
</template>
