<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFocusStats } from '~/stores/focusStats'
import { useFocusGoals } from '~/stores/focusGoals'
import { IconTarget, IconCheck, IconClock, IconCalendar } from '@tabler/icons-vue'
import { ButtonImportance, ButtonTheme } from '~/components/base/types/button'
import Button from '~/components/base/uiButton.vue'

const { t } = useI18n()
const focusStatsStore = useFocusStats()
const focusGoalsStore = useFocusGoals()

// 目标设置表单
const dailyGoalMinutes = ref(focusGoalsStore.dailyGoalMinutes)
const weeklyGoalMinutes = ref(focusGoalsStore.weeklyGoalMinutes)
const dailyGoalSessions = ref(focusGoalsStore.dailyGoalSessions)
const weeklyGoalSessions = ref(focusGoalsStore.weeklyGoalSessions)

// 保存目标设置
const saveGoals = () => {
  focusGoalsStore.setDailyGoal(dailyGoalMinutes.value, dailyGoalSessions.value)
  focusGoalsStore.setWeeklyGoal(weeklyGoalMinutes.value, weeklyGoalSessions.value)
}

// 格式化时间（分钟转为小时:分钟）
const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours > 0) {
    return `${hours}小时 ${mins}分钟`
  } else {
    return `${mins}分钟`
  }
}

// 计算今日专注时长（分钟）
const todayFocusMinutes = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  const todayStats = focusStatsStore.dailyStats.find(day => day.date === today)

  if (todayStats) {
    return Math.round(todayStats.workDuration / (1000 * 60))
  }

  return 0
})

// 计算本周专注时长（分钟）
const thisWeekFocusMinutes = computed(() => {
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1))
  weekStart.setHours(0, 0, 0, 0)

  const weekStartStr = weekStart.toISOString().split('T')[0]
  const weekStats = focusStatsStore.weeklyStats.find(week => week.weekStart === weekStartStr)

  if (weekStats) {
    return Math.round(weekStats.workDuration / (1000 * 60))
  }

  return 0
})

// 计算今日专注次数
const todayFocusSessions = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  const todayStats = focusStatsStore.dailyStats.find(day => day.date === today)

  if (todayStats) {
    return todayStats.workCount
  }

  return 0
})

// 计算本周专注次数
const thisWeekFocusSessions = computed(() => {
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1))
  weekStart.setHours(0, 0, 0, 0)

  const weekStartStr = weekStart.toISOString().split('T')[0]
  const weekStats = focusStatsStore.weeklyStats.find(week => week.weekStart === weekStartStr)

  if (weekStats) {
    return weekStats.workCount
  }

  return 0
})

// 计算今日目标完成度（时长）
const dailyGoalTimeProgress = computed(() => {
  if (dailyGoalMinutes.value === 0) return 100
  return Math.min(100, Math.round((todayFocusMinutes.value / dailyGoalMinutes.value) * 100))
})

// 计算本周目标完成度（时长）
const weeklyGoalTimeProgress = computed(() => {
  if (weeklyGoalMinutes.value === 0) return 100
  return Math.min(100, Math.round((thisWeekFocusMinutes.value / weeklyGoalMinutes.value) * 100))
})

// 计算今日目标完成度（次数）
const dailyGoalSessionsProgress = computed(() => {
  if (dailyGoalSessions.value === 0) return 100
  return Math.min(100, Math.round((todayFocusSessions.value / dailyGoalSessions.value) * 100))
})

// 计算本周目标完成度（次数）
const weeklyGoalSessionsProgress = computed(() => {
  if (weeklyGoalSessions.value === 0) return 100
  return Math.min(100, Math.round((thisWeekFocusSessions.value / weeklyGoalSessions.value) * 100))
})

// 组件挂载时初始化
onMounted(() => {
  // 如果没有设置目标，设置默认值
  if (focusGoalsStore.dailyGoalMinutes === 0) {
    dailyGoalMinutes.value = 120 // 默认每日目标2小时
  }

  if (focusGoalsStore.weeklyGoalMinutes === 0) {
    weeklyGoalMinutes.value = 600 // 默认每周目标10小时
  }

  if (focusGoalsStore.dailyGoalSessions === 0) {
    dailyGoalSessions.value = 4 // 默认每日4次专注
  }

  if (focusGoalsStore.weeklyGoalSessions === 0) {
    weeklyGoalSessions.value = 20 // 默认每周20次专注
  }
})
</script>

