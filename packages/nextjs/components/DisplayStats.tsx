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
  developerSkills: {
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
    developerSkills {
      totalCount
    }
  }
`;

export const ReusuableStats = ({ stats }: { stats: { label: string; value: number }[] }) => {
  return (
    <div className="bg-base-100 stats stats-vertical md:stats-horizontal shadow w-full mt-2">
      {stats.map((stat, index) => (
        <div key={index} className="stat text-center">
          <div className="stat-value text-tertiary font-serif">{stat.value}</div>
          <div className="stat-desc">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};

export const DisplayStats = () => {
  const { data: statsData, isLoading: statsLoading } = useQuery<StatsResponse>({
    queryKey: ["stats-count"],
    queryFn: () => request(PONDER_GRAPHQL_URL, STATS_QUERY),
  });

  const attestationsCount = statsData?.attestations?.totalCount || 0;
  const developersCount = statsData?.developers?.totalCount || 0;
  const developerSkillsCount = statsData?.developerSkills?.totalCount || 0;

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
            developerSkillsCount.toLocaleString()
          )}
        </div>
        <div className="stat-desc">Skills Attested</div>
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
    </div>
  );
};
