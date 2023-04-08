<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { t } from '@/locales'

interface Props {
  inversion?: boolean
  error?: boolean
  text?: string
  loading?: boolean
  href:string
  download:string
}
// const href = ref('')
// const download = ref('')
const props = defineProps<Props>()

const { isMobile } = useBasicLayout()

// const textRef = ref<HTMLElement>()



const wrapClass = computed(() => {
  return [
    'text-wrap',
    'min-w-[20px]',
    'rounded-md',
    isMobile.value ? 'p-2' : 'p-3',
    props.inversion ? 'bg-[#d2f9d1]' : 'bg-[#f4f6f8]',
    props.inversion ? 'dark:bg-[#a1dc95]' : 'dark:bg-[#1e1e20]',
    { 'text-red-500': props.error },
  ]
})

const text = computed(() => {
  const value = props.text ?? ''
  if (!props.inversion){
  //  return mdi.render(value)
  }
 
  return value
}) 

</script>

<template>
    <div class="text-black" :class="wrapClass">
      <a :href="href" :download="download" >{{href}}{{download}}</a>
      <!-- <template v-if="loading">
        <span class="dark:text-white w-[4px] h-[20px] block animate-blink" />
      </template>
      <template v-else>
        <div ref="textRef" class="leading-relaxed break-words">
          <div v-if="!inversion" class="markdown-body" v-html="text" />
          <div v-else class="whitespace-pre-wrap" v-text="text" />
        </div>
      </template> -->
    </div>
  </template>
  
  <style lang="less">
  @import url(./style.less);
  </style>