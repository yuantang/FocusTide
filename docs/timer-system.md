# 计时器系统

FocusTide 的核心是一个灵活且功能丰富的计时器系统，支持番茄钟技术和多种计时模式。

## 🎯 系统概述

计时器系统基于以下核心概念：

- **会话 (Session)**: 一个完整的工作或休息时间段
- **区段 (Section)**: 不同类型的时间段（工作、短休息、长休息）
- **日程 (Schedule)**: 多个区段的有序组合
- **计时器状态**: 运行、暂停、停止等状态管理

## 🏗️ 架构设计

### 核心组件

```
计时器系统
├── TimerController     # 计时器控制器
├── ScheduleManager     # 日程管理器
├── TimerDisplay        # 显示组件
├── TimerControls       # 控制组件
└── TimerSettings       # 设置组件
```

### 状态管理

```typescript
// stores/main.ts - 主要计时器状态
interface TimerState {
  // 基础状态
  isRunning: boolean
  isPaused: boolean
  currentTime: number
  
  // 日程相关
  currentSectionIndex: number
  schedule: ScheduleItem[]
  
  // 会话统计
  completedSessions: number
  totalFocusTime: number
  
  // 显示模式
  displayMode: 'traditional' | 'approximate' | 'percentage'
}
```

## ⚙️ 核心功能

### 1. 计时器控制

#### 基础控制方法

```typescript
// stores/main.ts
export const useMain = defineStore('main', {
  actions: {
    // 开始计时器
    startTimer() {
      if (!this.isRunning) {
        this.isRunning = true
        this.isPaused = false
        this.startTicking()
      }
    },
    
    // 暂停计时器
    pauseTimer() {
      this.isRunning = false
      this.isPaused = true
      this.stopTicking()
    },
    
    // 重置计时器
    resetTimer() {
      this.isRunning = false
      this.isPaused = false
      this.currentTime = this.getCurrentSectionDuration()
    },
    
    // 跳过当前区段
    skipSection() {
      this.completeCurrentSection()
      this.advanceToNextSection()
    }
  }
})
```

#### 计时逻辑

```typescript
// components/ticker.ts
export class TimerTicker {
  private intervalId: number | null = null
  private callbacks: Set<() => void> = new Set()
  
  start() {
    if (this.intervalId) return
    
    this.intervalId = setInterval(() => {
      this.callbacks.forEach(callback => callback())
    }, 1000) // 每秒触发
  }
  
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }
  
  subscribe(callback: () => void) {
    this.callbacks.add(callback)
  }
  
  unsubscribe(callback: () => void) {
    this.callbacks.delete(callback)
  }
}
```

### 2. 日程管理

#### 日程结构

```typescript
// 区段类型
export enum SectionType {
  WORK = 'work',
  SHORT_BREAK = 'shortBreak',
  LONG_BREAK = 'longBreak'
}

// 日程项
export interface ScheduleItem {
  type: SectionType
  duration: number // 秒
  label: string
  color: string
}

// 默认日程配置
export const DEFAULT_SCHEDULE: ScheduleItem[] = [
  { type: SectionType.WORK, duration: 1500, label: 'Work', color: '#ef4444' },
  { type: SectionType.SHORT_BREAK, duration: 300, label: 'Short Break', color: '#10b981' },
  { type: SectionType.WORK, duration: 1500, label: 'Work', color: '#ef4444' },
  { type: SectionType.SHORT_BREAK, duration: 300, label: 'Short Break', color: '#10b981' },
  { type: SectionType.WORK, duration: 1500, label: 'Work', color: '#ef4444' },
  { type: SectionType.SHORT_BREAK, duration: 300, label: 'Short Break', color: '#10b981' },
  { type: SectionType.WORK, duration: 1500, label: 'Work', color: '#ef4444' },
  { type: SectionType.LONG_BREAK, duration: 900, label: 'Long Break', color: '#3b82f6' }
]
```

