'use client'

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { createClient } from '@/lib/supabase/client'

interface SCORMUploaderProps {
  organizationId: string
  onUploadComplete?: (packageData: any) => void
  onError?: (error: string) => void
}

interface UploadProgress {
  isUploading: boolean
  progress: number
  status: string
}

export default function SCORMUploader({
  organizationId,
  onUploadComplete,
  onError
}: SCORMUploaderProps) {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    isUploading: false,
    progress: 0,
    status: ''
  })
  const [packageTitle, setPackageTitle] = useState('')
  const [packageDescription, setPackageDescription] = useState('')

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    // Validate file
    if (!file.name.endsWith('.zip')) {
      onError?.('Only ZIP files are supported for SCORM packages')
      return
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB
      onError?.('File size must be less than 100MB')
      return
    }

    await uploadSCORMPackage(file)
  }, [packageTitle, packageDescription])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip']
    },
    multiple: false,
    disabled: uploadProgress.isUploading
  })

  const uploadSCORMPackage = async (file: File) => {
    try {
      setUploadProgress({
        isUploading: true,
        progress: 10,
        status: 'Preparing upload...'
      })

      // Create form data
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', packageTitle || file.name.replace('.zip', ''))
      formData.append('description', packageDescription)

      setUploadProgress(prev => ({
        ...prev,
        progress: 30,
        status: 'Uploading package...'
      }))

      // Upload to API
      const response = await fetch('/api/scorm/packages/upload', {
        method: 'POST',
        body: formData
      })

      setUploadProgress(prev => ({
        ...prev,
        progress: 70,
        status: 'Processing SCORM package...'
      }))

      const result = await response.json()

      if (result.success) {
        setUploadProgress({
          isUploading: false,
          progress: 100,
          status: 'Upload complete!'
        })

        // Reset form
        setPackageTitle('')
        setPackageDescription('')

        onUploadComplete?.(result.package)

        // Clear success message after 3 seconds
        setTimeout(() => {
          setUploadProgress({
            isUploading: false,
            progress: 0,
            status: ''
          })
        }, 3000)

      } else {
        throw new Error(result.error || 'Upload failed')
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      
      setUploadProgress({
        isUploading: false,
        progress: 0,
        status: ''
      })

      onError?.(errorMessage)
    }
  }

  return (
    <div className="scorm-uploader max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload SCORM Package</h2>
        <p className="text-gray-600">
          Upload a SCORM-compliant ZIP package to make it available for learners.
        </p>
      </div>

      {/* Package Information Form */}
      <div className="mb-6 space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Package Title
          </label>
          <input
            type="text"
            id="title"
            value={packageTitle}
            onChange={(e) => setPackageTitle(e.target.value)}
            placeholder="Enter a descriptive title for this package"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={uploadProgress.isUploading}
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description (Optional)
          </label>
          <textarea
            id="description"
            rows={3}
            value={packageDescription}
            onChange={(e) => setPackageDescription(e.target.value)}
            placeholder="Provide additional details about this SCORM package"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            disabled={uploadProgress.isUploading}
          />
        </div>
      </div>

      {/* File Drop Zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-blue-400 bg-blue-50' 
            : uploadProgress.isUploading
            ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
        `}
      >
        <input {...getInputProps()} />
        
        {uploadProgress.isUploading ? (
          <div className="space-y-4">
            <div className="text-blue-600">
              <svg className="mx-auto h-12 w-12 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">{uploadProgress.status}</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress.progress}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-500">{uploadProgress.progress}% complete</div>
            </div>
          </div>
        ) : uploadProgress.status === 'Upload complete!' ? (
          <div className="space-y-2">
            <div className="text-green-600">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div className="text-lg font-medium text-green-700">Upload Complete!</div>
            <div className="text-sm text-green-600">Your SCORM package has been processed successfully.</div>
          </div>
        ) : isDragActive ? (
          <div className="space-y-2">
            <div className="text-blue-600">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
            </div>
            <div className="text-lg font-medium text-blue-700">Drop your SCORM package here</div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-gray-400">
              <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            
            <div className="space-y-2">
              <div className="text-lg font-medium text-gray-700">
                Drag and drop your SCORM package here
              </div>
              <div className="text-sm text-gray-500">
                or <span className="text-blue-600 font-medium">browse to upload</span>
              </div>
            </div>
            
            <div className="text-xs text-gray-400">
              Supports SCORM 1.2, 2004, xAPI • ZIP format only • Max 100MB
            </div>
          </div>
        )}
      </div>

      {/* Requirements */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">SCORM Package Requirements:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Package must be a valid ZIP file containing imsmanifest.xml</li>
          <li>• Supports SCORM 1.2, SCORM 2004 (3rd & 4th Edition), xAPI, and CMI5</li>
          <li>• Maximum file size: 100MB</li>
          <li>• Package should include all necessary resources and dependencies</li>
        </ul>
      </div>
    </div>
  )
}