<template>
  <div class="cd-root">
    <div class="cd-buttons">
      <button
        class="cd-btn"
        :disabled="busyPreview || busyZip || !!initError || loadingInit"
        @click="openPreview"
      >
        {{ t('download.viewYaml') }}
      </button>

      <button
        class="cd-btn"
        :disabled="busyPreview || busyZip || !!initError || loadingInit"
        @click="downloadSingle"
      >
        {{ t('download.downloadYaml') }}
      </button>

      <button
        class="cd-btn primary"
        :disabled="busyZip || !!initError || loadingInit"
        @click="downloadBundle"
      >
        {{ busyZip ? t('download.building') : t('download.downloadAll') }}
      </button>
    </div>

    <!-- Modal -->
    <div
      v-if="modalOpen"
      class="cd-modal-backdrop"
      @click.self="closeModal"
      role="dialog"
      aria-modal="true"
    >
      <div class="cd-modal">
        <header class="cd-modal-header">
          <span>{{ t('download.modalTitle') }}</span>
          <button class="cd-close" @click="closeModal" :aria-label="t('download.ariaClose')">✕</button>
        </header>
        <div class="cd-modal-body">
          <div v-if="busyPreview" class="cd-loading">{{ t('download.loading') }}</div>
          <div v-else-if="yamlError" class="cd-error">{{ yamlError }}</div>
          <pre v-else class="cd-code"><code>{{ yamlCode }}</code></pre>
        </div>
        <footer class="cd-modal-footer">
          <button @click="copyYaml" :disabled="!!yamlError || busyPreview">{{ t('download.copy') }}</button>
          <button @click="closeModal">{{ t('download.close') }}</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { ref, onMounted, watch } from 'vue'
import { loadText } from '../utils/loadText'
import { useI18n } from 'vue-i18n'

interface Props {
  climateEntity?: string
}
const props = defineProps<Props>()
const { t } = useI18n()


const base = import.meta.env.BASE_URL || '/'

/**
 * Templates mapping inside the bundle (source -> target path).
 */
const TEMPLATE_MAPPING: Record<string, string> = {
  'templates/climate_widget.yaml': 'widgets/climate_widget.yaml',
  'templates/loading_page.yaml': 'widgets/loading_page.yaml',
  'templates/colors.yaml': 'common/colors.yaml',
  'templates/fonts.yaml': 'common/fonts.yaml',
  'templates/images.yaml': 'common/images.yaml',
  'templates/main.yaml': 'main.yaml'
}

// All asset file paths from asset_manifest.json
const assetFiles = ref<string[]>([])
const loadingInit = ref(true)
const initError = ref<string | null>(null)

// Button busy states
const busyZip = ref(false)
const busyPreview = ref(false)

// Modal state for YAML preview
const modalOpen = ref(false)
const yamlCode = ref('')
const yamlError = ref<string | null>(null)

// Recognized textual extensions (to read as text)
const TEXT_EXT = new Set([
  '.yaml', '.yml', '.json', '.md', '.txt', '.js', '.ts', '.css'
])

function isTextFile(name: string) {
  const i = name.lastIndexOf('.')
  if (i === -1) return false
  return TEXT_EXT.has(name.slice(i).toLowerCase())
}

/**
 * Silent init:
 * 1. Fetch asset_manifest.json
 * 2. Store its array
 * 3. Test load a template for early failure (optional)
 */
async function silentInit() {
  loadingInit.value = true
  initError.value = null
  try {
    const manifestResp = await fetch(base + 'asset_manifest.json', { cache: 'no-cache' })
    if (!manifestResp.ok) {
      throw new Error(
        t('download.assetManifestHttp', { status: manifestResp.status })
      )
    }
    const arr = await manifestResp.json()
    if (!Array.isArray(arr)) {
      throw new Error(t('download.assetManifestFormatError'))
    }
    assetFiles.value = arr
    // Test a template to ensure path availability
    await loadText('templates/climate_widget.yaml')
  } catch (e: any) {
    initError.value = e.message || String(e)
    console.warn('[ClimateDownload:init] error:', e)
  } finally {
    loadingInit.value = false
  }
}

/**
 * Filter assets (exclude templates/ & images/)
 */
function filteredAssetList() {
  return assetFiles.value.filter(p => {
    if (p.startsWith('templates/')) return false
    if (p.startsWith('images/')) return false
    return true
  })
}

/**
 * Process climate_widget.yaml (variable substitution).
 */
async function getProcessedClimateWidget(): Promise<string> {
  let content = await loadText('templates/climate_widget.yaml')
  if (props.climateEntity) {
    content = content.replace(/\$\{climate_entity\}/g, props.climateEntity)
  }
  return content
}

/**
 * Open preview modal, load YAML content.
 */
async function openPreview() {
  if (busyPreview.value) return
  busyPreview.value = true
  yamlError.value = null
  yamlCode.value = ''
  modalOpen.value = true
  try {
    yamlCode.value = await getProcessedClimateWidget()
  } catch (e: any) {
    yamlError.value = e.message || String(e)
  } finally {
    busyPreview.value = false
  }
}

/**
 * Download single climate_widget.yaml.
 */
