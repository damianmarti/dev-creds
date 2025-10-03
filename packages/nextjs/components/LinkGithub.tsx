import { useEffect, useRef, useState } from "react";
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
    const username = session?.user?.name as string | undefined;
    if (!username) {
      notification.error("GitHub username not available. Try signing in again.");
      await signOut();
      return;
    }

    // Attempt to link without force first
    const res = await fetch("/api/github", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, username }),
    });

    if (res.status === 409) {
      const payload = await res.json();
      setOverwriteModal({ existingAddress: payload.existingAddress, pendingUsername: username });
      return;
    }

    const dataRes = await res.json();
    if (!res.ok) {
      notification.error(dataRes.error || "Linking GitHub account failed");
      await signOut();
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["githubUsername", address] });
    notification.success("GitHub linked");
  };

  const handleForceLink = async () => {
    if (!overwriteModal) return;
    setForcing(true);
    try {
      const resForce = await fetch("/api/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, username: overwriteModal.pendingUsername, force: true }),
      });
      const dataForce = await resForce.json();
      if (!resForce.ok) {
        notification.error(dataForce.error || "Linking GitHub account failed");
        await signOut();
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["githubUsername", address] });
      notification.success("GitHub linked");
      setOverwriteModal(null);
    } finally {
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
      <SignInButton onClick={handleConnect} disabled={link.status === "pending" || forcing} />
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
