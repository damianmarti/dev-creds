import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { GithubSVG } from "../components/assets/GithubSVG";
import { queryClient } from "./ScaffoldEthAppWithProviders";
import { useQuery } from "@tanstack/react-query";
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

const postGithubSignin = async ({
  address,
  username,
  force = false,
}: {
  address: Address;
  username: string;
  force?: boolean;
}) => {
  const res = await fetch("/api/github", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      address,
      username,
      force,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    return {
      status: res.status,
      data: {},
    };
  }
  return {
    status: res.status,
    data,
  };
};

export const LinkGithub = ({ address }: LinkGitHubProps) => {
  const { status: authStatus, data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [overwriteModal, setOverwriteModal] = useState<{
    existingAddress: string;
    pendingUsername: string;
  } | null>(null);
  const [forcing, setForcing] = useState(false);

  const { data, status } = useQuery<GitHubResponse>({
    queryKey: ["githubUsername", address],
    queryFn: async () => {
      const res = await fetch(`/api/github?address=${address}`);
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const handleConnect = async () => {
    // Ensure user is authenticated with GitHub to get username
    if (authStatus !== "authenticated") {
      try {
        if (typeof window !== "undefined") {
          // Mark intent to link so we auto-complete after OAuth redirect
          window.sessionStorage.setItem("githubLinkIntent", address);
        }
      } catch {}
      await signIn("github");
      return;
    }
    setIsLoading(true);
    const username = session?.user?.name as string | undefined;
    if (!username) {
      notification.error("GitHub username not available. Try signing in again.");
      await signOut();
      return;
    }
    const { status, data } = await postGithubSignin({ address, username });
    if (status === 409) {
      setOverwriteModal({ existingAddress: data.existingAddress, pendingUsername: username });
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
    queryClient.invalidateQueries({ queryKey: ["githubUsername", address] });
    notification.success("GitHub linked");
  };

  const handleForceLink = async () => {
    if (!overwriteModal) return;
    setForcing(true);
    setIsLoading(true);
    try {
      await postGithubSignin({
        address,
        username: overwriteModal.pendingUsername,
        force: true,
      });
      queryClient.invalidateQueries({ queryKey: ["githubUsername", address] });
      notification.success("GitHub linked");
      setOverwriteModal(null);
    } finally {
      setIsLoading(false);
      setForcing(false);
    }
  };

  // Auto-complete linking ONLY after OAuth redirect (when user JUST authenticated, not on page refresh)
  // Use a sessionStorage flag set before redirect to GitHub to avoid auto-linking on normal loads
  const hasAttemptedAutoLink = useRef(false);

  useEffect(() => {
    if (hasAttemptedAutoLink.current) return;
    if (authStatus !== "authenticated") return;
    if (data?.username) return;
    if (!session?.user?.name) return;

    let intentAddress: string | null = null;
    try {
      if (typeof window !== "undefined") {
        intentAddress = window.sessionStorage.getItem("githubLinkIntent");
      }
    } catch {}

    // Only auto-link if user explicitly initiated the flow before redirect
    if (!intentAddress) return;

    hasAttemptedAutoLink.current = true;
    try {
      // Clear the intent before attempting to avoid loops
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem("githubLinkIntent");
      }
    } catch {}

    // Trigger the same handleConnect logic
    handleConnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authStatus, data, session]);

  if (status === "pending") return <div className="loading loading-spinner loading-sm ml-2" />;

  if (data?.username) return <Username username={data.username} />;

  return (
    <>
      <SignInButton onClick={handleConnect} disabled={forcing || isLoading} />
      {overwriteModal && (
        <dialog open className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Relink GitHub?</h3>
            <p className="py-2">
              This GitHub account is already linked to address {overwriteModal.existingAddress}.<br />
              Do you want to overwrite and link it to {address}?
            </p>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setOverwriteModal(null)} disabled={forcing}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleForceLink} disabled={forcing}>
                {forcing ? "Linking..." : "Yes"}
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setOverwriteModal(null)} disabled={forcing}>
              close
            </button>
          </form>
        </dialog>
      )}
    </>
  );
};