async function downloadSingle() {
  if (busyPreview.value) return
  busyPreview.value = true
  try {
    const content = await getProcessedClimateWidget()
    const blob = new Blob([content], { type: 'text/yaml;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'climate_widget.yaml'
    document.body.appendChild(a)
    a.click()
    setTimeout(() => {
      URL.revokeObjectURL(a.href)
      a.remove()
    }, 0)
  } catch (e: any) {
    alert(t('download.errorSingle') + ': ' + (e.message || e))
  } finally {
    busyPreview.value = false
  }
}

/**
 * Build ZIP with:
 * - filtered assets
 * - mapped templates
 * - README with mapping
 */
async function downloadBundle() {
  if (busyZip.value || loadingInit.value) return
  busyZip.value = true
  try {
    const [{ default: JSZip }, { saveAs }] = await Promise.all([
      import('jszip'),
      import('file-saver')
    ])
    const zip = new JSZip()

    // Assets
    const assets = filteredAssetList()
    await Promise.all(
      assets.map(async rel => {
        try {
          const url = base + rel
          const resp = await fetch(url)
          if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
          if (isTextFile(rel)) {
            zip.file(rel, await resp.text())
          } else {
            zip.file(rel, await resp.arrayBuffer())
          }
        } catch (e) {
          console.warn(t('download.skippedAsset'), rel, e)
        }
      })
    )

    // Templates
    for (const [src, target] of Object.entries(TEMPLATE_MAPPING)) {
      try {
        let content = await loadText(src)
        if (src.endsWith('climate_widget.yaml') && props.climateEntity) {
          content = content.replace(/\$\{climate_entity\}/g, props.climateEntity)
        }
        zip.file(target, content)
      } catch (e: any) {
        // Localized prefix
        zip.file(
          target,
          `${t('download.errorLoadingTemplatePrefix')} ${src}: ${e.message || e}`
        )
      }
    }

    // README (localized pieces)
    const mappedList = Object
      .entries(TEMPLATE_MAPPING)
      .map(([s, d]) => `${s} -> ${d}`)
      .join('\n')

    const readme =
`${t('download.readmeHeader')}
${t('download.readmeAssets')} ${filteredAssetList().length}
${t('download.readmeTemplates')} ${Object.keys(TEMPLATE_MAPPING).length}

${t('download.readmeMapping')}
${mappedList}

${t('download.readmeClimateEntity')} ${props.climateEntity || t('download.entityNotSet')}
`
    zip.file('README.txt', readme)

    const blob = await zip.generateAsync({ type: 'blob' })
    saveAs(blob, 'guition_bundle.zip')
  } catch (e: any) {
    alert(t('download.errorZip') + ': ' + (e.message || e))
  } finally {
    busyZip.value = false
  }
}

/**
 * Copy YAML to clipboard (fallback for older browsers).
 */
async function copyYaml() {
  try {
    await navigator.clipboard.writeText(yamlCode.value)
    // Optionally show a toast with t('download.copied')
  } catch {
    const ta = document.createElement('textarea')
    ta.value = yamlCode.value
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    ta.remove()
  }
}

/**
 * Close modal.
 */
function closeModal() {
  modalOpen.value = false
}

/**
 * Body scroll lock toggling.
 */
watch(modalOpen, val => {
  if (typeof document === 'undefined') return
  if (val) {
    document.body.classList.add('cd-noscroll')
  } else {
    document.body.classList.remove('cd-noscroll')
  }
})

/**
 * Escape key handler.
 */
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && modalOpen.value) {
    closeModal()
  }
}
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', onKey)
}

/**
 * Component mount logic.
 */
onMounted(() => {
  silentInit()
})
</script>

<style scoped>
.cd-root {
  display: flex;
  justify-content: space-around;
}
.cd-buttons {
  display: flex;
  gap: .8rem;
  flex-wrap: wrap;
}
.cd-btn {
  cursor: pointer;
  padding: .65rem 1.05rem;
  font-size: .8rem;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  border-radius: 6px;
  transition: background .15s;
}
.cd-btn:hover:not(:disabled) {
  background: var(--vp-c-bg-mute, #2a2a2a);
}
.cd-btn:disabled {
  opacity: .55;
  cursor: default;
}
.cd-btn.primary {
  background: #3b82f6;
  color: #fff;
  border-color: #3b82f6;
}
.cd-btn.primary:hover:not(:disabled) {
  background: #2563eb;
}

/* Modal */
.cd-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(10, 12, 16, .55);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 5vh 1rem 2rem;
  z-index: 9999;
}
.cd-modal {
  background: var(--vp-c-bg, #1e1e1e);
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  width: min(900px, 100%);
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 10px 32px -4px rgba(0,0,0,.55);
}
.cd-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: .65rem .9rem;
  font-size: .8rem;
  font-weight: 600;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.cd-close {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: .9rem;
  line-height: 1;
}
.cd-modal-body {
  padding: .65rem .9rem .8rem;
  overflow: auto;
  flex: 1;
}
.cd-code {
  font-family: var(--vp-font-family-mono, monospace);
  font-size: .68rem;
  line-height: 1.25;
  margin: 0;
  white-space: pre;
}
.cd-loading {
  font-size: .75rem;
  opacity: .85;
}
.cd-error {
  font-size: .75rem;
  color: #e74c3c;
  white-space: pre-wrap;
}
.cd-modal-footer {
  padding: .55rem .9rem .65rem;
  display: flex;
  gap: .6rem;
  border-top: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.cd-modal-footer button {
  cursor: pointer;
  font-size: .7rem;
  padding: .45rem .85rem;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-mute, #2a2a2a);
  border-radius: 5px;
}
.cd-modal-footer button:hover:not(:disabled) {
  background: #333;
}
.cd-modal-footer button:disabled {
  opacity: .55;
  cursor: default;
}

/* Body scroll lock */
:global(body.cd-noscroll) {
  overflow: hidden;
}
</style>

