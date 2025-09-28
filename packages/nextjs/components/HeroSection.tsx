"use client";

import Link from "next/link";
import { GithubSVG } from "../components/assets/GithubSVG";
import { ArrowRightIcon, ShieldCheckIcon, UsersIcon } from "@heroicons/react/24/outline";

type HeroFeature = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
};

const heroFeatures: HeroFeature[] = [
  {
    icon: ShieldCheckIcon,
    title: "Verifiable Skills",
    description: "Every attestation is backed by evidence and recorded on Arbitrum for permanent verification.",
  },
  {
    icon: UsersIcon,
    title: "Peer Reviews",
    description: "Get attestations from developers you’ve actually collaborated with on GitHub projects.",
  },
  {
    icon: GithubSVG,
    title: "GitHub Integration",
    description: "Connect your GitHub to verify collaborations and showcase your actual contributions.",
  },
];

function FeatureCard({
  Icon,
  title,
  description,
}: {
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-base-100 card shadow-md">
      <div className="card-body items-center text-center gap-3">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-base-200">
          <Icon className="w-7 h-7 text-primary" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-serif font-semibold">{title}</h3>
        <p className="text-sm text-base-content/70">{description}</p>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="bg-background">
      <div className="w-full max-w-6xl mx-auto px-4 py-12 text-center">
        <div className="mb-4 flex items-center justify-center gap-2 text-sm">
          <span className="badge badge-outline badge-primary">Built on Arbitrum</span>
          <span className="badge badge-outline badge-primary">On-chain attestations</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-serif font-bold leading-tight tracking-tight space-y-1">
          <span className="block">Build Your</span>
          <span className="text-primary block">Developer Reputation</span>
          <span className="text-secondary">On-Chain</span>
        </h1>

        <p className="mt-6 text-md md:text-lg text-base-content/70 max-w-2xl mx-auto leading-relaxed">
          DevCreds is a verifiable developer skill ledger on Arbitrum. Get peer attestations, showcase your expertise,
          and build trust in the Web3 ecosystem.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/builders"
            className="btn btn-primary btn-lg rounded-lg gap-2 shadow-md hover:shadow-lg focus-visible:outline-none focus-visible:ring focus-visible:ring-primary/30"
          >
            Builder Leaderboard
            <ArrowRightIcon className="w-5 h-5" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {heroFeatures.map((feature, index) => (
            <FeatureCard key={index} Icon={feature.icon} title={feature.title} description={feature.description} />
          ))}
        </div>
      </div>
    </section>
  );
}
