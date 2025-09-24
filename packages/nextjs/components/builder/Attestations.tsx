import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "wagmi/query";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { Attestation, AttestationsData } from "~~/types";
import { fetchUserAttestations } from "~~/utils/graphql";

function AttestationCard({ attestation }: { attestation: Attestation }) {
  return (
    <div className="relative border-l-2 border-primary/20 pl-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="mask mask-squircle h-10 w-10 bg-base-200"></div>
          </div>
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="font-medium text-base-content">(placeholderforcompute)</span>
              {attestation.verified && (
                <div className="badge badge-outline badge-success badge-sm">
                  <CheckCircleIcon className="mr-1 h-3 w-3" />
                  Verified
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-base-content/70">
              <span>@{attestation.attester}</span>
            </div>
          </div>
        </div>
        <span className="text-xs sm:text-sm text-base-content/70">
          {new Date(attestation.timestamp * 1000).toLocaleString()}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {attestation.skills.map((skill, i) => (
            <div key={i} className="badge badge-secondary badge-sm">
              {skill}
            </div>
          ))}
        </div>
        <p className="text-base-content text-sm sm:text-base">{attestation.description}</p>
        {attestation?.evidences?.map((url, i) => (
          <Link
            key={i}
            target="_blank"
            href={url}
            rel="noopener noreferrer"
            className="block text-xs sm:text-sm text-base-content/70 underline hover:text-primary"
          >
            {url}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function Attestations({ username }: { username: string }) {
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const pageSize = 5;

  const {
    data: attestationsData,
    isLoading: isAttestationsLoading,
    error: attestationsError,
    refetch: refetchAttestations,
    isFetching: isAttestationsFetching,
  } = useQuery({
    queryKey: ["userAttestations", username, cursor],
    queryFn: () => fetchUserAttestations(username, pageSize, cursor),
  });

  const attestations = useMemo(
    () => (attestationsData as AttestationsData)?.attestations.items ?? [],
    [attestationsData],
  );

  const hasNextPage = Boolean((attestationsData as AttestationsData)?.attestations.pageInfo.hasNextPage);
  const pageNumber = cursorStack.length + 1;

  function goToNextPage() {
    if (!hasNextPage) return;
    const nextCursor = (attestationsData as AttestationsData)?.attestations.pageInfo.endCursor;
    if (!nextCursor) return;
    setCursorStack(previous => [...previous, cursor || ""]);
    setCursor(nextCursor);
  }

  function goToPreviousPage() {
    if (cursorStack.length === 0) return;
    const previousCursor = cursorStack[cursorStack.length - 1] || undefined;
    setCursorStack(previous => previous.slice(0, -1));
    setCursor(previousCursor);
  }

  if (attestationsError) {
    return (
      <div className="card border border-base-300 bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="alert alert-error">
            <span>Failed to load attestations.</span>
            <button className="btn btn-xs ml-auto" onClick={() => refetchAttestations()}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card border border-base-300 bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex items-center justify-between">
          <h2 className="card-title font-serif text-xl sm:text-2xl">Recent Attestations</h2>

          <div className="flex items-center gap-3">
            {isAttestationsFetching && <span className="text-xs text-base-content/60">Syncing…</span>}
          </div>
        </div>

        {isAttestationsLoading ? (
          <div className="space-y-4 mt-4">
            {[0, 1, 2].map(index => (
              <div key={index} className="bg-base-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="skeleton h-10 w-10 rounded-lg" />
                    <div>
                      <div className="skeleton h-4 w-40 mb-2" />
                      <div className="skeleton h-3 w-24" />
                    </div>
                  </div>
                  <div className="skeleton h-3 w-20" />
                </div>
                <div className="skeleton h-3 w-28 mb-3" />
                <div className="skeleton h-14 w-full" />
              </div>
            ))}
          </div>
        ) : attestations.length === 0 ? (
          <div className="mt-6 text-center text-base-content/70">No attestations found.</div>
        ) : (
          <div className="space-y-6 mt-4">
            {attestations.map(attestation => (
              <AttestationCard key={attestation.id} attestation={attestation} />
            ))}
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={goToPreviousPage}
                disabled={cursorStack.length === 0 || isAttestationsLoading}
                className="btn btn-outline btn-sm"
                aria-label="Previous page"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <span className="text-sm font-medium">Page {pageNumber}</span>
              <button
                onClick={goToNextPage}
                disabled={!hasNextPage || isAttestationsLoading}
                className="btn btn-outline btn-sm"
                aria-label="Next page"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
