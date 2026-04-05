<template>
  <div class="ha-login">
    <div v-if="!store.isConnected" class="auth-section">
      <h3>{{ t('haLogin.title') }}</h3>
      <div class="url-input">
        <label for="hassUrl">{{ t('haLogin.urlLabel') }}</label>
        <input
          id="hassUrl"
            v-model="currentUrl"
          type="url"
          :placeholder="t('haLogin.urlPlaceholder')"
          :disabled="store.isConnecting"
        />
      </div>
      <button
        @click="handleConnect"
        :disabled="store.isConnecting"
        class="connect-btn"
      >
        {{ store.isConnecting ? t('haLogin.connecting') : t('haLogin.connect') }}
      </button>
      <div v-if="store.connectionError" class="error">
        <strong>{{ t('haLogin.errorPrefix') }}</strong>
        <pre>{{ store.connectionError }}</pre>
      </div>
      <div v-if="isReturningFromAuth" class="info">
        <p>{{ t('haLogin.returning') }}</p>
      </div>
    </div>

    <div v-else class="connected-section">
      <h3>{{ t('haLogin.connectedTitle') }}</h3>

      <div v-if="!statsReady" class="stats-skeleton">
        <div class="skeleton-line w40"></div>
        <div class="skeleton-line w55"></div>
        <div class="skeleton-line w65"></div>
        <div class="skeleton-line w50"></div>
      </div>

      <div v-else class="connection-info fade-in">
        <p><strong>{{ t('haLogin.statusLabel') }}:</strong> {{ t('haLogin.statusConnected') }}</p>
        <p><strong>{{ t('haLogin.entitiesLabel') }}:</strong> {{ entitiesCount }}</p>
        <p><strong>{{ t('haLogin.climateEntitiesLabel') }}:</strong> {{ climateCount }}</p>
        <p><strong>{{ t('haLogin.lightEntitiesLabel') }}:</strong> {{ lightCount }}</p>
      </div>

      <div class="actions">
        <button @click="handleDisconnect" class="disconnect-btn">{{ t('haLogin.disconnect') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHAStore } from '../stores/hassStore'

const { t } = useI18n()
const store = useHAStore()

const currentUrl = ref(store.hassUrl)
const isReturningFromAuth = ref(false)

// Counts
const entitiesCount = computed(() => Object.keys(store.entities).length)
const climateCount = computed(() => store.climateEntities.length)
const lightCount = computed(() =>
  Object.keys(store.entities).filter(id => id.startsWith('light.')).length
)

// Skeleton is ready once any entity is loaded
const statsReady = computed(() => store.isConnected && entitiesCount.value > 0)

const checkAuthReturn = () => {
  if (typeof window === 'undefined') return false
  const params = new URLSearchParams(window.location.search)
  return params.has('code') || params.has('state') || params.has('auth_callback')
}

const handleConnect = async () => {
  try {
    if (currentUrl.value !== store.hassUrl) {
      store.setUrl(currentUrl.value)
    }
    await store.connect()
    isReturningFromAuth.value = false
    if (typeof window !== 'undefined' && window.history) {
      const url = new URL(window.location.href)
      url.search = ''
      window.history.replaceState({}, '', url.pathname)
    }
  } catch {
    isReturningFromAuth.value = false
  }
}

const handleDisconnect = () => {
  store.disconnect()
}

onMounted(async () => {
  if (typeof window === 'undefined') return
  const tokens = localStorage.getItem('hassTokens')
  const authReturn = checkAuthReturn()
  if ((tokens || authReturn) && !store.isConnected) {
    if (authReturn) isReturningFromAuth.value = true
    await nextTick()
    setTimeout(() => handleConnect(), 300)
  }
})
</script>


<style scoped>
.ha-login {
  border-radius: 8px;
}
.url-input {
  margin: 10px 0 16px;
}
.url-input label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
}
.url-input input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
}
.connect-btn,
.disconnect-btn {
  padding: 10px 18px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  margin: 6px 8px 6px 0;
  transition: background .15s ease, opacity .15s ease;
}
.connect-btn {
  background-color: #4CAF50;
  color: #fff;
}
.connect-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
.disconnect-btn {
  background-color: #f44336;
  color: #fff;
}
.error {
  background-color: #ffebee;
  border: 1px solid #f44336;
  border-radius: 4px;
  padding: 10px;
  margin: 14px 0;
  color: #b71c1c;
  font-size: 13px;
}
.error pre {
  margin: 6px 0 0;
  white-space: pre-wrap;
  font-size: 12px;
}
.info {
  background-color: #e3f2fd;
  border: 1px solid #2196F3;
  border-radius: 4px;
  padding: 10px;
  margin: 14px 0;
  color: #0d47a1;
  font-size: 13px;
}
.connected-section {
  border-radius: 6px;
  position: relative;
}
.connection-info p {
  margin: 6px 0;
  font-size: 14px;
}
.actions {
  margin-top: 14px;
}
.stats-skeleton {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 8px 0 12px;
}
.skeleton-line {
  height: 14px;
  background: linear-gradient(90deg, #e2e2e2 0%, #f5f5f5 50%, #e2e2e2 100%);
  background-size: 200% 100%;
  border-radius: 6px;
  animation: shimmer 1.3s infinite;
}
.skeleton-line.w40 { width: 40%; }
.skeleton-line.w50 { width: 50%; }
.skeleton-line.w55 { width: 55%; }
.skeleton-line.w65 { width: 65%; }
@keyframes shimmer {
  0% { background-position: 0% 0; }
  100% { background-position: -200% 0; }
}
.fade-in {
  animation: fadeIn .25s ease;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>


