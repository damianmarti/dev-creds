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
            alignItems: "flex-start",
            justifyContent: "flex-start",
            padding: "40px",
            shadow: "opacity-50 10px 10px 30px rgb(255 0 0 / 0.99)",
          },
        },

        React.createElement(
          "div",
          {
            style: {
              fontSize: "24px",
              fontWeight: "700",
              color: "#FFFFFF",
              fontFamily: "SpaceGroteskBold",
              position: "absolute",
              bottom: "10px",
              left: "0px",
              right: "0px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            },
          },
          "Get Your Verified Profile on",
          React.createElement(
            "span",
            {
              style: {
                fontSize: "24px",
                height: "34px",
                width: "34px",
                backgroundColor: "#0991B2",
                borderRadius: "20%",
                marginLeft: "15px",
                marginRight: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "700",
                color: "#FFFFFF",
                textAlign: "center",
                fontFamily: "SpaceGroteskBold",
              },
            },
            "D",
          ),
          "DevCreds",
        ),
        React.createElement("img", {
          style: {
            width: "280px",
            height: "280px",
            borderRadius: "25%",
            objectFit: "cover",
          },
          src: avatarUrl,
        }),
        React.createElement(
          "span",
          {
            style: {
              fontSize: "48px",
              color: "#FFFFFF",
              position: "absolute",
              top: "35px",
              left: "370px",
              fontFamily: "SpaceGrotesk",
            },
          },
          `@${developer.githubUser}`,
        ),
        React.createElement(
          "div",
          {
            style: {
              border: "1px solid #334155",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "absolute",
              top: "120px",
              left: "370px",
              right: "40px",
              bottom: "180px",
            },
          },
          // Metric 1: Cred Score
          React.createElement(
            "div",
            {
              style: {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
                height: "100%",
                borderRight: "1px solid #334155",
              },
            },
            React.createElement(
              "span",
              {
                style: {
                  fontSize: "80px",
                  color: "#FFFFFF",
                  fontFamily: "SpaceGroteskBold",
                },
              },
              developer.score,
            ),
            React.createElement(
              "span",
              {
                style: {
                  fontSize: "20px",
                  color: "#0891b2",
                  fontFamily: "SpaceGrotesk",
                  marginTop: "6px",
                },
              },
              "Cred Score",
            ),
          ),
          // Metric 2: Attestations
          React.createElement(
            "div",
            {
              style: {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
                height: "100%",
                borderRight: "1px solid #334155",
              },
            },
            React.createElement(
              "span",
              {
                style: {
                  fontSize: "80px",
                  color: "#FFFFFF",
                  fontFamily: "SpaceGroteskBold",
                },
              },
              developer.attestationsCount,
            ),
            React.createElement(
              "span",
              {
                style: {
                  fontSize: "20px",
                  color: "#0891b2",
                  fontFamily: "SpaceGrotesk",
                  marginTop: "6px",
                },
              },
              "Attestations",
            ),
          ),
          // Metric 3: Verified Attestations
          React.createElement(
            "div",
            {
              style: {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
                height: "100%",
              },
            },
            React.createElement(
              "span",
              {
                style: {
                  fontSize: "80px",
                  color: "#FFFFFF",
                  fontFamily: "SpaceGroteskBold",
                },
              },
              developer.verifiedAttestationsCount,
            ),
            React.createElement(
              "span",
              {
                style: {
                  fontSize: "20px",
                  color: "#0891b2",
                  fontFamily: "SpaceGrotesk",
                  marginTop: "6px",
                },
              },
              "Verified Attestations",
            ),
          ),
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
