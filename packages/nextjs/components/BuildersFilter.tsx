"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon, XMarkIcon } from "@heroicons/react/24/outline";

const rankingOptions = [
  { id: "top-rated", label: "Top Rated" },
  { id: "most-attestations", label: "Most Attestations" },
  { id: "rising-stars", label: "Rising Stars" },
  { id: "most-collaborative", label: "Most Collaborative" },
];

const categories = [
  "Frontend Developers",
  "Smart Contract Devs",
  "Full Stack Engineers",
  "DevOps Engineers",
  "Blockchain Architects",
  "DeFi Builders",
  "NFT Creators",
  "Protocol Developers",
  "Security Auditors",
  "Technical Writers",
];

export function BuildersFilter() {
  const [activeRanking, setActiveRanking] = useState("top-rated");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
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

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => (prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]));
  };

  const removeCategory = (category: string) => {
    setSelectedCategories(prev => prev.filter(c => c !== category));
  };

  const clearAllCategories = () => {
    setSelectedCategories([]);
  };

  return (
    <div className="w-full mb-6">
      <div className="bg-base-200 rounded-box p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium text-base-content/70 whitespace-nowrap">Ranked by:</span>
            <div className="tabs tabs-boxed p-1">
              {rankingOptions.map(option => (
                <button
                  key={option.id}
                  onClick={() => setActiveRanking(option.id)}
                  className={`tab tab-sm ${
                    activeRanking === option.id
                      ? "tab-active bg-primary text-primary-content rounded-full"
                      : "text-base-content/70 hover:text-base-content rounded-full"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 flex-1">
            <span className="text-sm font-medium text-base-content/70 whitespace-nowrap">Categories:</span>
            <div className="relative flex-1 max-w-xs" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="btn btn-outline btn-sm w-full justify-between"
              >
                <span className="text-left truncate">
                  {selectedCategories.length > 0 ? `${selectedCategories.length} selected` : "All categories"}
                </span>
                <ChevronDownIcon
                  className={`w-4 h-4 flex-shrink-0 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-base-100 border border-base-300 rounded-box shadow-xl max-h-60 overflow-y-auto">
                  <div className="p-2 space-y-1">
                    {selectedCategories.length > 0 && (
                      <button
                        onClick={clearAllCategories}
                        className="btn btn-ghost btn-xs text-error hover:bg-error/10"
                      >
                        Clear All
                      </button>
                    )}
                    {categories.map(category => (
                      <label
                        key={category}
                        className="flex items-center gap-2 p-2 hover:bg-base-200 rounded-btn cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="checkbox checkbox-primary checkbox-xs"
                          checked={selectedCategories.includes(category)}
                          onChange={() => toggleCategory(category)}
                        />
                        <span className="text-sm text-base-content">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {selectedCategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-base-300">
            {selectedCategories.map(category => (
              <div key={category} className="badge badge-primary badge-sm gap-1 py-2">
                <span>{category}</span>
                <button
                  onClick={() => removeCategory(category)}
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
