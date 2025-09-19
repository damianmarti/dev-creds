import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { gql, request } from "graphql-request";
import { Address } from "~~/components/scaffold-eth";
import scaffoldConfig from "~~/scaffold.config";

type Attestation = {
  id: string;
  attester: string;
  uid: string;
  githubUser: string;
  skills: string[];
  description: string;
  evidences: string[];
  timestamp: number;
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

const PONDER_GRAPHQL_URL = "http://localhost:42069"; // Ponder GraphQL endpoint

const fetchAttestations = async (pageSize: number = 20, cursor?: string) => {
  const AttestationsQuery = gql`
    query Attestations($limit: Int!, $after: String) {
      attestations(limit: $limit, after: $after, orderBy: "timestamp", orderDirection: "desc") {
        items {
          id
          attester
          uid
          githubUser
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
    limit: pageSize,
  };

  if (cursor) {
    variables.after = cursor;
  }

  const data = await request<AttestationsData>(PONDER_GRAPHQL_URL, AttestationsQuery, variables);
  return data;
};

export const List = () => {
  const targetNetwork = scaffoldConfig.targetNetworks[0];
  const easConfig = scaffoldConfig.easConfig[targetNetwork.id];

  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [cursors, setCursors] = useState<string[]>([]);
  const pageSize = 20;

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
    <div className="list__container flex flex-col justify-center items-center bg-[url('/assets/gradient-bg.png')] bg-[length:100%_100%] py-10 px-5 sm:px-0 lg:py-auto max-w-[100vw] ">
      <div className="flex justify-center">
        <table className="table table-zebra w-full shadow-lg">
          <thead>
            <tr>
              <th className="bg-primary text-white p-1.5 sml:p-4">UID</th>
              <th className="bg-primary text-white p-1.5 sml:p-4">Attester</th>
              <th className="bg-primary text-white p-1.5 sml:p-4">GitHub User</th>
              <th className="bg-primary text-white p-1.5 sml:p-4">Skills</th>
              <th className="bg-primary text-white p-1.5 sml:p-4">Attested at</th>
            </tr>
          </thead>
          {isLoading ? (
            <tbody>
              {[...Array(10)].map((_, rowIndex) => (
                <tr key={rowIndex} className="bg-base-200 hover:bg-base-300 transition-colors duration-200 h-12">
                  {[...Array(5)].map((_, colIndex) => (
                    <td className="w-1/4 p-1 sml:p-4" key={colIndex}>
                      <div className="h-2 bg-gray-200 rounded-full animate-pulse"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          ) : (
            <tbody>
              {attestationsData?.attestations.items.map(attestation => {
                return (
                  <tr key={attestation.id} className="hover text-sm">
                    <td className="w-1/4 p-1 sml:p-4">
                      <a
                        href={`${easConfig?.scan}/attestation/view/${attestation.uid}`}
                        title={attestation.uid}
                        target="_blank"
                        rel="noreferrer"
                        className="flex"
                      >
                        <span className="list__container--first_row-data">{attestation.uid.slice(0, 20)}</span>...
                      </a>
                    </td>
                    <td className="w-1/4 p-1 sml:p-4">
                      <Address address={attestation.attester} size="sm" />
                    </td>
                    <td className="w-1/4 p-1 sml:p-4">
                      <div className="flex flex-col gap-1">
                        <a
                          href={`https://github.com/${attestation.githubUser}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline"
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
                    <td className="w-1/4 p-1 sml:p-4">
                      <div className="flex flex-wrap gap-1">
                        {attestation.skills.map((skill: string, index: number) => (
                          <span key={index} className="badge badge-primary badge-sm">
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="text-right list__container--last_row-data p-1 sml:p-4">
                      {new Date(attestation.timestamp * 1000).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          )}
        </table>
      </div>

      {/* Pagination Controls */}
      {attestationsData && (
        <div className="flex justify-center items-center mt-6 gap-4">
          <button onClick={goPrevious} disabled={cursors.length === 0} className="btn btn-outline">
            Previous
          </button>
          <span className="text-lg font-medium">Page {cursors.length + 1}</span>
          <button
            onClick={goNext}
            disabled={!attestationsData.attestations.pageInfo.hasNextPage}
            className="btn btn-outline"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
