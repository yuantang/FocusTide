import { reactive, computed, onMounted } from 'vue'
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

  watch(() => settingsStore.whiteNoise.type, (newType) => {
    if (settingsStore.whiteNoise.enabled) {
      loadWhiteNoise(newType)
    }
  })

  watch(() => settingsStore.whiteNoise.enabled, (enabled) => {
    if (enabled) {
      loadWhiteNoise(settingsStore.whiteNoise.type)
      if (scheduleStore.getCurrentItem.type === 'work' && settingsStore.whiteNoise.playDuringWork) {
        playWhiteNoise()
      }
    } else {
      stopWhiteNoise()
    }
  })

  watch(() => settingsStore.whiteNoise.volume, (newVolume) => {
    if (state.whiteNoise && state.whiteNoise.playing && state.whiteNoise.source) {
      state.whiteNoise.source.volume = newVolume
    }
  })

  watch(() => scheduleStore.getCurrentItem.type, (newType) => {
    if (settingsStore.whiteNoise.enabled && settingsStore.whiteNoise.playDuringWork) {
      if (newType === 'work') {
        playWhiteNoise()
      } else {
        stopWhiteNoise()
      }
    }
  })

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
      if (scheduleStore.getCurrentItem.type === 'work' && settingsStore.whiteNoise.playDuringWork) {
        playWhiteNoise()
      }
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
    if (state.currentWhiteNoiseType === type && state.whiteNoise !== null) { return }

    try {
      // Clean up previous audio if it exists
      if (state.whiteNoise && state.whiteNoise.playing) {
        stopWhiteNoise()
      }

      // Create new audio element with absolute path
      const audioPath = `${window.location.origin}/audio/whitenoise/${type}.mp3`
      console.log(`Loading white noise: ${audioPath}`)
      const source = new Audio(audioPath)
      source.loop = true

      // Add error event listener
      source.addEventListener('error', (e) => {
        console.error(`Error loading white noise: ${type}`, e)
      })

      const newSound = {
        source,
        ready: false,
        playing: false
      }

      // Set up event listener for when audio is ready
      source.addEventListener('canplay', () => {
        console.log(`White noise ready: ${type}`)
        newSound.ready = true
        // If we should be playing, start playing once ready
        if (settingsStore.whiteNoise.enabled &&
            (settingsStore.whiteNoise.playDuringWork === false ||
             scheduleStore.getCurrentItem.type === 'work')) {
          playWhiteNoise()
        }
      })

      state.whiteNoise = newSound
      state.currentWhiteNoiseType = type
    } catch (err) {
      console.error(`Exception loading white noise: ${type}`, err)
    }
  }

  /**
   * Play white noise audio file
   */
  const playWhiteNoise = () => {
    if (!settingsStore.whiteNoise.enabled) { return }

    // Load white noise if not already loaded
    if (state.currentWhiteNoiseType !== settingsStore.whiteNoise.type || state.whiteNoise === null) {
      console.log(`Need to load white noise: ${settingsStore.whiteNoise.type}`)
      loadWhiteNoise(settingsStore.whiteNoise.type)
      return // loadWhiteNoise will call playWhiteNoise when ready
    }

    if (state.whiteNoise !== null && settingsStore.permissions.audio) {
      // If already playing, don't restart
      if (state.whiteNoise.playing) { return }

      try {
        const { source } = state.whiteNoise
        if (!source) {
          console.error('No source available for white noise')
          return
        }
        if (!state.whiteNoise.ready) {
          console.log('White noise not ready yet')
          return
        }

        console.log(`Playing white noise: ${state.currentWhiteNoiseType}`)
        // Set volume and play
        source.volume = settingsStore.whiteNoise.volume
        source.play().catch(e => console.error('Error playing audio:', e))

        state.whiteNoise.playing = true
        state.isWhiteNoisePlaying = true
      } catch (err) {
        console.error('Error playing white noise:', err)
      }
    }
  }

  /**
   * Toggle white noise playback
   * @returns Current playing state after toggle
   */
  const toggleWhiteNoise = () => {
    if (state.whiteNoise && state.whiteNoise.playing) {
      stopWhiteNoise()
      return false
    } else {
      playWhiteNoise()
      return true
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
    if (state.whiteNoise !== null && state.whiteNoise.playing) {
      try {
        if (state.whiteNoise.source) {
          state.whiteNoise.source.pause()
          // Reset to beginning
          state.whiteNoise.source.currentTime = 0
        }
        state.whiteNoise.playing = false
        state.isWhiteNoisePlaying = false
      } catch (err) {
        console.warn('Error stopping white noise:', err)
      }
    }
  }

  // 返回公共方法
  return {
    toggleWhiteNoise,
    isWhiteNoisePlaying
  }
}