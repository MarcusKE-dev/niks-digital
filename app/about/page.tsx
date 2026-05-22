import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="bg-surface min-h-screen py-16">
        <div className="container-site max-w-2xl">
          <h1 className="text-3xl font-extrabold text-dark mb-2">About Us</h1>
          <p className="text-muted mb-10">Kikuyu Town's trusted electronics shop.</p>

          <div className="bg-white border border-border rounded-xl p-8 space-y-5 text-sm text-muted leading-relaxed">
            <p>
              <strong className="text-dark">Niks Digital Connections</strong> is a locally owned electronics
              and phone accessories shop based in Kikuyu Town, Kiambu County. We started with one goal:
              to give Kikuyu residents access to genuine, quality electronics at honest prices — without
              having to travel to Nairobi.
            </p>
            <p>
              We stock phones, phone accessories, TVs, laptops, computer accessories, audio equipment,
              kitchen appliances, smart watches, and general electronics. Every product we sell is genuine
              and sourced directly from authorized distributors.
            </p>
            <p>
              We accept M-Pesa, cash, and card payments. Free delivery within Kikuyu Town on orders above
              KES 10,000. We also offer after-sales support and installation help.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              {[
                { num: '5,000+', label: 'Happy Customers' },
                { num: '500+',   label: 'Products Available' },
                { num: '7 Days', label: 'Open Every Week' },
                { num: '5★',     label: 'Customer Rating' },
              ].map(s => (
                <div key={s.label} className="text-center p-4 bg-surface rounded-lg">
                  <p className="text-2xl font-extrabold text-primary">{s.num}</p>
                  <p className="text-xs text-muted mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
