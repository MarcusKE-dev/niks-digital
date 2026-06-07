'use client'
import { useState, useEffect } from 'react'
import { supabaseBrowser }     from '@/lib/supabase'
import { useToast }            from '@/components/ui/Toaster'
import { STORAGE_BUCKETS }     from '@/lib/supabase'

export default function SettingsPage() {
  const toast = useToast()
  const [heroImages,    setHeroImages]    = useState<string[]>([])
  const [heroTitle,     setHeroTitle]     = useState('')
  const [heroSubtitle,  setHeroSubtitle]  = useState('')
  const [saving,        setSaving]        = useState(false)
  const [uploading,     setUploading]     = useState(false)

  // Load settings from Supabase
  useEffect(() => {
    supabaseBrowser.from('site_settings').select('key,value')
      .then(({ data }) => {
        data?.forEach(row => {
          if (row.key === 'hero_images') {
            try {
              const parsed = JSON.parse(row.value)
              if (Array.isArray(parsed)) setHeroImages(parsed)
            } catch { setHeroImages([]) }
          }
          if (row.key === 'hero_title')    setHeroTitle(row.value)
          if (row.key === 'hero_subtitle') setHeroSubtitle(row.value)
        })
      })
  }, [])

  // Upload a new banner image (adds to the array)
  async function uploadBannerImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const path = `hero/${Date.now()}-${file.name.replace(/\s+/g, '-')}`
    const { data, error } = await supabaseBrowser.storage
      .from(STORAGE_BUCKETS.PRODUCTS)
      .upload(path, file, { upsert: false })
    if (error) {
      toast.error(error.message)
      setUploading(false)
      return
    }
    const url = supabaseBrowser.storage
      .from(STORAGE_BUCKETS.PRODUCTS)
      .getPublicUrl(data.path).data.publicUrl
    const updated = [...heroImages, url]
    setHeroImages(updated)
    // Immediately save to DB (optional: can wait for "Save Settings" button)
    await supabaseBrowser.from('site_settings')
      .upsert({ key: 'hero_images', value: JSON.stringify(updated) }, { onConflict: 'key' })
    setUploading(false)
    toast.success('Banner image added!')
  }

  // Remove a banner image by index
  async function removeBannerImage(index: number) {
    const updated = heroImages.filter((_, i) => i !== index)
    setHeroImages(updated)
    await supabaseBrowser.from('site_settings')
      .upsert({ key: 'hero_images', value: JSON.stringify(updated) }, { onConflict: 'key' })
    toast.success('Image removed')
  }

  // Save title & subtitle (and optionally the image array – already auto-saved on upload/remove)
  async function handleSave() {
    setSaving(true)
    const updates = [
      { key: 'hero_images',   value: JSON.stringify(heroImages) },
      { key: 'hero_title',    value: heroTitle },
      { key: 'hero_subtitle', value: heroSubtitle },
    ]
    for (const u of updates) {
      await supabaseBrowser.from('site_settings')
        .upsert({ key: u.key, value: u.value }, { onConflict: 'key' })
    }
    setSaving(false)
    toast.success('Settings saved! Refresh the homepage to see changes.')
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <h1 className="text-2xl font-extrabold text-dark mb-8">Site Settings</h1>

      <div className="bg-white border border-border rounded-xl p-6 space-y-6">
        {/* Category Photos section (unchanged, from original) */}
        <div className="space-y-4">
          <h2 className="font-bold text-dark border-b border-border pb-3">
            Category Photos
          </h2>
          <p className="text-xs text-muted">
            Upload a photo for each category. Recommended: 400x300px.
          </p>
          {[
            { slug: 'phones',      label: 'Phones & Accessories' },
            { slug: 'computers',   label: 'Computer Accessories'  },
            { slug: 'tvs',         label: 'Televisions'           },
            { slug: 'audio',       label: 'Audio & Speakers'      },
            { slug: 'kitchen',     label: 'Kitchen Appliances'    },
            { slug: 'electronics', label: 'Basic Electronics'     },
            { slug: 'wearables',   label: 'Smart Watches'         },
          ].map(cat => (
            <CategoryImageUploader key={cat.slug} slug={cat.slug} label={cat.label} />
          ))}
        </div>

        {/* Homepage Banner section (updated for multiple images) */}
        <div>
          <h2 className="font-bold text-dark border-b border-border pb-3 mb-4">Homepage Banner</h2>

          <div className="mb-5">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
              Banner Title
            </label>
            <input
              value={heroTitle}
              onChange={e => setHeroTitle(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>

          <div className="mb-5">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
              Banner Subtitle
            </label>
            <input
              value={heroSubtitle}
              onChange={e => setHeroSubtitle(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>

          <div className="mb-5">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
              Banner Images (up to 5)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
              {heroImages.map((url, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={url}
                    alt={`Banner ${idx + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-border"
                  />
                  <button
                    onClick={() => removeBannerImage(idx)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                    aria-label="Remove image"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <label className={`block border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${uploading ? 'border-primary bg-orange-50' : 'border-border hover:border-primary'}`}>
              <input type="file" accept="image/*" onChange={uploadBannerImage} className="sr-only" />
              <p className="text-sm font-medium text-dark">
                {uploading ? '⏳ Uploading...' : '📸 Add banner image'}
              </p>
              <p className="text-xs text-muted mt-1">JPG, PNG, WebP — Recommended size: 800x500px</p>
            </label>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-11 bg-primary text-white font-bold text-sm rounded-full flex items-center justify-center gap-2 hover:bg-primary-600 disabled:opacity-60 transition-colors"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  )
}

// CategoryImageUploader component (unchanged)
function CategoryImageUploader({ slug, label }: { slug: string; label: string }) {
  const [uploading, setUploading] = useState(false)
  const [preview,   setPreview]   = useState('')
  const toast = useToast()

  useEffect(() => {
    supabaseBrowser
      .from('site_settings')
      .select('value')
      .eq('key', `category_image_${slug}`)
      .single()
      .then(({ data }) => {
        if (data?.value && !data.value.startsWith('/categories/')) {
          setPreview(data.value)
        }
      })
  }, [slug])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)

    const path = `categories/${slug}.jpg`
    const { data, error } = await supabaseBrowser.storage
      .from('product-images')
      .upload(path, file, { upsert: true, contentType: file.type })

    if (error) {
      toast.error(error.message)
      setUploading(false)
      return
    }

    const url = supabaseBrowser.storage
      .from('product-images')
      .getPublicUrl(data.path).data.publicUrl

    await supabaseBrowser
      .from('site_settings')
      .upsert(
        { key: `category_image_${slug}`, value: url },
        { onConflict: 'key' }
      )

    setPreview(url)
    setUploading(false)
    toast.success(`${label} photo updated!`)
  }

  return (
    <div className="flex items-center gap-4 py-3 border-b border-border last:border-0">
      <div className="w-20 h-14 rounded-lg bg-surface border border-border overflow-hidden flex-shrink-0">
        {preview
          ? <img src={preview} alt={label} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-muted text-xs">No photo</div>
        }
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-dark">{label}</p>
        <p className="text-xs text-muted">category: {slug}</p>
      </div>
      <label className={`flex-shrink-0 h-9 px-4 rounded-full text-xs font-semibold cursor-pointer flex items-center gap-2 transition-colors ${uploading ? 'bg-surface text-muted' : 'bg-dark text-white hover:bg-dark-400'}`}>
        <input type="file" accept="image/*" onChange={handleUpload} className="sr-only" disabled={uploading} />
        {uploading ? '⏳ Uploading...' : '📸 Upload'}
      </label>
    </div>
  )
}