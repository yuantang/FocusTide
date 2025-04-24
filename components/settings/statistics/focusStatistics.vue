<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFocusStats } from '~/stores/focusStats'
import { IconChartBar, IconChartLine, IconClock, IconCheckbox, IconTarget, IconBulb, IconDownload, IconFlame, IconMedal, IconStarFilled, IconLayoutGrid, IconChartAreaLine, IconChartDots, IconChartPie } from '@tabler/icons-vue'
import CssCharts from './cssCharts.vue'
import FocusExport from './focusExport.vue'
import FocusGoals from './focusGoals.vue'
import FocusSuggestions from './focusSuggestions.vue'
import FocusAchievements from './focusAchievements.vue'
import FocusRatings from './focusRatings.vue'
import FocusHeatmap from './focusHeatmap.vue'
import FocusSummary from './focusSummary.vue'
import FocusTrends from './focusTrends.vue'
import FocusDistribution from './focusDistribution.vue'

const { t, locale } = useI18n()
const focusStatsStore = useFocusStats()

// 活动标签
const activeTab = ref('overview')

// 时间范围选项
const timeRanges = computed(() => [
  { value: 'week', label: t('settings.statistics.timeRanges.week') },
  { value: 'month', label: t('settings.statistics.timeRanges.month') },
  { value: 'year', label: t('settings.statistics.timeRanges.year') },
  { value: 'all', label: t('settings.statistics.timeRanges.allTime') }
])

const selectedRange = ref('week')

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

// 检查是否有数据
const hasData = computed(() => {
  return focusStatsStore.sessions.length > 0
})

// 在组件挂载时计算统计数据
onMounted(() => {
  if (focusStatsStore.sessions.length > 0 && !focusStatsStore.lastCalculated) {
    focusStatsStore.calculateStats()
  }
})
</script>

