<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFocusStats } from '~/stores/focusStats'
import { IconArrowUpRight, IconArrowDownRight, IconMinus, IconClock, IconCheck, IconX } from '@tabler/icons-vue'

const { t } = useI18n()
const focusStatsStore = useFocusStats()

// 格式化时长
const formatDuration = (ms: number): string => {
  const hours = Math.floor(ms / (1000 * 60 * 60))
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 0) {
    return `${hours}${t('settings.statistics.hours')} ${minutes}${t('settings.statistics.minutes')}`
  } else {
    return `${minutes}${t('settings.statistics.minutes')}`
  }
}

// 格式化百分比
const formatPercentage = (value: number): string => {
  return `${Math.round(value * 100)}%`
}

// 获取本周专注数据
const thisWeekData = computed(() => {
  // 获取本周的开始日期（周日）
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  // 过滤本周的专注会话
  const thisWeekSessions = focusStatsStore.sessions.filter(session => {
    const sessionDate = new Date(session.startTime)
    return sessionDate >= startOfWeek && session.type === 'work'
  })

  // 计算本周专注时长
  const totalDuration = thisWeekSessions.reduce((sum, session) => sum + session.duration, 0)

  // 计算本周专注次数
  const totalSessions = thisWeekSessions.length

  // 计算本周完成次数
  const completedSessions = thisWeekSessions.filter(session => session.completed).length

  // 计算本周完成率
  const completionRate = totalSessions > 0 ? completedSessions / totalSessions : 0

  return {
    totalDuration,
    totalSessions,
    completedSessions,
    completionRate
  }
})

// 获取上周专注数据
const lastWeekData = computed(() => {
  // 获取上周的开始和结束日期
  const now = new Date()
  const endOfLastWeek = new Date(now)
  endOfLastWeek.setDate(now.getDate() - now.getDay() - 1)
  endOfLastWeek.setHours(23, 59, 59, 999)

  const startOfLastWeek = new Date(endOfLastWeek)
  startOfLastWeek.setDate(endOfLastWeek.getDate() - 6)
  startOfLastWeek.setHours(0, 0, 0, 0)

  // 过滤上周的专注会话
  const lastWeekSessions = focusStatsStore.sessions.filter(session => {
    const sessionDate = new Date(session.startTime)
    return sessionDate >= startOfLastWeek && sessionDate <= endOfLastWeek && session.type === 'work'
  })

  // 计算上周专注时长
  const totalDuration = lastWeekSessions.reduce((sum, session) => sum + session.duration, 0)

  // 计算上周专注次数
  const totalSessions = lastWeekSessions.length

  // 计算上周完成次数
  const completedSessions = lastWeekSessions.filter(session => session.completed).length

  // 计算上周完成率
  const completionRate = totalSessions > 0 ? completedSessions / totalSessions : 0

  return {
    totalDuration,
    totalSessions,
    completedSessions,
    completionRate
  }
})

// 计算与上周相比的变化
const weeklyChanges = computed(() => {
  // 专注时长变化
  const durationChange = lastWeekData.value.totalDuration > 0
    ? (thisWeekData.value.totalDuration - lastWeekData.value.totalDuration) / lastWeekData.value.totalDuration
    : thisWeekData.value.totalDuration > 0 ? 1 : 0

  // 专注次数变化
  const sessionsChange = lastWeekData.value.totalSessions > 0
    ? (thisWeekData.value.totalSessions - lastWeekData.value.totalSessions) / lastWeekData.value.totalSessions
    : thisWeekData.value.totalSessions > 0 ? 1 : 0

  // 完成率变化
  const completionRateChange = lastWeekData.value.completionRate > 0
    ? thisWeekData.value.completionRate - lastWeekData.value.completionRate
    : thisWeekData.value.completionRate > 0 ? thisWeekData.value.completionRate : 0

  return {
    durationChange,
    sessionsChange,
    completionRateChange
  }
})

// 获取变化图标
const getChangeIcon = (change: number) => {
  if (change > 0.05) return IconArrowUpRight
  if (change < -0.05) return IconArrowDownRight
  return IconMinus
}

// 获取变化颜色
const getChangeColor = (change: number, inverse: boolean = false) => {
  if (change > 0.05) return inverse ? 'text-red-500' : 'text-green-500'
  if (change < -0.05) return inverse ? 'text-green-500' : 'text-red-500'
  return 'text-gray-500'
}

// 格式化变化百分比
const formatChange = (change: number): string => {
  if (Math.abs(change) < 0.05) return '0%'
  return `${change > 0 ? '+' : ''}${Math.round(change * 100)}%`
}

// 检查是否有数据
const hasData = computed(() => {
  return focusStatsStore.sessions.length > 0
})

// 获取今日专注数据
const todayData = computed(() => {
  // 获取今天的开始日期
  const now = new Date()
  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)

  // 过滤今天的专注会话
  const todaySessions = focusStatsStore.sessions.filter(session => {
    const sessionDate = new Date(session.startTime)
    return sessionDate >= startOfDay && session.type === 'work'
  })

  // 计算今天专注时长
  const totalDuration = todaySessions.reduce((sum, session) => sum + session.duration, 0)

  // 计算今天专注次数
  const totalSessions = todaySessions.length

  // 计算今天完成次数
  const completedSessions = todaySessions.filter(session => session.completed).length

  // 计算今天完成率
  const completionRate = totalSessions > 0 ? completedSessions / totalSessions : 0

  return {
    totalDuration,
    totalSessions,
    completedSessions,
    completionRate
  }
})
</script>

