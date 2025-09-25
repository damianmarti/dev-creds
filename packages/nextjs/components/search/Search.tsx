"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { searchDevelopers } from "~~/utils/graphql";

export const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const {
    data: searchResults,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["searchDevelopers", searchTerm],
    queryFn: () => searchDevelopers(searchTerm),
    enabled: hasSearched && searchTerm.length > 0,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setHasSearched(true);
    }
  };

  const resetSearch = () => {
    setSearchTerm("");
    setHasSearched(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Enter GitHub username..."
              className="input input-bordered w-full pr-12"
            />
            <MagnifyingGlassIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          <button type="submit" disabled={!searchTerm.trim() || isLoading} className="btn btn-primary">
            {isLoading ? <span className="loading loading-spinner loading-sm"></span> : "Search"}
          </button>
          {hasSearched && (
            <button type="button" onClick={resetSearch} className="btn btn-ghost">
              Clear
            </button>
          )}
        </div>
      </form>

      {/* Search Results */}
      {hasSearched && (
        <div className="bg-base-200 rounded-lg p-6">
          {error && (
            <div className="alert alert-error mb-4">
              <div>
                <h3 className="font-bold">Search Error</h3>
                <div className="text-xs">
                  Failed to search developers. Make sure Ponder is running on localhost:42069
                </div>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <span className="loading loading-spinner loading-lg"></span>
              <span className="ml-2">Searching developers...</span>
            </div>
          )}

          {!isLoading && !error && searchResults && (
            <>
              <div className="mb-4">
                <h2 className="text-2xl font-bold">Search Results for &quot;{searchTerm}&quot;</h2>
                <p className="text-sm text-base-content/70">
                  Found {searchResults.developers.items.length} developer(s)
                </p>
              </div>

              {searchResults.developers.items.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-lg text-base-content/70">
                    No developers found with GitHub username containing &quot;{searchTerm}&quot;
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {searchResults.developers.items.map(developer => (
                    <div key={developer.githubUser} className="bg-base-100 rounded-lg p-6 shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold">
                          <a
                            href={`https://github.com/${developer.githubUser}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary hover:underline"
                          >
                            @{developer.githubUser}
                          </a>
                        </h3>
                        <a
                          href={`/attestations/${developer.githubUser}`}
                          className="text-sm text-secondary hover:underline"
                        >
                          {developer.attestations.items.length} attestation(s)
                        </a>
                      </div>

                      {/* Skills */}
                      {developer.skills.items.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold mb-2">Skills:</h4>
                          <div className="flex flex-wrap gap-2">
                            {developer.skills.items
                              .sort((a, b) => b.count - a.count)
                              .map((skillData, index) => (
                                <div
                                  key={index}
                                  className="badge badge-primary badge-lg"
                                  title={`Score: ${skillData.score}, Attestations: ${skillData.count}`}
                                >
                                  {skillData.skill}
                                  <span className="ml-1 text-xs opacity-70">({skillData.count})</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
