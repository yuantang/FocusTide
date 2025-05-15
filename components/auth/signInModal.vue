<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { IconX, IconLogin } from '@tabler/icons-vue'
import { ButtonImportance, ButtonTheme } from '../base/types/button'
import CButton from '~/components/base/uiButton.vue'
import InputText from '~/components/base/inputText.vue'
import { useAuth } from '~/stores/auth'

const { t } = useI18n()
const authStore = useAuth()

const email = ref('')
const password = ref('')
const isSubmitting = ref(false)
const errorMessage = ref('')

const emit = defineEmits(['close', 'openSignUp', 'openResetPassword'])

const signIn = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = t('auth.fill_all_fields')
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    await authStore.signIn(email.value, password.value)

    if (!authStore.error) {
      emit('close')
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
  <div class="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50" @click.self="$emit('close')">
    <div class="w-full max-w-md p-6 rounded-lg shadow-lg bg-white dark:bg-gray-800">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold">{{ t('auth.sign_in') }}</h2>
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

      <form @submit.prevent="signIn">
        <div class="mb-4">
          <label class="block mb-2 text-sm font-medium">{{ t('auth.email') }}</label>
          <InputText
            v-model="email"
            type="email"
            :placeholder="t('auth.email_placeholder') || 'Enter your email'"
            class="w-full"
            required
          />
        </div>

        <div class="mb-6">
          <label class="block mb-2 text-sm font-medium">{{ t('auth.password') }}</label>
          <InputText
            v-model="password"
            type="password"
            :placeholder="t('auth.password_placeholder') || 'Enter your password'"
            class="w-full"
            required
          />
        </div>

        <div v-if="errorMessage" class="p-3 mb-4 text-sm text-red-500 bg-red-100 rounded-md dark:bg-red-900 dark:bg-opacity-20">
          {{ errorMessage }}
        </div>

        <div class="flex flex-col gap-2">
          <button
            :disabled="isSubmitting"
            class="w-full py-2 px-4 bg-primary hover:bg-primary-dark text-white rounded-md flex items-center justify-center transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary-dark focus:ring-opacity-50"
            type="submit"
          >
            <IconLogin v-if="!isSubmitting" size="20" class="mr-2" />
            <span>{{ isSubmitting ? t('auth.signing_in') : t('auth.sign_in') }}</span>
          </button>

          <div class="flex justify-between mt-4 text-sm">
            <button
              type="button"
              class="text-primary dark:text-primary-dark"
              @click="$emit('openResetPassword')"
            >
              {{ t('auth.forgot_password') }}
            </button>
            <button
              type="button"
              class="text-primary dark:text-primary-dark"
              @click="$emit('openSignUp')"
            >
              {{ t('auth.no_account') }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
