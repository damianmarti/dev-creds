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
      {isDeveloperLoading && <div>Loading...</div>}
      {isDeveloperError && <div>Error loading developer data.</div>}
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
    </div>
  );
}
