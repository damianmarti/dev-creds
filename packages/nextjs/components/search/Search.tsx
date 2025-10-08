"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowRightCircleIcon, MagnifyingGlassIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { useDebounced } from "~~/hooks";
import { searchDevelopers } from "~~/utils/graphql";

export const Search = () => {
  const router = useRouter();
  const [term, setTerm] = useState("");
  const debounced = useDebounced(term.trim(), 400);

  const { data, isFetching, isError } = useQuery({
    queryKey: ["searchDevelopers", debounced],
    queryFn: () => searchDevelopers(debounced),
    enabled: debounced.length > 0,
    staleTime: 30_000,
  });

  const exactMatch = useMemo(() => {
    if (!data?.developers?.items?.length || !debounced) return null;
    const lower = debounced.toLowerCase();
    return data.developers.items.find((d: { githubUser: string }) => d.githubUser?.toLowerCase() === lower) ?? null;
  }, [data, debounced]);

  const showMagnifier = !debounced || isFetching;
  const showArrow = !!exactMatch && !isFetching;
  const showCross = debounced.length > 0 && !isFetching && !exactMatch;

  const goToBuilder = () => {
    if (exactMatch) router.push(`/builder/${exactMatch.githubUser}`);
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = e => {
    if (e.key === "Enter" && exactMatch) {
      e.preventDefault();
      goToBuilder();
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={term}
          onChange={e => setTerm(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search username "
          className="input input-sm w-full pr-20"
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {showMagnifier && <MagnifyingGlassIcon className="w-3 h-3 text-base-content/60" />}
          {showArrow && (
            <button
              type="button"
              onClick={goToBuilder}
              className="p-0 m-0"
              aria-label={`Go to ${exactMatch.githubUser}`}
              title={`Go to ${exactMatch.githubUser}`}
            >
              <ArrowRightCircleIcon className="w-3 h-3 text-primary hover:opacity-80" />
            </button>
          )}
          {showCross && (
            <XCircleIcon className={`w-3 h-3 text-error`} title={isError ? "Search error" : "No exact match"} />
          )}
        </div>
      </div>
    </div>
  );
};
