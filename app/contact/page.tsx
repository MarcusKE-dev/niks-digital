import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="bg-surface min-h-screen py-16">
        <div className="container-site max-w-2xl">
          <h1 className="text-3xl font-extrabold text-dark mb-2">Contact Us</h1>
          <p className="text-muted mb-10">We are open Monday to Sunday, 8am – 7pm.</p>

          <div className="space-y-4">
            <a href="tel:+254700000001"
              className="flex items-center gap-4 bg-white border border-border rounded-xl p-5 hover:border-primary transition-colors group">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-2xl flex-shrink-0">📞</div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted mb-0.5">Call Us</p>
                <p className="font-bold text-dark text-lg group-hover:text-primary">+254 700 000 001</p>
                <p className="text-xs text-muted">Tap to call</p>
              </div>
            </a>

            <a href="https://wa.me/254705062319"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-4 bg-white border border-border rounded-xl p-5 hover:border-green-500 transition-colors group">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl flex-shrink-0">💬</div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted mb-0.5">WhatsApp</p>
                <p className="font-bold text-dark text-lg group-hover:text-green-600">+254 700 000 001</p>
                <p className="text-xs text-muted">Chat with us</p>
              </div>
            </a>

            <div className="flex items-center gap-4 bg-white border border-border rounded-xl p-5">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-2xl flex-shrink-0">📍</div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted mb-0.5">Location</p>
                <p className="font-bold text-dark">Kikuyu Town Centre</p>
                <p className="text-xs text-muted">Kikuyu, Kiambu County</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white border border-border rounded-xl p-5">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-2xl flex-shrink-0">⏰</div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted mb-0.5">Hours</p>
                <p className="font-bold text-dark">Monday – Sunday</p>
                <p className="text-xs text-muted">7:00am – 10:00pm</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}