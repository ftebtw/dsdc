import Hero from "@/components/Hero";
import FeatureCards from "@/components/FeatureCards";
import HowItWorks from "@/components/HowItWorks";
import MissionSection from "@/components/MissionSection";
import ClassesOverview from "@/components/ClassesOverview";
import StatsCounter from "@/components/StatsCounter";
import CompetitionLogos from "@/components/CompetitionLogos";
import TestimonialCarousel from "@/components/TestimonialCarousel";
import FAQ from "@/components/FAQ";
import FinalCTA from "@/components/FinalCTA";
import { homePageDataSanity } from "@/lib/sanity/presentation";

export default function HomePage() {
  return (
    <div data-sanity={homePageDataSanity()}>
      <Hero />
      <FeatureCards />
      <HowItWorks />
      <MissionSection />
      <ClassesOverview />
      <StatsCounter />
      <CompetitionLogos />
      <TestimonialCarousel />
      <FAQ />
      <FinalCTA />
    </div>
  );
}
