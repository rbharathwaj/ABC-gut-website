import WaitlistBadge from '../components/WaitlistBadge'
import Hero from '../components/Hero'
import HowItWorks from '../components/HowItWorks'
import Features from '../components/Features'
import GutlySection from '../components/GutlySection'
import Science from '../components/Science'
import Pricing from '../components/Pricing'
import Footer from '../components/Footer'

export default function HomePage() {
  return (
    <main>
      <WaitlistBadge />
      <Hero />
      <HowItWorks />
      <Features />
      <GutlySection />
      <Science />
      <Pricing />
      <Footer />
    </main>
  )
}
