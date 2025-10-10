"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { ChevronDownIcon, XMarkIcon } from "@heroicons/react/24/outline";

type BuildersFilterProps = {
  skills: string[];
  selectedSkills?: string[];
  onSelectedSkillsChange?: (nextSelectedSkills: string[]) => void;
  usernameQuery?: string;
  onUsernameQueryChange?: (nextQuery: string) => void;
  skillsPlaceholder?: string;
  usernamePlaceholder?: string;
};

function normalizeSkill(skill: string) {
  return skill.trim().toLowerCase();
}

function displayLabel(skill: string) {
  return skill.trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeSkills(skills: string[]) {
  const normalizedMap = new Map<string, string>();
  for (const rawSkill of skills) {
    const key = normalizeSkill(rawSkill);
    if (!key) continue;
    if (!normalizedMap.has(key)) normalizedMap.set(key, displayLabel(rawSkill));
  }
  return Array.from(normalizedMap.entries())
    .sort((left, right) => left[1].localeCompare(right[1]))
    .map(([key, label]) => ({ key, label }));
}

export function BuildersFilter({
  skills,
  selectedSkills,
  onSelectedSkillsChange,
  usernameQuery,
  onUsernameQueryChange,
  skillsPlaceholder = "All skills",
  usernamePlaceholder = "Search by GitHub username",
}: BuildersFilterProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [skillsSearchQuery, setSkillsSearchQuery] = useState("");

  const [internalSelectedSkills, setInternalSelectedSkills] = useState<string[]>([]);
  const [internalUsernameQuery, setInternalUsernameQuery] = useState("");

  const effectiveSelectedSkills = selectedSkills ?? internalSelectedSkills;
  const effectiveUsernameQuery = usernameQuery ?? internalUsernameQuery;

  const normalizedSkills = useMemo(() => normalizeSkills(skills), [skills]);

  const visibleSkillOptions = useMemo(() => {
    const query = skillsSearchQuery.trim().toLowerCase();
    if (!query) return normalizedSkills;
    return normalizedSkills.filter(option => option.label.toLowerCase().includes(query));
  }, [normalizedSkills, skillsSearchQuery]);

  useEffect(() => {
    function handleDocumentClick(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === "Escape") setDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleDocumentClick);
    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  function emitSelectedSkills(nextSelectedSkills: string[]) {
    if (onSelectedSkillsChange) onSelectedSkillsChange(nextSelectedSkills);
    if (selectedSkills === undefined) setInternalSelectedSkills(nextSelectedSkills);
  }

  function emitUsernameQuery(nextQuery: string) {
    if (onUsernameQueryChange) onUsernameQueryChange(nextQuery);
    if (usernameQuery === undefined) setInternalUsernameQuery(nextQuery);
  }

  function toggleSkill(skillKey: string) {
    if (effectiveSelectedSkills.includes(skillKey)) {
      emitSelectedSkills(effectiveSelectedSkills.filter(existing => existing !== skillKey));
    } else {
      emitSelectedSkills([...effectiveSelectedSkills, skillKey]);
    }
  }

  function removeSkill(skillKey: string) {
    emitSelectedSkills(effectiveSelectedSkills.filter(existing => existing !== skillKey));
  }

  function clearAllSelectedSkills() {
    emitSelectedSkills([]);
  }

  function selectAllVisibleSkills() {
    const visibleKeys = visibleSkillOptions.map(option => option.key);
    const preservedKeys = effectiveSelectedSkills.filter(
      key => !visibleSkillOptions.some(option => option.key === key),
    );
    emitSelectedSkills([...new Set([...preservedKeys, ...visibleKeys])]);
  }

  const skillsButtonLabel =
    effectiveSelectedSkills.length > 0 ? `${effectiveSelectedSkills.length} selected` : skillsPlaceholder;

  return (
    <div className="w-full mb-6">
      <div className="bg-base-200 rounded-box p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium text-base-content/70 mb-2 block">GitHub Username</label>

            <div className="flex-1 relative">
              <input
                type="text"
                value={effectiveUsernameQuery}
                onChange={event => emitUsernameQuery(event.target.value)}
                placeholder={usernamePlaceholder}
                className="input input-sm input-bordered w-full"
              />
              <MagnifyingGlassIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="flex-1">
            <label className="text-sm font-medium text-base-content/70 mb-2 block">Skills</label>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(prev => !prev)}
                className="btn btn-outline btn-sm w-full justify-between"
                aria-haspopup="listbox"
                aria-expanded={isDropdownOpen}
              >
                <span className="text-left truncate">{skillsButtonLabel}</span>
                <ChevronDownIcon className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-base-100 border border-base-300 rounded-box shadow-xl max-h-72 overflow-y-auto">
                  <div className="p-2 space-y-2">
                    <input
                      type="text"
                      value={skillsSearchQuery}
                      onChange={event => setSkillsSearchQuery(event.target.value)}
                      placeholder="Search skills…"
                      className="input input-sm input-bordered w-full"
                    />
                    <div className="flex gap-2">
                      {effectiveSelectedSkills.length > 0 && (
                        <button
                          onClick={clearAllSelectedSkills}
                          className="btn btn-ghost btn-xs text-error hover:bg-error/10"
                        >
                          Clear all
                        </button>
                      )}
                      {visibleSkillOptions.length > 0 && (
                        <button onClick={selectAllVisibleSkills} className="btn btn-ghost btn-xs">
                          Select all shown
                        </button>
                      )}
                    </div>

                    <ul role="listbox" className="space-y-1">
                      {visibleSkillOptions.length === 0 ? (
                        <li className="text-sm text-base-content/60 px-2 py-3">No skills match.</li>
                      ) : (
                        visibleSkillOptions.map(option => (
                          <li key={option.key}>
                            <label className="flex items-center gap-2 p-2 hover:bg-base-200 rounded-btn cursor-pointer">
                              <input
                                type="checkbox"
                                className="checkbox checkbox-primary checkbox-xs"
                                checked={effectiveSelectedSkills.includes(option.key)}
                                onChange={() => toggleSkill(option.key)}
                              />
                              <span className="text-sm text-base-content">{option.label}</span>
                            </label>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {effectiveSelectedSkills.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-base-300">
            {effectiveSelectedSkills
              .map(skillKey => normalizedSkills.find(option => option.key === skillKey))
              .filter((option): option is { key: string; label: string } => Boolean(option))
              .map(option => (
                <div key={option.key} className="badge badge-primary badge-sm gap-1 py-2 cursor-pointer">
                  <span>{option.label}</span>
                  <button
                    onClick={() => removeSkill(option.key)}
                    className="hover:bg-primary-focus rounded-full p-0.5 transition-colors cursor-pointer"
                    aria-label={`Remove ${option.label}`}
                  >
                    <XMarkIcon className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
