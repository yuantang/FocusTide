<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useFocusStats } from '~/stores/focusStats'
import { IconDownload, IconFileSpreadsheet, IconFileCode } from '@tabler/icons-vue'
import { ButtonImportance, ButtonTheme } from '~/components/base/types/button'
import Button from '~/components/base/uiButton.vue'

const { t } = useI18n()
const focusStatsStore = useFocusStats()

const exportFormat = ref<'csv' | 'json'>('csv')

// 将日期格式化为本地字符串
const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleString()
}

// 将持续时间格式化为小时:分钟:秒
const formatDuration = (ms: number): string => {
  const hours = Math.floor(ms / (1000 * 60 * 60))
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((ms % (1000 * 60)) / 1000)

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

// 导出为CSV格式
const exportAsCSV = () => {
  // CSV 标题行
  const headers = [
    'ID',
    t('settings.statistics.export.startTime'),
    t('settings.statistics.export.endTime'),
    t('settings.statistics.export.duration'),
    t('settings.statistics.export.type'),
    t('settings.statistics.export.completed'),
    t('settings.statistics.export.interruptions')
  ]

  // 转换会话数据为CSV行
  const rows = focusStatsStore.sessions.map(session => [
    session.id,
    formatDate(session.startTime),
    formatDate(session.endTime),
    formatDuration(session.duration),
    t(`section.${session.type}`),
    session.completed ? t('settings.statistics.export.yes') : t('settings.statistics.export.no'),
    session.interruptions.toString()
  ])

  // 组合标题和行
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  // 创建Blob并下载
  downloadFile(csvContent, 'focus-sessions.csv', 'text/csv')
}

// 导出为JSON格式
const exportAsJSON = () => {
  // 创建包含会话和统计数据的对象
  const exportData = {
    sessions: focusStatsStore.sessions,
    stats: {
      totalFocusDuration: focusStatsStore.totalFocusDuration,
      totalFocusSessions: focusStatsStore.totalFocusSessions,
      completedFocusSessions: focusStatsStore.completedFocusSessions,
      focusCompletionRate: focusStatsStore.focusCompletionRate,
      averageFocusDuration: focusStatsStore.averageFocusDuration,
      mostProductiveHour: focusStatsStore.mostProductiveHour,
      mostProductiveDay: focusStatsStore.mostProductiveDay,
      dailyStats: focusStatsStore.dailyStats,
      weeklyStats: focusStatsStore.weeklyStats,
      monthlyStats: focusStatsStore.monthlyStats
    },
    exportDate: new Date().toISOString()
  }

  // 转换为JSON字符串
  const jsonContent = JSON.stringify(exportData, null, 2)

  // 创建Blob并下载
  downloadFile(jsonContent, 'focus-statistics.json', 'application/json')
}

// 通用下载文件函数
const downloadFile = (content: string, fileName: string, contentType: string) => {
  const blob = new Blob([content], { type: contentType })
  const url = URL.createObjectURL(blob)

  // 创建临时链接并触发下载
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()

  // 清理
  URL.revokeObjectURL(url)
}

// 导出数据
const exportData = () => {
  if (exportFormat.value === 'csv') {
    exportAsCSV()
  } else {
    exportAsJSON()
  }
}

// 检查是否有数据可导出
const hasData = computed(() => {
  return focusStatsStore.sessions.length > 0
})
</script>

<template>
  <div class="focus-export">
    <h3 class="text-lg font-medium mb-2">{{ $t('settings.statistics.export.title') }}</h3>

    <div class="export-options bg-surface-light dark:bg-surface-dark p-4 rounded-lg mb-4">
      <p class="text-sm mb-3">{{ $t('settings.statistics.export.description') }}</p>

      <div class="format-selector flex gap-2 mb-4">
        <Button
          :theme="ButtonTheme.Neutral"
          :importance="exportFormat === 'csv' ? ButtonImportance.Filled : ButtonImportance.Outline"
          class="flex-1"
          @click="exportFormat = 'csv'"
        >
          <template #pre>
            <IconFileSpreadsheet size="18" />
          </template>
          CSV
        </Button>

        <Button
          :theme="ButtonTheme.Neutral"
          :importance="exportFormat === 'json' ? ButtonImportance.Filled : ButtonImportance.Outline"
          class="flex-1"
          @click="exportFormat = 'json'"
        >
          <template #pre>
            <IconFileCode size="18" />
          </template>
          JSON
        </Button>
      </div>

      <Button
        :theme="ButtonTheme.Primary"
        :importance="ButtonImportance.Filled"
        class="w-full"
        :disabled="!hasData"
        @click="exportData"
      >
        <template #pre>
          <IconDownload size="18" />
        </template>
        {{ $t('settings.statistics.export.downloadButton') }}
      </Button>

      <p v-if="!hasData" class="text-sm text-gray-500 dark:text-gray-400 mt-2">
        {{ $t('settings.statistics.export.noDataMessage') }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.focus-export {
  @apply w-full;
}
</style>
