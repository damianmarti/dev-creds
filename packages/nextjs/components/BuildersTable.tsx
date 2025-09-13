"use client";

import Image from "next/image";
import Link from "next/link";
import { GithubSVG } from "./GithubSVG";

interface Developer {
  name: string;
  username: string;
  avatar?: string;
  githubUrl?: string;
  attestations: { positive: number; total: number };
  monthlyAttestations: number;
  topCollaborators: string[];
  skills: string[];
}

const mockDevelopers: Developer[] = [
  {
    name: "Vitalik Buterin",
    username: "vbuterin",
    avatar: "/vitalik-buterin.png",
    githubUrl: "https://github.com/vbuterin",
    attestations: { positive: 98.2, total: 156 },
    monthlyAttestations: 15,
    topCollaborators: ["/developer-1.png", "/developer-working-2.png", "/developer-3.png", "/developer-4.png"],
    skills: ["Solidity", "TypeScript", "Protocol Design"],
  },
  {
    name: "Dan Abramov",
    username: "gaearon",
    avatar: "/dan-abramov-portrait.png",
    githubUrl: "https://github.com/gaearon",
    attestations: { positive: 96.8, total: 124 },
    monthlyAttestations: 12,
    topCollaborators: ["/developer-team-5.png", "/developer-6.png", "/developer-7.png"],
    skills: ["React", "JavaScript", "Developer Tools"],
  },
  {
    name: "Hayden Adams",
    username: "haydenzadams",
    avatar: "/placeholder-9urb6.png",
    githubUrl: "https://github.com/haydenzadams",
    attestations: { positive: 97.5, total: 98 },
    monthlyAttestations: 11,
    topCollaborators: ["/placeholder-d1nk8.png", "/placeholder-certv.png"],
    skills: ["DeFi", "Smart Contracts", "AMM Design"],
  },
  {
    name: "Austin Griffith",
    username: "austingriffith",
    avatar: "/placeholder-3t8bp.png",
    githubUrl: "https://github.com/austingriffith",
    attestations: { positive: 99.1, total: 87 },
    monthlyAttestations: 9,
    topCollaborators: ["/placeholder-odpet.png", "/placeholder-780s0.png", "/placeholder-knvtr.png"],
    skills: ["Ethereum", "Education", "Tooling"],
  },
  {
    name: "Nader Dabit",
    username: "dabit3",
    avatar: "/placeholder.svg",
    githubUrl: "https://github.com/dabit3",
    attestations: { positive: 95.6, total: 73 },
    monthlyAttestations: 7,
    topCollaborators: ["/placeholder.svg", "/placeholder.svg"],
    skills: ["Full Stack", "GraphQL", "Web3"],
  },
];

function TableHeader() {
  return (
    <div className="hidden min-w-max grid-cols-12 gap-4 bg-base-200 p-4 text-sm font-medium text-base-content/70 md:grid md:min-w-0">
      <div className="col-span-5">Developer</div>
      <div className="col-span-3">Skills</div>
      <div className="col-span-2">Attestations</div>
      <div className="col-span-2">Top Collaborators</div>
    </div>
  );
}

function DeveloperRow({ developer }: { developer: Developer }) {
  const maxVisible = 3;
  const visibleCollaborators = developer.topCollaborators.slice(0, maxVisible);
  const remainingCount = developer.topCollaborators.length - maxVisible;

  const initials = developer.name
    .split(" ")
    .map(n => n[0])
    .join("");

  const looksPlaceholder =
    !developer.avatar || developer.avatar.includes("placeholder") || developer.avatar.endsWith(".svg");

  return (
    <div className="w-full p-4 transition-colors hover:bg-base-200/50 md:grid md:grid-cols-12 md:items-center md:gap-4 rounded-xl border border-base-200 md:rounded-none md:border-0">
      {/* Developer */}
      <div className="flex items-center gap-3 md:col-span-5">
        <div className="avatar">
          <div className="mask mask-squircle h-10 w-10 bg-base-200">
            {looksPlaceholder ? (
              <span className="flex h-full w-full items-center justify-center text-2xl font-serif">{initials}</span>
            ) : (
              <Image src={developer.avatar!} alt={developer.name} width={40} height={40} />
            )}
          </div>
        </div>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            {developer.username === "vbuterin" ? (
              <Link
                href={`/builder/${developer.username}`}
                className="link link-hover text-base-content text-sm font-medium sm:text-base"
              >
                {developer.name}
              </Link>
            ) : (
              <span className="text-base-content text-sm font-medium sm:text-base">{developer.name}</span>
            )}
            {developer.githubUrl && (
              <Link
                href={developer.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${developer.name}'s GitHub`}
              >
                <GithubSVG />
              </Link>
            )}
            <div className="badge badge-outline bg-green-100 text-green-700">+{developer.monthlyAttestations}</div>
          </div>
          <span className="text-sm text-base-content/70">@{developer.username}</span>
        </div>
      </div>

      {/* Skills */}
      <div className="mt-3 md:mt-0 md:col-span-3">
        <div className="flex flex-wrap gap-1">
          {developer.skills.map(skill => (
            <div key={skill} className="badge badge-secondary badge-sm">
              {skill}
            </div>
          ))}
        </div>
      </div>

      {/* Attestations */}
      <div className="mt-3 md:mt-0 md:col-span-2">
        <div className="font-medium text-base-content text-sm sm:text-base">
          {developer.attestations.positive}% positive
        </div>
        <div className="text-sm text-base-content/70">({developer.attestations.total} attestations)</div>
      </div>

      {/* Top collaborators */}
      <div className="mt-3 md:mt-0 md:col-span-2">
        <div className="avatar-group -space-x-2">
          {visibleCollaborators.map((avatar, i) => (
            <div key={i} className="avatar border-2 border-base-100">
              <div className="mask mask-squircle h-6 w-6 bg-base-200">
                <Image src={avatar || "/placeholder.svg"} alt={`Collaborator ${i + 1}`} width={24} height={24} />
              </div>
            </div>
          ))}
          {remainingCount > 0 && (
            <div className="avatar placeholder">
              <div className="mask mask-squircle h-6 w-6 bg-neutral-focus text-neutral-content text-xs">
                <span>+{remainingCount}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Main Builders Table Component
export function BuildersTable() {
  return (
    <div className="card border border-base-300 bg-base-100 shadow-xl overflow-x-auto">
      <TableHeader />
      <div className="divide-y divide-base-200 md:divide-y">
        {mockDevelopers.map(dev => (
          <DeveloperRow key={dev.username} developer={dev} />
        ))}
      </div>
    </div>
  );
}
