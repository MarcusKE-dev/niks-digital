export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="h-16 bg-white border-b border-border" />
      <div className="container-site py-8">
        <div className="skeleton rounded-xl w-full" style={{height: 400}} />
      </div>
    </div>
  )
}