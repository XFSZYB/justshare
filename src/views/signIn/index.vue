<script setup lang='ts'>

import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NInput, NModal, useMessage, NSpace } from 'naive-ui'
import { requestToSignin, requestToRegister } from '../../api'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { useConnectStore } from '@/store'
import CryptoJs from "crypto-js"

const router = useRouter()
const { isMobile } = useBasicLayout()
const connectStore = useConnectStore()

const ms = useMessage()

const loading = ref(false)
const token = ref('')
const name = ref('')
const password = ref('')
const password2 = ref('')
const register = ref(false)

const disabled = computed(() => !name.value.trim() || !name.value.trim() || loading.value)
const resData = async () => {
    const passwd = CryptoJs.MD5(password.value.trim()).toString()
    let res: any = {}
    if (register.value) {
        res = await requestToRegister(name.value.trim(), passwd)
    } else {
        res = await requestToSignin(name.value.trim(), passwd)
    }
    if (!res.payload) {
        ms.error('未知错误')
        return
    }
    if (res.payload.msg) {
        ms.error(res.payload.msg)
        return
    }
    connectStore.setUserId(res.payload.userId)
    connectStore.setUserName(res.payload.userName)
    const token: string = res.payload.userId
    const userName: string = res.payload.userName
    localStorage.setItem('userData', JSON.stringify({ name: userName, id: token, passwd }))
    if (res.payload) {
        router.push('/chat')
    }
}


async function handleVerify() {

    if (!name.value.trim()) {
        ms.error('请输入名字')

        return
    }
    if (!password.value.trim()) {
        ms.error('请输入密码')
    }
    if (register.value && password.value.trim() !== password.value.trim()) {
        ms.error('两次密码不一致')
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
function changeType(flag: boolean) {
    register.value = flag
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
                        <NSpace>
                            <NButton block :type="register ? 'primary' : 'tertiary'" @click="changeType(true)">
                                注册
                            </NButton>
                            <NButton block :type="!register ? 'primary' : 'tertiary'" @click="changeType(false)">
                                登录
                            </NButton>

                        </NSpace>


                        <!-- <Icon403 class="w-[200px] m-auto" /> -->
                    </header>
                    <NInput v-model:value="name" type="text" placeholder="请输入名称" @keypress="handlePress" />
                    <NInput v-model:value="password" type="text" placeholder="请输入密码" @keypress="handlePress" />
                    <NInput v-if="register" v-model:value="password2" type="text" placeholder="请再次输入密码"
                        @keypress="handlePress" />
                    <NButton block type="primary" :disabled="disabled" :loading="loading" @click="handleVerify">
                        {{ $t('common.verify') }}
                    </NButton>
                </div>
            </div>
        </NModal>
    </div>
</template>