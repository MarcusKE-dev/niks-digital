'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabaseBrowser } from '@/lib/supabase'
import { formatKES, formatDate, getOrderStatusColor, getOrderStatusLabel, getPaymentStatusColor } from '@/lib/utils'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

export default function AdminOrdersPage({ searchParams }: { searchParams: { status?: string } }) {
  const [orders, setOrders] = useState<any[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const activeStatus = searchParams.status ?? 'all'

  useEffect(() => {
    async function fetchOrders() {
      let query = supabaseBrowser
        .from('orders')
        .select('id,order_number,customer_name,customer_phone,total,payment_method,payment_status,order_status,created_at')
        .order('created_at', { ascending: false })

      if (activeStatus !== 'all') {
        query = query.eq('order_status', activeStatus)
      }
      const { data } = await query.limit(100)
      setOrders(data ?? [])
      setLoading(false)
    }
    fetchOrders()
  }, [activeStatus])

  const TABS = ['all', 'new', 'confirmed', 'packed', 'dispatched', 'delivered', 'cancelled']

  const toggleSelectAll = () => {
    if (selected.size === orders.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(orders.map(o => o.id)))
    }
  }

  const toggleSelect = (id: string) => {
    const newSet = new Set(selected)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelected(newSet)
  }

  const handleBulkDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch('/api/admin/orders/delete-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selected) }),
      })
      if (!res.ok) throw new Error('Delete failed')
      // Refresh orders
      let query = supabaseBrowser
        .from('orders')
        .select('id,order_number,customer_name,customer_phone,total,payment_method,payment_status,order_status,created_at')
        .order('created_at', { ascending: false })
      if (activeStatus !== 'all') query = query.eq('order_status', activeStatus)
      const { data } = await query.limit(100)
      setOrders(data ?? [])
      setSelected(new Set())
    } catch (err) {
      alert('Failed to delete orders')
    } finally {
      setDeleting(false)
      setConfirmOpen(false)
    }
  }

  if (loading) return <div className="p-8 text-center">Loading orders...</div>

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-dark">Orders</h1>
        {selected.size > 0 && (
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={deleting}
            className="h-10 px-5 bg-danger text-white text-sm font-semibold rounded-full hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : `Delete ${selected.size} selected`}
          </button>
        )}
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto scrollbar-hide">
        {TABS.map(tab => (
          <Link
            key={tab}
            href={`/admin/orders${tab !== 'all' ? `?status=${tab}` : ''}`}
            className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap capitalize border-b-2 -mb-px transition-colors ${
              activeStatus === tab ? 'text-dark border-primary' : 'text-muted border-transparent hover:text-dark'
            }`}
          >
            {tab === 'all' ? 'All Orders' : getOrderStatusLabel(tab as any)}
          </Link>
        ))}
      </div>

      <div className="bg-white border border-border rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted w-8">
                <input
                  type="checkbox"
                  checked={selected.size === orders.length && orders.length > 0}
                  onChange={toggleSelectAll}
                  className="accent-primary"
                />
              </th>
              {['Order #','Customer','Phone','Total','Payment','Status','Date','Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-surface transition-colors">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(order.id)}
                    onChange={() => toggleSelect(order.id)}
                    className="accent-primary"
                  />
                </td>
                <td className="px-4 py-3 font-bold text-dark">{order.order_number}</td>
                <td className="px-4 py-3 text-dark">{order.customer_name}</td>
                <td className="px-4 py-3 text-muted">{order.customer_phone}</td>
                <td className="px-4 py-3 font-semibold text-dark">{formatKES(order.total)}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${getPaymentStatusColor(order.payment_status)}`}>
                    {order.payment_status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${getOrderStatusColor(order.order_status)}`}>
                    {getOrderStatusLabel(order.order_status)}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted text-xs">{formatDate(order.created_at)}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="text-xs text-primary hover:underline font-medium">
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="text-center py-12 text-muted text-sm">No orders found.</p>}
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Bulk Delete"
        message={`Delete ${selected.size} order(s)? This action cannot be undone.`}
        confirmLabel="Yes, Delete"
        variant="danger"
        onConfirm={handleBulkDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}