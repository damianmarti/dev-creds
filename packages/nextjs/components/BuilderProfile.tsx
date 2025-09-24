"use client";

import { Attestations } from "./builder/Attestations";
import { ProfileHeader } from "./builder/ProfileHeader";
import { Skills } from "./builder/Skills";

interface BuilderProfileProps {
  username: string;
}

export function BuilderProfile({ username }: BuilderProfileProps) {
  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6 md:p-8">
      <ProfileHeader username={username} />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Attestations username={username} />
        </div>
        <div className="lg:col-span-1">
          <Skills username={username} />
        </div>
      </div>
    </div>
  );
}
