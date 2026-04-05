<template>
  <div v-if="store.isConnected" class="climate-widget-page">
    <div class="widget-interface">
      <div class="device-selector">
        <h3>{{ t('climate.selectTitle') }}</h3>
        <select
          v-model="selectedClimateId"
          @change="onClimateChange"
          class="climate-select"
          :class="{ 'is-placeholder': !selectedClimateId }"
        >
          <!-- Placeholder (not shown in dropdown) -->
            <option value="" disabled hidden>{{ t('climate.placeholder') }}</option>
          <!-- Climate devices list (name only) -->
          <option
            v-for="climate in store.climateEntities"
            :key="climate.entityId"
            :value="climate.entityId"
          >
            {{ climate.name }}
          </option>
        </select>
        <div v-if="!store.climateEntities.length" class="no-devices">
          ⚠️ {{ t('climate.noDevices') }}
        </div>
      </div>

      <div v-if="selectedClimate" class="widget-container">
        <div class="climate-widget">
          <div class="climate-state">
            {{ getStateText(getDisplayState()) }}
          </div>
          <div class="climate-main">
            <svg 
              ref="climateSvg"
              class="climate-svg" 
              viewBox="0 0 480 480" 
              @mousedown="onSvgMouseDown"
              @mousemove="onSvgMouseMove"
              @mouseup="onSvgMouseUp"
              @mouseleave="onSvgMouseUp"
              @touchstart="onSvgTouchStart"
              @touchmove="onSvgTouchMove"
              @touchend="onSvgTouchEnd"
            >
              <!-- Base arcs -->
              <template v-for="(arc, idx) in baseArcPaths" :key="'base'+idx">
                <path
                  :d="arc.d"
                  fill="none"
                  :stroke="arc.color"
                  stroke-width="24"
                  stroke-linecap="round"
                />
              </template>
              <!-- Overlay arcs (difference or dark zones) -->
              <template v-for="(arc, idx) in topArcPaths" :key="'top'+idx">
                <path
                  :d="arc.d"
                  fill="none"
                  :stroke="arc.color"
                  stroke-width="24"
                  stroke-linecap="round"
                />
              </template>
              <!-- Current value point (temperature/humidity) -->
              <circle
                v-if="currentValuePoint"
                :cx="currentValuePoint.x"
                :cy="currentValuePoint.y"
                r="6"
                class="current-temp-point"
                :fill="currentValuePointColor"
              />
              <!-- heat_cool: low target handle -->
              <circle
                v-if="selectedClimate.state === 'heat_cool' && !isHumidityMode"
                :cx="targetTempLowPoint.x"
                :cy="targetTempLowPoint.y"
                r="12"
                class="target-temp-handle"
                :fill="arcColors.heat"
                stroke="white"
                stroke-width="3"
                style="cursor: pointer;"
                @mousedown="onLowTempMouseDown"
                @touchstart="onLowTempTouchStart"
              />
              <!-- heat_cool: high target handle -->
              <circle
                v-if="selectedClimate.state === 'heat_cool' && !isHumidityMode"
                :cx="targetTempHighPoint.x"
                :cy="targetTempHighPoint.y"
                r="12"
                class="target-temp-handle"
                :fill="arcColors.cool"
                stroke="white"
                stroke-width="3"
                style="cursor: pointer;"
                @mousedown="onHighTempMouseDown"
                @touchstart="onHighTempTouchStart"
              />
              <!-- Single target handle (non heat_cool mode) -->
              <circle
                v-if="selectedClimate.state !== 'heat_cool' && !isHumidityMode"
                :cx="targetTempPoint.x"
                :cy="targetTempPoint.y"
                r="12"
                class="target-temp-handle"
                :fill="arcColors.target"
                stroke="white"
                stroke-width="3"
                :style="{ cursor: 'pointer' }"
              />
              <!-- Humidity target handle -->
              <circle
                v-if="isHumidityMode"
                :cx="targetHumidityPoint.x"
                :cy="targetHumidityPoint.y"
                r="12"
                class="target-temp-handle"
                :fill="arcColors.humidity"
                stroke="white"
                stroke-width="3"
                :style="{ cursor: 'pointer' }"
              />
            </svg>
            <div class="climate-center">
              <!-- Temperature/Humidity toggle (if humidity supported) -->
              <button 
                v-if="hasHumiditySupport" 
                class="temp-icon" 
                @click="toggleDisplayMode"
              >
                <i :class="getIconClass(isHumidityMode ? 'mdi:water-percent' : 'mdi:thermometer')"></i>
              </button>
              <div 
                v-else 
                class="temp-icon-static"
              >
                <i :class="getIconClass('mdi:thermometer')"></i>
              </div>

              <!-- heat_cool dual display -->
              <div v-if="selectedClimate.state === 'heat_cool' && !isHumidityMode" class="target-temp-vertical">
                <div class="target-cool">
                  <div class="temp-digits">
                    <div class="temp-integer">{{ integerPartCool }}</div>
                    <div class="temp-dot">.</div>
                    <div class="temp-symbols">
                      <div class="temp-degree">°C</div>
                      <div class="temp-fractional">{{ fractionalPartCool }}</div>
                    </div>
                  </div>
                </div>
                <div class="target-heat">
                  <div class="temp-digits">
                    <div class="temp-integer">{{ integerPartHeat }}</div>
                    <div class="temp-dot">.</div>
                    <div class="temp-symbols">
                      <div class="temp-degree">°C</div>
                      <div class="temp-fractional">{{ fractionalPartHeat }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Single temperature display -->
              <div v-else-if="!isHumidityMode" class="target-temp" :class="getTargetTempColorClass()">
                <div class="temp-digits">
                  <div class="temp-integer">{{ integerPart }}</div>
                  <div class="temp-dot">.</div>
                  <div class="temp-symbols">
                    <div class="temp-degree">°C</div>
                    <div class="temp-fractional">{{ fractionalPart }}</div>
                  </div>
                </div>
              </div>

              <!-- Humidity display -->
              <div v-else class="target-humidity">
                <div class="humidity-integer">{{ localTargetHumidity }}</div>
                <div class="humidity-degree">%</div>
              </div>

              <div class="current-temp">{{ getCurrentValue() }}</div>
            </div>
          </div>

          <div class="climate-controls">
            <!-- HVAC modes -->
            <div class="hvac-modes">
              <button
                v-for="mode in selectedClimate.hvac_modes"
                :key="mode"
                class="mode-button"
                @click="setHvacMode(mode)"
              >
                <i
                  :class="[
                    getIconClass(getModeIcon(mode)),
                    selectedClimate.state === mode ? getModeColorClass(mode) : ''
                  ]"
                  :style="{ opacity: selectedClimate.state === mode ? 1 : 0.5 }"
                ></i>
              </button>
            </div>

            <!-- Preset modes as icons -->
            <div
              v-if="selectedClimate.preset_modes && selectedClimate.preset_modes.length"
              class="preset-modes-icons"
            >
              <button
                v-for="preset in selectedClimate.preset_modes"
                :key="preset"
                class="preset-icon-button"
                @click="setPresetMode(preset)"
              >
                <i
                  :class="[
                    getIconClass(getPresetIcon(preset)),
                    selectedClimate.preset_mode === preset ? getPresetColorClass(preset) : ''
                  ]"
                  :style="{ opacity: selectedClimate.preset_mode === preset ? 1 : 0.5 }"
                ></i>
              </button>
            </div>

            <!-- Temperature / Humidity controls -->
            <div class="temp-controls">
              <!-- heat_cool: two vertical buttons adjusting low/high depending on activeRange -->
              <template v-if="selectedClimate.state === 'heat_cool' && !isHumidityMode">
                <button 
                  class="temp-btn temp-plus"
                  @click="
                    activeRange === 'heat'
                      ? adjustHeatCoolLow(0.1)
                      : adjustHeatCoolHigh(-0.1)
                  "
                  :disabled="
                    activeRange === 'heat'
                      ? isHeatCoolLowPlusDisabled
                      : isHeatCoolHighMinusDisabled
                  "
                >
                  <i
                    :class="[
                      getIconClass('mdi:plus'),
                      activeRange === 'heat' ? 'icon-heat' : 'icon-cool'
                    ]"
                  ></i>
                </button>
                <button 
                  class="temp-btn temp-minus"
                  @click="
                    activeRange === 'heat'
                      ? adjustHeatCoolLow(-0.1)
                      : adjustHeatCoolHigh(0.1)
                  "
                  :disabled="
                    activeRange === 'heat'
                      ? isHeatCoolLowMinusDisabled
                      : isHeatCoolHighPlusDisabled
                  "
                >
                  <i
                    :class="[
                      getIconClass('mdi:minus'),
                      activeRange === 'heat' ? 'icon-heat' : 'icon-cool'
                    ]"
                  ></i>
                </button>
              </template>

              <!-- Normal single temperature mode -->
              <template v-else-if="!isHumidityMode">
                <button 
                  class="temp-btn temp-plus" 
                  @click="selectedClimate.state === 'cool' ? adjustTemperature(-0.1) : adjustTemperature(0.1)"
                  :disabled="selectedClimate.state === 'cool' ? localTargetTemp <= minTemp : localTargetTemp >= maxTemp"
                >
                  <i :class="getIconClass('mdi:plus')"></i>
                </button>
                <button 
                  class="temp-btn temp-minus" 
                  @click="selectedClimate.state === 'cool' ? adjustTemperature(0.1) : adjustTemperature(-0.1)"
                  :disabled="selectedClimate.state === 'cool' ? localTargetTemp >= maxTemp : localTargetTemp <= minTemp"
                >
                  <i :class="getIconClass('mdi:minus')"></i>
                </button>
              </template>

              <!-- Humidity mode -->
              <template v-else>
                <button 
                  class="temp-btn temp-plus" 
                  @click="adjustHumidity(1)"
                  :disabled="localTargetHumidity >= maxHumidity"
                >
                  <i :class="getIconClass('mdi:plus')"></i>
                </button>
                <button 
                  class="temp-btn temp-minus" 
                  @click="adjustHumidity(-1)"
                  :disabled="localTargetHumidity <= minHumidity"
                >
                  <i :class="getIconClass('mdi:minus')"></i>
                </button>
              </template>
            </div>
          </div>
        </div>

        <ClimateDownload :climate-entity="selectedClimate?.entityId || ''" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// All comments are now in English.
