import AllBlog from "@/components/HomeComponents/AllBlog";
import FooterSection from "@/components/HomeComponents/FooterSection";
import HeaderSection from "@/components/HomeComponents/HeaderSection";
import { SubscribePopUp } from "@/components/HomeComponents/SubscribePopUp";


export default function page() {
  return (
    <>
        <SubscribePopUp />
        <HeaderSection />
        <AllBlog />
        <FooterSection />
    </>
  )
}
