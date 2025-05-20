<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { IconUser, IconLock, IconTrash, IconRefresh, IconDownload, IconUpload, IconCoffee, IconBrandGithub, IconBrandTwitter, IconBrandFacebook, IconBrandReddit, IconLogin, IconUserPlus, IconLogout } from '@tabler/icons-vue'
import { ButtonImportance, ButtonTheme } from '../base/types/button'
import CButton from '~/components/base/uiButton.vue'
import InputText from '~/components/base/inputText.vue'
import OptionGroup from '~/components/base/optionGroup.vue'
import { useAuth } from '~/stores/auth'
import { syncService } from '~/services/syncService'
import { AppPlatform } from '~~/platforms/platforms'
import { useMain } from '~~/stores/main'

const { t } = useI18n()
const authStore = useAuth()
const runtimeConfig = useRuntimeConfig()
const isMobile = computed(() => runtimeConfig.public.PLATFORM === AppPlatform.mobile)
const mainStore = useMain()

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const isChangingPassword = ref(false)
const passwordError = ref('')
const passwordSuccess = ref('')

const syncInterval = ref(authStore.syncInterval || 'manual')
const syncIntervalOptions = {
  manual: 'manual',
  '5min': '5min',
  '15min': '15min',
  '30min': '30min',
  '60min': '60min'
}

const isSyncing = computed(() => authStore.syncStatus === 'syncing')
const lastSyncedText = computed(() => {
  if (!authStore.lastSynced) return t('auth.never_synced')

  const date = new Date(authStore.lastSynced)
  return date.toLocaleString()
})

// 登录和注册状态
const isSigningIn = ref(false)
const isSigningUp = ref(false)
const loginEmail = ref('')
const loginPassword = ref('')
const registerEmail = ref('')
const registerPassword = ref('')
const registerConfirmPassword = ref('')
const authError = ref('')
const authSuccess = ref('')

// 登录
const signIn = async () => {
  if (!loginEmail.value || !loginPassword.value) {
    authError.value = t('auth.fill_all_fields')
    return
  }

  isSigningIn.value = true
  authError.value = ''
  authSuccess.value = ''

  try {
    await authStore.signIn(loginEmail.value, loginPassword.value)

    if (!authStore.error) {
      authSuccess.value = t('auth.sign_in_success')
      loginEmail.value = ''
      loginPassword.value = ''
    } else {
      authError.value = authStore.error
    }
  } catch (error: any) {
    authError.value = error.message
  } finally {
    isSigningIn.value = false
  }
}

// 注册
const signUp = async () => {
  if (!registerEmail.value || !registerPassword.value || !registerConfirmPassword.value) {
    authError.value = t('auth.fill_all_fields')
    return
  }

  if (registerPassword.value !== registerConfirmPassword.value) {
    authError.value = t('auth.passwords_dont_match')
    return
  }

  isSigningUp.value = true
  authError.value = ''
  authSuccess.value = ''

  try {
    await authStore.signUp(registerEmail.value, registerPassword.value)

    if (!authStore.error) {
      authSuccess.value = t('auth.sign_up_success')
      registerEmail.value = ''
      registerPassword.value = ''
      registerConfirmPassword.value = ''
    } else {
      authError.value = authStore.error
    }
  } catch (error: any) {
    authError.value = error.message
  } finally {
    isSigningUp.value = false
  }
}

// 手动同步数据
const syncData = async () => {
  await syncService.syncData()
}

// 更改同步间隔
const changeSyncInterval = (value: string) => {
  syncInterval.value = value
  authStore.syncInterval = value
}

// 监听同步间隔变化
watch(() => authStore.syncInterval, (newValue) => {
  if (newValue !== syncInterval.value) {
    syncInterval.value = newValue
  }
})

// 更改密码
const changePassword = async () => {
  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
    passwordError.value = t('auth.fill_all_fields')
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = t('auth.passwords_dont_match')
    return
  }

  isChangingPassword.value = true
  passwordError.value = ''
  passwordSuccess.value = ''

  try {
    const { error } = await authStore.updatePassword(currentPassword.value, newPassword.value)

    if (error) {
      passwordError.value = error.message
    } else {
      passwordSuccess.value = t('auth.password_updated')
      currentPassword.value = ''
      newPassword.value = ''
      confirmPassword.value = ''
    }
  } catch (error: any) {
    passwordError.value = error.message
  } finally {
    isChangingPassword.value = false
  }
}

