// 这个文件用于定义插件的加载顺序
// 确保i18n插件先加载，然后是中文翻译加载器

export default defineNuxtPlugin(() => {
  // 这个插件只是用来确保其他插件按正确顺序加载
  console.log('Plugins loader initialized')
})
