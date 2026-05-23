import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { createSupabaseServer } from '@/lib/supabase-server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { formatKES, formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Order Confirmed' }

interface PageProps { params: { id: string } }

export default async function OrderConfirmPage({ params }: PageProps) {
  const supabase = createSupabaseServer()
  const { data: order } = await supabase
    .from('orders')
    .select('*,order_items(*)')
    .eq('id', params.id)
    .single()

  if (!order) notFound()

  const items = order.order_items ?? []

  return (
    <>
      <Navbar />
      <main className="bg-surface min-h-screen py-10">
        <div className="container-site max-w-2xl">
          {/* Success header */}
          <div className="bg-white border border-border rounded-xl p-8 text-center mb-5">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold text-dark mb-1">Order Confirmed!</h1>
            <p className="text-sm text-muted mb-3">
              Thank you, <strong className="text-dark">{order.customer_name}</strong>. Your order has been received.
            </p>
            <div className="inline-flex items-center gap-2 bg-surface border border-border rounded-full px-4 py-2">
              <span className="text-xs text-muted">Order Number</span>
              <span className="text-sm font-extrabold text-dark">{order.order_number}</span>
            </div>
          </div>

          {/* What's next */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mb-5 text-sm text-dark">
            <p className="font-bold mb-1">What happens next?</p>
            <p className="text-muted leading-relaxed">
              Our team will call you on <strong className="text-dark">{order.customer_phone}</strong> within 1 hour to confirm delivery details and timing.
            </p>
          </div>

          {/* Order details */}
          <div className="bg-white border border-border rounded-xl overflow-hidden mb-5">
            <div className="p-5 border-b border-border">
              <h2 className="font-extrabold text-dark">Order Details</h2>
              <p className="text-xs text-muted mt-0.5">{formatDate(order.created_at)}</p>
            </div>
            <div className="divide-y divide-border">
              {items.map((item: any) => (
                <div key={item.id} className="flex gap-3 p-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-dark">{item.product_name}</p>
                    <p className="text-xs text-muted mt-0.5">
                      Qty: {item.quantity} × {formatKES(item.unit_price)}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-dark">{formatKES(item.total_price)}</p>
                </div>
              ))}
            </div>
            <div className="p-4 bg-surface border-t border-border space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Subtotal</span><span>{formatKES(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Delivery</span>
                <span>As Confirmed</span>
              </div>
              <div className="flex justify-between font-extrabold text-dark pt-1 border-t border-border">
                <span>Total</span><span className="text-primary">{formatKES(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Delivery + payment info */}
          <div className="bg-white border border-border rounded-xl p-5 mb-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted mb-1.5">Delivery To</p>
              <p className="text-dark font-medium">{order.customer_name}</p>
              <p className="text-muted text-xs mt-0.5 leading-snug">{order.delivery_address}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted mb-1.5">Payment</p>
              <p className="text-dark font-medium capitalize">{order.payment_method}</p>
              <p className={`text-xs mt-0.5 font-medium capitalize ${order.payment_status === 'paid' ? 'text-success' : 'text-warning'}`}>
                {order.payment_status}
              </p>
              {order.mpesa_receipt && <p className="text-xs text-muted mt-0.5">Ref: {order.mpesa_receipt}</p>}
            </div>
          </div>

          {/* Track on WhatsApp */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mb-5">
            <p className="font-bold text-dark mb-1">📦 Track Your Order</p>
            <p className="text-sm text-muted leading-relaxed mb-3">
              Your order number is <strong className="text-dark font-mono">{order.order_number}</strong>.
              Send this number on WhatsApp to get live updates on your order status.
            </p>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=Hi! I'd like to track my order. Order number: ${order.order_number}`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-11 px-4 bg-green-500 text-white font-semibold text-sm rounded-full flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
            >
              💬 Track on WhatsApp
            </a>
          </div>

          {/* Back Home button */}
          <Link
            href="/"
            className="h-11 px-4 bg-primary text-white font-semibold text-sm rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors"
          >
            Back Home
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}