// 删除账户
const deleteAccount = async () => {
  if (confirm(t('auth.confirm_delete_account'))) {
    await authStore.deleteAccount()
  }
}

// 退出登录
const signOut = async () => {
  await authStore.signOut()
}
</script>

<template>
  <div>
    <h2 class="mb-4 text-xl font-bold">{{ t('auth.account_settings') }}</h2>

    <!-- 用户信息 -->
    <div v-if="authStore.isAuthenticated" class="p-4 mb-6 rounded-lg bg-surface-variant dark:bg-surface-darkvariant">
      <div class="flex items-center">
        <div class="flex items-center justify-center w-12 h-12 mr-4 rounded-full bg-primary text-primary-on">
          <IconUser size="24" />
        </div>
        <div>
          <div class="font-bold">{{ authStore.user?.email }}</div>
          <div class="text-sm text-gray-500 dark:text-gray-400">
            {{ t('auth.member_since', { date: new Date(authStore.user?.created_at).toLocaleDateString() }) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 未登录状态 - 登录/注册表单 -->
    <div v-if="!authStore.isAuthenticated" class="mb-6">
      <div class="flex flex-col md:flex-row gap-6">
        <!-- 登录表单 -->
        <div class="flex-1 p-6 rounded-lg bg-surface-variant dark:bg-surface-darkvariant">
          <h3 class="mb-4 text-lg font-semibold flex items-center">
            <IconLogin class="mr-2" size="20" />
            {{ t('auth.sign_in') }}
          </h3>

          <form @submit.prevent="signIn" class="space-y-4">
            <div>
              <label class="block mb-2 text-sm font-medium">{{ t('auth.email') }}</label>
              <InputText
                v-model="loginEmail"
                type="email"
                :placeholder="t('auth.email_placeholder')"
                class="w-full"
              />
            </div>

            <div>
              <label class="block mb-2 text-sm font-medium">{{ t('auth.password') }}</label>
              <InputText
                v-model="loginPassword"
                type="password"
                :placeholder="t('auth.password_placeholder')"
                class="w-full"
              />
            </div>

            <CButton
              :disabled="isSigningIn"
              :importance="ButtonImportance.Filled"
              :theme="ButtonTheme.Primary"
              type="submit"
              class="w-full"
            >
              <IconLogin v-if="!isSigningIn" size="20" class="mr-2" />
              <span>{{ isSigningIn ? t('auth.signing_in') : t('auth.sign_in') }}</span>
            </CButton>
          </form>
        </div>

        <!-- 注册表单 -->
        <div class="flex-1 p-6 rounded-lg bg-surface-variant dark:bg-surface-darkvariant">
          <h3 class="mb-4 text-lg font-semibold flex items-center">
            <IconUserPlus class="mr-2" size="20" />
            {{ t('auth.sign_up') }}
          </h3>

          <form @submit.prevent="signUp" class="space-y-4">
            <div>
              <label class="block mb-2 text-sm font-medium">{{ t('auth.email') }}</label>
              <InputText
                v-model="registerEmail"
                type="email"
                :placeholder="t('auth.email_placeholder')"
                class="w-full"
              />
            </div>

            <div>
              <label class="block mb-2 text-sm font-medium">{{ t('auth.password') }}</label>
              <InputText
                v-model="registerPassword"
                type="password"
                :placeholder="t('auth.password_placeholder')"
                class="w-full"
              />
            </div>

            <div>
              <label class="block mb-2 text-sm font-medium">{{ t('auth.confirm_password') }}</label>
              <InputText
                v-model="registerConfirmPassword"
                type="password"
                :placeholder="t('auth.confirm_password_placeholder')"
                class="w-full"
              />
            </div>

            <CButton
              :disabled="isSigningUp"
              :importance="ButtonImportance.Filled"
              :theme="ButtonTheme.Primary"
              type="submit"
              class="w-full"
            >
              <IconUserPlus v-if="!isSigningUp" size="20" class="mr-2" />
              <span>{{ isSigningUp ? t('auth.signing_up') : t('auth.sign_up') }}</span>
            </CButton>
          </form>
        </div>
      </div>

      <!-- 错误和成功消息 -->
      <div v-if="authError" class="p-3 mt-4 text-sm text-red-500 bg-red-100 rounded-md dark:bg-red-900 dark:bg-opacity-20">
        {{ authError }}
      </div>

      <div v-if="authSuccess" class="p-3 mt-4 text-sm text-green-500 bg-green-100 rounded-md dark:bg-green-900 dark:bg-opacity-20">
        {{ authSuccess }}
      </div>

      <div class="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 text-blue-700 dark:text-blue-300">
        <h4 class="font-semibold mb-2">{{ t('auth.sign_in_benefits_title') }}</h4>
        <p>{{ t('auth.sign_in_benefits') }}</p>
      </div>
    </div>

    <!-- 数据同步 -->
    <div v-if="authStore.isAuthenticated" class="mb-6">
      <h3 class="mb-2 text-lg font-semibold">{{ t('auth.data_sync') }}</h3>

      <div class="flex items-center mb-4">
        <div class="mr-2">{{ t('auth.last_synced', { time: '' }) }}</div>
        <div>{{ lastSyncedText }}</div>
      </div>

      <div class="flex gap-2 mb-4">
        <CButton
          :disabled="isSyncing"
          :importance="ButtonImportance.Filled"
          :theme="ButtonTheme.Primary"
          @click="syncData"
        >
          <IconRefresh size="20" class="mr-2" />
          <span>{{ isSyncing ? t('auth.syncing') : t('auth.sync_now') }}</span>
        </CButton>

        <CButton
          :importance="ButtonImportance.Outline"
          :theme="ButtonTheme.Neutral"
          @click="syncService.exportData"
        >
          <IconDownload size="20" class="mr-2" />
          <span>{{ t('auth.export_data') }}</span>
        </CButton>

        <CButton
          :importance="ButtonImportance.Outline"
          :theme="ButtonTheme.Neutral"
          @click="syncService.importData"
        >
          <IconUpload size="20" class="mr-2" />
          <span>{{ t('auth.import_data') }}</span>
        </CButton>
      </div>

      <div>
        <h3 class="mb-2 text-lg font-semibold">{{ t('auth.sync_interval._title') }}</h3>
        <div class="mb-2">{{ t('auth.sync_interval._description') }}</div>
        <OptionGroup
          :choices="syncIntervalOptions"
          :value="syncInterval"
          translation-key="auth.sync_interval"
          :override-text="{
            title: {
              manual: t('auth.sync_interval._values.manual'),
              '5min': t('auth.sync_interval._values.5min'),
              '15min': t('auth.sync_interval._values.15min'),
              '30min': t('auth.sync_interval._values.30min'),
              '60min': t('auth.sync_interval._values.60min')
            },
            description: {
              manual: t('auth.sync_interval._valueDescription.manual'),
              '5min': t('auth.sync_interval._valueDescription.5min'),
              '15min': t('auth.sync_interval._valueDescription.15min'),
              '30min': t('auth.sync_interval._valueDescription.30min'),
              '60min': t('auth.sync_interval._valueDescription.60min')
            }
          }"
          @input="changeSyncInterval"
        />
      </div>
    </div>

    <!-- 更改密码 -->
    <div v-if="authStore.isAuthenticated" class="mb-6">
      <h3 class="mb-2 text-lg font-semibold">{{ t('auth.change_password') }}</h3>

      <form @submit.prevent="changePassword" class="space-y-4">
        <div>
          <label class="block mb-2 text-sm font-medium">{{ t('auth.current_password') }}</label>
          <InputText
            v-model="currentPassword"
            type="password"
            :placeholder="t('auth.current_password_placeholder')"
            class="w-full"
          />
        </div>

        <div>
          <label class="block mb-2 text-sm font-medium">{{ t('auth.new_password') }}</label>
          <InputText
            v-model="newPassword"
            type="password"
            :placeholder="t('auth.new_password_placeholder')"
            class="w-full"
          />
        </div>

        <div>
          <label class="block mb-2 text-sm font-medium">{{ t('auth.confirm_new_password') }}</label>
          <InputText
            v-model="confirmPassword"
            type="password"
            :placeholder="t('auth.confirm_password_placeholder')"
            class="w-full"
          />
        </div>

        <div v-if="passwordError" class="p-3 text-sm text-red-500 bg-red-100 rounded-md dark:bg-red-900 dark:bg-opacity-20">
          {{ passwordError }}
        </div>

        <div v-if="passwordSuccess" class="p-3 text-sm text-green-500 bg-green-100 rounded-md dark:bg-green-900 dark:bg-opacity-20">
          {{ passwordSuccess }}
        </div>

        <CButton
          :disabled="isChangingPassword"
          :importance="ButtonImportance.Filled"
          :theme="ButtonTheme.Primary"
          type="submit"
        >
          <IconLock v-if="!isChangingPassword" size="20" class="mr-2" />
          <span>{{ isChangingPassword ? t('auth.updating_password') : t('auth.update_password') }}</span>
        </CButton>
      </form>
    </div>

    <!-- 退出登录和删除账户 -->
    <div v-if="authStore.isAuthenticated" class="mb-6">
      <h3 class="mb-2 text-lg font-semibold">{{ t('auth.account_actions') }}</h3>

      <div class="flex gap-2 mb-4">
        <CButton
          :importance="ButtonImportance.Outline"
          :theme="ButtonTheme.Neutral"
          @click="signOut"
        >
          <IconLogout size="20" class="mr-2" />
          <span>{{ t('auth.sign_out') }}</span>
        </CButton>
      </div>

      <h3 class="mb-2 text-lg font-semibold text-red-500">{{ t('auth.danger_zone') }}</h3>

      <p class="mb-4 text-sm">{{ t('auth.delete_account_warning') }}</p>

      <CButton
        :importance="ButtonImportance.Outline"
        :theme="ButtonTheme.Danger"
        @click="deleteAccount"
      >
        <IconTrash size="20" class="mr-2" />
        <span>{{ t('auth.delete_account') }}</span>
      </CButton>
    </div>

    <!-- 关于应用 -->
    <div class="mb-6">
      <h3 class="mb-2 text-lg font-semibold">{{ $t('settings.tabs.about') }}</h3>

      <div class="flex flex-col items-center">


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

        <div class="flex flex-col items-center justify-center text-center">
          <div class="mb-2">
            <span v-text="$t('settings.about.supportBody')" /> 
          </div>
          <div v-if="isMobile" class="px-4 my-2 text-sm" v-text="$t('settings.about.mobileSupport')" />

          <!-- Support links -->
          <div class="flex flex-row flex-wrap justify-center gap-2 mt-3 text-center">
            <CButton
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
            </CButton>
            <!-- <CButton
              v-if="!isMobile"
              :importance="ButtonImportance.Filled"
              link
              dark
              no-default-style
              no-content-theme
              href="https://www.buymeacoffee.com/imreg?utm_source=FocusTide&utm_medium=web&utm_content=settings"
              inner-class="flex flex-row items-center gap-1 text-black"
              bg-class="bg-yellow-300"
            >
              <IconCoffee />
              <span v-text="$t('settings.about.support')" />
            </CButton> -->
            <!-- <CButton
              v-else
              :importance="ButtonImportance.Filled"
              disabled
              inner-class="flex flex-row items-center gap-1 text-black"
              bg-class="bg-yellow-300"
            >
              <IconCoffee />
              <span v-text="$t('settings.about.support')" />
            </CButton> -->
          </div>
          <!-- Share links -->
          <!-- <div class="my-2" v-text="$t('settings.about.share')" /> -->
          <!-- <div class="flex flex-row items-center space-x-2 text-sm">
            <CButton
              link
              circle
              dark
              no-default-style
              no-content-theme
              :importance="ButtonImportance.Filled"
              href="https://twitter.com/FocusTide?utm_source=FocusTide&utm_medium=web&utm_content=settings"
              bg-class="bg-[#1da1f2]"
              inner-class="!p-4 text-slate-50"
            >
              <IconBrandTwitter :aria-label="$t('support.share.twitter')" size="24" />
            </CButton>
            <CButton
              link
              circle
              dark
              no-default-style
              no-content-theme
              :importance="ButtonImportance.Filled"
              :href="`http://www.facebook.com/share.php?u=${runtimeConfig.public.URL}`"
              bg-class="bg-[#1877f2]"
              inner-class="!p-4 text-slate-50"
            >
              <IconBrandFacebook :aria-label="$t('support.share.facebook')" size="24" class="translate-x-[-1px]" />
            </CButton>
            <CButton
              link
              circle
              dark
              no-default-style
              no-content-theme
              :importance="ButtonImportance.Filled"
              :href="`https://reddit.com/submit?url=${runtimeConfig.public.URL}`"
              bg-class="bg-[#ff4500]"
              inner-class="!p-4 text-slate-50"
            >
              <IconBrandReddit :aria-label="$t('support.share.reddit')" size="24" />
            </CButton>
          </div> -->
        </div>
      </div>
    </div>
  </div>
</template>
