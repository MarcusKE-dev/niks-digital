export default function ProductLoading() {
  return (
    <div className="bg-white min-h-screen py-8">
      <div className="container-site">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
          <div className="skeleton rounded-xl" style={{height: 420}} />
          <div className="space-y-4">
            <div className="skeleton h-4 w-24 rounded" />
            <div className="skeleton h-8 w-full rounded" />
            <div className="skeleton h-6 w-32 rounded" />
            <div className="skeleton h-10 w-40 rounded" />
            <div className="skeleton h-24 w-full rounded" />
            <div className="skeleton h-12 w-full rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}