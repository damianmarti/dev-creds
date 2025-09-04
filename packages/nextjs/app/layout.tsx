import "@rainbow-me/rainbowkit/styles.css";
import { getServerSession } from "next-auth";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "DevCreds - Verifiable Developer Reputation",
  description: "Build your on-chain developer reputation with peer attestations and skill verification",
});

const ScaffoldEthApp = async ({ children }: { children: React.ReactNode }) => {
  const session = await getServerSession();
  return (
    <html suppressHydrationWarning className={``}>
      <body>
        <ThemeProvider enableSystem>
          <ScaffoldEthAppWithProviders session={session}>{children}</ScaffoldEthAppWithProviders>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default ScaffoldEthApp;