import { ref, computed, watch, onMounted } from 'vue'
import { useHAStore } from '../stores/hassStore'
import ClimateDownload from './ClimateDownload.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const store = useHAStore()

// User selection and local reactive states
const selectedClimateId = ref<string>('')
const localTargetTemp = ref<number>(21)
const localTargetHumidity = ref<number>(50)

// Interaction flags
const isDragging = ref<boolean>(false)
const climateSvg = ref<SVGElement>()
const isHumidityMode = ref<boolean>(false)

// Range handles for heat_cool mode
const draggingLow = ref<boolean>(false)
const draggingHigh = ref<boolean>(false)
const targetTempLow = ref<number>(18)
const targetTempHigh = ref<number>(24)
const activeRange = ref<'heat' | 'cool'>('heat')

// Geometry constants
const centerX = 240
const centerY = 240
const radius = 220
const startAngle = Math.PI / 2
const endAngle = 3 * Math.PI / 2
const angleRange = Math.PI

// Computed parts for number formatting (temperature)
const integerPart = computed(() => {
  if (!selectedClimate.value || isHumidityMode.value) return ''
  return Math.floor(localTargetTemp.value).toString()
})
const fractionalPart = computed(() => {
  if (!selectedClimate.value || isHumidityMode.value) return ''
  const fixed = localTargetTemp.value.toFixed(1)
  return fixed.split('.')[1] || '0'
})
const integerPartCool = computed(() => {
  if (!selectedClimate.value || isHumidityMode.value) return ''
  return Math.floor(targetTempHigh.value).toString()
})
const fractionalPartCool = computed(() => {
  if (!selectedClimate.value || isHumidityMode.value) return ''
  const fixed = targetTempHigh.value.toFixed(1)
  return fixed.split('.')[1] || '0'
})
const integerPartHeat = computed(() => {
  if (!selectedClimate.value || isHumidityMode.value) return ''
  return Math.floor(targetTempLow.value).toString()
})
const fractionalPartHeat = computed(() => {
  if (!selectedClimate.value || isHumidityMode.value) return ''
  const fixed = targetTempLow.value.toFixed(1)
  return fixed.split('.')[1] || '0'
})

