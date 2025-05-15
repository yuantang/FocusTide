import { useSupabaseClient } from '#imports'
import { useAuth } from '~/stores/auth'
import { useSettings } from '~/stores/settings'
import { useFocusStats } from '~/stores/focusStats'
import { useTasklist } from '~/stores/tasklist'
import { useFocusGoals } from '~/stores/focusGoals'

export class SyncService {
  private authStore;
  private settingsStore;
  private focusStatsStore;
  private tasklistStore;
  private focusGoalsStore;
  private supabase;

  constructor() {
    // 延迟初始化，确保Pinia已经准备好
    setTimeout(() => {
      this.authStore = useAuth();
      this.settingsStore = useSettings();
      this.focusStatsStore = useFocusStats();
      this.tasklistStore = useTasklist();
      this.focusGoalsStore = useFocusGoals();
      this.supabase = useSupabaseClient();
    }, 0);
  }

  // 初始同步 - 首次登录时调用
  async initialSync() {
    if (!this.authStore?.user) return

    this.authStore.syncStatus = 'syncing'

    try {
      // 同步设置
      await this.syncSettings()

      // 同步专注会话
      await this.syncFocusSessions()

      // 同步任务
      await this.syncTasks()

      // 同步目标
      await this.syncFocusGoals()

      this.authStore.lastSynced = new Date().toISOString()
      this.authStore.syncStatus = 'idle'
    } catch (error) {
      console.error('Initial sync failed:', error)
      this.authStore.syncStatus = 'error'
    }
  }

  // 增量同步 - 定期调用或手动触发
  async syncData() {
    if (!this.authStore?.user) return

    this.authStore.syncStatus = 'syncing'

    try {
      // 同步各个store的数据
      await this.syncSettings()
      await this.syncFocusSessions()
      await this.syncTasks()
      await this.syncFocusGoals()

      this.authStore.lastSynced = new Date().toISOString()
      this.authStore.syncStatus = 'idle'
    } catch (error) {
      console.error('Sync failed:', error)
      this.authStore.syncStatus = 'error'
    }
  }

  // 同步设置
  private async syncSettings() {
    if (!this.authStore?.user) return
    const userId = this.authStore.user.id

    // 获取云端设置
    const { data: cloudSettings, error } = await this.supabase
      .from('user_settings')
      .select('*')
      .eq('id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    if (!cloudSettings) {
      // 如果云端没有设置，上传本地设置
      await this.supabase
        .from('user_settings')
        .upsert({
          id: userId,
          settings: this.settingsStore.$state,
          updated_at: new Date().toISOString()
        })
    } else {
      // 如果云端有设置，比较时间戳并合并
      const localUpdatedAt = localStorage.getItem('settings_updated_at')
      const cloudUpdatedAt = cloudSettings.updated_at

      if (!localUpdatedAt || new Date(cloudUpdatedAt) > new Date(localUpdatedAt)) {
        // 云端数据更新，更新本地
        this.settingsStore.$patch(cloudSettings.settings)
        localStorage.setItem('settings_updated_at', cloudUpdatedAt)
      } else {
        // 本地数据更新，更新云端
        await this.supabase
          .from('user_settings')
          .upsert({
            id: userId,
            settings: this.settingsStore.$state,
            updated_at: new Date().toISOString()
          })
      }
    }
  }

  // 同步专注会话
  private async syncFocusSessions() {
    if (!this.authStore?.user) return
    const userId = this.authStore.user.id

    // 获取本地会话
    const localSessions = this.focusStatsStore.sessions

    // 获取云端会话
    const { data: cloudSessions, error } = await this.supabase
      .from('focus_sessions')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      throw error
    }

    // 创建会话ID映射
    const cloudSessionMap = new Map()
    cloudSessions?.forEach(session => {
      cloudSessionMap.set(session.session_id, session)
    })

    // 上传新的本地会话
    const sessionsToUpload = localSessions.filter(session => !cloudSessionMap.has(session.id))

    if (sessionsToUpload.length > 0) {
      const uploadData = sessionsToUpload.map(session => ({
        user_id: userId,
        session_id: session.id,
        start_time: session.startTime,
        end_time: session.endTime,
        duration: session.duration,
        completed: session.completed,
        type: session.type,
        interruptions: session.interruptions
      }))

      const { error: uploadError } = await this.supabase
        .from('focus_sessions')
        .upsert(uploadData)

      if (uploadError) {
        throw uploadError
      }
    }

    // 下载新的云端会话
    const localSessionIds = new Set(localSessions.map(session => session.id))
    const newCloudSessions = cloudSessions?.filter(session => !localSessionIds.has(session.session_id)) || []

