import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowTopRightOnSquareIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import scaffoldConfig from "~~/scaffold.config";
import { fetchAttestations } from "~~/utils/graphql";

export const List = () => {
  const targetNetwork = scaffoldConfig.targetNetworks[0];
  const easConfig = scaffoldConfig.easConfig[targetNetwork.id];

  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [cursors, setCursors] = useState<string[]>([]);
  const pageSize = 15;

  const { data: attestationsData, isLoading } = useQuery({
    queryKey: ["attestations", cursor],
    queryFn: () => fetchAttestations(pageSize, cursor),
    refetchInterval: scaffoldConfig.pollingInterval,
  });

  const goNext = () => {
    if (attestationsData?.attestations.pageInfo.hasNextPage) {
      const newCursor = attestationsData.attestations.pageInfo.endCursor;
      if (newCursor) {
        setCursors(prev => [...prev, cursor || ""]);
        setCursor(newCursor);
      }
    }
  };

  const goPrevious = () => {
    if (cursors.length > 0) {
      const previousCursor = cursors[cursors.length - 1];
      setCursors(prev => prev.slice(0, -1));
      setCursor(previousCursor || undefined);
    }
  };

  const HeaderBar = () => (
    <div className="hidden min-w-max grid-cols-8 gap-4 bg-base-200 p-4 text-sm font-medium text-base-content/70 md:grid md:min-w-0">
      <div className="col-span-2">Attester</div>
      <div className="col-span-2">GitHub User</div>
      <div className="col-span-2">Skills</div>
      <div className="col-span-1">Attested at</div>
      <div className="col-span-1 text-right">Link</div>
    </div>
  );

  return (
    <div className="w-full mt-12 mb-12">
      <div className="card border border-base-300 bg-base-100 shadow-xl overflow-x-auto">
        <HeaderBar />

        <div className="divide-y divide-base-200 md:divide-y">
          {isLoading &&
            Array.from({ length: 10 }).map((_, rowIndex) => (
              <div
                key={rowIndex}
                className="w-full p-4 md:grid md:grid-cols-8 md:items-center md:gap-4 transition-colors"
              >
                <div className="md:col-span-2">
                  <div className="h-4 w-40 rounded bg-base-200 animate-pulse" />
                </div>
                <div className="mt-3 md:mt-0 md:col-span-2">
                  <div className="h-4 w-48 rounded bg-base-200 animate-pulse" />
                </div>
                <div className="mt-3 md:mt-0 md:col-span-2">
                  <div className="h-4 w-56 rounded bg-base-200 animate-pulse" />
                </div>
                <div className="mt-3 md:mt-0 md:col-span-1">
                  <div className="h-4 w-32 rounded bg-base-200 animate-pulse" />
                </div>
                <div className="mt-3 md:mt-0 md:col-span-1 flex justify-end">
                  <div className="h-8 w-20 rounded-full bg-base-200 animate-pulse" />
                </div>
              </div>
            ))}

          {!isLoading &&
            attestationsData?.attestations.items.map(attestation => (
              <div
                key={attestation.id}
                className="w-full p-4 transition-colors hover:bg-base-200/50 md:grid md:grid-cols-8 md:items-center md:gap-4"
              >
                <div className="md:col-span-2 grid grid-cols-3 md:flex">
                  <div className="md:hidden col-span-1 text-sm opacity-80">Attester:</div>
                  <div className="col-span-2">
                    <Address address={attestation.attester} size="sm" />
                  </div>
                </div>

                <div className="mt-3 md:mt-0 md:col-span-2">
                  <div className="grid grid-cols-3 md:flex">
                    <div className="md:hidden col-span-1 text-sm opacity-80">GitHub User:</div>
                    <div className="col-span-2 flex flex-col">
                      <a
                        href={`https://github.com/${attestation.githubUser}`}
                        target="_blank"
                        rel="noreferrer"
                        className="link link-hover text-base-content text-sm font-medium sm:text-base"
                      >
                        @{attestation.githubUser}
                      </a>
                      <a
                        href={`/attestations/${attestation.githubUser}`}
                        className="text-xs text-primary hover:underline"
                      >
                        (view all)
                      </a>
                    </div>
                  </div>
                </div>

                <div className="mt-3 md:mt-0 md:col-span-2">
                  <div className="grid grid-cols-3 md:flex">
                    <div className="md:hidden col-span-1 text-sm opacity-80">Skills:</div>
                    <div className="col-span-2 flex flex-col">
                      <div className="flex flex-wrap gap-1">
                        {attestation.skills.map((skill: string, i: number) => (
                          <span key={i} className="badge badge-secondary badge-sm">
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 md:mt-0 md:col-span-1">
                  <div className="grid grid-cols-3 md:flex">
                    <div className="md:hidden col-span-1 text-sm opacity-80">Attested at:</div>
                    <div className="col-span-2">
                      <time
                        dateTime={new Date(attestation.timestamp * 1000).toISOString()}
                        title={new Date(attestation.timestamp * 1000).toLocaleString()}
                        className="text-sm"
                      >
                        {new Date(attestation.timestamp * 1000).toLocaleDateString()}{" "}
                        <span className="text-xs opacity-70">
                          {new Date(attestation.timestamp * 1000).toLocaleTimeString()}
                        </span>
                      </time>
                    </div>
                  </div>
                </div>

                <div className="mt-3 md:mt-0 md:col-span-1 flex justify-end">
                  <a
                    href={`${easConfig?.scan}/attestation/view/${attestation.uid}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline btn-sm flex items-center gap-1"
                    aria-label="Verify on explorer"
                    title={attestation.uid}
                  >
                    Verify
                    <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
        </div>

        {attestationsData && (
          <div className="flex items-center justify-between p-4">
            <div className="text-sm opacity-70">Page {cursors.length + 1}</div>
            <div className="flex items-center gap-4">
              <button
                onClick={goPrevious}
                disabled={cursors.length === 0}
                className="btn btn-outline btn-sm flex items-center gap-1"
              >
                <ChevronLeftIcon className="h-5 w-5" />
                Prev
              </button>
              <button
                onClick={goNext}
                disabled={!attestationsData.attestations.pageInfo.hasNextPage}
                className="btn btn-outline btn-sm flex items-center gap-1"
              >
                Next
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {!isLoading && !attestationsData?.attestations.items?.length && (
        <div className="mt-6 flex flex-col items-center gap-2 text-center">
          <div className="text-lg font-medium">No attestations yet</div>
          <div className="text-sm opacity-70">They’ll show up here as soon as you have some.</div>
        </div>
      )}
    </div>
  );
};
