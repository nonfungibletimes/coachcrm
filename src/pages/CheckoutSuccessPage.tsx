import { Link, useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function CheckoutSuccessPage() {
  const [params] = useSearchParams()
  const plan = params.get('plan') ?? 'pro'

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader><CardTitle>Payment successful 🎉</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p>Your <strong className="capitalize">{plan}</strong> plan is now active.</p>
          <Link to="/settings"><Button className="w-full">Go to Settings</Button></Link>
        </CardContent>
      </Card>
    </div>
  )
}
