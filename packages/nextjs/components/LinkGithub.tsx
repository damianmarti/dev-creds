import { useMutation, useQuery } from "@tanstack/react-query";
import { Address } from "abitype";
import axios from "axios";
import { signIn, useSession } from "next-auth/react";
import { notification } from "~~/utils/scaffold-eth";

interface GitHubResponse {
  username: string;
}

interface LinkGitHubProps {
  address: Address;
}

const GithubSignInButton = ({ address }: LinkGitHubProps) => {
  const { update: updateSession } = useSession();

  const signInWithStoreInRedis = async () => {
    try {
      // Sign in with GitHub
      const result = await signIn("github", {
        redirect: false,
      });

      if (!result?.ok) {
        throw new Error("GitHub sign-in failed");
      }

      // Force session update to get the latest data
      await updateSession();

      // Get fresh session data
      const session = await fetch("/api/auth/session").then(res => res.json());

      if (!session?.user?.username) {
        throw new Error("Failed to get GitHub username");
      }

      // Store the association in Redis
      await axios.post("/api/github", {
        address,
        username: session.user.username,
      });

      return session.user.username;
    } catch (error) {
      console.error("Error during GitHub sign-in:", error);
      throw error;
    }
  };

  const mutation = useMutation({
    mutationFn: signInWithStoreInRedis,
    onError: error => {
      console.error("Sign-in error:", error);
      notification.error("Failed to link GitHub account");
    },
    onSuccess: () => {
      notification.success("GitHub account linked successfully");
    },
  });

  return (
    <button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="btn btn-primary">
      {mutation.isPending ? "Linking..." : "Sign in with GitHub"}
    </button>
  );
};

const GithubUserName = ({ username }: { username: string }) => {
  return <span className="ml-2 font-bold">({username})</span>;
};

const LinkGithub = ({ address }: LinkGitHubProps) => {
  const { data, status, error } = useQuery<GitHubResponse>({
    queryKey: ["githubUsername", address],
    queryFn: async () => {
      const response = await fetch(`/api/github?address=${address}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch GitHub username: ${response.status}`);
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes instead of Infinity
    refetchOnWindowFocus: false,
    retry: 2,
  });

  if (status === "pending") {
    return <div className="loading loading-spinner loading-sm">Loading...</div>;
  }

  if (status === "error") {
    console.error("Error fetching GitHub username:", error);
    return <GithubSignInButton address={address} />;
  }

  if (status === "success" && data?.username) {
    return <GithubUserName username={data.username} />;
  }

  return <GithubSignInButton address={address} />;
};

export { LinkGithub };
