"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useDebounced } from "~~/hooks";
import { searchDevelopers } from "~~/utils/graphql";

type DevItem = {
  githubUser: string;
  skills?: { items: { skill: string; count: number; score: number }[] };
  attestations?: { items: { id: string }[] };
};

const LIMIT = 8;

export const Search = () => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);

  const debounced = useDebounced(term.trim().replace(/^@+/, ""), 400);

  const { data, isFetching, isError } = useQuery({
    queryKey: ["searchDevelopers", debounced],
    queryFn: () => searchDevelopers(debounced),
    enabled: debounced.length > 0,
    staleTime: 30_000,
  });

  const items: DevItem[] = useMemo(() => (data?.developers?.items ?? []).slice(0, LIMIT), [data]);

  const exactMatch = useMemo(() => {
    if (!items.length || !debounced) return null;
    const lower = debounced.toLowerCase();
    return items.find(d => d.githubUser?.toLowerCase() === lower) ?? null;
  }, [items, debounced]);

  const goToBuilder = (username?: string) => {
    const u = username ?? exactMatch?.githubUser;
    if (u) router.push(`/builder/${u}`);
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = e => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (exactMatch) {
        goToBuilder();
        setOpen(false);
        setTerm("");
        return;
      }
      if (items.length > 0) {
        goToBuilder(items[0].githubUser);
        setOpen(false);
        setTerm("");
      }
    }
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const onBlur = () => setTimeout(() => setOpen(false), 100);

  return (
    <div className="max-w-xl mx-auto relative ml-4">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={term}
          onChange={e => {
            setTerm(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          placeholder="Search username"
          className="input input-sm w-full pr-20"
          aria-haspopup="listbox"
          autoComplete="off"
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <MagnifyingGlassIcon className="w-4 h-4 text-base-content/60" />
        </div>
      </div>

      {open && debounced !== "" && (
        <ul
          role="listbox"
          className="menu menu-sm dropdown-content bg-base-100 rounded-box shadow-lg absolute z-10 mt-1 w-full border border-base-300"
          onMouseDown={e => e.preventDefault()}
        >
          {items.length === 0 && !isFetching && !isError && (
            <li className="menu-title text-xs text-base-content/60 px-3 py-2">
              <span>No developers found</span>
            </li>
          )}

          {items.map((dev, i) => {
            return (
              <li key={`${dev.githubUser}-${i}`}>
                <button
                  type="button"
                  className="text-left w-full hover:bg-base-200"
                  onClick={() => {
                    goToBuilder(dev.githubUser);
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono">@{dev.githubUser}</span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
