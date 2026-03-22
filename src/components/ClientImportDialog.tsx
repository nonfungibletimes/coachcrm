import { useState, useRef } from 'react'
import Papa from 'papaparse'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useCreateClient } from '@/hooks/useClients'
import { Upload, FileText, AlertCircle } from 'lucide-react'
import { Client } from '@/types'

interface ParsedRow {
  full_name: string
  email: string
  phone: string
  package: string
  status: Client['status']
  notes: string
}

const STATUS_VALUES = ['active', 'paused', 'completed', 'archived']

function normalizeStatus(val: string): Client['status'] {
  const v = val?.toLowerCase().trim()
  return (STATUS_VALUES.includes(v) ? v : 'active') as Client['status']
}

function parseRows(raw: Record<string, string>[]): ParsedRow[] {
  return raw
    .filter(r => {
      const name = r['full_name'] || r['name'] || ''
      return name.trim().length > 0
    })
    .map(r => ({
      full_name: (r['full_name'] || r['name'] || '').trim(),
      email: (r['email'] || '').trim(),
      phone: (r['phone'] || r['phone_number'] || '').trim(),
      package: (r['package'] || r['plan'] || '').trim(),
      status: normalizeStatus(r['status'] || 'active'),
      notes: (r['notes'] || r['note'] || '').trim(),
    }))
}

interface Props {
  open: boolean
  onClose: () => void
}

export function ClientImportDialog({ open, onClose }: Props) {
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [error, setError] = useState('')
  const [importing, setImporting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const createClient = useCreateClient()

  const handleFile = (file: File) => {
    setError('')
    setRows([])
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: h => h.toLowerCase().trim().replace(/\s+/g, '_'),
      complete: result => {
        if (result.errors.length > 0 && result.data.length === 0) {
          setError('Could not parse CSV. Please check the file format.')
          return
        }
        const parsed = parseRows(result.data)
        if (parsed.length === 0) {
          setError('No valid rows found. Make sure the CSV has a "name" or "full_name" column.')
          return
        }
        setRows(parsed)
      },
      error: err => setError(err.message),
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleImport = async () => {
    setImporting(true)
    let count = 0
    for (const row of rows) {
      try {
        await createClient.mutateAsync({
          ...row,
          goals: [],
          started_at: new Date().toISOString().split('T')[0],
        })
        count++
      } catch {
        // skip failed rows
      }
    }
    setImporting(false)
    toast.success(`Imported ${count} client${count !== 1 ? 's' : ''}`)
    setRows([])
    onClose()
  }

  const handleClose = () => {
    setRows([])
    setError('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Clients from CSV</DialogTitle>
        </DialogHeader>

        {rows.length === 0 ? (
          <div
            className="border-2 border-dashed rounded-lg p-10 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
            <p className="font-medium mb-1">Drop your CSV here or click to browse</p>
            <p className="text-sm text-muted-foreground">
              Columns: name (or full_name), email, phone, package, status, notes
            </p>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{rows.length} clients ready to import</span>
            </div>
            <div className="border rounded-lg overflow-auto max-h-64">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    {['Name', 'Email', 'Phone', 'Package', 'Status'].map(h => (
                      <th key={h} className="text-left px-3 py-2 font-medium text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-3 py-2 font-medium">{row.full_name}</td>
                      <td className="px-3 py-2 text-muted-foreground">{row.email || '—'}</td>
                      <td className="px-3 py-2 text-muted-foreground">{row.phone || '—'}</td>
                      <td className="px-3 py-2 text-muted-foreground">{row.package || '—'}</td>
                      <td className="px-3 py-2">
                        <Badge variant="outline" className="capitalize">{row.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-destructive text-sm p-3 rounded-lg bg-destructive/10">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleClose}>Cancel</Button>
          {rows.length > 0 && (
            <Button className="flex-1" onClick={handleImport} disabled={importing}>
              {importing ? 'Importing...' : `Import ${rows.length} Client${rows.length !== 1 ? 's' : ''}`}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
