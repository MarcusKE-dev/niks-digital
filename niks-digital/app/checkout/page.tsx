'use client'

import { useState }        from 'react'
import { useRouter }       from 'next/navigation'
import Link                from 'next/link'
import Image               from 'next/image'
import { useForm }         from 'react-hook-form'
import { zodResolver }     from '@hookform/resolvers/zod'
import axios               from 'axios'
import { useCartStore }    from '@/store/cartStore'
import { Navbar }          from '@/components/layout/Navbar'
import { Footer }          from '@/components/layout/Footer'
import { useToast }        from '@/components/ui/Toaster'
import { formatKES, productImageSrc, getDeliveryFee, qualifiesForFreeDelivery, normalizeMpesaPhone } from '@/lib/utils'
import { checkoutSchema, type CheckoutSchema } from '@/lib/validations'
import { DELIVERY_AREAS, FREE_DELIVERY_THRESHOLD } from '@/types'
import { cn } from '@/lib/utils'

type Step = 'form' | 'mpesa-waiting' | 'done'

export default function CheckoutPage() {
  const router     = useRouter()
  const toast      = useToast()
  const { items, subtotal, clearCart, totalItems } = useCartStore()
  const [step, setStep]       = useState<Step>('form')
  const [orderId, setOrderId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const sub = subtotal()
  const freeDelivery = qualifiesForFreeDelivery(sub)

  const form = useForm<CheckoutSchema>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customer_name:    '',
      customer_phone:   '',
      customer_email:   '',
      delivery_area:    '',
      delivery_address: '',
      notes:            '',
      payment_method:   'mpesa',
      mpesa_phone:      '',
    },
  })

  const watchArea   = form.watch('delivery_area')
  const watchMethod = form.watch('payment_method')
  const watchPhone  = form.watch('customer_phone')
  const fee         = freeDelivery ? 0 : getDeliveryFee(watchArea, sub)
  const total       = sub + fee

  if (items.length === 0 && step === 'form') {
    return (
      <>
        <Navbar />
        <main className="bg-surface min-h-screen py-16">
          <div className="container-site text-center">
            <p className="text-lg font-bold text-dark mb-4">Your cart is empty</p>
            <Link href="/shop" className="inline-flex h-11 px-6 bg-primary text-white font-semibold text-sm rounded-full items-center">Browse Products</Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  async function onSubmit(data: CheckoutSchema) {
    setLoading(true)
    try {
      // 1. Create order
      const orderRes = await axios.post('/api/orders/create', {
        ...data,
        delivery_fee: fee,
        items: items.map(i => ({
          product_id:    i.id,
          product_name:  i.name,
          product_image: i.thumbnail,
          quantity:      i.qty,
          unit_price:    i.price,
          total_price:   i.price * i.qty,
        })),
        subtotal: sub,
        total,
      })

      const { orderId: newOrderId } = orderRes.data
      setOrderId(newOrderId)

      // 2. M-Pesa
      if (data.payment_method === 'mpesa') {
        const phone = normalizeMpesaPhone(data.mpesa_phone || data.customer_phone)
        if (!phone) { toast.error('Invalid M-Pesa phone number'); setLoading(false); return }

        await axios.post('/api/mpesa/initiate', { orderId: newOrderId, phone, amount: total })
        setStep('mpesa-waiting')
        clearCart()
        // Poll for payment confirmation
        pollPayment(newOrderId)
      } else {
        clearCart()
        router.push(`/order-confirm/${newOrderId}`)
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  function pollPayment(id: string) {
    let attempts = 0
    const interval = setInterval(async () => {
      attempts++
      try {
        const { data } = await axios.get(`/api/orders/${id}/status`)
        if (data.payment_status === 'paid') {
          clearInterval(interval)
          router.push(`/order-confirm/${id}`)
        }
        if (data.payment_status === 'failed' || attempts >= 24) {
          clearInterval(interval)
          toast.error('Payment timed out. Please try again.')
          setStep('form')
          setLoading(false)
        }
      } catch { clearInterval(interval) }
    }, 5000)
  }

  // M-Pesa waiting screen
  if (step === 'mpesa-waiting') {
    return (
      <>
        <Navbar />
        <main className="bg-surface min-h-screen flex items-center justify-center py-16">
          <div className="bg-white border border-border rounded-xl p-10 max-w-md w-full text-center mx-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
              <span className="text-3xl">📱</span>
            </div>
            <h2 className="text-xl font-extrabold text-dark mb-2">Check Your Phone!</h2>
            <p className="text-sm text-muted leading-relaxed mb-6">
              An M-Pesa payment request has been sent to your phone.<br />
              <strong className="text-dark">Enter your M-Pesa PIN</strong> to complete your order of <strong className="text-primary">{formatKES(total)}</strong>.
            </p>
            <div className="flex justify-center mb-6">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-xs text-muted">Waiting for payment confirmation… (up to 2 minutes)</p>
            <button onClick={() => { setStep('form'); setLoading(false) }} className="mt-4 text-xs text-muted hover:text-primary underline">
              Cancel and go back
            </button>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const InputField = ({ name, label, type = 'text', placeholder, required = false }: any) => (
    <div className="mb-5">
      <label htmlFor={name} className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        {...form.register(name)}
        className={cn(
          'input-underline text-sm text-dark placeholder:text-gray-300',
          form.formState.errors[name as keyof CheckoutSchema] && 'border-b-danger'
        )}
      />
      {form.formState.errors[name as keyof CheckoutSchema] && (
        <p className="text-xs text-danger mt-1">{(form.formState.errors[name as keyof CheckoutSchema] as any)?.message}</p>
      )}
    </div>
  )

  return (
    <>
      <Navbar />
      <main className="bg-surface min-h-screen py-8">
        <div className="container-site max-w-5xl">
          <h1 className="text-2xl font-extrabold text-dark mb-6">Checkout</h1>

          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

              {/* ── FORM ── */}
              <div className="lg:col-span-2 space-y-5">

                {/* Contact */}
                <div className="bg-white border border-border rounded-xl p-6">
                  <h2 className="font-extrabold text-dark mb-5">1. Contact Information</h2>
                  <InputField name="customer_name"  label="Full Name"      placeholder="Jane Wanjiku" required />
                  <InputField name="customer_phone" label="Phone Number"   placeholder="0712 345 678" type="tel" required />
                  <InputField name="customer_email" label="Email Address"  placeholder="jane@example.com (optional)" type="email" />
                </div>

                {/* Delivery */}
                <div className="bg-white border border-border rounded-xl p-6">
                  <h2 className="font-extrabold text-dark mb-5">2. Delivery Details</h2>
                  <div className="mb-5">
                    <label htmlFor="delivery_area" className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                      Delivery Area <span className="text-danger">*</span>
                    </label>
                    <select id="delivery_area" {...form.register('delivery_area')}
                      className="input-underline text-sm text-dark bg-transparent">
                      <option value="">Select your area...</option>
                      {DELIVERY_AREAS.map(a => (
                        <option key={a.value} value={a.value}>
                          {a.label} {!freeDelivery && a.fee > 0 ? `(+${formatKES(a.fee)})` : a.fee === 0 ? '(Free)' : ''}
                        </option>
                      ))}
                    </select>
                    {form.formState.errors.delivery_area && (
                      <p className="text-xs text-danger mt-1">{form.formState.errors.delivery_area.message}</p>
                    )}
                  </div>
                  <div className="mb-5">
                    <label htmlFor="delivery_address" className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
                      Full Address <span className="text-danger">*</span>
                    </label>
                    <textarea id="delivery_address" rows={2} placeholder="House/flat number, estate name, street, nearest landmark…"
                      {...form.register('delivery_address')}
                      className="input-underline text-sm text-dark placeholder:text-gray-300 resize-none" />
                    {form.formState.errors.delivery_address && (
                      <p className="text-xs text-danger mt-1">{form.formState.errors.delivery_address.message}</p>
                    )}
                  </div>
                  <InputField name="notes" label="Order Notes" placeholder="Any special instructions for delivery? (optional)" />
                </div>

                {/* Payment */}
                <div className="bg-white border border-border rounded-xl p-6">
                  <h2 className="font-extrabold text-dark mb-5">3. Payment Method</h2>
                  <div className="space-y-3 mb-5">
                    {[
                      { value: 'mpesa', label: 'M-Pesa', icon: '📱', sub: 'STK Push to your phone — recommended' },
                      { value: 'card',  label: 'Debit / Credit Card', icon: '💳', sub: 'Visa, Mastercard via Flutterwave' },
                      { value: 'cash',  label: 'Cash on Delivery', icon: '💵', sub: 'Nairobi only · pay when delivered' },
                    ].map(opt => (
                      <label key={opt.value} className={cn(
                        'flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all',
                        watchMethod === opt.value ? 'border-primary bg-orange-50' : 'border-border hover:border-gray-300'
                      )}>
                        <input type="radio" value={opt.value} {...form.register('payment_method')} className="accent-primary" />
                        <span className="text-xl" aria-hidden>{opt.icon}</span>
                        <div>
                          <p className="text-sm font-bold text-dark">{opt.label}</p>
                          <p className="text-xs text-muted">{opt.sub}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  {watchMethod === 'mpesa' && (
                    <div className="bg-surface border border-border rounded-lg p-4">
                      <InputField name="mpesa_phone" label="M-Pesa Phone Number" placeholder={watchPhone || '0712 345 678'} type="tel" required />
                      <p className="text-xs text-muted -mt-3">An STK Push will be sent to this number. Enter your PIN to pay.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* ── ORDER SUMMARY ── */}
              <div className="bg-white border border-border rounded-xl p-5 sticky top-24">
                <h2 className="font-extrabold text-dark mb-4">Order Summary</h2>
                <div className="space-y-3 mb-4">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-3 items-start">
                      <div className="w-12 h-12 rounded-lg bg-surface border border-border flex-shrink-0 overflow-hidden">
                        <Image src={productImageSrc(item.thumbnail)} alt={item.name} width={48} height={48} className="w-full h-full object-contain p-1" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-dark line-clamp-2 leading-snug">{item.name}</p>
                        <p className="text-xs text-muted mt-0.5">Qty: {item.qty}</p>
                      </div>
                      <p className="text-xs font-bold text-dark flex-shrink-0">{formatKES(item.price * item.qty)}</p>
                    </div>
                  ))}
                </div>
                <hr className="border-border mb-3" />
                <div className="space-y-2 text-sm mb-3">
                  <div className="flex justify-between"><span className="text-muted">Subtotal</span><span className="font-semibold">{formatKES(sub)}</span></div>
                  <div className="flex justify-between"><span className="text-muted">Delivery</span><span className={freeDelivery ? 'text-success font-semibold' : 'font-semibold'}>{freeDelivery ? 'FREE' : formatKES(fee)}</span></div>
                </div>
                <hr className="border-border mb-3" />
                <div className="flex justify-between font-extrabold text-dark mb-5">
                  <span>Total</span><span className="text-lg text-primary">{formatKES(total)}</span>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full h-12 bg-primary text-white font-bold text-sm rounded-full flex items-center justify-center gap-2 hover:bg-primary-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-btn-primary">
                  {loading
                    ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
                    : '🔒 Place Order'
                  }
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  )
}
