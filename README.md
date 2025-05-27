# FocusTide

<div align="center">
  <img src="public/icon.png" alt="FocusTide Logo" width="120" height="120">

  <h3>A modern, open-source Pomodoro timer that runs in your browser</h3>

  <p>Designed to help you manage your time effectively through structured work and break periods.</p>

  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Nuxt](https://img.shields.io/badge/Nuxt-3.x-00DC82.svg)](https://nuxt.com/)
  [![Vue](https://img.shields.io/badge/Vue-3.x-4FC08D.svg)](https://vuejs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)](https://www.typescriptlang.org/)
</div>

---

## ✨ Features

### ⏰ Versatile Timer Displays
- **Traditional Timer (12:34)**: Classic countdown display with second precision
- **Approximate Timer (12 minutes)**: Minute-precision display to reduce distraction
- **Percentage Timer (50%)**: Shows completion percentage for a different perspective

### 💡 Clean Interface
- Minimalist design showing only essential controls
- Customizable elements:
  - Schedule overview
  - Smart todo list
  - Color-coded segments
  - Progress bar

### 📑 Flexible Scheduling
- Adjustable session lengths with built-in presets
- Configurable long break frequency
- Continue tracking time after timer completion

### 🎵 Notification Options
- Sound alerts when segments end
- Desktop notifications for background monitoring

### ✅ Integrated Todo List
- Segment-specific tasks (work, break, long break)
- Shows only relevant tasks during active sessions
- Optional automatic task cleanup
- Persistent across sessions

### 🌍 Multi-language Support
- Support for 9+ languages including Chinese, English, Japanese, Korean
- Easy language switching in settings
- Community-driven translations

### 🔐 User Authentication & Sync
- Supabase-based user authentication
- Cloud data synchronization
- Cross-device data consistency
- Data import/export functionality

### 🎨 Theme System
- Automatic dark/light theme switching
- Custom color schemes
- Responsive design for all devices

### 📱 PWA Support
- Progressive Web App capabilities
- Offline functionality
- Installable on desktop/mobile
- Native app-like experience

## 🚀 Quick Start

### Prerequisites
- **Node.js**: 18.0.0 or higher
- **Yarn**: 4.0.0 or higher (recommended) or npm
- **Git**: For version control

### Installation

```bash
# Clone the repository
git clone https://github.com/yuantang/FocusTide.git
cd FocusTide

# Install dependencies
yarn install

# Start development server
yarn dev
```

The application will be available at `http://localhost:3000`.

### Environment Setup

Copy the environment variables template:

```bash
cp .env.example .env
```

Edit `.env` file with your configuration:

```env
# Supabase configuration (optional, for user authentication and sync)
NUXT_PUBLIC_SUPABASE_URL=your_supabase_url
NUXT_PUBLIC_SUPABASE_KEY=your_supabase_anon_key

# Application configuration
NUXT_PUBLIC_PLATFORM=web
NUXT_PUBLIC_URL=http://localhost:3000
```

## 🏗️ Technology Stack

### Frontend
- **Framework**: Nuxt.js 3 (Vue.js 3)
- **State Management**: Pinia
- **Styling**: Tailwind CSS
- **Icons**: Tabler Icons
- **Internationalization**: Vue I18n
- **Build Tool**: Vite

### Backend & Services
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Real-time Sync**: Supabase Realtime

### Development Tools
- **Language**: TypeScript
- **Code Quality**: ESLint + Stylelint
- **Version Control**: Standard Version
- **Package Manager**: Yarn 4

## 📋 Available Scripts

```bash
# Development
yarn dev              # Start development server
yarn build            # Build for production
yarn generate         # Generate static site
yarn start            # Preview production build
yarn clean            # Clean cache

# Code Quality
yarn lint:js          # Run ESLint
yarn lint:style       # Run Stylelint
yarn lint             # Run all linters

# Release Management
yarn release-patch    # Release patch version
yarn release-minor    # Release minor version
yarn release-major    # Release major version
```

## 📁 Project Structure

```
FocusTide/
├── app.vue                 # Application root component
├── nuxt.config.ts         # Nuxt configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
│
├── components/            # Vue components
│   ├── base/             # Base UI components
│   ├── timer/            # Timer-related components
│   ├── settings/         # Settings components
│   ├── todoList/         # Todo list components
│   └── whiteNoise/       # White noise components
│
├── stores/               # Pinia state management
│   ├── main.ts          # Main timer state
│   ├── settings.ts      # Settings state
│   ├── tasklist.ts      # Task list state
│   └── auth.ts          # Authentication state
│
├── services/             # Business logic services
│   └── syncService.ts    # Data synchronization service
│
├── i18n/                # Internationalization files
│   ├── en.json          # English translations
│   ├── zh.json          # Chinese translations
│   └── ...              # Other languages
│
├── assets/               # Static assets
├── public/              # Public files
├── docs/                # Project documentation
├── modules/             # Nuxt modules
├── platforms/           # Platform-specific code
└── plugins/             # Nuxt plugins
```

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

### 🚀 Getting Started
- [📖 Project Overview](./docs/overview.md) - Project introduction, features, and vision
- [⚙️ Installation Guide](./docs/installation.md) - Setup, configuration, and troubleshooting
- [🛠️ Development Guide](./docs/development.md) - Development workflow and best practices

### 🏗️ Architecture
- [🏛️ Technical Architecture](./docs/architecture.md) - System design and patterns
- [⏰ Timer System](./docs/timer-system.md) - Core timer functionality and implementation
- [🔄 Data Sync](./docs/data-sync.md) - User authentication and cloud synchronization

### 📖 Full Documentation
Visit [docs/README.md](./docs/README.md) for the complete documentation index.

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute
- 🐛 **Bug Reports**: Found a bug? [Open an issue](https://github.com/yuantang/FocusTide/issues)
- 💡 **Feature Requests**: Have an idea? [Start a discussion](https://github.com/yuantang/FocusTide/discussions)
- 🌍 **Translations**: Help translate FocusTide to your language
- 📝 **Documentation**: Improve our docs
- 💻 **Code**: Submit pull requests for bug fixes or new features

### Development Workflow

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/your-username/FocusTide.git`
3. **Create** a feature branch: `git checkout -b feature/amazing-feature`
4. **Make** your changes
5. **Test** your changes: `yarn lint && yarn build`
6. **Commit** your changes: `git commit -m 'feat: add amazing feature'`
7. **Push** to the branch: `git push origin feature/amazing-feature`
8. **Submit** a pull request

Please read our [Contributing Guide](./CONTRIBUTING.md) for detailed guidelines.

## 📊 Project Stats

- **Lines of Code**: ~15,000+
- **Components**: 50+ Vue components
- **Languages**: 9 supported languages
- **Browser Support**: All modern browsers
- **Mobile**: Fully responsive design

## 🌟 Community

- **GitHub Discussions**: [Join the conversation](https://github.com/yuantang/FocusTide/discussions)
- **Issues**: [Report bugs or request features](https://github.com/yuantang/FocusTide/issues)
- **Releases**: [View changelog](https://github.com/yuantang/FocusTide/releases)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Framework**: Built with [Nuxt.js](https://nuxt.com/) and [Vue.js](https://vuejs.org/)
- **Icons**: Beautiful icons by [Tabler Icons](https://tabler-icons.io/)
- **Styling**: Powered by [Tailwind CSS](https://tailwindcss.com/)
- **Backend**: Database and auth by [Supabase](https://supabase.com/)
- **Hosting**: Deployed on [Vercel](https://vercel.com/)

## 🚀 Deployment

FocusTide can be deployed on various platforms:

- **Vercel** (Recommended): One-click deployment
- **Netlify**: Static site generation
- **Docker**: Containerized deployment
- **Self-hosted**: Deploy on your own server

See our [Deployment Guide](./docs/deployment.md) for detailed instructions.

---

<div align="center">
  <p>Made with ❤️ by the FocusTide community</p>
  <p>
    <a href="https://focustide.app">Website</a> •
    <a href="./docs/README.md">Documentation</a> •
    <a href="https://github.com/yuantang/FocusTide/discussions">Community</a> •
    <a href="./CONTRIBUTING.md">Contributing</a>
  </p>
</div>
