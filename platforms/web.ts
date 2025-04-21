import { reactive, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { useSettings } from '~~/stores/settings'
import { useSchedule } from '~~/stores/schedule'
import { useNotifications } from '~~/stores/notifications'
import { EventType, useEvents } from '~~/stores/events'

interface SoundSettings {
  source: HTMLAudioElement,
  ready: boolean
}

interface WhiteNoiseSettings {
  source?: HTMLAudioElement,
  ready: boolean,
  playing: boolean
}

export function useWeb () {
  const settingsStore = useSettings()
  const scheduleStore = useSchedule()
  const notificationsStore = useNotifications()
  const eventsStore = useEvents()
  const i18n = useI18n()

  const state = reactive({
    currentSoundSet: null as string | null,
    currentWhiteNoiseType: null as string | null,
    sounds: {
      work: null as SoundSettings | null,
      shortpause: null as SoundSettings | null,
      longpause: null as SoundSettings | null
    },
    whiteNoise: null as WhiteNoiseSettings | null,
    isWhiteNoisePlaying: false
  })

  const lastEvent = computed(() => {
    const lastEventArray = eventsStore.events.slice(-1)
    return lastEventArray.length > 0 ? lastEventArray[0] : null
  })

  watch(lastEvent, (newValue) => {
    if (newValue !== null && newValue._event === EventType.TIMER_FINISH) {
      showNotification(scheduleStore.getSchedule[1].type)
    }
  })

  watch(() => settingsStore.audio.soundSet, (newSoundSet) => {
    loadSoundSet(newSoundSet)
  })

  // 监听白噪音设置变化
  watch(() => settingsStore.whiteNoise.enabled, (enabled) => {
    if (enabled) {
      // 如果启用了白噪音，则加载白噪音
      // 但不自动播放，需要用户点击播放按钮
      if (state.currentWhiteNoiseType !== settingsStore.whiteNoise.type || !state.whiteNoise) {
        const audioPath = `/audio/whitenoise/${settingsStore.whiteNoise.type}.mp3`
        console.log(`Loading white noise from: ${audioPath}`)

        // 创建新的音频元素
        const source = new Audio(audioPath)
        source.loop = true

        // 创建新的白噪音对象
        state.whiteNoise = {
          source,
          ready: true,
          playing: false
        }
        state.currentWhiteNoiseType = settingsStore.whiteNoise.type
      }
    } else {
      // 如果禁用了白噪音，则停止播放
      // 重置状态
      state.isWhiteNoisePlaying = false
      if (state.whiteNoise) {
        state.whiteNoise.playing = false
        if (state.whiteNoise.source) {
          state.whiteNoise.source.pause()
          state.whiteNoise.source.currentTime = 0
        }
      }
    }
  })

  // 监听白噪音类型变化
  watch(() => settingsStore.whiteNoise.type, (newType) => {
    if (settingsStore.whiteNoise.enabled) {
      // 当类型变化时，加载新的白噪音，但保持播放状态
      const wasPlaying = state.isWhiteNoisePlaying
      console.log(`White noise type changed to ${newType}, was playing: ${wasPlaying}`)

      // 创建新的音频元素
      const audioPath = `/audio/whitenoise/${newType}.mp3`
      console.log(`Loading white noise from: ${audioPath}`)

      // 如果之前正在播放，先停止当前的白噪音
      if (state.whiteNoise && state.whiteNoise.source) {
        state.whiteNoise.source.pause()
      }

      // 创建新的音频元素
      const source = new Audio(audioPath)
      source.loop = true

      // 创建新的白噪音对象
      state.whiteNoise = {
        source,
        ready: true,
        playing: false
      }
      state.currentWhiteNoiseType = newType

      // 如果之前正在播放，则继续播放新的白噪音
      if (wasPlaying) {
        source.volume = settingsStore.whiteNoise.volume
        source.play()
        state.whiteNoise.playing = true
        state.isWhiteNoisePlaying = true
        console.log('Resumed white noise playback with new type')
      }
    }
  })

  watch(() => settingsStore.whiteNoise.volume, (newVolume) => {
    if (state.whiteNoise && state.whiteNoise.playing && state.whiteNoise.source) {
      state.whiteNoise.source.volume = newVolume
    }
  })

  // 移除根据专注/休息状态自动切换白噪音的逻辑

  eventsStore.$subscribe(() => {
    if (eventsStore.lastEvent !== null && eventsStore.lastEvent._event === EventType.NOTIFICATIONS_ENABLED && window.Notification && window.Notification.permission === 'default') {
      window.Notification.requestPermission().then((newNotificationPermission) => {
        settingsStore.$patch({
          permissions: {
            notifications: newNotificationPermission === 'granted'
          }
        })
      })
    }
  })

  onMounted(() => {
    // Register app started notification
    eventsStore.recordEvent(EventType.APP_STARTED)

    loadSoundSet(settingsStore.audio.soundSet)

    // Load white noise if enabled
    if (settingsStore.whiteNoise.enabled) {
      // 创建新的音频元素
      const audioPath = `/audio/whitenoise/${settingsStore.whiteNoise.type}.mp3`
      console.log(`Loading white noise from: ${audioPath}`)

      const source = new Audio(audioPath)
      source.loop = true

      // 创建新的白噪音对象
      state.whiteNoise = {
        source,
        ready: true,
        playing: false
      }
      state.currentWhiteNoiseType = settingsStore.whiteNoise.type
    }

    // Check Visibility and register in store
    if (window && window.document && 'hidden' in window.document) {
      window.document.addEventListener('visibilitychange', () => {
        settingsStore.registerNewHidden(window.document.hidden)
      }, false)

      // Commit this information immediately to make sure it's up to date
      settingsStore.registerNewHidden(window.document.hidden)
    } else {
      settingsStore.registerNewHidden(false)
    }

    // Check permissions
    notificationsStore.updateEnabled()
  })

  /**
  * Load a sound set into memory
  * @param setName Name of the sound set to load
  */
  const loadSoundSet = (setName = settingsStore.audio.soundSet) => {
    if (state.currentSoundSet === setName) { return }

    try {
      for (const key in state.sounds) {
        const soundKey = key as keyof typeof state.sounds
        const newSound = {
          source: new Audio(`/audio/${setName}/${key}.mp3`),
          ready: false
        }

        newSound.source.addEventListener('canplay', () => {
          newSound.ready = true
        })

        state.sounds[soundKey] = newSound
      }

      state.currentSoundSet = setName
    } catch (err) {
      console.warn(err)
    }
  }

  /**
   * Play the specified sound
   * @param {String} key The key of the sound. Valid values are `work`, `pause` and `longpause`.
   */
  const playSound = (key: keyof typeof state.sounds) => {
    // load sound set if not already loaded
    if (!state.currentSoundSet) {
      loadSoundSet(settingsStore.audio.soundSet)
    }

    if (state.sounds[key] !== null && settingsStore.permissions.audio) {
      state.sounds[key]!.source.volume = settingsStore.audio.volume
      state.sounds[key]?.source.play()
    }
  }

  const showNotification = (nextState: keyof typeof state.sounds) => {
    playSound(nextState)

    // TODO Firefox does not support actions
    if (window.Notification.permission !== 'granted' || settingsStore.permissions.notifications !== true) { return }

    try {
      new Notification(i18n.t('notification.' + nextState + '.title'), { // eslint-disable-line no-new
        tag: 'FocusTide-SectionNotify',
        body: i18n.t('notification.' + nextState + '.body')
      })
    } catch (err) {
      console.warn(err)
    }
  }



  /**
   * Toggle white noise playback
   * @returns Current playing state after toggle
   */
  const toggleWhiteNoise = () => {
    console.log('Toggle white noise called, current state:', state.isWhiteNoisePlaying)

    try {
      // 简化逻辑，只关注播放/暂停状态
      if (state.isWhiteNoisePlaying) {
        // 如果正在播放，则停止
        console.log('Stopping white noise...')

        // 先重置状态
        state.isWhiteNoisePlaying = false
        if (state.whiteNoise) {
          state.whiteNoise.playing = false
        }

        // 然后停止音频
        if (state.whiteNoise && state.whiteNoise.source) {
          state.whiteNoise.source.pause()
          state.whiteNoise.source.currentTime = 0
        }

        console.log('White noise stopped')
        return false
      } else {
        // 如果没有播放，则开始播放
        console.log('Starting white noise...')

        // 确保白噪音已加载
        if (!state.whiteNoise || !state.whiteNoise.source || state.currentWhiteNoiseType !== settingsStore.whiteNoise.type) {
          // 加载当前选择的白噪音类型
          const audioPath = `/audio/whitenoise/${settingsStore.whiteNoise.type}.mp3`
          console.log(`Loading white noise from: ${audioPath}`)

          // 创建新的音频元素
          const source = new Audio(audioPath)
          source.loop = true

          // 创建新的白噪音对象
          state.whiteNoise = {
            source,
            ready: true,
            playing: false
          }
          state.currentWhiteNoiseType = settingsStore.whiteNoise.type
        }

        // 设置音量并播放
        if (state.whiteNoise && state.whiteNoise.source) {
          state.whiteNoise.source.volume = settingsStore.whiteNoise.volume
          state.whiteNoise.source.play()

          // 设置状态
          state.whiteNoise.playing = true
          state.isWhiteNoisePlaying = true

          console.log('White noise started')
          return true
        }

        return false
      }
    } catch (err) {
      console.error('Error toggling white noise:', err)
      // 出错时重置状态
      if (state.whiteNoise) {
        state.whiteNoise.playing = false
      }
      state.isWhiteNoisePlaying = false
      return false
    }
  }

  /**
   * Check if white noise is currently playing
   * @returns Boolean indicating if white noise is playing
   */
  const isWhiteNoisePlaying = () => {
    // 直接返回状态标志
    return state.isWhiteNoisePlaying
  }



  // 返回公共方法
  return {
    toggleWhiteNoise,
    isWhiteNoisePlaying
  }
}