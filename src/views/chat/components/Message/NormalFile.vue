<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import {  SvgIcon } from '@/components/common'
import { t } from '@/locales'

interface Props {
  inversion?: boolean
  error?: boolean
  text?: string
  loading?: boolean
  href: string
  download: string,
  fileText: string[]
}
// const href = ref('')
// const download = ref('')
const props = defineProps<Props>()

const { isMobile } = useBasicLayout()

// const textRef = ref<HTMLElement>()

const isImg = computed(() => {
  return props.download && /\.(png|jpg|gif|jpeg|webp)$/i.test(props.download)
})

const isVideo = computed(() => {
  return props.download && /\.(mp4|webm|ogg)$/i.test(props.download)
})

const wrapClass = computed(() => {
  return [
    'text-wrap',
    'min-w-[20px]',
    'rounded-md',
    isMobile.value ? 'p-2' : 'p-3',
    props.inversion ? 'bg-[#d2f9d1]' : 'bg-[#f4f6f8]',
    props.inversion ? 'dark:bg-[#a1dc95]' : 'dark:bg-[#1e1e20]',
    { 'text-red-500': props.error },
    !isMobile.value ? 'max-w-xs' : 'max-w-[200px]'
  ]
})



</script>

<template>
  <div class="text-black" :class="wrapClass">
    <video :src="href" v-if="isVideo" controls></video>
    <img :src="href" v-if="isImg" />
    <SvgIcon v-if="!isVideo && !isImg" icon="ant-design:file-unknown-outlined" style="height:48px;width: 48px;" />
    <div  class="leading-relaxed break-words">
      <template v-if="!inversion">
        <div v-for="t in fileText" :key="t" class="markdown-body" :v-text="t" />
      </template>
      <template v-else>
        <div v-for="t in fileText" :key="t" class="whitespace-pre-wrap" :v-text="t" />
      </template>

    </div>


    <a :href="href" :download="download">{{ download }}</a>
  </div>
</template>
  
<style lang="less">
@import url(./style.less);
</style>