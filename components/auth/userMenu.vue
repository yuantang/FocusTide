<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { IconUser, IconLogin, IconLogout, IconUserPlus, IconSettings, IconRefresh } from '@tabler/icons-vue'
import { ButtonImportance, ButtonTheme } from '../base/types/button'
import CButton from '~/components/base/uiButton.vue'
import { useAuth } from '~/stores/auth'
import { syncService } from '~/services/syncService'

const { t } = useI18n()
const authStore = useAuth()
const isOpen = ref(false)

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const closeMenu = () => {
  isOpen.value = false
}

const syncData = async () => {
  await syncService.syncData()
  closeMenu()
}

const signOut = async () => {
  await authStore.signOut()
  closeMenu()
}

const lastSyncedText = computed(() => {
  if (!authStore.lastSynced) return t('auth.never_synced')

  const date = new Date(authStore.lastSynced)
  return t('auth.last_synced', { time: date.toLocaleString() })
})

defineEmits(['openSignIn', 'openSignUp', 'openSettings'])
</script>

<template>
  <div class="relative">
    <!-- 用户按钮 -->
    <CButton
      circle
      :aria-label="authStore.isAuthenticated ? t('auth.account') : t('auth.sign_in')"
      :importance="ButtonImportance.Filled"
      :theme="ButtonTheme.Neutral"
      class="h-11"
      no-content-theme
      no-padding
      inner-class="p-1"
      @click="toggleMenu"
    >
      <IconUser v-if="authStore.isAuthenticated" size="24" class="inline-block" />
      <IconLogin v-else size="24" class="inline-block" />
    </CButton>

    <!-- 下拉菜单 -->
    <div
      v-if="isOpen"
      class="absolute right-0 z-[9999] mt-2 overflow-hidden rounded-lg shadow-lg w-60 bg-surface-light dark:bg-surface-dark"
    >
      <!-- 已登录状态 -->
      <template v-if="authStore.isAuthenticated">
        <div class="p-4 border-b border-gray-200 dark:border-gray-700">
          <div class="font-bold">{{ authStore.user?.email || 'User' }}</div>
          <div class="text-sm text-gray-500 dark:text-gray-400">{{ lastSyncedText }}</div>
        </div>
        <div class="p-2">
          <button
            class="flex items-center w-full px-4 py-2 text-left rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            @click="syncData"
          >
            <IconRefresh size="20" class="mr-2" />
            <span>{{ t('auth.sync_data') }}</span>
          </button>
          <button
            class="flex items-center w-full px-4 py-2 text-left rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            @click="$emit('openSettings')"
          >
            <IconSettings size="20" class="mr-2" />
            <span>{{ t('auth.account_settings') }}</span>
          </button>
          <button
            class="flex items-center w-full px-4 py-2 text-left rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            @click="signOut"
          >
            <IconLogout size="20" class="mr-2" />
            <span>{{ t('auth.sign_out') }}</span>
          </button>
        </div>
      </template>

      <!-- 未登录状态 -->
      <template v-else>
        <div class="p-2">
          <button
            class="flex items-center w-full px-4 py-2 text-left rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            @click="$emit('openSignIn'); closeMenu()"
          >
            <IconLogin size="20" class="mr-2" />
            <span>{{ t('auth.sign_in') }}</span>
          </button>
          <button
            class="flex items-center w-full px-4 py-2 text-left rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            @click="$emit('openSignUp'); closeMenu()"
          >
            <IconUserPlus size="20" class="mr-2" />
            <span>{{ t('auth.sign_up') }}</span>
          </button>
        </div>
      </template>
    </div>
  </div>
</template>
