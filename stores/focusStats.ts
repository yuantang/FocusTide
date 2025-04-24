import { defineStore } from 'pinia'
import { EventType } from './events'
import { ScheduleItemType } from './schedule'

export interface FocusSession {
  id: string;
  startTime: string;
  endTime: string;
  duration: number; // 持续时间（毫秒）
  completed: boolean; // 是否完成（未中断）
  type: ScheduleItemType; // 专注类型（工作、短休息、长休息）
  interruptions: number; // 中断次数
}

export interface DailyStats {
  date: string;
  totalDuration: number;
  sessionsCount: number;
  completedCount: number;
  workDuration: number;
  workCount: number;
}

export interface WeeklyStats {
  weekStart: string;
  totalDuration: number;
  sessionsCount: number;
  completedCount: number;
  workDuration: number;
  workCount: number;
}

export interface MonthlyStats {
  month: string;
  totalDuration: number;
  sessionsCount: number;
  completedCount: number;
  workDuration: number;
  workCount: number;
}

export interface FocusStatsState {
  sessions: FocusSession[];
  currentSession: FocusSession | null;
  dailyStats: DailyStats[];
  weeklyStats: WeeklyStats[];
  monthlyStats: MonthlyStats[];
  lastCalculated: string | null;
  streakDays: number; // 连续专注天数
  lastFocusDay: string | null; // 最后一次专注的日期
  focusQualityScore: number; // 专注质量评分 (0-100)
  focusEfficiencyScore: number; // 专注效率评分 (0-100)
  focusHabitScore: number; // 专注习惯评分 (0-100)
}

