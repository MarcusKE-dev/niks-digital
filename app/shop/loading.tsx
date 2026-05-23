import { ProductGridSkeleton } from '@/components/ui/Skeleton'

export default function ShopLoading() {
  return (
    <div className="bg-surface min-h-screen py-8">
      <div className="container-site">
        <div className="flex gap-6">
          <div className="hidden lg:block w-56 flex-shrink-0">
            <div className="bg-white border border-border rounded-lg p-4 space-y-3">
              {Array.from({length: 8}).map((_,i) => (
                <div key={i} className="skeleton h-4 rounded" />
              ))}
            </div>
          </div>
          <div className="flex-1">
            <ProductGridSkeleton count={12} />
          </div>
        </div>
      </div>
    </div>
  )
}