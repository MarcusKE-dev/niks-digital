import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const orderId = params.id
  const { error } = await supabaseAdmin
    .from('orders')
    .delete()
    .eq('id', orderId)

  if (error) {
    console.error('[Delete Order]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
