import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  getAuth, 
  createConnection, 
  subscribeEntities, 
  getUser,
  type Connection,
  type HassEntities,
  type HassUser 
} from 'home-assistant-js-websocket'
import { hassIcons } from '../services/hassIcons'
import type { IconsData, IconCategory } from '../types'

export const useHAStore = defineStore('homeAssistant', () => {
  // State (reactive data)
  const connection = ref<Connection | null>(null)
  const entities = ref<HassEntities>({})
  const user = ref<HassUser | null>(null)
  const isConnecting = ref(false)
  const connectionError = ref<string | null>(null)
  const hassUrl = ref('http://homeassistant.local:8123')
  const icons = ref<Record<IconCategory, IconsData> | null>(null)

  // Getters (computed properties)
  const isConnected = computed(() => connection.value !== null)
  
  const lightEntities = computed(() => {
    console.log('💡 Recomputing light entities...')
    
    const lights = Object.entries(entities.value)
      .filter(([entityId]) => entityId.startsWith('light.'))
      .map(([entityId, entity]) => ({
        entityId,
        name: entity.attributes?.friendly_name || entityId,
        state: entity.state,
        brightness: entity.attributes?.brightness,
        rgb_color: entity.attributes?.rgb_color,
        supported_features: entity.attributes?.supported_features || 0,
        // Capability flags
        supportsBrightness: (entity.attributes?.supported_features || 0) & 1,
        supportsColor: (entity.attributes?.supported_features || 0) & 16,
      }))
    
    console.log('Total light entities found:', lights.length)
    return lights
  })

  const climateEntities = computed(() => {
    console.log('🌡️ Recomputing climate entities...')
    console.log('Total entities:', Object.keys(entities.value).length)
    
    const climate = Object.entries(entities.value)
      .filter(([entityId]) => entityId.startsWith('climate.'))
      .map(([entityId, entity]) => ({
        entityId,
        name: entity.attributes?.friendly_name || entityId,
        state: entity.state,
        temperature: entity.attributes?.temperature,
        target_temp: entity.attributes?.target_temp_high || entity.attributes?.temperature,
        hvac_mode: entity.attributes?.hvac_mode,
        hvac_modes: entity.attributes?.hvac_modes || [],
        preset_mode: entity.attributes?.preset_mode,
        preset_modes: entity.attributes?.preset_modes || []
      }))
    
    console.log('Total climate entities found:', climate.length)
    return climate
  })

  // Actions (methods)
  const setUrl = (newUrl: string) => {
    console.log('🔗 Setting new URL:', newUrl)
    hassUrl.value = newUrl
  }

  const connect = async () => {
    if (connection.value) {
      console.log('⚠️ Already connected')
      return connection.value
    }
    
    isConnecting.value = true
    connectionError.value = null
    console.log('🔄 Starting connection to:', hassUrl.value)
    
    try {
      const auth = await getAuth({
        hassUrl: hassUrl.value,
        saveTokens: (tokens) => {
          console.log('💾 Saving tokens')
          localStorage.setItem('hassTokens', JSON.stringify(tokens))
        },
        loadTokens: () => {
          console.log('📖 Loading tokens')
          const tokens = localStorage.getItem('hassTokens')
          return tokens ? JSON.parse(tokens) : null
        }
      })
      
      console.log('✅ Authentication successful')
      const conn = await createConnection({ auth })
      console.log('✅ WebSocket connection established')
      
      // Subscribe to entity state updates
      subscribeEntities(conn, (newEntities) => {
        console.log('📦 Entities received:', Object.keys(newEntities).length)
        entities.value = newEntities
        
        // Log climate entity IDs
        const climateIds = Object.keys(newEntities).filter(id => id.startsWith('climate.'))
        console.log('🌡️ Climate entities:', climateIds)
      })
      
      // Fetch user info
      const userData = await getUser(conn)
      console.log('👤 User:', userData.name)
      user.value = userData
      
      // Load icons
      try {
        console.log('🎨 Loading icons...')
        icons.value = await hassIcons.getAllIcons(conn)
        console.log('✅ Icons loaded')
      } catch (error) {
        console.error('❌ Icon loading failed:', error)
      }
      
      connection.value = conn
      console.log('🎉 Connection successfully completed!')
      
      return conn

    } catch (error) {
      console.error('❌ Connection error:', error)
      connectionError.value = error instanceof Error ? error.message : String(error)
      throw error
    } finally {
      isConnecting.value = false
    }
  }

  const disconnect = () => {
    console.log('🔌 Disconnecting...')
    if (connection.value) {
      connection.value.close()
      connection.value = null
    }
    entities.value = {}
    user.value = null
    connectionError.value = null
    icons.value = null
    
    // Clear tokens
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hassTokens')
    }
    console.log('🧹 Disconnected and state cleared')
  }

  // Exported API
  return {
    // State
    connection,
    entities,
    user,
    isConnecting,
    connectionError,
    hassUrl,
    icons,
    
    // Getters
    isConnected,
    climateEntities,
    lightEntities,
    
    // Actions
    setUrl,
    connect,
    disconnect
  }
})