<template>
  <div class="focus-statistics">
    <h2 class="text-xl font-bold mb-4">
      {{ $t('settings.statistics.title') }}
    </h2>

    <div v-if="hasData">
      <!-- 导航标签 -->
      <div class="stats-tabs mb-6">
        <!-- 移动端下拉菜单 -->
        <div class="md:hidden mb-4">
          <select
            v-model="activeTab"
            class="w-full p-2 rounded-lg bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-sm font-medium"
          >
            <option value="overview">{{ $t('settings.statistics.tabs.overview') }}</option>
            <option value="summary">{{ $t('settings.statistics.tabs.summary') }}</option>
            <option value="trends">{{ $t('settings.statistics.tabs.trends') }}</option>
            <option value="distribution">{{ $t('settings.statistics.tabs.distribution') }}</option>
            <option value="charts">{{ $t('settings.statistics.tabs.charts') }}</option>
            <option value="heatmap">{{ $t('settings.statistics.tabs.heatmap') }}</option>
            <option value="ratings">{{ $t('settings.statistics.tabs.ratings') }}</option>
            <option value="achievements">{{ $t('settings.statistics.tabs.achievements') }}</option>
            <option value="goals">{{ $t('settings.statistics.tabs.goals') }}</option>
            <option value="suggestions">{{ $t('settings.statistics.tabs.suggestions') }}</option>
            <option value="export">{{ $t('settings.statistics.tabs.export') }}</option>
          </select>
        </div>

        <!-- 桌面端标签导航 - 第一行 -->
        <div class="hidden md:grid grid-cols-5 gap-2 mb-3">
          <button
            class="py-2 px-3 rounded-lg font-medium text-sm transition-colors flex items-center justify-center"
            :class="{
              'bg-primary text-white dark:bg-primary-dark dark:text-white': activeTab === 'overview',
              'bg-surface-light dark:bg-surface-dark hover:bg-gray-100 dark:hover:bg-gray-800': activeTab !== 'overview'
            }"
            @click="activeTab = 'overview'"
          >
            <IconChartBar size="18" class="mr-1" />
            {{ $t('settings.statistics.tabs.overview') }}
          </button>

          <button
            class="py-2 px-3 rounded-lg font-medium text-sm transition-colors flex items-center justify-center"
            :class="{
              'bg-primary text-white dark:bg-primary-dark dark:text-white': activeTab === 'summary',
              'bg-surface-light dark:bg-surface-dark hover:bg-gray-100 dark:hover:bg-gray-800': activeTab !== 'summary'
            }"
            @click="activeTab = 'summary'"
          >
            <IconChartPie size="18" class="mr-1" />
            {{ $t('settings.statistics.tabs.summary') }}
          </button>

          <button
            class="py-2 px-3 rounded-lg font-medium text-sm transition-colors flex items-center justify-center"
            :class="{
              'bg-primary text-white dark:bg-primary-dark dark:text-white': activeTab === 'trends',
              'bg-surface-light dark:bg-surface-dark hover:bg-gray-100 dark:hover:bg-gray-800': activeTab !== 'trends'
            }"
            @click="activeTab = 'trends'"
          >
            <IconChartAreaLine size="18" class="mr-1" />
            {{ $t('settings.statistics.tabs.trends') }}
          </button>

          <button
            class="py-2 px-3 rounded-lg font-medium text-sm transition-colors flex items-center justify-center"
            :class="{
              'bg-primary text-white dark:bg-primary-dark dark:text-white': activeTab === 'distribution',
              'bg-surface-light dark:bg-surface-dark hover:bg-gray-100 dark:hover:bg-gray-800': activeTab !== 'distribution'
            }"
            @click="activeTab = 'distribution'"
          >
            <IconChartDots size="18" class="mr-1" />
            {{ $t('settings.statistics.tabs.distribution') }}
          </button>

          <button
            class="py-2 px-3 rounded-lg font-medium text-sm transition-colors flex items-center justify-center"
            :class="{
              'bg-primary text-white dark:bg-primary-dark dark:text-white': activeTab === 'charts',
              'bg-surface-light dark:bg-surface-dark hover:bg-gray-100 dark:hover:bg-gray-800': activeTab !== 'charts'
            }"
            @click="activeTab = 'charts'"
          >
            <IconChartLine size="18" class="mr-1" />
            {{ $t('settings.statistics.tabs.charts') }}
          </button>
        </div>

        <!-- 桌面端标签导航 - 第二行 -->
        <div class="hidden md:grid grid-cols-6 gap-2 mb-4">
          <button
            class="py-2 px-3 rounded-lg font-medium text-sm transition-colors flex items-center justify-center"
            :class="{
              'bg-primary text-white dark:bg-primary-dark dark:text-white': activeTab === 'heatmap',
              'bg-surface-light dark:bg-surface-dark hover:bg-gray-100 dark:hover:bg-gray-800': activeTab !== 'heatmap'
            }"
            @click="activeTab = 'heatmap'"
          >
            <IconLayoutGrid size="18" class="mr-1" />
            {{ $t('settings.statistics.tabs.heatmap') }}
          </button>

          <button
            class="py-2 px-3 rounded-lg font-medium text-sm transition-colors flex items-center justify-center"
            :class="{
              'bg-primary text-white dark:bg-primary-dark dark:text-white': activeTab === 'ratings',
              'bg-surface-light dark:bg-surface-dark hover:bg-gray-100 dark:hover:bg-gray-800': activeTab !== 'ratings'
            }"
            @click="activeTab = 'ratings'"
          >
            <IconStarFilled size="18" class="mr-1" />
            {{ $t('settings.statistics.tabs.ratings') }}
          </button>

          <button
            class="py-2 px-3 rounded-lg font-medium text-sm transition-colors flex items-center justify-center"
            :class="{
              'bg-primary text-white dark:bg-primary-dark dark:text-white': activeTab === 'achievements',
              'bg-surface-light dark:bg-surface-dark hover:bg-gray-100 dark:hover:bg-gray-800': activeTab !== 'achievements'
            }"
            @click="activeTab = 'achievements'"
          >
            <IconMedal size="18" class="mr-1" />
            {{ $t('settings.statistics.tabs.achievements') }}
          </button>

          <button
            class="py-2 px-3 rounded-lg font-medium text-sm transition-colors flex items-center justify-center"
            :class="{
              'bg-primary text-white dark:bg-primary-dark dark:text-white': activeTab === 'goals',
              'bg-surface-light dark:bg-surface-dark hover:bg-gray-100 dark:hover:bg-gray-800': activeTab !== 'goals'
            }"
            @click="activeTab = 'goals'"
          >
            <IconTarget size="18" class="mr-1" />
            {{ $t('settings.statistics.tabs.goals') }}
          </button>

          <button
            class="py-2 px-3 rounded-lg font-medium text-sm transition-colors flex items-center justify-center"
            :class="{
              'bg-primary text-white dark:bg-primary-dark dark:text-white': activeTab === 'suggestions',
              'bg-surface-light dark:bg-surface-dark hover:bg-gray-100 dark:hover:bg-gray-800': activeTab !== 'suggestions'
            }"
            @click="activeTab = 'suggestions'"
          >
            <IconBulb size="18" class="mr-1" />
            {{ $t('settings.statistics.tabs.suggestions') }}
          </button>

          <button
            class="py-2 px-3 rounded-lg font-medium text-sm transition-colors flex items-center justify-center"
            :class="{
              'bg-primary text-white dark:bg-primary-dark dark:text-white': activeTab === 'export',
              'bg-surface-light dark:bg-surface-dark hover:bg-gray-100 dark:hover:bg-gray-800': activeTab !== 'export'
            }"
            @click="activeTab = 'export'"
          >
            <IconDownload size="18" class="mr-1" />
            {{ $t('settings.statistics.tabs.export') }}
          </button>
        </div>
      </div>

      <!-- 总览标签页 -->
      <div v-if="activeTab === 'overview'" class="tab-content">
        <!-- 总览数据 -->
        <div class="stats-overview grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div class="stat-card bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm overflow-hidden">
            <div class="stat-header bg-primary/10 dark:bg-primary-dark/20 px-3 py-2 flex items-center">
              <div class="stat-icon text-primary dark:text-primary-dark">
                <IconClock size="20" />
              </div>
              <div class="stat-label ml-2 text-sm font-medium">{{ $t('settings.statistics.totalFocusTime') }}</div>
            </div>
            <div class="stat-body p-3 text-center">
              <div class="stat-value text-2xl font-bold">{{ formatDuration(focusStatsStore.totalFocusDuration) }}</div>
            </div>
          </div>

          <div class="stat-card bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm overflow-hidden">
            <div class="stat-header bg-primary/10 dark:bg-primary-dark/20 px-3 py-2 flex items-center">
              <div class="stat-icon text-primary dark:text-primary-dark">
                <IconChartBar size="20" />
              </div>
              <div class="stat-label ml-2 text-sm font-medium">{{ $t('settings.statistics.totalSessions') }}</div>
            </div>
            <div class="stat-body p-3 text-center">
              <div class="stat-value text-2xl font-bold">{{ focusStatsStore.totalFocusSessions }}</div>
            </div>
          </div>

          <div class="stat-card bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm overflow-hidden">
            <div class="stat-header bg-primary/10 dark:bg-primary-dark/20 px-3 py-2 flex items-center">
              <div class="stat-icon text-primary dark:text-primary-dark">
                <IconCheckbox size="20" />
              </div>
              <div class="stat-label ml-2 text-sm font-medium">{{ $t('settings.statistics.completedSessions') }}</div>
            </div>
            <div class="stat-body p-3 text-center">
              <div class="stat-value text-2xl font-bold">{{ focusStatsStore.completedFocusSessions }}</div>
            </div>
          </div>

          <div class="stat-card bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm overflow-hidden">
            <div class="stat-header bg-primary/10 dark:bg-primary-dark/20 px-3 py-2 flex items-center">
              <div class="stat-icon text-primary dark:text-primary-dark">
                <IconChartLine size="20" />
              </div>
              <div class="stat-label ml-2 text-sm font-medium">{{ $t('settings.statistics.completionRate') }}</div>
            </div>
            <div class="stat-body p-3 text-center">
              <div class="stat-value text-2xl font-bold">{{ formatPercentage(focusStatsStore.focusCompletionRate) }}</div>
            </div>
          </div>
        </div>

        <!-- 连续专注天数 -->
        <div class="streak-card bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm overflow-hidden mb-6">
          <div class="streak-header bg-amber-500/10 dark:bg-amber-400/20 px-4 py-3 flex items-center">
            <div class="streak-icon text-amber-500 dark:text-amber-400">
              <IconFlame size="24" />
            </div>
            <div class="ml-2">
              <h3 class="text-lg font-medium">{{ $t('settings.statistics.streak') }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">{{ $t('settings.statistics.currentStreak') }}</p>
            </div>
            <div class="ml-auto">
              <div class="text-3xl font-bold text-amber-500 dark:text-amber-400">{{ focusStatsStore.streakDays }}</div>
              <div class="text-xs text-right text-gray-600 dark:text-gray-400">{{ $t('settings.statistics.streakDays') }}</div>
            </div>
          </div>
        </div>

        <!-- 专注习惯分析 -->
        <div class="focus-insights p-4 rounded-xl shadow-sm bg-surface-light dark:bg-surface-dark mb-6">
          <h3 class="text-lg font-medium mb-3 flex items-center">
            <IconBulb size="20" class="text-primary dark:text-primary-dark mr-2" />
            {{ $t('settings.statistics.insights') }}
          </h3>
          <ul class="space-y-3 pl-2">
            <li class="flex items-start gap-3">
              <div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 dark:bg-primary-dark/20 flex items-center justify-center text-primary dark:text-primary-dark">
                <IconClock size="18" />
              </div>
              <div>
                <div class="font-medium">{{ $t('settings.statistics.mostProductiveTime', { time: formatHour(focusStatsStore.mostProductiveHour) }) }}</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">{{ $t('settings.statistics.mostProductiveTimeDesc') }}</div>
              </div>
            </li>
            <li class="flex items-start gap-3">
              <div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 dark:bg-primary-dark/20 flex items-center justify-center text-primary dark:text-primary-dark">
                <IconChartBar size="18" />
              </div>
              <div>
                <div class="font-medium">{{ $t('settings.statistics.mostProductiveDay', { day: formatDay(focusStatsStore.mostProductiveDay) }) }}</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">{{ $t('settings.statistics.mostProductiveDayDesc') }}</div>
              </div>
            </li>
            <li class="flex items-start gap-3">
              <div class="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 dark:bg-primary-dark/20 flex items-center justify-center text-primary dark:text-primary-dark">
                <IconClock size="18" />
              </div>
              <div>
                <div class="font-medium">{{ $t('settings.statistics.averageFocusTime', { time: formatDuration(focusStatsStore.averageFocusDuration) }) }}</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">{{ $t('settings.statistics.averageFocusTimeDesc') }}</div>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- 图表标签页 -->
      <div v-else-if="activeTab === 'charts'" class="tab-content">
        <!-- 图表卡片 -->
        <div class="chart-card bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm overflow-hidden mb-6">
          <div class="chart-header bg-primary/10 dark:bg-primary-dark/20 px-4 py-3">
            <h3 class="text-lg font-medium flex items-center">
              <IconChartLine size="20" class="text-primary dark:text-primary-dark mr-2" />
              {{ $t('settings.statistics.charts.title') }}
            </h3>

            <!-- 时间范围选择器 -->
            <div class="time-range-selector flex flex-wrap gap-2 mt-3">
              <button
                v-for="range in timeRanges.value"
                :key="range.value"
                class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                :class="{
                  'bg-primary text-white dark:bg-primary-dark dark:text-white': selectedRange === range.value,
                  'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700': selectedRange !== range.value
                }"
                @click="selectedRange = range.value"
              >
                {{ range.label }}
              </button>
            </div>
          </div>

          <div class="chart-body p-4">
            <!-- 图表组件 -->
            <CssCharts :selectedRange="selectedRange" />
          </div>
        </div>
      </div>

      <!-- 目标标签页 -->
      <div v-else-if="activeTab === 'goals'" class="tab-content">
        <div class="goals-card bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm overflow-hidden mb-6">
          <div class="goals-header bg-green-500/10 dark:bg-green-400/20 px-4 py-3">
            <h3 class="text-lg font-medium flex items-center">
              <IconTarget size="20" class="text-green-500 dark:text-green-400 mr-2" />
              {{ $t('settings.statistics.goals.title') }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {{ $t('settings.statistics.goals.description') }}
            </p>
          </div>

          <div class="goals-body p-4">
            <FocusGoals />
          </div>
        </div>
      </div>

      <!-- 建议标签页 -->
      <div v-else-if="activeTab === 'suggestions'" class="tab-content">
        <div class="suggestions-card bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm overflow-hidden mb-6">
          <div class="suggestions-header bg-blue-500/10 dark:bg-blue-400/20 px-4 py-3">
            <h3 class="text-lg font-medium flex items-center">
              <IconBulb size="20" class="text-blue-500 dark:text-blue-400 mr-2" />
              {{ $t('settings.statistics.suggestions.title') }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {{ $t('settings.statistics.suggestions.description') }}
            </p>
          </div>

          <div class="suggestions-body p-4">
            <FocusSuggestions />
          </div>
        </div>
      </div>

      <!-- 数据摘要标签页 -->
      <div v-else-if="activeTab === 'summary'" class="tab-content">
        <FocusSummary />
      </div>

      <!-- 数据趋势标签页 -->
      <div v-else-if="activeTab === 'trends'" class="tab-content">
        <FocusTrends />
      </div>

      <!-- 时间分布标签页 -->
      <div v-else-if="activeTab === 'distribution'" class="tab-content">
        <FocusDistribution />
      </div>

      <!-- 热力图标签页 -->
      <div v-else-if="activeTab === 'heatmap'" class="tab-content">
        <div class="heatmap-card bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm overflow-hidden mb-6">
          <div class="heatmap-header bg-primary/10 dark:bg-primary-dark/20 px-4 py-3">
            <h3 class="text-lg font-medium flex items-center">
              <IconLayoutGrid size="20" class="text-primary dark:text-primary-dark mr-2" />
              {{ $t('settings.statistics.heatmap.title') }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {{ $t('settings.statistics.heatmap.description') }}
            </p>
          </div>

          <div class="heatmap-body p-4">
            <FocusHeatmap />
          </div>
        </div>
      </div>

      <!-- 评分标签页 -->
      <div v-else-if="activeTab === 'ratings'" class="tab-content">
        <div class="ratings-card bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm overflow-hidden mb-6">
          <div class="ratings-header bg-primary/10 dark:bg-primary-dark/20 px-4 py-3">
            <h3 class="text-lg font-medium flex items-center">
              <IconStarFilled size="20" class="text-primary dark:text-primary-dark mr-2" />
              {{ $t('settings.statistics.ratings.title') }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {{ $t('settings.statistics.ratings.description') }}
            </p>
          </div>

          <div class="ratings-body p-4">
            <FocusRatings />
          </div>
        </div>
      </div>

      <!-- 成就标签页 -->
      <div v-else-if="activeTab === 'achievements'" class="tab-content">
        <div class="achievements-card bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm overflow-hidden mb-6">
          <div class="achievements-header bg-amber-500/10 dark:bg-amber-400/20 px-4 py-3">
            <h3 class="text-lg font-medium flex items-center">
              <IconMedal size="20" class="text-amber-500 dark:text-amber-400 mr-2" />
              {{ $t('settings.statistics.achievements.title') }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {{ $t('settings.statistics.achievements.description') }}
            </p>
          </div>

          <div class="achievements-body p-4">
            <FocusAchievements />
          </div>
        </div>
      </div>

      <!-- 导出标签页 -->
      <div v-else-if="activeTab === 'export'" class="tab-content">
        <div class="export-card bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm overflow-hidden mb-6">
          <div class="export-header bg-gray-500/10 dark:bg-gray-400/20 px-4 py-3">
            <h3 class="text-lg font-medium flex items-center">
              <IconDownload size="20" class="text-gray-500 dark:text-gray-400 mr-2" />
              {{ $t('settings.statistics.export.title') }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {{ $t('settings.statistics.export.description') }}
            </p>
          </div>

          <div class="export-body p-4">
            <FocusExport />
          </div>
        </div>
      </div>
    </div>

    <div v-else class="no-data-message p-8 text-center bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm">
      <div class="flex justify-center mb-4">
        <div class="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary-dark/20 flex items-center justify-center text-primary dark:text-primary-dark">
          <IconChartBar size="32" />
        </div>
      </div>
      <h3 class="text-lg font-medium mb-2">{{ $t('settings.statistics.noData') }}</h3>
      <p class="text-gray-600 dark:text-gray-400 max-w-md mx-auto">{{ $t('settings.statistics.noDataMessage') }}</p>
    </div>
  </div>
</template>

<style scoped>
.focus-statistics {
  @apply w-full;
}

.tab-content {
  @apply animate-fadeIn;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}
</style>
