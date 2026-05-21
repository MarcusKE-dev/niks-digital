import Link   from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="bg-surface min-h-[70vh] flex items-center justify-center py-16">
        <div className="text-center px-4">
          <p className="text-8xl font-extrabold text-gray-100 mb-4 select-none">404</p>
          <h1 className="text-2xl font-extrabold text-dark mb-2">Page Not Found</h1>
          <p className="text-sm text-muted mb-8 max-w-xs mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/" className="h-11 px-6 bg-primary text-white font-semibold text-sm rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors">
              Go to Homepage
            </Link>
            <Link href="/shop" className="h-11 px-6 bg-white border border-border text-dark font-semibold text-sm rounded-full flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
              Browse Products
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
