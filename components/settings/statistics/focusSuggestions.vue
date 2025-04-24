<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFocusStats } from '~/stores/focusStats'
import { IconBulb, IconInfoCircle } from '@tabler/icons-vue'

const { t } = useI18n()
const focusStatsStore = useFocusStats()

// 计算专注效率（完成率）
const focusEfficiency = computed(() => {
  return focusStatsStore.focusCompletionRate
})

// 计算平均中断次数
const averageInterruptions = computed(() => {
  if (focusStatsStore.sessions.length === 0) return 0
  
  const totalInterruptions = focusStatsStore.sessions.reduce((sum, session) => sum + session.interruptions, 0)
  return totalInterruptions / focusStatsStore.sessions.length
})

// 计算最佳专注时段
const bestFocusTime = computed(() => {
  return focusStatsStore.mostProductiveHour
})

// 计算最佳专注日
const bestFocusDay = computed(() => {
  return focusStatsStore.mostProductiveDay
})

// 格式化小时
const formatHour = (hour: number | null): string => {
  if (hour === null) return t('settings.statistics.noData')
  return `${hour}:00 - ${(hour + 1) % 24}:00`
}

// 格式化星期几
const formatDay = (day: number | null): string => {
  if (day === null) return t('settings.statistics.noData')
  
  const days = [
    t('settings.statistics.days.sunday'),
    t('settings.statistics.days.monday'),
    t('settings.statistics.days.tuesday'),
    t('settings.statistics.days.wednesday'),
    t('settings.statistics.days.thursday'),
    t('settings.statistics.days.friday'),
    t('settings.statistics.days.saturday')
  ]
  
  return days[day]
}

// 生成基于效率的建议
const efficiencySuggestions = computed(() => {
  const suggestions = []
  
  if (focusEfficiency.value < 0.5) {
    suggestions.push(t('settings.statistics.suggestions.lowEfficiency'))
  } else if (focusEfficiency.value < 0.8) {
    suggestions.push(t('settings.statistics.suggestions.mediumEfficiency'))
  } else {
    suggestions.push(t('settings.statistics.suggestions.highEfficiency'))
  }
  
  return suggestions
})

// 生成基于中断的建议
const interruptionSuggestions = computed(() => {
  const suggestions = []
  
  if (averageInterruptions.value > 2) {
    suggestions.push(t('settings.statistics.suggestions.highInterruptions'))
  } else if (averageInterruptions.value > 0.5) {
    suggestions.push(t('settings.statistics.suggestions.mediumInterruptions'))
  } else {
    suggestions.push(t('settings.statistics.suggestions.lowInterruptions'))
  }
  
  return suggestions
})

// 生成基于时间模式的建议
const timingSuggestions = computed(() => {
  const suggestions = []
  
  if (bestFocusTime.value !== null) {
    suggestions.push(t('settings.statistics.suggestions.bestTimeOfDay', { time: formatHour(bestFocusTime.value) }))
  }
  
  if (bestFocusDay.value !== null) {
    suggestions.push(t('settings.statistics.suggestions.bestDayOfWeek', { day: formatDay(bestFocusDay.value) }))
  }
  
  return suggestions
})

// 所有建议
const allSuggestions = computed(() => {
  return [
    ...efficiencySuggestions.value,
    ...interruptionSuggestions.value,
    ...timingSuggestions.value
  ]
})

// 检查是否有足够的数据生成建议
const hasEnoughData = computed(() => {
  return focusStatsStore.sessions.length >= 5
})
</script>

<template>
  <div class="focus-suggestions">
    <h3 class="text-lg font-medium mb-2">{{ $t('settings.statistics.suggestions.title') }}</h3>
    
    <div class="suggestions-container bg-surface-light dark:bg-surface-dark p-4 rounded-lg">
      <div v-if="hasEnoughData">
        <ul class="space-y-3">
          <li v-for="(suggestion, index) in allSuggestions" :key="index" class="flex items-start gap-2">
            <IconBulb size="20" class="flex-shrink-0 mt-0.5 text-primary dark:text-primary-dark" />
            <span>{{ suggestion }}</span>
          </li>
        </ul>
      </div>
      
      <div v-else class="flex items-center gap-2 text-gray-500 dark:text-gray-400">
        <IconInfoCircle size="20" />
        <p>{{ $t('settings.statistics.suggestions.notEnoughData') }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.focus-suggestions {
  @apply w-full;
}
</style>
