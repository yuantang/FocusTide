<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFocusStats } from '~/stores/focusStats'
import { IconMedal, IconFlame, IconTrophy, IconClock, IconTarget, IconCalendar } from '@tabler/icons-vue'

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

// 获取专注总时长成就
const totalTimeAchievement = computed(() => {
  const totalHours = focusStatsStore.totalFocusDuration / (1000 * 60 * 60)

  if (totalHours >= 100) {
    return {
      title: t('settings.statistics.achievements.timeGrandmaster'),
      description: t('settings.statistics.achievements.timeGrandmasterDesc'),
      icon: 'trophy',
      level: 4,
      progress: 100
    }
  } else if (totalHours >= 50) {
    return {
      title: t('settings.statistics.achievements.timeMaster'),
      description: t('settings.statistics.achievements.timeMasterDesc'),
      icon: 'medal',
      level: 3,
      progress: Math.min(100, (totalHours - 50) / 50 * 100)
    }
  } else if (totalHours >= 20) {
    return {
      title: t('settings.statistics.achievements.timeExpert'),
      description: t('settings.statistics.achievements.timeExpertDesc'),
      icon: 'medal',
      level: 2,
      progress: Math.min(100, (totalHours - 20) / 30 * 100)
    }
  } else if (totalHours >= 5) {
    return {
      title: t('settings.statistics.achievements.timeAdept'),
      description: t('settings.statistics.achievements.timeAdeptDesc'),
      icon: 'medal',
      level: 1,
      progress: Math.min(100, (totalHours - 5) / 15 * 100)
    }
  } else {
    return {
      title: t('settings.statistics.achievements.timeNovice'),
      description: t('settings.statistics.achievements.timeNoviceDesc'),
      icon: 'clock',
      level: 0,
      progress: Math.min(100, totalHours / 5 * 100)
    }
  }
})

// 获取专注次数成就
const sessionCountAchievement = computed(() => {
  const totalSessions = focusStatsStore.totalFocusSessions

  if (totalSessions >= 200) {
    return {
      title: t('settings.statistics.achievements.countGrandmaster'),
      description: t('settings.statistics.achievements.countGrandmasterDesc'),
      icon: 'trophy',
      level: 4,
      progress: 100
    }
  } else if (totalSessions >= 100) {
    return {
      title: t('settings.statistics.achievements.countMaster'),
      description: t('settings.statistics.achievements.countMasterDesc'),
      icon: 'medal',
      level: 3,
      progress: Math.min(100, (totalSessions - 100) / 100 * 100)
    }
  } else if (totalSessions >= 50) {
    return {
      title: t('settings.statistics.achievements.countExpert'),
      description: t('settings.statistics.achievements.countExpertDesc'),
      icon: 'medal',
      level: 2,
      progress: Math.min(100, (totalSessions - 50) / 50 * 100)
    }
  } else if (totalSessions >= 20) {
    return {
      title: t('settings.statistics.achievements.countAdept'),
      description: t('settings.statistics.achievements.countAdeptDesc'),
      icon: 'medal',
      level: 1,
      progress: Math.min(100, (totalSessions - 20) / 30 * 100)
    }
  } else {
    return {
      title: t('settings.statistics.achievements.countNovice'),
      description: t('settings.statistics.achievements.countNoviceDesc'),
      icon: 'target',
      level: 0,
      progress: Math.min(100, totalSessions / 20 * 100)
    }
  }
})

// 获取连续专注天数成就
const streakAchievement = computed(() => {
  const streakDays = focusStatsStore.streakDays

  if (streakDays >= 30) {
    return {
      title: t('settings.statistics.achievements.streakGrandmaster'),
      description: t('settings.statistics.achievements.streakGrandmasterDesc'),
      icon: 'trophy',
      level: 4,
      progress: 100
    }
  } else if (streakDays >= 14) {
    return {
      title: t('settings.statistics.achievements.streakMaster'),
      description: t('settings.statistics.achievements.streakMasterDesc'),
      icon: 'medal',
      level: 3,
      progress: Math.min(100, (streakDays - 14) / 16 * 100)
    }
  } else if (streakDays >= 7) {
    return {
      title: t('settings.statistics.achievements.streakExpert'),
      description: t('settings.statistics.achievements.streakExpertDesc'),
      icon: 'medal',
      level: 2,
      progress: Math.min(100, (streakDays - 7) / 7 * 100)
    }
  } else if (streakDays >= 3) {
    return {
      title: t('settings.statistics.achievements.streakAdept'),
      description: t('settings.statistics.achievements.streakAdeptDesc'),
      icon: 'medal',
      level: 1,
      progress: Math.min(100, (streakDays - 3) / 4 * 100)
    }
  } else {
    return {
      title: t('settings.statistics.achievements.streakNovice'),
      description: t('settings.statistics.achievements.streakNoviceDesc'),
      icon: 'flame',
      level: 0,
      progress: Math.min(100, streakDays / 3 * 100)
    }
  }
})

