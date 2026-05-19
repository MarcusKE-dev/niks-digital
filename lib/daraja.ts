// ════════════════════════════════════════════════════════════
// DARAJA API — M-Pesa STK Push helper
// All functions are server-side only (called from API routes).
// ════════════════════════════════════════════════════════════

import axios from 'axios'
import { normalizeMpesaPhone } from '@/lib/utils'

const ENV        = process.env.DARAJA_ENVIRONMENT ?? 'sandbox'
const BASE_URL   = ENV === 'production'
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke'

const CONSUMER_KEY    = process.env.DARAJA_CONSUMER_KEY!
const CONSUMER_SECRET = process.env.DARAJA_CONSUMER_SECRET!
const SHORTCODE       = process.env.DARAJA_SHORTCODE!
const PASSKEY         = process.env.DARAJA_PASSKEY!
const CALLBACK_URL    = process.env.DARAJA_CALLBACK_URL!

// ── GET ACCESS TOKEN ─────────────────────────────────────────

export async function getDarajaToken(): Promise<string> {
  const credentials = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64')

  const { data } = await axios.get(
    `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${credentials}` } }
  )

  return data.access_token as string
}

// ── STK PUSH ─────────────────────────────────────────────────

export interface StkPushParams {
  phone:        string   // customer phone in 254XXXXXXXXX format
  amount:       number   // KES amount (integer)
  orderNumber:  string   // shown on customer's phone, e.g. NDC-2026-0042
}

export interface StkPushResult {
  success:            boolean
  checkoutRequestId?: string
  merchantRequestId?: string
  error?:             string
}

export async function initiateStkPush(params: StkPushParams): Promise<StkPushResult> {
  try {
    const phone = normalizeMpesaPhone(params.phone)
    if (!phone) {
      return { success: false, error: 'Invalid phone number format' }
    }

    const token     = await getDarajaToken()
    const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14)
    const password  = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString('base64')

    const payload = {
      BusinessShortCode: SHORTCODE,
      Password:          password,
      Timestamp:         timestamp,
      TransactionType:   'CustomerPayBillOnline',
      Amount:            Math.ceil(params.amount),   // Daraja requires integer
      PartyA:            phone,
      PartyB:            SHORTCODE,
      PhoneNumber:       phone,
      CallBackURL:       CALLBACK_URL,
      AccountReference:  params.orderNumber,
      TransactionDesc:   `Niks Digital - ${params.orderNumber}`,
    }

    const { data } = await axios.post(
      `${BASE_URL}/mpesa/stkpush/v1/processrequest`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    if (data.ResponseCode === '0') {
      return {
        success:            true,
        checkoutRequestId:  data.CheckoutRequestID,
        merchantRequestId:  data.MerchantRequestID,
      }
    }

    return { success: false, error: data.ResponseDescription ?? 'STK Push failed' }

  } catch (err: any) {
    console.error('[Daraja] STK Push error:', err?.response?.data ?? err.message)
    return {
      success: false,
      error:   err?.response?.data?.errorMessage ?? 'Failed to initiate M-Pesa payment',
    }
  }
}

// ── PARSE CALLBACK ────────────────────────────────────────────
// Extracts receipt number and amount from Safaricom's callback body.

export interface CallbackResult {
  success:       boolean
  receiptNumber?: string
  amount?:        number
  phone?:         string
  checkoutId:    string
}

export function parseDarajaCallback(body: any): CallbackResult {
  const callback  = body?.Body?.stkCallback
  const checkoutId = callback?.CheckoutRequestID ?? ''

  if (!callback || callback.ResultCode !== 0) {
    return { success: false, checkoutId }
  }

  const items = callback.CallbackMetadata?.Item ?? []
  const get   = (name: string) => items.find((i: any) => i.Name === name)?.Value

  return {
    success:       true,
    checkoutId,
    receiptNumber: get('MpesaReceiptNumber'),
    amount:        get('Amount'),
    phone:         get('PhoneNumber')?.toString(),
  }
}
