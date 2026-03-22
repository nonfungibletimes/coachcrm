import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { redirectToCheckout } from '@/lib/stripe'

export function CheckoutPage() {
  const [params] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const plan = (params.get('plan') as 'starter' | 'pro' | 'agency') || 'pro'
  const interval = (params.get('interval') as 'monthly' | 'annual') || 'monthly'

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader><CardTitle>Checkout</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p>Plan: <strong className="capitalize">{plan}</strong> ({interval})</p>
          <Button className="w-full" disabled={loading} onClick={async () => {
            setLoading(true)
            try { await redirectToCheckout({ plan, interval }) } finally { setLoading(false) }
          }}>
            {loading ? 'Redirecting...' : 'Continue to Stripe'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
