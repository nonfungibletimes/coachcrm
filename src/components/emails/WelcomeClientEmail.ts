export interface WelcomeClientEmailProps {
  coachName: string
  clientName: string
  portalUrl?: string
}

export function renderWelcomeClientEmail(props: WelcomeClientEmailProps) {
  return {
    subject: `Welcome to coaching with ${props.coachName}`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#111;">
        <h2>Welcome, ${props.clientName}! 🎉</h2>
        <p>I’m excited to work with you. We’ll use CoachCRM to keep goals, sessions, and progress in one place.</p>
        ${props.portalUrl ? `<p><a href="${props.portalUrl}">Open your client portal</a></p>` : ''}
        <p>Talk soon,<br/>${props.coachName}</p>
      </div>
    `,
  }
}
