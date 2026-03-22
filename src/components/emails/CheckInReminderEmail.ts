export interface CheckInReminderEmailProps {
  coachName: string
  clientName: string
  message?: string
}

export function renderCheckInReminderEmail(props: CheckInReminderEmailProps) {
  return {
    subject: `Quick check-in from ${props.coachName}`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#111;">
        <h2 style="margin:0 0 12px;">Hey ${props.clientName}, quick check-in 👋</h2>
        <p>${props.message || 'How are things going this week? Reply and let me know your wins and any blockers.'}</p>
        <p style="margin-top:18px;">— ${props.coachName}</p>
      </div>
    `,
  }
}
