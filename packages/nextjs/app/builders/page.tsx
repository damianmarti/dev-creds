import { BuildersTable } from "~~/components/BuildersTable";

export default function Builders() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 font-serif text-4xl font-bold text-base-content">Leaderboard</h1>
          <p className="text-base-content/70">Top developers ranked by verified skills and peer attestations</p>
        </div>
      </div>
      <BuildersTable />
    </div>
  );
}
