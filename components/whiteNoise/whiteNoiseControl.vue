<script setup lang="ts">
import { IconVolume, IconVolumeOff, IconWaves } from '@tabler/icons-vue'
import { useSettings, WhiteNoiseType } from '~~/stores/settings'
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const settingsStore = useSettings()
const { t } = useI18n()

// 创建一个响应式变量来跟踪白噪音的播放状态
const isPlaying = ref(false)
const isAnimating = ref(false)
const whiteNoiseType = computed(() => settingsStore.whiteNoise.type)

// 白噪音类型对应的图标类名
const whiteNoiseTypeClasses = {
  [WhiteNoiseType.Rain]: 'bg-blue-400',
  [WhiteNoiseType.Forest]: 'bg-green-500',
  [WhiteNoiseType.Ocean]: 'bg-blue-500',
  [WhiteNoiseType.Fan]: 'bg-gray-400',
  [WhiteNoiseType.Fireplace]: 'bg-orange-500',
  [WhiteNoiseType.Cafe]: 'bg-amber-600'
}

// 白噪音类型对应的名称
const whiteNoiseTypeNames = computed(() => ({
  [WhiteNoiseType.Rain]: t('settings.values.whiteNoise.type._values.rain'),
  [WhiteNoiseType.Forest]: t('settings.values.whiteNoise.type._values.forest'),
  [WhiteNoiseType.Ocean]: t('settings.values.whiteNoise.type._values.ocean'),
  [WhiteNoiseType.Fan]: t('settings.values.whiteNoise.type._values.fan'),
  [WhiteNoiseType.Fireplace]: t('settings.values.whiteNoise.type._values.fireplace'),
  [WhiteNoiseType.Cafe]: t('settings.values.whiteNoise.type._values.cafe')
}))

// 获取当前白噪音类型的名称
const currentWhiteNoiseTypeName = computed(() => whiteNoiseTypeNames.value[whiteNoiseType.value])

// 获取当前白噪音类型的图标类名
const currentWhiteNoiseTypeClass = computed(() => whiteNoiseTypeClasses[whiteNoiseType.value])

// 声明一个函数来控制白噪音的播放和暂停
const toggleWhiteNoise = () => {
  // 如果白噪音功能未启用，则启用它
  if (!settingsStore.whiteNoise.enabled) {
    settingsStore.whiteNoise.enabled = true
  }

  // 触发自定义事件来控制白噪音的播放和暂停
  emit('toggle-white-noise')

  // 更新播放状态
  isPlaying.value = !isPlaying.value

  // 触发动画
  isAnimating.value = true
  setTimeout(() => {
    isAnimating.value = false
  }, 300)
}

// 定义组件的事件
const emit = defineEmits(['toggle-white-noise'])

// 接收外部传入的播放状态
const props = defineProps({
  isPlaying: {
    type: Boolean,
    default: false
  }
})

// 监听外部传入的播放状态变化
watch(() => props.isPlaying, (newValue) => {
  isPlaying.value = newValue
})

// 在组件挂载时，检查白噪音是否已启用并正在播放
onMounted(() => {
  // 从外部获取实际的播放状态
  isPlaying.value = props.isPlaying
})
</script>

<template>
  <div class="fixed bottom-20 right-6 z-30">
    <div
      class="relative flex items-center justify-center w-12 h-12 rounded-full shadow-lg cursor-pointer transition-all duration-300 hover:scale-110"
      :class="[
        isPlaying ? currentWhiteNoiseTypeClass : 'bg-gray-200 dark:bg-gray-700',
        isAnimating ? 'scale-90' : ''
      ]"
      @click="toggleWhiteNoise"
      :title="currentWhiteNoiseTypeName"
    >
      <IconVolume v-if="isPlaying" size="20" class="text-white" />
      <IconVolumeOff v-else size="20" class="text-gray-500 dark:text-gray-300" />

      <!-- 波浪动画 -->
      <div v-if="isPlaying" class="absolute inset-0 flex items-center justify-center">
        <div class="absolute w-12 h-12 rounded-full opacity-75 animate-ping" :class="currentWhiteNoiseTypeClass"></div>
        <div class="absolute w-10 h-10 rounded-full opacity-50 animate-ping animation-delay-300" :class="currentWhiteNoiseTypeClass"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animation-delay-300 {
  animation-delay: 300ms;
}

@keyframes ping {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

.animate-ping {
  animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
}
</style>