<template>
  <div class="focus-goals">
    <h3 class="text-lg font-medium mb-2">{{ $t('settings.statistics.goals.title') }}</h3>

    <div class="goals-container">
      <!-- 目标设置表单 -->
      <div class="goals-form bg-surface-light dark:bg-surface-dark p-4 rounded-lg mb-4">
        <h4 class="text-md font-medium mb-3">{{ $t('settings.statistics.goals.setGoals') }}</h4>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <!-- 每日时长目标 -->
          <div class="goal-input">
            <label class="block text-sm mb-1">{{ $t('settings.statistics.goals.dailyTimeGoal') }}</label>
            <div class="flex items-center">
              <IconClock size="18" class="mr-2 text-primary dark:text-primary-dark" />
              <input
                v-model="dailyGoalMinutes"
                type="number"
                min="0"
                step="5"
                class="w-full p-2 rounded-md bg-surface-variant dark:bg-surface-darkvariant"
              />
              <span class="ml-2 text-sm">{{ $t('settings.statistics.minutes') }}</span>
            </div>
          </div>

          <!-- 每周时长目标 -->
          <div class="goal-input">
            <label class="block text-sm mb-1">{{ $t('settings.statistics.goals.weeklyTimeGoal') }}</label>
            <div class="flex items-center">
              <IconCalendar size="18" class="mr-2 text-primary dark:text-primary-dark" />
              <input
                v-model="weeklyGoalMinutes"
                type="number"
                min="0"
                step="30"
                class="w-full p-2 rounded-md bg-surface-variant dark:bg-surface-darkvariant"
              />
              <span class="ml-2 text-sm">{{ $t('settings.statistics.minutes') }}</span>
            </div>
          </div>

          <!-- 每日次数目标 -->
          <div class="goal-input">
            <label class="block text-sm mb-1">{{ $t('settings.statistics.goals.dailySessionsGoal') }}</label>
            <div class="flex items-center">
              <IconTarget size="18" class="mr-2 text-primary dark:text-primary-dark" />
              <input
                v-model="dailyGoalSessions"
                type="number"
                min="0"
                step="1"
                class="w-full p-2 rounded-md bg-surface-variant dark:bg-surface-darkvariant"
              />
              <span class="ml-2 text-sm">{{ $t('settings.statistics.goals.sessions') }}</span>
            </div>
          </div>

          <!-- 每周次数目标 -->
          <div class="goal-input">
            <label class="block text-sm mb-1">{{ $t('settings.statistics.goals.weeklySessionsGoal') }}</label>
            <div class="flex items-center">
              <IconTarget size="18" class="mr-2 text-primary dark:text-primary-dark" />
              <input
                v-model="weeklyGoalSessions"
                type="number"
                min="0"
                step="1"
                class="w-full p-2 rounded-md bg-surface-variant dark:bg-surface-darkvariant"
              />
              <span class="ml-2 text-sm">{{ $t('settings.statistics.goals.sessions') }}</span>
            </div>
          </div>
        </div>

        <Button
          :theme="ButtonTheme.Primary"
          :importance="ButtonImportance.Filled"
          class="w-full"
          @click="saveGoals"
        >
          <template #pre>
            <IconCheck size="18" />
          </template>
          {{ $t('settings.statistics.goals.saveGoals') }}
        </Button>
      </div>

      <!-- 目标进度 -->
      <div class="goals-progress bg-surface-light dark:bg-surface-dark p-4 rounded-lg">
        <h4 class="text-md font-medium mb-3">{{ $t('settings.statistics.goals.progress') }}</h4>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- 今日时长目标进度 -->
          <div class="goal-progress">
            <div class="flex justify-between mb-1">
              <span class="text-sm">{{ $t('settings.statistics.goals.todayTimeProgress') }}</span>
              <span class="text-sm font-medium">{{ todayFocusMinutes }} / {{ dailyGoalMinutes }} {{ $t('settings.statistics.minutes') }}</span>
            </div>
            <div class="w-full bg-surface-variant dark:bg-surface-darkvariant rounded-full h-2.5">
              <div
                class="bg-primary dark:bg-primary-dark h-2.5 rounded-full"
                :style="{ width: `${dailyGoalTimeProgress}%` }"
              ></div>
            </div>
          </div>

          <!-- 本周时长目标进度 -->
          <div class="goal-progress">
            <div class="flex justify-between mb-1">
              <span class="text-sm">{{ $t('settings.statistics.goals.weekTimeProgress') }}</span>
              <span class="text-sm font-medium">{{ thisWeekFocusMinutes }} / {{ weeklyGoalMinutes }} {{ $t('settings.statistics.minutes') }}</span>
            </div>
            <div class="w-full bg-surface-variant dark:bg-surface-darkvariant rounded-full h-2.5">
              <div
                class="bg-primary dark:bg-primary-dark h-2.5 rounded-full"
                :style="{ width: `${weeklyGoalTimeProgress}%` }"
              ></div>
            </div>
          </div>

          <!-- 今日次数目标进度 -->
          <div class="goal-progress">
            <div class="flex justify-between mb-1">
              <span class="text-sm">{{ $t('settings.statistics.goals.todaySessionsProgress') }}</span>
              <span class="text-sm font-medium">{{ todayFocusSessions }} / {{ dailyGoalSessions }} {{ $t('settings.statistics.goals.sessions') }}</span>
            </div>
            <div class="w-full bg-surface-variant dark:bg-surface-darkvariant rounded-full h-2.5">
              <div
                class="bg-primary dark:bg-primary-dark h-2.5 rounded-full"
                :style="{ width: `${dailyGoalSessionsProgress}%` }"
              ></div>
            </div>
          </div>

          <!-- 本周次数目标进度 -->
          <div class="goal-progress">
            <div class="flex justify-between mb-1">
              <span class="text-sm">{{ $t('settings.statistics.goals.weekSessionsProgress') }}</span>
              <span class="text-sm font-medium">{{ thisWeekFocusSessions }} / {{ weeklyGoalSessions }} {{ $t('settings.statistics.goals.sessions') }}</span>
            </div>
            <div class="w-full bg-surface-variant dark:bg-surface-darkvariant rounded-full h-2.5">
              <div
                class="bg-primary dark:bg-primary-dark h-2.5 rounded-full"
                :style="{ width: `${weeklyGoalSessionsProgress}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.focus-goals {
  @apply w-full;
}
</style>
