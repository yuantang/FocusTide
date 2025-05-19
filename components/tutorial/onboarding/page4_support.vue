<script setup lang="ts">
import { IconHeartHandshake, IconLogin } from '@tabler/icons-vue'
import OnboardingHeader from './onboardingHeader.vue'
import OnboardingPage from './onboardingPage.vue'
</script>

<template>
  <OnboardingPage>
    <OnboardingHeader :text="$t('tutorials.onboarding.pages.support.heading')">
      <IconLogin :size="42" />
    </OnboardingHeader>

    <div class="text-center" v-text="$t('auth.sign_in_benefits')" />
  </OnboardingPage>
</template>