<template>
  <div class="focus-summary">
    <h3 class="text-lg font-medium mb-2">{{ $t('settings.statistics.summary.title') }}</h3>

    <div v-if="hasData" class="summary-container">
      <!-- 今日摘要 -->
      <div class="today-summary bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm overflow-hidden mb-6">
        <div class="summary-header bg-primary/10 dark:bg-primary-dark/20 px-4 py-3">
          <h4 class="text-base font-medium">{{ $t('settings.statistics.summary.today') }}</h4>
        </div>

        <div class="summary-body p-4">
          <div class="grid grid-cols-3 gap-4">
            <div class="summary-item">
              <div class="flex items-center gap-2">
                <IconClock size="18" class="text-primary dark:text-primary-dark" />
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ $t('settings.statistics.summary.focusTime') }}</span>
              </div>
              <div class="text-xl font-bold mt-1">{{ formatDuration(todayData.totalDuration) }}</div>
            </div>

            <div class="summary-item">
              <div class="flex items-center gap-2">
                <IconCheck size="18" class="text-green-500 dark:text-green-400" />
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ $t('settings.statistics.summary.sessions') }}</span>
              </div>
              <div class="text-xl font-bold mt-1">{{ todayData.completedSessions }} / {{ todayData.totalSessions }}</div>
            </div>

            <div class="summary-item">
              <div class="flex items-center gap-2">
                <IconX size="18" class="text-red-500 dark:text-red-400" />
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ $t('settings.statistics.summary.completion') }}</span>
              </div>
              <div class="text-xl font-bold mt-1">{{ formatPercentage(todayData.completionRate) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 本周与上周对比 -->
      <div class="weekly-comparison bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm overflow-hidden mb-6">
        <div class="summary-header bg-primary/10 dark:bg-primary-dark/20 px-4 py-3">
          <h4 class="text-base font-medium">{{ $t('settings.statistics.summary.weeklyComparison') }}</h4>
        </div>

        <div class="summary-body p-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- 专注时长对比 -->
            <div class="comparison-item p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div class="flex justify-between items-center mb-2">
                <div class="text-sm text-gray-600 dark:text-gray-400">{{ $t('settings.statistics.summary.focusTime') }}</div>
                <div class="flex items-center gap-1" :class="getChangeColor(weeklyChanges.durationChange)">
                  <component :is="getChangeIcon(weeklyChanges.durationChange)" size="16" />
                  <span class="text-xs font-medium">{{ formatChange(weeklyChanges.durationChange) }}</span>
                </div>
              </div>

              <div class="flex justify-between items-end">
                <div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">{{ $t('settings.statistics.summary.thisWeek') }}</div>
                  <div class="text-lg font-bold">{{ formatDuration(thisWeekData.totalDuration) }}</div>
                </div>

                <div class="text-right">
                  <div class="text-xs text-gray-500 dark:text-gray-400">{{ $t('settings.statistics.summary.lastWeek') }}</div>
                  <div class="text-base text-gray-600 dark:text-gray-400">{{ formatDuration(lastWeekData.totalDuration) }}</div>
                </div>
              </div>
            </div>

            <!-- 专注次数对比 -->
            <div class="comparison-item p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div class="flex justify-between items-center mb-2">
                <div class="text-sm text-gray-600 dark:text-gray-400">{{ $t('settings.statistics.summary.sessions') }}</div>
                <div class="flex items-center gap-1" :class="getChangeColor(weeklyChanges.sessionsChange)">
                  <component :is="getChangeIcon(weeklyChanges.sessionsChange)" size="16" />
                  <span class="text-xs font-medium">{{ formatChange(weeklyChanges.sessionsChange) }}</span>
                </div>
              </div>

              <div class="flex justify-between items-end">
                <div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">{{ $t('settings.statistics.summary.thisWeek') }}</div>
                  <div class="text-lg font-bold">{{ thisWeekData.completedSessions }} / {{ thisWeekData.totalSessions }}</div>
                </div>

                <div class="text-right">
                  <div class="text-xs text-gray-500 dark:text-gray-400">{{ $t('settings.statistics.summary.lastWeek') }}</div>
                  <div class="text-base text-gray-600 dark:text-gray-400">{{ lastWeekData.completedSessions }} / {{ lastWeekData.totalSessions }}</div>
                </div>
              </div>
            </div>

            <!-- 完成率对比 -->
            <div class="comparison-item p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div class="flex justify-between items-center mb-2">
                <div class="text-sm text-gray-600 dark:text-gray-400">{{ $t('settings.statistics.summary.completion') }}</div>
                <div class="flex items-center gap-1" :class="getChangeColor(weeklyChanges.completionRateChange)">
                  <component :is="getChangeIcon(weeklyChanges.completionRateChange)" size="16" />
                  <span class="text-xs font-medium">{{ formatChange(weeklyChanges.completionRateChange) }}</span>
                </div>
              </div>

              <div class="flex justify-between items-end">
                <div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">{{ $t('settings.statistics.summary.thisWeek') }}</div>
                  <div class="text-lg font-bold">{{ formatPercentage(thisWeekData.completionRate) }}</div>
                </div>

                <div class="text-right">
                  <div class="text-xs text-gray-500 dark:text-gray-400">{{ $t('settings.statistics.summary.lastWeek') }}</div>
                  <div class="text-base text-gray-600 dark:text-gray-400">{{ formatPercentage(lastWeekData.completionRate) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="no-data-message p-6 text-center bg-surface-light dark:bg-surface-dark rounded-lg">
      <p>{{ $t('settings.statistics.noDataMessage') }}</p>
    </div>
  </div>
</template>

<style scoped>
.focus-summary {
  @apply w-full;
}

.no-data-message {
  @apply text-gray-500 dark:text-gray-400;
}
</style>
