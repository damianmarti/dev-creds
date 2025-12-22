import { UserAttestations } from "~~/components/attestation/UserAttestations";

export default async function UserAttestationsPage({ params }: { params: Promise<{ githubUser: string }> }) {
  const { githubUser } = await params;
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      <div className="mb-12">
        <h1 className="mb-2 font-serif text-4xl font-bold text-base-content">
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
        <p className="text-base-content/70">All attestations and skills for this developer</p>
      </div>
      <UserAttestations githubUser={githubUser} />
    </div>
  );
}
