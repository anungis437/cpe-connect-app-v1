/**
 * SCORM Package Manager
 * Handles SCORM package upload, validation, and extraction
 */

import JSZip from 'jszip'
import { XMLParser } from 'fast-xml-parser'

export interface SCORMManifest {
  identifier: string
  version: string
  title: string
  description?: string
  schemaVersion: string
  organizations: SCORMOrganization[]
  resources: SCORMResource[]
  metadata?: any
}

export interface SCORMOrganization {
  identifier: string
  title: string
  items: SCORMItem[]
}

export interface SCORMItem {
  identifier: string
  identifierref?: string
  title: string
  children?: SCORMItem[]
  parameters?: string
  dataFromLMS?: string
  completionThreshold?: number
  timeLimitAction?: string
}

export interface SCORMResource {
  identifier: string
  type: string
  href: string
  scormType?: string
  files: string[]
  dependencies?: string[]
}

export interface SCORMValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  manifest?: SCORMManifest
  scormVersion?: string
  packageSize?: number
}

export interface SCORMPackageInfo {
  id: string
  title: string
  version: string
  scormVersion: string
  launchUrl: string
  totalSize: number
  files: string[]
  manifest: SCORMManifest
}

export class SCORMPackageManager {
  private static readonly MANIFEST_FILE = 'imsmanifest.xml'
  private static readonly MAX_PACKAGE_SIZE = 100 * 1024 * 1024 // 100MB
  private static readonly SUPPORTED_SCORM_VERSIONS = ['1.2', '2004']

