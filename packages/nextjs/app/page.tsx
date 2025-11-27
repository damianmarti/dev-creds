"use client";

import type { NextPage } from "next";
import { DisplayStats } from "~~/components/DisplayStats";
import { FeaturesSection } from "~~/components/Features";
import { HeroSection } from "~~/components/HeroSection";

const Home: NextPage = () => {
  return (
    <>
      <div className="bg-background flex items-center flex-col grow p-2 sm:p-4 md:p-6">
        <HeroSection />
        <FeaturesSection />
        <div className="py-2 sm:py-4 md:py-12">
          <DisplayStats />
        </div>
      </div>
    </>
  );
};

export default Home;
