import DefaultTheme from 'vitepress/theme'
import { h, watch } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { useData } from 'vitepress'

// Компоненты
import HALogin from './components/HALogin.vue'
import HAGuard from './components/HAGuard.vue'
import LightWidget from './components/LightWidget.vue'
import ClimateWidget from './components/ClimateWidget.vue'
import ClimateDownload from './components/ClimateDownload.vue'

import './custom.css'
import '@mdi/font/css/materialdesignicons.css'

console.log('%c[i18n-BOOT] theme index (eager) EXECUTED', 'background:#222;color:#bada55')

// EAGER импорт всех JSON
// Если нужен строгий контроль — поменяйте шаблон пути.
const modules = import.meta.glob('./languages/*.json', { eager: true, import: 'default' })

function normalizeLocale(raw) {
  if (!raw) return 'en'
  const l = raw.toLowerCase()
  if (l.startsWith('ru')) return 'ru'
  if (l.startsWith('en')) return 'en'
  return 'en'
}

// Собираем messages = { en: {...}, ru: {...} }
const messages = {}
for (const [path, data] of Object.entries(modules)) {
  const match = path.match(/\/([a-z0-9_-]+)\.json$/i)
  if (!match) continue
  const locale = normalizeLocale(match[1])
  messages[locale] = data
}
console.log('[i18n] eager messages locales:', Object.keys(messages))

const i18n = createI18n({
  legacy: false,
  locale: 'en',         // временно до контроллера
  fallbackLocale: false, // без fallback
  messages
})

// Делаем доступным для отладки
if (typeof window !== 'undefined') {
  window.__i18n = i18n
}

const I18nController = {
  name: 'I18nController',
  setup() {
    const { lang } = useData()
    // Первичная установка
    i18n.global.locale.value = normalizeLocale(lang.value)

    // Реакция на смену /:lang/ маршрута VitePress
    watch(
      () => lang.value,
      (nv) => {
        i18n.global.locale.value = normalizeLocale(nv)
        console.log('[i18n] switched to', i18n.global.locale.value)
      }
    )

    return () => null
  }
}

const Theme = {
  extends: DefaultTheme,
  Layout() {
    const Layout = DefaultTheme.Layout
    return h(Layout, null, {
      'layout-top': () => h(I18nController)
    })
  },
  enhanceApp({ app }) {
    console.log('[i18n] enhanceApp (eager)')
    const pinia = createPinia()
    app.use(pinia)
    app.use(i18n)

    app.component('HALogin', HALogin)
    app.component('HAGuard', HAGuard)
    app.component('LightWidget', LightWidget)
    app.component('ClimateWidget', ClimateWidget)
    app.component('ClimateDownload', ClimateDownload)
  }
}

export default Theme
