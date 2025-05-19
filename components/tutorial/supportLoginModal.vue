<script setup lang="ts">
import { IconHeartHandshake, IconX } from '@tabler/icons-vue'
import { ButtonImportance, ButtonTheme } from '../base/types/button'
import CButton from '~/components/base/uiButton.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const emit = defineEmits(['close', 'openSignIn', 'openSignUp'])
</script>

<template>
  <div class="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50" @click.self="$emit('close')">
    <div class="w-full max-w-md p-6 rounded-lg shadow-lg bg-white dark:bg-gray-800">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold flex items-center">
          <IconHeartHandshake class="mr-2" size="24" />
          {{ $t('tutorials.onboarding.pages.support.heading') }}
        </h2>
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

      <div class="mb-6">
        <p class="mb-4 text-center">{{ $t('auth.sign_in_benefits') }}</p>
        
        <div class="flex flex-col gap-4 mt-6">
          <CButton
            :importance="ButtonImportance.Filled"
            class="w-full"
            @click="$emit('openSignIn')"
          >
            {{ $t('auth.sign_in') }}
          </CButton>
          
          <CButton
            :importance="ButtonImportance.Outline"
            class="w-full"
            @click="$emit('openSignUp')"
          >
            {{ $t('auth.sign_up') }}
          </CButton>
          
          <CButton
            :importance="ButtonImportance.Text"
            class="w-full mt-2"
            @click="$emit('close')"
          >
            {{ $t('tutorials.onboarding.buttons.close') }}
          </CButton>
        </div>
      </div>
    </div>
  </div>
</template>
