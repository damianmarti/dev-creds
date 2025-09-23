import { useEffect, useMemo, useState } from "react";
import { useQuery } from "wagmi/query";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { Skill, SkillsData } from "~~/types";
import { fetchUserSkills } from "~~/utils/graphql";

const SKILLS_PAGE_SIZE = 4;

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

export function Skills({ username }: { username: string }) {
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
