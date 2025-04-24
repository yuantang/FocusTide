<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFocusStats } from '~/stores/focusStats'

const { t } = useI18n()
const focusStatsStore = useFocusStats()

// 获取一周专注分布（按星期几）
const weekdayDistribution = computed(() => {
  return focusStatsStore.weekdayDistribution
})

// 获取每小时专注分布
const hourlyDistribution = computed(() => {
  return focusStatsStore.hourlyDistribution
})

// 生成热力图数据
const heatmapData = computed(() => {
  // 创建7x24的二维数组（7天 x 24小时）
  const data: number[][] = Array(7).fill(0).map(() => Array(24).fill(0))

  // 填充数据
  focusStatsStore.sessions.forEach(session => {
    if (session.type === 'work') {
      const date = new Date(session.startTime)
      const day = date.getDay() // 0-6，0表示星期日
      const hour = date.getHours() // 0-23

      // 增加该时段的计数
      data[day][hour] += 1
    }
  })

  return data
})

// 获取热力图中的最大值，用于计算颜色强度
const maxValue = computed(() => {
  if (heatmapData.value.length === 0) return 1

  let max = 0
  heatmapData.value.forEach(row => {
    const rowMax = Math.max(...row)
    if (rowMax > max) max = rowMax
  })

  return max || 1 // 避免除以零
})

// 获取单元格的颜色
const getCellColor = (value: number) => {
  // 计算颜色强度（0-1）
  const intensity = value / maxValue.value

  if (intensity === 0) {
    return 'bg-gray-100 dark:bg-gray-800'
  } else if (intensity < 0.2) {
    return 'bg-green-100 dark:bg-green-900'
  } else if (intensity < 0.4) {
    return 'bg-green-200 dark:bg-green-800'
  } else if (intensity < 0.6) {
    return 'bg-green-300 dark:bg-green-700'
  } else if (intensity < 0.8) {
    return 'bg-green-400 dark:bg-green-600'
  } else {
    return 'bg-green-500 dark:bg-green-500'
  }
}

// 获取星期几的标签
const getDayLabel = (day: number) => {
  const days = [
    t('settings.values.statistics.days.sunday'),
    t('settings.values.statistics.days.monday'),
    t('settings.values.statistics.days.tuesday'),
    t('settings.values.statistics.days.wednesday'),
    t('settings.values.statistics.days.thursday'),
    t('settings.values.statistics.days.friday'),
    t('settings.values.statistics.days.saturday')
  ]

  return days[day]
}

// 获取小时的标签
const getHourLabel = (hour: number) => {
  return t('settings.values.statistics.heatmap.hourFormat', { hour })
}

// 检查是否有数据
const hasData = computed(() => {
  return focusStatsStore.sessions.length > 0
})
</script>

<template>
  <div class="focus-heatmap">
    <h3 class="text-lg font-medium mb-2">{{ $t('settings.values.statistics.heatmap.title') }}</h3>

    <div v-if="hasData" class="heatmap-container bg-surface-light dark:bg-surface-dark p-4 rounded-lg">
      <div class="heatmap-description text-sm text-gray-500 dark:text-gray-400 mb-4">
        {{ $t('settings.values.statistics.heatmap.description') }}
      </div>

      <!-- 热力图 -->
      <div class="heatmap-grid">
        <!-- 小时标签（顶部） -->
        <div class="hour-labels">
          <div class="hour-label-spacer"></div>
          <div
            v-for="hour in 24"
            :key="`hour-${hour-1}`"
            class="hour-label"
          >
            {{ (hour - 1) % 6 === 0 ? getHourLabel(hour - 1) : '' }}
          </div>
        </div>

        <!-- 热力图主体 -->
        <div class="heatmap-body">
          <div
            v-for="(dayData, dayIndex) in heatmapData"
            :key="`day-${dayIndex}`"
            class="heatmap-row"
          >
            <!-- 星期几标签 -->
            <div class="day-label">{{ getDayLabel(dayIndex) }}</div>

            <!-- 小时单元格 -->
            <div
              v-for="(value, hourIndex) in dayData"
              :key="`cell-${dayIndex}-${hourIndex}`"
              class="heatmap-cell"
              :class="getCellColor(value)"
              :title="$t('settings.values.statistics.heatmap.cellTitle', { day: getDayLabel(dayIndex), hour: getHourLabel(hourIndex), value, sessions: $t('settings.values.statistics.heatmap.sessions') })"
            >
              <span v-if="value > 0" class="cell-value">{{ value }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 图例 -->
      <div class="heatmap-legend mt-4">
        <div class="legend-title text-sm text-gray-500 dark:text-gray-400 mb-1">
          {{ $t('settings.values.statistics.heatmap.legend') }}
        </div>
        <div class="legend-items flex items-center">
          <div class="legend-item flex items-center mr-4">
            <div class="legend-color bg-gray-100 dark:bg-gray-800 w-4 h-4 mr-1"></div>
            <span class="text-xs">{{ $t('settings.values.statistics.heatmap.legend_0') }}</span>
          </div>
          <div class="legend-item flex items-center mr-4">
            <div class="legend-color bg-green-100 dark:bg-green-900 w-4 h-4 mr-1"></div>
            <span class="text-xs">{{ $t('settings.values.statistics.heatmap.legend_1_2') }}</span>
          </div>
          <div class="legend-item flex items-center mr-4">
            <div class="legend-color bg-green-200 dark:bg-green-800 w-4 h-4 mr-1"></div>
            <span class="text-xs">{{ $t('settings.values.statistics.heatmap.legend_3_4') }}</span>
          </div>
          <div class="legend-item flex items-center mr-4">
            <div class="legend-color bg-green-300 dark:bg-green-700 w-4 h-4 mr-1"></div>
            <span class="text-xs">{{ $t('settings.values.statistics.heatmap.legend_5_6') }}</span>
          </div>
          <div class="legend-item flex items-center mr-4">
            <div class="legend-color bg-green-400 dark:bg-green-600 w-4 h-4 mr-1"></div>
            <span class="text-xs">{{ $t('settings.values.statistics.heatmap.legend_7_8') }}</span>
          </div>
          <div class="legend-item flex items-center">
            <div class="legend-color bg-green-500 dark:bg-green-500 w-4 h-4 mr-1"></div>
            <span class="text-xs">{{ $t('settings.values.statistics.heatmap.legend_9_plus') }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="no-data-message p-6 text-center bg-surface-light dark:bg-surface-dark rounded-lg">
      <p>{{ $t('settings.values.statistics.noDataMessage') }}</p>
    </div>
  </div>
</template>

<style scoped>
.focus-heatmap {
  @apply w-full;
}

.heatmap-grid {
  @apply overflow-x-auto;
}

.hour-labels {
  @apply flex text-xs text-gray-500 dark:text-gray-400 mb-1;
}

.hour-label-spacer {
  @apply w-16 flex-shrink-0;
}

.hour-label {
  @apply w-6 text-center flex-shrink-0;
}

.heatmap-body {
  @apply space-y-1;
}

.heatmap-row {
  @apply flex items-center;
}

.day-label {
  @apply w-16 text-xs text-gray-500 dark:text-gray-400 pr-2 flex-shrink-0;
}

.heatmap-cell {
  @apply w-6 h-6 flex items-center justify-center rounded-sm flex-shrink-0 text-xs font-medium transition-colors;
}

.cell-value {
  @apply text-gray-700 dark:text-gray-300;
}

.legend-color {
  @apply rounded-sm;
}

.no-data-message {
  @apply text-gray-500 dark:text-gray-400;
}
</style>