#### 日程管理器

```typescript
export class ScheduleManager {
  private schedule: ScheduleItem[]
  private currentIndex: number = 0
  
  constructor(schedule: ScheduleItem[]) {
    this.schedule = schedule
  }
  
  getCurrentSection(): ScheduleItem {
    return this.schedule[this.currentIndex]
  }
  
  getNextSection(): ScheduleItem | null {
    const nextIndex = this.currentIndex + 1
    return nextIndex < this.schedule.length ? this.schedule[nextIndex] : null
  }
  
  advance(): boolean {
    if (this.currentIndex < this.schedule.length - 1) {
      this.currentIndex++
      return true
    }
    return false
  }
  
  reset(): void {
    this.currentIndex = 0
  }
  
  getProgress(): number {
    return (this.currentIndex + 1) / this.schedule.length
  }
}
```

### 3. 显示模式

#### 传统模式 (Traditional)

```vue
<!-- components/timer/display/traditionalTimer.vue -->
<template>
  <div class="traditional-timer">
    <div class="time-display">
      {{ formattedTime }}
    </div>
    <div class="section-label">
      {{ currentSection.label }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMain } from '~/stores/main'

const mainStore = useMain()

const formattedTime = computed(() => {
  const time = mainStore.currentTime
  const hours = Math.floor(time / 3600)
  const minutes = Math.floor((time % 3600) / 60)
  const seconds = time % 60
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

const currentSection = computed(() => mainStore.getCurrentSection())
</script>
```

#### 近似模式 (Approximate)

```vue
<!-- components/timer/display/approximateTimer.vue -->
<template>
  <div class="approximate-timer">
    <div class="time-display">
      {{ approximateTime }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMain } from '~/stores/main'
import { useI18n } from 'vue-i18n'

const mainStore = useMain()
const { t } = useI18n()

const approximateTime = computed(() => {
  const time = mainStore.currentTime
  const minutes = Math.ceil(time / 60)
  
  if (minutes <= 0) {
    return t('timer.finished')
  } else if (minutes === 1) {
    return t('timer.oneMinute')
  } else {
    return t('timer.minutesLeft', { minutes })
  }
})
</script>
```

#### 百分比模式 (Percentage)

```vue
<!-- components/timer/display/percentageTimer.vue -->
<template>
  <div class="percentage-timer">
    <div class="percentage-display">
      {{ percentage }}%
    </div>
    <div class="progress-ring">
      <svg class="progress-svg" viewBox="0 0 100 100">
        <circle
          class="progress-background"
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          stroke-width="8"
          opacity="0.1"
        />
        <circle
          class="progress-bar"
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          stroke-width="8"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="strokeDashoffset"
          transform="rotate(-90 50 50)"
        />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMain } from '~/stores/main'

const mainStore = useMain()

const percentage = computed(() => {
  const current = mainStore.currentTime
  const total = mainStore.getCurrentSectionDuration()
  return Math.round(((total - current) / total) * 100)
})

const circumference = 2 * Math.PI * 45

const strokeDashoffset = computed(() => {
  const progress = percentage.value / 100
  return circumference * (1 - progress)
})
</script>
```

### 4. 音频通知

#### 音频管理器

```typescript
// services/audioService.ts
export class AudioService {
  private audioContext: AudioContext | null = null
  private sounds: Map<string, AudioBuffer> = new Map()
  
  async initialize() {
    this.audioContext = new AudioContext()
    await this.loadSounds()
  }
  
  private async loadSounds() {
    const soundFiles = [
      { name: 'work-end', url: '/audio/work-end.mp3' },
      { name: 'break-end', url: '/audio/break-end.mp3' }
    ]
    
    for (const sound of soundFiles) {
      const buffer = await this.loadSound(sound.url)
      this.sounds.set(sound.name, buffer)
    }
  }
  
  private async loadSound(url: string): Promise<AudioBuffer> {
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    return this.audioContext!.decodeAudioData(arrayBuffer)
  }
  
  play(soundName: string) {
    const buffer = this.sounds.get(soundName)
    if (!buffer || !this.audioContext) return
    
    const source = this.audioContext.createBufferSource()
    source.buffer = buffer
    source.connect(this.audioContext.destination)
    source.start()
  }
}
```

