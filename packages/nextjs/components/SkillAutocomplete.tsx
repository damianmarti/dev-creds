import { useState } from "react";
import { SKILLS } from "~~/utils/skills";

type SkillInputProps = {
  index: number;
  skill: string;
  updateSkill: (index: number, newValue: string) => void;
};

export function SkillAutocomplete({ index, skill, updateSkill }: SkillInputProps) {
  const [open, setOpen] = useState(false);

  const filtered = SKILLS.filter(s => s.toLowerCase().includes(skill.toLowerCase())).slice(0, 8);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filtered.length > 0) {
        // take the top suggestion
        updateSkill(index, filtered[0]);
      } else {
        // fallback to current input
        updateSkill(index, skill.trim());
      }
      setOpen(false);
    }
    if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={skill}
        onChange={e => {
          updateSkill(index, e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Enter a skill"
        className="input input-bordered w-full"
      />

      {open && filtered.length > 0 && (
        <ul className="menu menu-sm dropdown-content bg-base-100 rounded-box shadow-lg absolute z-10 mt-1 w-full">
          {filtered.map((skill, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => {
                  updateSkill(index, skill);
                  setOpen(false);
                }}
                className="text-left w-full"
              >
                {skill}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
