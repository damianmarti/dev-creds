"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { GithubSVG } from "../components/assets/GithubSVG";
import { ReusuableStats } from "./DisplayStats";
import { useQuery } from "wagmi/query";
import { ChatBubbleLeftRightIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { AttestationsData, Skill, SkillsData } from "~~/types";
import { fetchUserAttestations, fetchUserSkills } from "~~/utils/graphql";

interface BuilderProfileProps {
  username: string;
}

interface Attestation {
  id: string;
  attester: string;
  skills: string[];
  description: string;
  evidence?: string[];
  timestamp: number;
  verified?: boolean;
}

const SKILLS_PAGE_SIZE = 4;

const profile = {
  credScore: 2847,
  attestations: 156,
  verifiedAttestations: 14,
};

function ProfileHeader({ username }: { username: string }) {
  const avatarUrl = `https://github.com/${username}.png`;
  const githubUrl = `https://github.com/${username}`;
  return (
    <div className="card border border-base-300 bg-base-100 shadow-xl">
      <div className="card-body p-6 sm:p-8">
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
          <div className="flex flex-col items-center gap-4 md:items-start">
            <div className="avatar">
              <div className="mask mask-squircle h-28 w-28 sm:h-32 sm:w-32 bg-base-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={avatarUrl} alt={username} />
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm flex items-center gap-2"
              >
                <GithubSVG />
                GitHub
              </Link>
              <Link
                href={{ pathname: "/attest", query: { username } }}
                className="btn btn-primary btn-sm flex items-center gap-2"
                prefetch={false}
                aria-label={`Attest for ${username}`}
              >
                <ChatBubbleLeftRightIcon className="h-4 w-4" />
                <span>Attest</span>
              </Link>
            </div>
          </div>

          <div className="flex-1 space-y-4 text-center md:text-left">
            <div>
              <h1 className="text-3xl font-bold font-serif text-base-content sm:text-4xl">(find name from username)</h1>
              <p className="text-base-content/70">@{username}</p>
              <p className="mt-2 text-base-content text-sm sm:text-base">(placeholder for bio)</p>
            </div>
            <StatsGrid username={username} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsGrid({ username }: { username: string }) {
  console.log("Rendering stats for", username);
  const stats = [
    { label: "Cred Score", value: profile.credScore },
    { label: "Attestations", value: profile.attestations },
    { label: "Verified Attestations", value: profile.verifiedAttestations },
  ];
  return <ReusuableStats stats={stats} />;
}

export function SkillsSection({ username }: { username: string }) {
  const {
    data: skillsData,
    isLoading: isSkillsLoading,
    isError: isSkillsError,
    refetch: refetchSkills,
  } = useQuery({
    queryKey: ["userSkills", username] as const,
    queryFn: () => fetchUserSkills(username),
    enabled: Boolean(username),
  });

  const [skillsPageIndex, setSkillsPageIndex] = useState(0);

  useEffect(() => {
    setSkillsPageIndex(0);
  }, [username, skillsData]);

  const rankedSkills: Skill[] = useMemo(() => {
    if (isSkillsLoading || isSkillsError) return [];
    const source = (skillsData as SkillsData).developerSkills?.items ?? [];
    return source
      .map(item => ({
        skill: item.skill,
        count: item.count,
        score: item.score,
      }))
      .sort((a, b) => (b.count !== a.count ? b.count - a.count : b.score - a.score));
  }, [skillsData, isSkillsLoading, isSkillsError]);

  const totalSkillsPages = Math.max(1, Math.ceil(rankedSkills.length / SKILLS_PAGE_SIZE));

  const currentPageSkills = useMemo(() => {
    const startIndex = skillsPageIndex * SKILLS_PAGE_SIZE;
    return rankedSkills.slice(startIndex, startIndex + SKILLS_PAGE_SIZE);
  }, [rankedSkills, skillsPageIndex]);

  function goToPreviousSkillsPage() {
    if (skillsPageIndex > 0) setSkillsPageIndex(skillsPageIndex - 1);
  }

  function goToNextSkillsPage() {
    if (skillsPageIndex + 1 < totalSkillsPages) setSkillsPageIndex(skillsPageIndex + 1);
  }

  return (
    <div className="card border border-base-300 bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="card-title font-serif flex items-center gap-2 text-xl sm:text-2xl">Verified Skills</h2>
            <p className="text-base-content/70 text-sm mt-0">Skills verified through peer attestations and evidence</p>
          </div>

          <div className="flex items-center gap-3">
            {isSkillsLoading && <span className="text-xs text-base-content/60">Loading…</span>}
          </div>
        </div>

        {isSkillsError ? (
          <div className="alert alert-error mt-4">
            <span>Failed to load skills.</span>
            <button className="btn btn-xs ml-auto" onClick={() => refetchSkills()}>
              Retry
            </button>
          </div>
        ) : isSkillsLoading ? (
          <div className="flex flex-col gap-4 mt-4">
            {[0, 1, 2, 3, 4].map(index => (
              <div key={index} className="rounded-lg border border-base-200 p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="skeleton h-4 w-40 mb-2" />
                  <div className="skeleton h-5 w-10" />
                </div>
                <div className="skeleton h-3 w-24" />
              </div>
            ))}
          </div>
        ) : rankedSkills.length === 0 ? (
          <div className="mt-4 text-base-content/70">No verified skills yet.</div>
        ) : (
          <div className="flex flex-col gap-4 mt-4">
            {currentPageSkills.map(skill => (
              <SkillCard key={skill.skill} skill={skill} />
            ))}
            {!isSkillsLoading && rankedSkills.length > 0 && (
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={goToPreviousSkillsPage}
                  disabled={skillsPageIndex === 0}
                  className="btn btn-outline btn-xs"
                  aria-label="Previous skills page"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
                <span className="text-sm font-medium">
                  Page {skillsPageIndex + 1} of {totalSkillsPages}
                </span>
                <button
                  onClick={goToNextSkillsPage}
                  disabled={skillsPageIndex + 1 >= totalSkillsPages}
                  className="btn btn-outline btn-xs"
                  aria-label="Next skills page"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SkillCard({ skill }: { skill: Skill }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-base-200 p-3 sm:p-4">
      <div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-base-content text-sm sm:text-base">{skill.skill}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-base-content/70">
          <span className="badge badge-success badge-sm">{skill.score} verified</span>
          Total {skill.count} attestations
        </div>
      </div>
    </div>
  );
}

function AttestationsSection({ username }: { username: string }) {
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const pageSize = 3;

  const {
    data: attestationsData,
    isLoading: isAttestationsLoading,
    error: attestationsError,
    refetch: refetchAttestations,
    isFetching: isAttestationsFetching,
  } = useQuery({
    queryKey: ["userAttestations", username, cursor],
    queryFn: () => fetchUserAttestations(username, pageSize, cursor),
  });

  const attestations = useMemo(
    () => (attestationsData as AttestationsData)?.attestations.items ?? [],
    [attestationsData],
  );

  const hasNextPage = Boolean((attestationsData as AttestationsData)?.attestations.pageInfo.hasNextPage);
  const pageNumber = cursorStack.length + 1;

  function goToNextPage() {
    if (!hasNextPage) return;
    const nextCursor = (attestationsData as AttestationsData)?.attestations.pageInfo.endCursor;
    if (!nextCursor) return;
    setCursorStack(previous => [...previous, cursor || ""]);
    setCursor(nextCursor);
  }

  function goToPreviousPage() {
    if (cursorStack.length === 0) return;
    const previousCursor = cursorStack[cursorStack.length - 1] || undefined;
    setCursorStack(previous => previous.slice(0, -1));
    setCursor(previousCursor);
  }

  if (attestationsError) {
    return (
      <div className="card border border-base-300 bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="alert alert-error">
            <span>Failed to load attestations.</span>
            <button className="btn btn-xs ml-auto" onClick={() => refetchAttestations()}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card border border-base-300 bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex items-center justify-between">
          <h2 className="card-title font-serif text-xl sm:text-2xl">Recent Attestations</h2>

          <div className="flex items-center gap-3">
            {isAttestationsFetching && <span className="text-xs text-base-content/60">Syncing…</span>}
          </div>
        </div>

        {isAttestationsLoading ? (
          <div className="space-y-4 mt-4">
            {[0, 1, 2].map(index => (
              <div key={index} className="bg-base-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="skeleton h-10 w-10 rounded-lg" />
                    <div>
                      <div className="skeleton h-4 w-40 mb-2" />
                      <div className="skeleton h-3 w-24" />
                    </div>
                  </div>
                  <div className="skeleton h-3 w-20" />
                </div>
                <div className="skeleton h-3 w-28 mb-3" />
                <div className="skeleton h-14 w-full" />
              </div>
            ))}
          </div>
        ) : attestations.length === 0 ? (
          <div className="mt-6 text-center text-base-content/70">No attestations found.</div>
        ) : (
          <div className="space-y-6 mt-4">
            {attestations.map(attestation => (
              <AttestationCard key={attestation.id} attestation={attestation} />
            ))}
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={goToPreviousPage}
                disabled={cursorStack.length === 0 || isAttestationsLoading}
                className="btn btn-outline btn-sm"
                aria-label="Previous page"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <span className="text-sm font-medium">Page {pageNumber}</span>
              <button
                onClick={goToNextPage}
                disabled={!hasNextPage || isAttestationsLoading}
                className="btn btn-outline btn-sm"
                aria-label="Next page"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AttestationCard({ attestation }: { attestation: Attestation }) {
  return (
    <div className="relative border-l-2 border-primary/20 pl-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="mask mask-squircle h-10 w-10 bg-base-200"></div>
          </div>
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="font-medium text-base-content">(placeholderforcompute)</span>
              {attestation.verified && (
                <div className="badge badge-outline badge-success badge-sm">
                  <CheckCircleIcon className="mr-1 h-3 w-3" />
                  Verified
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-base-content/70">
              <span>@{attestation.attester}</span>
            </div>
          </div>
        </div>
        <span className="text-xs sm:text-sm text-base-content/70">
          {new Date(attestation.timestamp * 1000).toLocaleString()}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {attestation.skills.map((skill, i) => (
            <div key={i} className="badge badge-secondary badge-sm">
              {skill}
            </div>
          ))}
        </div>
        <p className="text-base-content text-sm sm:text-base">{attestation.description}</p>
        {attestation?.evidence?.map((url, i) => (
          <Link
            key={i}
            target="_blank"
            href={url}
            rel="noopener noreferrer"
            className="block text-xs sm:text-sm text-base-content/70 underline hover:text-primary"
          >
            {url}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function BuilderProfile({ username }: BuilderProfileProps) {
  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6 md:p-8">
      <ProfileHeader username={username} />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AttestationsSection username={username} />
        </div>
        <div className="lg:col-span-1">
          <SkillsSection username={username} />
        </div>
      </div>
    </div>
  );
}
