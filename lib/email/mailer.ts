import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

interface EmailOptions {
  to: string
  subject: string
  html: string
  locale: 'en' | 'fr'
}

export async function sendEmail(options: EmailOptions) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
    })
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

export async function sendEnrollmentEmail(
  email: string,
  userName: string,
  courseName: string,
  locale: 'en' | 'fr'
) {
  const subject = locale === 'fr' 
    ? `Inscription confirmée - ${courseName}`
    : `Enrollment Confirmed - ${courseName}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #3b82f6; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9fafb; }
        .button { display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${locale === 'fr' ? 'Académie CPE' : 'CPE Academy'}</h1>
        </div>
        <div class="content">
          <h2>${locale === 'fr' ? 'Bonjour' : 'Hello'} ${userName},</h2>
          <p>
            ${locale === 'fr' 
              ? `Vous êtes maintenant inscrit au cours: <strong>${courseName}</strong>` 
              : `You are now enrolled in: <strong>${courseName}</strong>`}
          </p>
          <p>
            ${locale === 'fr' 
              ? 'Vous pouvez commencer votre apprentissage dès maintenant.' 
              : 'You can start your learning journey now.'}
          </p>
          <p style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/${locale}/dashboard" class="button">
              ${locale === 'fr' ? 'Aller au tableau de bord' : 'Go to Dashboard'}
            </a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  await sendEmail({ to: email, subject, html, locale })
}

export async function sendCertificateEmail(
  email: string,
  userName: string,
  courseName: string,
  certificateUrl: string,
  locale: 'en' | 'fr'
) {
  const subject = locale === 'fr' 
    ? `Certificat disponible - ${courseName}`
    : `Certificate Available - ${courseName}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #3b82f6; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9fafb; }
        .button { display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 6px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${locale === 'fr' ? 'Félicitations!' : 'Congratulations!'}</h1>
        </div>
        <div class="content">
          <h2>${locale === 'fr' ? 'Bonjour' : 'Hello'} ${userName},</h2>
          <p>
            ${locale === 'fr' 
              ? `Vous avez réussi le cours: <strong>${courseName}</strong>` 
              : `You have completed: <strong>${courseName}</strong>`}
          </p>
          <p>
            ${locale === 'fr' 
              ? 'Votre certificat est maintenant disponible.' 
              : 'Your certificate is now available.'}
          </p>
          <p style="text-align: center; margin-top: 30px;">
            <a href="${certificateUrl}" class="button">
              ${locale === 'fr' ? 'Télécharger le certificat' : 'Download Certificate'}
            </a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  await sendEmail({ to: email, subject, html, locale })
}

export async function sendReminderEmail(
  email: string,
  userName: string,
  courseName: string,
  locale: 'en' | 'fr'
) {
  const subject = locale === 'fr' 
    ? `Rappel - Continuez votre cours`
    : `Reminder - Continue Your Course`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #3b82f6; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9fafb; }
        .button { display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${locale === 'fr' ? 'Académie CPE' : 'CPE Academy'}</h1>
        </div>
        <div class="content">
          <h2>${locale === 'fr' ? 'Bonjour' : 'Hello'} ${userName},</h2>
          <p>
            ${locale === 'fr' 
              ? `Nous avons remarqué que vous n'avez pas terminé: <strong>${courseName}</strong>` 
              : `We noticed you haven't finished: <strong>${courseName}</strong>`}
          </p>
          <p>
            ${locale === 'fr' 
              ? 'Continuez votre apprentissage pour obtenir votre certificat!' 
              : 'Continue your learning to earn your certificate!'}
          </p>
          <p style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/${locale}/dashboard" class="button">
              ${locale === 'fr' ? 'Continuer le cours' : 'Continue Course'}
            </a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  await sendEmail({ to: email, subject, html, locale })
}
