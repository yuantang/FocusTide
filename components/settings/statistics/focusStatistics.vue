<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFocusStats } from '~/stores/focusStats'
import { IconChartBar, IconChartLine, IconClock, IconCheckbox, IconTarget, IconBulb, IconDownload, IconFlame, IconMedal, IconStarFilled, IconLayoutGrid, IconChartAreaLine, IconChartDots, IconChartPie, IconDashboard, IconTools, IconChevronDown } from '@tabler/icons-vue'
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

const { t } = useI18n()
const focusStatsStore = useFocusStats()

// 活动标签
const activeTab = ref('overview')
// 活动分类
const activeCategory = ref('overview')

// 时间范围选项
const timeRanges = computed(() => [
  { value: 'week', label: t('settings.values.statistics.timeRanges.week') },
  { value: 'month', label: t('settings.values.statistics.timeRanges.month') },
  { value: 'year', label: t('settings.values.statistics.timeRanges.year') },
  { value: 'all', label: t('settings.values.statistics.timeRanges.allTime') }
])

const selectedRange = ref('week')

// 格式化时长
const formatDuration = (ms: number): string => {
  const hours = Math.floor(ms / (1000 * 60 * 60))
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 0) {
    return `${hours}${t('settings.values.statistics.hours')} ${minutes}${t('settings.values.statistics.minutes')}`
  } else {
    return `${minutes}${t('settings.values.statistics.minutes')}`
  }
}

// 格式化百分比
const formatPercentage = (value: number): string => {
  return `${Math.round(value * 100)}%`
}

// 格式化小时
const formatHour = (hour: number | null): string => {
  if (hour === null) return t('settings.values.statistics.noData')
  return `${hour}:00 - ${(hour + 1) % 24}:00`
}

