import { useEffect, useRef } from "react";
import Link from "next/link";
import { GithubSVG } from "../components/assets/GithubSVG";
import { queryClient } from "./ScaffoldEthAppWithProviders";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Address } from "abitype";
import { signIn, signOut, useSession } from "next-auth/react";
import { notification } from "~~/utils/scaffold-eth";

type GitHubResponse = { username: string };

type LinkGitHubProps = { address: Address };

const SignInButton = ({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) => (
  <button onClick={onClick} disabled={disabled} className="btn btn-primary btn-sm ml-2">
    Link GitHub
  </button>
);

const Username = ({ username }: { username: string }) => {
  return (
    <Link href={`/builder/${username}`} className="btn btn-ghost btn-sm ml-2">
      <span className="ml-2 inline-flex items-center gap-1 font-bold">
        <GithubSVG />
        {username}
      </span>
    </Link>
  );
};

export const LinkGithub = ({ address }: LinkGitHubProps) => {
  const { status: authStatus, data: session } = useSession();

  const { data, status } = useQuery<GitHubResponse>({
    queryKey: ["githubUsername", address],
    queryFn: async () => {
      const res = await fetch(`/api/github?address=${address}`);
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const link = useMutation({
    mutationFn: async (username: string) => {
      const response = await fetch("/api/github", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address, username }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Linking GitHub account failed");
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["githubUsername", address] });
      notification.success("GitHub linked");
    },
    onError: async (e: unknown) => {
      const msg = e instanceof Error ? e.message : "Link failed";
      notification.error(msg);
      // Sign out the user to let them try again - with another github
      await signOut();
    },
  });

  const linkGithubOnce = useRef(false);
  useEffect(() => {
    if (linkGithubOnce.current) return;
    if (authStatus !== "authenticated") return;
    if (data?.username) return;
    if (!session.user?.name) return;
    const username = session?.user?.name;
    linkGithubOnce.current = true;
    link.mutate(username as string);
  }, [authStatus, data, session, link]);

  if (status === "pending") return <div className="loading loading-spinner loading-sm ml-2" />;

  if (data?.username) return <Username username={data.username} />;

  return <SignInButton onClick={() => signIn("github")} disabled={link.status === "pending"} />;
};
