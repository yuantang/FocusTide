<script setup lang="ts">
import { IconHeartHandshake, IconX } from '@tabler/icons-vue'
import { ButtonImportance, ButtonTheme } from '../base/types/button'
import Button from '~~/components/base/uiButton.vue'
import PopupSheet from '@/components/base/popupSheet.vue'

const emit = defineEmits(['close', 'openSignIn', 'openSignUp'])
</script>

<template>
  <popup-sheet class="fixed w-full max-w-2xl md:p-4" open>
    <div class="flex flex-col px-6 pt-6 pb-6 transition bg-surface-light dark:bg-surface-dark md:backdrop-blur-xl md:backdrop-brightness-200 md:backdrop-contrast-50 md:bg-opacity-80 md:dark:bg-opacity-80 shadow-lg md:pb-3 rounded-t-2xl md:rounded-2xl max-h-[90vh] md:h-auto md:min-h-[24rem] ring-1 ring-surface-onlight dark:ring-surface-ondark ring-opacity-20 dark:ring-opacity-20 md:ring-inset">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold flex items-center">
          <IconHeartHandshake class="mr-2" size="24" />
          {{ $t('tutorials.onboarding.pages.support.heading') }}
        </h2>
        <Button
          circle
          :importance="ButtonImportance.Text"
          :theme="ButtonTheme.Neutral"
          @click="$emit('close')"
        >
          <IconX size="20" />
        </Button>
      </div>
      
      <div class="flex-grow flex flex-col items-center justify-center">
        <p class="mb-6 text-center text-lg">{{ $t('auth.sign_in_benefits') }}</p>
        
        <div class="flex flex-col gap-4 w-full max-w-md">
          <Button
            :importance="ButtonImportance.Filled"
            class="w-full"
            @click="$emit('openSignIn'); $emit('close')"
          >
            {{ $t('auth.sign_in') }}
          </Button>
          
          <Button
            :importance="ButtonImportance.Outline"
            class="w-full"
            @click="$emit('openSignUp'); $emit('close')"
          >
            {{ $t('auth.sign_up') }}
          </Button>
        </div>
      </div>
      
      <div class="flex flex-col gap-2 mt-6 md:flex-row">
        <Button 
          class="flex-grow w-full" 
          default-style 
          :theme="ButtonTheme.Primary" 
          :importance="ButtonImportance.Outline" 
          @click="$emit('close')"
        >
          {{ $t('tutorials.onboarding.buttons.close') }}
        </Button>
      </div>
    </div>
  </popup-sheet>
</template>
