'use client'

import { useState, useEffect } from 'react'
import { useRouter }           from 'next/navigation'
import Link                    from 'next/link'
import { supabaseBrowser, STORAGE_BUCKETS } from '@/lib/supabase'
import { toSlug, productImageSrc }          from '@/lib/utils'
import { useToast }                         from '@/components/ui/Toaster'

interface Category { id: string; name: string; slug: string }

export default function NewProductPage() {
  const router = useRouter()
  const toast  = useToast()

  const [categories, setCategories] = useState<Category[]>([])
  const [saving,    setSaving]      = useState(false)
  const [features,  setFeatures]    = useState([''])
  const [images,    setImages]      = useState<string[]>([])
  const [uploading, setUploading]   = useState(false)

  const [form, setForm] = useState({
    name: '', slug: '', category_id: '', brand: '', sku: '',
    price: '', old_price: '', stock_qty: '', description: '',
    badge: '', is_featured: false, is_active: true, weight_kg: '',
  })

  useEffect(() => {
    supabaseBrowser.from('categories').select('id,name,slug').order('display_order')
      .then(({ data }) => setCategories(data ?? []))
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    setForm(f => {
      const updated = { ...f, [name]: val }
      if (name === 'name') updated.slug = toSlug(value)
      return updated
    })
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    for (const file of files) {
      const path = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`
      const { data, error } = await supabaseBrowser.storage
        .from(STORAGE_BUCKETS.PRODUCTS)
        .upload(path, file, { upsert: true })
      if (error) { toast.error(`Upload failed: ${error.message}`); continue }
      const url = supabaseBrowser.storage.from(STORAGE_BUCKETS.PRODUCTS).getPublicUrl(data.path).data.publicUrl
      setImages(imgs => [...imgs, url])
    }
    setUploading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.category_id || !form.price || !form.stock_qty) {
      toast.error('Please fill in all required fields'); return
    }
    if (images.length === 0) { toast.error('Please upload at least one image'); return }

    setSaving(true)
    const payload = {
      name:         form.name,
      slug:         form.slug,
      category_id:  form.category_id,
      brand:        form.brand || null,
      sku:          form.sku   || null,
      price:        Number(form.price),
      old_price:    form.old_price  ? Number(form.old_price)  : null,
      stock_qty:    Number(form.stock_qty),
      description:  form.description,
      features:     features.filter(Boolean),
      badge:        form.badge || null,
      is_featured:  form.is_featured,
      is_active:    form.is_active,
      weight_kg:    form.weight_kg ? Number(form.weight_kg) : null,
      images,
      thumbnail:    images[0],
    }

    const { error } = await supabaseBrowser.from('products').insert(payload)
    setSaving(false)
    if (error) { toast.error(error.message); return }
    toast.success('Product created successfully!')
    router.push('/admin/products')
  }

  const field = (label: string, name: string, opts: any = {}) => (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
        {label} {opts.required && <span className="text-danger">*</span>}
      </label>
      <input name={name} value={(form as any)[name]} onChange={handleChange}
        className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary bg-white"
        {...opts} />
    </div>
  )

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/products" className="text-sm text-muted hover:text-primary">← Products</Link>
        <span className="text-muted">/</span>
        <h1 className="text-xl font-extrabold text-dark">Add New Product</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main fields */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white border border-border rounded-xl p-5 space-y-4">
              <h2 className="font-bold text-dark">Basic Information</h2>
              {field('Product Name', 'name', { required: true, placeholder: 'e.g. Samsung 55" 4K Smart TV' })}
              {field('URL Slug', 'slug', { required: true, placeholder: 'auto-generated from name' })}
              <div className="grid grid-cols-2 gap-4">
                {field('Brand', 'brand', { placeholder: 'e.g. Samsung' })}
                {field('SKU', 'sku', { placeholder: 'e.g. SAM-55-4K-001' })}
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">Category <span className="text-danger">*</span></label>
                <select name="category_id" value={form.category_id} onChange={handleChange}
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary bg-white">
                  <option value="">Select category…</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">Description</label>
                <textarea name="description" rows={4} value={form.description} onChange={handleChange}
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary bg-white resize-none"
                  placeholder="Describe the product for customers…" />
              </div>
            </div>

            <div className="bg-white border border-border rounded-xl p-5">
              <h2 className="font-bold text-dark mb-4">Key Features</h2>
              <div className="space-y-2">
                {features.map((f, i) => (
                  <div key={i} className="flex gap-2">
                    <input value={f} onChange={e => setFeatures(fs => fs.map((x, j) => j === i ? e.target.value : x))}
                      placeholder={`Feature ${i + 1}`}
                      className="flex-1 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
                    <button type="button" onClick={() => setFeatures(fs => fs.filter((_, j) => j !== i))}
                      className="w-8 h-9 flex items-center justify-center text-danger hover:bg-red-50 rounded-lg transition-colors text-lg">×</button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => setFeatures(fs => [...fs, ''])}
                className="mt-3 text-xs text-primary hover:underline font-medium">+ Add feature</button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="bg-white border border-border rounded-xl p-5 space-y-4">
              <h2 className="font-bold text-dark">Pricing & Stock</h2>
              {field('Price (KES)', 'price', { required: true, type: 'number', placeholder: '42000' })}
              {field('Old Price (KES)', 'old_price', { type: 'number', placeholder: '48000 (optional)' })}
              {field('Stock Quantity', 'stock_qty', { required: true, type: 'number', placeholder: '10' })}
              {field('Weight (kg)', 'weight_kg', { type: 'number', step: '0.1', placeholder: '25.5 (optional)' })}
            </div>

            <div className="bg-white border border-border rounded-xl p-5 space-y-3">
              <h2 className="font-bold text-dark">Settings</h2>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">Badge</label>
                <select name="badge" value={form.badge} onChange={handleChange}
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary bg-white">
                  <option value="">None</option>
                  <option value="new">New</option>
                  <option value="sale">Sale</option>
                  <option value="hot">Hot</option>
                </select>
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" name="is_featured" checked={form.is_featured} onChange={handleChange} className="accent-primary w-4 h-4" />
                <span className="text-sm font-medium text-dark">Featured product</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} className="accent-primary w-4 h-4" />
                <span className="text-sm font-medium text-dark">Active (visible in shop)</span>
              </label>
            </div>

            <div className="bg-white border border-border rounded-xl p-5">
              <h2 className="font-bold text-dark mb-3">Product Images</h2>
              <label className={`block border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors ${uploading ? 'border-primary bg-orange-50' : 'border-border hover:border-primary'}`}>
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="sr-only" />
                <p className="text-2xl mb-1" aria-hidden>{uploading ? '⏳' : '📸'}</p>
                <p className="text-sm font-medium text-dark">{uploading ? 'Uploading…' : 'Click to upload images'}</p>
                <p className="text-xs text-muted mt-0.5">JPG, PNG, WebP · Max 5MB each</p>
              </label>
              {images.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {images.map((url, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border group">
                      <img src={url} alt="" className="w-full h-full object-contain p-1" />
                      {i === 0 && <span className="absolute bottom-0 left-0 right-0 bg-primary text-white text-2xs text-center py-0.5">Main</span>}
                      <button type="button" onClick={() => setImages(imgs => imgs.filter((_, j) => j !== i))}
                        className="absolute top-0.5 right-0.5 w-4 h-4 bg-danger rounded-full text-white text-2xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" disabled={saving}
              className="w-full h-11 bg-primary text-white font-bold text-sm rounded-full flex items-center justify-center gap-2 hover:bg-primary-600 disabled:opacity-60 transition-colors">
              {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
              {saving ? 'Saving…' : 'Save Product'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
