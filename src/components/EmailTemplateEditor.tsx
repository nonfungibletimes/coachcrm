import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { EmailTemplate, updateEmailTemplate } from '@/hooks/useEmailTemplates'

const VARIABLES = ['{{client_name}}', '{{coach_name}}', '{{session_date}}']

const SAMPLE_DATA: Record<string, string> = {
  '{{client_name}}': 'Alex Johnson',
  '{{coach_name}}': 'Your Coach',
  '{{session_date}}': 'Monday, January 27 at 10:00 AM',
}

function renderPreview(text: string): string {
  let result = text
  for (const [key, val] of Object.entries(SAMPLE_DATA)) {
    result = result.replaceAll(key, val)
  }
  return result
}

interface Props {
  template: EmailTemplate
  open: boolean
  onClose: () => void
  onSaved: (t: EmailTemplate) => void
}

export function EmailTemplateEditor({ template, open, onClose, onSaved }: Props) {
  const [subject, setSubject] = useState(template.subject)
  const [body, setBody] = useState(template.body)
  const bodyRef = useRef<HTMLTextAreaElement>(null)

  const insertVariable = (variable: string) => {
    const ta = bodyRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const newBody = body.substring(0, start) + variable + body.substring(end)
    setBody(newBody)
    setTimeout(() => {
      ta.selectionStart = ta.selectionEnd = start + variable.length
      ta.focus()
    }, 0)
  }

  const handleSave = () => {
    const updated: EmailTemplate = { ...template, subject, body }
    updateEmailTemplate(updated)
    onSaved(updated)
    toast.success('Template saved')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit: {template.name}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="edit">
          <TabsList>
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input value={subject} onChange={e => setSubject(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Body</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {VARIABLES.map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => insertVariable(v)}
                    className="text-xs px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-mono"
                  >
                    {v}
                  </button>
                ))}
              </div>
              <textarea
                ref={bodyRef}
                value={body}
                onChange={e => setBody(e.target.value)}
                rows={12}
                className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </TabsContent>

          <TabsContent value="preview" className="mt-4">
            <div className="space-y-3">
              <div className="p-3 border rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Subject</p>
                <p className="font-medium">{renderPreview(subject)}</p>
              </div>
              <div className="p-4 border rounded-lg bg-background whitespace-pre-wrap text-sm leading-relaxed">
                {renderPreview(body)}
              </div>
              <p className="text-xs text-muted-foreground">Preview uses sample data. Variables are shown rendered.</p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={handleSave}>Save Template</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
