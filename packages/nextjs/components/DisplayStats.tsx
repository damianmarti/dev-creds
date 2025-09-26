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

export const ReusuableStats = ({
  stats,
  statsLoading,
}: {
  stats: { label: string; value: number }[];
  statsLoading?: boolean;
}) => {
  return (
    <div className="bg-base-100 stats stats-vertical xs:stats-horizontal shadow w-full mt-2">
      {stats.map((stat, index) => (
        <div key={index} className="stat text-center">
          <div className="stat-value text-tertiary font-serif">
            {statsLoading ? <span className="loading loading-spinner loading-sm"></span> : stat.value}
          </div>
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

  const stats = [
    { label: "Developers", value: statsData?.developers?.totalCount || 0 },
    { label: "Attestations", value: statsData?.attestations?.totalCount || 0 },
    { label: "Skills Attested", value: statsData?.developerSkills?.totalCount || 0 },
  ];

  return (
    <div className="mt-10">
      <ReusuableStats stats={stats} statsLoading={statsLoading} />
    </div>
  );
};
