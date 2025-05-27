# 安装指南

本指南将帮助您在本地环境中设置 FocusTide 开发环境。

## 📋 系统要求

### 必需软件
- **Node.js**: 18.0.0 或更高版本
- **Yarn**: 4.0.0 或更高版本（推荐）或 npm
- **Git**: 用于版本控制

### 推荐软件
- **VS Code**: 推荐的代码编辑器
- **Vue.js DevTools**: 浏览器扩展，用于调试

### 浏览器支持
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🚀 快速开始

### 1. 克隆仓库

```bash
# 使用 HTTPS
git clone https://github.com/yuantang/FocusTide.git

# 或使用 SSH
git clone git@github.com:yuantang/FocusTide.git

# 进入项目目录
cd FocusTide
```

### 2. 切换到开发分支

```bash
# 切换到 develop 分支（推荐用于开发）
git checkout develop
```

### 3. 安装依赖

```bash
# 使用 Yarn（推荐）
yarn install

# 或使用 npm
npm install
```

### 4. 启动开发服务器

```bash
# 启动开发服务器
yarn dev

# 或使用 npm
npm run dev
```

开发服务器将在 `http://localhost:3000` 启动。

## ⚙️ 环境配置

### 环境变量

创建 `.env` 文件（基于 `.env.example`）：

```bash
# 复制环境变量模板
cp .env.example .env
```

编辑 `.env` 文件：

```env
# Supabase 配置（可选，用于用户认证和数据同步）
NUXT_PUBLIC_SUPABASE_URL=your_supabase_url
NUXT_PUBLIC_SUPABASE_KEY=your_supabase_anon_key

# 应用配置
NUXT_PUBLIC_PLATFORM=web
NUXT_PUBLIC_URL=http://localhost:3000
```

### Supabase 配置（可选）

如果您需要测试用户认证和数据同步功能：

1. 在 [Supabase](https://supabase.com) 创建新项目
2. 获取项目 URL 和匿名密钥
3. 在 `.env` 文件中配置相应变量

## 🛠️ 开发工具配置

### VS Code 扩展

推荐安装以下 VS Code 扩展：

```json
{
  "recommendations": [
    "vue.volar",
    "vue.vscode-typescript-vue-plugin",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "stylelint.vscode-stylelint"
  ]
}
```

### VS Code 设置

在 `.vscode/settings.json` 中配置：

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.fixAll.stylelint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "vue.codeActions.enabled": true
}
```

## 📦 可用脚本

### 开发相关

```bash
# 启动开发服务器
yarn dev

# 构建应用
yarn build

# 生成静态站点
yarn generate

# 预览构建结果
yarn start

# 清理缓存
yarn clean
```

### 代码质量

```bash
# 运行 ESLint
yarn lint:js

# 运行 Stylelint
yarn lint:style

# 运行所有 lint 检查
yarn lint
```

### 版本发布

```bash
# 发布补丁版本
yarn release-patch

# 发布次要版本
yarn release-minor

# 发布主要版本
yarn release-major
```

## 🔧 故障排除

### 常见问题

#### 1. 依赖安装失败

```bash
# 清理缓存并重新安装
yarn cache clean
rm -rf node_modules
yarn install
```

#### 2. 端口被占用

```bash
# 使用不同端口启动
yarn dev --port 3001
```

#### 3. TypeScript 错误

```bash
# 重新生成类型文件
yarn nuxi prepare
```

#### 4. Tailwind CSS 样式不生效

确保 `tailwind.config.js` 配置正确，并重启开发服务器。

### 性能优化

#### 开发环境优化

```bash
# 禁用某些功能以提高开发速度
export NODE_OPTIONS="--max-old-space-size=4096"
```

#### 构建优化

```bash
# 使用现代构建
yarn generate:modern
```

## 📁 项目结构

```
FocusTide/
├── components/          # Vue 组件
├── stores/             # Pinia 状态管理
├── services/           # 业务逻辑服务
├── i18n/              # 国际化文件
├── assets/            # 静态资源
├── public/            # 公共文件
├── docs/              # 项目文档
├── modules/           # Nuxt 模块
├── platforms/         # 平台特定代码
└── plugins/           # Nuxt 插件
```

## 🎯 下一步

安装完成后，您可以：

1. 查看 [开发指南](./development.md) 了解开发流程
2. 阅读 [技术架构](./architecture.md) 了解项目结构
3. 查看 [贡献指南](./contributing.md) 参与项目开发

---

**需要帮助？** 查看 [故障排除](./troubleshooting.md) 或在 [GitHub Issues](https://github.com/yuantang/FocusTide/issues) 提问。
