<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { IconUser, IconLock, IconTrash, IconRefresh, IconDownload, IconUpload } from '@tabler/icons-vue'
import { ButtonImportance, ButtonTheme } from '../base/types/button'
import CButton from '~/components/base/uiButton.vue'
import InputText from '~/components/base/inputText.vue'
import OptionGroup from '~/components/base/optionGroup.vue'
import { useAuth } from '~/stores/auth'
import { syncService } from '~/services/syncService'

const { t } = useI18n()
const authStore = useAuth()

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
</script>

<template>
  <div>
    <h2 class="mb-4 text-xl font-bold">{{ t('auth.account_settings') }}</h2>

    <!-- 用户信息 -->
    <div class="p-4 mb-6 rounded-lg bg-surface-variant dark:bg-surface-darkvariant">
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

    <!-- 数据同步 -->
    <div class="mb-6">
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
    <div class="mb-6">
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

    <!-- 删除账户 -->
    <div>
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
  </div>
</template>
