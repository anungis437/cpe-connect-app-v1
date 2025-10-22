/**
 * SCORM 2004 Runtime API Implementation
 * Provides JavaScript API for SCORM content communication
 */

export interface SCORMDataModel {
  // Core SCORM elements
  'cmi.completion_status': 'completed' | 'incomplete' | 'not attempted' | 'unknown'
  'cmi.success_status': 'passed' | 'failed' | 'unknown'
  'cmi.score.raw': string
  'cmi.score.min': string
  'cmi.score.max': string
  'cmi.score.scaled': string
  'cmi.total_time': string
  'cmi.session_time': string
  'cmi.location': string
  'cmi.suspend_data': string
  'cmi.exit': 'time-out' | 'suspend' | 'logout' | 'normal' | ''
  'cmi.entry': 'ab-initio' | 'resume' | ''
  'cmi.mode': 'browse' | 'normal' | 'review'
  
  // Learner information (read-only)
  'cmi.learner_id': string
  'cmi.learner_name': string
  'cmi.learner_preference.language': string
  
  // Interactions
  'cmi.interactions._count': string
  'cmi.interactions.{n}.id': string
  'cmi.interactions.{n}.type': string
  'cmi.interactions.{n}.learner_response': string
  'cmi.interactions.{n}.result': string
  'cmi.interactions.{n}.timestamp': string
  
  // Objectives
  'cmi.objectives._count': string
  'cmi.objectives.{n}.id': string
  'cmi.objectives.{n}.score.raw': string
  'cmi.objectives.{n}.success_status': string
  'cmi.objectives.{n}.completion_status': string
}

export class SCORMRuntimeAPI {
  private sessionId: string
  private initialized: boolean = false
  private terminated: boolean = false
  private lastError: string = '0'
  private dataModel: Map<string, any> = new Map()
  private interactions: any[] = []
  private objectives: any[] = []
  private dirty: Set<string> = new Set()

  constructor(sessionId: string, initialData?: Partial<SCORMDataModel>) {
    this.sessionId = sessionId
    
    // Initialize default values
    this.initializeDefaults()
    
    // Load existing data if provided
    if (initialData) {
      Object.entries(initialData).forEach(([key, value]) => {
        this.dataModel.set(key, value)
      })
    }
  }

  private initializeDefaults() {
    this.dataModel.set('cmi.completion_status', 'incomplete')
    this.dataModel.set('cmi.success_status', 'unknown')
    this.dataModel.set('cmi.score.min', '0')
    this.dataModel.set('cmi.score.max', '100')
    this.dataModel.set('cmi.total_time', 'PT0H0M0S')
    this.dataModel.set('cmi.session_time', 'PT0H0M0S')
    this.dataModel.set('cmi.location', '')
    this.dataModel.set('cmi.suspend_data', '')
    this.dataModel.set('cmi.entry', 'ab-initio')
    this.dataModel.set('cmi.mode', 'normal')
    this.dataModel.set('cmi.exit', '')
    this.dataModel.set('cmi.interactions._count', '0')
    this.dataModel.set('cmi.objectives._count', '0')
  }

  /**
   * Initialize SCORM communication session
   */
  Initialize(parameter: string): string {
    if (this.initialized) {
      this.setError('103', 'Already initialized')
      return 'false'
    }

    if (this.terminated) {
      this.setError('104', 'Content instance terminated')
      return 'false'
    }

    this.initialized = true
    this.setError('0', 'No error')
    
    // Record initialization
    this.logEvent('initialize', { parameter })
    
    return 'true'
  }

  /**
   * Terminate SCORM communication session
   */
  Terminate(parameter: string): string {
    if (!this.initialized) {
      this.setError('112', 'Not initialized')
      return 'false'
    }

    if (this.terminated) {
      this.setError('113', 'Already terminated')
      return 'false'
    }

    // Commit any pending data
    this.Commit('')

    this.terminated = true
    this.initialized = false
    this.setError('0', 'No error')
    
    // Record termination
    this.logEvent('terminate', { parameter })
    
    return 'true'
  }

  /**
   * Get value from SCORM data model
   */
  GetValue(element: string): string {
    if (!this.initialized) {
      this.setError('122', 'Not initialized')
      return ''
    }

    if (this.terminated) {
      this.setError('123', 'Content instance terminated')
      return ''
    }

    // Handle array elements
    if (element.includes('._count')) {
      return this.getArrayCount(element)
    }

    if (element.includes('.{n}.') || /\.\d+\./.test(element)) {
      return this.getArrayElement(element)
    }

    const value = this.dataModel.get(element)
    
    if (value === undefined) {
      this.setError('401', `Data model element "${element}" not found`)
      return ''
    }

    this.setError('0', 'No error')
    return String(value)
  }

