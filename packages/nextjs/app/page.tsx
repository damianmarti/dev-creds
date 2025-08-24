"use client";

import type { NextPage } from "next";
import { signOut } from "next-auth/react";
import { Attest } from "~~/components/attestation/Attest";

const Home: NextPage = () => {
  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">DevCreds</span>
          </h1>
        </div>
        <button
          onClick={() => {
            signOut();
          }}
        >
          {" "}
          Sign out
        </button>
        <Attest />
      </div>
    </>
  );
};

export default Home;
