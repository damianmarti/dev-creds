"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { gql, request } from "graphql-request";
import { Address } from "~~/components/scaffold-eth";
import scaffoldConfig from "~~/scaffold.config";

type Attestation = {
  id: string;
  attester: string;
  uid: string;
  skills: string[];
  description: string;
  evidences: string[];
  timestamp: number;
};

type Skill = {
  skill: string;
  count: number;
  score: number;
};

type AttestationsData = {
  attestations: {
    items: Attestation[];
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string | null;
      endCursor: string | null;
    };
  };
};

type SkillsData = {
  developerSkills: {
    items: Skill[];
  };
};

const PONDER_GRAPHQL_URL = process.env.NEXT_PUBLIC_PONDER_URL || "http://localhost:42069";

const fetchUserAttestations = async (
  githubUser: string,
  pageSize: number = 10,
  cursor?: string,
): Promise<AttestationsData> => {
  const attestationsQuery = gql`
    query UserAttestations($githubUser: String!, $limit: Int!, $after: String) {
      attestations(
        where: { githubUser: $githubUser }
        limit: $limit
        after: $after
        orderBy: "timestamp"
        orderDirection: "desc"
      ) {
        items {
          id
          attester
          uid
          skills
          description
          evidences
          timestamp
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
    }
  `;

  const variables: any = {
    githubUser: githubUser.toLowerCase(),
    limit: pageSize,
  };

  if (cursor) {
    variables.after = cursor;
  }

  const data = await request<AttestationsData>(PONDER_GRAPHQL_URL, attestationsQuery, variables);

  return data;
};

const fetchUserSkills = async (githubUser: string): Promise<SkillsData> => {
  const skillsQuery = gql`
    query UserSkills($githubUser: String!) {
      developerSkills(where: { githubUser: $githubUser }) {
        items {
          skill
          count
          score
        }
      }
    }
  `;

  const data = await request<SkillsData>(PONDER_GRAPHQL_URL, skillsQuery, {
    githubUser: githubUser.toLowerCase(),
  });

  return data;
};

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

  const { data: skillsData, isLoading: skillsLoading } = useQuery({
    queryKey: ["userSkills", githubUser],
    queryFn: () => fetchUserSkills(githubUser),
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

  const isLoading = attestationsLoading || skillsLoading;
  const error = attestationsError;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <span className="loading loading-spinner loading-lg"></span>
        <span className="ml-2 text-lg">Loading attestations...</span>
      </div>
    );
  }

  if (error) {
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
      {/* Skills Overview */}
      {skillsData && skillsData.developerSkills.items.length > 0 && (
        <div className="bg-base-200 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Skills Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skillsData.developerSkills.items
              .sort((a, b) => b.score - a.score)
              .map((skillData, index) => (
                <div key={index} className="bg-base-100 rounded-lg p-4 shadow">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">{skillData.skill}</h3>
                    <div className="badge badge-primary">{skillData.score}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

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
                      Attestation by <Address address={attestation.attester} size="sm" />
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
                      {attestation.evidences.map((evidence, idx) => (
                        <a
                          key={idx}
                          href={evidence}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-sm btn-outline btn-primary text-xs"
                          title={evidence}
                        >
                          {evidence.length > 40 ? `${evidence.substring(0, 40)}...` : evidence}
                        </a>
                      ))}
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
