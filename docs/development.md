# 开发指南

本指南介绍 FocusTide 的开发流程、最佳实践和常用工作流程。

## 🚀 开发环境

### 启动开发服务器

```bash
# 启动开发服务器（热重载）
yarn dev

# 指定端口
yarn dev --port 3001

# 启用调试模式
DEBUG=nuxt:* yarn dev
```

### 开发服务器特性

- **热重载**: 代码更改自动刷新
- **TypeScript 支持**: 实时类型检查
- **ESLint 集成**: 代码质量检查
- **Stylelint 集成**: 样式检查
- **Vue DevTools**: 组件调试支持

## 🛠️ 开发工作流

### 1. 功能开发流程

```bash
# 1. 创建功能分支
git checkout develop
git pull origin develop
git checkout -b feature/new-feature

# 2. 开发功能
# 编写代码...

# 3. 运行测试和检查
yarn lint
yarn build

# 4. 提交代码
git add .
git commit -m "feat: add new feature"

# 5. 推送分支
git push origin feature/new-feature

# 6. 创建 Pull Request
```

### 2. Bug 修复流程

```bash
# 1. 创建修复分支
git checkout develop
git checkout -b fix/bug-description

# 2. 修复 Bug
# 编写修复代码...

# 3. 测试修复
yarn dev
# 验证修复效果

# 4. 提交修复
git commit -m "fix: resolve bug description"
```

## 📝 代码规范

### TypeScript 规范

```typescript
// ✅ 推荐：使用明确的类型定义
interface TimerSettings {
  workDuration: number
  shortBreakDuration: number
  longBreakDuration: number
}

// ✅ 推荐：使用 Composition API
export default defineComponent({
  setup() {
    const settings = ref<TimerSettings>({
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15
    })
    
    return { settings }
  }
})

// ❌ 避免：使用 any 类型
const data: any = {}

// ❌ 避免：使用 Options API（项目中已禁用）
export default {
  data() {
    return {}
  }
}
```

### Vue 组件规范

```vue
<!-- ✅ 推荐：组件结构 -->
<template>
  <div class="timer-component">
    <h2 class="timer-title">{{ title }}</h2>
    <div class="timer-display">{{ formattedTime }}</div>
  </div>
</template>

<script setup lang="ts">
// 导入
import { computed, ref } from 'vue'
import { useTimer } from '~/composables/useTimer'

// 接口定义
interface Props {
  title: string
  duration: number
}

// Props
const props = defineProps<Props>()

// 组合式函数
const { currentTime, isRunning } = useTimer()

// 计算属性
const formattedTime = computed(() => {
  const minutes = Math.floor(props.duration / 60)
  const seconds = props.duration % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})
</script>

<style scoped>
.timer-component {
  @apply flex flex-col items-center p-4;
}

.timer-title {
  @apply text-lg font-semibold mb-2;
}

.timer-display {
  @apply text-4xl font-mono;
}
</style>
```

### CSS/SCSS 规范

```scss
// ✅ 推荐：使用 Tailwind 类
.button {
  @apply px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600;
}

// ✅ 推荐：使用 CSS 变量
.theme-dark {
  --color-primary: #3b82f6;
  --color-background: #1f2937;
}

// ✅ 推荐：BEM 命名规范（必要时）
.timer-display {
  &__time {
    @apply text-4xl font-mono;
  }
  
  &__label {
    @apply text-sm text-gray-500;
  }
  
  &--large {
    @apply text-6xl;
  }
}

// ❌ 避免：深层嵌套
.component {
  .inner {
    .deep {
      .too-deep {
        // 避免超过 3 层嵌套
      }
    }
  }
}
```

## 🧪 测试和调试

### 代码质量检查

```bash
# ESLint 检查
yarn lint:js

# Stylelint 检查
yarn lint:style

# 全部检查
yarn lint

# 自动修复
yarn lint:js --fix
yarn lint:style --fix
```

### 构建测试

```bash
# 开发构建
yarn build

# 生产构建
yarn generate

# 预览构建结果
yarn start
```

