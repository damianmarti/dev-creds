"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { notification } from "~~/utils/scaffold-eth";

interface Peer {
  login: string;
  avatar_url: string;
  html_url: string;
  count: number;
}

interface PeersResponse {
  username: string;
  peers: Peer[];
  totalRepositories: number;
  cachedAt?: number;
}

async function fetchPeers(address: string, force = false): Promise<PeersResponse> {
  const url = `/api/peers?address=${address}${force ? "&force=true" : ""}`;
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch peers");
  }
  return response.json();
}

function formatCachedTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}

function SkeletonCard() {
  return (
    <div className="card bg-base-200 shadow-md">
      <div className="card-body">
        <div className="flex items-center gap-4">
          <div className="avatar">
            <div className="w-16 rounded-full bg-base-300 animate-pulse"></div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="badge badge-primary badge-sm bg-base-300 animate-pulse w-8 h-5"></div>
              <div className="h-5 bg-base-300 rounded animate-pulse w-24"></div>
            </div>
            <div className="h-4 bg-base-300 rounded animate-pulse w-32 mt-2"></div>
          </div>
        </div>
        <div className="card-actions mt-4">
          <div className="btn btn-primary btn-md w-full text-base bg-base-300 animate-pulse h-10"></div>
        </div>
      </div>
    </div>
  );
}

export function Peers() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();
  const hasShownNotification = useRef(false);

  const { data, isLoading, isError, error, isFetching } = useQuery<PeersResponse>({
    queryKey: ["peers", address],
    queryFn: () => fetchPeers(address!),
    enabled: isConnected && !!address,
  });

  // Show success notification when redirected from linking GitHub
  useEffect(() => {
    if (searchParams.get("linked") === "true" && !hasShownNotification.current) {
      hasShownNotification.current = true;
      notification.success("GitHub linked");
      // Remove the query parameter from URL
      router.replace("/peers", { scroll: false });
    }
  }, [searchParams, router]);

  const handleRefresh = async () => {
    await queryClient.fetchQuery({
      queryKey: ["peers", address],
      queryFn: () => fetchPeers(address!, true),
    });
  };

  const isRefreshing = isFetching && !!data;

  if (!isConnected) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-6xl">🔗</div>
          <h2 className="mb-2 text-2xl font-bold">Connect Your Wallet</h2>
          <p className="text-base-content/70">Please connect your wallet to view your GitHub peers</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Your GitHub Peers</h1>
            <p className="mt-2 text-base-content/70">Top collaborators from your recent repositories</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 12 }).map((_, index) => (
            <SkeletonCard key={`skeleton-${index}`} />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="alert alert-error">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 shrink-0 stroke-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>{error instanceof Error ? error.message : "Error loading peers data. Please try again."}</span>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  if (data.peers.length === 0) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-6xl">👥</div>
          <h2 className="mb-2 text-2xl font-bold">No Peers Found</h2>
          <p className="text-base-content/70">We couldn&apos;t find any collaborators in your recent repositories.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Your GitHub Peers</h1>
          <p className="mt-2 text-base-content/70">Top collaborators from your recent repositories</p>
        </div>
        <div className="text-right">
          {data.cachedAt && (
            <p className="text-xs text-base-content/50 mt-1">Updated {formatCachedTime(data.cachedAt)}</p>
          )}
          <p className="text-xs text-base-content/50 mt-1">
            <button className="btn btn-outline btn-sm" onClick={handleRefresh} disabled={isFetching}>
              <ArrowPathIcon className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              Refresh Data
            </button>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isRefreshing
          ? // Show 12 skeleton cards when refreshing
            Array.from({ length: 12 }).map((_, index) => <SkeletonCard key={`skeleton-${index}`} />)
          : data.peers.map((peer, index) => (
              <div key={peer.login} className="card bg-base-200 shadow-md hover:shadow-lg transition-shadow">
                <div className="card-body">
                  <div className="flex items-center gap-4">
                    <div className="avatar">
                      <div className="w-16 rounded-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={peer.avatar_url} alt={peer.login} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="badge badge-primary badge-sm">#{index + 1}</span>
                        <h3 className="card-title text-lg">
                          <a href={peer.html_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {peer.login}
                          </a>
                        </h3>
                      </div>
                      <p className="text-sm text-base-content/70 mt-1">
                        Collaborated on <span className="font-semibold">{peer.count}</span>{" "}
                        {peer.count === 1 ? "repository" : "repositories"}
                      </p>
                    </div>
                  </div>
                  <div className="card-actions mt-4">
                    <button
                      className="btn btn-primary btn-md w-full text-base"
                      onClick={() => {
                        window.open(`/attest?username=${encodeURIComponent(peer.login)}`, "_blank");
                      }}
                    >
                      Attest
                    </button>
                  </div>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}
