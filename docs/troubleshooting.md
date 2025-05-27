# 故障排除指南

本指南帮助您解决在使用和开发 FocusTide 过程中可能遇到的常见问题。

## 🚀 安装和启动问题

### 1. Node.js 版本不兼容

**问题**: 启动时出现 Node.js 版本错误

**解决方案**:
```bash
# 检查当前 Node.js 版本
node --version

# 如果版本低于 18.0.0，请升级
# 使用 nvm 管理 Node.js 版本
nvm install 18
nvm use 18
```

### 2. 依赖安装失败

**问题**: `yarn install` 或 `npm install` 失败

**解决方案**:
```bash
# 清理缓存
yarn cache clean
# 或
npm cache clean --force

# 删除 node_modules 和锁文件
rm -rf node_modules
rm yarn.lock  # 或 package-lock.json

# 重新安装
yarn install
# 或
npm install
```

### 3. 端口被占用

**问题**: 默认端口 3000 被占用

**解决方案**:
```bash
# 使用不同端口启动
yarn dev --port 3001

# 或在 nuxt.config.ts 中配置
export default defineNuxtConfig({
  devServer: {
    port: 3001
  }
})
```

### 4. 权限错误

**问题**: 在某些系统上出现权限错误

**解决方案**:
```bash
# 修复 npm 权限（macOS/Linux）
sudo chown -R $(whoami) ~/.npm

# 或使用 yarn 替代 npm
npm install -g yarn
```

## 🔧 开发环境问题

### 1. TypeScript 错误

**问题**: TypeScript 类型检查失败

**解决方案**:
```bash
# 重新生成类型文件
yarn nuxi prepare

# 清理 .nuxt 目录
rm -rf .nuxt
yarn dev
```

### 2. Tailwind CSS 样式不生效

**问题**: 自定义样式或 Tailwind 类不工作

**解决方案**:
1. 检查 `tailwind.config.js` 配置
2. 确保文件路径在 `content` 数组中
3. 重启开发服务器

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
    "./app.vue"
  ]
}
```

### 3. 热重载不工作

**问题**: 代码更改后页面不自动刷新

**解决方案**:
```bash
# 重启开发服务器
yarn dev

# 检查文件监听限制（Linux）
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### 4. ESLint 错误

**问题**: 代码检查失败

**解决方案**:
```bash
# 自动修复可修复的错误
yarn lint:js --fix

# 检查具体错误
yarn lint:js --debug
```

## 🌐 浏览器兼容性问题

### 1. 旧版浏览器不支持

**问题**: 在旧版浏览器中功能异常

**解决方案**:
- 确保使用现代浏览器（Chrome 90+, Firefox 88+, Safari 14+, Edge 90+）
- 检查浏览器是否启用了 JavaScript
- 清除浏览器缓存和 Cookie

### 2. PWA 安装问题

**问题**: 无法安装为 PWA 应用

**解决方案**:
1. 确保使用 HTTPS 连接（本地开发除外）
2. 检查 Service Worker 是否正常注册
3. 验证 manifest.json 文件

```bash
# 检查 Service Worker 状态
# 在浏览器开发者工具 -> Application -> Service Workers
```

### 3. 通知权限问题

**问题**: 桌面通知不工作

**解决方案**:
1. 检查浏览器通知权限设置
2. 确保网站有通知权限
3. 在设置中启用通知功能

## 🔐 认证和同步问题

### 1. Supabase 连接失败

**问题**: 无法连接到 Supabase 服务

**解决方案**:
1. 检查 `.env` 文件中的 Supabase 配置
2. 验证 URL 和 API 密钥是否正确
3. 检查网络连接

```env
# .env 文件示例
NUXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NUXT_PUBLIC_SUPABASE_KEY=your-anon-key
```

### 2. 登录失败

**问题**: 用户无法登录或注册

**解决方案**:
1. 检查邮箱格式是否正确
2. 确保密码符合要求（至少 6 位）
3. 检查 Supabase 项目设置
4. 查看浏览器控制台错误信息

### 3. 数据同步问题

**问题**: 数据无法同步到云端

**解决方案**:
1. 确保用户已登录
2. 检查网络连接
3. 查看同步状态指示器
4. 手动触发同步

```typescript
// 手动同步数据
import { syncService } from '~/services/syncService'
await syncService.syncData()
```

### 4. 数据导入导出问题

**问题**: 无法导入或导出数据

**解决方案**:
1. 确保文件格式为 JSON
2. 检查文件内容是否有效
3. 验证浏览器文件访问权限

## 📱 移动端问题

### 1. 响应式布局问题

**问题**: 在移动设备上显示异常

**解决方案**:
1. 检查 viewport meta 标签
2. 测试不同屏幕尺寸
3. 使用浏览器开发者工具的设备模拟器

### 2. 触摸事件问题

**问题**: 触摸操作不响应

**解决方案**:
1. 检查触摸事件处理器
2. 确保元素有足够的触摸区域
3. 测试不同设备和浏览器

### 3. 性能问题

**问题**: 在移动设备上运行缓慢

**解决方案**:
1. 优化图片和资源大小
2. 减少不必要的动画
3. 使用浏览器性能分析工具

## 🎵 音频和通知问题

### 1. 音频不播放

**问题**: 计时器结束时没有声音

**解决方案**:
1. 检查浏览器音频权限
2. 确保设备音量不为零
3. 在设置中启用音频通知
4. 检查音频文件是否存在

### 2. 通知不显示

**问题**: 桌面通知不出现

**解决方案**:
1. 授予浏览器通知权限
2. 检查系统通知设置
3. 确保网站通知未被阻止

## 🔍 调试技巧

### 1. 浏览器开发者工具

```javascript
// 在控制台中检查应用状态
// 检查 Pinia store 状态
window.$nuxt.$pinia._s.get('main')

// 检查当前路由
window.$nuxt.$router.currentRoute.value

// 检查环境变量
window.$nuxt.$config.public
```

### 2. Vue DevTools

安装 Vue DevTools 浏览器扩展来调试 Vue 组件和状态。

### 3. 网络请求调试

在开发者工具的 Network 标签中检查 API 请求和响应。

### 4. 本地存储检查

```javascript
// 检查本地存储数据
localStorage.getItem('settings')
localStorage.getItem('tasks')
```

## 📞 获取帮助

如果以上解决方案都无法解决您的问题，请：

1. **查看 GitHub Issues**: [https://github.com/yuantang/FocusTide/issues](https://github.com/yuantang/FocusTide/issues)
2. **创建新 Issue**: 提供详细的错误信息和重现步骤
3. **参与讨论**: [https://github.com/yuantang/FocusTide/discussions](https://github.com/yuantang/FocusTide/discussions)

### 报告 Bug 时请提供

- 操作系统和版本
- 浏览器和版本
- FocusTide 版本
- 详细的错误信息
- 重现步骤
- 浏览器控制台日志

### 示例 Bug 报告

```markdown
**环境信息**
- OS: macOS 13.0
- Browser: Chrome 120.0
- FocusTide Version: 1.7.0

**问题描述**
计时器无法启动，点击开始按钮没有反应。

**重现步骤**
1. 打开 FocusTide
2. 点击开始按钮
3. 计时器保持在初始状态

**预期行为**
计时器应该开始倒计时。

**控制台错误**
```
TypeError: Cannot read property 'start' of undefined
    at TimerComponent.vue:45
```

---

**需要更多帮助？** 查看我们的 [GitHub Discussions](https://github.com/yuantang/FocusTide/discussions) 或创建一个 [Issue](https://github.com/yuantang/FocusTide/issues)。
