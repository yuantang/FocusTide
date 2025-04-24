<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFocusStats } from '~/stores/focusStats'
import { IconArrowUpRight, IconArrowDownRight, IconMinus, IconInfoCircle } from '@tabler/icons-vue'

const { t } = useI18n()
const focusStatsStore = useFocusStats()

// 格式化日期
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString()
}

// 获取最近30天的专注数据
const recentMonthData = computed(() => {
  // 获取30天前的日期
  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(now.getDate() - 30)
  thirtyDaysAgo.setHours(0, 0, 0, 0)

  // 过滤最近30天的专注会话
  const recentSessions = focusStatsStore.sessions.filter(session => {
    const sessionDate = new Date(session.startTime)
    return sessionDate >= thirtyDaysAgo && session.type === 'work'
  })

  // 按日期分组
  const sessionsByDate = new Map()

  recentSessions.forEach(session => {
    const dateStr = session.startTime.split('T')[0]
    if (!sessionsByDate.has(dateStr)) {
      sessionsByDate.set(dateStr, {
        date: dateStr,
        sessions: [],
        totalDuration: 0,
        completedCount: 0,
        totalCount: 0
      })
    }

    const dateData = sessionsByDate.get(dateStr)
    dateData.sessions.push(session)
    dateData.totalDuration += session.duration
    if (session.completed) {
      dateData.completedCount += 1
    }
    dateData.totalCount += 1
  })

  // 转换为数组并排序
  return Array.from(sessionsByDate.values()).sort((a, b) => a.date.localeCompare(b.date))
})

// 计算专注时长趋势
const durationTrend = computed(() => {
  if (recentMonthData.value.length < 7) return 0

  // 计算最近7天的平均专注时长
  const recentDays = recentMonthData.value.slice(-7)
  const recentAvg = recentDays.reduce((sum, day) => sum + day.totalDuration, 0) / recentDays.length

  // 计算前7天的平均专注时长
  const previousDays = recentMonthData.value.slice(-14, -7)
  if (previousDays.length === 0) return 0

  const previousAvg = previousDays.reduce((sum, day) => sum + day.totalDuration, 0) / previousDays.length

  // 计算趋势变化
  return previousAvg > 0 ? (recentAvg - previousAvg) / previousAvg : recentAvg > 0 ? 1 : 0
})

// 计算专注次数趋势
const sessionsTrend = computed(() => {
  if (recentMonthData.value.length < 7) return 0

  // 计算最近7天的平均专注次数
  const recentDays = recentMonthData.value.slice(-7)
  const recentAvg = recentDays.reduce((sum, day) => sum + day.totalCount, 0) / recentDays.length

  // 计算前7天的平均专注次数
  const previousDays = recentMonthData.value.slice(-14, -7)
  if (previousDays.length === 0) return 0

  const previousAvg = previousDays.reduce((sum, day) => sum + day.totalCount, 0) / previousDays.length

  // 计算趋势变化
  return previousAvg > 0 ? (recentAvg - previousAvg) / previousAvg : recentAvg > 0 ? 1 : 0
})

// 计算完成率趋势
const completionTrend = computed(() => {
  if (recentMonthData.value.length < 7) return 0

  // 计算最近7天的平均完成率
  const recentDays = recentMonthData.value.slice(-7)
  const recentCompletedTotal = recentDays.reduce((sum, day) => sum + day.completedCount, 0)
  const recentTotal = recentDays.reduce((sum, day) => sum + day.totalCount, 0)
  const recentRate = recentTotal > 0 ? recentCompletedTotal / recentTotal : 0

  // 计算前7天的平均完成率
  const previousDays = recentMonthData.value.slice(-14, -7)
  if (previousDays.length === 0) return 0

  const previousCompletedTotal = previousDays.reduce((sum, day) => sum + day.completedCount, 0)
  const previousTotal = previousDays.reduce((sum, day) => sum + day.totalCount, 0)
  const previousRate = previousTotal > 0 ? previousCompletedTotal / previousTotal : 0

  // 计算趋势变化（这里使用百分点差异而不是百分比变化）
  return previousRate > 0 ? recentRate - previousRate : recentRate
})

// 获取趋势图标
const getTrendIcon = (trend: number) => {
  if (trend > 0.05) return IconArrowUpRight
  if (trend < -0.05) return IconArrowDownRight
  return IconMinus
}

// 获取趋势颜色
const getTrendColor = (trend: number, inverse: boolean = false) => {
  if (trend > 0.05) return inverse ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'
  if (trend < -0.05) return inverse ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'
  return 'text-gray-500 dark:text-gray-400'
}

// 格式化趋势变化
const formatTrend = (trend: number): string => {
  if (Math.abs(trend) < 0.05) return t('settings.values.statistics.trends.stable')

  const percentage = Math.abs(Math.round(trend * 100))

  if (trend > 0) {
    return t('settings.values.statistics.trends.increasing', { percentage })
  } else {
    return t('settings.values.statistics.trends.decreasing', { percentage })
  }
}

