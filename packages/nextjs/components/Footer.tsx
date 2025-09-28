import React from "react";
import Image from "next/image";
import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="border-t border-base-300 bg-base-200 text-base-content">
      <div className="px-6 py-12 mx-[2%] sm:mx-[4%] md:mx-[10%] lg:mx-[12%] xl:mx-[15%]">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2.5rem_auto_1fr] gap-x-6 gap-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-content font-bold text-lg font-serif">D</span>
              </div>
              <span className="font-serif font-bold text-xl">DevCreds</span>
            </div>
            <p className="opacity-70 text-sm">
              Building verifiable developer reputation on Arbitrum with peer attestations and skill verification.
            </p>
          </div>

          {/* Spacer to separate Brand from the middle section without affecting other gaps */}
          <div className="hidden md:block" />

          <div className="md:flex md:gap-6 space-y-8 md:space-y-0">
            <div className="space-y-4 md:min-w-[14rem]">
              <h3 className="font-serif font-semibold">Product</h3>
              <div className="space-y-2 text-sm">
                <Link href="/builders" className="block opacity-70 hover:opacity-100 transition-colors">
                  Builders
                </Link>
                <Link href="/attest" className="block opacity-70 hover:opacity-100 transition-colors">
                  Attest
                </Link>
                <Link href="/attestations" className="block opacity-70 hover:opacity-100 transition-colors">
                  Attestations
                </Link>
              </div>
            </div>

            <div className="space-y-4 md:min-w-[14rem]">
              <h3 className="font-serif font-semibold">Community</h3>
              <div className="space-y-2 text-sm">
                <Link
                  href="https://github.com/damianmarti/dev-creds"
                  target="_blank"
                  className="block opacity-70 hover:opacity-100 transition-colors"
                >
                  GitHub
                </Link>
                <Link
                  href="https://x.com/buidlguidl"
                  target="_blank"
                  className="block opacity-70 hover:opacity-100 transition-colors"
                >
                  Twitter
                </Link>
                <Link
                  href="https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA"
                  target="_blank"
                  className="block opacity-70 hover:opacity-100 transition-colors"
                >
                  Telegram
                </Link>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span>Built by</span>
              <a
                href="https://arbitrum.buidlguidl.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center"
              >
                <Image
                  alt="BuidlGuidl Logo"
                  src="/logo-buidlguidl.svg"
                  width={135}
                  height={27}
                  className="h-5 w-auto mb-1.5"
                />
              </a>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span>Funded by</span>
              <a
                href="https://arbitrum.foundation/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center"
              >
                <Image alt="Arbitrum Logo" src="/logo-arbitrum.svg" width={135} height={27} className="h-8 w-auto" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
