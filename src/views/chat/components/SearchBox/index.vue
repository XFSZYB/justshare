<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { computed, ref } from 'vue'
import { NButton, NInput, NInputGroup, NSelect } from 'naive-ui'
// import { useAppStore } from '@/store';

// const appStore = useAppStore()
let selectedValue = ref(null)
let options = ref([
    {
        label: 'Drive My Car',
        value: 'song1'
    },
    {
        label: 'Norwegian Wood',
        value: 'song2'
    },
    {
        label: "You Won't See",
        value: 'song3'
    },
    {
        label: 'Nowhere Man',
        value: 'song4'
    },
    {
        label: 'Think For Yourself',
        value: 'song5'
    },
    {
        label: 'The Word',
        value: 'song6'
    },
    {
        label: 'Michelle',
        value: 'song7'
    },
    {
        label: 'What goes on',
        value: 'song8'
    },
    {
        label: 'Girl',
        value: 'song9'
    },
    {
        label: "I'm looking through you",
        value: 'song10'
    },
    {
        label: 'In My Life',
        value: 'song11'
    },
    {
        label: 'Wait',
        value: 'song12'
    }
])
let searchText = ref('')
let expand = ref(false)
function search() {
    expand.value = !expand.value
    if (searchText && expand.value) {

    }
}
const getMobileClass = computed<CSSProperties>(() => {
    if (expand.value) {
        return {
            width: '80%'
        }
    }
    return {
        width: 'auto'
    }
})
</script>


<template>
    <n-input-group style="margin-right: 10px;justify-content: flex-end;" :style="getMobileClass">
        <n-select v-model:value="selectedValue" filterable :options="options" v-if="expand" :style="{ width: '80%' }" />
        <n-button type="primary" ghost @click="search">
            搜索
        </n-button>
    </n-input-group>
</template>