<script setup lang="ts">
import { IconX as CloseIcon, IconAdjustments as TabIconGeneral, IconAlarm as TabIconSchedule, IconArtboard as TabIconVisuals, IconInfoCircle as InfoIcon, IconVolume as VolumeIcon, IconChartBar as TabIconStats, IconUser as TabIconAccount, IconCoffee, IconBrandGithub, IconBrandTwitter, IconBrandFacebook, IconBrandReddit } from '@tabler/icons-vue'

import { ButtonImportance } from '../base/types/button'
import ThemeSettings from './theme/themeSettings.vue'
import OptionGroup from '@/components/base/optionGroup.vue'
import TabHeader from '@/components/settings/panel/tabHeader.vue'
import ExportButton from '@/components/settings/exportButton.vue'
import ImportButton from '@/components/settings/importButton.vue'

import FocusStatistics from '~~/components/settings/statistics/focusStatistics.vue'
import AccountTab from '~~/components/settings/accountTab.vue'

import presetTimers from '~~/assets/settings/timerPresets'
import { useSettings, WhiteNoiseType, SoundSet } from '~~/stores/settings'
import { NotificationPermission, useNotifications } from '~~/stores/notifications'
import { useMobileSettings } from '~~/stores/platforms/mobileSettings'
import { useAuth } from '~~/stores/auth'
import { useMain } from '~~/stores/main'

import ControlButton from '~~/components/base/uiButton.vue'
import SettingsItem from '~~/components/settings/settingsItem.vue'
import Divider from '~~/components/base/uiDivider.vue'
import { useEvents } from '~~/stores/events'
import { useOpenPanels } from '~~/stores/openpanels'
import { Control } from '~~/components/settings/types/settingsItem'

const runtimeConfig = useRuntimeConfig()
const eventsStore = useEvents()
const openPanels = useOpenPanels()
const mobileSettingsStore = useMobileSettings()
const notificationsStore = useNotifications()
const settingsStore = useSettings()
const authStore = useAuth()
const mainStore = useMain()
const isWeb = computed(() => runtimeConfig.public.PLATFORM === 'web')
const isMobile = computed(() => runtimeConfig.public.PLATFORM === 'mobile')

const emit = defineEmits(['open-sign-in', 'open-sign-up'])

const state = reactive({
  activeTab: 1,
  resetConfirm: false,
  showInfoBox: false,
  infoBoxContent: ''
})

// 监听设置标签页变化
watch(() => openPanels.settingsTab, (newTab) => {
  if (newTab === 'account') {
    state.activeTab = 6 // 账户标签的索引
  }
})

notificationsStore.updateEnabled()
</script>

