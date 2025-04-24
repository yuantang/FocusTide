<script setup lang="ts">
import { IconVolume, IconVolumeOff } from '@tabler/icons-vue'
import { useSettings, WhiteNoiseType } from '~~/stores/settings'
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const settingsStore = useSettings()

// 白噪音类型对应的颜色类
const whiteNoiseTypeClasses = {
  [WhiteNoiseType.Rain]: 'bg-blue-400',
  [WhiteNoiseType.Forest]: 'bg-green-500',
  [WhiteNoiseType.Ocean]: 'bg-blue-500',
  [WhiteNoiseType.Fan]: 'bg-gray-400',
  [WhiteNoiseType.Fireplace]: 'bg-orange-500',
  [WhiteNoiseType.Cafe]: 'bg-amber-600'
}

// 白噪音类型对应的图标类
const whiteNoiseTypeIcons = {
  [WhiteNoiseType.Rain]: 'rain',
  [WhiteNoiseType.Forest]: 'forest',
  [WhiteNoiseType.Ocean]: 'ocean',
  [WhiteNoiseType.Fan]: 'fan',
  [WhiteNoiseType.Fireplace]: 'fire',
  [WhiteNoiseType.Cafe]: 'cafe'
}

// 当前白噪音类型
const whiteNoiseType = computed(() => settingsStore.whiteNoise.type)

// 当前白噪音类型的颜色类
const currentWhiteNoiseTypeClass = computed(() => whiteNoiseTypeClasses[whiteNoiseType.value])

// 定义组件的属性
const props = defineProps({
  isPlaying: {
    type: Boolean,
    default: false
  }
})

// 定义组件的事件
const emit = defineEmits(['toggle'])

// 本地播放状态
const localIsPlaying = ref(props.isPlaying)
// 动画状态
const isAnimating = ref(false)
// 悬停状态
const isHovering = ref(false)

// 监听外部传入的播放状态变化
watch(() => props.isPlaying, (newValue) => {
  localIsPlaying.value = newValue
})

// 切换白噪音播放状态
const toggleWhiteNoise = () => {
  console.log('White noise control button clicked, current state:', localIsPlaying.value)
  isAnimating.value = true
  setTimeout(() => {
    isAnimating.value = false
  }, 300)
  emit('toggle')
}

// 在组件挂载时，同步播放状态
onMounted(() => {
  localIsPlaying.value = props.isPlaying
})
</script>

<template>
  <div class="relative z-50">
    <button
      class="relative flex items-center justify-center w-10 h-10 rounded-full shadow-md cursor-pointer transition-all duration-300 hover:scale-110 focus:outline-none overflow-hidden"
      :class="[
        props.isPlaying ? currentWhiteNoiseTypeClass : 'bg-gray-200/80 dark:bg-gray-700/80',
        isAnimating ? 'scale-90' : ''
      ]"
      @click="toggleWhiteNoise"
      @mouseenter="isHovering = true"
      @mouseleave="isHovering = false"
      :aria-label="props.isPlaying ? $t('settings.whiteNoise.pause') : $t('settings.whiteNoise.play')"
    >
      <!-- 图标 -->
      <IconVolume v-if="props.isPlaying" size="18" class="text-white z-10 transition-all duration-300" :class="isHovering ? 'scale-110' : ''" />
      <IconVolumeOff v-else size="18" class="text-gray-500 dark:text-gray-300 z-10 transition-all duration-300" :class="isHovering ? 'scale-110' : ''" />

      <!-- 波纹动画 - 简化版本，只有一个波纹 -->
      <div v-if="props.isPlaying" class="absolute inset-0 flex items-center justify-center">
        <div class="absolute w-full h-full rounded-full opacity-20 animate-ripple" :class="currentWhiteNoiseTypeClass"></div>
      </div>

      <!-- 悬停效果 -->
      <div v-if="isHovering" class="absolute inset-0 bg-black/10 dark:bg-white/10 rounded-full"></div>
    </button>

    <!-- 播放状态指示器 - 更小更精简 -->
    <div v-if="props.isPlaying" class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border border-white dark:border-gray-800 animate-pulse-slow"></div>
  </div>
</template>

<style scoped>
.animation-delay-500 {
  animation-delay: 500ms;
}

@keyframes ripple {
  0% {
    transform: scale(0.8);
    opacity: 0.3;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

.animate-ripple {
  animation: ripple 2s ease-out infinite;
}

@keyframes pulse-slow {
  0%, 100% {
    opacity: 0.8;
  }
  50% {
    opacity: 0.4;
  }
}

.animate-pulse-slow {
  animation: pulse-slow 2s ease-in-out infinite;
}
</style>
