import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  const { ids } = await req.json()
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'No order IDs provided' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('orders')
    .delete()
    .in('id', ids)

  if (error) {
    console.error('[Bulk Delete]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true, count: ids.length })
}
