import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin }             from '@/lib/supabase-admin'
import { requireAdmin }              from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  // Status polling is called by the customer's browser — no admin check needed here
  const { data } = await supabaseAdmin
    .from('orders')
    .select('id,payment_status,order_status')
    .eq('id', params.id)
    .single()

  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}