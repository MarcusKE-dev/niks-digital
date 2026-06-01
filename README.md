# Niks Digital Connection — E-Commerce Platform

**Powering Modern Homes with Smart Electronics & Appliances.**
Full-stack Next.js 14 e-commerce site for Niks Digital Connection, Nairobi.

---

## Tech Stack

| Layer       | Tool                          |
|-------------|-------------------------------|
| Frontend    | Next.js 14 (App Router) + TypeScript |
| Styling     | Tailwind CSS                  |
| Database    | Supabase (PostgreSQL)         |
| Auth        | Supabase Auth                 |
| Storage     | Supabase Storage              |
| Cart State  | Zustand (persisted)           |
| Forms       | React Hook Form + Zod         |
| Payments    | Daraja API (M-Pesa STK Push)  |
| Hosting     | Vercel (free tier)            |

---

## Project Structure

```
niks-digital/
├── app/
│   ├── page.tsx                    # Homepage
│   ├── layout.tsx                  # Root layout + metadata
│   ├── globals.css                 # Global styles
│   ├── not-found.tsx               # 404 page
│   ├── shop/
│   │   ├── page.tsx                # Shop listing + filters
│   │   └── [slug]/page.tsx         # Product detail
│   ├── cart/page.tsx               # Cart page
│   ├── checkout/page.tsx           # Checkout + M-Pesa
│   ├── order-confirm/[id]/page.tsx # Order confirmation
│   ├── admin/
│   │   ├── layout.tsx              # Admin sidebar layout
│   │   ├── login/page.tsx          # Admin sign in
│   │   ├── page.tsx                # Dashboard
│   │   ├── products/page.tsx       # Products list
│   │   ├── products/new/page.tsx   # Add product
│   │   ├── products/[id]/edit/     # Edit product
│   │   └── orders/                 # Orders list + detail
│   └── api/
│       ├── orders/create/          # POST — create order
│       ├── orders/[id]/status/     # GET  — poll payment status
│       ├── mpesa/initiate/         # POST — STK push
│       ├── mpesa/callback/         # POST — Safaricom webhook
│       └── admin/logout/           # POST — sign out
├── components/
│   ├── layout/   Navbar, Footer, MobileMenu
│   ├── shop/     ProductCard, ProductDetailClient, StarRating,
│   │             FeaturedProductTabs
│   ├── admin/    OrderStatusForm
│   └── ui/       Button, Badge, Skeleton, Toaster
├── lib/
│   ├── supabase.ts     # Browser, server, admin clients
│   ├── utils.ts        # formatKES, cn, normalizeMpesaPhone…
│   ├── validations.ts  # Zod schemas
│   └── daraja.ts       # M-Pesa STK Push API
├── store/
│   └── cartStore.ts    # Zustand cart (localStorage)
├── types/
│   └── index.ts        # All TypeScript interfaces
├── supabase/
│   ├── migrations/001_initial_schema.sql
│   └── seed.sql
└── middleware.ts       # Auth protection for /admin
```

---

## Setup — Step by Step

### 1. Install dependencies

```bash
npm install
```

### 2. Create Supabase project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Choose a region close to Kenya (e.g. `eu-west-2` or `af-south-1`)
3. Save your database password

### 3. Run database migrations

1. In Supabase dashboard → **SQL Editor**
2. Paste contents of `supabase/migrations/001_initial_schema.sql` → **Run**
3. Paste contents of `supabase/seed.sql` → **Run**
4. Confirm: `category_count = 8`, `product_count = 24`

### 4. Set environment variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

```env
# Supabase — from supabase.com → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Daraja — from developer.safaricom.co.ke
DARAJA_CONSUMER_KEY=...
DARAJA_CONSUMER_SECRET=...
DARAJA_SHORTCODE=174379
DARAJA_PASSKEY=...
DARAJA_CALLBACK_URL=https://your-site.vercel.app/api/mpesa/callback
DARAJA_ENVIRONMENT=sandbox

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_WHATSAPP_NUMBER=254798946124
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Admin Panel Setup

### Create admin user

1. Go to Supabase → **Authentication → Users** → Invite user
2. Use email: `admin@niksdigital.co.ke`
3. Set a strong password

### Access admin panel

Go to `/admin/login` and sign in with the credentials above.

**Admin capabilities:**
- ✅ Add, edit, delete products
- ✅ Upload product images to Supabase Storage
- ✅ Update order statuses
- ✅ View all orders and revenue
- ✅ Monitor low stock alerts
- ✅ WhatsApp customers directly from order detail

---

## M-Pesa Integration

### Sandbox (testing)

Use these test credentials from Safaricom Daraja sandbox:
- **Test phone:** `254708374149`
- **Test PIN:** `1234`

The STK push will appear on the test phone number. In sandbox mode, payment is simulated.

### Production checklist

- [ ] Apply for M-Pesa Go Live on [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
- [ ] Get a Paybill or Till number from Safaricom
- [ ] Update `.env.local`: `DARAJA_ENVIRONMENT=production`
- [ ] Update `DARAJA_CALLBACK_URL` to your live Vercel URL
- [ ] Update `DARAJA_SHORTCODE` and `DARAJA_PASSKEY` to production values

---

## Deployment to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables on Vercel dashboard or via CLI:
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# ... (add all variables from .env.local)
```

### After deploying:

1. Update `NEXT_PUBLIC_SITE_URL` to your Vercel URL
2. Update `DARAJA_CALLBACK_URL` to `https://your-site.vercel.app/api/mpesa/callback`
3. Add your Vercel URL to Supabase → **Authentication → URL Configuration → Site URL**

---

## Replacing Placeholder Images

All product images currently use `picsum.photos` placeholders.

**To replace with real images:**

1. Go to `/admin/products`
2. Click **Edit** on any product
3. Upload real product photos (JPG/PNG/WebP, max 5MB each)
4. The first uploaded image becomes the main thumbnail
5. Save — images are stored in Supabase Storage and served via CDN

---

## Adding New Products

Via the admin panel (no coding):

1. `/admin/products` → **+ Add Product**
2. Fill in name, category, price, stock quantity
3. Upload product images
4. Add key features (bullet points shown on product page)
5. Toggle **Active** to make it visible in the shop
6. Save

---

## Customising for Go-Live

| What to change          | Where                         |
|-------------------------|-------------------------------|
| Business phone numbers  | `components/layout/Footer.tsx` + `Navbar.tsx` |
| WhatsApp number         | `.env.local` → `NEXT_PUBLIC_WHATSAPP_NUMBER` |
| Business address        | `components/layout/Footer.tsx` |
| Delivery areas + fees   | `types/index.ts` → `DELIVERY_AREAS` |
| Free delivery threshold | `types/index.ts` → `FREE_DELIVERY_THRESHOLD` |
| Brand name/logo         | `components/layout/Navbar.tsx` + `Footer.tsx` |
| SEO metadata            | `app/layout.tsx`              |
| Google Maps embed       | `app/contact/page.tsx` (add later) |

---

## Scripts

```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run type-check   # Check TypeScript errors without building
npm run lint         # Run ESLint
npm run postbuild    # Auto-generates sitemap.xml after build
```

---

## Support

**WhatsApp:** +254 700 000 001
**Email:** info@niksdigital.co.ke
**Location:** Shop 12, Westlands Commercial Centre, Nairobi
