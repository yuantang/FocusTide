<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFocusStats } from '~/stores/focusStats'

const { t } = useI18n()
const focusStatsStore = useFocusStats()

// 获取一天中的专注分布（按小时）
const hourlyDistribution = computed(() => {
  return focusStatsStore.hourlyDistribution
})

// 获取一周中的专注分布（按星期几）
const weekdayDistribution = computed(() => {
  return focusStatsStore.weekdayDistribution
})

// 计算最大值，用于图表缩放
const maxHourlyValue = computed(() => {
  if (hourlyDistribution.value.length === 0) return 1
  return Math.max(...hourlyDistribution.value) || 1
})

const maxWeekdayValue = computed(() => {
  if (weekdayDistribution.value.length === 0) return 1
  return Math.max(...weekdayDistribution.value) || 1
})

// 获取小时标签
const getHourLabel = (hour: number): string => {
  return `${hour}:00`
}

// 获取星期几标签
const getDayLabel = (day: number): string => {
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

// 获取柱状图颜色
const getBarColor = (value: number, maxValue: number) => {
  const intensity = value / maxValue

  if (intensity < 0.2) {
    return 'bg-primary/20 dark:bg-primary-dark/20'
  } else if (intensity < 0.4) {
    return 'bg-primary/40 dark:bg-primary-dark/40'
  } else if (intensity < 0.6) {
    return 'bg-primary/60 dark:bg-primary-dark/60'
  } else if (intensity < 0.8) {
    return 'bg-primary/80 dark:bg-primary-dark/80'
  } else {
    return 'bg-primary dark:bg-primary-dark'
  }
}

// 获取最佳专注时段
const bestFocusHours = computed(() => {
  if (hourlyDistribution.value.length === 0) return []

  // 创建带索引的数组
  const hoursWithIndex = hourlyDistribution.value.map((value, index) => ({ value, index }))

  // 按值排序并获取前3个
  return hoursWithIndex
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)
    .map(item => item.index)
    .sort((a, b) => a - b) // 按小时顺序排序
})

// 获取最佳专注日
const bestFocusDays = computed(() => {
  if (weekdayDistribution.value.length === 0) return []

  // 创建带索引的数组
  const daysWithIndex = weekdayDistribution.value.map((value, index) => ({ value, index }))

  // 按值排序并获取前3个
  return daysWithIndex
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)
    .map(item => item.index)
    .sort((a, b) => a - b) // 按星期几顺序排序
})

// 检查是否有数据
const hasData = computed(() => {
  return focusStatsStore.sessions.length > 0
})
</script>

<template>
  <div class="focus-distribution">
    <h3 class="text-lg font-medium mb-2">分布分析</h3>

    <div v-if="hasData" class="distribution-container">
      <!-- 一天中的专注分布 -->
      <div class="daily-distribution bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm overflow-hidden mb-6">
        <div class="distribution-header bg-primary/10 dark:bg-primary-dark/20 px-4 py-3">
          <h4 class="text-base font-medium">日内分布</h4>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            一天中不同时段的专注分布情况
          </p>
        </div>

        <div class="distribution-body p-4">
          <!-- 最佳专注时段 -->
          <div class="best-times mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div class="text-sm font-medium mb-2">最佳专注时段</div>
            <div class="flex flex-wrap gap-2">
              <div
                v-for="hour in bestFocusHours"
                :key="`best-hour-${hour}`"
                class="px-3 py-1 bg-primary/10 dark:bg-primary-dark/20 text-primary dark:text-primary-dark rounded-full text-sm font-medium"
              >
                {{ getHourLabel(hour) }}
              </div>
            </div>
          </div>

          <!-- 小时分布图表 -->
          <div class="hourly-chart">
            <div class="flex h-40 items-end">
              <div
                v-for="(value, hour) in hourlyDistribution"
                :key="`hour-${hour}`"
                class="flex-1 flex flex-col items-center"
              >
                <div class="w-full px-0.5">
                  <div
                    :class="['rounded-t transition-all duration-300', getBarColor(value, maxHourlyValue)]"
                    :style="{ height: `${(value / maxHourlyValue) * 100}%` }"
                  ></div>
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {{ hour % 3 === 0 ? getHourLabel(hour) : '' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 一周中的专注分布 -->
      <div class="weekly-distribution bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm overflow-hidden mb-6">
        <div class="distribution-header bg-primary/10 dark:bg-primary-dark/20 px-4 py-3">
          <h4 class="text-base font-medium">周内分布</h4>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            一周中不同日期的专注分布情况
          </p>
        </div>

        <div class="distribution-body p-4">
          <!-- 最佳专注日 -->
          <div class="best-days mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div class="text-sm font-medium mb-2">最佳专注日</div>
            <div class="flex flex-wrap gap-2">
              <div
                v-for="day in bestFocusDays"
                :key="`best-day-${day}`"
                class="px-3 py-1 bg-primary/10 dark:bg-primary-dark/20 text-primary dark:text-primary-dark rounded-full text-sm font-medium"
              >
                {{ getDayLabel(day) }}
              </div>
            </div>
          </div>

          <!-- 星期分布图表 -->
          <div class="weekday-chart">
            <div class="flex h-40 items-end">
              <div
                v-for="(value, day) in weekdayDistribution"
                :key="`day-${day}`"
                class="flex-1 flex flex-col items-center"
              >
                <div class="w-full px-1">
                  <div
                    :class="['rounded-t transition-all duration-300', getBarColor(value, maxWeekdayValue)]"
                    :style="{ height: `${(value / maxWeekdayValue) * 100}%` }"
                  ></div>
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                  {{ getDayLabel(day).substring(0, 3) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="no-data-message p-6 text-center bg-surface-light dark:bg-surface-dark rounded-lg">
      <p>暂无数据，请先完成一次专注。</p>
    </div>
  </div>
</template>

<style scoped>
.focus-distribution {
  @apply w-full;
}

.no-data-message {
  @apply text-gray-500 dark:text-gray-400;
}
</style>
