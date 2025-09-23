import Link from "next/link";
import { ReusuableStats } from "../DisplayStats";
import { GithubSVG } from "../assets/GithubSVG";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

const profile = {
  credScore: 2847,
  attestations: 156,
  verifiedAttestations: 14,
};

function StatsGrid({ username }: { username: string }) {
  console.log("Rendering stats for", username);
  const stats = [
    { label: "Cred Score", value: profile.credScore },
    { label: "Attestations", value: profile.attestations },
    { label: "Verified Attestations", value: profile.verifiedAttestations },
  ];
  return <ReusuableStats stats={stats} />;
}

export function ProfileHeader({ username }: { username: string }) {
  const avatarUrl = `https://github.com/${username}.png`;
  const githubUrl = `https://github.com/${username}`;
  return (
    <div className="card border border-base-300 bg-base-100 shadow-xl">
      <div className="card-body p-6 sm:p-8">
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
          <div className="flex flex-col items-center gap-4 md:items-start">
            <div className="avatar">
              <div className="mask mask-squircle h-28 w-28 sm:h-32 sm:w-32 bg-base-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={avatarUrl} alt={username} />
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm flex items-center gap-2"
              >
                <GithubSVG />
                GitHub
              </Link>
              <Link
                href={{ pathname: "/attest", query: { username } }}
                className="btn btn-primary btn-sm flex items-center gap-2"
                prefetch={false}
                aria-label={`Attest for ${username}`}
              >
                <ChatBubbleLeftRightIcon className="h-4 w-4" />
                <span>Attest</span>
              </Link>
            </div>
          </div>

          <div className="flex-1 space-y-4 text-center md:text-left">
            <div>
              <h1 className="text-3xl font-bold font-serif text-base-content sm:text-4xl">(find name from username)</h1>
              <p className="text-base-content/70">@{username}</p>
              <p className="mt-2 text-base-content text-sm sm:text-base">(placeholder for bio)</p>
            </div>
            <StatsGrid username={username} />
          </div>
        </div>
      </div>
    </div>
  );
}
