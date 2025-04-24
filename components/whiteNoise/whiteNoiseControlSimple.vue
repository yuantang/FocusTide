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

// 监听外部传入的播放状态变化
watch(() => props.isPlaying, (newValue) => {
  localIsPlaying.value = newValue
})

// 切换白噪音播放状态
const toggleWhiteNoise = () => {
  emit('toggle')
}

// 在组件挂载时，同步播放状态
onMounted(() => {
  localIsPlaying.value = props.isPlaying
})
</script>

<template>
  <div class="fixed bottom-24 right-6 z-30">
    <button
      class="relative flex items-center justify-center w-12 h-12 rounded-full shadow-lg cursor-pointer transition-all duration-300 hover:scale-110 focus:outline-none"
      :class="props.isPlaying ? currentWhiteNoiseTypeClass : 'bg-gray-200 dark:bg-gray-700'"
      @click="toggleWhiteNoise"
      :aria-label="props.isPlaying ? $t('settings.whiteNoise.pause') : $t('settings.whiteNoise.play')"
    >
      <IconVolume v-if="props.isPlaying" size="20" class="text-white z-10" />
      <IconVolumeOff v-else size="20" class="text-gray-500 dark:text-gray-300 z-10" />

      <!-- 简单的脉动动画 -->
      <div v-if="props.isPlaying" class="absolute inset-0 rounded-full animate-pulse opacity-70" :class="currentWhiteNoiseTypeClass"></div>
    </button>
  </div>
</template>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 0.7;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(1.05);
  }
}

.animate-pulse {
  animation: pulse 2s ease-in-out infinite;
}
</style>
