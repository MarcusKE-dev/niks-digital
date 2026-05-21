'use client'
import { useState, useEffect } from 'react'
import { supabaseBrowser }     from '@/lib/supabase'
import { useToast }            from '@/components/ui/Toaster'
import { STORAGE_BUCKETS }     from '@/lib/supabase'

export default function SettingsPage() {
  const toast = useToast()
  const [heroImage,    setHeroImage]    = useState('')
  const [heroTitle,    setHeroTitle]    = useState('')
  const [heroSubtitle, setHeroSubtitle] = useState('')
  const [saving,       setSaving]       = useState(false)
  const [uploading,    setUploading]    = useState(false)

  useEffect(() => {
    supabaseBrowser.from('site_settings').select('key,value')
      .then(({ data }) => {
        data?.forEach(row => {
          if (row.key === 'hero_image')    setHeroImage(row.value)
          if (row.key === 'hero_title')    setHeroTitle(row.value)
          if (row.key === 'hero_subtitle') setHeroSubtitle(row.value)
        })
      })
  }, [])

  async function uploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const path = `hero/${Date.now()}-${file.name.replace(/\s+/g,'-')}`
    const { data, error } = await supabaseBrowser.storage
      .from(STORAGE_BUCKETS.PRODUCTS)
      .upload(path, file, { upsert: true })
    if (error) { toast.error(error.message); setUploading(false); return }
    const url = supabaseBrowser.storage.from(STORAGE_BUCKETS.PRODUCTS).getPublicUrl(data.path).data.publicUrl
    setHeroImage(url)
    setUploading(false)
    toast.success('Image uploaded!')
  }

  async function handleSave() {
    setSaving(true)
    const updates = [
      { key: 'hero_image',    value: heroImage },
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
        <h2 className="font-bold text-dark border-b border-border pb-3">Homepage Banner</h2>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Banner Title</label>
          <input value={heroTitle} onChange={e => setHeroTitle(e.target.value)}
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary" />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Banner Subtitle</label>
          <input value={heroSubtitle} onChange={e => setHeroSubtitle(e.target.value)}
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary" />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Banner Image</label>
          {heroImage && (
            <img src={heroImage} alt="Current banner" className="w-full h-48 object-cover rounded-lg mb-3 border border-border" />
          )}
          <label className={`block border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${uploading ? 'border-primary bg-orange-50' : 'border-border hover:border-primary'}`}>
            <input type="file" accept="image/*" onChange={uploadImage} className="sr-only" />
            <p className="text-sm font-medium text-dark">{uploading ? '⏳ Uploading...' : '📸 Click to upload new banner image'}</p>
            <p className="text-xs text-muted mt-1">JPG, PNG, WebP — Recommended size: 800x500px</p>
          </label>
        </div>

        <button onClick={handleSave} disabled={saving}
          className="w-full h-11 bg-primary text-white font-bold text-sm rounded-full flex items-center justify-center gap-2 hover:bg-primary-600 disabled:opacity-60 transition-colors">
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
