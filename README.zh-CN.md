## 📚 特性

- 📖 [Vue 3.2](https://github.com/vuejs/core)
- 📖 [Vite 4.x](https://github.com/vitejs/vite)
- 📖 UI Framework [Vuetify 3](https://next.vuetifyjs.com/en/)
- 📖 TypeScript
- 📦 组件自动导入
- 🍍 通过 [Pinia](https://pinia.vuejs.org/)进行状态管理
- 📔 使用新的 `<script setup>` 语法
- 📚 使用任意的图标集 [Iconify](https://icon-sets.iconify.design/)
- ☁️ 零配置部署在 Netlify
- 🔑 Firebase 授权
- 📈 Echarts, ApexChart
- 🧭 Openai, Chatgpt 支持
- 🌍 vue-i18n 多语言支持
- 📚 virtual-scroller , vuedraggable , perfect-scrollbar
- 📝 富文本编辑器
- 📇 响应式多平台自适应

## 📦Pre-packed

### 🏷️UI 框架

- [Vuetify3](https://next.vuetifyjs.com/en/) - Vuetify 是一个不要求设计能力的 Vue 界面组件框架，自带了许多自行设计实现的 Vue 组件。

### 🏷️Icons

- [Iconify](https://iconify.design) - 使用任意的图标集 [🔍Icônes](https://icones.netlify.app/)
- [Pure CSS Icons via UnoCSS](https://github.com/antfu/unocss/tree/main/packages/preset-icons)

### 🏷️ 插件

- [Vue Router4](https://router.vuejs.org/)
- [VueUse](https://github.com/antfu/vueuse) - 非常有用的组合式 API 合集
- [VuedDaggable](https://github.com/SortableJS/Vue.Draggable) - 允许进行与数组模型同步的拖拽放置操作
- [Vue-Masonry-Wall](https://github.com/DerYeger/yeger/tree/main/packages/vue-masonry-wall) - 是一种 Vue3 响应式,支持 SSR,且零依的的瀑布流布局方案
- [Vue-Virtual-Scroller](https://github.com/Akryum/vue-virtual-scroller) - 大数据快速虚拟滚动插件

## 👻 现在可以试试!

```
npm install

npm run dev
```

### 🔑 配置 ApiKey

找到根目录下的`.env.template`文件，去掉`.template`后缀
把`VITE_OPENAI_API_KEY`,`VITE_UNSPLASH_ACCESS_KEY`,`VITE_GITHUB_CLIENT_ID`,`VITE_TTS_KEY` , `VITE_TTS_REGION`分别替换成你自己的

> openai apikey： https://platform.openai.com/account/api-keys

> unsplash apikey： https://unsplash.com/oauth/applications

> github apikey： https://github.com/settings/tokens

> azure textToSpeech : https://speech.microsoft.com/
