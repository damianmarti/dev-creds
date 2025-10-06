import React from "react";
import { NextRequest } from "next/server";
import { ImageResponse } from "@vercel/og";
import { fetchDeveloper } from "~~/utils/graphql";

export const runtime = "nodejs";

async function loadGoogleFont(font: string) {
  const url = `https://fonts.googleapis.com/css2?family=${font}`;
  const css = await (await fetch(url)).text();
  const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/);

  if (resource) {
    const response = await fetch(resource[1]);
    if (response.status == 200) {
      return await response.arrayBuffer();
    }
  }

  throw new Error("failed to load font data: " + url);
}

async function loadData(username: string) {
  const data = await fetchDeveloper(username);
  return data;
}

async function generateProfileOgImage(username: string) {
  const developer = await loadData(username);
  const avatarUrl = `https://github.com/${developer.githubUser}.png`;
  const githubUrl = `https://github.com/${developer.githubUser}`;
  console.log(username, developer, avatarUrl, githubUrl);
  return new ImageResponse(
    React.createElement(
      "div",
      {
        style: {
          width: "1200px",
          height: "800px",
          background: "#1E293B",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "SpaceGrotesk, sans-serif",
        },
      },
      React.createElement(
        "div",
        {
          style: {
            width: "1100px",
            height: "500px",
            background: "#1E293B",
            borderRadius: "15px",
            border: "2px solid #0f172a",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px",
            shadow: "opacity-50 10px 10px 30px rgb(255 0 0 / 0.99)",
          },
        },
        React.createElement(
          "span",
          {
            style: {
              fontSize: "48px",
              fontWeight: "700",
              color: "#666666",
              textAlign: "center",
            },
          },
          "Something is Cooking 🚀🚀🚀",
        ),
        React.createElement(
          "span",
          {
            style: {
              fontSize: "24px",
              fontWeight: "400",
              color: "#999999",
              textAlign: "center",
              marginTop: "20px",
              fontFamily: "DMSans, sans-serif",
            },
          },
          "Stay tuned!",
        ),
      ),
    ),
    {
      width: 1200,
      height: 800,
      fonts: [
        {
          name: "SpaceGrotesk",
          data: await loadGoogleFont("Space+Grotesk:wght@400"),
          style: "normal",
        },
        {
          name: "SpaceGroteskBold",
          data: await loadGoogleFont("Space+Grotesk:wght@700"),
          style: "normal",
        },
        {
          name: "SpaceGroteskLight",
          data: await loadGoogleFont("Space+Grotesk:wght@300"),
          style: "normal",
        },
        {
          name: "DMSans",
          data: await loadGoogleFont("DM+Sans:wght@400"),
          style: "normal",
        },
      ],
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    },
  );
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return generateProfileOgImage(username ?? "");
}
