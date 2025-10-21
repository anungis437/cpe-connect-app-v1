import archiver from 'archiver'
import { createAdminClient } from '@/lib/supabase/admin'

export async function generateEvidenceZip(
  enrollmentId: string
): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const supabase = createAdminClient()
      
      // Get all artifacts for this enrollment
      const { data: artifacts, error } = await supabase
        .from('artifacts')
        .select('*')
        .eq('enrollment_id', enrollmentId)

      if (error) throw error

      const archive = archiver('zip', {
        zlib: { level: 9 }
      })

      const chunks: Buffer[] = []
      archive.on('data', (chunk) => chunks.push(chunk))
      archive.on('end', () => resolve(Buffer.concat(chunks)))
      archive.on('error', reject)

      // Download and add each artifact to the zip
      for (const artifact of artifacts || []) {
        try {
          // Download file from Supabase storage
          const { data: fileData } = await supabase.storage
            .from('artifacts')
            .download(artifact.file_url.split('/').pop() || '')

          if (fileData) {
            const buffer = Buffer.from(await fileData.arrayBuffer())
            archive.append(buffer, { name: artifact.file_name })
          }
        } catch (error) {
          console.error(`Failed to add artifact ${artifact.file_name}:`, error)
        }
      }

      // Add a manifest file
      const manifest = {
        enrollment_id: enrollmentId,
        generated_at: new Date().toISOString(),
        files: artifacts?.map(a => ({
          name: a.file_name,
          type: a.file_type,
          uploaded_at: a.uploaded_at,
        })) || [],
      }

      archive.append(JSON.stringify(manifest, null, 2), { name: 'manifest.json' })

      archive.finalize()
    } catch (error) {
      reject(error)
    }
  })
}

export async function uploadArtifact(
  enrollmentId: string,
  file: File
): Promise<string> {
  const supabase = createAdminClient()
  const fileName = `artifacts/${enrollmentId}/${Date.now()}-${file.name}`

  const { error: uploadError } = await supabase.storage
    .from('artifacts')
    .upload(fileName, file)

  if (uploadError) {
    throw new Error(`Failed to upload artifact: ${uploadError.message}`)
  }

  const { data } = supabase.storage
    .from('artifacts')
    .getPublicUrl(fileName)

  // Record in database
  await supabase.from('artifacts').insert({
    enrollment_id: enrollmentId,
    file_name: file.name,
    file_url: fileName,
    file_type: file.type,
  })

  return data.publicUrl
}
