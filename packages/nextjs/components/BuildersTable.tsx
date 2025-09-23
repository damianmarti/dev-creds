"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BuildersFilter, filterDevelopers } from "./BuildersFilter";
import { GithubSVG } from "./assets/GithubSVG";
import { Address } from "./scaffold-eth";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import scaffoldConfig from "~~/scaffold.config";
import type { AttestationsData } from "~~/types";
import { fetchAttestations } from "~~/utils/graphql";

const DEVELOPER_PAGE_SIZE = 30;
const ATTESTATION_PAGE_SIZE = 500;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

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

type Attestation = AttestationsData["attestations"]["items"][number];

function toDevelopers(rows: Attestation[], now = Date.now(), windowMs = THIRTY_DAYS_MS): DeveloperForTable[] {
  type Aggregate = {
    username: string;
    name: string;
    avatarUrl: string;
    githubUrl: string;
    skillSet: Set<string>;
    attesterSet: Set<string>;
    monthlyTotal: number;
    monthlyVerified: number;
  };

  const byUsername = new Map<string, Aggregate>();

  for (const row of rows) {
    const username = row.githubUser?.trim();

    let agg = byUsername.get(username);
    if (!agg) {
      agg = {
        username,
        name: username,
        avatarUrl: `https://github.com/${username}.png`,
        githubUrl: `https://github.com/${username}`,
        skillSet: new Set<string>(),
        attesterSet: new Set<string>(),
        monthlyTotal: 0,
        monthlyVerified: 0,
      };
      byUsername.set(username, agg);
    }

    if (row.skills) {
      for (const skill of row.skills) {
        const normalised = skill.trim().toLowerCase();
        if (normalised) {
          agg.skillSet.add(normalised.charAt(0).toUpperCase() + normalised.slice(1));
        }
      }
    }
    if (row.attester) agg.attesterSet.add(row.attester);

    const tsMs = (row.timestamp ?? 0) * 1000;
    const inWindow = tsMs >= now - windowMs;
    if (inWindow) {
      agg.monthlyTotal += 1;
    }
  }
  return Array.from(byUsername.values())
    .map(data => ({
      name: data.name,
      username: data.username,
      avatar: data.avatarUrl,
      githubUrl: data.githubUrl,
      monthlyAttestations: data.monthlyTotal,
      skills: Array.from(data.skillSet).sort(),
      attestations: { total: data.monthlyTotal, verified: data.monthlyVerified },
      topCollaborators: Array.from(data.attesterSet),
    }))
    .sort((d1, d2) =>
      d2.attestations.total !== d1.attestations.total
        ? d2.attestations.total - d1.attestations.total
        : d1.username.localeCompare(d2.username),
    );
}

function TableHeader() {
  return (
    <div className="hidden min-w-max grid-cols-12 gap-4 bg-base-200 p-4 text-sm font-medium text-base-content/70 md:grid md:min-w-0">
      <div className="col-span-5">Developer</div>
      <div className="col-span-3">Skills</div>
      <div className="col-span-2">Attestations</div>
      <div className="col-span-2">Top Collaborators</div>
    </div>
  );
}

function DeveloperRow({ developer }: { developer: DeveloperForTable }) {
  const maxVisible = 3;
  const visibleCollaborators = developer.topCollaborators.slice(0, maxVisible);
  const remainingCount = Math.max(0, developer.topCollaborators.length - maxVisible);

  return (
    <div className="w-full p-4 transition-colors hover:bg-base-200/50 md:grid md:grid-cols-12 md:items-center md:gap-4 rounded-xl border border-base-200 md:rounded-none md:border-0">
      {/* Developer */}
      <div className="flex items-center gap-3 md:col-span-5">
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
          <Link
            href={developer.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${developer.name}'s GitHub`}
          >
            <span className="text-sm text-base-content/70">@{developer.username}</span>
          </Link>
        </div>
      </div>

      <div className="mt-3 md:mt-0 md:col-span-3">
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

      <div className="mt-3 md:mt-0 md:col-span-2">
        <div className="flex flex-col gap-2">
          {visibleCollaborators.map(avatar => (
            <Address key={avatar} address={avatar} size="xs" onlyEnsOrAddress />
          ))}
          {remainingCount > 0 && (
            <div className="avatar placeholder">
              <div className="mask mask-squircle h-6 w-6 bg-neutral-focus text-neutral-content text-xs">
                <span>+{remainingCount}</span>
              </div>
            </div>
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
        {developers.map(dev => (
          <DeveloperRow key={dev.username} developer={dev} />
        ))}
      </div>
    </div>
  );
}

export function BuildersFromAttestations() {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [usernameQuery, setUsernameQuery] = useState("");
  const [developerPageIndex, setDeveloperPageIndex] = useState(0); // 0-based

  type PageParam = string | undefined;

  // Each attestation row type (from your GraphQL shape)
  type AttestationRow = AttestationsData["attestations"]["items"][number];

  const {
    data: infiniteAttestations,
    isLoading: isLoadingAttestations,
    hasNextPage: hasMoreAttestations,
    fetchNextPage: fetchNextAttestations,
    isFetching: isFetchingAttestations,
  } = useInfiniteQuery<AttestationsData, Error, AttestationsData, [string, number], PageParam>({
    queryKey: ["attestations", ATTESTATION_PAGE_SIZE],
    queryFn: ({ pageParam }) => fetchAttestations(ATTESTATION_PAGE_SIZE, pageParam),
    initialPageParam: undefined as PageParam,
    getNextPageParam: lastPage =>
      lastPage.attestations.pageInfo.hasNextPage ? lastPage.attestations.pageInfo.endCursor : undefined,
    refetchInterval: scaffoldConfig.pollingInterval,
  });

  const allAttestationRows = useMemo<AttestationRow[]>(() => {
    return (
      (infiniteAttestations as any)?.pages.flatMap((page: AttestationsData) => page.attestations?.items ?? []) ?? []
    );
  }, [infiniteAttestations]);

  const developers = useMemo(() => {
    return toDevelopers(allAttestationRows);
  }, [allAttestationRows]);

  const allSkills = useMemo(() => {
    return Array.from(new Set(developers.flatMap(developer => developer.skills)));
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
    } else if (hasMoreAttestations) {
      // optional: pull another attestation page to reveal more developers
      fetchNextAttestations();
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
        {isLoadingAttestations ? (
          <div className="p-4">Loading…</div>
        ) : (
          <BuildersTable developers={currentPageDevelopers} />
        )}

        <div className="flex items-center justify-between">
          <div className="text-sm opacity-70">{isFetchingAttestations ? "Syncing…" : ""}</div>

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
              disabled={developerPageIndex + 1 >= totalDeveloperPages && !hasMoreAttestations}
              className="btn btn-outline btn-sm flex items-center gap-1"
            >
              Next
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {hasMoreAttestations && (
          <div className="flex justify-end">
            <button onClick={() => fetchNextAttestations()} className="btn btn-ghost btn-xs">
              Load more data
            </button>
          </div>
        )}
      </div>
    </>
  );
}
