interface PowerBIConfig {
  workspaceId: string
  datasetId: string
  clientId: string
  clientSecret: string
  tenantId: string
}

interface PowerBIData {
  enrollments: any[]
  completions: any[]
  progress: any[]
}

export class PowerBIService {
  private config: PowerBIConfig

  constructor() {
    this.config = {
      workspaceId: process.env.POWERBI_WORKSPACE_ID || '',
      datasetId: process.env.POWERBI_DATASET_ID || '',
      clientId: process.env.POWERBI_CLIENT_ID || '',
      clientSecret: process.env.POWERBI_CLIENT_SECRET || '',
      tenantId: process.env.POWERBI_TENANT_ID || '',
    }
  }

  async getAccessToken(): Promise<string> {
    const tokenEndpoint = `https://login.microsoftonline.com/${this.config.tenantId}/oauth2/v2.0/token`
    
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      scope: 'https://analysis.windows.net/powerbi/api/.default',
    })

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    })

    if (!response.ok) {
      throw new Error('Failed to get Power BI access token')
    }

    const data = await response.json()
    return data.access_token
  }

  async pushData(data: PowerBIData): Promise<void> {
    const accessToken = await this.getAccessToken()
    
    const pushUrl = `https://api.powerbi.com/v1.0/myorg/groups/${this.config.workspaceId}/datasets/${this.config.datasetId}/rows?key=`

    // Transform data for Power BI format
    const rows = this.transformDataForPowerBI(data)

    const response = await fetch(pushUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rows }),
    })

    if (!response.ok) {
      throw new Error('Failed to push data to Power BI')
    }
  }

  private transformDataForPowerBI(data: PowerBIData) {
    // Transform the data structure for Power BI consumption
    return data.enrollments.map(enrollment => ({
      EnrollmentId: enrollment.id,
      UserId: enrollment.user_id,
      CourseId: enrollment.course_id,
      EnrolledDate: enrollment.enrolled_at,
      CompletedDate: enrollment.completed_at,
      ProgressPercentage: enrollment.progress_percentage,
      CertificateIssued: enrollment.certificate_issued,
    }))
  }

  async syncEnrollmentData(enrollments: any[]): Promise<void> {
    const data: PowerBIData = {
      enrollments,
      completions: enrollments.filter(e => e.completed_at),
      progress: enrollments.map(e => ({
        enrollment_id: e.id,
        progress: e.progress_percentage,
      })),
    }

    await this.pushData(data)
  }
}

export const powerBIService = new PowerBIService()