// Min/max constraints (temp & humidity) taken from HA or defaults
const minTemp = computed(() => {
  if (!selectedClimate.value) return 7
  const entity = store.entities[selectedClimate.value.entityId]
  return entity?.attributes?.min_temp ?? 7
})
const maxTemp = computed(() => {
  if (!selectedClimate.value) return 35
  const entity = store.entities[selectedClimate.value.entityId]
  return entity?.attributes?.max_temp ?? 35
})
const minHumidity = computed(() => {
  if (!selectedClimate.value) return 30
  const entity = store.entities[selectedClimate.value.entityId]
  return entity?.attributes?.min_humidity ?? 30
})
const maxHumidity = computed(() => {
  if (!selectedClimate.value) return 99
  const entity = store.entities[selectedClimate.value.entityId]
  return entity?.attributes?.max_humidity ?? 99
})

// Check if humidity capabilities are present
const hasHumiditySupport = computed(() => {
  if (!selectedClimate.value) return false
  const entity = store.entities[selectedClimate.value.entityId]
  return entity?.attributes?.current_humidity !== undefined
})

// Map HVAC mode to icon
const getModeIcon = (mode: string): string => {
  const iconMap: Record<string, string> = {
    off: 'mdi:power',
    heat: 'mdi:fire',
    cool: 'mdi:snowflake',
    auto: 'mdi:thermostat-auto',
    dry: 'mdi:water-percent',
    fan_only: 'mdi:fan',
    heat_cool: 'mdi:sun-snowflake-variant',
    heating: 'mdi:fire',
    cooling: 'mdi:snowflake',
    idle: 'mdi:power',
    drying: 'mdi:water-percent',
    fan: 'mdi:fan'
  }
  return iconMap[mode.toLowerCase()] || 'mdi:thermostat'
}

// Color class for active HVAC mode icon
const getModeColorClass = (mode: string): string => {
  switch (mode) {
    case 'heat': return 'icon-heat'
    case 'cool': return 'icon-cool'
    case 'heat_cool': return 'icon-heat-cool'
    case 'dry': return 'icon-dry'
    case 'fan_only': return 'icon-fan'
    case 'auto': return 'icon-auto'
    case 'off': return 'icon-off'
    default: return ''
  }
}

// Color class for center temperature text
const getTargetTempColorClass = (): string => {
  if (!selectedClimate.value) return ''
  const mode = selectedClimate.value.state
  switch (mode) {
    case 'heat': return 'target-temp-heat'
    case 'cool': return 'target-temp-cool'
    case 'dry': return 'target-temp-dry'
    case 'fan_only': return 'target-temp-fan'
    case 'auto': return 'target-temp-auto'
    case 'off': return 'target-temp-off'
    default: return ''
  }
}

// Icon class builder
const getIconClass = (icon: string): string => {
  if (!icon) return ''
  if (icon.startsWith('mdi:')) {
    return `mdi mdi-${icon.substring(4)}`
  }
  if (icon.startsWith('hass:')) {
    return `mdi mdi-${icon.substring(5)}`
  }
  if (icon.includes(':')) {
    const [prefix, name] = icon.split(':')
    return `${prefix} ${prefix}-${name}`
  }
  return `mdi mdi-${icon}`
}

// Preset modes icon map
const getPresetIcon = (preset: string): string => {
  const presetIconMap: Record<string, string> = {
    eco: 'mdi:leaf',
    comfort: 'mdi:sofa',
    away: 'mdi:home-export-outline',
    sleep: 'mdi:sleep',
    boost: 'mdi:rocket-launch',
    activity: 'mdi:run',
    home: 'mdi:home'
  }
  return presetIconMap[preset] || 'mdi:star'
}

// Preset color classes
const getPresetColorClass = (preset: string): string => {
  switch (preset) {
    case 'eco': return 'icon-eco'
    case 'comfort': return 'icon-comfort'
    case 'away': return 'icon-away'
    case 'sleep': return 'icon-sleep'
    case 'boost': return 'icon-boost'
    case 'activity': return 'icon-activity'
    case 'home': return 'icon-home'
    default: return ''
  }
}

// Currently selected climate entity object (from store)
const selectedClimate = computed(() => {
  if (!selectedClimateId.value) return null
  return store.climateEntities.find(climate => climate.entityId === selectedClimateId.value) || null
})

