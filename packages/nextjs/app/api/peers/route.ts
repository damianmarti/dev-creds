import { NextResponse } from "next/server";
import redis from "~~/lib/redis";

interface GitHubCommitSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: Array<{
    repository: {
      full_name: string;
    };
    commit: {
      author: {
        date: string;
      };
    };
  }>;
}

interface GitHubContributor {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  contributions: number;
}

interface CachedPeersData {
  username: string;
  peers: Array<{
    login: string;
    avatar_url: string;
    html_url: string;
    count: number;
  }>;
  totalRepositories: number;
  cachedAt: number;
}

async function fetchPeersFromGitHub(username: string): Promise<Omit<CachedPeersData, "cachedAt">> {
  const headers: Record<string, string> = {};
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  // Search for commits by the user
  const commitsResponse = await fetch(`https://api.github.com/search/commits?q=author:${username}&per_page=100`, {
    headers,
  });

  if (!commitsResponse.ok) {
    throw new Error(`GitHub API error: ${commitsResponse.statusText}`);
  }

  const commitsData: GitHubCommitSearchResponse = await commitsResponse.json();

  // Extract unique repositories and sort by most recent commit
  const repositoryMap = new Map<string, string>();

  for (const item of commitsData.items) {
    const repoFullName = item.repository.full_name;
    if (!repositoryMap.has(repoFullName)) {
      repositoryMap.set(repoFullName, item.commit.author.date);
    } else {
      // Keep the most recent date
      const existingDate = repositoryMap.get(repoFullName)!;
      if (new Date(item.commit.author.date) > new Date(existingDate)) {
        repositoryMap.set(repoFullName, item.commit.author.date);
      }
    }
  }

  // Sort repositories by most recent commit date and take top 20
  const sortedRepos = Array.from(repositoryMap.entries())
    .sort((a, b) => new Date(b[1]).getTime() - new Date(a[1]).getTime())
    .slice(0, 20)
    .map(([fullName]) => fullName);

  // Fetch contributors for each repository
  const contributorCounts = new Map<string, { login: string; avatar_url: string; html_url: string; count: number }>();

  for (const repoFullName of sortedRepos) {
    try {
      const contributorsResponse = await fetch(`https://api.github.com/repos/${repoFullName}/contributors`, {
        headers,
      });

      if (contributorsResponse.ok) {
        const contributors: GitHubContributor[] = await contributorsResponse.json();

        for (const contributor of contributors) {
          // Skip the current user
          if (contributor.login.toLowerCase() === username.toLowerCase()) {
            continue;
          }

          const existing = contributorCounts.get(contributor.login);
          if (existing) {
            existing.count += 1;
          } else {
            contributorCounts.set(contributor.login, {
              login: contributor.login,
              avatar_url: contributor.avatar_url,
              html_url: contributor.html_url,
              count: 1,
            });
          }
        }
      }
    } catch (error) {
      console.error(`Error fetching contributors for ${repoFullName}:`, error);
      // Continue with other repositories
    }
  }

  // Sort by count and get top 12
  const topPeers = Array.from(contributorCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  return {
    username,
    peers: topPeers,
    totalRepositories: sortedRepos.length,
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address")?.toLowerCase();
  const force = searchParams.get("force") === "true";

  if (!address) {
    return NextResponse.json({ error: "Missing address parameter" }, { status: 400 });
  }

  // Get GitHub username from Redis
  const username = await redis.get(`github:byAddress:${address}`);
  if (!username) {
    return NextResponse.json({ error: "This Ethereum address is not linked to a GitHub account" }, { status: 404 });
  }

  const cacheKey = `peers:${username}`;

  try {
    // Check cache if not forcing refresh
    if (!force) {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        const parsed: CachedPeersData = JSON.parse(cachedData);
        return NextResponse.json({
          username: parsed.username,
          peers: parsed.peers,
          totalRepositories: parsed.totalRepositories,
          cachedAt: parsed.cachedAt,
        });
      }
    }

    // Fetch fresh data from GitHub
    const peersData = await fetchPeersFromGitHub(username);

    // Cache the data with timestamp
    const cachedData: CachedPeersData = {
      ...peersData,
      cachedAt: Date.now(),
    };

    await redis.set(cacheKey, JSON.stringify(cachedData));

    return NextResponse.json({
      username: peersData.username,
      peers: peersData.peers,
      totalRepositories: peersData.totalRepositories,
      cachedAt: cachedData.cachedAt,
    });
  } catch (error) {
    console.error("Error fetching peers:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch peers data" },
      { status: 500 },
    );
  }
}
