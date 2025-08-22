import NextAuth, { type NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";

const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
      profile(profile) {
        return {
          id: String(profile.id),
          name: profile.name,
          email: profile.email,
          image: profile.avatar_url,
          username: profile.login,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, profile }) {
      if (profile) {
        token.username = (profile as any).login;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).username = token.username as string | undefined;
        (session.user as any).id = token.id as string | undefined;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : `${baseUrl}/protected/client`;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthOptions;

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