  /**
   * Set value in SCORM data model
   */
  SetValue(element: string, value: string): string {
    if (!this.initialized) {
      this.setError('132', 'Not initialized')
      return 'false'
    }

    if (this.terminated) {
      this.setError('133', 'Content instance terminated')
      return 'false'
    }

    // Validate element is writable
    if (!this.isWritable(element)) {
      this.setError('404', `Data model element "${element}" is read-only`)
      return 'false'
    }

    // Handle special elements
    if (element.includes('cmi.interactions.')) {
      this.setInteraction(element, value)
    } else if (element.includes('cmi.objectives.')) {
      this.setObjective(element, value)
    } else {
      // Validate value format
      if (!this.validateValue(element, value)) {
        this.setError('405', `Invalid value "${value}" for element "${element}"`)
        return 'false'
      }

      this.dataModel.set(element, value)
    }

    this.dirty.add(element)
    this.setError('0', 'No error')
    return 'true'
  }

  /**
   * Commit data to server
   */
  Commit(parameter: string): string {
    if (!this.initialized) {
      this.setError('142', 'Not initialized')
      return 'false'
    }

    if (this.terminated) {
      this.setError('143', 'Content instance terminated')
      return 'false'
    }

    // Send dirty data to server
    if (this.dirty.size > 0) {
      this.commitToServer()
      this.dirty.clear()
    }

    this.setError('0', 'No error')
    return 'true'
  }

  /**
   * Get last error code
   */
  GetLastError(): string {
    return this.lastError
  }

  /**
   * Get error string for error code
   */
  GetErrorString(errorCode: string): string {
    const errorMessages: Record<string, string> = {
      '0': 'No error',
      '101': 'General exception',
      '102': 'General initialization failure',
      '103': 'Already initialized',
      '104': 'Content instance terminated',
      '111': 'General termination failure',
      '112': 'Not initialized',
      '113': 'Already terminated',
      '122': 'Retrieve data before initialization',
      '123': 'Retrieve data after termination',
      '132': 'Store data before initialization',
      '133': 'Store data after termination',
      '142': 'Commit before initialization',
      '143': 'Commit after termination',
      '401': 'Undefined data model element',
      '402': 'Unimplemented data model element',
      '403': 'Data model element value not initialized',
      '404': 'Data model element is read only',
      '405': 'Data model element is write only'
    }

    return errorMessages[errorCode] || 'Unknown error'
  }

  /**
   * Get diagnostic information
   */
  GetDiagnostic(parameter: string): string {
    return `SCORM 2004 Runtime API - Session: ${this.sessionId}, Error: ${this.lastError}`
  }

  private setError(code: string, message: string) {
    this.lastError = code
    if (code !== '0') {
      console.error(`SCORM Error ${code}: ${message}`)
    }
  }

  private isWritable(element: string): boolean {
    const readOnlyElements = [
      'cmi.learner_id',
      'cmi.learner_name',
      'cmi.learner_preference.language',
      'cmi.mode',
      'cmi.entry',
      'cmi.interactions._count',
      'cmi.objectives._count'
    ]

    return !readOnlyElements.some(readonly => element.startsWith(readonly))
  }

  private validateValue(element: string, value: string): boolean {
    // Add validation logic based on element type
    switch (element) {
      case 'cmi.completion_status':
        return ['completed', 'incomplete', 'not attempted', 'unknown'].includes(value)
      case 'cmi.success_status':
        return ['passed', 'failed', 'unknown'].includes(value)
      case 'cmi.exit':
        return ['time-out', 'suspend', 'logout', 'normal', ''].includes(value)
      case 'cmi.mode':
        return ['browse', 'normal', 'review'].includes(value)
      default:
        return true // Basic validation, extend as needed
    }
  }

  private getArrayCount(element: string): string {
    if (element === 'cmi.interactions._count') {
      return String(this.interactions.length)
    }
    if (element === 'cmi.objectives._count') {
      return String(this.objectives.length)
    }
    return '0'
  }

  private getArrayElement(element: string): string {
    const match = element.match(/(\w+)\.(\d+)\.(\w+)/)
    if (!match) return ''

    const [, arrayType, indexStr, property] = match
    const index = parseInt(indexStr)

    if (arrayType === 'interactions' && this.interactions[index]) {
      return String(this.interactions[index][property] || '')
    }
    if (arrayType === 'objectives' && this.objectives[index]) {
      return String(this.objectives[index][property] || '')
    }

    return ''
  }

  private setInteraction(element: string, value: string) {
    const match = element.match(/cmi\.interactions\.(\d+)\.(\w+)/)
    if (!match) return

    const [, indexStr, property] = match
    const index = parseInt(indexStr)

    if (!this.interactions[index]) {
      this.interactions[index] = {}
    }

    this.interactions[index][property] = value
    this.dataModel.set('cmi.interactions._count', String(this.interactions.length))
  }

  private setObjective(element: string, value: string) {
    const match = element.match(/cmi\.objectives\.(\d+)\.(\w+)/)
    if (!match) return

    const [, indexStr, property] = match
    const index = parseInt(indexStr)

    if (!this.objectives[index]) {
      this.objectives[index] = {}
    }

    this.objectives[index][property] = value
    this.dataModel.set('cmi.objectives._count', String(this.objectives.length))
  }

