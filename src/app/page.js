import Header from '@/components/Header';
import Hero from '@/components/Herosec';
import Mission from '@/components/Mission';
import CommunityPower from '@/components/CommunityPower';
import ImportantSteps from '@/components/ImportantSteps';
import PeopleToKnow from '@/components/PeopleToKnow';
import Network from '@/components/Network';
import Footer from '@/components/Footer';
import Popup from '@/components/Popup';
import BackToTop from '@/components/BackToTop';
import TawkToChat from '@/components/HomeComponents/TawktoChat';
import SubscribeNowPopup from '@/components/HomeComponents/SubscribeNowPopup';
import HeaderSection from '@/components/HomeComponents/HeaderSection';
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
