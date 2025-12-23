"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SwitchTheme } from "./SwitchTheme";
import { Search } from "./search/Search";
import { useQuery } from "@tanstack/react-query";
import { hardhat } from "viem/chains";
import { useAccount } from "wagmi";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick, useTargetNetwork } from "~~/hooks/scaffold-eth";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

const baseMenuLinks: HeaderMenuLink[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Builders",
    href: "/builders",
  },
  {
    label: "Attest",
    href: "/attest",
  },
  {
    label: "Attestations",
    href: "/attestations",
  },
];

const peersLink: HeaderMenuLink = {
  label: "My Peers",
  href: "/peers",
};

export const HeaderMenuLinks = () => {
  const pathname = usePathname();
  const { address, isConnected } = useAccount();

  // Check if GitHub username is linked
  const { data: githubData } = useQuery<{ username: string }>({
    queryKey: ["githubUsername", address],
    queryFn: async () => {
      if (!address) return null;
      const res = await fetch(`/api/github?address=${address}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: isConnected && !!address,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Include Peers link only if GitHub username is linked
  const menuLinks = githubData?.username ? [...baseMenuLinks, peersLink] : baseMenuLinks;

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={`${
                isActive ? "bg-secondary shadow-md text-secondary-content" : ""
              } hover:bg-secondary hover:shadow-md focus:!bg-secondary active:!text-secondary-content hover:!text-secondary-content py-1.5 px-3 text-sm rounded-md gap-2 grid grid-flow-col`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

/**
 * Site header
 */
export const Header = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;

  const burgerMenuRef = useRef<HTMLDetailsElement>(null);
  useOutsideClick(burgerMenuRef, () => {
    burgerMenuRef?.current?.removeAttribute("open");
  });

  return (
    <div className="sticky lg:static top-0 navbar bg-base-100 min-h-0 shrink-0 justify-between z-20 x-0 px-1 sm:px-2 border-b border-base-200 shadow-sm">
      <div className="navbar-start w-auto lg:w-1/2">
        <details className="dropdown" ref={burgerMenuRef}>
          <summary className="ml-1 px-2 btn btn-ghost lg:hidden hover:bg-transparent">
            <Bars3Icon className="h-1/2" />
          </summary>
          <ul
            className="menu menu-compact dropdown-content mt-3 p-2 shadow-sm bg-base-100 rounded-box w-52"
            onClick={() => {
              burgerMenuRef?.current?.removeAttribute("open");
            }}
          >
            <HeaderMenuLinks />
          </ul>
        </details>
        <Link href="/" passHref className="hidden lg:flex items-center gap-2 ml-4 mr-6 shrink-0">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-content font-bold text-lg font-serif">D</span>
          </div>
          <span className="font-serif font-bold text-xl text-foreground">DevCreds</span>
        </Link>
        <ul className="hidden lg:flex lg:flex-nowrap menu menu-horizontal px-1 gap-2">
          <HeaderMenuLinks />
          <Search />
        </ul>
      </div>
      <div className="navbar-end grow mr-1 sm:mr-2 md:mr-4">
        <SwitchTheme className={`mr-2 pointer-events-auto ${isLocalNetwork ? "self-end md:self-auto" : ""}`} />
        <RainbowKitCustomConnectButton />
        {isLocalNetwork && <FaucetButton />}
      </div>
    </div>
  );
};