### 5. 通知系统

#### 桌面通知

```typescript
// services/notificationService.ts
export class NotificationService {
  private permission: NotificationPermission = 'default'
  
  async requestPermission(): Promise<boolean> {
    if ('Notification' in window) {
      this.permission = await Notification.requestPermission()
      return this.permission === 'granted'
    }
    return false
  }
  
  show(title: string, options?: NotificationOptions) {
    if (this.permission === 'granted') {
      new Notification(title, {
        icon: '/icon.png',
        badge: '/icon.png',
        ...options
      })
    }
  }
  
  showSectionComplete(sectionType: SectionType) {
    const messages = {
      [SectionType.WORK]: 'Work session completed! Time for a break.',
      [SectionType.SHORT_BREAK]: 'Break time is over! Ready to focus?',
      [SectionType.LONG_BREAK]: 'Long break finished! Let\'s get back to work.'
    }
    
    this.show('FocusTide', {
      body: messages[sectionType],
      tag: 'section-complete'
    })
  }
}
```

## 🎛️ 设置配置

### 计时器设置

```typescript
// stores/settings.ts
interface TimerSettings {
  // 时间设置
  workDuration: number        // 工作时长（分钟）
  shortBreakDuration: number  // 短休息时长（分钟）
  longBreakDuration: number   // 长休息时长（分钟）
  longBreakInterval: number   // 长休息间隔（几个工作周期后）
  
  // 显示设置
  displayMode: 'traditional' | 'approximate' | 'percentage'
  showProgress: boolean
  showSchedule: boolean
  
  // 行为设置
  autoStartBreaks: boolean    // 自动开始休息
  autoStartWork: boolean      // 自动开始工作
  continueAfterComplete: boolean // 完成后继续计时
  
  // 通知设置
  enableSounds: boolean
  enableNotifications: boolean
  soundVolume: number
}
```

### 预设配置

```typescript
// assets/settings/timerPresets.ts
export const TIMER_PRESETS = {
  classic: {
    name: 'Classic Pomodoro',
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4
  },
  
  extended: {
    name: 'Extended Focus',
    workDuration: 50,
    shortBreakDuration: 10,
    longBreakDuration: 30,
    longBreakInterval: 3
  },
  
  quick: {
    name: 'Quick Sessions',
    workDuration: 15,
    shortBreakDuration: 3,
    longBreakDuration: 10,
    longBreakInterval: 5
  }
}
```

## 📊 统计和分析

### 会话统计

```typescript
// stores/focusStats.ts
interface FocusSession {
  id: string
  startTime: Date
  endTime: Date
  duration: number
  type: SectionType
  completed: boolean
  interruptions: number
}

export const useFocusStats = defineStore('focusStats', {
  state: () => ({
    sessions: [] as FocusSession[],
    dailyGoal: 4, // 每日目标会话数
    weeklyGoal: 20 // 每周目标会话数
  }),
  
  getters: {
    todaySessions: (state) => {
      const today = new Date().toDateString()
      return state.sessions.filter(session => 
        session.startTime.toDateString() === today
      )
    },
    
    totalFocusTime: (state) => {
      return state.sessions
        .filter(session => session.type === SectionType.WORK && session.completed)
        .reduce((total, session) => total + session.duration, 0)
    },
    
    completionRate: (state) => {
      const completed = state.sessions.filter(session => session.completed).length
      return state.sessions.length > 0 ? completed / state.sessions.length : 0
    }
  }
})
```

---

**下一步**: 查看 [任务管理](./task-management.md) 了解待办事项系统
