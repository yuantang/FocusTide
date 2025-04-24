<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFocusStats } from '~/stores/focusStats'
import { IconStarFilled, IconStar, IconStarHalfFilled } from '@tabler/icons-vue'

const { t } = useI18n()
const focusStatsStore = useFocusStats()

// 获取专注质量评分
const qualityRating = computed(() => {
  return focusStatsStore.focusQualityScore
})

// 获取专注效率评分
const efficiencyRating = computed(() => {
  return focusStatsStore.focusEfficiencyScore
})

// 获取专注习惯评分
const habitRating = computed(() => {
  return focusStatsStore.focusHabitScore
})

// 获取总体评分（三者平均）
const overallRating = computed(() => {
  return Math.round((qualityRating.value + efficiencyRating.value + habitRating.value) / 3)
})

// 将评分转换为星级（0-5星，支持半星）
const getStarRating = (score: number) => {
  // 将0-100的分数转换为0-5星
  const stars = score / 20

  // 生成星星数组（0=空星，0.5=半星，1=实星）
  const starArray = []

  for (let i = 1; i <= 5; i++) {
    if (stars >= i) {
      // 实星
      starArray.push(1)
    } else if (stars >= i - 0.5) {
      // 半星
      starArray.push(0.5)
    } else {
      // 空星
      starArray.push(0)
    }
  }

  return starArray
}

// 获取评分等级描述
const getRatingLevel = (score: number) => {
  if (score >= 90) return t('settings.values.statistics.ratings.excellent')
  if (score >= 80) return t('settings.values.statistics.ratings.veryGood')
  if (score >= 70) return t('settings.values.statistics.ratings.good')
  if (score >= 60) return t('settings.values.statistics.ratings.fair')
  if (score >= 50) return t('settings.values.statistics.ratings.needsImprovement')
  return t('settings.values.statistics.ratings.poor')
}

// 获取评分颜色
const getRatingColor = (score: number) => {
  if (score >= 90) return 'text-green-500 dark:text-green-400'
  if (score >= 80) return 'text-green-400 dark:text-green-300'
  if (score >= 70) return 'text-yellow-500 dark:text-yellow-400'
  if (score >= 60) return 'text-yellow-400 dark:text-yellow-300'
  if (score >= 50) return 'text-orange-500 dark:text-orange-400'
  return 'text-red-500 dark:text-red-400'
}

// 检查是否有数据
const hasData = computed(() => {
  return focusStatsStore.sessions.length > 0
})
</script>

<template>
  <div class="focus-ratings">
    <h3 class="text-lg font-medium mb-2">{{ $t('settings.values.statistics.ratings.title') }}</h3>

    <div v-if="hasData" class="ratings-container">
      <!-- 总体评分 -->
      <div class="overall-rating bg-surface-light dark:bg-surface-dark p-4 rounded-lg mb-4">
        <div class="text-center mb-2">
          <div class="text-sm text-gray-500 dark:text-gray-400">{{ $t('settings.values.statistics.ratings.overall') }}</div>
          <div class="text-3xl font-bold" :class="getRatingColor(overallRating)">{{ overallRating }}</div>
          <div class="text-sm font-medium" :class="getRatingColor(overallRating)">{{ getRatingLevel(overallRating) }}</div>
        </div>

        <div class="flex justify-center mb-2">
          <div
            v-for="(star, index) in getStarRating(overallRating)"
            :key="index"
            class="mx-1"
            :class="getRatingColor(overallRating)"
          >
            <IconStarFilled v-if="star === 1" size="24" />
            <IconStarHalfFilled v-else-if="star === 0.5" size="24" />
            <IconStar v-else size="24" />
          </div>
        </div>
      </div>

      <!-- 详细评分 -->
      <div class="detailed-ratings grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- 专注质量评分 -->
        <div class="rating-card bg-surface-light dark:bg-surface-dark p-4 rounded-lg">
          <div class="text-center">
            <div class="text-sm text-gray-500 dark:text-gray-400">{{ $t('settings.values.statistics.ratings.quality') }}</div>
            <div class="text-2xl font-bold" :class="getRatingColor(qualityRating)">{{ qualityRating }}</div>
            <div class="text-xs font-medium" :class="getRatingColor(qualityRating)">{{ getRatingLevel(qualityRating) }}</div>
          </div>

          <div class="flex justify-center mt-2">
            <div
              v-for="(star, index) in getStarRating(qualityRating)"
              :key="index"
              class="mx-0.5"
              :class="getRatingColor(qualityRating)"
            >
              <IconStarFilled v-if="star === 1" size="16" />
              <IconStarHalfFilled v-else-if="star === 0.5" size="16" />
              <IconStar v-else size="16" />
            </div>
          </div>
        </div>

        <!-- 专注效率评分 -->
        <div class="rating-card bg-surface-light dark:bg-surface-dark p-4 rounded-lg">
          <div class="text-center">
            <div class="text-sm text-gray-500 dark:text-gray-400">{{ $t('settings.values.statistics.ratings.efficiency') }}</div>
            <div class="text-2xl font-bold" :class="getRatingColor(efficiencyRating)">{{ efficiencyRating }}</div>
            <div class="text-xs font-medium" :class="getRatingColor(efficiencyRating)">{{ getRatingLevel(efficiencyRating) }}</div>
          </div>

          <div class="flex justify-center mt-2">
            <div
              v-for="(star, index) in getStarRating(efficiencyRating)"
              :key="index"
              class="mx-0.5"
              :class="getRatingColor(efficiencyRating)"
            >
              <IconStarFilled v-if="star === 1" size="16" />
              <IconStarHalfFilled v-else-if="star === 0.5" size="16" />
              <IconStar v-else size="16" />
            </div>
          </div>
        </div>

        <!-- 专注习惯评分 -->
        <div class="rating-card bg-surface-light dark:bg-surface-dark p-4 rounded-lg">
          <div class="text-center">
            <div class="text-sm text-gray-500 dark:text-gray-400">{{ $t('settings.values.statistics.ratings.habit') }}</div>
            <div class="text-2xl font-bold" :class="getRatingColor(habitRating)">{{ habitRating }}</div>
            <div class="text-xs font-medium" :class="getRatingColor(habitRating)">{{ getRatingLevel(habitRating) }}</div>
          </div>

          <div class="flex justify-center mt-2">
            <div
              v-for="(star, index) in getStarRating(habitRating)"
              :key="index"
              class="mx-0.5"
              :class="getRatingColor(habitRating)"
            >
              <IconStarFilled v-if="star === 1" size="16" />
              <IconStarHalfFilled v-else-if="star === 0.5" size="16" />
              <IconStar v-else size="16" />
            </div>
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
.focus-ratings {
  @apply w-full;
}

.no-data-message {
  @apply text-gray-500 dark:text-gray-400;
}
</style>
