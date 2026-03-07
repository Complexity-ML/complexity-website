import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.provider = account.provider;
        token.providerAccountId = account.providerAccountId;
      }
      if (profile) {
        token.name = profile.name;
        token.picture = (profile as Record<string, unknown>).avatar_url as string
          ?? (profile as Record<string, unknown>).picture as string
          ?? token.picture;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // Stable user_id: provider::providerAccountId (e.g. "github::12345")
        (session.user as Record<string, unknown>).id =
          `${token.provider}::${token.providerAccountId}`;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
