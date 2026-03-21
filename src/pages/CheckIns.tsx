import { Bell } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useClients } from '@/hooks/useClients'
import { getInitials } from '@/lib/utils'

export function CheckIns() {
  const { data: clients } = useClients()
  const activeClients = clients?.filter(c => c.status === 'active') ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Check-ins</h1>
        <p className="text-muted-foreground mt-1">Stay connected with your clients between sessions.</p>
      </div>

      {activeClients.length === 0 ? (
        <div className="text-center py-16">
          <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No active clients</h3>
          <p className="text-muted-foreground">Add clients to start sending check-ins.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeClients.map(client => (
            <Card key={client.id}>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{getInitials(client.full_name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{client.full_name}</p>
                    <Badge variant="outline" className="text-xs">Active</Badge>
                  </div>
                </div>
                <Button size="sm" className="w-full gap-2" variant="outline">
                  <Bell className="w-3 h-3" /> Send Check-in
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
