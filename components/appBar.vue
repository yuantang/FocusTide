<script setup>
import { IconSettings, IconChecklist } from '@tabler/icons-vue'
import { ButtonImportance, ButtonTheme } from './base/types/button'
import { ref, watch, onMounted, onUnmounted } from 'vue'
import CButton from '~~/components/base/uiButton.vue'
import ScheduleView from '@/components/schedule/scheduleDisplay.vue'
import WhiteNoiseTopControl from '@/components/whiteNoise/whiteNoiseTopControl.vue'
import { useOpenPanels } from '@/stores/openpanels'
import { useSchedule } from '~~/stores/schedule'
import { useSettings } from '~~/stores/settings'
import { useWeb } from '~~/platforms/web'

const openPanels = useOpenPanels()
const scheduleStore = useSchedule()
const settingsStore = useSettings()
const webPlatform = useWeb()

// 白噪音播放状态
const whiteNoiseState = ref(false)

// 在组件挂载时检查白噪音状态
onMounted(() => {
  // 检查白噪音是否正在播放
  whiteNoiseState.value = webPlatform.isWhiteNoisePlaying()
})

// 定期检查白噪音状态，确保显示状态与实际播放状态一致
const updateInterval = ref<number | null>(null)

onMounted(() => {
  // 检查白噪音是否正在播放
  whiteNoiseState.value = webPlatform.isWhiteNoisePlaying()

  // 在客户端创建定时器
  if (process.client) {
    updateInterval.value = window.setInterval(() => {
      whiteNoiseState.value = webPlatform.isWhiteNoisePlaying()
    }, 1000)
  }
})

// 监听白噪音类型变化
watch(() => settingsStore.whiteNoise.type, () => {
  // 当类型变化时，更新状态
  setTimeout(() => {
    whiteNoiseState.value = webPlatform.isWhiteNoisePlaying()
  }, 500) // 等待一下，确保状态已更新
})

// 在组件卸载时清除定时器
onUnmounted(() => {
  if (process.client && updateInterval.value !== null) {
    window.clearInterval(updateInterval.value)
    updateInterval.value = null
  }
})

// 切换白噪音播放状态
const toggleWhiteNoise = () => {
  // 切换白噪音播放状态
  whiteNoiseState.value = webPlatform.toggleWhiteNoise()
}
</script>

<template>
  <div class="flex flex-row items-center w-full gap-2 px-4 my-1 isolate h-14">
    <div v-show="settingsStore.schedule.visibility.enabled" class="flex-shrink-0 h-10 px-2 py-2 rounded-full bg-surface-dark dark:ring-1 ring-inset dark:ring-surface-ondark dark:ring-opacity-20 overflow-hidden">
      <ClientOnly>
        <ScheduleView />
      </ClientOnly>
    </div>
    <ClientOnly>
      <div v-show="settingsStore.schedule.visibility.enabled && settingsStore.schedule.visibility.showSectionType" class="flex-shrink overflow-hidden text-lg whitespace-pre select-none text-ellipsis text-surface-onlight dark:text-surface-ondark" v-text="$t('section.' + scheduleStore.getCurrentItem.type).toLowerCase()" />
    </ClientOnly>
    <div class="flex-grow" />
    <CButton
      v-show="settingsStore.tasks.enabled"
      circle
      :theme="openPanels.todo ? ButtonTheme.Primary : ButtonTheme.Neutral"
      :importance="ButtonImportance.Tonal"
      class="transition rounded-full h-11"
      no-content-theme
      no-padding
      inner-class="p-1"
      :aria-label="$t('appbar.todo')"
      @click="openPanels.todo = !openPanels.todo"
    >
      <IconChecklist size="24" class="inline-block" />
    </CButton>
    <!-- 白噪音控制按钮 -->
    <WhiteNoiseTopControl
      v-if="settingsStore.whiteNoise.enabled"
      :is-playing="whiteNoiseState"
      @toggle="toggleWhiteNoise"
      class="mr-2"
    />
    <CButton
      circle
      :aria-label="$t('appbar.settings')"
      :importance="ButtonImportance.Filled"
      :theme="ButtonTheme.Neutral"
      class="h-11"
      no-content-theme
      no-padding
      inner-class="p-1"
      @click="openPanels.settings = !openPanels.settings"
    >
      <IconSettings size="24" class="inline-block" />
    </CButton>
  </div>
</template>
