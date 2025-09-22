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
  return (
    <div className="mt-10 bg-base-100 stats stats-vertical md:stats-horizontal shadow">
      <div className="stat text-center">
        <div className="stat-value text-tertiary font-serif">2,847</div>
        <div className="stat-desc">Developers</div>
      </div>

      <div className="stat text-center">
        <div className="stat-value text-tertiary font-serif">15,293</div>
        <div className="stat-desc">Attestations</div>
      </div>

      <div className="stat text-center">
        <div className="stat-value text-tertiary font-serif">1,204</div>
        <div className="stat-desc">Verified Collaborations</div>
      </div>
    </div>
  );
};
