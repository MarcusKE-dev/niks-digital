'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toaster'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

export function DeleteOrderButton({ orderId, orderNumber }: { orderId: string; orderNumber: string }) {
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()
  const toast = useToast()

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/delete`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete')
      toast.success(`Order ${orderNumber} deleted`)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setDeleting(false)
      setOpen(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        disabled={deleting}
        className="text-xs text-danger hover:underline font-medium disabled:opacity-50"
      >
        {deleting ? '...' : 'Delete'}
      </button>

      <ConfirmDialog
        isOpen={open}
        title="Delete Order"
        message={`Delete ${orderNumber}? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setOpen(false)}
      />
    </>
  )
}