export const useFocusStats = defineStore('focusStats', {
  state: (): FocusStatsState => ({
    sessions: [],
    currentSession: null,
    dailyStats: [],
    weeklyStats: [],
    monthlyStats: [],
    lastCalculated: null,
    streakDays: 0,
    lastFocusDay: null,
    focusQualityScore: 0,
    focusEfficiencyScore: 0,
    focusHabitScore: 0
  }),

  getters: {
    // 总专注时长（毫秒）
    totalFocusDuration: (state) => {
      return state.sessions.reduce((total, session) => {
        if (session.type === ScheduleItemType.WORK) {
          return total + session.duration
        }
        return total
      }, 0)
    },

    // 总专注次数
    totalFocusSessions: (state) => {
      return state.sessions.filter(session => session.type === ScheduleItemType.WORK).length
    },

    // 完成的专注次数
    completedFocusSessions: (state) => {
      return state.sessions.filter(session =>
        session.type === ScheduleItemType.WORK && session.completed
      ).length
    },

    // 专注完成率
    focusCompletionRate: (state): number => {
      const totalSessions = state.sessions.filter(session => session.type === ScheduleItemType.WORK).length
      if (totalSessions === 0) return 0

      const completedSessions = state.sessions.filter(session =>
        session.type === ScheduleItemType.WORK && session.completed
      ).length

      return completedSessions / totalSessions
    },

    // 平均专注时长（毫秒）
    averageFocusDuration: (state): number => {
      const workSessions = state.sessions.filter(session => session.type === ScheduleItemType.WORK)
      if (workSessions.length === 0) return 0

      const totalDuration = workSessions.reduce((total, session) => total + session.duration, 0)
      return totalDuration / workSessions.length
    },

    // 最近7天的每日统计
    recentDailyStats: (state): DailyStats[] => {
      // 确保有统计数据
      if (state.dailyStats.length === 0) return []

      // 获取最近7天的数据
      return state.dailyStats.slice(-7)
    },

    // 最近4周的每周统计
    recentWeeklyStats: (state): WeeklyStats[] => {
      // 确保有统计数据
      if (state.weeklyStats.length === 0) return []

      // 获取最近4周的数据
      return state.weeklyStats.slice(-4)
    },

    // 最近6个月的每月统计
    recentMonthlyStats: (state): MonthlyStats[] => {
      // 确保有统计数据
      if (state.monthlyStats.length === 0) return []

      // 获取最近6个月的数据
      return state.monthlyStats.slice(-6)
    },

    // 最高效的工作时段（小时，0-23）
    mostProductiveHour: (state): number | null => {
      if (state.sessions.length === 0) return null

      // 按小时统计工作时长
      const hourlyDuration: number[] = Array(24).fill(0)

      state.sessions.forEach(session => {
        if (session.type === ScheduleItemType.WORK) {
          const hour = new Date(session.startTime).getHours()
          hourlyDuration[hour] += session.duration
        }
      })

      // 找出时长最长的小时
      let maxDuration = 0
      let maxHour = 0

      hourlyDuration.forEach((duration, hour) => {
        if (duration > maxDuration) {
          maxDuration = duration
          maxHour = hour
        }
      })

      return maxDuration > 0 ? maxHour : null
    },

    // 最高效的工作日（星期几，0-6，0表示星期日）
    mostProductiveDay: (state): number | null => {
      if (state.sessions.length === 0) return null

      // 按星期几统计工作时长
      const dailyDuration: number[] = Array(7).fill(0)

      state.sessions.forEach(session => {
        if (session.type === ScheduleItemType.WORK) {
          const day = new Date(session.startTime).getDay()
          dailyDuration[day] += session.duration
        }
      })

      // 找出时长最长的星期几
      let maxDuration = 0
      let maxDay = 0

      dailyDuration.forEach((duration, day) => {
        if (duration > maxDuration) {
          maxDuration = duration
          maxDay = day
        }
      })

      return maxDuration > 0 ? maxDay : null
    },

    // 专注质量评分 (0-100)
    focusQualityRating: (state): number => {
      if (state.sessions.length === 0) return 0

      const workSessions = state.sessions.filter(session => session.type === ScheduleItemType.WORK)
      if (workSessions.length === 0) return 0

      // 计算完成率权重 (60%)
      const completionRate = state.focusCompletionRate
      const completionScore = completionRate * 60

      // 计算平均时长权重 (20%)
      // 假设理想专注时长为25分钟
      const idealDuration = 25 * 60 * 1000 // 25分钟转为毫秒
      const avgDuration = state.averageFocusDuration
      // 如果平均时长接近理想时长，得分更高
      const durationRatio = Math.min(avgDuration / idealDuration, 2) // 最高为2倍理想时长
      const durationScore = durationRatio > 1
        ? 20 - Math.min(((durationRatio - 1) * 10), 10) // 超过理想时长，扣分
        : durationRatio * 20 // 未达到理想时长，按比例得分

      // 计算中断率权重 (20%)
      const avgInterruptions = workSessions.reduce((sum, session) => sum + session.interruptions, 0) / workSessions.length
      // 中断越少，得分越高
      const interruptionScore = Math.max(0, 20 - (avgInterruptions * 5)) // 每次中断扣5分

      // 总分
      return Math.round(completionScore + durationScore + interruptionScore)
    },

    // 专注效率评分 (0-100)
    focusEfficiencyRating: (state): number => {
      if (state.sessions.length === 0) return 0

      const workSessions = state.sessions.filter(session => session.type === ScheduleItemType.WORK)
      if (workSessions.length === 0) return 0

      // 计算完成率权重 (40%)
      const completionRate = state.focusCompletionRate
      const completionScore = completionRate * 40

      // 计算中断率权重 (30%)
      const avgInterruptions = workSessions.reduce((sum, session) => sum + session.interruptions, 0) / workSessions.length
      // 中断越少，得分越高
      const interruptionScore = Math.max(0, 30 - (avgInterruptions * 7.5)) // 每次中断扣7.5分

      // 计算专注频率权重 (30%)
      // 检查最近7天的专注情况
      const now = new Date()
      const oneWeekAgo = new Date(now)
      oneWeekAgo.setDate(now.getDate() - 7)

      // 统计最近7天中有专注的天数
      const recentDays = new Set()
      workSessions.forEach(session => {
        const sessionDate = new Date(session.startTime)
        if (sessionDate >= oneWeekAgo && sessionDate <= now) {
          recentDays.add(session.startTime.split('T')[0])
        }
      })

      // 计算频率得分，每天满分约4.3分
      const frequencyScore = Math.min(recentDays.size * 4.3, 30)

      // 总分
      return Math.round(completionScore + interruptionScore + frequencyScore)
    },

    // 专注习惯评分 (0-100)
    focusHabitRating: (state): number => {
      if (state.sessions.length === 0) return 0

      // 计算连续专注天数权重 (30%)
      const streakScore = Math.min(state.streakDays * 6, 30) // 每天6分，最高30分

      // 计算专注规律性权重 (40%)
      // 检查最近30天的专注情况
      const now = new Date()
      const thirtyDaysAgo = new Date(now)
      thirtyDaysAgo.setDate(now.getDate() - 30)

      // 统计最近30天中每天的专注次数
      const dailyFocusCounts = new Map<string, number>()
      state.sessions.forEach(session => {
        const sessionDate = new Date(session.startTime)
        if (sessionDate >= thirtyDaysAgo && sessionDate <= now && session.type === ScheduleItemType.WORK) {
          const dateStr = session.startTime.split('T')[0]
          dailyFocusCounts.set(dateStr, (dailyFocusCounts.get(dateStr) || 0) + 1)
        }
      })

      // 计算标准差，标准差越小表示规律性越好
      const counts = Array.from(dailyFocusCounts.values())
      if (counts.length === 0) return streakScore // 如果没有数据，只返回连续天数得分

      const avg = counts.reduce((sum, count) => sum + count, 0) / counts.length
      const variance = counts.reduce((sum, count) => sum + Math.pow(count - avg, 2), 0) / counts.length
      const stdDev = Math.sqrt(variance)

      // 标准差越小，规律性越好，得分越高
      const regularityScore = Math.max(0, 40 - (stdDev * 10))

      // 计算专注时段一致性权重 (30%)
      // 检查专注时段的分布
      const hourCounts = Array(24).fill(0)
      state.sessions.forEach(session => {
        if (session.type === ScheduleItemType.WORK) {
          const hour = new Date(session.startTime).getHours()
          hourCounts[hour] += 1
        }
      })

      // 计算专注时段的集中度
      const totalSessions = hourCounts.reduce((sum, count) => sum + count, 0)
      const hourPercentages = hourCounts.map(count => count / totalSessions)

      // 找出最集中的3个小时
      const sortedPercentages = [...hourPercentages].sort((a, b) => b - a)
      const top3Percentage = sortedPercentages.slice(0, 3).reduce((sum, p) => sum + p, 0)

      // 时段越集中，得分越高
      const consistencyScore = Math.min(top3Percentage * 100, 30)

      // 总分
      return Math.round(streakScore + regularityScore + consistencyScore)
    },

    // 获取专注时段分布
    hourlyDistribution: (state): number[] => {
      const hourCounts = Array(24).fill(0)

      state.sessions.forEach(session => {
        if (session.type === ScheduleItemType.WORK) {
          const hour = new Date(session.startTime).getHours()
          hourCounts[hour] += 1
        }
      })

      return hourCounts
    },

    // 获取一周专注分布（按星期几）
    weekdayDistribution: (state): number[] => {
      const dayCounts = Array(7).fill(0)

      state.sessions.forEach(session => {
        if (session.type === ScheduleItemType.WORK) {
          const day = new Date(session.startTime).getDay()
          dayCounts[day] += 1
        }
      })

      return dayCounts
    }
  },

  actions: {
    // 开始一次新的专注会话
    startSession(type: ScheduleItemType) {
      const now = new Date()
      this.currentSession = {
        id: now.getTime().toString(),
        startTime: now.toISOString(),
        endTime: now.toISOString(), // 将在结束时更新
        duration: 0, // 将在结束时计算
        completed: false,
        type,
        interruptions: 0
      }
    },

    // 结束当前专注会话
    endSession(completed: boolean = true) {
      if (!this.currentSession) return

      const now = new Date()
      this.currentSession.endTime = now.toISOString()
      this.currentSession.duration = now.getTime() - new Date(this.currentSession.startTime).getTime()
      this.currentSession.completed = completed

      // 添加到会话列表
      this.sessions.push({ ...this.currentSession })
      this.currentSession = null

      // 更新统计数据
      this.calculateStats()

      // 更新最后专注日期
      this.lastFocusDay = now.toISOString().split('T')[0]
    },

    // 记录中断
    recordInterruption() {
      if (this.currentSession) {
        this.currentSession.interruptions += 1
      }
    },

    // 计算统计数据
    calculateStats() {
      if (this.sessions.length === 0) return

      // 计算每日统计
      this.calculateDailyStats()

      // 计算每周统计
      this.calculateWeeklyStats()

      // 计算每月统计
      this.calculateMonthlyStats()

      // 计算连续专注天数
      this.calculateStreakDays()

      // 计算评分
      this.calculateScores()

      // 更新计算时间
      this.lastCalculated = new Date().toISOString()
    },

    // 计算每日统计
    calculateDailyStats() {
      // 按日期分组
      const dailyMap = new Map<string, DailyStats>()

      this.sessions.forEach(session => {
        const date = session.startTime.split('T')[0]

        if (!dailyMap.has(date)) {
          dailyMap.set(date, {
            date,
            totalDuration: 0,
            sessionsCount: 0,
            completedCount: 0,
            workDuration: 0,
            workCount: 0
          })
        }

        const stats = dailyMap.get(date)!
        stats.totalDuration += session.duration
        stats.sessionsCount += 1

        if (session.completed) {
          stats.completedCount += 1
        }

        if (session.type === ScheduleItemType.WORK) {
          stats.workDuration += session.duration
          stats.workCount += 1
        }
      })

      // 转换为数组并排序
      this.dailyStats = Array.from(dailyMap.values())
        .sort((a, b) => a.date.localeCompare(b.date))
    },

    // 计算每周统计
    calculateWeeklyStats() {
      // 按周分组
      const weeklyMap = new Map<string, WeeklyStats>()

      this.sessions.forEach(session => {
        const date = new Date(session.startTime)
        const weekStart = getWeekStart(date).toISOString().split('T')[0]

        if (!weeklyMap.has(weekStart)) {
          weeklyMap.set(weekStart, {
            weekStart,
            totalDuration: 0,
            sessionsCount: 0,
            completedCount: 0,
            workDuration: 0,
            workCount: 0
          })
        }

        const stats = weeklyMap.get(weekStart)!
        stats.totalDuration += session.duration
        stats.sessionsCount += 1

        if (session.completed) {
          stats.completedCount += 1
        }

        if (session.type === ScheduleItemType.WORK) {
          stats.workDuration += session.duration
          stats.workCount += 1
        }
      })

      // 转换为数组并排序
      this.weeklyStats = Array.from(weeklyMap.values())
        .sort((a, b) => a.weekStart.localeCompare(b.weekStart))
    },

    // 计算每月统计
    calculateMonthlyStats() {
      // 按月分组
      const monthlyMap = new Map<string, MonthlyStats>()

      this.sessions.forEach(session => {
        const month = session.startTime.substring(0, 7) // YYYY-MM

        if (!monthlyMap.has(month)) {
          monthlyMap.set(month, {
            month,
            totalDuration: 0,
            sessionsCount: 0,
            completedCount: 0,
            workDuration: 0,
            workCount: 0
          })
        }

        const stats = monthlyMap.get(month)!
        stats.totalDuration += session.duration
        stats.sessionsCount += 1

        if (session.completed) {
          stats.completedCount += 1
        }

        if (session.type === ScheduleItemType.WORK) {
          stats.workDuration += session.duration
          stats.workCount += 1
        }
      })

      // 转换为数组并排序
      this.monthlyStats = Array.from(monthlyMap.values())
        .sort((a, b) => a.month.localeCompare(b.month))
    },

    // 导入会话数据（用于测试或数据迁移）
    importSessions(sessions: FocusSession[]) {
      this.sessions = sessions
      this.calculateStats()
    },

    // 计算连续专注天数
    calculateStreakDays() {
      if (this.sessions.length === 0) {
        this.streakDays = 0
        this.lastFocusDay = null
        return
      }

      // 获取所有工作专注日期
      const workDays = new Set<string>()
      this.sessions.forEach(session => {
        if (session.type === ScheduleItemType.WORK) {
          workDays.add(session.startTime.split('T')[0])
        }
      })

      // 将日期转换为数组并排序
      const sortedDays = Array.from(workDays).sort()

      if (sortedDays.length === 0) {
        this.streakDays = 0
        this.lastFocusDay = null
        return
      }

      // 最后一次专注的日期
      this.lastFocusDay = sortedDays[sortedDays.length - 1]

      // 如果最后一次专注不是今天或昨天，则连续天数为0
      const today = new Date().toISOString().split('T')[0]
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

      if (this.lastFocusDay !== today && this.lastFocusDay !== yesterday) {
        this.streakDays = 0
        return
      }

      // 计算连续天数
      let streak = 1 // 至少有一天
      let currentDate = new Date(this.lastFocusDay)

      while (streak < sortedDays.length) {
        // 检查前一天
        currentDate.setDate(currentDate.getDate() - 1)
        const prevDay = currentDate.toISOString().split('T')[0]

        // 如果前一天没有专注，则连续天数结束
        if (!workDays.has(prevDay)) {
          break
        }

        streak++
      }

      this.streakDays = streak
    },

    // 计算各种评分
    calculateScores() {
      // 专注质量评分
      this.focusQualityScore = this.focusQualityRating

      // 专注效率评分
      this.focusEfficiencyScore = this.focusEfficiencyRating

      // 专注习惯评分
      this.focusHabitScore = this.focusHabitRating
    },

    // 清除所有数据
    clearAllData() {
      this.sessions = []
      this.currentSession = null
      this.dailyStats = []
      this.weeklyStats = []
      this.monthlyStats = []
      this.lastCalculated = null
      this.streakDays = 0
      this.lastFocusDay = null
      this.focusQualityScore = 0
      this.focusEfficiencyScore = 0
      this.focusHabitScore = 0
    }
  }
})

// 辅助函数：获取日期所在周的周一
function getWeekStart(date: Date): Date {
  const result = new Date(date)
  const day = result.getDay()
  const diff = result.getDate() - day + (day === 0 ? -6 : 1) // 调整为周一为一周的开始
  result.setDate(diff)
  result.setHours(0, 0, 0, 0)
  return result
}
