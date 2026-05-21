// ════════════════════════════════════════════════════════════
// ZOD VALIDATION SCHEMAS
// Used with React Hook Form via @hookform/resolvers/zod
//
// Usage in a form:
//   import { checkoutSchema } from '@/lib/validations'
//   const form = useForm({ resolver: zodResolver(checkoutSchema) })
// ════════════════════════════════════════════════════════════

import { z } from 'zod'
import { DELIVERY_AREAS } from '@/types'

// Delivery area values for Zod enum
const deliveryAreaValues = DELIVERY_AREAS.map(a => a.value) as [string, ...string[]]

// ── HELPERS ──────────────────────────────────────────────────

// Kenyan phone number validator
const kenyanPhone = z
  .string()
  .min(10, 'Phone number must be at least 10 digits')
  .max(15, 'Phone number is too long')
  .regex(
    /^(\+?254|0)[17]\d{8}$/,
    'Enter a valid Kenyan phone number (e.g. 0712345678)'
  )

// Price field — must be a positive number
const positivePrice = z
  .number({ invalid_type_error: 'Enter a valid price' })
  .positive('Price must be greater than 0')
  .max(10_000_000, 'Price seems too high — double check')

// ── CHECKOUT FORM ────────────────────────────────────────────

export const checkoutSchema = z
  .object({
    customer_name: z
      .string()
      .min(2, 'Please enter your full name')
      .max(100, 'Name is too long'),

    customer_phone: kenyanPhone,

    customer_email: z
      .string()
      .email('Enter a valid email address')
      .or(z.literal(''))      // email is optional
      .optional(),

    delivery_area: z
      .enum(deliveryAreaValues as [string, ...string[]], {
        errorMap: () => ({ message: 'Please select a delivery area' }),
      }),

    delivery_address: z
      .string()
      .min(10, 'Please enter your full delivery address (estate, house no., street)')
      .max(500, 'Address is too long'),

    notes: z.string().max(500, 'Notes are too long').optional(),

    payment_method: z.enum(['mpesa', 'card', 'cash'], {
      errorMap: () => ({ message: 'Please select a payment method' }),
    }),

    mpesa_phone: kenyanPhone,
  })
  .refine(
    // mpesa_phone is required when payment method is mpesa
    data => {
      if (data.payment_method === 'mpesa') {
        return !!data.mpesa_phone
      }
      return true
    },
    {
      message: 'Please enter the M-Pesa phone number to receive the STK push',
      path: ['mpesa_phone'],
    }
  )

export type CheckoutSchema = z.infer<typeof checkoutSchema>

// ── CONTACT FORM ─────────────────────────────────────────────

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, 'Please enter your name')
    .max(100, 'Name is too long'),

  email: z.string().email('Enter a valid email address'),

  phone: z
    .string()
    .max(15)
    .optional()
    .or(z.literal('')),

  message: z
    .string()
    .min(10, 'Please enter a message (at least 10 characters)')
    .max(2000, 'Message is too long'),
})

export type ContactSchema = z.infer<typeof contactSchema>

// ── PRODUCT FORM (Admin) ──────────────────────────────────────

export const productSchema = z.object({
  name: z
    .string()
    .min(3, 'Product name must be at least 3 characters')
    .max(200, 'Name is too long'),

  slug: z
    .string()
    .min(3)
    .max(200)
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),

  category_id: z.string().uuid('Please select a category'),

  brand: z.string().max(100, 'Brand name is too long').optional(),

  sku: z.string().max(50, 'SKU is too long').optional(),

  price: positivePrice,

  old_price: z
    .number()
    .positive('Old price must be greater than 0')
    .optional()
    .nullable()
    .refine(val => val === null || val === undefined || val > 0, {
      message: 'Old price must be greater than 0',
    }),

  stock_qty: z
    .number({ invalid_type_error: 'Enter a valid stock quantity' })
    .int('Stock quantity must be a whole number')
    .min(0, 'Stock cannot be negative')
    .max(99999),

  description: z
    .string()
    .min(20, 'Please write a meaningful description (at least 20 characters)')
    .max(5000, 'Description is too long'),

  features: z
    .array(z.string().min(2).max(200))
    .min(1, 'Add at least one product feature')
    .max(20, 'Maximum 20 features allowed'),

  badge: z
    .enum(['new', 'sale', 'hot'])
    .nullable()
    .optional(),

  is_featured: z.boolean(),

  is_active: z.boolean(),

  weight_kg: z
    .number()
    .positive()
    .max(1000)
    .optional()
    .nullable(),

  images: z
    .array(z.string().url('Each image must be a valid URL'))
    .min(1, 'Please upload at least one product image')
    .max(6, 'Maximum 6 images per product'),
})

export type ProductSchema = z.infer<typeof productSchema>

// ── CATEGORY FORM (Admin) ────────────────────────────────────

export const categorySchema = z.object({
  name: z
    .string()
    .min(2, 'Category name must be at least 2 characters')
    .max(100, 'Name is too long'),

  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),

  description: z.string().max(500).optional(),

  icon: z.string().max(10, 'Use an emoji or short icon name').optional(),

  display_order: z.number().int().min(0).max(100),
})

export type CategorySchema = z.infer<typeof categorySchema>

// ── ADMIN LOGIN ───────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export type LoginSchema = z.infer<typeof loginSchema>

// ── ORDER STATUS UPDATE (Admin) ───────────────────────────────

export const orderStatusSchema = z.object({
  order_status: z.enum(
    ['new', 'confirmed', 'packed', 'dispatched', 'delivered', 'cancelled'],
    { errorMap: () => ({ message: 'Invalid order status' }) }
  ),
  notes: z.string().max(500).optional(),
})

export type OrderStatusSchema = z.infer<typeof orderStatusSchema>
