import { defineStore } from 'pinia'

export interface FocusGoalsState {
  dailyGoalMinutes: number;
  weeklyGoalMinutes: number;
  dailyGoalSessions: number;
  weeklyGoalSessions: number;
  streakDays: number;
  lastCompletedDay: string | null;
}

export const useFocusGoals = defineStore('focusGoals', {
  state: (): FocusGoalsState => ({
    dailyGoalMinutes: 0,
    weeklyGoalMinutes: 0,
    dailyGoalSessions: 0,
    weeklyGoalSessions: 0,
    streakDays: 0,
    lastCompletedDay: null
  }),

  getters: {
    // 获取每日时长目标（分钟）
    getDailyTimeGoal: (state) => state.dailyGoalMinutes,
    
    // 获取每周时长目标（分钟）
    getWeeklyTimeGoal: (state) => state.weeklyGoalMinutes,
    
    // 获取每日专注次数目标
    getDailySessionsGoal: (state) => state.dailyGoalSessions,
    
    // 获取每周专注次数目标
    getWeeklySessionsGoal: (state) => state.weeklyGoalSessions,
    
    // 获取连续达成目标天数
    getStreakDays: (state) => state.streakDays
  },

  actions: {
    // 设置每日目标
    setDailyGoal(minutes: number, sessions: number) {
      this.dailyGoalMinutes = minutes
      this.dailyGoalSessions = sessions
    },
    
    // 设置每周目标
    setWeeklyGoal(minutes: number, sessions: number) {
      this.weeklyGoalMinutes = minutes
      this.weeklyGoalSessions = sessions
    },
    
    // 记录目标完成情况
    recordGoalCompletion(date: string, timeCompleted: boolean, sessionsCompleted: boolean) {
      // 如果时长目标和次数目标都完成，则记为完成
      const goalCompleted = timeCompleted && sessionsCompleted
      
      if (goalCompleted) {
        // 检查是否是连续的
        if (this.lastCompletedDay) {
          const lastDate = new Date(this.lastCompletedDay)
          const currentDate = new Date(date)
          
          // 计算日期差
          const timeDiff = currentDate.getTime() - lastDate.getTime()
          const dayDiff = Math.round(timeDiff / (1000 * 3600 * 24))
          
          // 如果是连续的（昨天完成了目标）
          if (dayDiff === 1) {
            this.streakDays++
          } 
          // 如果是同一天，不增加连续天数
          else if (dayDiff === 0) {
            // 不做任何操作
          } 
          // 如果不是连续的，重置连续天数
          else {
            this.streakDays = 1
          }
        } else {
          // 第一次完成目标
          this.streakDays = 1
        }
        
        this.lastCompletedDay = date
      }
    },
    
    // 重置目标
    resetGoals() {
      this.dailyGoalMinutes = 0
      this.weeklyGoalMinutes = 0
      this.dailyGoalSessions = 0
      this.weeklyGoalSessions = 0
      this.streakDays = 0
      this.lastCompletedDay = null
    }
  }
})