// 格式化星期几
const formatDay = (day: number | null): string => {
  if (day === null) return t('settings.values.statistics.noData')

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

// 监听标签页变化，自动设置对应的分类
watch(activeTab, (newTab) => {
  if (['overview', 'summary'].includes(newTab)) {
    activeCategory.value = 'overview'
  } else if (['trends', 'distribution', 'heatmap', 'charts'].includes(newTab)) {
    activeCategory.value = 'analysis'
  } else if (['ratings', 'achievements', 'goals'].includes(newTab)) {
    activeCategory.value = 'achievements'
  } else if (['suggestions', 'export'].includes(newTab)) {
    activeCategory.value = 'tools'
  }
})

// 监听分类变化，自动选择该分类的第一个标签页
watch(activeCategory, (newCategory) => {
  if (newCategory === 'overview' && !['overview', 'summary'].includes(activeTab.value)) {
    activeTab.value = 'overview'
  } else if (newCategory === 'analysis' && !['trends', 'distribution', 'heatmap', 'charts'].includes(activeTab.value)) {
    activeTab.value = 'trends'
  } else if (newCategory === 'achievements' && !['ratings', 'achievements', 'goals'].includes(activeTab.value)) {
    activeTab.value = 'ratings'
  } else if (newCategory === 'tools' && !['suggestions', 'export'].includes(activeTab.value)) {
    activeTab.value = 'suggestions'
  }
})
</script>

<template>
  <div class="focus-statistics">
    <h2 class="text-xl font-bold mb-4">
      {{ $t('settings.values.statistics.title') }}
    </h2>

    <div v-if="hasData">
      <!-- 导航标签 -->
      <div class="stats-tabs mb-6">
        <!-- 移动端导航 -->
        <div class="md:hidden mb-5">
          <!-- 分类选择器 -->
          <div class="category-selector mb-3 flex overflow-x-auto py-1 no-scrollbar">
            <button
              v-for="category in ['overview', 'analysis', 'achievements', 'tools']"
              :key="category"
              class="category-btn flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium mr-2 transition-colors"
              :class="{
                'bg-primary text-white dark:bg-primary-dark': activeCategory === category,
                'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300': activeCategory !== category
              }"
              @click="activeCategory = category"
            >
              <span v-if="category === 'overview'">{{ $t('settings.values.statistics.categories.overview') }}</span>
              <span v-else-if="category === 'analysis'">{{ $t('settings.values.statistics.categories.analysis') }}</span>
              <span v-else-if="category === 'achievements'">{{ $t('settings.values.statistics.categories.achievements') }}</span>
              <span v-else-if="category === 'tools'">{{ $t('settings.values.statistics.categories.tools') }}</span>
            </button>
          </div>

          <!-- 标签选择器 -->
          <div class="relative">
            <select
              v-model="activeTab"
              class="w-full p-3 pl-10 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium shadow-sm appearance-none"
            >
              <optgroup v-if="activeCategory === 'overview'" :label="$t('settings.values.statistics.categoryGroups.overviewSummary')">
                <option value="overview">{{ $t('settings.values.statistics.tabs.overview') }}</option>
                <option value="summary">{{ $t('settings.values.statistics.tabs.summary') }}</option>
              </optgroup>
              <optgroup v-if="activeCategory === 'analysis'" :label="$t('settings.values.statistics.categoryGroups.dataAnalysis')">
                <option value="trends">{{ $t('settings.values.statistics.tabs.trends') }}</option>
                <option value="distribution">{{ $t('settings.values.statistics.tabs.distribution') }}</option>
                <option value="heatmap">{{ $t('settings.values.statistics.tabs.heatmap') }}</option>
                <option value="charts">{{ $t('settings.values.statistics.tabs.charts') }}</option>
              </optgroup>
              <optgroup v-if="activeCategory === 'achievements'" :label="$t('settings.values.statistics.categoryGroups.achievementsGoals')">
                <option value="ratings">{{ $t('settings.values.statistics.tabs.ratings') }}</option>
                <option value="achievements">{{ $t('settings.values.statistics.tabs.achievements') }}</option>
                <option value="goals">{{ $t('settings.values.statistics.tabs.goals') }}</option>
              </optgroup>
              <optgroup v-if="activeCategory === 'tools'" :label="$t('settings.values.statistics.categoryGroups.toolsSuggestions')">
                <option value="suggestions">{{ $t('settings.values.statistics.tabs.suggestions') }}</option>
                <option value="export">{{ $t('settings.values.statistics.tabs.export') }}</option>
              </optgroup>
            </select>
            <div class="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary dark:text-primary-dark">
              <IconChevronDown size="18" />
            </div>
          </div>
        </div>

        <!-- 桌面端分类导航 -->
        <div class="hidden md:block mb-6">
          <div class="category-tabs flex justify-center bg-surface-light dark:bg-surface-dark rounded-lg shadow-sm p-1.5 border border-gray-100 dark:border-gray-800">
            <button
              class="category-tab py-2.5 px-5 font-medium text-sm transition-all rounded-md flex items-center"
              :class="{
                'bg-white dark:bg-gray-800 text-primary dark:text-primary-dark shadow-sm': activeCategory === 'overview',
                'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50': activeCategory !== 'overview'
              }"
              @click="activeCategory = 'overview'"
            >
              <IconDashboard size="18" class="mr-1.5" />
              {{ $t('settings.values.statistics.categoryGroups.overviewSummary') }}
            </button>
            <button
              class="category-tab py-2.5 px-5 font-medium text-sm transition-all rounded-md flex items-center"
              :class="{
                'bg-white dark:bg-gray-800 text-primary dark:text-primary-dark shadow-sm': activeCategory === 'analysis',
                'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50': activeCategory !== 'analysis'
              }"
              @click="activeCategory = 'analysis'"
            >
              <IconChartLine size="18" class="mr-1.5" />
              {{ $t('settings.values.statistics.categoryGroups.dataAnalysis') }}
            </button>
            <button
              class="category-tab py-2.5 px-5 font-medium text-sm transition-all rounded-md flex items-center"
              :class="{
                'bg-white dark:bg-gray-800 text-primary dark:text-primary-dark shadow-sm': activeCategory === 'achievements',
                'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50': activeCategory !== 'achievements'
              }"
              @click="activeCategory = 'achievements'"
            >
              <IconMedal size="18" class="mr-1.5" />
              {{ $t('settings.values.statistics.categoryGroups.achievementsGoals') }}
            </button>
            <button
              class="category-tab py-2.5 px-5 font-medium text-sm transition-all rounded-md flex items-center"
              :class="{
                'bg-white dark:bg-gray-800 text-primary dark:text-primary-dark shadow-sm': activeCategory === 'tools',
                'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50': activeCategory !== 'tools'
              }"
              @click="activeCategory = 'tools'"
            >
              <IconTools size="18" class="mr-1.5" />
              {{ $t('settings.values.statistics.categoryGroups.toolsSuggestions') }}
            </button>
          </div>

          <!-- 概览与摘要标签页 -->
          <div v-if="activeCategory === 'overview'" class="tab-buttons flex flex-wrap gap-2 mt-3">
            <button
              class="py-2 px-3 rounded-lg font-medium text-sm transition-colors flex items-center justify-center"
              :class="{
                'bg-primary text-white dark:bg-primary-dark dark:text-white': activeTab === 'overview',
                'bg-surface-light dark:bg-surface-dark hover:bg-gray-100 dark:hover:bg-gray-800': activeTab !== 'overview'
              }"
              @click="activeTab = 'overview'"
            >
              <IconChartBar size="18" class="mr-1" />
              {{ $t('settings.values.statistics.tabs.overview') }}
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
              {{ $t('settings.values.statistics.tabs.summary') }}
            </button>
          </div>

          <!-- 数据分析标签页 -->
          <div v-if="activeCategory === 'analysis'" class="tab-buttons flex flex-wrap gap-2 mt-3">
            <button
              class="py-2 px-3 rounded-lg font-medium text-sm transition-colors flex items-center justify-center"
              :class="{
                'bg-primary text-white dark:bg-primary-dark dark:text-white': activeTab === 'trends',
                'bg-surface-light dark:bg-surface-dark hover:bg-gray-100 dark:hover:bg-gray-800': activeTab !== 'trends'
              }"
              @click="activeTab = 'trends'"
            >
              <IconChartAreaLine size="18" class="mr-1" />
              {{ $t('settings.values.statistics.tabs.trends') }}
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
              {{ $t('settings.values.statistics.tabs.distribution') }}
            </button>

            <button
              class="py-2 px-3 rounded-lg font-medium text-sm transition-colors flex items-center justify-center"
              :class="{
                'bg-primary text-white dark:bg-primary-dark dark:text-white': activeTab === 'heatmap',
                'bg-surface-light dark:bg-surface-dark hover:bg-gray-100 dark:hover:bg-gray-800': activeTab !== 'heatmap'
              }"
              @click="activeTab = 'heatmap'"
            >
              <IconLayoutGrid size="18" class="mr-1" />
              {{ $t('settings.values.statistics.tabs.heatmap') }}
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
              {{ $t('settings.values.statistics.tabs.charts') }}
            </button>
          </div>

          <!-- 成就与目标标签页 -->
          <div v-if="activeCategory === 'achievements'" class="tab-buttons flex flex-wrap gap-2 mt-3">
            <button
              class="py-2 px-3 rounded-lg font-medium text-sm transition-colors flex items-center justify-center"
              :class="{
                'bg-primary text-white dark:bg-primary-dark dark:text-white': activeTab === 'ratings',
                'bg-surface-light dark:bg-surface-dark hover:bg-gray-100 dark:hover:bg-gray-800': activeTab !== 'ratings'
              }"
              @click="activeTab = 'ratings'"
            >
              <IconStarFilled size="18" class="mr-1" />
              {{ $t('settings.values.statistics.tabs.ratings') }}
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
              {{ $t('settings.values.statistics.tabs.achievements') }}
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
              {{ $t('settings.values.statistics.tabs.goals') }}
            </button>
          </div>

          <!-- 工具与建议标签页 -->
          <div v-if="activeCategory === 'tools'" class="tab-buttons flex flex-wrap gap-2 mt-3">
            <button
              class="py-2 px-3 rounded-lg font-medium text-sm transition-colors flex items-center justify-center"
              :class="{
                'bg-primary text-white dark:bg-primary-dark dark:text-white': activeTab === 'suggestions',
                'bg-surface-light dark:bg-surface-dark hover:bg-gray-100 dark:hover:bg-gray-800': activeTab !== 'suggestions'
              }"
              @click="activeTab = 'suggestions'"
            >
              <IconBulb size="18" class="mr-1" />
              {{ $t('settings.values.statistics.tabs.suggestions') }}
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
              {{ $t('settings.values.statistics.tabs.export') }}
            </button>
          </div>
        </div>
      </div>

      <!-- 总览标签页 -->
      <div v-if="activeTab === 'overview'" class="tab-content">
        <!-- 核心数据卡片 - 更加突出的设计 -->
        <div class="core-stats-card bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary-dark/10 dark:to-primary-dark/20 rounded-xl shadow-sm overflow-hidden mb-6 border border-primary/10 dark:border-primary-dark/20">
          <div class="p-4">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <!-- 总专注时长 -->
              <div class="stat-item text-center">
                <div class="stat-icon-wrapper mx-auto mb-2 w-10 h-10 rounded-full bg-primary/20 dark:bg-primary-dark/30 flex items-center justify-center">
                  <IconClock size="20" class="text-primary dark:text-primary-dark" />
                </div>
                <div class="stat-label text-sm text-gray-600 dark:text-gray-400 mb-1">{{ $t('settings.values.statistics.totalFocusTime') }}</div>
                <div class="stat-value text-2xl font-bold text-gray-800 dark:text-gray-100">{{ formatDuration(focusStatsStore.totalFocusDuration) }}</div>
              </div>

              <!-- 总专注次数 -->
              <div class="stat-item text-center">
                <div class="stat-icon-wrapper mx-auto mb-2 w-10 h-10 rounded-full bg-blue-500/20 dark:bg-blue-400/30 flex items-center justify-center">
                  <IconChartBar size="20" class="text-blue-500 dark:text-blue-400" />
                </div>
                <div class="stat-label text-sm text-gray-600 dark:text-gray-400 mb-1">{{ $t('settings.values.statistics.totalSessions') }}</div>
                <div class="stat-value text-2xl font-bold text-gray-800 dark:text-gray-100">{{ focusStatsStore.totalFocusSessions }}</div>
              </div>

              <!-- 完成专注次数 -->
              <div class="stat-item text-center">
                <div class="stat-icon-wrapper mx-auto mb-2 w-10 h-10 rounded-full bg-green-500/20 dark:bg-green-400/30 flex items-center justify-center">
                  <IconCheckbox size="20" class="text-green-500 dark:text-green-400" />
                </div>
                <div class="stat-label text-sm text-gray-600 dark:text-gray-400 mb-1">{{ $t('settings.values.statistics.completedSessions') }}</div>
                <div class="stat-value text-2xl font-bold text-gray-800 dark:text-gray-100">{{ focusStatsStore.completedFocusSessions }}</div>
              </div>

              <!-- 完成率 -->
              <div class="stat-item text-center">
                <div class="stat-icon-wrapper mx-auto mb-2 w-10 h-10 rounded-full bg-purple-500/20 dark:bg-purple-400/30 flex items-center justify-center">
                  <IconChartLine size="20" class="text-purple-500 dark:text-purple-400" />
                </div>
                <div class="stat-label text-sm text-gray-600 dark:text-gray-400 mb-1">{{ $t('settings.values.statistics.completionRate') }}</div>
                <div class="stat-value text-2xl font-bold text-gray-800 dark:text-gray-100">{{ formatPercentage(focusStatsStore.focusCompletionRate) }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <!-- 连续专注天数 - 左侧卡片 -->
          <div class="streak-card bg-gradient-to-br from-amber-500/5 to-amber-500/15 dark:from-amber-400/10 dark:to-amber-400/25 rounded-xl shadow-sm overflow-hidden border border-amber-500/10 dark:border-amber-400/20">
            <div class="p-5">
              <div class="flex items-start">
                <div class="streak-icon w-14 h-14 rounded-full bg-amber-500/20 dark:bg-amber-400/30 flex items-center justify-center text-amber-500 dark:text-amber-400 mr-4">
                  <IconFlame size="28" />
                </div>
                <div class="flex-1">
                  <h3 class="text-lg font-medium text-gray-800 dark:text-gray-100">{{ $t('settings.values.statistics.streak') }}</h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">{{ $t('settings.values.statistics.currentStreak') }}</p>

                  <div class="flex items-baseline">
                    <div class="text-4xl font-bold text-amber-500 dark:text-amber-400">{{ focusStatsStore.streakDays }}</div>
                    <div class="text-sm ml-2 text-gray-600 dark:text-gray-400">{{ $t('settings.values.statistics.streakDays') }}</div>
                  </div>

                  <!-- 连续天数可视化 -->
                  <div class="mt-3 flex space-x-1">
                    <div
                      v-for="i in 7"
                      :key="i"
                      class="w-8 h-2 rounded-full"
                      :class="i <= (focusStatsStore.streakDays > 7 ? 7 : focusStatsStore.streakDays)
                        ? 'bg-amber-500 dark:bg-amber-400'
                        : 'bg-gray-200 dark:bg-gray-700'"
                    ></div>
                    <div v-if="focusStatsStore.streakDays > 7" class="text-xs text-amber-500 dark:text-amber-400 ml-1">+{{ focusStatsStore.streakDays - 7 }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 专注习惯分析 - 右侧卡片 -->
          <div class="focus-insights bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary-dark/10 dark:to-primary-dark/20 rounded-xl shadow-sm overflow-hidden border border-primary/10 dark:border-primary-dark/20">
            <div class="insights-header bg-primary/10 dark:bg-primary-dark/20 px-4 py-3">
              <h3 class="text-lg font-medium flex items-center">
                <IconBulb size="20" class="text-primary dark:text-primary-dark mr-2" />
                {{ $t('settings.values.statistics.insights') }}
              </h3>
            </div>

            <div class="p-4">
              <ul class="space-y-3">
                <li class="flex items-start gap-3">
                  <div class="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/20 dark:bg-blue-400/30 flex items-center justify-center text-blue-500 dark:text-blue-400">
                    <IconClock size="20" />
                  </div>
                  <div>
                    <div class="font-medium text-gray-800 dark:text-gray-100">{{ $t('settings.values.statistics.mostProductiveTime', { time: formatHour(focusStatsStore.mostProductiveHour) }) }}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ $t('settings.values.statistics.mostProductiveTimeDesc') }}</div>
                  </div>
                </li>

                <li class="flex items-start gap-3">
                  <div class="flex-shrink-0 w-10 h-10 rounded-full bg-green-500/20 dark:bg-green-400/30 flex items-center justify-center text-green-500 dark:text-green-400">
                    <IconChartBar size="20" />
                  </div>
                  <div>
                    <div class="font-medium text-gray-800 dark:text-gray-100">{{ $t('settings.values.statistics.mostProductiveDay', { day: formatDay(focusStatsStore.mostProductiveDay) }) }}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ $t('settings.values.statistics.mostProductiveDayDesc') }}</div>
                  </div>
                </li>

                <li class="flex items-start gap-3">
                  <div class="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500/20 dark:bg-purple-400/30 flex items-center justify-center text-purple-500 dark:text-purple-400">
                    <IconClock size="20" />
                  </div>
                  <div>
                    <div class="font-medium text-gray-800 dark:text-gray-100">{{ $t('settings.values.statistics.averageFocusTime', { time: formatDuration(focusStatsStore.averageFocusDuration) }) }}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ $t('settings.values.statistics.averageFocusTimeDesc') }}</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- 图表标签页 -->
      <div v-else-if="activeTab === 'charts'" class="tab-content">
        <!-- 图表卡片 -->
        <div class="chart-card bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm overflow-hidden mb-6">
          <div class="chart-header bg-primary/10 dark:bg-primary-dark/20 px-4 py-3">
            <h3 class="text-lg font-medium flex items-center">
              <IconChartLine size="20" class="text-primary dark:text-primary-dark mr-2" />
              {{ $t('settings.values.statistics.charts.title') }}
            </h3>

            <!-- 时间范围选择器 -->
            <div class="time-range-selector flex flex-wrap gap-2 mt-3">
              <button
                v-for="range in timeRanges"
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
              {{ $t('settings.values.statistics.goals.title') }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {{ $t('settings.values.statistics.goals.description') }}
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
              {{ $t('settings.values.statistics.suggestions.title') }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {{ $t('settings.values.statistics.suggestions.description') }}
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
              {{ $t('settings.values.statistics.heatmap.title') }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {{ $t('settings.values.statistics.heatmap.description') }}
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
              {{ $t('settings.values.statistics.ratings.title') }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {{ $t('settings.values.statistics.ratings.description') }}
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
              {{ $t('settings.values.statistics.achievements.title') }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {{ $t('settings.values.statistics.achievements.description') }}
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
              {{ $t('settings.values.statistics.export.title') }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {{ $t('settings.values.statistics.export.description') }}
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
      <h3 class="text-lg font-medium mb-2">{{ $t('settings.values.statistics.noData') }}</h3>
      <p class="text-gray-600 dark:text-gray-400 max-w-md mx-auto">{{ $t('settings.values.statistics.noDataMessage') }}</p>
    </div>
  </div>
</template>

<style scoped>
.focus-statistics {
  width: 100%;
}

.tab-content {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 隐藏滚动条但保留滚动功能 */
.no-scrollbar {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

.no-scrollbar::-webkit-scrollbar {
  display: none;  /* Chrome, Safari and Opera */
}
</style>
