<script setup lang='ts'>
import type { CSSProperties } from 'vue'
import { computed, watch, ref } from 'vue'
import { NButton, NLayoutSider, NInput, NInputGroup,} from 'naive-ui'
import List from './List.vue'
import Footer from './Footer.vue'
import { useAppStore, useChatStore, useConnectStore } from '@/store'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import {  createRoom, } from '../../../../connect'
// import { requestToSignin, fetchInitialRoomList } from '../../../../api'

const appStore = useAppStore()
// const chatStore = useChatStore()
const connectStore = useConnectStore()
const chatName = ref('New Chat')

// const show = ref(false)
const { isMobile } = useBasicLayout()

const collapsed = computed(() => appStore.siderCollapsed)


function handleAdd() {
  connectStore.setCreateRoomLoading(true)
  // const uuid = Date.now()
  // chatStore.addHistory({ title: chatName.value, uuid , isEdit: false })
  createRoom(chatName.value)
}

function handleUpdateCollapsed() {
  appStore.setSiderCollapsed(!collapsed.value)
}

const getMobileClass = computed<CSSProperties>(() => {
  if (isMobile.value) {
    return {
      position: 'fixed',
      zIndex: 50,
    }
  }
  return {}
})

const mobileSafeArea = computed(() => {
  if (isMobile.value) {
    return {
      paddingBottom: 'env(safe-area-inset-bottom)',
    }
  }
  return {}
})

watch(
  isMobile,
  (val) => {
    appStore.setSiderCollapsed(val)
  },
  {
    immediate: true,
    flush: 'post',
  },
)
</script>

<template>
  <!-- <n-space > -->

  <!-- <n-spin :show="show"> -->
    <NLayoutSider :collapsed="collapsed" :collapsed-width="0" :width="260"
      :show-trigger="isMobile ? false : 'arrow-circle'" collapse-mode="transform" position="absolute" bordered
      :style="getMobileClass" @update-collapsed="handleUpdateCollapsed">
      <div class="flex flex-col h-full" :style="mobileSafeArea">
        <main class="flex flex-col flex-1 min-h-0">
          <div class="p-4">
            <n-input-group style="margin-right: 10px;justify-content: flex-end;">
              <n-input placeholder="New Chat" v-model:value="chatName" :style="{ width: '80%' }" />
              <n-button type="primary" ghost @click="handleAdd">
                创建
              </n-button>
            </n-input-group>
            <!-- <NButton dashed block @click="handleAdd">
                    New chat
                  </NButton> -->
          </div>
          <div class="flex-1 min-h-0 pb-4 overflow-hidden">
            <List />
          </div>
        </main>
        <Footer />
      </div>
    </NLayoutSider>


    <template v-if="isMobile">
      <div v-show="!collapsed" class="fixed inset-0 z-40 bg-black/40" @click="handleUpdateCollapsed" />
    </template>
  <!-- </n-spin> -->
  <!-- </n-space> -->
</template>
