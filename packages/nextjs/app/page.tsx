"use client";

import type { NextPage } from "next";
import { DisplayStats } from "~~/components/DisplayStats";
import { FeaturesSection } from "~~/components/Features";
import { HeroSection } from "~~/components/HeroSection";

const Home: NextPage = () => {
  return (
    <>
      <div className="bg-base-100 flex items-center flex-col grow 10">
        <DisplayStats />
        <HeroSection />
        <FeaturesSection />
      </div>
    </>
  );
};

export default Home;
