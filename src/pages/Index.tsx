import { Suspense, useEffect, useState } from "react";
import { lazyWithRetry as lazy } from "@/utils/lazyWithRetry";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import TrustBar from "@/components/home/TrustBar";
import FinalCTA from "@/components/home/FinalCTA";
import Footer from "@/components/Footer";
import AIChatWidget from "@/components/AIChatWidget";
import { useNavigate } from "react-router-dom";

// Lazy load redesigned sections
const PrideCarousel = lazy(() => import("@/components/PrideCarousel"));
const OlympiadSection = lazy(() => import("@/components/OlympiadSection"));
const ProfessionsCarousel = lazy(() => import("@/components/home/ProfessionsCarousel"));
const TeachersSection = lazy(() => import("@/components/home/TeachersSection"));
const LeadForm = lazy(() => import("@/components/home/LeadForm"));
const SubjectsSection = lazy(() => import("@/components/SubjectsSection"));
const TrustSection = lazy(() => import("@/components/landing/TrustSection"));

import { homepageService, HomePageConfig } from "@/services/homepageService";

const SectionSkeleton = () => (
  <div className="w-full h-[600px] animate-pulse bg-white/5 rounded-[3rem] my-12" />
);

const Index = () => {
  const [config, setConfig] = useState<HomePageConfig | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Redirect logged-in users
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === 'STUDENT') {
          navigate('/dashboard', { replace: true });
        } else if (user.role === 'TEACHER') {
          navigate('/teacher/dashboard', { replace: true });
        }
      } catch (e) {
        // Ignore
      }
    }

    homepageService.getConfig().then(res => setConfig(res.config)).catch(console.error);
  }, [navigate]);
  const { t, i18n } = useTranslation();

  return (
    <div className="min-h-screen bg-[#0B0F1A] selection:bg-primary selection:text-background font-inter">
      <Helmet>
        <title>HOGWORDS | Nufuzli va Professional Olimpiada Platformasi</title>
        <meta name="description" content="Eng sara mentorlar va nufuzli olimpiadalar platformasi." />
      </Helmet>

      {/* 1. Cinematic Hero Section */}
      <HeroSection />

      {/* 2. Trust Bar (Social Proof) */}
      <TrustBar />

      <main className="relative">
        <Suspense fallback={<SectionSkeleton />}>
          {/* 3. Subjects Interactive Grid / Carousel */}
          <SubjectsSection />

          {/* 4. Deep Trust (Nega HOGWORDS?) - Carousel */}
          <TrustSection />

          {/* 5. OlympiadSection (Luxury Showcase with Countdown) */}
          <OlympiadSection />

          {/* 6. Winners Wall (PrideCarousel) */}
          <PrideCarousel />

          {/* 7. TeachersSection (Elite Mentors) - Carousel */}
          <TeachersSection />

          {/* 8. ProfessionsCarousel - Niche specialized paths */}
          <ProfessionsCarousel />

          {/* 9. LeadForm (Free Consultation) */}
          <LeadForm />

          {/* 10. Final CTA */}
          <FinalCTA />
        </Suspense>
      </main>
    </div>
  );
};

export default Index;
