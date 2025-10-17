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

  // define colors here
  const colors = {
    primary: "#0891b2",
    secondary: "#ec4899",
    accent: "#ec4899",
    neutral: "#f1f5f9",
    success: "#34eeb6",
    warning: "#ffcf72",
    error: "#be123c",
    background: "#1e293b",
    base200: "#334155",
    base300: "#0f172a",
  };

  return new ImageResponse(
    React.createElement(
      "div",
      {
        style: {
          width: "1200px",
          height: "800px",
          background: colors.background,
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
            background: colors.background,
            borderRadius: "15px",
            border: `2px solid ${colors.base300}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            padding: "40px",
            shadow: `opacity-50 10px 10px 30px ${colors.base300}`,
          },
        },
        // DevCred logo + CTA
        React.createElement(
          "div",
          {
            style: {
              fontSize: "40px",
              fontWeight: "700",
              color: colors.neutral,
              fontFamily: "SpaceGroteskBold",
              position: "absolute",
              top: "-58px",
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
                fontSize: "36px",
                height: "42px",
                width: "42px",
                backgroundColor: colors.primary,
                borderRadius: "20%",
                marginLeft: "15px",
                marginRight: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "700",
                color: colors.neutral,
                textAlign: "center",
                fontFamily: "SpaceGroteskBold",
              },
            },
            "D",
          ),
          "DevCreds",
        ),
        // Profile Image
        React.createElement("img", {
          style: {
            width: "200px",
            height: "200px",
            borderRadius: "40px",
            objectFit: "cover",
          },
          src: avatarUrl,
        }),
        React.createElement(
          "div",
          {
            style: {
              fontSize: "60px",
              color: colors.neutral,
              position: "absolute",
              top: "35px",
              left: "260px",
              right: "260px",
              height: "200px",
              overflow: "hidden",
              fontFamily: "SpaceGrotesk",
              display: "flex",
              flexDirection: "column",
              gap: "3px",
            },
          },
          //`${developer.name || '@' + developer.githubUser}`,
          React.createElement(
            "span",
            {
              style: {
                fontSize: "60px",
                fontFamily: "SpaceGroteskBold",
                color: colors.neutral,
              },
            },
            `${developer.name || "@" + developer.githubUser}`,
          ),
          developer.name
            ? React.createElement(
                "span",
                {
                  style: {
                    fontSize: "24px",
                    color: colors.primary,
                    fontFamily: "SpaceGroteskBold",
                    opacity: "70%",
                    marginTop: "-5px",
                  },
                },
                `@${developer.githubUser}`,
              )
            : null,
          React.createElement(
            "span",
            {
              style: {
                fontSize: "24px",
                color: colors.neutral,
              },
            },
            `${developer.bio || ""}`,
          ),
        ),
        // Profile Scores
        React.createElement(
          "div",
          {
            style: {
              border: `1px solid ${colors.base200}`,
              borderRadius: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "absolute",
              top: "40px", // 190px for the profile image
              right: "40px",
              width: "200px",
              height: "200px",
              backgroundColor: colors.primary,
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
                borderRight: `1px solid ${colors.base200}`,
              },
            },
            React.createElement(
              "span",
              {
                style: {
                  fontSize: "100px",
                  color: colors.neutral,
                  fontFamily: "SpaceGroteskBold",
                },
              },
              developer.score,
            ),
            React.createElement(
              "span",
              {
                style: {
                  fontSize: "24px",
                  color: colors.neutral,
                  fontFamily: "SpaceGroteskBold",
                },
              },
              "Cred Score",
            ),
          ),
        ),
        // Profile Skills
        React.createElement(
          "div",
          {
            style: {
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              rowGap: "25px",
              columnGap: "30px",
              justifyContent: "flex-start",
              marginTop: "25px",
              height: "200px",
              overflow: "hidden",
              fontFamily: "DMSansBold",
              paddingTop: "15px",
              paddingRight: "20px",
            },
          },
          // sort by number of attestations
          developer.skills.items
            .sort((a, b) => b.score - a.score)
            .map(skill => (
              <div
                key={skill.skill}
                style={{
                  backgroundColor: colors.secondary,
                  color: colors.neutral,
                  borderRadius: "5px",
                  display: "flex",
                  padding: "8px 20px",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "DMSans",
                  fontSize: "30px",
                  position: "relative",
                }}
              >
                {skill.skill}
                <div
                  style={{
                    fontSize: "24px",
                    backgroundColor: colors.primary,
                    borderRadius: "5px",
                    padding: "2px 15px",
                    color: colors.neutral,
                    display: "flex",
                    position: "absolute",
                    fontFamily: "DMSansBold",
                    top: "-15px",
                    right: "-20px",
                  }}
                >
                  {skill.score}
                </div>
              </div>
            )),
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
        {
          name: "DMSansBold",
          data: await loadGoogleFont("DM+Sans:wght@700"),
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