// Display state (prioritize hvac_action if present)
const getDisplayState = (): string => {
  if (!selectedClimate.value) return ''
  const entity = store.entities[selectedClimate.value.entityId]
  if (!entity) return selectedClimate.value.state
  return entity.attributes?.hvac_action || selectedClimate.value.state
}

// Current numeric or formatted value depending on mode
const getCurrentValue = (): string => {
  if (!selectedClimate.value) return '--'
  const entity = store.entities[selectedClimate.value.entityId]
  if (!entity) return '--'
  if (isHumidityMode.value) {
    const currentHumidity = entity.attributes?.current_humidity
    return typeof currentHumidity === 'number' ? currentHumidity.toFixed(0) + '%' : '--'
  } else {
    const currentTemp = entity.attributes?.current_temperature || 
                        entity.attributes?.temperature ||
                        entity.state
    return typeof currentTemp === 'number' ? currentTemp.toFixed(1) + '°' : '--'
  }
}

// Return numeric current value or null
const getCurrentValueNumber = (): number | null => {
  if (!selectedClimate.value) return null
  const entity = store.entities[selectedClimate.value.entityId]
  if (!entity) return null
  if (isHumidityMode.value) {
    const currentHumidity = entity.attributes?.current_humidity
    return typeof currentHumidity === 'number' ? currentHumidity : null
  } else {
    const currentTemp = entity.attributes?.current_temperature || 
                        entity.attributes?.temperature
    return typeof currentTemp === 'number' ? currentTemp : null
  }
}

// Toggle between temperature & humidity display (if supported)
const toggleDisplayMode = (): void => {
  if (hasHumiditySupport.value) {
    isHumidityMode.value = !isHumidityMode.value
  }
}

// Convert a value (temp or humidity) to an angle along the arc
const valueToAngle = (value: number): number => {
  if (isHumidityMode.value) {
    const valueRange = maxHumidity.value - minHumidity.value
    const progress = (value - minHumidity.value) / valueRange
    return startAngle + (progress * angleRange)
  } else {
    const valueRange = maxTemp.value - minTemp.value
    const progress = (value - minTemp.value) / valueRange
    return startAngle + (progress * angleRange)
  }
}

// Convert angle to value (inverse mapping)
const angleToValue = (angle: number): number => {
  const progress = (angle - startAngle) / angleRange
  if (isHumidityMode.value) {
    return minHumidity.value + (progress * (maxHumidity.value - minHumidity.value))
  } else {
    return minTemp.value + (progress * (maxTemp.value - minTemp.value))
  }
}

// Convert angle+radius to XY
const angleToPoint = (angle: number, r: number): { x: number, y: number } => {
  return {
    x: centerX + r * Math.cos(angle),
    y: centerY + r * Math.sin(angle)
  }
}

