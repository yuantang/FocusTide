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
  audioContext?: AudioContext,
  gainNode?: GainNode,
  noiseNode?: AudioBufferSourceNode,
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
    whiteNoise: null as WhiteNoiseSettings | null
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
    if (state.whiteNoise && state.whiteNoise.playing && state.whiteNoise.gainNode) {
      state.whiteNoise.gainNode.gain.value = newVolume
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
   * Create a white noise generator using Web Audio API
   * @param type Type of white noise to create
   */
  const loadWhiteNoise = (type = settingsStore.whiteNoise.type) => {
    if (state.currentWhiteNoiseType === type && state.whiteNoise !== null) { return }

    try {
      // Clean up previous audio context if it exists
      if (state.whiteNoise && state.whiteNoise.audioContext) {
        if (state.whiteNoise.playing) {
          stopWhiteNoise()
        }
        if (state.whiteNoise.noiseNode) {
          state.whiteNoise.noiseNode.disconnect()
        }
        if (state.whiteNoise.gainNode) {
          state.whiteNoise.gainNode.disconnect()
        }
      }

      // Create new audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const gainNode = audioContext.createGain()
      gainNode.gain.value = settingsStore.whiteNoise.volume
      gainNode.connect(audioContext.destination)

      const newSound = {
        audioContext,
        gainNode,
        ready: true,
        playing: false
      }

      state.whiteNoise = newSound
      state.currentWhiteNoiseType = type
    } catch (err) {
      console.warn(err)
    }
  }

  /**
   * Generate and play white noise based on the selected type
   */
  const playWhiteNoise = () => {
    if (!settingsStore.whiteNoise.enabled) { return }

    // Load white noise if not already loaded
    if (state.currentWhiteNoiseType !== settingsStore.whiteNoise.type || state.whiteNoise === null) {
      loadWhiteNoise(settingsStore.whiteNoise.type)
    }

    if (state.whiteNoise !== null && settingsStore.permissions.audio) {
      // If already playing, don't restart
      if (state.whiteNoise.playing) { return }

      try {
        const { audioContext, gainNode } = state.whiteNoise
        if (!audioContext || !gainNode) return

        // Create noise buffer
        const bufferSize = 2 * audioContext.sampleRate
        const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate)
        const output = noiseBuffer.getChannelData(0)

        // Generate different types of noise based on the selected type
        const type = settingsStore.whiteNoise.type

        // Fill the buffer with noise
        for (let i = 0; i < bufferSize; i++) {
          switch (type) {
            case 'rain':
              // Rain noise - slightly filtered white noise with occasional louder drops
              output[i] = Math.random() * 0.5 + (Math.random() > 0.99 ? Math.random() * 0.5 : 0)
              break
            case 'forest':
              // Forest noise - filtered noise with occasional chirps
              output[i] = Math.random() * 0.3 + (Math.random() > 0.995 ? Math.random() * 0.7 : 0)
              break
            case 'ocean':
              // Ocean waves - low frequency modulated noise
              output[i] = Math.random() * 0.5 * (0.5 + 0.5 * Math.sin(i / 48000))
              break
            case 'fan':
              // Fan noise - consistent white noise
              output[i] = Math.random() * 0.5
              break
            case 'fireplace':
              // Fireplace - crackling noise
              output[i] = Math.random() * 0.3 + (Math.random() > 0.997 ? Math.random() * 0.7 : 0)
              break
            case 'cafe':
              // Cafe - ambient noise with occasional peaks
              output[i] = Math.random() * 0.2 + (Math.random() > 0.99 ? Math.random() * 0.3 : 0)
              break
            default:
              // Default white noise
              output[i] = Math.random() * 2 - 1
          }
        }

        // Create noise source
        const noiseSource = audioContext.createBufferSource()
        noiseSource.buffer = noiseBuffer
        noiseSource.loop = true
        noiseSource.connect(gainNode)
        noiseSource.start()

        // Store the noise source for later stopping
        state.whiteNoise.noiseNode = noiseSource
        state.whiteNoise.playing = true

        // Update volume
        gainNode.gain.value = settingsStore.whiteNoise.volume
      } catch (err) {
        console.warn('Error playing white noise:', err)
      }
    }
  }

  /**
   * Stop the white noise playback
   */
  const stopWhiteNoise = () => {
    if (state.whiteNoise !== null && state.whiteNoise.playing) {
      try {
        if (state.whiteNoise.noiseNode) {
          state.whiteNoise.noiseNode.stop()
          state.whiteNoise.noiseNode.disconnect()
        }
        state.whiteNoise.playing = false
      } catch (err) {
        console.warn('Error stopping white noise:', err)
      }
    }
  }
}
