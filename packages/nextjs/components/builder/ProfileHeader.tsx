import Link from "next/link";
import { ReusuableStats } from "../DisplayStats";
import { GithubSVG } from "../assets/GithubSVG";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { Developer } from "~~/types";

export function ProfileHeader({ developer }: { developer: Developer }) {
  const avatarUrl = `https://github.com/${developer.githubUser}.png`;
  const githubUrl = `https://github.com/${developer.githubUser}`;
  const stats = [
    { label: "Cred Score", value: developer.score },
    { label: "Attestations", value: developer.attestationsCount },
    { label: "Verified Attestations", value: developer.verifiedAttestationsCount },
  ];
  return (
    <div className="card border border-base-300 bg-base-100 shadow-xl">
      <div className="card-body p-6 sm:p-8">
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
          <div className="flex flex-col items-center gap-4 md:items-start">
            <div className="avatar">
              <div className="mask mask-squircle h-28 w-28 sm:h-32 sm:w-32 bg-base-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={avatarUrl} alt={developer.githubUser} />
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
                href={{ pathname: "/attest", query: { username: developer.githubUser } }}
                className="btn btn-primary btn-sm flex items-center gap-2"
                prefetch={false}
                aria-label={`Attest for ${developer.githubUser}`}
              >
                <ChatBubbleLeftRightIcon className="h-4 w-4" />
                <span>Attest</span>
              </Link>
            </div>
          </div>

          <div className="flex-1 space-y-4 text-center md:text-left">
            <div>
              <h1 className="text-3xl font-bold font-serif text-base-content sm:text-4xl">{developer.name}</h1>
              <p className="text-base-content/70">@{developer.githubUser}</p>
              <p className="mt-2 text-base-content text-sm sm:text-base">{developer.bio}</p>
            </div>
            <ReusuableStats stats={stats} />
          </div>
        </div>
      </div>
    </div>
  );
}
