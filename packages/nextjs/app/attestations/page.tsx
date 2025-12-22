"use client";

import type { NextPage } from "next";
import { List } from "~~/components/attestation/List";

const Home: NextPage = () => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      <h1 className="mb-2 font-serif text-4xl font-bold text-base-content">Attestations</h1>
      <p className="text-base-content/70">List of all attestations</p>
      <List />
    </div>
  );
};

export default Home;
