<script setup lang="ts">
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
  console.log('App bar mounted, initializing white noise state')

  // 检查白噪音是否正在播放
  const initialState = webPlatform.isWhiteNoisePlaying()
  console.log('Initial white noise state:', initialState)
  whiteNoiseState.value = initialState

  // 在客户端创建定时器，更频繁地检查状态
  if (process.client) {
    // 清除可能存在的旧定时器
    if (updateInterval.value !== null) {
      window.clearInterval(updateInterval.value)
    }

    // 创建新定时器，更频繁地检查状态
    updateInterval.value = window.setInterval(() => {
      const currentState = webPlatform.isWhiteNoisePlaying()
      if (currentState !== whiteNoiseState.value) {
        console.log('White noise state changed from timer check:',
                    'old:', whiteNoiseState.value,
                    'new:', currentState)
        whiteNoiseState.value = currentState
      }
    }, 200) // 更频繁地检查状态，确保 UI 响应更快
  }
})

// 监听白噪音类型变化
watch(() => settingsStore.whiteNoise.type, (newType) => {
  console.log('White noise type changed to:', newType)

  // 当类型变化时，立即更新状态，然后再次检查以确保状态一致
  const currentState = webPlatform.isWhiteNoisePlaying()
  console.log('Current white noise state after type change:', currentState)
  whiteNoiseState.value = currentState

  // 定义检查函数
  const checkState = () => {
    const state = webPlatform.isWhiteNoisePlaying()
    console.log('Checking white noise state after type change:', state)
    whiteNoiseState.value = state
  }

  // 在类型变化后多次检查状态，确保 UI 与实际状态一致
  setTimeout(checkState, 100)
  setTimeout(checkState, 300)
  setTimeout(checkState, 500)
  setTimeout(checkState, 1000)
  setTimeout(checkState, 2000) // 添加更长的检查时间，确保状态最终一致
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
  console.log('App bar toggle white noise called, current state:', whiteNoiseState.value)

  // 切换白噪音播放状态
  const newState = webPlatform.toggleWhiteNoise()
  console.log('Toggle white noise returned:', newState)

  // 立即更新状态
  whiteNoiseState.value = newState

  // 在切换后多次检查状态，确保 UI 与实际状态一致
  const checkStates = () => {
    const currentState = webPlatform.isWhiteNoisePlaying()
    console.log('Checking white noise state:', currentState)
    whiteNoiseState.value = currentState
  }

  // 多次检查状态，确保 UI 与实际状态一致
  setTimeout(checkStates, 100)
  setTimeout(checkStates, 300)
  setTimeout(checkStates, 500)
  setTimeout(checkStates, 1000)
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
