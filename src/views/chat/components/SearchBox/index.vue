<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { computed, ref } from 'vue'
import { NButton, NInputGroup, NSelect } from 'naive-ui'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { useConnectStore } from '@/store'
import { joinRoom } from '@/connect'

interface Emit {
    (ev: 'changeExpand', val: boolean): void
}
const emit = defineEmits<Emit>()
// import { useAppStore } from '@/store';

// const appStore = useAppStore()
const connectStore = useConnectStore()

const roomsData = computed(() =>  connectStore.roomsData )

const { isMobile } = useBasicLayout()
const selectedValue = ref('')
const expand = ref(false)
function search() {
    const expandVal = expand.value
    if (((expandVal && isMobile.value)|| !isMobile.value) && selectedValue.value.trim()) {
        console.error('joint room')
       joinRoom(selectedValue.value)
       
    }
    expand.value = !expandVal
    emit('changeExpand', !expandVal)
}
const getExpandClass = computed<CSSProperties>(() => {
    if (!isMobile.value) {
        return { width: '100%' }
    }
    if (expand.value) {
        return {
            width: '80%'
        }
    }
    return {
        width: 'auto'
    }
})
const getMobileClass = computed<CSSProperties>(() => {
    if (isMobile.value) {
        return {
            width: '80%'
        }
    }
    return { width: '100%' }

})

</script>


<template>
    <n-input-group style="margin-right: 10px;justify-content: flex-end;" :style="getExpandClass">
        <n-select v-model:value="selectedValue" filterable :options="roomsData" v-if="expand || !isMobile"
            :style="getMobileClass" :show-arrow="false" />
        <n-button type="primary" ghost @click="search">
            {{`${(((expand && isMobile)|| !isMobile) && selectedValue.trim()) ? '确定' : '搜索' }`}}
        </n-button>
    </n-input-group>
</template>