// Create an SVG arc path (partial circle)
const createArcPath = (startAngle: number, endAngle: number, r: number): string => {
  const start = angleToPoint(startAngle, r)
  const end = angleToPoint(endAngle, r)
  const largeArcFlag = Math.abs(endAngle - startAngle) > Math.PI ? 1 : 0
  const sweepFlag = 1
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`
}

// Colors for arcs (mode dependent)
const arcColors = computed(() => ({
  heat: '#ea580c',
  heatDark: '#c2410c',
  cool: '#428fff',
  coolDark: '#244e84',
  dry: '#f59e0b',
  fan: '#06d6a0',
  auto: '#00ab61',
  humidity: '#428fff',
  humidityDark: '#244e84',
  target: (() => {
    if (isHumidityMode.value) {
      return '#428fff'
    }
    switch (selectedClimate.value?.state) {
      case 'heat': return '#ea580c'
      case 'cool': return '#428fff'
      case 'dry': return '#f59e0b'
      case 'fan_only': return '#06d6a0'
      case 'auto': return '#00ab61'
      case 'off': return '#bdbdbd'
      default: return '#428fff'
    }
  })()
}))

// Types for arc arrays
type ArcPath = { d: string; color: string }

// Base arcs (primary segments for modes)
const baseArcPaths = computed<ArcPath[]>(() => {
  if (!selectedClimate.value) return []
  if (isHumidityMode.value) {
    return [
      {
        d: createArcPath(startAngle, valueToAngle(localTargetHumidity.value), radius),
        color: arcColors.value.humidity
      }
    ]
  }
  const mode = selectedClimate.value.state
  if (mode === 'heat_cool') {
    const low = targetTempLow.value
    const high = targetTempHigh.value
    return [
      {
        d: createArcPath(startAngle, valueToAngle(low), radius),
        color: arcColors.value.heat
      },
      {
        d: createArcPath(valueToAngle(high), endAngle, radius),
        color: arcColors.value.cool
      }
    ]
  }
  if (mode === 'heat') {
    return [
      {
        d: createArcPath(startAngle, valueToAngle(localTargetTemp.value), radius),
        color: arcColors.value.heat
      }
    ]
  }
  if (mode === 'cool') {
    return [
      {
        d: createArcPath(valueToAngle(localTargetTemp.value), endAngle, radius),
        color: arcColors.value.cool
      }
    ]
  }
  if (mode === 'dry') {
    return [{
      d: createArcPath(startAngle, endAngle, radius),
      color: arcColors.value.dry
    }]
  }
  if (mode === 'fan_only') {
    return [{
      d: createArcPath(startAngle, endAngle, radius),
      color: arcColors.value.fan
    }]
  }
  if (mode === 'auto') {
    return [{
      d: createArcPath(startAngle, endAngle, radius),
      color: arcColors.value.auto
    }]
  }
  return []
})

// Overlay arcs (dark zones indicating difference)
const topArcPaths = computed<ArcPath[]>(() => {
  if (!selectedClimate.value) return []
  const currentValue = getCurrentValueNumber()
  if (isHumidityMode.value) {
    if (currentValue !== null && currentValue < localTargetHumidity.value) {
      return [
        {
          d: createArcPath(valueToAngle(currentValue), valueToAngle(localTargetHumidity.value), radius),
            color: arcColors.value.humidityDark
        }
      ]
    }
    return []
  }
  const mode = selectedClimate.value.state
  if (mode === 'heat_cool') {
    const low = targetTempLow.value
    const high = targetTempHigh.value
    const arcs: ArcPath[] = []
    if (currentValue !== null && currentValue < low) {
      arcs.push({
        d: createArcPath(valueToAngle(currentValue), valueToAngle(low), radius),
        color: arcColors.value.heatDark
      })
    }
    if (currentValue !== null && currentValue > high) {
      arcs.push({
        d: createArcPath(valueToAngle(high), valueToAngle(currentValue), radius),
        color: arcColors.value.coolDark
      })
    }
    return arcs
  }
  if (mode === 'heat') {
    if (currentValue !== null && currentValue < localTargetTemp.value) {
      return [
        {
          d: createArcPath(valueToAngle(currentValue), valueToAngle(localTargetTemp.value), radius),
          color: arcColors.value.heatDark
        }
      ]
    }
    return []
  }
  if (mode === 'cool') {
    if (currentValue !== null && currentValue > localTargetTemp.value) {
      return [
        {
          d: createArcPath(valueToAngle(localTargetTemp.value), valueToAngle(currentValue), radius),
          color: arcColors.value.coolDark
        }
      ]
    }
    return []
  }
  return []
})

// Points for dynamic handles & current value point
const currentValuePoint = computed(() => {
  const currentValue = getCurrentValueNumber()
  if (currentValue === null) return null
  const angle = valueToAngle(currentValue)
  return angleToPoint(angle, radius)
})
const currentValuePointColor = computed(() => {
  if (!selectedClimate.value) return '#fff'
  const currentValue = getCurrentValueNumber()
  if (isHumidityMode.value) {
    if (currentValue !== null && localTargetHumidity.value > currentValue) return arcColors.value.humidity
    return '#fff'
  }
  const mode = selectedClimate.value.state
  if (mode === 'cool') {
    if (currentValue !== null && localTargetTemp.value < currentValue) return arcColors.value.cool
    return '#fff'
  }
  if (mode === 'heat') {
    if (currentValue !== null && localTargetTemp.value > currentValue) return arcColors.value.heat
    return '#fff'
  }
  if (mode === 'heat_cool') {
    if (currentValue !== null) {
      if (targetTempHigh.value < currentValue) return arcColors.value.cool
      if (targetTempLow.value > currentValue) return arcColors.value.heat
    }
    return '#fff'
  }
  return '#fff'
})
const targetTempLowPoint = computed(() => {
  const angle = valueToAngle(targetTempLow.value)
  return angleToPoint(angle, radius)
})
const targetTempHighPoint = computed(() => {
  const angle = valueToAngle(targetTempHigh.value)
  return angleToPoint(angle, radius)
})
const targetTempPoint = computed(() => {
  const angle = valueToAngle(localTargetTemp.value)
  return angleToPoint(angle, radius)
})
const targetHumidityPoint = computed(() => {
  const angle = valueToAngle(localTargetHumidity.value)
  return angleToPoint(angle, radius)
})

// Localized state text via i18n
const getStateText = (state: string): string => t(`climate.state.${state}`) || state

// Handle device change initialization
const onClimateChange = (): void => {
  isHumidityMode.value = false
  if (selectedClimate.value) {
    const entity = store.entities[selectedClimate.value.entityId]
    if (entity) {
      if (selectedClimate.value.state === 'heat_cool') {
        targetTempLow.value = typeof entity.attributes?.target_temp_low === 'number'
          ? entity.attributes.target_temp_low
          : 18
        targetTempHigh.value = typeof entity.attributes?.target_temp_high === 'number'
          ? entity.attributes.target_temp_high
          : 24
        activeRange.value = 'heat'
      } else {
        const targetTemp = entity.attributes?.temperature || 
                           entity.attributes?.target_temp_high ||
                           21
        localTargetTemp.value = typeof targetTemp === 'number' ? targetTemp : 21
      }
      const targetHumidity = entity.attributes?.humidity || 50
      localTargetHumidity.value = typeof targetHumidity === 'number' ? targetHumidity : 50
    }
  }
}

// Re-run initialization on mode change
watch(() => selectedClimate.value?.state, () => {
  onClimateChange()
})

// Initial mount
onMounted(() => {
  if (selectedClimate.value) {
    onClimateChange()
  }
})

// Service calls (presets / hvac / temp / humidity)
const setPresetMode = async (preset: string): Promise<void> => {
  if (!selectedClimate.value || !store.connection) return
  try {
    await store.connection.sendMessage({
      type: 'call_service',
      domain: 'climate',
      service: 'set_preset_mode',
      service_data: {
        entity_id: selectedClimate.value.entityId,
        preset_mode: preset
      }
    })
  } catch {}
}
const setHvacMode = async (mode: string): Promise<void> => {
  if (!selectedClimate.value || !store.connection) return
  try {
    await store.connection.sendMessage({
      type: 'call_service',
      domain: 'climate',
      service: 'set_hvac_mode',
      service_data: {
        entity_id: selectedClimate.value.entityId,
        hvac_mode: mode
      }
    })
  } catch {}
}
const setTemperature = async (temp: number, tempHigh?: number): Promise<void> => {
  if (!selectedClimate.value || !store.connection) return
  const data: Record<string, any> = { entity_id: selectedClimate.value.entityId }
  if (selectedClimate.value.state === 'heat_cool') {
    data.target_temp_low = temp
    data.target_temp_high = tempHigh ?? temp
  } else {
    data.temperature = temp
  }
  try {
    await store.connection.sendMessage({
      type: 'call_service',
      domain: 'climate',
      service: 'set_temperature',
      service_data: data
    })
  } catch {}
}
const setHumidity = async (humidity: number): Promise<void> => {
  if (!selectedClimate.value || !store.connection) return
  try {
    await store.connection.sendMessage({
      type: 'call_service',
      domain: 'climate',
      service: 'set_humidity',
      service_data: {
        entity_id: selectedClimate.value.entityId,
        humidity
      }
    })
  } catch {}
}

// Single temp adjust
const adjustTemperature = (delta: number): void => {
  if (!selectedClimate.value) return
  let newTemp = localTargetTemp.value + delta
  newTemp = Math.max(minTemp.value, Math.min(maxTemp.value, newTemp))
  localTargetTemp.value = newTemp
  setTemperature(newTemp)
}

// Humidity adjust
const adjustHumidity = (delta: number): void => {
  if (!selectedClimate.value) return
  let newHumidity = localTargetHumidity.value + delta
  newHumidity = Math.max(minHumidity.value, Math.min(maxHumidity.value, newHumidity))
  localTargetHumidity.value = newHumidity
  setHumidity(newHumidity)
}

// heat_cool low/high adjustments (allow equality)
const adjustHeatCoolLow = (delta: number) => {
  let newLow = targetTempLow.value + delta
  newLow = Math.max(minTemp.value, Math.min(targetTempHigh.value, newLow))
  targetTempLow.value = newLow
  setTemperature(targetTempLow.value, targetTempHigh.value)
}
const adjustHeatCoolHigh = (delta: number) => {
  let newHigh = targetTempHigh.value + delta
  newHigh = Math.max(targetTempLow.value, Math.min(maxTemp.value, newHigh))
  targetTempHigh.value = newHigh
  setTemperature(targetTempLow.value, targetTempHigh.value)
}

// Disable states for heat_cool
const isHeatCoolLowPlusDisabled = computed(() => targetTempLow.value >= targetTempHigh.value)
const isHeatCoolLowMinusDisabled = computed(() => targetTempLow.value <= minTemp.value)
const isHeatCoolHighPlusDisabled = computed(() => targetTempHigh.value >= maxTemp.value)
const isHeatCoolHighMinusDisabled = computed(() => targetTempHigh.value <= targetTempLow.value)

// Pointer / touch events for arcs and handles
const onSvgMouseDown = (event: MouseEvent) => {
  if (!selectedClimate.value || !climateSvg.value) return
  if (selectedClimate.value.state === 'heat_cool' && !isHumidityMode.value) return
  isDragging.value = true
  updateValueFromEvent(event)
  event.preventDefault()
}
const onSvgMouseMove = (event: MouseEvent) => {
  if (!climateSvg.value) return
  if (isDragging.value) {
    updateValueFromEvent(event)
    event.preventDefault()
  }
  if (draggingLow.value) {
    updateLowTemperatureFromEvent(event)
    event.preventDefault()
  }
  if (draggingHigh.value) {
    updateHighTemperatureFromEvent(event)
    event.preventDefault()
  }
}
const onSvgMouseUp = () => {
  if (isDragging.value) {
    isDragging.value = false
    if (isHumidityMode.value) {
      setHumidity(localTargetHumidity.value)
    } else {
      setTemperature(localTargetTemp.value)
    }
  }
  if (draggingLow.value) {
    draggingLow.value = false
    setTemperature(targetTempLow.value, targetTempHigh.value)
  }
  if (draggingHigh.value) {
    draggingHigh.value = false
    setTemperature(targetTempLow.value, targetTempHigh.value)
  }
}
const onSvgTouchStart = (event: TouchEvent) => {
  if (!selectedClimate.value || !climateSvg.value) return
  if (selectedClimate.value.state === 'heat_cool' && !isHumidityMode.value) return
  isDragging.value = true
  updateValueFromTouch(event)
  event.preventDefault()
}
const onSvgTouchMove = (event: TouchEvent) => {
  if (!climateSvg.value) return
  if (isDragging.value) {
    event.preventDefault()
    updateValueFromTouch(event)
  }
  if (draggingLow.value) {
    event.preventDefault()
    updateLowTemperatureFromTouch(event)
  }
  if (draggingHigh.value) {
    event.preventDefault()
    updateHighTemperatureFromTouch(event)
  }
}
const onSvgTouchEnd = () => {
  if (isDragging.value) {
    isDragging.value = false
    if (isHumidityMode.value) {
      setHumidity(localTargetHumidity.value)
    } else {
      setTemperature(localTargetTemp.value)
    }
  }
  if (draggingLow.value) {
    draggingLow.value = false
    setTemperature(targetTempLow.value, targetTempHigh.value)
  }
  if (draggingHigh.value) {
    draggingHigh.value = false
    setTemperature(targetTempLow.value, targetTempHigh.value)
  }
}
const onLowTempMouseDown = (event: MouseEvent): void => {
  if (!selectedClimate.value || !climateSvg.value) return
  draggingLow.value = true
  activeRange.value = 'heat'
  updateLowTemperatureFromEvent(event)
  event.preventDefault()
}
const onHighTempMouseDown = (event: MouseEvent): void => {
  if (!selectedClimate.value || !climateSvg.value) return
  draggingHigh.value = true
  activeRange.value = 'cool'
  updateHighTemperatureFromEvent(event)
  event.preventDefault()
}
const onLowTempTouchStart = (event: TouchEvent): void => {
  if (!selectedClimate.value || !climateSvg.value) return
  draggingLow.value = true
  activeRange.value = 'heat'
  updateLowTemperatureFromTouch(event)
  event.preventDefault()
}
const onHighTempTouchStart = (event: TouchEvent): void => {
  if (!selectedClimate.value || !climateSvg.value) return
  draggingHigh.value = true
  activeRange.value = 'cool'
  updateHighTemperatureFromTouch(event)
  event.preventDefault()
}

// Helpers to read pointer or touch position and convert to temp/humidity
const updateValueFromEvent = (event: MouseEvent): void => {
  if (!climateSvg.value) return
  const rect = climateSvg.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  updateValueFromCoords(x, y, rect.width, rect.height)
}
const updateValueFromTouch = (event: TouchEvent): void => {
  if (!climateSvg.value) return
  const rect = climateSvg.value.getBoundingClientRect()
  const touch = event.touches[0]
  const x = touch.clientX - rect.left
  const y = touch.clientY - rect.top
  updateValueFromCoords(x, y, rect.width, rect.height)
}
const updateValueFromCoords = (x: number, y: number, width: number, height: number): void => {
  if (!selectedClimate.value) return
  const svgX = (x / width) * 480
  const svgY = (y / height) * 480
  const dx = svgX - centerX
  const dy = svgY - centerY
  let angle = Math.atan2(dy, dx)
  if (angle < 0) angle += 2 * Math.PI
  if (angle < startAngle) {
    angle = (angle < Math.PI / 4) ? startAngle : endAngle
  } else if (angle > endAngle) {
    angle = (angle > 7 * Math.PI / 4) ? startAngle : endAngle
  }
  if (isHumidityMode.value) {
    const newHumidity = Math.round(angleToValue(angle))
    const clampedHumidity = Math.max(minHumidity.value, Math.min(maxHumidity.value, newHumidity))
    localTargetHumidity.value = clampedHumidity
  } else {
    const newTemp = Math.round(angleToValue(angle) * 10) / 10
    const clampedTemp = Math.max(minTemp.value, Math.min(maxTemp.value, newTemp))
    localTargetTemp.value = clampedTemp
  }
}
const updateLowTemperatureFromEvent = (event: MouseEvent): void => {
  if (!climateSvg.value) return
  const rect = climateSvg.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  updateLowTemperatureFromCoords(x, y, rect.width, rect.height)
}
const updateHighTemperatureFromEvent = (event: MouseEvent): void => {
  if (!climateSvg.value) return
  const rect = climateSvg.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  updateHighTemperatureFromCoords(x, y, rect.width, rect.height)
}
const updateLowTemperatureFromTouch = (event: TouchEvent): void => {
  if (!climateSvg.value) return
  const rect = climateSvg.value.getBoundingClientRect()
  const touch = event.touches[0]
  const x = touch.clientX - rect.left
  const y = touch.clientY - rect.top
  updateLowTemperatureFromCoords(x, y, rect.width, rect.height)
}
const updateHighTemperatureFromTouch = (event: TouchEvent): void => {
  if (!climateSvg.value) return
  const rect = climateSvg.value.getBoundingClientRect()
  const touch = event.touches[0]
  const x = touch.clientX - rect.left
  const y = touch.clientY - rect.top
  updateHighTemperatureFromCoords(x, y, rect.width, rect.height)
}
const updateLowTemperatureFromCoords = (x: number, y: number, width: number, height: number): void => {
  if (!selectedClimate.value) return
  const svgX = (x / width) * 480
  const svgY = (y / height) * 480
  const dx = svgX - centerX
  const dy = svgY - centerY
  let angle = Math.atan2(dy, dx)
  if (angle < 0) angle += 2 * Math.PI
  if (angle < startAngle) {
    angle = (angle < Math.PI / 4) ? startAngle : endAngle
  } else if (angle > endAngle) {
    angle = (angle > 7 * Math.PI / 4) ? startAngle : endAngle
  }
  const newTemp = Math.round(angleToValue(angle) * 10) / 10
  const clampedTemp = Math.max(minTemp.value, Math.min(targetTempHigh.value, newTemp))
  targetTempLow.value = clampedTemp
}
const updateHighTemperatureFromCoords = (x: number, y: number, width: number, height: number): void => {
  if (!selectedClimate.value) return
  const svgX = (x / width) * 480
  const svgY = (y / height) * 480
  const dx = svgX - centerX
  const dy = svgY - centerY
  let angle = Math.atan2(dy, dx)
  if (angle < 0) angle += 2 * Math.PI
  if (angle < startAngle) {
    angle = (angle < Math.PI / 4) ? startAngle : endAngle
  } else if (angle > endAngle) {
    angle = (angle > 7 * Math.PI / 4) ? startAngle : endAngle
  }
  const newTemp = Math.round(angleToValue(angle) * 10) / 10
  const clampedTemp = Math.max(targetTempLow.value, Math.min(maxTemp.value, newTemp))
  targetTempHigh.value = clampedTemp
}
</script>

<style scoped>
.climate-widget-page {
  max-width: 480px;
}

.device-selector {
  margin-bottom: 2rem;
}

.climate-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  font-size: 1rem;
  margin-top: 0.5rem;
  box-sizing: border-box;
  -webkit-appearance: none;
  appearance: none;
}

.climate-select.is-placeholder {
  color: #6b7280;
}

.no-devices {
  padding: 1rem;
  background: #fef3cd;
  border: 1px solid #fbbf24;
  border-radius: 6px;
  margin-top: 1rem;
}

.widget-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-top: 2rem;
}

.climate-widget {
  position: relative;
  width: 480px;
  height: 480px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
  margin: 0 auto;
  background-image: url('/images/climate_widget.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow: hidden;
}

.climate-state {
  position: absolute;
  top: 20px;
  left: 20px;
  font-size: 18px;
  font-weight: 600;
  color: #6b7280;
}

.climate-main {
  position: absolute;
  top: 0;
  left: 242px;
  width: 100%;
  height: 100%;
}

.climate-svg {
  left: 240px;
  width: 100%;
  height: 100%;
}

.climate-controls {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 5;
}

.hvac-modes {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: auto;
}

.mode-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  box-shadow:
    0px 0px 5px 1px #000,
    inset 0px 0px 3px rgba(255,255,255,0.4);
  transition: all 0.15s ease;
}
.mode-button:active {
  box-shadow:
    0px 0px 5px 2px #000,
    inset 0px 0px 3px rgba(255,255,255,0.4);
}

/* Active mode icon colors */
.icon-heat { color: #ea580c }
.icon-cool { color: #428fff }
.icon-heat-cool { color: #cd63f1 }
.icon-dry { color: #f59e0b }
.icon-fan { color: #06d6a0 }
.icon-auto { color: #00ab61 }
.icon-off { color: #bdbdbd }

.preset-modes-icons {
  position: absolute;
  left: 90px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 20px;
  pointer-events: auto;
}

.preset-icon-button {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  margin: 0;
  box-shadow: none;
}

.icon-eco      { color: #10b981 !important; }
.icon-comfort  { color: #3b82f6 !important; }
.icon-away     { color: #f59e0b !important; }
.icon-sleep    { color: #6366f1 !important; }
.icon-boost    { color: #ea580c !important; }
.icon-activity { color: #06d6a0 !important; }
.icon-home     { color: #428fff !important; }

.temp-controls {
  position: absolute;
  left: 160px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 60px;
  pointer-events: auto;
}

.temp-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  background: #313447;
  color: white;
  box-shadow:
    0px 0px 5px 4px #000,
    inset 0px 0px 3px rgba(255,255,255,0.4);
  transition: all 0.15s ease;
}
.temp-btn:active:not(:disabled) {
  box-shadow:
    0px 0px 2px 4px #000,
    inset 0px 0px 3px rgba(255,255,255,0.4);
  transform: translateY(1px);
}
.temp-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.target-temp-handle {
  filter: drop-shadow(2px 2px 6px rgba(0,0,0,0.4));
  transition: r 0.2s, fill 0.2s;
}
.target-temp-handle:hover {
  r: 14;
}

.climate-center {
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: 20px;
  top: 50%;
  left: 30%;
  transform: translate(-50%, -50%);
  align-items: end;
  text-align: end;
  color: #1f2937;
  pointer-events: auto;
}

.temp-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  background: #313447;
  box-shadow:
    0px 0px 5px 2px #000,
    inset 0px 0px 3px rgba(255,255,255,0.4);
  transition: all 0.15s ease;
}
.temp-icon:hover {
  transform: scale(1.1);
}
.temp-icon .mdi {
  font-size: 32px;
}
.temp-icon-static .mdi {
  font-size: 48px;
  color: #6b7280;
}

.target-temp { display: flex; justify-content: center; }
.target-humidity { display: flex; justify-content: center; align-items: center; }

.target-temp-heat { color: #ea580c; }
.target-temp-cool { color: #428fff; }
.target-temp-dry { color: #f59e0b; }
.target-temp-fan { color: #06d6a0; }
.target-temp-auto { color: #00ab61; }
.target-temp-off { color: #bdbdbd; }
.target-humidity { color: #428fff; }

.temp-digits {
  display: flex;
  position: relative;
  justify-content: flex-end;
}

.temp-integer {
  font-size: 64px;
  line-height: 1;
  text-align: right;
  font-variant-numeric: tabular-nums;
  min-width: 1.2em;
}

.temp-dot {
  font-size: 64px;
  line-height: 1;
}

.temp-symbols {
  display: flex;
  flex-direction: column;
  height: 64px;
  margin-left: -4px;
}

.temp-degree {
  font-size: 24px;
  line-height: 1;
  margin-left: -4px;
  margin-top: 5px;
}

.temp-fractional {
  font-size: 32px;
  font-weight: 500;
  line-height: 1;
  margin-top: -1px;
  margin-left: 5px;
}

.humidity-integer {
  font-size: 64px;
  line-height: 1;
  text-align: right;
  font-variant-numeric: tabular-nums;
  min-width: 1.2em;
}

.humidity-degree {
  font-size: 42px;
  line-height: 1;
  text-align: right;
}

.current-temp {
  font-size: 24px;
  color: #6b7280;
  font-weight: 400;
}

.mdi {
  display: inline-block;
  font: normal normal normal 24px/1 "Material Design Icons";
  font-size: inherit;
  -webkit-font-smoothing: antialiased;
}

.mode-button .mdi,
.preset-icon-button .mdi {
  font-size: 24px;
}
.temp-btn .mdi {
  font-size: 24px;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
.climate-widget.connecting {
  animation: pulse 2s infinite;
}

.mode-button:focus,
.temp-btn:focus,
.temp-icon:focus,
.preset-icon-button:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.target-temp-vertical {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5em;
}
.target-cool {
  color: #428fff;
  font-size: 36px;
  font-weight: 300;
  line-height: 1;
}
.target-heat {
  color: #ea580c;
  font-size: 36px;
  font-weight: 300;
  line-height: 1;
}

* {
  transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
}
</style>



