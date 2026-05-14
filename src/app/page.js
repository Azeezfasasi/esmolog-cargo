import TawkToChat from '@/components/HomeComponents/TawktoChat';
import OurServicesSection from '@/components/HomeComponents/OurServices';
import CallToAction from '@/components/HomeComponents/CalloAction';
import WhoWeAre from '@/components/HomeComponents/WhoWeAre';
import HowItWorks from '@/components/HomeComponents/HowItWorks';
import AllBlog from '@/components/HomeComponents/AllBlog';
import TestimonialSection from '@/components/HomeComponents/TestimonialSection';
import HeroSection from '@/components/HomeComponents/HeroSection';

export default function Home() {
  return (
    <>
      <TawkToChat />
      {/* <SubscribeNowPopup /> */}
      <HeroSection />
      <OurServicesSection />
      <CallToAction />
      <WhoWeAre />
      <HowItWorks />
      <AllBlog />
      <TestimonialSection />
    </>
  );
}
