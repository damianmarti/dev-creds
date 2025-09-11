import { useQuery } from "@tanstack/react-query";
import { gql, request } from "graphql-request";

const PONDER_GRAPHQL_URL = process.env.NEXT_PUBLIC_PONDER_URL || "http://localhost:42069";

interface StatsResponse {
  attestations: {
    totalCount: number;
  };
  developers: {
    totalCount: number;
  };
}

const STATS_QUERY = gql`
  query StatsCount {
    attestations {
      totalCount
    }
    developers {
      totalCount
    }
  }
`;

export const DisplayStats = () => {
  const { data: statsData, isLoading: statsLoading } = useQuery<StatsResponse>({
    queryKey: ["stats-count"],
    queryFn: () => request(PONDER_GRAPHQL_URL, STATS_QUERY),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const attestationsCount = statsData?.attestations?.totalCount || 0;
  const developersCount = statsData?.developers?.totalCount || 0;

  return (
    <div className="mt-10 bg-base-100 stats stats-vertical md:stats-horizontal shadow">
      <div className="stat text-center">
        <div className="stat-value text-tertiary font-serif">
          {statsLoading ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            developersCount.toLocaleString()
          )}
        </div>
        <div className="stat-desc">Developers</div>
      </div>

      <div className="stat text-center">
        <div className="stat-value text-tertiary font-serif">
          {statsLoading ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            attestationsCount.toLocaleString()
          )}
        </div>
        <div className="stat-desc">Attestations</div>
      </div>

      <div className="stat text-center">
        <div className="stat-value text-tertiary font-serif">1,204</div>
        <div className="stat-desc">Verified Collaborations</div>
      </div>
    </div>
  );
};
