"use client";

import React from "react";
import { BuilderProfile } from "~~/components/BuilderProfile";

export default function BuilderPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = React.use(params);

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <BuilderProfile username={username} />
      </main>
    </div>
  );
}
