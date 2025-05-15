<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { IconX, IconKey } from '@tabler/icons-vue'
import { ButtonImportance, ButtonTheme } from '../base/types/button'
import CButton from '~/components/base/uiButton.vue'
import InputText from '~/components/base/inputText.vue'
import { useAuth } from '~/stores/auth'

const { t } = useI18n()
const authStore = useAuth()

const email = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const emit = defineEmits(['close', 'openSignIn'])

const resetPassword = async () => {
  if (!email.value) {
    errorMessage.value = t('auth.enter_email')
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await authStore.resetPassword(email.value)

    if (!authStore.error) {
      successMessage.value = t('auth.reset_email_sent')
      email.value = ''
    } else {
      errorMessage.value = authStore.error
    }
  } catch (error: any) {
    errorMessage.value = error.message
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50">
    <div class="w-full max-w-md p-6 rounded-lg shadow-lg bg-surface-light dark:bg-surface-dark">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold">{{ t('auth.reset_password') }}</h2>
        <CButton
          circle
          :aria-label="t('close')"
          :importance="ButtonImportance.Text"
          :theme="ButtonTheme.Neutral"
          @click="$emit('close')"
        >
          <IconX size="20" />
        </CButton>
      </div>

      <form @submit.prevent="resetPassword">
        <div class="mb-6">
          <p class="mb-4 text-sm">{{ t('auth.reset_password_instructions') }}</p>

          <label class="block mb-2 text-sm font-medium">{{ t('auth.email') }}</label>
          <InputText
            v-model="email"
            type="email"
            :placeholder="t('auth.email_placeholder')"
            class="w-full"
            required
          />
        </div>

        <div v-if="errorMessage" class="p-3 mb-4 text-sm text-red-500 bg-red-100 rounded-md dark:bg-red-900 dark:bg-opacity-20">
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="p-3 mb-4 text-sm text-green-500 bg-green-100 rounded-md dark:bg-green-900 dark:bg-opacity-20">
          {{ successMessage }}
        </div>

        <div class="flex flex-col gap-2">
          <CButton
            :disabled="isSubmitting"
            :importance="ButtonImportance.Filled"
            :theme="ButtonTheme.Primary"
            class="w-full"
            type="submit"
          >
            <IconKey v-if="!isSubmitting" size="20" class="mr-2" />
            <span>{{ isSubmitting ? t('auth.sending') : t('auth.send_reset_link') }}</span>
          </CButton>

          <div class="mt-4 text-sm text-center">
            <button
              type="button"
              class="text-primary dark:text-primary-dark"
              @click="$emit('openSignIn')"
            >
              {{ t('auth.back_to_sign_in') }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