  private async commitToServer() {
    try {
      const dataToCommit: Record<string, any> = {}
      
      this.dirty.forEach(element => {
        dataToCommit[element] = this.dataModel.get(element)
      })

      // Add interactions and objectives
      if (this.interactions.length > 0) {
        dataToCommit.interactions = this.interactions
      }
      if (this.objectives.length > 0) {
        dataToCommit.objectives = this.objectives
      }

      const response = await fetch(`/api/scorm/sessions/${this.sessionId}/commit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToCommit)
      })

      if (!response.ok) {
        throw new Error(`Server commit failed: ${response.statusText}`)
      }

    } catch (error) {
      console.error('Failed to commit SCORM data:', error)
      this.setError('101', 'Commit to server failed')
    }
  }

  private logEvent(event: string, data: any) {
    console.log(`SCORM Event: ${event}`, data)
    
    // Send to analytics if needed
    fetch(`/api/scorm/sessions/${this.sessionId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, data, timestamp: new Date().toISOString() })
    }).catch(console.error)
  }

  /**
   * Get current session data for persistence
   */
  getSessionData(): Record<string, any> {
    const data: Record<string, any> = {}
    
    this.dataModel.forEach((value, key) => {
      data[key] = value
    })

    if (this.interactions.length > 0) {
      data.interactions = this.interactions
    }
    if (this.objectives.length > 0) {
      data.objectives = this.objectives
    }

    return data
  }

  /**
   * Load session data from server
   */
  loadSessionData(data: Record<string, any>) {
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'interactions') {
        this.interactions = value || []
      } else if (key === 'objectives') {
        this.objectives = value || []
      } else {
        this.dataModel.set(key, value)
      }
    })
  }
}

/**
 * Global SCORM API Factory
 * Creates and manages SCORM API instances for content
 */
export class SCORMAPIFactory {
  private static instances: Map<string, SCORMRuntimeAPI> = new Map()

  static async createAPI(sessionId: string): Promise<SCORMRuntimeAPI> {
    // Check for existing instance
    if (this.instances.has(sessionId)) {
      return this.instances.get(sessionId)!
    }

    // Load session data from server
    const sessionData = await this.loadSessionData(sessionId)
    
    // Create new API instance
    const api = new SCORMRuntimeAPI(sessionId, sessionData)
    this.instances.set(sessionId, api)
    
    return api
  }

  static createSession(sessionId: string, version: string = '2004'): SCORMRuntimeAPI {
    // For synchronous creation during API routes
    if (this.instances.has(sessionId)) {
      return this.instances.get(sessionId)!
    }

    // Create minimal session data for initialization
    const sessionData: Partial<SCORMDataModel> = {
      'cmi.completion_status': 'incomplete',
      'cmi.success_status': 'unknown',
      'cmi.entry': 'ab-initio',
      'cmi.mode': 'normal',
      'cmi.score.raw': '',
      'cmi.score.max': '',
      'cmi.score.min': '',
      'cmi.session_time': 'PT0H0M0S',
      'cmi.total_time': 'PT0H0M0S',
      'cmi.location': '',
      'cmi.suspend_data': '',
      'cmi.exit': ''
    }
    
    const api = new SCORMRuntimeAPI(sessionId, sessionData)
    this.instances.set(sessionId, api)
    
    return api
  }

  static getAPI(sessionId: string): SCORMRuntimeAPI | null {
    return this.instances.get(sessionId) || null
  }

  static removeAPI(sessionId: string): boolean {
    return this.instances.delete(sessionId)
  }

  static removeInstance(sessionId: string): boolean {
    return this.instances.delete(sessionId)
  }

  private static async loadSessionData(sessionId: string): Promise<Record<string, any>> {
    try {
      const response = await fetch(`/api/scorm/sessions/${sessionId}/data`)
      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.error('Failed to load session data:', error)
    }
    return {}
  }
}

// Export for use in iframe context
declare global {
  interface Window {
    API_1484_11?: any
  }
}

export function injectSCORMAPI(sessionId: string) {
  SCORMAPIFactory.createAPI(sessionId).then(api => {
    // Inject into window for SCORM content
    ;(window as any).API_1484_11 = {
      Initialize: (param: string) => api.Initialize(param),
      Terminate: (param: string) => api.Terminate(param),
      GetValue: (element: string) => api.GetValue(element),
      SetValue: (element: string, value: string) => api.SetValue(element, value),
      Commit: (param: string) => api.Commit(param),
      GetLastError: () => api.GetLastError(),
      GetErrorString: (errorCode: string) => api.GetErrorString(errorCode),
      GetDiagnostic: (param: string) => api.GetDiagnostic(param)
    }

    // Also support SCORM 1.2 API
    ;(window as any).API = (window as any).API_1484_11

    console.log('SCORM API injected successfully for session:', sessionId)
  }).catch(error => {
    console.error('Failed to inject SCORM API:', error)
  })
}