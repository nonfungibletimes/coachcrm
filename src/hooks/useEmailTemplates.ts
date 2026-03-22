// NOTE: Templates currently stored in localStorage.
// TODO: Migrate to Supabase `email_templates` table with schema:
// id uuid, coach_id uuid, name text, subject text, body text, created_at timestamptz

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
}

const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: 'welcome',
    name: 'Welcome Email',
    subject: 'Welcome to coaching, {{client_name}}! 🎉',
    body: `Hi {{client_name}},

Welcome aboard! I'm thrilled to be your coach and I'm excited to help you reach your goals.

Our first session is scheduled and I can't wait to get started. Here's what you can expect:

- A focused, judgment-free environment
- Personalized strategies tailored to your situation
- Ongoing accountability and support

If you have any questions before we meet, don't hesitate to reach out.

Looking forward to our work together,
{{coach_name}}`,
  },
  {
    id: 'session-recap',
    name: 'Session Recap',
    subject: 'Your session recap — {{session_date}}',
    body: `Hi {{client_name}},

Thank you for our session on {{session_date}}. Here's a quick recap of what we covered:

**Key Takeaways:**
[Add session highlights here]

**Action Items:**
[Add action items here]

**Next Session:**
[Add next session details here]

Keep up the great work! You're making real progress.

Best,
{{coach_name}}`,
  },
  {
    id: 'checkin-reminder',
    name: 'Check-in Reminder',
    subject: 'Time for your check-in, {{client_name}}!',
    body: `Hi {{client_name}},

Just a friendly reminder that it's time for your check-in!

How have you been progressing on your goals since our last session? I'd love to hear:

1. What wins have you had?
2. What challenges are you facing?
3. Is there anything you'd like to focus on in our next session?

Feel free to reply to this email or we can catch up on {{session_date}}.

Cheering you on,
{{coach_name}}`,
  },
]

const STORAGE_KEY = 'coachcrm_email_templates'

function loadTemplates(): EmailTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_TEMPLATES
    return JSON.parse(raw)
  } catch {
    return DEFAULT_TEMPLATES
  }
}

function saveTemplates(templates: EmailTemplate[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates))
}

export function useEmailTemplates() {
  const templates = loadTemplates()
  return { templates }
}

export function getEmailTemplates(): EmailTemplate[] {
  return loadTemplates()
}

export function updateEmailTemplate(updated: EmailTemplate): void {
  const templates = loadTemplates()
  const idx = templates.findIndex(t => t.id === updated.id)
  if (idx >= 0) {
    templates[idx] = updated
  } else {
    templates.push(updated)
  }
  saveTemplates(templates)
}
