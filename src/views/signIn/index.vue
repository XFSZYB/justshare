<script setup lang='ts'>

import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NInput, NModal, useMessage } from 'naive-ui'
import { initConnect, createRoom, joinRoom } from '../../utils/connect'
import { requestToSignin, fetchInitialRoomList } from '../../api'
import { useBasicLayout } from '@/hooks/useBasicLayout'
// import { fetchVerify } from '@/api'
// import { useAuthStore } from '@/store'
// import Icon403 from '@/icons/403.vue'
const router = useRouter()
const { isMobile } = useBasicLayout()
interface Props {
    visible: boolean
}

defineProps<Props>()

// const authStore = useAuthStore()
// const data: any = localStorage.getItem('userData') || {
//     name: 'users'
// }

const ms = useMessage()

const loading = ref(false)
const token = ref('')
const name = ref('')
const password = ref('')

const disabled = computed(() => !name.value.trim() || !name.value.trim() || loading.value)
const resData = async () => {
    const res: any = await requestToSignin(name.value.trim())
    const token: string = res.payload.userId
    const userName: string = res.payload.userName
    initConnect(token, userName)
    localStorage.setItem('userData', JSON.stringify({ name: userName }))
    if (res.payload) {
        router.push('/chat')
    }
}

// if (data && data.name) {
//     name.value = data.name
//     resData()
// }
async function handleVerify() {
    // const secretKey = token.value.trim()

    // if (!secretKey)
    //     return
    if (!name.value.trim()) {
        return
    }

    try {
        loading.value = true
        await resData()
        // await fetchVerify(secretKey)
        // authStore.setToken(secretKey)
        ms.success('success')
        // window.location.reload()
    }
    catch (error: any) {
        ms.error(error.message ?? 'error')
        // authStore.removeToken()
        token.value = ''
    }
    finally {
        loading.value = false
    }
}

function handlePress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        handleVerify()
    }
}
</script>

<template>
  <div class="h-full dark:bg-[#24272e] transition-all" :class="[isMobile ? 'p-0' : 'p-4']">
    <NModal :show="true" style="width: 90%; max-width: 540px">
        <div class="p-10 bg-white rounded dark:bg-slate-800">
            <div class="space-y-4">
                <header class="space-y-2">
                    <h2 class="text-2xl font-bold text-center text-slate-800 dark:text-neutral-200">
                        请注册
                    </h2>
                    <p class="text-base text-center text-slate-500 dark:text-slate-500">
                        {{ $t('common.unauthorizedTips') }}
                    </p>
                    <!-- <Icon403 class="w-[200px] m-auto" /> -->
                </header>
                <NInput v-model:value="name" type="text" placeholder="请输入名称" @keypress="handlePress" />
                <NInput v-model:value="password" type="text" placeholder="请输入密码" @keypress="handlePress" />
                <NButton block type="primary" :disabled="disabled" :loading="loading" @click="handleVerify">
                    {{ $t('common.verify') }}
                </NButton>
            </div>
        </div>
    </NModal>
</div>
</template>