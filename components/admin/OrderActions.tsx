'use client'

import { useState }        from 'react'
import { useRouter }       from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase'
import { useToast }        from '@/components/ui/Toaster'
import { formatKES, getOrderStatusLabel, getPaymentStatusColor } from '@/lib/utils'
import type { OrderStatus, PaymentStatus } from '@/types'

const WHATSAPP_MESSAGES: Record<string, string> = {
  confirmed:  'Hi {name}! Your order {order} has been confirmed. We are preparing it now.',
  packed:     'Hi {name}! Great news — your order {order} has been packed and is ready for dispatch.',
  dispatched: 'Hi {name}! Your order {order} is on the way! Our team will deliver it to you shortly.',
  delivered:  'Hi {name}! Your order {order} has been delivered. Thank you for shopping with Niks Digital Connections! 🙏',
  cancelled:  'Hi {name}, your order {order} has been cancelled. Please contact us if you have any questions.',
}

interface Props {
  order: any
}

export function OrderActions({ order }: Props) {
  const router  = useRouter()
  const toast   = useToast()

  const [status,        setStatus]        = useState<OrderStatus>(order.order_status)
  const [payStatus,     setPayStatus]     = useState<PaymentStatus>(order.payment_status)
  const [mpesaReceipt,  setMpesaReceipt]  = useState(order.mpesa_receipt ?? '')
  const [saving,        setSaving]        = useState(false)
  const [deleting,      setDeleting]      = useState(false)

  // Get WhatsApp message for current status
  const waMessage = (WHATSAPP_MESSAGES[status] ?? '')
    .replace('{name}', order.customer_name.split(' ')[0])
    .replace('{order}', order.order_number)

  const waPhone = order.customer_phone.replace(/\D/g, '').replace(/^0/, '254')

  async function handleUpdateStatus() {
    setSaving(true)
    const { error } = await supabaseBrowser
      .from('orders')
      .update({ order_status: status })
      .eq('id', order.id)
    setSaving(false)
    if (error) { toast.error('Failed to update status'); return }
    toast.success('Order status updated!')
    router.refresh()
  }

  async function handleUpdatePayment() {
    setSaving(true)
    const { error } = await supabaseBrowser
      .from('orders')
      .update({
        payment_status: payStatus,
        mpesa_receipt:  mpesaReceipt || null,
      })
      .eq('id', order.id)
    setSaving(false)
    if (error) { toast.error('Failed to update payment'); return }
    toast.success('Payment status updated!')
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm(`Delete order ${order.order_number}? This cannot be undone.`)) return
    setDeleting(true)
    const { error } = await supabaseBrowser
      .from('orders')
      .delete()
      .eq('id', order.id)
    if (error) { toast.error('Failed to delete order'); setDeleting(false); return }
    toast.success('Order deleted')
    router.push('/admin/orders')
  }

  return (
    <>
      {/* Order Status */}
      <div className="bg-white border border-border rounded-xl p-5">
        <h2 className="font-extrabold text-dark mb-4">Update Status</h2>
        <select
          value={status}
          onChange={e => setStatus(e.target.value as OrderStatus)}
          className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary bg-white mb-3"
        >
          {['new','confirmed','packed','dispatched','delivered','cancelled'].map(s => (
            <option key={s} value={s}>{getOrderStatusLabel(s as OrderStatus)}</option>
          ))}
        </select>
        <button onClick={handleUpdateStatus} disabled={saving || status === order.order_status}
          className="w-full h-10 bg-dark text-white font-semibold text-sm rounded-full hover:bg-dark-400 disabled:opacity-50 transition-colors">
          {saving ? 'Saving...' : 'Update Status'}
        </button>
      </div>

      {/* Payment Status */}
      <div className="bg-white border border-border rounded-xl p-5">
        <h2 className="font-extrabold text-dark mb-4">Payment</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
              Payment Status
            </label>
            <select
              value={payStatus}
              onChange={e => setPayStatus(e.target.value as PaymentStatus)}
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary bg-white"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid ✓</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
              Receipt / Reference
            </label>
            <input
              value={mpesaReceipt}
              onChange={e => setMpesaReceipt(e.target.value)}
              placeholder="M-Pesa receipt or cash ref"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <button onClick={handleUpdatePayment} disabled={saving}
            className="w-full h-10 bg-primary text-white font-semibold text-sm rounded-full hover:bg-primary-600 disabled:opacity-50 transition-colors">
            Update Payment
          </button>
        </div>
        {order.mpesa_receipt && (
          <p className="text-xs text-muted mt-2">Current ref: <span className="font-mono text-dark">{order.mpesa_receipt}</span></p>
        )}
      </div>

      {/* WhatsApp customer with pre-filled message */}
      <div className="bg-white border border-border rounded-xl p-5">
        <h2 className="font-extrabold text-dark mb-3">Message Customer</h2>
        <p className="text-xs text-muted mb-3 leading-relaxed">
          Send this message for current status <strong className="text-dark capitalize">({status})</strong>:
        </p>
        <div className="bg-surface rounded-lg p-3 text-xs text-dark leading-relaxed mb-3 border border-border">
          {waMessage || 'No template for this status.'}
        </div>
        {waMessage && (
          <a
            href={`https://wa.me/${waPhone}?text=${encodeURIComponent(waMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full h-10 bg-green-500 text-white text-sm font-semibold rounded-full hover:bg-green-600 transition-colors"
          >
            💬 Send on WhatsApp
          </a>
        )}
      </div>

      {/* Delete order */}
      <div className="bg-white border border-red-100 rounded-xl p-5">
        <h2 className="font-extrabold text-dark mb-2">Danger Zone</h2>
        <p className="text-xs text-muted mb-3">Permanently delete this order. Cannot be undone.</p>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="w-full h-10 border border-danger text-danger text-sm font-semibold rounded-full hover:bg-red-50 disabled:opacity-50 transition-colors"
        >
          {deleting ? 'Deleting...' : '🗑 Delete Order'}
        </button>
      </div>
    </>
  )
}