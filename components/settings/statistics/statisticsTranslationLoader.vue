<template>
  <!-- 这是一个空的组件，用于加载统计模块的翻译 -->
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { onMounted } from 'vue'

const { locale } = useI18n()

// 这个组件用于确保统计模块的翻译被正确加载
// 在生产环境中不会显示任何内容
onMounted(() => {
  console.log(`Statistics translation loader mounted, current locale: ${locale.value}`)
})
</script>
