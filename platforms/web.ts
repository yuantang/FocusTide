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
      loadWhiteNoise(settingsStore.whiteNoise.type)
    } else {
      // 如果禁用了白噪音，则停止播放
      stopWhiteNoise()
    }
  })

  // 监听白噪音类型变化
  watch(() => settingsStore.whiteNoise.type, (newType) => {
    if (settingsStore.whiteNoise.enabled) {
      // 当类型变化时，加载新的白噪音，但保持播放状态
      const wasPlaying = state.isWhiteNoisePlaying
      console.log(`White noise type changed to ${newType}, was playing: ${wasPlaying}`)

      // 如果之前没有播放，只需要加载新的白噪音
      if (!wasPlaying) {
        loadWhiteNoise(newType)
      } else {
        // 如果之前正在播放，先停止当前的白噪音，然后加载新的白噪音并播放
        if (state.whiteNoise && state.whiteNoise.source) {
          state.whiteNoise.source.pause()
        }

        // 设置播放状态为true，这样loadWhiteNoise函数会在加载完成后自动播放
        state.isWhiteNoisePlaying = true
        loadWhiteNoise(newType)
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
      loadWhiteNoise(settingsStore.whiteNoise.type)
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
   * Load white noise audio file
   * @param type Type of white noise to load
   */
  const loadWhiteNoise = (type = settingsStore.whiteNoise.type) => {
    if (state.currentWhiteNoiseType === type && state.whiteNoise !== null && state.whiteNoise.ready) { return }

    try {
      // 记录当前的播放状态，以便在加载新的白噪音后继续播放
      const wasPlaying = state.isWhiteNoisePlaying
      console.log(`Loading white noise: ${type}, was playing: ${wasPlaying}`)

      // 暂停当前的音频，但不重置状态
      if (state.whiteNoise && state.whiteNoise.source) {
        state.whiteNoise.source.pause()
      }

      // Create new audio element with absolute path
      const audioPath = `/audio/whitenoise/${type}.mp3`
      console.log(`Loading white noise from: ${audioPath}`)
      const source = new Audio(audioPath)
      source.loop = true

      // 预加载音频
      source.load()

      // Add error event listener
      source.addEventListener('error', (e) => {
        console.error(`Error loading white noise: ${type}`, e)
        // 加载出错时重置状态
        state.isWhiteNoisePlaying = false
      })

      const newSound = {
        source,
        ready: false,
        playing: false // 初始化为非播放状态，等待准备完成后再决定是否播放
      } as { source: HTMLAudioElement; ready: boolean; playing: boolean }

      // Set up event listener for when audio is ready
      source.addEventListener('canplay', () => {
        console.log(`White noise ready: ${type}`)
        newSound.ready = true

        // 如果之前是播放状态，则自动播放新的白噪音
        if (wasPlaying) {
          console.log('Resuming white noise playback with new type')
          source.volume = settingsStore.whiteNoise.volume
          try {
            source.play()
            newSound.playing = true
            state.isWhiteNoisePlaying = true
            console.log('White noise playback resumed successfully')
          } catch (e) {
            console.error('Error playing audio:', e)
            newSound.playing = false
            state.isWhiteNoisePlaying = false
          }
        }
      })

      state.whiteNoise = newSound
      state.currentWhiteNoiseType = type

      // 不要在这里设置 isWhiteNoisePlaying，因为音频可能还没有准备好
      // 如果之前是播放状态，则保持播放状态，等待canplay事件中的实际播放
    } catch (err) {
      console.error(`Exception loading white noise: ${type}`, err)
      state.isWhiteNoisePlaying = false
    }
  }

  /**
   * Play white noise audio file
   */
  const playWhiteNoise = () => {
    if (!settingsStore.whiteNoise.enabled) {
      state.isWhiteNoisePlaying = false
      return
    }

    // Load white noise if not already loaded
    if (state.currentWhiteNoiseType !== settingsStore.whiteNoise.type || state.whiteNoise === null) {
      console.log(`Need to load white noise: ${settingsStore.whiteNoise.type}`)
      // 设置播放状态为true，这样loadWhiteNoise函数会在加载完成后自动播放
      state.isWhiteNoisePlaying = true
      loadWhiteNoise(settingsStore.whiteNoise.type)
      return // loadWhiteNoise will handle playback when ready
    }

    if (state.whiteNoise !== null && settingsStore.permissions.audio) {
      // If already playing, don't restart
      if (state.whiteNoise.playing) {
        state.isWhiteNoisePlaying = true
        return
      }

      try {
        const { source } = state.whiteNoise
        if (!source) {
          console.error('No source available for white noise')
          state.isWhiteNoisePlaying = false
          return
        }
        if (!state.whiteNoise.ready) {
          console.log('White noise not ready yet, setting state to play when ready')
          // 设置播放状态为true，等待音频准备好后自动播放
          state.isWhiteNoisePlaying = true
          return
        }

        console.log(`Playing white noise: ${state.currentWhiteNoiseType}`)
        // Set volume and play
        source.volume = settingsStore.whiteNoise.volume
        try {
          source.play()
          state.whiteNoise.playing = true
          state.isWhiteNoisePlaying = true
          console.log('White noise playback started successfully')
        } catch (e) {
          console.error('Error playing audio:', e)
          state.whiteNoise.playing = false
          state.isWhiteNoisePlaying = false
        }
      } catch (err) {
        console.error('Error playing white noise:', err)
        state.whiteNoise.playing = false
        state.isWhiteNoisePlaying = false
      }
    }
  }

  /**
   * Toggle white noise playback
   * @returns Current playing state after toggle
   */
  const toggleWhiteNoise = () => {
    console.log('Toggle white noise called, current state:', state.isWhiteNoisePlaying)

    try {
      if (state.isWhiteNoisePlaying) {
        // 如果正在播放，则停止
        stopWhiteNoise()
        console.log('White noise stopped')
        return false
      } else {
        // 如果没有播放，则开始播放
        // 直接调用playWhiteNoise函数，该函数会处理所有的加载和播放逻辑
        playWhiteNoise()
        console.log('White noise started')
        return true
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
    return state.isWhiteNoisePlaying
  }

  /**
   * Stop the white noise playback
   */
  const stopWhiteNoise = () => {
    // 无论当前状态如何，都尝试停止白噪音
    try {
      // 先重置状态，确保即使音频播放失败也能正确显示状态
      state.isWhiteNoisePlaying = false

      if (state.whiteNoise) {
        state.whiteNoise.playing = false

        if (state.whiteNoise.source) {
          state.whiteNoise.source.pause()
          // Reset to beginning
          state.whiteNoise.source.currentTime = 0
        }
      }

      console.log('White noise stopped successfully')
    } catch (err) {
      console.warn('Error stopping white noise:', err)
      // 出错时仍然尝试重置状态
      if (state.whiteNoise) {
        state.whiteNoise.playing = false
      }
      state.isWhiteNoisePlaying = false
    }
  }

  // 返回公共方法
  return {
    toggleWhiteNoise,
    isWhiteNoisePlaying
  }
}