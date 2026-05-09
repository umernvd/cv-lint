import LandingNav from './LandingNav'
import HeroSection from './HeroSection'
import HeroDashboardMockup from './HeroDashboardMockup'
import FeaturesSection from './FeaturesSection'
import AnalysisFlowSection from './AnalysisFlowSection'
import TestimonialSection from './TestimonialSection'
import LandingFooter from './LandingFooter'

export default function LandingPage(): React.ReactElement {
  return (
    <>
      <LandingNav />
      <main id="main-content" className="flex-grow pt-24 pb-3xl flex flex-col items-center">
        <HeroSection />
        <HeroDashboardMockup />
        <section id="features">
          <FeaturesSection />
        </section>
        <section id="how-it-works">
          <AnalysisFlowSection />
        </section>
        <TestimonialSection />
      </main>
      <LandingFooter />
    </>
  )
}
