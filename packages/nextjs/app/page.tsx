"use client";

import type { NextPage } from "next";
import { Attest } from "~~/components/attestation/Attest";

const Home: NextPage = () => {
  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Build Your Developer Reputation On-Chain</span>
          </h1>
        </div>
        <Attest />
      </div>
    </>
  );
};

export default Home;
