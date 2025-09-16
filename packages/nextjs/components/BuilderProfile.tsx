import Link from "next/link";
import { ReusuableStats } from "./DisplayStats";
import { GithubSVG } from "./GithubSVG";
import { ChatBubbleLeftRightIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

interface BuilderProfileProps {
  username: string;
}

interface Skill {
  name: string;
  attestations: number;
  verified: number;
}

interface Attestation {
  id: number;
  from: string;
  fromName: string;
  skill: string;
  comment: string;
  evidence?: string[];
  date: string;
  verified?: boolean;
}

interface Profile {
  name: string;
  username: string;
  avatar: string;
  bio: string;
  githubUrl: string;
  walletAddress: string;
  joinDate: string;
  credScore: number;
  attestations: number;
  verifiedAttestations: number;
  skills: Skill[];
  recentAttestations: Attestation[];
}

const profile: Profile = {
  name: "Vitalik Buterin",
  username: "vitalik",
  avatar: "",
  bio: "Ethereum co-founder, researcher, and developer. Building the future of decentralized systems.",
  githubUrl: "https://github.com/vbuterin",
  walletAddress: "0x1234...5678",
  joinDate: "2023-01-15",
  credScore: 2847,
  attestations: 156,
  verifiedAttestations: 14,
  skills: [
    { name: "Solidity", attestations: 45, verified: 12 },
    { name: "Python", attestations: 32, verified: 10 },
    { name: "Cryptography", attestations: 28, verified: 8 },
    { name: "Smart Contracts", attestations: 52, verified: 14 },
    { name: "Protocol Design", attestations: 38, verified: 14 },
    { name: "Research", attestations: 41, verified: 29 },
  ],
  recentAttestations: [
    {
      id: 1,
      from: "gakonst",
      fromName: "Georgios Konstantopoulos",
      skill: "Protocol Design",
      comment:
        "Vitalik's work on EIP-1559 was groundbreaking. His deep understanding of mechanism design and ability to balance technical complexity with practical implementation is unmatched.",
      evidence: ["https://github.com/ethereum/EIPs/pull/2593"],
      date: "2024-01-10",
    },
    {
      id: 2,
      from: "danfinlay",
      fromName: "Dan Finlay",
      skill: "Smart Contracts",
      comment:
        "Worked with Vitalik on several Ethereum improvement proposals. His ability to think through edge cases and security implications is exceptional.",
      evidence: ["https://github.com/ethereum/EIPs/pull/2718"],
      date: "2024-01-08",
    },
    {
      id: 3,
      from: "austingriffith",
      fromName: "Austin Griffith",
      skill: "Solidity",
      comment:
        "Vitalik's Solidity code is clean, well-documented, and follows best practices. Great mentor for junior developers.",
      evidence: ["https://github.com/ethereum/solidity-examples"],
      date: "2024-01-05",
    },
  ],
};

function ProfileHeader({ profile }: { profile: Profile }) {
  return (
    <div className="card border border-base-300 bg-base-100 shadow-xl">
      <div className="card-body p-6 sm:p-8">
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
          <div className="flex flex-col items-center gap-4 md:items-start">
            <div className="avatar">
              <div className="mask mask-squircle h-28 w-28 sm:h-32 sm:w-32 bg-base-200">
                {/* TODO: Replace with actual avatar image */}
                <span className="flex h-full w-full items-center justify-center text-2xl font-serif">
                  {profile.name
                    .split(" ")
                    .map(n => n[0])
                    .join("")}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href={profile.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm flex items-center gap-2"
              >
                <GithubSVG />
                GitHub
              </Link>
              <button className="btn btn-primary btn-sm flex items-center gap-2">
                <ChatBubbleLeftRightIcon className="h-4 w-4" />
                Attest
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-4 text-center md:text-left">
            <div>
              <h1 className="text-3xl font-bold font-serif text-base-content sm:text-4xl">{profile.name}</h1>
              <p className="text-base-content/70">@{profile.username}</p>
              <p className="mt-2 text-base-content text-sm sm:text-base">{profile.bio}</p>
            </div>

            <StatsGrid profile={profile} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsGrid({ profile }: { profile: Profile }) {
  const stats = [
    { label: "Cred Score", value: profile.credScore },
    { label: "Attestations", value: profile.attestations },
    { label: "Verified Attestations", value: profile.verifiedAttestations },
  ];
  return <ReusuableStats stats={stats} />;
}

function SkillsSection({ skills }: { skills: Skill[] }) {
  return (
    <div className="card border border-base-300 bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title font-serif flex items-center gap-2 text-xl sm:text-2xl">Verified Skills</h2>
        <p className="text-base-content/70 text-sm mt-0">Skills verified through peer attestations and evidence</p>
        <div className="flex flex-col gap-4 mt-2">
          {skills.map(skill => (
            <SkillCard key={skill.name} skill={skill} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SkillCard({ skill }: { skill: Skill }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-base-200 p-3 sm:p-4">
      <div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-base-content text-sm sm:text-base">{skill.name}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-base-content/70">
          <span className="badge badge-success badge-sm">{skill.verified} verified</span>
          Total {skill.attestations} attestations
        </div>
      </div>
    </div>
  );
}

function AttestationsSection({ attestations }: { attestations: Attestation[] }) {
  return (
    <div className="card border border-base-300 bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title font-serif text-xl sm:text-2xl">Recent Attestations</h2>
        <div className="space-y-6">
          {attestations.map(attestation => (
            <AttestationCard key={attestation.id} attestation={attestation} />
          ))}
        </div>
      </div>
    </div>
  );
}

function AttestationCard({ attestation }: { attestation: Attestation }) {
  return (
    <div className="relative border-l-2 border-primary/20 pl-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="mask mask-squircle h-10 w-10 bg-base-200">
              {/* TODO: Replace actual profile image */}
              <span className="flex h-full w-full items-center justify-center text-sm font-serif">
                {attestation.fromName
                  .split(" ")
                  .map(n => n[0])
                  .join("")}
              </span>
            </div>
          </div>
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="font-medium text-base-content">{attestation.fromName}</span>
              {attestation.verified && (
                <div className="badge badge-outline badge-success badge-sm">
                  <CheckCircleIcon className="mr-1 h-3 w-3" />
                  Verified
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-base-content/70">
              <span>@{attestation.from}</span>
            </div>
          </div>
        </div>
        <span className="text-xs sm:text-sm text-base-content/70">10 Jan 2025</span>
      </div>

      <div className="space-y-2">
        <div className="badge badge-secondary badge-sm">{attestation.skill}</div>
        <p className="text-base-content text-sm sm:text-base">{attestation.comment}</p>
        {attestation?.evidence?.map((url, i) => (
          <Link
            key={i}
            target="_blank"
            href={url}
            rel="noopener noreferrer"
            className="block text-xs sm:text-sm text-base-content/70 underline hover:text-primary"
          >
            {url}
          </Link>
        ))}
      </div>
    </div>
  );
}

// Main Component
export function BuilderProfile({ username }: BuilderProfileProps) {
  console.log("Fetching profile for username:", username);
  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6 md:p-8">
      <ProfileHeader profile={profile} />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AttestationsSection attestations={profile.recentAttestations} />
        </div>
        <div className="lg:col-span-1">
          <SkillsSection skills={profile.skills} />
        </div>
      </div>
    </div>
  );
}
