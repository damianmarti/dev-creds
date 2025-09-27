"use client";

import type { NextPage } from "next";
import { DisplayStats } from "~~/components/DisplayStats";
import { FeaturesSection } from "~~/components/Features";
import { HeroSection } from "~~/components/HeroSection";

const Home: NextPage = () => {
  return (
    <>
      <div className="bg-background flex items-center flex-col grow 10">
        <HeroSection />
        <FeaturesSection />
        <div className="w-full bg-base-100 py-10 sm:py-12">
          <div className="grid grid-cols-4">
            <div className="col-span-1" />
            <div className="col-span-2">
              <DisplayStats />
            </div>
            <div className="col-span-1" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
