<script setup lang='ts'>

import { computed, ref } from 'vue'
import { NModal, NCard, NInput, NButton, NInputGroup, NResult, NSpace, NSpin, NEmpty } from 'naive-ui'
import { useConnectStore } from '@/store'
import { inviteUser, } from '@/connect'
import { findUser } from '@/api'


interface Props {
    showModal: boolean

}

interface Emit {
    (ev: 'handleShow', showModal: boolean): void
}
const emit = defineEmits<Emit>()
const props = defineProps<Props>()
const connectStore = useConnectStore()
const show = computed({
    get() {
        return props.showModal
    },
    set(showModal: boolean) {
        emit('handleShow', showModal)
    },
})
const searchRes = ref('')
const userName = ref('')
const userInfo = ref({ userid: '' })

function searchUser() {
    if (searchRes.value === 'loading') return;
    if (userName.value === '') return;
    try {
        findUser(userName.value).then((e: any) => {
            if (e.payload.res) {
                searchRes.value = 'success'
                const user = e.payload.user
                userInfo.value = { userid: user.userId }
            } else {
                userInfo.value = { userid: '' }
                searchRes.value = 'notFound'
            }
        }).catch(() => {
            searchRes.value = 'notFound'
            userInfo.value = { userid: '' }
        })
    } catch {

    }
}

function handleInviteUser() {
    const roomid = connectStore.currentUUID;
    const roomAdmin = connectStore.userId;
    const userid = userInfo.value.userid
    inviteUser(roomid, userid, roomAdmin)
    emit('handleShow', false)
}

</script>
<template>
    <NModal v-model:show="show" :auto-focus="false">
        <NCard role="dialog" aria-modal="true" :bordered="false" style="width: 95%; max-width: 640px">
            <NSpace vertical class="min-h-300" style="min-height: 300px;">

                <NInputGroup class="mb-8">
                    <NInput v-model:value="userName" />
                    <NButton @click="searchUser">搜索</NButton>
                </NInputGroup>
                <template v-if="searchRes === 'success'">
                    <n-result status="success" title="成功" description="失败的孩子">
                        <template #footer>
                            <n-button @click="handleInviteUser">邀请进入房间</n-button>
                        </template>
                    </n-result>
                </template>
                <template v-if="searchRes === 'notFound'">
                    <n-result status="404" title="404 没找到用户" description="生活总归带点荒谬">
                        <template #footer>
                            <!-- <n-button>找点乐子吧</n-button> -->
                        </template>
                    </n-result>
                </template>

                <template v-if="searchRes === 'loading'">
                    <n-space>
                        <n-spin size="large" />
                    </n-space>
                </template>

                <template v-if="searchRes === ''">
                    <n-empty size="large" description="">
                        <!-- <template #extra>
                                <n-button size="small">
                                    看看别的
                                </n-button>
                            </template> -->
                    </n-empty>
                </template>

            </NSpace>
        </NCard>


    </NModal>
</template>
<style scoped></style>