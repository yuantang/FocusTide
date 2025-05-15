import { defineNuxtPlugin } from '#app'
import { watch } from 'vue'
import { useAuth } from '~/stores/auth'
import { syncService } from '~/services/syncService'

export default defineNuxtPlugin(async () => {
  const authStore = useAuth()

  // 初始化认证状态
  await authStore.initialize()

  // 设置定期同步
  const setupSyncInterval = () => {
    if (authStore.syncInterval && authStore.syncInterval !== 'manual') {
      const minutes = parseInt(authStore.syncInterval.replace('min', ''))
      const interval = minutes * 60 * 1000

      const syncIntervalId = setInterval(() => {
        if (authStore.isAuthenticated) {
          syncService.syncData()
        }
      }, interval)

      // 清理函数
      return () => clearInterval(syncIntervalId)
    }

    return () => {}
  }

  // 监听同步间隔变化
  let cleanupSync = setupSyncInterval()

  watch(() => authStore.syncInterval, () => {
    cleanupSync()
    cleanupSync = setupSyncInterval()
  })

  // 在页面卸载前同步数据
  window.addEventListener('beforeunload', () => {
    if (authStore.isAuthenticated) {
      syncService.syncData()
    }
  })
})
