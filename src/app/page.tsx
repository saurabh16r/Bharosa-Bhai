import { HeroSection } from "@/components/landing/HeroSection";
import { ConfusedSection } from "@/components/landing/ConfusedSection";
import { MeetBhaiSection } from "@/components/landing/MeetBhaiSection";
import { SipCalculatorSection } from "@/components/landing/SipCalculatorSection";
import { RoadmapSection } from "@/components/landing/RoadmapSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { CTASection } from "@/components/landing/CTASection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <ConfusedSection />
      <MeetBhaiSection />
      <SipCalculatorSection />
      <RoadmapSection />
      <FAQSection />
      <CTASection />
    </>
  );
}
