"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BuildersFilter, filterDevelopers } from "./BuildersFilter";
import { GithubSVG } from "./assets/GithubSVG";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import scaffoldConfig from "~~/scaffold.config";
import { fetchDevelopersForTable } from "~~/utils/graphql";

const DEVELOPER_PAGE_SIZE = 30;

export type DeveloperForTable = {
  name: string;
  username: string;
  avatar: string;
  githubUrl: string;
  monthlyAttestations: number;
  skills: string[];
  attestations: {
    total: number;
    verified: number;
  };
  topCollaborators: string[];
};

function TableHeader() {
  return (
    <div className="hidden min-w-max grid-cols-10 gap-4 bg-base-200 p-4 text-sm font-medium text-base-content/70 md:grid md:min-w-0">
      <div className="col-span-5">Developer</div>
      <div className="col-span-3">Skills</div>
      <div className="col-span-2">Attestations</div>
    </div>
  );
}

function DeveloperRow({ developer }: { developer: DeveloperForTable }) {
  return (
    <div className="w-full p-4 transition-colors hover:bg-base-200/50 md:grid md:grid-cols-10 md:items-center md:gap-4 rounded-xl border border-base-200 md:rounded-none md:border-0">
      <div className="flex items-center gap-3 md:col-span-3">
        <div className="avatar">
          <div className="mask mask-squircle h-10 w-10 bg-base-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={developer.avatar} alt={developer.name} />
          </div>
        </div>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <Link
              href={`/builder/${developer.username}`}
              className="link link-hover text-base-content text-sm font-medium sm:text-base"
            >
              {developer.name}
            </Link>
            <Link
              href={developer.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${developer.name}'s GitHub`}
            >
              <GithubSVG />
            </Link>
            {developer.monthlyAttestations > 0 && (
              <div className="badge badge-outline bg-green-100 text-green-700">+{developer.monthlyAttestations}</div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 md:mt-0 md:col-span-5">
        <div className="flex flex-wrap gap-1">
          {developer.skills.map(skill => (
            <div key={skill} className="badge badge-secondary badge-sm">
              {skill}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 md:mt-0 md:col-span-2">
        <div className="font-medium text-base-content text-sm sm:text-base">
          {developer.attestations.total} attestations{" "}
          {developer.attestations.total > 0 && (
            <Link
              href={`/attestations/${developer.username}`}
              className="text-xs text-primary hover:underline"
              aria-label={`View verified attestations for ${developer.username}`}
            >
              (view all)
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export function BuildersTable({ developers }: { developers: DeveloperForTable[] }) {
  return (
    <div className="card border border-base-300 bg-base-100 shadow-xl overflow-x-auto">
      <TableHeader />
      <div className="divide-y divide-base-200 md:divide-y">
        {developers.length === 0 && <div className="p-4 text-center text-base-content/70">No builders found</div>}
        {developers.map((dev, i) => (
          <DeveloperRow key={i} developer={dev} />
        ))}
      </div>
    </div>
  );
}

export function BuildersFromAttestations() {
  type DevPage = {
    developers: DeveloperForTable[];
    pageInfo: { hasNextPage: boolean; endCursor?: string | null };
  };

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [usernameQuery, setUsernameQuery] = useState("");
  const [developerPageIndex, setDeveloperPageIndex] = useState(0);

  const {
    data: devPage,
    isLoading: isLoadingDevelopers,
    isFetching: isFetchingDevelopers,
  } = useQuery<DevPage>({
    queryKey: ["developers", DEVELOPER_PAGE_SIZE],
    queryFn: () => fetchDevelopersForTable(DEVELOPER_PAGE_SIZE),
    refetchInterval: scaffoldConfig.pollingInterval,
  });

  const developers = useMemo(() => devPage?.developers || [], [devPage]);

  const allSkills = useMemo(() => {
    const newSet = new Set<string>();
    developers.forEach(dev => dev.skills.forEach(skill => newSet.add(skill)));
    return Array.from(newSet).sort((a, b) => a.localeCompare(b));
  }, [developers]);

  const filteredDevelopers = useMemo(() => {
    return filterDevelopers(developers, selectedSkills, usernameQuery);
  }, [developers, selectedSkills, usernameQuery]);

  const totalDeveloperPages = Math.max(1, Math.ceil(filteredDevelopers.length / DEVELOPER_PAGE_SIZE));

  const currentPageDevelopers = useMemo(() => {
    const start = developerPageIndex * DEVELOPER_PAGE_SIZE;
    return filteredDevelopers.slice(start, start + DEVELOPER_PAGE_SIZE);
  }, [filteredDevelopers, developerPageIndex]);

  function goToNextDeveloperPage() {
    if (developerPageIndex + 1 < totalDeveloperPages) {
      setDeveloperPageIndex(developerPageIndex + 1);
    }
  }

  function goToPreviousDeveloperPage() {
    if (developerPageIndex > 0) setDeveloperPageIndex(developerPageIndex - 1);
  }

  function handleSkillsChange(nextSelectedSkills: string[]) {
    setSelectedSkills(nextSelectedSkills);
    setDeveloperPageIndex(0);
  }

  function handleUsernameQueryChange(nextQuery: string) {
    setUsernameQuery(nextQuery);
    setDeveloperPageIndex(0);
  }

  return (
    <>
      <BuildersFilter
        skills={allSkills}
        selectedSkills={selectedSkills}
        onSelectedSkillsChange={handleSkillsChange}
        usernameQuery={usernameQuery}
        onUsernameQueryChange={handleUsernameQueryChange}
      />
      <div className="flex flex-col gap-6">
        {isLoadingDevelopers ? (
          <div className="p-4">Loading…</div>
        ) : (
          <BuildersTable developers={currentPageDevelopers} />
        )}

        <div className="flex items-center justify-between">
          <div className="text-sm opacity-70">{isFetchingDevelopers ? "Syncing…" : ""}</div>

          <div className="flex items-center gap-4">
            <button
              onClick={goToPreviousDeveloperPage}
              disabled={developerPageIndex === 0}
              className="btn btn-outline btn-sm flex items-center gap-1"
            >
              <ChevronLeftIcon className="h-5 w-5" />
              Prev
            </button>

            <span className="text-lg font-medium">
              Page {developerPageIndex + 1} of {totalDeveloperPages}
            </span>

            <button
              onClick={goToNextDeveloperPage}
              disabled={developerPageIndex + 1 >= totalDeveloperPages}
              className="btn btn-outline btn-sm flex items-center gap-1"
            >
              Next
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
