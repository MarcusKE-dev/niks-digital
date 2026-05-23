'use client'

export function MobileFilterButton() {
  function toggle() {
    const el = document.getElementById('mobile-filter-drawer')
    if (el) el.classList.toggle('hidden')
  }

  return (
    <div className="lg:hidden mb-4">
      <button
        onClick={toggle}
        className="flex items-center gap-2 h-10 px-5 bg-white border border-border rounded-full text-sm font-semibold hover:border-primary transition-colors"
      >
        ⚙️ Filters
      </button>
    </div>
  )
}