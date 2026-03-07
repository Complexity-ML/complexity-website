import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
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
  // Use JWT strategy so existing session logic works (adapter stores users but JWT handles sessions)
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (account) {
        token.provider = account.provider;
        token.providerAccountId = account.providerAccountId;
      }
      if (user) {
        token.dbId = user.id; // Prisma user ID
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
        // Stable user_id: provider::providerAccountId
        (session.user as Record<string, unknown>).id =
          `${token.provider}::${token.providerAccountId}`;
        // Prisma DB user ID
        (session.user as Record<string, unknown>).dbId = token.dbId;
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
