import type { Metadata } from "next";
import { BuilderProfile } from "~~/components/BuilderProfile";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;

  return getMetadata({
    title: `${username} Developer Attested Skills`,
    description: `View ${username}'s verified developer reputation, skills, and attestations on DevCreds.`,
    imageRelativePath: `/builder/${username}/og.png`,
    url: `/builder/${username}`,
  });
}

export default async function BuilderPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  return (
    <div className="min-h-screen">
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        <BuilderProfile username={username} />
      </main>
    </div>
  );
}
