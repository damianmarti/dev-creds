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

  return (
    <div className="list__container flex flex-col justify-center items-center py-2 px-5 sm:px-0 lg:py-auto max-w-[100vw] ">
      <div className="flex justify-center py-10 px-5 sm:px-0">
        <div className="w-full max-w-6xl">
          <div className="rounded-2xl shadow-xl overflow-hidden border border-base-300 bg-base-100">
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead className="bg-primary text-white">
                  <tr>
                    <th className="p-3 sml:p-4">Attester</th>
                    <th className="p-3 sml:p-4">GitHub User</th>
                    <th className="p-3 sml:p-4">Skills</th>
                    <th className="p-3 sml:p-4">Attested at</th>
                    <th className="p-3 pr-10 sml:p-4 text-right">Link</th>
                  </tr>
                </thead>

                {isLoading ? (
                  <tbody>
                    {Array.from({ length: 10 }).map((_, rowIndex) => (
                      <tr key={rowIndex} className="hover h-12">
                        {Array.from({ length: 5 }).map((_, colIndex) => (
                          <td key={colIndex} className="p-3 sml:p-4">
                            <div className="h-3 rounded-full bg-base-200 animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                ) : (
                  <tbody>
                    {attestationsData?.attestations.items.map(attestation => (
                      <tr key={attestation.id} className="hover text-sm">
                        <td className="p-3 sml:p-4">
                          <Address address={attestation.attester} size="sm" />
                        </td>

                        <td className="p-3 sml:p-4">
                          <div className="flex flex-col gap-1">
                            <a
                              href={`https://github.com/${attestation.githubUser}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary font-medium hover:underline"
                            >
                              @{attestation.githubUser}
                            </a>
                            <a
                              href={`/attestations/${attestation.githubUser}`}
                              className="text-xs text-secondary hover:underline"
                            >
                              View all attestations
                            </a>
                          </div>
                        </td>

                        <td className="p-3 sml:p-4">
                          <div className="flex flex-wrap gap-1">
                            {attestation.skills.map((skill: string, i: number) => (
                              <span key={i} className="badge badge-primary badge-sm rounded-md">
                                {skill.trim()}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="p-3 sml:p-4">
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
                        </td>

                        {/* New Link column with verify arrow */}
                        <td className="p-3 sml:p-4 text-right">
                          <a
                            href={`${easConfig?.scan}/attestation/view/${attestation.uid}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-sm btn-ghost gap-1 rounded-full"
                            aria-label="Verify on explorer"
                            title={attestation.uid}
                          >
                            <span className="hidden sm:inline">Verify</span>
                            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                )}
              </table>
            </div>

            {attestationsData && (
              <div className="flex justify-between items-center px-4 py-3 bg-base-100 border-t border-base-300">
                <span className="text-sm opacity-80">Page {cursors.length + 1}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={goPrevious}
                    disabled={cursors.length === 0}
                    className="btn btn-outline btn-sm rounded-full"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={goNext}
                    disabled={!attestationsData.attestations.pageInfo.hasNextPage}
                    className="btn btn-outline btn-sm rounded-full"
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
          {/* Empty state */}
          {!isLoading && !attestationsData?.attestations.items?.length && (
            <div className="mt-6 flex flex-col items-center gap-2 text-center">
              <div className="text-lg font-medium">No attestations yet</div>
              <div className="text-sm opacity-70">They’ll show up here as soon as you have some.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
