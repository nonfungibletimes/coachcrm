import { renderSessionRecapEmail } from '@/components/emails/SessionRecapEmail'
import { renderCheckInReminderEmail } from '@/components/emails/CheckInReminderEmail'
import { renderWelcomeClientEmail } from '@/components/emails/WelcomeClientEmail'

const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY as string | undefined
const FROM = 'CoachCRM <onboarding@resend.dev>'

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) throw new Error('Missing VITE_RESEND_API_KEY')

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Resend request failed: ${text}`)
  }

  return res.json()
}

export async function sendSessionRecapEmail(params: {
  to: string
  coachName: string
  clientName: string
  sessionDate: string
  wins?: string
  blocks?: string
  homework?: string[]
}) {
  const payload = renderSessionRecapEmail(params)
  return sendEmail(params.to, payload.subject, payload.html)
}

export async function sendCheckInReminderEmail(params: {
  to: string
  coachName: string
  clientName: string
  message?: string
}) {
  const payload = renderCheckInReminderEmail(params)
  return sendEmail(params.to, payload.subject, payload.html)
}

export async function sendWelcomeClientEmail(params: {
  to: string
  coachName: string
  clientName: string
  portalUrl?: string
}) {
  const payload = renderWelcomeClientEmail(params)
  return sendEmail(params.to, payload.subject, payload.html)
}
