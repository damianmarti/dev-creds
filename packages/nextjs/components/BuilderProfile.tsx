"use client";

import { useMemo } from "react";
import { Attestations } from "./builder/Attestations";
import { ProfileHeader } from "./builder/ProfileHeader";
import { Skills } from "./builder/Skills";
import { useQuery } from "@tanstack/react-query";
import { Developer } from "~~/types";
import { fetchDeveloper } from "~~/utils/graphql";

interface BuilderProfileProps {
  username: string;
}

export function BuilderProfile({ username }: BuilderProfileProps) {
  const {
    data: developerData,
    isLoading: isDeveloperLoading,
    isError: isDeveloperError,
  } = useQuery({
    queryKey: ["developer", username] as const,
    queryFn: () => fetchDeveloper(username),
    enabled: Boolean(username),
  });

  const developer = useMemo(() => developerData as Developer, [developerData]);

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6 md:p-8">
      {isDeveloperLoading && (
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="text-center">
            <span className="loading loading-spinner loading-lg"></span>
            <p className="mt-4 text-lg">Loading developer profile...</p>
          </div>
        </div>
      )}
      {isDeveloperError && (
        <div className="alert alert-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Error loading developer data. Please try again.</span>
        </div>
      )}
      {developer && (
        <>
          <ProfileHeader developer={developer} />
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Attestations developer={developer} isLoading={isDeveloperLoading} />
            </div>
            <div className="lg:col-span-1">
              <Skills username={username} />
            </div>
          </div>
        </>
      )}
      {!isDeveloperLoading && !isDeveloperError && !developer && (
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="text-center">
            <div className="mb-4 text-6xl">🔍</div>
            <h2 className="mb-2 text-2xl font-bold">Developer Not Found</h2>
            <p className="text-base-content/70">
              No developer profile exists for <span className="font-mono font-semibold">{username}</span>
            </p>
            <a href="/builders" className="btn btn-primary mt-6">
              Browse Developers
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
