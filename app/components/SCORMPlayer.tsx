'use client'

import React, { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface SCORMPlayerProps {
  packageId: string
  sessionId?: string
  userId: string
  organizationId: string
  onSessionStart?: (sessionId: string) => void
  onSessionComplete?: (sessionData: any) => void
  onError?: (error: string) => void
}

interface SCORMSession {
  id: string
  status: string
  lessonStatus: string
  score: number | null
  package: {
    title: string
    launch_url: string
    scorm_version: string
  }
}

export default function SCORMPlayer({
  packageId,
  sessionId: initialSessionId,
  userId,
  organizationId,
  onSessionStart,
  onSessionComplete,
  onError
}: SCORMPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [session, setSession] = useState<SCORMSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState(initialSessionId)
  const supabase = createClient()

  // Initialize SCORM session
  useEffect(() => {
    initializeSession()
  }, [packageId, userId, organizationId])

  // Set up SCORM API for iframe communication
  useEffect(() => {
    if (session && iframeRef.current) {
      setupSCORMAPI()
    }
  }, [session])

  const initializeSession = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/scorm/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId,
          userId,
          organizationId,
          attemptNumber: 1
        })
      })

      if (!response.ok) {
        throw new Error('Failed to initialize SCORM session')
      }

      const result = await response.json()
      
      if (result.success) {
        const newSessionId = result.sessionId
        setSessionId(newSessionId)
        onSessionStart?.(newSessionId)
        
        // Load session data
        await loadSessionData(newSessionId)
      } else {
        throw new Error(result.error || 'Session initialization failed')
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to initialize session'
      setError(errorMsg)
      onError?.(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const loadSessionData = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/scorm/session`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSession(data.session)
      }
    } catch (err) {
      console.error('Failed to load session data:', err)
    }
  }

  const setupSCORMAPI = () => {
    if (!sessionId || !iframeRef.current) return

    // Create SCORM API object for the iframe
    const scormAPI = {
      Initialize: (parameter: string) => {
        console.log('SCORM Initialize called')
        return 'true'
      },
      
      Terminate: async (parameter: string) => {
        console.log('SCORM Terminate called')
        try {
          const response = await fetch('/api/scorm/runtime/terminate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId })
          })
          
          if (response.ok) {
            const result = await response.json()
            onSessionComplete?.(result)
            return 'true'
          }
        } catch (error) {
          console.error('Terminate failed:', error)
        }
        return 'false'
      },

      GetValue: async (element: string) => {
        try {
          const response = await fetch('/api/scorm/runtime', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, element })
          })
          
          if (response.ok) {
            const result = await response.json()
            return result.value || ''
          }
        } catch (error) {
          console.error('GetValue failed:', error)
        }
        return ''
      },

      SetValue: async (element: string, value: string) => {
        try {
          const response = await fetch('/api/scorm/runtime', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, element, value })
          })
          
          if (response.ok) {
            const result = await response.json()
            return result.success ? 'true' : 'false'
          }
        } catch (error) {
          console.error('SetValue failed:', error)
        }
        return 'false'
      },

      Commit: async (parameter: string) => {
        try {
          const response = await fetch('/api/scorm/runtime/commit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId })
          })
          
          if (response.ok) {
            const result = await response.json()
            return result.success ? 'true' : 'false'
          }
        } catch (error) {
          console.error('Commit failed:', error)
        }
        return 'false'
      },

      GetLastError: () => '0',
      
      GetErrorString: (errorCode: string) => {
        const errors: Record<string, string> = {
          '0': 'No error',
          '101': 'General exception',
          '102': 'General initialization failure',
          '103': 'Already initialized',
          '104': 'Content instance terminated',
          '111': 'General termination failure',
          '112': 'Termination before initialization',
          '113': 'Termination after termination',
          '122': 'Retrieve data before initialization',
          '123': 'Retrieve data after termination',
          '132': 'Store data before initialization',
          '133': 'Store data after termination',
          '142': 'Commit before initialization',
          '143': 'Commit after termination',
          '201': 'General argument error',
          '301': 'General get value error',
          '351': 'General set value error',
          '391': 'General commit error',
          '401': 'Undefined data model element',
          '402': 'Unimplemented data model element',
          '403': 'Data model element value not initialized',
          '404': 'Data model element is read only',
          '405': 'Data model element is write only'
        }
        return errors[errorCode] || 'Unknown error'
      },

      GetDiagnostic: (errorCode: string) => `Diagnostic for error ${errorCode}`
    }

    // Make API available to iframe content
    ;(window as any).API_1484_11 = scormAPI
    ;(window as any).API = scormAPI // SCORM 1.2 compatibility

    // Listen for iframe messages
    const handleMessage = (event: MessageEvent) => {
      if (event.source === iframeRef.current?.contentWindow) {
        // Handle SCORM API calls from iframe
        console.log('SCORM message from iframe:', event.data)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading SCORM content...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-red-50 rounded-lg">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-2">⚠️</div>
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Content</h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={initializeSession}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-gray-400 text-xl mb-2">📚</div>
          <p className="text-gray-600">No session data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="scorm-player w-full h-full">
      {/* Session Info Bar */}
      <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex justify-between items-center text-sm">
        <div className="flex items-center space-x-4">
          <span className="font-medium text-gray-700">{session.package.title}</span>
          <span className="text-gray-500">SCORM {session.package.scorm_version}</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            session.status === 'completed' 
              ? 'bg-green-100 text-green-800'
              : session.status === 'active'
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {session.lessonStatus}
          </span>
          {session.score !== null && (
            <span className="text-gray-600">
              Score: {session.score}%
            </span>
          )}
        </div>
      </div>

      {/* SCORM Content Iframe */}
      <iframe
        ref={iframeRef}
        src={session.package.launch_url}
        className="w-full h-full border-0"
        title={session.package.title}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        onLoad={() => {
          console.log('SCORM content loaded')
          // Ensure API is available to iframe
          setupSCORMAPI()
        }}
      />
    </div>
  )
}