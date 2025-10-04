import { useMemo, useRef, useState } from "react";
import { SKILLS } from "~~/utils/skills";

type SkillInputProps = {
  index: number;
  skill: string;
  updateSkill: (index: number, newValue: string) => void;
};

const LIMIT = { popular: 12, search: 8 };

export function SkillAutocomplete({ index, skill, updateSkill }: SkillInputProps) {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const normalizedInput = skill.trim();
  const searchTerm = normalizedInput.toLowerCase();

  const filteredSkills = useMemo(() => {
    if (searchTerm === "") return SKILLS.slice(0, LIMIT.popular);
    return SKILLS.filter(s => s.toLowerCase().includes(searchTerm)).slice(0, LIMIT.search);
  }, [searchTerm]);

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setDropdownOpen(true);
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();

      const chosen = filteredSkills.length > 0 ? filteredSkills[0] : searchTerm ? normalizedInput : undefined;

      if (chosen) updateSkill(index, chosen);

      setDropdownOpen(false);
      inputRef.current?.blur();
      return;
    }

    if (e.key === "Escape") {
      setDropdownOpen(false);
      inputRef.current?.blur();
    }
  };

  const shouldRenderDropdown = isDropdownOpen && (searchTerm === "" || filteredSkills.length > 0);

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        aria-haspopup="listbox"
        autoComplete="off"
        value={skill}
        onChange={e => {
          updateSkill(index, e.target.value);
          setDropdownOpen(true);
        }}
        onFocus={() => setDropdownOpen(true)}
        onBlur={() => setDropdownOpen(false)}
        onKeyDown={onInputKeyDown}
        placeholder="Type to search skills..."
        className="input input-bordered w-full"
      />

      {isDropdownOpen && searchTerm !== "" && (
        <div className="text-xs text-base-content/70 mt-1 ml-1">
          {filteredSkills.length === 0
            ? `No skills found. Press Enter to use "${normalizedInput}"`
            : `${filteredSkills.length} skill${filteredSkills.length !== 1 ? "s" : ""} found`}
        </div>
      )}

      {shouldRenderDropdown && (
        <ul
          role="listbox"
          className="menu menu-sm dropdown-content bg-base-100 rounded-box shadow-lg absolute z-10 mt-1 w-full border border-base-300"
        >
          {searchTerm === "" && (
            <li className="menu-title text-xs text-base-content/60 px-3 py-2">
              <span>Popular skills • Type to search all skills</span>
            </li>
          )}

          {filteredSkills.map((skillOption, i) => (
            <li key={i}>
              <button
                type="button"
                onPointerDown={e => {
                  e.preventDefault();
                  updateSkill(index, skillOption);
                  setDropdownOpen(false);
                  inputRef.current?.blur();
                }}
                className="text-left w-full hover:bg-base-200"
              >
                {skillOption}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