  /**
   * Upload and process SCORM package
   */
  static async uploadPackage(
    file: File,
    courseId: string,
    uploadPath?: string
  ): Promise<{ success: boolean; packageId?: string; error?: string }> {
    try {
      // Validate file size
      if (file.size > this.MAX_PACKAGE_SIZE) {
        throw new Error(`Package size exceeds maximum allowed size of ${this.MAX_PACKAGE_SIZE / 1024 / 1024}MB`)
      }

      // Validate file type
      if (!file.name.toLowerCase().endsWith('.zip')) {
        throw new Error('SCORM package must be a ZIP file')
      }

      // Extract and validate package
      const validation = await this.validatePackage(file)
      if (!validation.isValid) {
        throw new Error(`Invalid SCORM package: ${validation.errors.join(', ')}`)
      }

      // Generate upload path
      const finalUploadPath = uploadPath || this.generateUploadPath(courseId)

      // Extract package to storage
      const extractedFiles = await this.extractPackage(file, finalUploadPath)

      // Save to database
      const packageId = await this.savePackageToDatabase({
        courseId,
        manifest: validation.manifest!,
        scormVersion: validation.scormVersion!,
        uploadPath: finalUploadPath,
        packageSize: file.size,
        files: extractedFiles
      })

      return { success: true, packageId }
      
    } catch (error) {
      console.error('SCORM package upload failed:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    }
  }

  /**
   * Validate SCORM package
   */
  static async validatePackage(file: File): Promise<SCORMValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // Load ZIP file
      const zip = await JSZip.loadAsync(file)

      // Check for manifest file
      const manifestFile = zip.file(this.MANIFEST_FILE)
      if (!manifestFile) {
        errors.push('Missing imsmanifest.xml file')
        return { isValid: false, errors, warnings }
      }

      // Parse manifest
      const manifestXML = await manifestFile.async('text')
      const manifest = await this.parseManifest(manifestXML)

      // Determine SCORM version
      const scormVersion = this.detectSCORMVersion(manifest)
      if (!this.SUPPORTED_SCORM_VERSIONS.includes(scormVersion)) {
        errors.push(`Unsupported SCORM version: ${scormVersion}`)
      }

      // Validate manifest structure
      const manifestValidation = this.validateManifest(manifest)
      errors.push(...manifestValidation.errors)
      warnings.push(...manifestValidation.warnings)

      // Validate resources exist
      const resourceValidation = await this.validateResources(zip, manifest)
      errors.push(...resourceValidation.errors)
      warnings.push(...resourceValidation.warnings)

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        manifest,
        scormVersion,
        packageSize: file.size
      }

    } catch (error) {
      errors.push(`Failed to process package: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return { isValid: false, errors, warnings }
    }
  }

  /**
   * Parse IMS Manifest XML
   */
  private static async parseManifest(manifestXML: string): Promise<any> {
    const options = {
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      parseAttributeValue: true,
      trimValues: true
    }

    try {
      const parser = new XMLParser(options)
      const parsed = parser.parse(manifestXML)
      return parsed.manifest || parsed
    } catch (error) {
      throw new Error(`Invalid manifest XML: ${error instanceof Error ? error.message : 'Parse error'}`)
    }
  }

  /**
   * Detect SCORM version from manifest
   */
  private static detectSCORMVersion(manifest: any): string {
    // Check schema location for version indicators
    const schemaLocation = manifest['@_schemaLocation'] || ''
    
    if (schemaLocation.includes('2004') || schemaLocation.includes('1.3')) {
      return '2004'
    }
    
    if (schemaLocation.includes('1.2')) {
      return '1.2'
    }

    // Check metadata for SCORM version
    if (manifest.metadata?.schemaversion) {
      const version = manifest.metadata.schemaversion
      if (version.includes('2004') || version.includes('1.3')) {
        return '2004'
      }
      if (version.includes('1.2')) {
        return '1.2'
      }
    }

    // Default to 2004 if uncertain
    return '2004'
  }

  /**
   * Validate manifest structure
   */
  private static validateManifest(manifest: any): { errors: string[]; warnings: string[] } {
    const errors: string[] = []
    const warnings: string[] = []

    // Required elements
    if (!manifest['@_identifier']) {
      errors.push('Manifest missing required identifier')
    }

    if (!manifest.organizations) {
      errors.push('Manifest missing organizations section')
    }

    if (!manifest.resources) {
      errors.push('Manifest missing resources section')
    }

    // Organizations validation
    if (manifest.organizations) {
      if (!manifest.organizations.organization) {
        errors.push('No organization defined in organizations section')
      } else {
        const orgs = Array.isArray(manifest.organizations.organization) 
          ? manifest.organizations.organization 
          : [manifest.organizations.organization]
        
        orgs.forEach((org: any, index: number) => {
          if (!org['@_identifier']) {
            errors.push(`Organization ${index} missing identifier`)
          }
          if (!org.title) {
            errors.push(`Organization ${index} missing title`)
          }
        })
      }
    }

    // Resources validation
    if (manifest.resources?.resource) {
      const resources = Array.isArray(manifest.resources.resource)
        ? manifest.resources.resource
        : [manifest.resources.resource]
      
      resources.forEach((resource: any, index: number) => {
        if (!resource['@_identifier']) {
          errors.push(`Resource ${index} missing identifier`)
        }
        if (!resource['@_href']) {
          warnings.push(`Resource ${index} missing href attribute`)
        }
      })
    }

    return { errors, warnings }
  }

  /**
   * Validate that referenced resources exist in package
   */
  private static async validateResources(
    zip: JSZip, 
    manifest: any
  ): Promise<{ errors: string[]; warnings: string[] }> {
    const errors: string[] = []
    const warnings: string[] = []

    if (!manifest.resources?.resource) {
      return { errors, warnings }
    }

    const resources = Array.isArray(manifest.resources.resource)
      ? manifest.resources.resource
      : [manifest.resources.resource]

    for (const resource of resources) {
      const href = resource['@_href']
      if (href) {
        const file = zip.file(href)
        if (!file) {
          errors.push(`Referenced file not found: ${href}`)
        }
      }

      // Check file elements
      if (resource.file) {
        const files = Array.isArray(resource.file) ? resource.file : [resource.file]
        for (const fileRef of files) {
          const filePath = fileRef['@_href']
          if (filePath && !zip.file(filePath)) {
            warnings.push(`Referenced file not found: ${filePath}`)
          }
        }
      }
    }

    return { errors, warnings }
  }

  /**
   * Extract package to storage location
   */
  private static async extractPackage(file: File, uploadPath: string): Promise<string[]> {
    const zip = await JSZip.loadAsync(file)
    const extractedFiles: string[] = []

    // In a real implementation, this would extract to file system or cloud storage
    // For now, we'll simulate the extraction and return file paths
    
    const promises = Object.keys(zip.files).map(async (relativePath) => {
      const zipEntry = zip.files[relativePath]
      
      if (!zipEntry.dir) {
        // This would be the actual file extraction logic
        // const content = await zipEntry.async('blob')
        // await saveFile(`${uploadPath}/${relativePath}`, content)
        
        extractedFiles.push(`${uploadPath}/${relativePath}`)
      }
    })

    await Promise.all(promises)
    return extractedFiles
  }

  /**
   * Save package information to database
   */
  private static async savePackageToDatabase(packageData: {
    courseId: string
    manifest: any
    scormVersion: string
    uploadPath: string
    packageSize: number
    files: string[]
  }): Promise<string> {
    // Extract launch URL from manifest
    const launchUrl = this.extractLaunchUrl(packageData.manifest)
    
    // Create package record
    const response = await fetch('/api/scorm/packages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courseId: packageData.courseId,
        scormVersion: packageData.scormVersion,
        packageIdentifier: packageData.manifest['@_identifier'],
        packageTitle: this.extractTitle(packageData.manifest),
        manifestXml: JSON.stringify(packageData.manifest),
        launchUrl,
        packageSize: packageData.packageSize,
        uploadPath: packageData.uploadPath,
        metadata: {
          files: packageData.files,
          extractedAt: new Date().toISOString()
        }
      })
    })

    if (!response.ok) {
      throw new Error('Failed to save package to database')
    }

    const result = await response.json()
    return result.id
  }

  /**
   * Extract launch URL from manifest
   */
  private static extractLaunchUrl(manifest: any): string {
    // Find the default organization
    const defaultOrg = manifest.organizations?.['@_default']
    let targetOrg = null

    if (manifest.organizations?.organization) {
      const orgs = Array.isArray(manifest.organizations.organization)
        ? manifest.organizations.organization
        : [manifest.organizations.organization]
      
      targetOrg = defaultOrg 
        ? orgs.find((org: any) => org['@_identifier'] === defaultOrg)
        : orgs[0]
    }

    if (!targetOrg?.item) {
      throw new Error('No items found in organization')
    }

    // Find the first item with an identifierref
    const items = Array.isArray(targetOrg.item) ? targetOrg.item : [targetOrg.item]
    const launchItem = this.findLaunchableItem(items)
    
    if (!launchItem?.['@_identifierref']) {
      throw new Error('No launchable item found')
    }

    // Find the corresponding resource
    const resourceId = launchItem['@_identifierref']
    const resources = Array.isArray(manifest.resources.resource)
      ? manifest.resources.resource
      : [manifest.resources.resource]
    
    const resource = resources.find((r: any) => r['@_identifier'] === resourceId)
    
    if (!resource?.['@_href']) {
      throw new Error(`Resource ${resourceId} not found or missing href`)
    }

    return resource['@_href']
  }

  /**
   * Find the first launchable item in the organization tree
   */
  private static findLaunchableItem(items: any[]): any {
    for (const item of items) {
      if (item['@_identifierref']) {
        return item
      }
      if (item.item) {
        const subItems = Array.isArray(item.item) ? item.item : [item.item]
        const found = this.findLaunchableItem(subItems)
        if (found) return found
      }
    }
    return null
  }

  /**
   * Extract package title from manifest
   */
  private static extractTitle(manifest: any): string {
    // Try to get title from default organization
    const defaultOrg = manifest.organizations?.['@_default']
    if (defaultOrg && manifest.organizations?.organization) {
      const orgs = Array.isArray(manifest.organizations.organization)
        ? manifest.organizations.organization
        : [manifest.organizations.organization]
      
      const targetOrg = orgs.find((org: any) => org['@_identifier'] === defaultOrg)
      if (targetOrg?.title) {
        return targetOrg.title
      }
    }

    // Fall back to first organization title
    if (manifest.organizations?.organization) {
      const firstOrg = Array.isArray(manifest.organizations.organization)
        ? manifest.organizations.organization[0]
        : manifest.organizations.organization
      
      if (firstOrg.title) {
        return firstOrg.title
      }
    }

    // Fall back to manifest identifier
    return manifest['@_identifier'] || 'Untitled SCORM Package'
  }

  /**
   * Generate unique upload path for package
   */
  private static generateUploadPath(courseId: string): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    return `scorm/${courseId}/${timestamp}_${random}`
  }

  /**
   * Get package information
   */
  static async getPackageInfo(packageId: string): Promise<SCORMPackageInfo | null> {
    try {
      const response = await fetch(`/api/scorm/packages/${packageId}`)
      if (response.ok) {
        return await response.json()
      }
    } catch (error) {
      console.error('Failed to get package info:', error)
    }
    return null
  }

  /**
   * Delete SCORM package
   */
  static async deletePackage(packageId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/scorm/packages/${packageId}`, {
        method: 'DELETE'
      })
      return response.ok
    } catch (error) {
      console.error('Failed to delete package:', error)
      return false
    }
  }
}