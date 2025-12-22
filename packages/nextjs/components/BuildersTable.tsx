"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BuildersFilter } from "./BuildersFilter";
import { GithubSVG } from "./assets/GithubSVG";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import scaffoldConfig from "~~/scaffold.config";
import { DeveloperResult, DeveloperResultPage } from "~~/types";
import { fetchDevelopersForTable, fetchSkills } from "~~/utils/graphql";

const DEVELOPER_PAGE_SIZE = 30;

function TableHeader() {
  return (
    <div className="hidden min-w-max grid-cols-10 gap-4 bg-base-200 p-4 text-sm font-medium text-base-content/70 md:grid md:min-w-0">
      <div className="col-span-5">Developer</div>
      <div className="col-span-3">Skills</div>
      <div className="col-span-2">Attestations</div>
    </div>
  );
}

function DeveloperRow({ developer }: { developer: DeveloperResult }) {
  return (
    <div className="w-full p-4 transition-colors hover:bg-base-200/50 md:grid md:grid-cols-10 md:items-center md:gap-4">
      <div className="flex items-center gap-3 md:col-span-3">
        <div className="avatar">
          <div className="mask mask-squircle h-10 w-10 bg-base-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`https://github.com/${developer.githubUser}.png`} alt={developer.githubUser} />
          </div>
        </div>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <Link
              href={`/builder/${developer.githubUser}`}
              className="link link-hover text-base-content text-sm font-medium sm:text-base"
            >
              {developer.githubUser}
            </Link>
            <Link
              href={`https://github.com/${developer.githubUser}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${developer.githubUser}'s GitHub`}
            >
              <GithubSVG />
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-3 md:mt-0 md:col-span-5">
        <div className="flex flex-wrap gap-1">
          {developer.skills.map(skill => (
            <div key={skill.skill} className="badge badge-secondary badge-sm">
              {skill.skill}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 md:mt-0 md:col-span-2">
        <div className="font-medium text-base-content text-sm sm:text-base">
          {developer.attestationsCount} attestations{" "}
          <Link
            href={`/attestations/${developer.githubUser}`}
            className="text-xs text-primary hover:underline"
            aria-label={`View attestations for ${developer.githubUser}`}
          >
            (view all)
          </Link>
        </div>
      </div>
    </div>
  );
}

export function BuildersTable({ developers }: { developers: DeveloperResult[] }) {
  return (
    <div className="card border border-base-300 bg-base-100 shadow-xl overflow-x-auto">
      <TableHeader />
      <div className="divide-y divide-base-200 md:divide-y">
        {developers.length === 0 && <div className="p-4 text-center text-base-content/70">No builders found</div>}
        {developers.map(dev => (
          <DeveloperRow key={dev.githubUser} developer={dev} />
        ))}
      </div>
    </div>
  );
}

export function BuildersFromAttestations() {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [usernameQuery, setUsernameQuery] = useState("");
  const [offset, setOffset] = useState(0);

  const {
    data: devPage,
    isLoading: isLoadingDevelopers,
    isFetching: isFetchingDevelopers,
  } = useQuery<DeveloperResultPage>({
    queryKey: ["developers", DEVELOPER_PAGE_SIZE, offset, selectedSkills, usernameQuery],
    queryFn: () =>
      fetchDevelopersForTable({
        pageSize: DEVELOPER_PAGE_SIZE,
        skills: selectedSkills,
        offset: offset,
        search: usernameQuery,
      }),
    refetchInterval: scaffoldConfig.pollingInterval,
  });

  const {
    data: allSkills,
    isLoading: isSkillsLoading,
    isError: isSkillsError,
  } = useQuery({
    queryKey: ["skills"],
    queryFn: fetchSkills,
  });

  const developers = useMemo(() => devPage?.data || [], [devPage]);

  function goToNextDeveloperPage() {
    setOffset(offset + DEVELOPER_PAGE_SIZE);
  }

  function goToPreviousDeveloperPage() {
    setOffset(offset - DEVELOPER_PAGE_SIZE);
  }

  function handleSkillsChange(nextSelectedSkills: string[]) {
    setSelectedSkills(nextSelectedSkills);
    setOffset(0);
  }

  function handleUsernameQueryChange(nextQuery: string) {
    setUsernameQuery(nextQuery);
    setOffset(0);
  }

  return (
    <>
      {isSkillsLoading && <div>Loading...</div>}
      {isSkillsError && <div>Error loading skills.</div>}
      {!isSkillsLoading && !isSkillsError && (
        <BuildersFilter
          skills={allSkills || []}
          selectedSkills={selectedSkills}
          onSelectedSkillsChange={handleSkillsChange}
          usernameQuery={usernameQuery}
          onUsernameQueryChange={handleUsernameQueryChange}
        />
      )}
      <div className="flex flex-col gap-6 mb-8">
        {isLoadingDevelopers ? <div className="p-4">Loading…</div> : <BuildersTable developers={developers} />}

        <div className="flex items-center justify-between">
          <div className="text-sm opacity-70">{isFetchingDevelopers ? "Syncing…" : ""}</div>

          <div className="flex items-center gap-4">
            <button
              onClick={goToPreviousDeveloperPage}
              disabled={!devPage?.pagination.hasPreviousPage}
              className="btn btn-outline btn-sm flex items-center gap-1"
            >
              <ChevronLeftIcon className="h-5 w-5" />
              Prev
            </button>

            <span className="text-lg font-medium">
              Page {devPage?.pagination.currentPage} of {devPage?.pagination.totalPages}
            </span>

            <button
              onClick={goToNextDeveloperPage}
              disabled={!devPage?.pagination.hasNextPage}
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
