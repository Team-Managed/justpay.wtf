import { HeroSection } from "@/components/landing/HeroSection";
import { StickyFeatures } from "@/components/landing/StickyFeatures";
import { DemoSection } from "@/components/landing/DemoSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { ContactSection } from "@/components/landing/ContactSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { SocialProofSection } from "@/components/landing/SocialProofSection";

export default function LandingPage() {
  return (
    <div className="flex flex-col w-full relative z-10 overflow-hidden bg-[var(--color-neutral-primary-soft)]">
      <HeroSection />
      <StickyFeatures />
      <SocialProofSection />
      <DemoSection />
      <HowItWorksSection />
      <FaqSection />
      <ContactSection />
    </div>
  );
}