// 获取专注质量成就
const qualityAchievement = computed(() => {
  const qualityScore = focusStatsStore.focusQualityScore

  if (qualityScore >= 90) {
    return {
      title: t('settings.statistics.achievements.qualityGrandmaster'),
      description: t('settings.statistics.achievements.qualityGrandmasterDesc'),
      icon: 'trophy',
      level: 4,
      progress: 100
    }
  } else if (qualityScore >= 80) {
    return {
      title: t('settings.statistics.achievements.qualityMaster'),
      description: t('settings.statistics.achievements.qualityMasterDesc'),
      icon: 'medal',
      level: 3,
      progress: Math.min(100, (qualityScore - 80) / 10 * 100)
    }
  } else if (qualityScore >= 70) {
    return {
      title: t('settings.statistics.achievements.qualityExpert'),
      description: t('settings.statistics.achievements.qualityExpertDesc'),
      icon: 'medal',
      level: 2,
      progress: Math.min(100, (qualityScore - 70) / 10 * 100)
    }
  } else if (qualityScore >= 60) {
    return {
      title: t('settings.statistics.achievements.qualityAdept'),
      description: t('settings.statistics.achievements.qualityAdeptDesc'),
      icon: 'medal',
      level: 1,
      progress: Math.min(100, (qualityScore - 60) / 10 * 100)
    }
  } else {
    return {
      title: t('settings.statistics.achievements.qualityNovice'),
      description: t('settings.statistics.achievements.qualityNoviceDesc'),
      icon: 'target',
      level: 0,
      progress: Math.min(100, qualityScore / 60 * 100)
    }
  }
})

// 获取所有成就
const allAchievements = computed(() => {
  return [
    totalTimeAchievement.value,
    sessionCountAchievement.value,
    streakAchievement.value,
    qualityAchievement.value
  ]
})

// 获取成就图标
const getAchievementIcon = (icon: string) => {
  switch (icon) {
    case 'medal':
      return IconMedal
    case 'flame':
      return IconFlame
    case 'trophy':
      return IconTrophy
    case 'clock':
      return IconClock
    case 'target':
      return IconTarget
    default:
      return IconMedal
  }
}

// 获取成就等级颜色
const getAchievementColor = (level: number) => {
  switch (level) {
    case 4:
      return 'text-amber-500 dark:text-amber-400'
    case 3:
      return 'text-slate-400 dark:text-slate-300'
    case 2:
      return 'text-amber-700 dark:text-amber-600'
    case 1:
      return 'text-emerald-600 dark:text-emerald-500'
    default:
      return 'text-gray-500 dark:text-gray-400'
  }
}

// 获取进度条颜色
const getProgressColor = (level: number) => {
  switch (level) {
    case 4:
      return 'bg-amber-500 dark:bg-amber-400'
    case 3:
      return 'bg-slate-400 dark:bg-slate-300'
    case 2:
      return 'bg-amber-700 dark:bg-amber-600'
    case 1:
      return 'bg-emerald-600 dark:bg-emerald-500'
    default:
      return 'bg-gray-500 dark:bg-gray-400'
  }
}

// 检查是否有数据
const hasData = computed(() => {
  return focusStatsStore.sessions.length > 0
})
</script>

<template>
  <div class="focus-achievements">
    <h3 class="text-lg font-medium mb-2">{{ $t('settings.statistics.achievements.title') }}</h3>

    <div v-if="hasData" class="achievements-container">
      <!-- 成就列表 -->
      <div class="achievements-list space-y-4">
        <div
          v-for="(achievement, index) in allAchievements"
          :key="index"
          class="achievement-item bg-surface-light dark:bg-surface-dark p-4 rounded-lg"
        >
          <div class="flex items-start gap-3">
            <div :class="['achievement-icon', getAchievementColor(achievement.level)]">
              <component :is="getAchievementIcon(achievement.icon)" size="24" />
            </div>
            <div class="flex-1">
              <div class="achievement-title font-medium">{{ achievement.title }}</div>
              <div class="achievement-description text-sm text-gray-500 dark:text-gray-400 mb-2">
                {{ achievement.description }}
              </div>
              <div class="achievement-progress">
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    :class="['h-2.5 rounded-full', getProgressColor(achievement.level)]"
                    :style="{ width: `${achievement.progress}%` }"
                  ></div>
                </div>
                <div class="text-xs text-right mt-1 text-gray-500 dark:text-gray-400">
                  {{ Math.round(achievement.progress) }}%
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
.focus-achievements {
  @apply w-full;
}

.achievement-icon {
  @apply flex-shrink-0;
}

.no-data-message {
  @apply text-gray-500 dark:text-gray-400;
}
</style>
