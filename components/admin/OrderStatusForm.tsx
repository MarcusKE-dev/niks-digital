'use client'

import { useState }        from 'react'
import { useRouter }       from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase'
import { useToast }        from '@/components/ui/Toaster'
import { getOrderStatusLabel } from '@/lib/utils'
import type { OrderStatus } from '@/types'

const STATUSES: OrderStatus[] = ['new','confirmed','packed','dispatched','delivered','cancelled']

export function OrderStatusForm({ orderId, currentStatus }: { orderId: string; currentStatus: OrderStatus }) {
  const [status,  setStatus]  = useState<OrderStatus>(currentStatus)
  const [saving,  setSaving]  = useState(false)
  const router = useRouter()
  const toast  = useToast()

  async function handleUpdate() {
    setSaving(true)
    const { error } = await supabaseBrowser
      .from('orders')
      .update({ order_status: status })
      .eq('id', orderId)
    setSaving(false)
    if (error) { toast.error('Failed to update status'); return }
    toast.success('Order status updated!')
    router.refresh()
  }

  return (
    <div className="space-y-3">
      <select
        value={status}
        onChange={e => setStatus(e.target.value as OrderStatus)}
        className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary bg-white"
        aria-label="Order status"
      >
        {STATUSES.map(s => (
          <option key={s} value={s}>{getOrderStatusLabel(s)}</option>
        ))}
      </select>
      <button
        onClick={handleUpdate}
        disabled={saving || status === currentStatus}
        className="w-full h-10 bg-dark text-white font-semibold text-sm rounded-full flex items-center justify-center gap-2 hover:bg-dark-400 disabled:opacity-50 transition-colors"
      >
        {saving
          ? <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
          : 'Update Status'
        }
      </button>
    </div>
  )
}
