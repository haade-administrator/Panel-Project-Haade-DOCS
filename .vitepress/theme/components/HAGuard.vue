<template>
  <div v-if="isChecking" class="ha-guard-spinner">
    <span>{{ t('haGuard.checking') }}</span>
  </div>
  <slot v-else></slot>
</template>

<script setup lang="ts">
import { useData } from 'vitepress'
import { useHAStore } from '../stores/hassStore'
import { ref, watch, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const store = useHAStore()
const isChecking = ref(true)
const { lang, site } = useData()

const langDemoPage: Record<string, string> = {
  ru: 'ru/demo/',
  en: 'demo/'
}

const base = computed(() => (site.value.base || '/').replace(/\/+$/, '/'))

const loginPath = computed(() => {
  const l = lang.value in langDemoPage ? lang.value : 'en'
  return base.value + langDemoPage[l]
})

const isLoginPage = computed(() => {
  if (typeof window === 'undefined') return false
  const norm = (p: string) => p.replace(/\/+/g, '/').replace(/\/$/, '')
  return norm(window.location.pathname) === norm(loginPath.value)
})

const redirectToLogin = () => {
  if (typeof window !== 'undefined' && !isLoginPage.value) {
    window.location.href = loginPath.value
  }
}

onMounted(() => {
  if (!store.isConnected && !isLoginPage.value) redirectToLogin()
  isChecking.value = false
})

watch(() => store.isConnected, v => {
  if (!v && !isLoginPage.value) redirectToLogin()
})
</script>

<style scoped>
.ha-guard-spinner {
  text-align: center;
  padding: 40px 0;
  font-size: 18px;
  color: #428fff;
}
</style>
