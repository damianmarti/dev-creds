import type { Metadata } from "next";
import { BuilderProfile } from "~~/components/BuilderProfile";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  return getMetadata({
    title: `${username} | DevCreds`,
    description: `View ${username}'s verified developer reputation, skills, and attestations on DevCreds.`,
    imageRelativePath: `/builder/${username}/thumbnail.jpg`,
  });
}

export default async function BuilderPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <BuilderProfile username={username} />
      </main>
    </div>
  );
}
