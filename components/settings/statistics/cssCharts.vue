<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFocusStats } from '~/stores/focusStats'

const props = defineProps({
  selectedRange: {
    type: String,
    required: true
  }
})

const { t } = useI18n()
const focusStatsStore = useFocusStats()

// 格式化日期
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString()
}

// 格式化月份
const formatMonth = (monthStr: string): string => {
  const date = new Date(monthStr + '-01')
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short' })
}

// 格式化周
const formatWeek = (weekStartStr: string): string => {
  const startDate = new Date(weekStartStr)
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 6)
  
  return `${startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
}

// 根据选择的时间范围获取统计数据
const chartData = computed(() => {
  switch (props.selectedRange) {
    case 'week':
      return {
        labels: focusStatsStore.recentDailyStats.map(day => formatDate(day.date)),
        durations: focusStatsStore.recentDailyStats.map(day => Math.round(day.workDuration / (1000 * 60))), // 转换为分钟
        counts: focusStatsStore.recentDailyStats.map(day => day.workCount),
        completionRates: focusStatsStore.recentDailyStats.map(day => 
          day.workCount > 0 ? day.completedCount / day.workCount : 0
        )
      }
    case 'month':
      return {
        labels: focusStatsStore.recentWeeklyStats.map(week => formatWeek(week.weekStart)),
        durations: focusStatsStore.recentWeeklyStats.map(week => Math.round(week.workDuration / (1000 * 60))),
        counts: focusStatsStore.recentWeeklyStats.map(week => week.workCount),
        completionRates: focusStatsStore.recentWeeklyStats.map(week => 
          week.workCount > 0 ? week.completedCount / week.workCount : 0
        )
      }
    case 'year':
      return {
        labels: focusStatsStore.recentMonthlyStats.map(month => formatMonth(month.month)),
        durations: focusStatsStore.recentMonthlyStats.map(month => Math.round(month.workDuration / (1000 * 60))),
        counts: focusStatsStore.recentMonthlyStats.map(month => month.workCount),
        completionRates: focusStatsStore.recentMonthlyStats.map(month => 
          month.workCount > 0 ? month.completedCount / month.workCount : 0
        )
      }
    default:
      return {
        labels: focusStatsStore.dailyStats.slice(-7).map(day => formatDate(day.date)),
        durations: focusStatsStore.dailyStats.slice(-7).map(day => Math.round(day.workDuration / (1000 * 60))),
        counts: focusStatsStore.dailyStats.slice(-7).map(day => day.workCount),
        completionRates: focusStatsStore.dailyStats.slice(-7).map(day => 
          day.workCount > 0 ? day.completedCount / day.workCount : 0
        )
      }
  }
})

// 获取每小时专注分布数据
const hourlyDistributionData = computed(() => {
  // 初始化24小时的数组
  const hourlyData = Array(24).fill(0)
  
  // 统计每小时的专注时长
  focusStatsStore.sessions.forEach(session => {
    if (session.type === 'work') {
      const hour = new Date(session.startTime).getHours()
      hourlyData[hour] += session.duration / (1000 * 60) // 转换为分钟
    }
  })
  
  return hourlyData
})

// 计算最大值，用于图表缩放
const maxDuration = computed(() => {
  if (chartData.value.durations.length === 0) return 100
  return Math.max(...chartData.value.durations) || 100
})

const maxCount = computed(() => {
  if (chartData.value.counts.length === 0) return 10
  return Math.max(...chartData.value.counts) || 10
})

const maxHourlyDuration = computed(() => {
  if (hourlyDistributionData.value.length === 0) return 100
  return Math.max(...hourlyDistributionData.value) || 100
})

// 检查是否有数据
const hasData = computed(() => {
  return chartData.value.labels.length > 0
})

// 格式化百分比
const formatPercentage = (value: number): string => {
  return `${Math.round(value * 100)}%`
}
</script>

<template>
  <div class="css-charts">
    <div v-if="hasData">
      <!-- 专注时长趋势图 -->
      <div class="chart-container mb-6">
        <h3 class="text-lg font-medium mb-2">{{ $t('settings.statistics.charts.focusTrend') }}</h3>
        <div class="chart-wrapper bg-surface-light dark:bg-surface-dark p-4 rounded-lg">
          <div class="chart-grid">
            <div class="chart-y-axis">
              <div class="chart-y-label">{{ $t('settings.statistics.charts.durationMinutes') }}</div>
              <div class="chart-y-ticks">
                <div class="chart-y-tick">{{ maxDuration }}</div>
                <div class="chart-y-tick">{{ Math.round(maxDuration * 0.75) }}</div>
                <div class="chart-y-tick">{{ Math.round(maxDuration * 0.5) }}</div>
                <div class="chart-y-tick">{{ Math.round(maxDuration * 0.25) }}</div>
                <div class="chart-y-tick">0</div>
              </div>
            </div>
            <div class="chart-bars">
              <div 
                v-for="(duration, index) in chartData.durations" 
                :key="index"
                class="chart-bar-group"
              >
                <div class="chart-bar-container">
                  <div 
                    class="chart-bar bg-primary dark:bg-primary-dark"
                    :style="{ height: `${(duration / maxDuration) * 100}%` }"
                  ></div>
                </div>
                <div class="chart-x-label">{{ chartData.labels[index] }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 专注分布热力图 -->
      <div class="chart-container mb-6">
        <h3 class="text-lg font-medium mb-2">{{ $t('settings.statistics.charts.hourlyDistribution') }}</h3>
        <div class="chart-wrapper bg-surface-light dark:bg-surface-dark p-4 rounded-lg">
          <div class="chart-grid">
            <div class="chart-y-axis">
              <div class="chart-y-label">{{ $t('settings.statistics.charts.durationMinutes') }}</div>
              <div class="chart-y-ticks">
                <div class="chart-y-tick">{{ maxHourlyDuration }}</div>
                <div class="chart-y-tick">{{ Math.round(maxHourlyDuration * 0.75) }}</div>
                <div class="chart-y-tick">{{ Math.round(maxHourlyDuration * 0.5) }}</div>
                <div class="chart-y-tick">{{ Math.round(maxHourlyDuration * 0.25) }}</div>
                <div class="chart-y-tick">0</div>
              </div>
            </div>
            <div class="chart-bars">
              <div 
                v-for="(duration, hour) in hourlyDistributionData" 
                :key="hour"
                class="chart-bar-group"
              >
                <div class="chart-bar-container">
                  <div 
                    class="chart-bar bg-amber-500 dark:bg-amber-400"
                    :style="{ height: `${(duration / maxHourlyDuration) * 100}%` }"
                  ></div>
                </div>
                <div class="chart-x-label">{{ hour }}:00</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 专注完成率图表 -->
      <div class="chart-container mb-6">
        <h3 class="text-lg font-medium mb-2">{{ $t('settings.statistics.charts.completionRate') }}</h3>
        <div class="chart-wrapper bg-surface-light dark:bg-surface-dark p-4 rounded-lg">
          <div class="completion-rates">
            <div 
              v-for="(rate, index) in chartData.completionRates" 
              :key="index"
              class="completion-rate-item"
            >
              <div class="completion-rate-label">{{ chartData.labels[index] }}</div>
              <div class="completion-rate-bar-container">
                <div 
                  class="completion-rate-bar bg-green-500 dark:bg-green-400"
                  :style="{ width: `${rate * 100}%` }"
                ></div>
              </div>
              <div class="completion-rate-value">{{ formatPercentage(rate) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="no-data-message p-6 text-center">
      <p>{{ $t('settings.statistics.noDataMessage') }}</p>
    </div>
  </div>
</template>

<style scoped>
.css-charts {
  @apply w-full;
}

.chart-wrapper {
  @apply w-full h-64;
}

.chart-grid {
  @apply flex h-full;
}

.chart-y-axis {
  @apply w-16 flex flex-col justify-between pr-2;
}

.chart-y-label {
  @apply text-xs text-gray-500 dark:text-gray-400 mb-2 text-center;
}

.chart-y-ticks {
  @apply flex-1 flex flex-col justify-between;
}

.chart-y-tick {
  @apply text-xs text-gray-500 dark:text-gray-400 text-right;
}

.chart-bars {
  @apply flex-1 flex items-end justify-between;
}

.chart-bar-group {
  @apply flex flex-col items-center w-full;
}

.chart-bar-container {
  @apply w-full h-[calc(100%-20px)] flex items-end justify-center px-1;
}

.chart-bar {
  @apply w-full rounded-t-sm transition-all duration-300;
  min-height: 2px;
}

.chart-x-label {
  @apply text-xs text-gray-500 dark:text-gray-400 mt-1 truncate text-center w-full;
}

.completion-rates {
  @apply flex flex-col h-full justify-between;
}

.completion-rate-item {
  @apply flex items-center mb-2;
}

.completion-rate-label {
  @apply text-xs text-gray-500 dark:text-gray-400 w-20 truncate;
}

.completion-rate-bar-container {
  @apply flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded-full mx-2;
}

.completion-rate-bar {
  @apply h-full rounded-full transition-all duration-300;
}

.completion-rate-value {
  @apply text-xs text-gray-500 dark:text-gray-400 w-12 text-right;
}

.no-data-message {
  @apply text-gray-500 dark:text-gray-400;
}
</style>