    if (newCloudSessions.length > 0) {
      const sessionsToImport = newCloudSessions.map(session => ({
        id: session.session_id,
        startTime: session.start_time,
        endTime: session.end_time,
        duration: session.duration,
        completed: session.completed,
        type: session.type,
        interruptions: session.interruptions
      }))

      // 导入新会话
      this.focusStatsStore.importSessions([...localSessions, ...sessionsToImport])
    }
  }

  // 同步任务
  private async syncTasks() {
    if (!this.authStore?.user) return
    const userId = this.authStore.user.id

    // 获取本地任务
    const localTasks = this.tasklistStore.tasks

    // 获取云端任务
    const { data: cloudTasks, error } = await this.supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      throw error
    }

    // 创建任务ID映射
    const cloudTaskMap = new Map()
    cloudTasks?.forEach(task => {
      cloudTaskMap.set(task.task_id, task)
    })

    // 上传新的本地任务
    const tasksToUpload = localTasks.filter(task => !cloudTaskMap.has(task.id))

    if (tasksToUpload.length > 0) {
      const uploadData = tasksToUpload.map(task => ({
        user_id: userId,
        task_id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        section: task.section,
        state: task.state,
        keep_on_screen: task.keepOnScreen
      }))

      const { error: uploadError } = await this.supabase
        .from('tasks')
        .upsert(uploadData)

      if (uploadError) {
        throw uploadError
      }
    }

    // 下载新的云端任务
    const localTaskIds = new Set(localTasks.map(task => task.id))
    const newCloudTasks = cloudTasks?.filter(task => !localTaskIds.has(task.task_id)) || []

    if (newCloudTasks.length > 0) {
      const tasksToImport = newCloudTasks.map(task => ({
        id: task.task_id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        section: task.section,
        state: task.state,
        keepOnScreen: task.keep_on_screen
      }))

      // 导入新任务
      this.tasklistStore.tasks = [...localTasks, ...tasksToImport]
    }
  }

  // 同步专注目标
  private async syncFocusGoals() {
    if (!this.authStore?.user) return
    const userId = this.authStore.user.id

    // 获取云端目标
    const { data: cloudGoals, error } = await this.supabase
      .from('focus_goals')
      .select('*')
      .eq('id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    if (!cloudGoals) {
      // 如果云端没有目标，上传本地目标
      await this.supabase
        .from('focus_goals')
        .upsert({
          id: userId,
          daily_goal_minutes: this.focusGoalsStore.dailyGoalMinutes,
          weekly_goal_minutes: this.focusGoalsStore.weeklyGoalMinutes,
          daily_goal_sessions: this.focusGoalsStore.dailyGoalSessions,
          weekly_goal_sessions: this.focusGoalsStore.weeklyGoalSessions,
          streak_days: this.focusGoalsStore.streakDays,
          last_completed_day: this.focusGoalsStore.lastCompletedDay,
          updated_at: new Date().toISOString()
        })
    } else {
      // 如果云端有目标，比较时间戳并合并
      const localUpdatedAt = localStorage.getItem('goals_updated_at')
      const cloudUpdatedAt = cloudGoals.updated_at

      if (!localUpdatedAt || new Date(cloudUpdatedAt) > new Date(localUpdatedAt)) {
        // 云端数据更新，更新本地
        this.focusGoalsStore.$patch({
          dailyGoalMinutes: cloudGoals.daily_goal_minutes,
          weeklyGoalMinutes: cloudGoals.weekly_goal_minutes,
          dailyGoalSessions: cloudGoals.daily_goal_sessions,
          weeklyGoalSessions: cloudGoals.weekly_goal_sessions,
          streakDays: cloudGoals.streak_days,
          lastCompletedDay: cloudGoals.last_completed_day
        })
        localStorage.setItem('goals_updated_at', cloudUpdatedAt)
      } else {
        // 本地数据更新，更新云端
        await this.supabase
          .from('focus_goals')
          .upsert({
            id: userId,
            daily_goal_minutes: this.focusGoalsStore.dailyGoalMinutes,
            weekly_goal_minutes: this.focusGoalsStore.weeklyGoalMinutes,
            daily_goal_sessions: this.focusGoalsStore.dailyGoalSessions,
            weekly_goal_sessions: this.focusGoalsStore.weeklyGoalSessions,
            streak_days: this.focusGoalsStore.streakDays,
            last_completed_day: this.focusGoalsStore.lastCompletedDay,
            updated_at: new Date().toISOString()
          })
      }
    }
  }

  // 导出数据
  async exportData() {
    const data = {
      settings: this.settingsStore.$state,
      sessions: this.focusStatsStore.sessions,
      tasks: this.tasklistStore.tasks,
      goals: {
        dailyGoalMinutes: this.focusGoalsStore.dailyGoalMinutes,
        weeklyGoalMinutes: this.focusGoalsStore.weeklyGoalMinutes,
        dailyGoalSessions: this.focusGoalsStore.dailyGoalSessions,
        weeklyGoalSessions: this.focusGoalsStore.weeklyGoalSessions,
        streakDays: this.focusGoalsStore.streakDays,
        lastCompletedDay: this.focusGoalsStore.lastCompletedDay
      }
    }

    const dataStr = JSON.stringify(data)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

    const exportFileDefaultName = `focustide_backup_${new Date().toISOString().slice(0, 10)}.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  // 导入数据
  async importData() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'

    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()

      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)

          // 导入设置
          if (data.settings) {
            this.settingsStore.$patch(data.settings)
          }

          // 导入会话
          if (data.sessions) {
            this.focusStatsStore.importSessions(data.sessions)
          }

          // 导入任务
          if (data.tasks) {
            this.tasklistStore.tasks = data.tasks
          }

          // 导入目标
          if (data.goals) {
            this.focusGoalsStore.$patch(data.goals)
          }

          // 如果用户已登录，同步到云端
          if (this.authStore?.isAuthenticated) {
            await this.syncData()
          }
        } catch (error) {
          console.error('Failed to import data:', error)
        }
      }

      reader.readAsText(file)
    }

    input.click()
  }
}

export const syncService = new SyncService()
