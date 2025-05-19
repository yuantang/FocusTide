<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { IconSettings } from '@tabler/icons-vue'
import { ButtonImportance, ButtonTheme } from '../base/types/button'
import CButton from '~/components/base/uiButton.vue'
import { useOpenPanels } from '~/stores/openpanels'

const { t } = useI18n()
const openPanels = useOpenPanels()

const openSettings = () => {
  openPanels.settings = true
}

defineEmits(['openSettings'])
</script>

<template>
  <div class="relative">
    <!-- 设置按钮 -->
    <CButton
      circle
      :aria-label="t('appbar.settings')"
      :importance="ButtonImportance.Filled"
      :theme="ButtonTheme.Neutral"
      class="h-11"
      no-content-theme
      no-padding
      inner-class="p-1"
      @click="openSettings"
    >
      <IconSettings size="24" class="inline-block" />
    </CButton>
  </div>
</template>
