"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon, XMarkIcon } from "@heroicons/react/24/outline";

const skills = [
  "React",
  "Next.js",
  "Solidity",
  "Vyper",
  "Rust",
  "TypeScript",
  "Node.js",
  "Ethers.js",
  "Web3.js",
  "Hardhat",
  "Foundry",
  "The Graph",
  "IPFS",
];

export function BuildersFilter() {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSkills = (category: string) => {
    setSelectedSkills(prev => (prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]));
  };

  const removeSkills = (category: string) => {
    setSelectedSkills(prev => prev.filter(c => c !== category));
  };

  const clearAllSkills = () => {
    setSelectedSkills([]);
  };

  return (
    <div className="w-full mb-6">
      <div className="bg-base-200 rounded-box p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex flex-col gap-3 flex-1">
            <span className="text-sm font-medium text-base-content/70 whitespace-nowrap">Skills:</span>
            <div className="relative flex-1 max-w-xs" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="btn btn-outline btn-sm w-full justify-between"
              >
                <span className="text-left truncate">
                  {selectedSkills.length > 0 ? `${selectedSkills.length} selected` : "All Skills"}
                </span>
                <ChevronDownIcon
                  className={`w-4 h-4 flex-shrink-0 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-base-100 border border-base-300 rounded-box shadow-xl max-h-60 overflow-y-auto">
                  <div className="p-2 space-y-1">
                    {selectedSkills.length > 0 && (
                      <button onClick={clearAllSkills} className="btn btn-ghost btn-xs text-error hover:bg-error/10">
                        Clear All
                      </button>
                    )}
                    {skills.map(skill => (
                      <label
                        key={skill}
                        className="flex items-center gap-2 p-2 hover:bg-base-200 rounded-btn cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="checkbox checkbox-primary checkbox-xs"
                          checked={selectedSkills.includes(skill)}
                          onChange={() => toggleSkills(skill)}
                        />
                        <span className="text-sm text-base-content">{skill}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {selectedSkills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-base-300">
            {selectedSkills.map(skill => (
              <div key={skill} className="badge badge-primary badge-sm gap-1 py-2">
                <span>{skill}</span>
                <button
                  onClick={() => removeSkills(skill)}
                  className="hover:bg-primary-focus rounded-full p-0.5 transition-colors"
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
