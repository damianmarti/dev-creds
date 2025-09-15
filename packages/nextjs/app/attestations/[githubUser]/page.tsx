import { UserAttestations } from "~~/components/attestation/UserAttestations";

export default async function UserAttestationsPage({ params }: { params: Promise<{ githubUser: string }> }) {
  const { githubUser } = await params;
  return (
    <div className="min-h-screen bg-base-300">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">
            Attestations for{" "}
            <a
              href={`https://github.com/${githubUser}`}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              @{githubUser}
            </a>
          </h1>
          <p className="text-lg text-base-content/70">All attestations and skills for this developer</p>
        </div>
        <UserAttestations githubUser={githubUser} />
      </div>
    </div>
  );
}
