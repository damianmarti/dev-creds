import { useEffect, useRef } from "react";
import { queryClient } from "./ScaffoldEthAppWithProviders";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Address } from "abitype";
import axios from "axios";
import { signIn, signOut, useSession } from "next-auth/react";
import { notification } from "~~/utils/scaffold-eth";

type GitHubResponse = { username: string };

type LinkGitHubProps = { address: Address };

const SignInButton = ({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) => (
  <button onClick={onClick} disabled={disabled} className="btn btn-primary btn-sm ml-2">
    Sign in with GitHub
  </button>
);

const Username = ({ username }: { username: string }) => {
  return (
    <span className="ml-2 inline-flex items-center gap-1 font-bold">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
        className="lucide lucide-github"
      >
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
        <path d="M9 18c-4.51 2-5-2-7-2" />
      </svg>
      {username}
    </span>
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
      const response = await axios.post("/api/github", { address, username });
      return response.data;
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

  if (status === "pending") return <div className="loading loading-spinner loading-sm" />;

  if (data?.username) return <Username username={data.username} />;

  return <SignInButton onClick={() => signIn("github")} disabled={link.status === "pending"} />;
};
