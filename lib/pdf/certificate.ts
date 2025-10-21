import PDFDocument from 'pdfkit'
import QRCode from 'qrcode'
import { createAdminClient } from '@/lib/supabase/admin'

interface CertificateData {
  userName: string
  courseName: string
  completionDate: string
  certificateId: string
  locale: 'en' | 'fr'
}

export async function generateCertificatePDF(data: CertificateData): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      })

      const chunks: Buffer[] = []
      doc.on('data', (chunk) => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      // Generate QR code
      const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${data.certificateId}`
      const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl)

      // Background
      doc.rect(0, 0, doc.page.width, doc.page.height)
         .fillAndStroke('#f0f9ff', '#3b82f6')

      // Border
      doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
         .lineWidth(3)
         .stroke('#2563eb')

      // Title
      doc.fontSize(40)
         .fillColor('#1e3a8a')
         .text(
           data.locale === 'fr' ? 'Certificat de Réussite' : 'Certificate of Completion',
           0, 100,
           { align: 'center' }
         )

      // CPE Academy
      doc.fontSize(20)
         .fillColor('#3b82f6')
         .text('CPE Academy', 0, 160, { align: 'center' })

      // Congratulations
      doc.fontSize(16)
         .fillColor('#374151')
         .text(
           data.locale === 'fr' ? 'Ce certificat atteste que' : 'This is to certify that',
           0, 220,
           { align: 'center' }
         )

      // User Name
      doc.fontSize(32)
         .fillColor('#1e3a8a')
         .text(data.userName, 0, 260, { align: 'center' })

      // Has completed
      doc.fontSize(16)
         .fillColor('#374151')
         .text(
           data.locale === 'fr' ? 'a réussi avec succès le cours' : 'has successfully completed the course',
           0, 320,
           { align: 'center' }
         )

      // Course Name
      doc.fontSize(24)
         .fillColor('#2563eb')
         .text(data.courseName, 0, 360, { align: 'center' })

      // Completion Date
      doc.fontSize(14)
         .fillColor('#6b7280')
         .text(
           data.locale === 'fr' 
             ? `Terminé le: ${data.completionDate}` 
             : `Completed on: ${data.completionDate}`,
           0, 430,
           { align: 'center' }
         )

      // QR Code
      const qrImage = qrCodeDataUrl.split(',')[1]
      doc.image(Buffer.from(qrImage, 'base64'), doc.page.width - 150, doc.page.height - 150, {
        width: 100,
        height: 100
      })

      // Certificate ID
      doc.fontSize(10)
         .fillColor('#9ca3af')
         .text(
           `${data.locale === 'fr' ? 'ID du certificat' : 'Certificate ID'}: ${data.certificateId}`,
           50, doc.page.height - 80,
           { align: 'left' }
         )

      // Verification note
      doc.fontSize(9)
         .fillColor('#9ca3af')
         .text(
           data.locale === 'fr' 
             ? 'Scannez le code QR pour vérifier ce certificat'
             : 'Scan QR code to verify this certificate',
           0, doc.page.height - 60,
           { align: 'center' }
         )

      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}

export async function uploadCertificate(
  userId: string,
  courseId: string,
  pdfBuffer: Buffer
): Promise<string> {
  const supabase = createAdminClient()
  const fileName = `certificates/${userId}/${courseId}-${Date.now()}.pdf`

  const { error: uploadError } = await supabase.storage
    .from('certificates')
    .upload(fileName, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: false
    })

  if (uploadError) {
    throw new Error(`Failed to upload certificate: ${uploadError.message}`)
  }

  const { data } = supabase.storage
    .from('certificates')
    .getPublicUrl(fileName)

  return data.publicUrl
}
