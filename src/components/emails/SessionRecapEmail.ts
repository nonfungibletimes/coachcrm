export interface SessionRecapEmailProps {
  coachName: string
  clientName: string
  sessionDate: string
  wins?: string
  blocks?: string
  homework?: string[]
}

export function renderSessionRecapEmail(props: SessionRecapEmailProps) {
  const homeworkList = (props.homework ?? []).map(item => `<li>${item}</li>`).join('')

  return {
    subject: `Your session recap — ${props.sessionDate}`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#111;">
        <h2 style="margin:0 0 12px;">Session recap for ${props.clientName}</h2>
        <p style="margin:0 0 18px;">Hi ${props.clientName}, here’s your recap from ${props.sessionDate}.</p>
        ${props.wins ? `<h3>Wins</h3><p>${props.wins}</p>` : ''}
        ${props.blocks ? `<h3>Blockers</h3><p>${props.blocks}</p>` : ''}
        ${homeworkList ? `<h3>Homework</h3><ul>${homeworkList}</ul>` : ''}
        <p style="margin-top:18px;">You’ve got this 💪<br/>— ${props.coachName}</p>
      </div>
    `,
  }
}
