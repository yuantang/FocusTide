# 贡献指南

感谢您对 FocusTide 项目的关注！我们欢迎各种形式的贡献，无论是代码、文档、翻译还是反馈。

## 🤝 贡献方式

### 💻 代码贡献
- 修复 Bug
- 添加新功能
- 性能优化
- 代码重构

### 📝 文档贡献
- 改进现有文档
- 添加新的文档
- 修正错误和遗漏
- 翻译文档

### 🌍 翻译贡献
- 添加新语言支持
- 改进现有翻译
- 修正翻译错误

### 🐛 问题反馈
- 报告 Bug
- 提出功能建议
- 改进建议

### 🎨 设计贡献
- UI/UX 改进
- 图标设计
- 品牌设计

## 🚀 开始贡献

### 1. 准备工作

#### Fork 仓库
1. 访问 [FocusTide GitHub 仓库](https://github.com/yuantang/FocusTide)
2. 点击右上角的 "Fork" 按钮
3. 将仓库 Fork 到您的 GitHub 账户

#### 克隆仓库
```bash
# 克隆您的 Fork
git clone https://github.com/your-username/FocusTide.git
cd FocusTide

# 添加上游仓库
git remote add upstream https://github.com/yuantang/FocusTide.git
```

#### 设置开发环境
```bash
# 安装依赖
yarn install

# 启动开发服务器
yarn dev
```

### 2. 开发流程

#### 创建功能分支
```bash
# 确保在最新的 develop 分支
git checkout develop
git pull upstream develop

# 创建新的功能分支
git checkout -b feature/your-feature-name
# 或修复分支
git checkout -b fix/bug-description
```

#### 进行开发
1. 编写代码
2. 遵循项目的代码规范
3. 添加必要的测试
4. 更新相关文档

#### 提交代码
```bash
# 添加更改
git add .

# 提交更改（遵循提交规范）
git commit -m "feat: add new feature description"

# 推送到您的 Fork
git push origin feature/your-feature-name
```

### 3. 创建 Pull Request

1. 访问您的 Fork 页面
2. 点击 "New Pull Request"
3. 选择 `develop` 作为目标分支
4. 填写 PR 描述
5. 提交 Pull Request

## 📋 代码规范

### 提交信息规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### 类型 (Type)
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式化（不影响功能）
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

#### 示例
```bash
feat: add percentage timer display mode
fix: resolve timer not starting on mobile devices
docs: update installation guide
style: format code with prettier
refactor: extract timer logic to composable
perf: optimize component rendering
test: add unit tests for timer functions
chore: update dependencies
```

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
```

### Vue 组件规范

```vue
<!-- ✅ 推荐的组件结构 -->
<template>
  <div class="component-name">
    <!-- 模板内容 -->
  </div>
</template>

<script setup lang="ts">
// 导入
import { computed, ref } from 'vue'

// 接口定义
interface Props {
  title: string
  duration: number
}

// Props
const props = defineProps<Props>()

// 响应式数据
const isActive = ref(false)

// 计算属性
const formattedDuration = computed(() => {
  return `${props.duration} minutes`
})

// 方法
const handleClick = () => {
  isActive.value = !isActive.value
}
</script>

<style scoped>
.component-name {
  @apply flex items-center justify-center;
}
</style>
```

### CSS/SCSS 规范

```scss
// ✅ 推荐：使用 Tailwind 类
.button {
  @apply px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600;
}

// ✅ 推荐：使用 BEM 命名（必要时）
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
```

## 🌍 翻译贡献

### 添加新语言

1. 在 `i18n/` 目录下创建新的语言文件：
```bash
# 例如添加法语支持
cp i18n/en.json i18n/fr.json
```

2. 翻译 JSON 文件中的所有字符串

3. 在 `nuxt.config.ts` 中添加语言配置：
```typescript
export default defineNuxtConfig({
  i18n: {
    locales: [
      // 现有语言...
      {
        code: 'fr',
        name: 'Français',
        file: 'fr.json'
      }
    ]
  }
})
```

### 改进现有翻译

1. 找到对应的语言文件（如 `i18n/zh.json`）
2. 修改或添加翻译条目
3. 确保翻译准确且符合上下文

### 翻译指南

- 保持翻译简洁明了
- 考虑用户界面的空间限制
- 保持术语的一致性
- 遵循目标语言的习惯用法

## 🐛 Bug 报告

### 报告 Bug 前

1. 搜索现有的 Issues，确保问题未被报告
2. 尝试在最新版本中重现问题
3. 收集相关信息

### Bug 报告模板

```markdown
**环境信息**
- OS: [e.g. macOS 13.0, Windows 11, Ubuntu 22.04]
- Browser: [e.g. Chrome 120.0, Firefox 119.0, Safari 17.0]
- FocusTide Version: [e.g. 1.7.0]

**问题描述**
简洁清晰地描述问题。

**重现步骤**
1. 打开应用
2. 点击 '...'
3. 滚动到 '...'
4. 看到错误

**预期行为**
描述您期望发生的行为。

**实际行为**
描述实际发生的行为。

**截图**
如果适用，添加截图来帮助解释问题。

**控制台错误**
如果有控制台错误，请粘贴错误信息。

**附加信息**
添加任何其他有助于解决问题的信息。
```

## 💡 功能建议

### 建议新功能前

1. 搜索现有的 Issues 和 Discussions
2. 考虑功能的必要性和通用性
3. 思考实现的可行性

### 功能建议模板

```markdown
**功能描述**
简洁清晰地描述您想要的功能。

**问题背景**
描述这个功能要解决的问题。

**解决方案**
描述您希望的解决方案。

**替代方案**
描述您考虑过的其他解决方案。

**附加信息**
添加任何其他相关信息、截图或示例。
```

## 🔍 代码审查

### 审查标准

- 代码质量和可读性
- 性能影响
- 安全性考虑
- 测试覆盖率
- 文档完整性
- 向后兼容性

### 审查流程

1. 自动化检查（ESLint, TypeScript, 构建测试）
2. 人工代码审查
3. 功能测试
4. 文档审查

## 🏆 贡献者认可

我们重视每一位贡献者的努力：

- 贡献者将被添加到项目的 Contributors 列表
- 重大贡献将在 CHANGELOG 中特别提及
- 活跃贡献者可能被邀请成为项目维护者

## 📞 联系我们

如果您有任何问题或需要帮助：

- **GitHub Issues**: [报告问题](https://github.com/yuantang/FocusTide/issues)
- **GitHub Discussions**: [参与讨论](https://github.com/yuantang/FocusTide/discussions)
- **Email**: 通过 GitHub 联系项目维护者

## 📄 行为准则

我们致力于为每个人提供友好、安全和欢迎的环境。请遵循以下原则：

- 使用友好和包容的语言
- 尊重不同的观点和经验
- 优雅地接受建设性批评
- 专注于对社区最有利的事情
- 对其他社区成员表现出同理心

## 🙏 感谢

感谢您考虑为 FocusTide 做出贡献！您的参与使这个项目变得更好。

---

**准备开始了吗？** 查看我们的 [Good First Issues](https://github.com/yuantang/FocusTide/labels/good%20first%20issue) 来找到适合新贡献者的任务！
