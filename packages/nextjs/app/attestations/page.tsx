"use client";

import type { NextPage } from "next";
import { List } from "~~/components/attestation/List";

const Home: NextPage = () => {
  return (
    <>
      <div className="flex items-center flex-col grow py-10">
        <h1 className="text-center text-md md:text-4xl font-bold">Attestations</h1>
        <List />
      </div>
    </>
  );
};

export default Home;
