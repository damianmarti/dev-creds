import { NextResponse } from "next/server";
import redis from "~~/lib/redis";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address")?.toLowerCase();

  const username = await redis.get(`github:byAddress:${address}`);
  if (!username) {
    return NextResponse.json({ error: "This Ethereum address is not linked to github account" }, { status: 404 });
  }

  return NextResponse.json({ username });
}

export async function POST(req: Request) {
  const { address, username } = await req.json();
  if (!address || !username) {
    return NextResponse.json({ error: "Missing address or username" }, { status: 400 });
  }

  // Check if the username is already linked to another address
  const existingAddress = await redis.get(`github:byUsername:${username}`);
  if (existingAddress && existingAddress.toLowerCase() !== address.toLowerCase()) {
    return NextResponse.json(
      { error: "This GitHub username is already linked to another Ethereum address" },
      { status: 400 },
    );
  }
  // Link the username to the address so that only 1-1 mapping is possible
  await redis.set(`github:byAddress:${address.toLowerCase()}`, username);
  await redis.set(`github:byUsername:${username}`, address.toLowerCase());

  return NextResponse.json({ message: "GitHub account linked successfully" });
}