// 获取趋势描述
const getDurationTrendDesc = computed(() => {
  if (Math.abs(durationTrend.value) < 0.05) {
    return t('settings.values.statistics.trends.durationStable')
  } else if (durationTrend.value > 0) {
    return t('settings.values.statistics.trends.durationIncreasing')
  } else {
    return t('settings.values.statistics.trends.durationDecreasing')
  }
})

const getSessionsTrendDesc = computed(() => {
  if (Math.abs(sessionsTrend.value) < 0.05) {
    return t('settings.values.statistics.trends.sessionsStable')
  } else if (sessionsTrend.value > 0) {
    return t('settings.values.statistics.trends.sessionsIncreasing')
  } else {
    return t('settings.values.statistics.trends.sessionsDecreasing')
  }
})

const getCompletionTrendDesc = computed(() => {
  if (Math.abs(completionTrend.value) < 0.05) {
    return t('settings.values.statistics.trends.completionStable')
  } else if (completionTrend.value > 0) {
    return t('settings.values.statistics.trends.completionIncreasing')
  } else {
    return t('settings.values.statistics.trends.completionDecreasing')
  }
})

// 检查是否有足够的数据
const hasEnoughData = computed(() => {
  return recentMonthData.value.length >= 7
})

// 检查是否有数据
const hasData = computed(() => {
  return focusStatsStore.sessions.length > 0
})
</script>

<template>
  <div class="focus-trends">
    <h3 class="text-lg font-medium mb-2">{{ $t('settings.values.statistics.trends.title') }}</h3>

    <div v-if="hasData" class="trends-container">
      <div v-if="hasEnoughData" class="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm overflow-hidden mb-6">
        <div class="trends-header bg-primary/10 dark:bg-primary-dark/20 px-4 py-3">
          <h4 class="text-base font-medium flex items-center">
            {{ $t('settings.values.statistics.trends.recentTrends') }}
            <span class="text-xs text-gray-500 dark:text-gray-400 ml-2">{{ $t('settings.values.statistics.trends.last14days') }}</span>
          </h4>
        </div>

        <div class="trends-body p-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- 专注时长趋势 -->
            <div class="trend-card p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div class="flex justify-between items-start">
                <div class="text-sm font-medium">{{ $t('settings.values.statistics.trends.focusDuration') }}</div>
                <div class="flex items-center gap-1" :class="getTrendColor(durationTrend)">
                  <component :is="getTrendIcon(durationTrend)" size="18" />
                  <span class="text-sm font-medium">{{ formatTrend(durationTrend) }}</span>
                </div>
              </div>

              <div class="mt-3 text-sm text-gray-600 dark:text-gray-400">
                {{ getDurationTrendDesc }}
              </div>
            </div>

            <!-- 专注次数趋势 -->
            <div class="trend-card p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div class="flex justify-between items-start">
                <div class="text-sm font-medium">{{ $t('settings.values.statistics.trends.focusSessions') }}</div>
                <div class="flex items-center gap-1" :class="getTrendColor(sessionsTrend)">
                  <component :is="getTrendIcon(sessionsTrend)" size="18" />
                  <span class="text-sm font-medium">{{ formatTrend(sessionsTrend) }}</span>
                </div>
              </div>

              <div class="mt-3 text-sm text-gray-600 dark:text-gray-400">
                {{ getSessionsTrendDesc }}
              </div>
            </div>

            <!-- 完成率趋势 -->
            <div class="trend-card p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div class="flex justify-between items-start">
                <div class="text-sm font-medium">{{ $t('settings.values.statistics.trends.completionRate') }}</div>
                <div class="flex items-center gap-1" :class="getTrendColor(completionTrend)">
                  <component :is="getTrendIcon(completionTrend)" size="18" />
                  <span class="text-sm font-medium">{{ formatTrend(completionTrend) }}</span>
                </div>
              </div>

              <div class="mt-3 text-sm text-gray-600 dark:text-gray-400">
                {{ getCompletionTrendDesc }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="not-enough-data p-6 text-center bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm">
        <div class="flex justify-center mb-2">
          <IconInfoCircle size="24" class="text-blue-500 dark:text-blue-400" />
        </div>
        <p class="text-gray-600 dark:text-gray-400">{{ $t('settings.values.statistics.trends.notEnoughData') }}</p>
      </div>
    </div>

    <div v-else class="no-data-message p-6 text-center bg-surface-light dark:bg-surface-dark rounded-lg">
      <p>{{ $t('settings.values.statistics.noDataMessage') }}</p>
    </div>
  </div>
</template>

<style scoped>
.focus-trends {
  @apply w-full;
}

.no-data-message, .not-enough-data {
  @apply text-gray-500 dark:text-gray-400;
}
</style>
