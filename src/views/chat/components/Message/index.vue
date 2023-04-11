<script setup lang='ts'>
import { ref, onMounted } from 'vue'
import { NDropdown } from 'naive-ui'
import AvatarComponent from './Avatar.vue'
import TextComponent from './Text.vue'
import NormalFile from './NormalFile.vue'
import { SvgIcon } from '@/components/common'
import { copyText } from '@/utils/format'
import { useIconRender } from '@/hooks/useIconRender'
import { t } from '@/locales'
import { getReceivFileData } from '@/connect'
import { formatBytes } from '@/utils/format-bytes'

interface Props {
  msgType?: string
  dateTime?: string
  text?: string
  inversion?: boolean
  error?: boolean
  loading?: boolean
  href?: string
  download?: string,
  allData: any,
}
const dbHref = ref<any>(null)
interface Emit {
  (ev: 'regenerate'): void
  (ev: 'delete'): void
}

const props = defineProps<Props>()

const emit = defineEmits<Emit>()

const { iconRender } = useIconRender()

const textRef = ref<HTMLElement>()
const fileText = ref<string[]>([''])


const options = [
  // {
  //   label: t('chat.copy'),
  //   key: 'copyText',
  //   icon: iconRender({ icon: 'ri:file-copy-2-line' }),
  // },
  {
    label: t('common.delete'),
    key: 'delete',
    icon: iconRender({ icon: 'ri:delete-bin-line' }),
  },
]

function handleSelect(key: 'copyRaw' | 'copyText' | 'delete') {
  switch (key) {
    case 'copyText':
      copyText({ text: props.text ?? '' })
      return
    case 'delete':
      emit('delete')
  }
}

function handleRegenerate() {
  emit('regenerate')
}
onMounted(() => {
  if (props.msgType === 'file') {

    getReceivFileData(props.allData.userId, props.allData.fileHash).then((e: any) => {
      dbHref.value = window.URL.createObjectURL(e)
      fileText.value = [`文件名：${props.allData.fileName}`, `文件大小：${formatBytes(props.allData.fileSize)}`]
      console.warn('getReceivFileData===>', e)
    }).catch(e => {
      console.error('getReceivFileData===>', e)
    })
  }
})

</script>

<template>
  <div class="flex w-full mb-6 overflow-hidden" :class="[{ 'flex-row-reverse': inversion }]">
    <div class="flex items-center justify-center flex-shrink-0 h-8 overflow-hidden rounded-full basis-8"
      :class="[inversion ? 'ml-2' : 'mr-2']">
      <AvatarComponent :image="inversion" />
    </div>
    <div class="overflow-hidden text-sm " :class="[inversion ? 'items-end' : 'items-start']">
      <p class="text-xs text-[#b4bbc4]" :class="[inversion ? 'text-right' : 'text-left']">
        {{ dateTime }}
      </p>
      <div class="flex items-end gap-1 mt-2" :class="[inversion ? 'flex-row-reverse' : 'flex-row']">
        <NormalFile :href="dbHref || href || ''" :download="download || ''" :file-text="fileText" :inversion="inversion"
          v-if="msgType === 'file'" />
        <TextComponent v-else ref="textRef" :inversion="inversion" :error="error" :text="text" :loading="loading" />

        <div class="flex flex-col">
          <!-- <button v-if="!inversion"
            class="mb-2 transition text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-300"
            @click="handleRegenerate">
            <SvgIcon icon="ri:restart-line" />
          </button> -->
          <NDropdown :placement="!inversion ? 'right' : 'left'" :options="options" @select="handleSelect">
            <button class="transition text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-200">
              <SvgIcon icon="ri:more-2-fill" />
            </button>
          </NDropdown>
        </div>
      </div>
    </div>
  </div>
</template>
