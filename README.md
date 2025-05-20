# ⏳ FocusTide

Free, modern and open-source timer application, right in your browser. Formerly AnotherPomodoro.

![Netlify Status](https://api.netlify.com/api/v1/badges/7cb2b7fb-cacd-4acf-803b-8af9dad9f2a8/deploy-status) ![License](https://img.shields.io/github/license/Hanziness/AnotherPomodoro) ![GitHub package.json version](https://img.shields.io/github/package-json/v/Hanziness/AnotherPomodoro) [![Crowdin translation status](https://badges.crowdin.net/anotherpomodoro/localized.svg)](https://crowdin.com/project/anotherpomodoro)

![Screenshot of the application showing a work section.](./public/assets/img/ProductImg_Default.png)

## What is FocusTide?

FocusTide is a Pomodoro timer application running in the browser. It helps you manage your time effectively, enhancing productivity by structuring your work into focused sessions and breaks.

## Key Features

### ⏰ Multiple Timer Styles
* **Traditional (12:34)** - Classic timer with second-precision for exact time tracking
* **Approximate (12 minutes)** - Displays time with minute-precision to reduce distraction
* **Percentage (50%)** - Shows completion percentage to keep you focused on the task

### 💡 Clean User Interface
* Minimalist design with essential controls
* Customizable elements:
  * Schedule overview
  * Smart to-do list
  * Color-coded sections
  * Progress bar

### 📑 Flexible Schedule
* Adjustable session lengths with built-in presets
* Configurable long pause frequency
* Tracks time beyond timer expiration

### 🎵 Notification Options
* Sound alerts when sections finish
* Desktop notifications for browser-free monitoring

### ✅ Integrated To-Do List
* Section-specific tasks (work, pause, long pause)
* Shows only relevant tasks during active sessions
* Optional automatic task cleanup
* Persistent across sessions

### ✨ Additional Features
* Settings persistence
* Progressive Web App (PWA) capabilities
* Fluid animations
* Setup wizard
* Available in 5 languages
* No installation required
* Open-source development

## ⚠ Transparency Notice
Production deployments may use privacy-friendly third-party tools to measure site performance. The application itself does not collect any user data when running locally.

## 🖼 More Screenshots
![The display section of the settings panel](./public/assets/img/ProductImg_Settings.png)

![The traditional timer with the to-do panel open](./public/assets/img/ProductImg_TodoOpen.png)

### ❤ Technology Stack
* [**NuxtJS**](https://nuxtjs.org/) (and [**VueJS**](https://vuejs.org/))
  * [`vue-i18n`](https://kazupon.github.io/vue-i18n/) for localization
  * [`nuxt/google-fonts`](https://github.com/nuxt-community/google-fonts-module) for Google Fonts
  * [`pinia`](https://pinia.vuejs.org/) for state management
* [**Tailwind CSS**](https://tailwindcss.com/)
* [Tabler Icons](https://tabler-icons.io/)
* [Workbox](https://github.com/GoogleChrome/workbox) for PWA service worker
* [`conventional-changelog/standard-version`](https://github.com/conventional-changelog/standard-version) for changelog generation

### 🛠 Building and Running

```bash
# Install dependencies
$ yarn install

# Serve with hot reload at localhost:3000
$ yarn dev

# Generate the final static site
$ yarn generate
```
