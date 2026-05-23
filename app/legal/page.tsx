import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export const metadata = {
  title: 'Legal — Privacy, Terms & Returns',
}

export default function LegalPage() {
  return (
    <>
      <Navbar />
      <main className="bg-surface min-h-screen py-12">
        <div className="container-site max-w-2xl">

          <h1 className="text-3xl font-extrabold text-dark mb-2">Legal Information</h1>
          <p className="text-muted text-sm mb-8">
            Niks Digital Connections · Kikuyu Town, Kiambu · Last updated January 2026
          </p>

          {/* Nav anchors */}
          <div className="flex gap-3 flex-wrap mb-10">
            {['Privacy Policy', 'Terms of Service', 'Returns Policy'].map((label, i) => (
              <a key={label} href={`#section-${i + 1}`}
                className="h-9 px-4 bg-white border border-border rounded-full text-sm font-medium text-dark hover:border-primary hover:text-primary transition-colors flex items-center">
                {label}
              </a>
            ))}
          </div>

          <div className="space-y-10">

            {/* Privacy */}
            <section id="section-1" className="bg-white border border-border rounded-xl p-6">
              <h2 className="text-xl font-extrabold text-dark mb-4 pb-3 border-b border-border">
                Privacy Policy
              </h2>
              <div className="space-y-4 text-sm text-muted leading-relaxed">
                <div>
                  <h3 className="font-bold text-dark mb-1">Information We Collect</h3>
                  <p>When you place an order, we collect your name, phone number, email address (optional), and delivery address. This information is used only to process and deliver your order.</p>
                </div>
                <div>
                  <h3 className="font-bold text-dark mb-1">How We Use Your Information</h3>
                  <p>Your details are used to confirm orders, arrange delivery, and contact you about your purchase. We do not sell or share your personal information with third parties.</p>
                </div>
                <div>
                  <h3 className="font-bold text-dark mb-1">Payments</h3>
                  <p>M-Pesa payments are processed by Safaricom. Card payments are processed by Flutterwave. We do not store payment details on our servers.</p>
                </div>
                <div>
                  <h3 className="font-bold text-dark mb-1">Contact</h3>
                  <p>For privacy concerns, contact us via WhatsApp or visit our shop in Kikuyu Town.</p>
                </div>
              </div>
            </section>

            {/* Terms */}
            <section id="section-2" className="bg-white border border-border rounded-xl p-6">
              <h2 className="text-xl font-extrabold text-dark mb-4 pb-3 border-b border-border">
                Terms of Service
              </h2>
              <div className="space-y-4 text-sm text-muted leading-relaxed">
                <div>
                  <h3 className="font-bold text-dark mb-1">Orders</h3>
                  <p>All orders are subject to availability. We will contact you via phone or WhatsApp to confirm your order within 1 hour of placement during business hours (8am–7pm, Mon–Sun).</p>
                </div>
                <div>
                  <h3 className="font-bold text-dark mb-1">Pricing</h3>
                  <p>All prices are in Kenyan Shillings (KES) and inclusive of VAT where applicable. Prices may change without notice. The price at the time of order confirmation is the final price.</p>
                </div>
                <div>
                  <h3 className="font-bold text-dark mb-1">Delivery</h3>
                  <p>Free delivery within Kikuyu Town on orders above KES 10,000. Delivery fees apply for other areas as shown at checkout. Delivery is within 1–3 business days after payment confirmation.</p>
                </div>
                <div>
                  <h3 className="font-bold text-dark mb-1">Warranty</h3>
                  <p>All products come with manufacturer warranty. Duration varies by product and brand. Warranty claims must be supported by purchase receipt from Niks Digital Connections.</p>
                </div>
              </div>
            </section>

            {/* Returns */}
            <section id="section-3" className="bg-white border border-border rounded-xl p-6">
              <h2 className="text-xl font-extrabold text-dark mb-4 pb-3 border-b border-border">
                Returns Policy
              </h2>
              <div className="space-y-4 text-sm text-muted leading-relaxed">
                <div>
                  <h3 className="font-bold text-dark mb-1">7-Day Returns</h3>
                  <p>We accept returns within 7 days of purchase for items that are defective, damaged on delivery, or significantly different from what was described. Items must be in original packaging with all accessories included.</p>
                </div>
                <div>
                  <h3 className="font-bold text-dark mb-1">How to Return</h3>
                  <p>Contact us via WhatsApp before returning any item. We will guide you through the process. Do not return items without prior authorization from our team.</p>
                </div>
                <div>
                  <h3 className="font-bold text-dark mb-1">Non-Returnable Items</h3>
                  <p>Items that have been used, opened accessories, and products damaged by the customer are not eligible for return. Software and digital products are non-refundable.</p>
                </div>
                <div>
                  <h3 className="font-bold text-dark mb-1">Refunds</h3>
                  <p>Approved refunds are processed within 3–5 business days via M-Pesa to the original payment number, or by cash at our Kikuyu Town shop.</p>
                </div>
              </div>
            </section>

          </div>

          <div className="mt-8 p-5 bg-white border border-border rounded-xl text-center">
            <p className="text-sm text-muted mb-3">Questions about any of the above?</p>
            <a href="/contact"
              className="inline-flex h-10 px-6 bg-primary text-white font-semibold text-sm rounded-full items-center hover:bg-primary-600 transition-colors">
              Contact Us
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}