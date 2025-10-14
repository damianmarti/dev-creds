import { useMemo, useState } from "react";
import { useQuery } from "wagmi/query";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { Skill, SkillsData } from "~~/types";
import { fetchUserSkills } from "~~/utils/graphql";

const SKILLS_PAGE_SIZE = 20;

function SkillCard({ skill }: { skill: Skill }) {
  const verificationRate = skill.count > 0 ? Math.round((skill.verifiedCount / skill.count) * 100) : 0;
  const collaboratorRate = skill.count > 0 ? Math.round((skill.collaboratorCount / skill.count) * 100) : 0;

  return (
    <div className="tooltip tooltip-top">
      <div className="tooltip-content bg-base-200 border border-base-300 rounded-lg p-4 shadow-lg max-w-xs">
        <div className="space-y-3">
          <div className="border-b border-base-300 pb-2">
            <h3 className="font-semibold text-base-content text-base">{skill.skill}</h3>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center gap-2">
              <span className="text-sm text-base-content/80">Total Attestations</span>
              <span className="badge badge-neutral badge-sm">{skill.count}</span>
            </div>

            <div className="flex justify-between items-center gap-2">
              <span className="text-sm text-base-content/80">Verified Evidence</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-base-content/60">({verificationRate}%)</span>
                <span className="badge badge-success badge-sm">{skill.verifiedCount}</span>
              </div>
            </div>

            <div className="flex justify-between items-center gap-2">
              <span className="text-sm text-base-content/80">Collaborator Attested</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-base-content/60">({collaboratorRate}%)</span>
                <span className="badge badge-warning badge-sm">{skill.collaboratorCount}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-base-300 pt-2">
            <div className="flex justify-between items-center gap-2">
              <span className="font-medium text-base-content">Total Score</span>
              <span className="badge badge-primary font-bold">{skill.score}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="indicator mr-8 mt-6">
        <span className="indicator-item badge badge-primary font-bold">{skill.score}</span>
        <div className="badge badge-secondary badge-lg p-1">{skill.skill}</div>
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

  const allSkillsItems = useMemo(() => {
    return (skillsData as SkillsData)?.developerSkills?.items ?? [];
  }, [skillsData]);

  const totalSkillsPages = Math.max(1, Math.ceil(allSkillsItems.length / SKILLS_PAGE_SIZE));

  const currentPageSkills = useMemo(() => {
    const startIndex = skillsPageIndex * SKILLS_PAGE_SIZE;
    return allSkillsItems.slice(startIndex, startIndex + SKILLS_PAGE_SIZE);
  }, [allSkillsItems, skillsPageIndex]);

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
        ) : allSkillsItems.length === 0 ? (
          <div className="mt-4 text-base-content/70">No verified skills yet.</div>
        ) : (
          <div className="">
            {currentPageSkills.map(skill => (
              <SkillCard key={skill.skill} skill={skill} />
            ))}
            {!isSkillsLoading && allSkillsItems.length > SKILLS_PAGE_SIZE && (
              <div className="flex items-center justify-end gap-2 mt-4">
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
