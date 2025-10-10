import type { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_URL
  ? process.env.NEXT_PUBLIC_URL
  : `http://localhost:${process.env.PORT || 3000}`;
const titleTemplate = "%s | DevCreds";

export const getMetadata = ({
  title,
  description,
  imageRelativePath = "/thumbnail.jpg",
  url,
}: {
  title: string;
  description: string;
  imageRelativePath?: string;
  url?: string;
}): Metadata => {
  const imageUrl = `${baseUrl}${imageRelativePath}`;
  const effectiveUrl = url || baseUrl;
  const miniAppContent = JSON.stringify({
    version: "1",
    imageUrl: imageUrl,
    button: {
      title: `${process.env.NEXT_PUBLIC_APP_NAME ?? title}`,
      action: {
        url: effectiveUrl,
        type: "launch_miniapp",
        name: `${process.env.NEXT_PUBLIC_APP_NAME ?? title}`,
        splashImageUrl: `${process.env.NEXT_PUBLIC_APP_SPLASH_IMAGE ?? `${baseUrl}/favicon.png`}`,
        splashBackgroundColor: `${process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR ?? "#000000"}`,
      },
    },
  });

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: title,
      template: titleTemplate,
    },
    description: description,
    openGraph: {
      title: {
        default: title,
        template: titleTemplate,
      },
      description: description,
      images: [
        {
          url: imageUrl,
        },
      ],
    },
    twitter: {
      title: {
        default: title,
        template: titleTemplate,
      },
      description: description,
      images: [imageUrl],
    },
    icons: {
      icon: [
        {
          url: "/favicon.png",
          sizes: "32x32",
          type: "image/png",
        },
      ],
    },
    other: {
      "fc:miniapp": miniAppContent,
    },
  };
};
