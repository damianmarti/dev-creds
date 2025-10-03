"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { UsersIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import scaffoldConfig from "~~/scaffold.config";
import { fetchUserAttestations } from "~~/utils/graphql";

type Props = {
  githubUser: string;
};

export const UserAttestations = ({ githubUser }: Props) => {
  const targetNetwork = scaffoldConfig.targetNetworks[0];
  const easConfig = scaffoldConfig.easConfig[targetNetwork.id];

  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [cursors, setCursors] = useState<string[]>([]);
  const pageSize = 10;

  const {
    data: attestationsData,
    isLoading: attestationsLoading,
    error: attestationsError,
  } = useQuery({
    queryKey: ["userAttestations", githubUser, cursor],
    queryFn: () => fetchUserAttestations(githubUser, pageSize, cursor),
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

  if (attestationsLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <span className="loading loading-spinner loading-lg"></span>
        <span className="ml-2 text-lg">Loading attestations...</span>
      </div>
    );
  }

  if (attestationsError) {
    return (
      <div className="alert alert-error">
        <div>
          <h3 className="font-bold">Error Loading Data</h3>
          <div className="text-xs">Failed to load attestations.</div>
        </div>
      </div>
    );
  }

  if (!attestationsData || attestationsData.attestations.items.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="alert alert-info">
          <div>
            <h3 className="font-bold">No Attestations Found</h3>
            <div className="text-xs">
              No attestations found for GitHub user &quot;@{githubUser}&quot;. This user may not have any attestations
              yet.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Attestations List */}
      <div className="bg-base-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Attestations (Page {cursors.length + 1})</h2>

          {/* Pagination Controls */}
          <div className="flex gap-2">
            <button onClick={goPrevious} disabled={cursors.length === 0} className="btn btn-sm btn-outline">
              Previous
            </button>
            <button
              onClick={goNext}
              disabled={!attestationsData.attestations.pageInfo.hasNextPage}
              className="btn btn-sm btn-outline"
            >
              Next
            </button>
          </div>
        </div>

        {attestationsData.attestations.items.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-lg text-base-content/70">No attestations found for this user.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {attestationsData.attestations.items.map(attestation => (
              <div key={attestation.id} className="bg-base-100 rounded-lg p-6 shadow-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">
                      Attestation by
                      <div className="flex items-center gap-2">
                        <Address address={attestation.attester} size="sm" />
                        {attestation.evidencesCollaborator.some(collaborator => collaborator === true) && (
                          <div className="tooltip" data-tip="Collaborator">
                            <div className="badge badge-outline badge-primary badge-sm">
                              <UsersIcon className="mr-1 h-4 w-4" />
                            </div>
                          </div>
                        )}
                      </div>
                    </h3>
                    <p className="text-sm text-base-content/70">
                      {new Date(attestation.timestamp * 1000).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-xs text-base-content/50">
                    UID:{" "}
                    <a
                      href={`${easConfig?.scan}/attestation/view/${attestation.uid}`}
                      title={attestation.uid}
                      target="_blank"
                      rel="noreferrer"
                      className="inline"
                    >
                      <span className="list__container--first_row-data">{attestation.uid.slice(0, 20)}</span>...
                    </a>
                  </div>
                </div>

                {/* Skills attested in this specific attestation */}
                {attestation.skills.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Skills Attested:</h4>
                    <div className="flex flex-wrap gap-2">
                      {attestation.skills.map((skill, index) => (
                        <span key={index} className="badge badge-secondary badge-sm">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {attestation.description && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Description:</h4>
                    <p className="text-base-content/80 bg-base-200 rounded p-3">{attestation.description}</p>
                  </div>
                )}

                {attestation.evidences.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Evidence:</h4>
                    <div className="flex flex-wrap gap-2">
                      {attestation.evidences.map((evidence, idx) => {
                        const isVerified = attestation.evidencesVerified?.[idx] || false;
                        const isCollaborator = attestation.evidencesCollaborator?.[idx] || false;

                        let bgColor = "";
                        let titleSuffix = "";

                        if (isCollaborator) {
                          bgColor = "bg-green-100";
                          titleSuffix = " (Verified and Collaborator)";
                        } else if (isVerified) {
                          bgColor = "bg-orange-100";
                          titleSuffix = " (Verified)";
                        }

                        return (
                          <a
                            key={idx}
                            href={evidence}
                            target="_blank"
                            rel="noreferrer"
                            className={`btn btn-sm btn-outline btn-primary text-xs ${bgColor}`}
                            title={evidence + titleSuffix}
                          >
                            {evidence.length > 40 ? `${evidence.substring(0, 40)}...` : evidence}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