### 调试技巧

#### 1. Vue DevTools

```typescript
// 在组件中添加调试信息
export default defineComponent({
  setup() {
    const debugInfo = computed(() => ({
      isRunning: timer.isRunning,
      currentTime: timer.currentTime,
      settings: settings.value
    }))
    
    // 开发环境下暴露调试信息
    if (process.dev) {
      (window as any).debugTimer = debugInfo
    }
    
    return { debugInfo }
  }
})
```

#### 2. 控制台调试

```typescript
// 使用 console.group 组织日志
console.group('Timer State')
console.log('Is Running:', isRunning.value)
console.log('Current Time:', currentTime.value)
console.groupEnd()

// 使用 console.table 显示数据
console.table(tasks.value)
```

#### 3. 性能调试

```typescript
// 性能标记
performance.mark('timer-start')
// ... 执行代码
performance.mark('timer-end')
performance.measure('timer-duration', 'timer-start', 'timer-end')
```

## 📦 依赖管理

### 添加新依赖

```bash
# 生产依赖
yarn add package-name

# 开发依赖
yarn add -D package-name

# 更新依赖
yarn upgrade package-name

# 检查过期依赖
yarn outdated
```

### 依赖选择原则

1. **优先选择轻量级库**
2. **检查维护状态和社区活跃度**
3. **确保 TypeScript 支持**
4. **考虑 Tree Shaking 支持**
5. **评估包大小影响**

## 🔧 常用开发任务

### 创建新组件

```bash
# 创建组件文件
touch components/timer/NewComponent.vue
```

```vue
<!-- components/timer/NewComponent.vue -->
<template>
  <div class="new-component">
    <!-- 组件内容 -->
  </div>
</template>

<script setup lang="ts">
// 组件逻辑
</script>

<style scoped>
/* 组件样式 */
</style>
```

### 添加新的 Store

```typescript
// stores/newStore.ts
import { defineStore } from 'pinia'

export const useNewStore = defineStore('new', {
  state: () => ({
    data: null as any
  }),
  
  getters: {
    processedData: (state) => {
      return state.data ? processData(state.data) : null
    }
  },
  
  actions: {
    async fetchData() {
      // 异步操作
    }
  }
})
```

### 添加新的服务

```typescript
// services/newService.ts
export class NewService {
  async performAction(): Promise<void> {
    // 服务逻辑
  }
}

export const newService = new NewService()
```

### 添加新的组合式函数

```typescript
// composables/useNewFeature.ts
export function useNewFeature() {
  const state = ref(null)
  
  const action = () => {
    // 功能逻辑
  }
  
  return {
    state: readonly(state),
    action
  }
}
```

## 🌍 国际化开发

### 添加新的翻译键

```json
// i18n/en.json
{
  "timer": {
    "start": "Start",
    "pause": "Pause",
    "reset": "Reset"
  }
}
```

### 在组件中使用翻译

```vue
<template>
  <button>{{ $t('timer.start') }}</button>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const buttonText = computed(() => t('timer.start'))
</script>
```

## 📱 移动端开发

### 响应式设计

```vue
<template>
  <div class="responsive-component">
    <!-- 移动端布局 -->
    <div class="md:hidden">
      <MobileLayout />
    </div>
    
    <!-- 桌面端布局 -->
    <div class="hidden md:block">
      <DesktopLayout />
    </div>
  </div>
</template>
```

### 触摸事件处理

```typescript
// 处理触摸事件
const handleTouch = (event: TouchEvent) => {
  event.preventDefault()
  // 触摸逻辑
}
```

## 🚀 性能优化

### 组件懒加载

```typescript
// 懒加载组件
const LazyComponent = defineAsyncComponent(() => 
  import('~/components/HeavyComponent.vue')
)
```

### 计算属性优化

```typescript
// 使用 computed 缓存计算结果
const expensiveValue = computed(() => {
  return heavyCalculation(props.data)
})
```

---

**下一步**: 查看 [组件系统](./components.md) 了解组件开发规范
