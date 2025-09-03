"use client";

import Link from "next/link";
import { GithubSVG } from "./GithubSVG";
import { ArrowRightIcon, ShieldCheckIcon, UsersIcon } from "@heroicons/react/24/outline";

export function HeroSection() {
  return (
    <section className="hero bg-base-100">
      <div className="hero-content w-full max-w-6xl mx-auto px-4 py-10">
        <div className="w-full text-center">
          <div className="mb-4 flex items-center justify-center gap-2 text-sm">
            <span className="badge badge-outline border-base-300 text-base-content/70">Built on Arbitrum</span>
            <span className="badge badge-outline border-base-300 text-base-content/70">On-chain attestations</span>
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-serif font-bold leading-tight tracking-tight">
              <span className="block">Build Your</span>
              <span className="text-tertiary block">Developer Reputation</span>
              <span className="text-tertiary">On-Chain</span>
            </h1>

            <p className="text-md md:text-lg text-base-content/70 max-w-2xl mx-auto leading-relaxed">
              DevCreds is a verifiable developer skill ledger on Arbitrum. Get peer attestations, showcase your
              expertise, and build trust in the Web3 ecosystem.
            </p>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/builder"
              className="btn btn-primary btn-lg rounded-lg gap-2 shadow-md hover:shadow-lg focus-visible:outline-none focus-visible:ring focus-visible:ring-primary/30"
              aria-label="Create or view your DevCreds profile"
            >
              Get Started
              <ArrowRightIcon className="w-5 h-5" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-16">
            <FeatureCard
              Icon={ShieldCheckIcon}
              title="Verifiable Skills"
              desc="Every attestation is backed by evidence and recorded on Arbitrum for permanent verification."
            />
            <FeatureCard
              Icon={UsersIcon}
              title="Peer Reviews"
              desc="Get attestations from developers you’ve actually collaborated with on GitHub projects."
            />
            <FeatureCard
              Icon={GithubSVG}
              title="GitHub Integration"
              desc="Connect your GitHub to verify collaborations and showcase your actual contributions."
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  Icon,
  title,
  desc,
}: {
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  desc: string;
}) {
  return (
    <div className="card shadow-xl transition-all hover:shadow-xl hover:-translate-y-0.5 focus-within:shadow-xl">
      <div className="card-body items-center text-center gap-2">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center`}>
          <Icon className="w-6 h-6" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-lg font-serif font-semibold">{title}</h3>
          <p className="text-xs">{desc}</p>
        </div>
      </div>
    </div>
  );
}