<template>
  <section class="fixed z-[9999] w-full h-full p-0 md:p-4 md:max-w-screen-sm">
    <div class="flex flex-col h-full overflow-hidden rounded-none shadow-lg bg-surface-light text-surface-onlight md:rounded-xl md:dark:ring-1 dark:ring-surface-ondark dark:ring-opacity-20 ring-inset dark:bg-surface-dark dark:text-surface-ondark" :style="{ 'padding-top': `${mobileSettingsStore.padding.top}px`, 'padding-bottom': `${mobileSettingsStore.padding.bottom}px` }">
      <h1 class="px-4 mt-4 mb-2 text-xl font-bold uppercase">
        <span>{{ $t('settings.heading') }}</span>
        <ControlButton
          :aria-label="$t('settings.buttons.close')"
          default-style
          circle
          :importance="ButtonImportance.Text"
          class="float-right -mt-2 -mr-2"
          tabindex="0"
          @click="openPanels.settings = false"
        >
          <CloseIcon size="24"  :aria-label="$t('settings.buttons.close')" />
        </ControlButton>
      </h1>
      <div class="flex-grow overflow-y-auto">
        <Transition tag="div" name="tab-transition" mode="out-in">
          <!-- Core settings -->
          <div v-if="state.activeTab === 1" :key="1" class="settings-tab">
            <OptionGroup
              :choices="$languages"
              :value="settingsStore.lang"
              :override-text="{ title: $languages, description: {} }"
              @input="(newLang) => { settingsStore.lang = newLang }"
            />
            <Divider />
            <SettingsItem :type="Control.Check" path="adaptiveTicking.enabled" />
            <SettingsItem v-if="isWeb" :type="Control.Check" path="timerControls.enableKeyboardShortcuts" />
            <SettingsItem :type="Control.Option" path="sectionEndAction" :choices="{continue: 'continue', stop: 'stop', skip: 'skip'}" />

            <template v-if="isWeb">
              <Divider />
              <SettingsItem :type="Control.Check" path="permissions.audio" />
              <SettingsItem
                :type="Control.Check"
                path="permissions.notifications"
                :disabled="notificationsStore.enabled === NotificationPermission.Denied"
                @input="(newValue) => {
                  if (newValue === true) {
                    eventsStore.recordEvent('permission.notification')
                  }
                }"
              />
              <SettingsItem :type="Control.Option" :choices="{musical: SoundSet.Musical, sharp: SoundSet.Sharp}" path="audio.soundSet" />
            </template>

            <Divider />
            <div class="flex flex-row items-center px-3 py-2 mb-2 space-x-2 rounded-lg bg-primary/10 dark:bg-gray-700">
              <VolumeIcon size="24" />
              <span class="font-medium">{{ $t('settings.values.whiteNoise._section') }}</span>
            </div>
            <SettingsItem :type="Control.Check" path="whiteNoise.enabled" />
            <SettingsItem
              :type="Control.Option"
              :choices="{rain: WhiteNoiseType.Rain, forest: WhiteNoiseType.Forest, ocean: WhiteNoiseType.Ocean, fan: WhiteNoiseType.Fan, fireplace: WhiteNoiseType.Fireplace, cafe: WhiteNoiseType.Cafe}"
              path="whiteNoise.type"
              :disabled="!settingsStore.whiteNoise.enabled"
            />
            <SettingsItem :type="Control.Check" path="whiteNoise.playDuringWork" :disabled="!settingsStore.whiteNoise.enabled" />
            <SettingsItem
              :type="Control.Number"
              path="whiteNoise.volume"
              :min="0"
              :max="1"
              :step="0.1"
              :decimals="1"
              :disabled="!settingsStore.whiteNoise.enabled"
            />

            <template v-if="isMobile">
              <Divider />
              <SettingsItem :type="Control.Check" path="mobile.notifications.sectionOver" />
              <SettingsItem :type="Control.Check" path="mobile.notifications.persistent" />
            </template>

            <Divider />

            <SettingsItem :type="Control.Check" path="tasks.enabled" />
            <SettingsItem
              :type="Control.Number"
              path="tasks.maxActiveTasks"
              :min="1"
              :max="15"
              :disabled="!settingsStore.tasks.enabled"
            />
            <SettingsItem :type="Control.Check" path="tasks.removeCompletedTasks" :disabled="!settingsStore.tasks.enabled" />

            <template v-if="isWeb">
              <Divider />
              <SettingsItem :type="Control.Empty" path="manage" />
              <div class="grid grid-flow-col grid-cols-2 gap-2 mt-1">
                <ExportButton />
                <ImportButton />
              </div>
            </template>
            <Divider />

            <SettingsItem :type="Control.Check" path="reset" />
          </div>

          <!-- Schedule -->
          <div v-else-if="state.activeTab === 2" :key="2" class="settings-tab">
            <SettingsItem :type="Control.Number" path="schedule.longPauseInterval" :min="1" :max="10" />
            <Divider />

            <SettingsItem
              :type="Control.Empty"
              path="schedule.lengths"
            >
              <OptionGroup
                translation-key="timerpreset"
                :choices="presetTimers"
                :value="settingsStore.getActiveSchedulePreset"
                @input="(newPreset) => settingsStore.applyPreset(newPreset)"
              />
            </SettingsItem>
            <SettingsItem :type="Control.Time" path="schedule.lengths.work" :min-ms="5000" />
            <SettingsItem :type="Control.Time" path="schedule.lengths.shortpause" :min-ms="5000" />
            <SettingsItem :type="Control.Time" path="schedule.lengths.longpause" :min-ms="5000" />
            <div class="flex flex-row items-center px-3 py-4 space-x-2 rounded-lg ring-inset ring ring-primary bg-primary/20 dark:bg-gray-700 dark:text-gray-100">
              <InfoIcon size="24" />
              <span v-text="$t('settings.scheduleMinTime')" />
            </div>
          </div>

          <!-- Display -->
          <div v-else-if="state.activeTab === 3" :key="3" class="settings-tab">
            <SettingsItem :type="Control.Empty" path="visuals.theme" />
            <ThemeSettings />
            <SettingsItem :type="Control.Check" path="visuals.darkMode" />
            <Divider />
            <SettingsItem :type="Control.Option" path="currentTimer" :choices="{traditional: 'traditional', approximate: 'approximate', percentage: 'percentage'}" />
            <Divider />
            <SettingsItem :type="Control.Check" path="schedule.visibility.enabled" />
            <SettingsItem :type="Control.Check" path="schedule.visibility.showSectionType" :disabled="!settingsStore.schedule.visibility.enabled" />
            <SettingsItem
              :type="Control.Number"
              path="schedule.numScheduleEntries"
              :min="2"
              :max="5"
              :disabled="!settingsStore.schedule.visibility.enabled"
            />
            <Divider />
            <SettingsItem :type="Control.Check" path="performance.showProgressBar" />
            <SettingsItem v-if="isWeb" :type="Control.Check" path="pageTitle.useTickEmoji" />
            <!-- TODO Audio volume control -->
          </div>

          <!-- 统计页面 -->
          <div v-else-if="state.activeTab === 4" :key="4" class="settings-tab">
            <FocusStatistics />
          </div>



          <!-- 账户标签页 -->
          <div v-else-if="state.activeTab === 6" :key="6" class="settings-tab">
            <AccountTab v-if="authStore.isAuthenticated" />
            <div v-else class="flex flex-col items-center justify-center p-6">
              <!-- 登录部分 -->
              <div class="text-center mb-8">
                <div class="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-lg border-2 border-red-400 bg-red-100 dark:bg-red-900 dark:bg-opacity-20">
                  <img src="/favicon.svg" width="48" height="48" class="inline-block">
                </div>
                <h3 class="mb-2 text-xl font-bold">{{ $t('auth.not_signed_in') }}</h3>
                <p class="mb-4 text-sm text-gray-500">{{ $t('auth.sign_in_benefits') }}</p>
                <div class="flex gap-2 justify-center">
                  <ControlButton
                    :importance="ButtonImportance.Filled"
                    @click="openPanels.settings = false; $emit('open-sign-in')"
                  >
                    {{ $t('auth.sign_in') }}
                  </ControlButton>
                  <ControlButton
                    :importance="ButtonImportance.Outline"
                    @click="openPanels.settings = false; $emit('open-sign-up')"
                  >
                    {{ $t('auth.sign_up') }}
                  </ControlButton>
                </div>
              </div>

              <!-- 关于部分 -->
              <div class="w-full">
                <!-- 产品简介 -->
                <div class="w-full text-left px-4 mb-8">
                  <h3 class="text-lg font-semibold mb-2">{{ $t('settings.about.productIntro') }}</h3>
                  <p class="text-sm mb-4">{{ $t('settings.about.productDescription') }}</p>

                  <!-- 主要功能 -->
                  <h3 class="text-lg font-semibold mb-2">{{ $t('settings.about.keyFeatures') }}</h3>
                  <ul class="text-sm mb-4 list-disc pl-5">
                    <li>{{ $t('settings.about.feature1') }}</li>
                    <li>{{ $t('settings.about.feature2') }}</li>
                    <li>{{ $t('settings.about.feature3') }}</li>
                    <li>{{ $t('settings.about.feature4') }}</li>
                    <li>{{ $t('settings.about.feature5') }}</li>
                    <li>{{ $t('settings.about.feature6') }}</li>
                  </ul>

                  <!-- 使用方法 -->
                  <h3 class="text-lg font-semibold mb-2">{{ $t('settings.about.howToUse') }}</h3>
                  <p class="text-sm mb-4">{{ $t('settings.about.howToUseDesc') }}</p>
                </div>

                <!-- 支持信息 -->
                <div class="flex flex-col items-center justify-center text-center">
                  <div class="mb-2">
                    <span v-text="$t('settings.about.supportBody')" />
                  </div>
                  <div v-if="isMobile" class="px-4 my-2 text-sm" v-text="$t('settings.about.mobileSupport')" />

                  <!-- Support links -->
                  <div class="flex flex-row flex-wrap justify-center gap-2 mt-3 text-center">
                    <ControlButton
                      :importance="ButtonImportance.Filled"
                      dark
                      link
                      no-default-style
                      no-content-theme
                      href="https://github.com/yuantang/FocusTide"
                      inner-class="flex flex-row items-center gap-1 text-slate-50 text-gray-50"
                      bg-class="bg-slate-900 dark:bg-slate-700"
                    >
                      <IconBrandGithub />
                      <span v-text="$t('settings.about.source')" />
                    </ControlButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Tab bar -->
      <div class="flex flex-row flex-none h-20 p-4">
        <TabHeader :active="state.activeTab === 1" :text="$t('settings.tabs.main')" @click="state.activeTab = 1">
          <template #icon>
            <TabIconGeneral size="24" role="presentation" />
          </template>
        </TabHeader>
        <TabHeader :active="state.activeTab === 2" :text="$t('settings.tabs.timer')" @click="state.activeTab = 2">
          <template #icon>
            <TabIconSchedule size="24" role="presentation" />
          </template>
        </TabHeader>
        <TabHeader :active="state.activeTab === 3" :text="$t('settings.tabs.display')" @click="state.activeTab = 3">
          <template #icon>
            <TabIconVisuals size="24" role="presentation" />
          </template>
        </TabHeader>
        <TabHeader :active="state.activeTab === 4" :text="$t('settings.tabs.statistics')" @click="state.activeTab = 4">
          <template #icon>
            <TabIconStats size="24" role="presentation" />
          </template>
        </TabHeader>
        <TabHeader :active="state.activeTab === 6" :text="$t('settings.tabs.account')" @click="state.activeTab = 6">
          <template #icon>
            <TabIconAccount size="24" role="presentation" />
          </template>
        </TabHeader>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
div.settings-tab {
  @apply grid grid-cols-1 gap-2 py-3 px-4;
}

// ===== TAB TRANSITIONS =====
.tab-transition-enter-active,
.tab-transition-leave-active {
  transition: transform 0.2s ease-out, opacity 0.2s ease-out;
  // transition: opacity 0.5s ease-out;
  position: relative;
}

.tab-transition-enter-from {
  transform: translateY(10px);
  opacity: 0;
}

.tab-transition-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>
