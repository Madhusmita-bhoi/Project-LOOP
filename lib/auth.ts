import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "./db";
import { Role, UserSession } from "./types";
import { NextResponse } from "next/server";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
          include: { workspace: true },
        });

        if (!user || !user.passwordHash) {
          throw new Error("Invalid email or password");
        }

        const isPasswordMatch = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordMatch) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as Role,
          workspaceId: user.workspaceId,
          workspaceName: user.workspace.name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as unknown as UserSession).role;
        token.workspaceId = (user as unknown as UserSession).workspaceId;
        token.workspaceName = (user as unknown as UserSession).workspaceName;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as unknown as UserSession).id = token.id as string;
        (session.user as unknown as UserSession).role = token.role as Role;
        (session.user as unknown as UserSession).workspaceId = token.workspaceId as string;
        (session.user as unknown as UserSession).workspaceName = token.workspaceName as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "project_loop_super_secret_session_jwt_key_2026",
};

/**
 * Returns the current authenticated session on server side
 */
export async function getAuthSession() {
  return await getServerSession(authOptions);
}

/**
 * Validates session and returns the verified tenant context
 */
export async function getTenantContext() {
  const session = await getAuthSession();
  if (!session || !session.user) {
    return {
      authenticated: false,
      userId: null,
      workspaceId: null,
      role: null,
      user: null,
    };
  }

  const user = session.user as unknown as UserSession;
  return {
    authenticated: true,
    userId: user.id,
    workspaceId: user.workspaceId,
    role: user.role as Role,
    user,
  };
}

/**
 * Server-side RBAC Guard: Checks role and returns an error response if forbidden
 */
export function checkRoleGuard(userRole: Role | null, allowedRoles: Role[]) {
  if (!userRole || !allowedRoles.includes(userRole)) {
    return NextResponse.json(
      {
        error: "Forbidden: You do not have permission to perform this action.",
        requiredRoles: allowedRoles,
        currentRole: userRole,
      },
      { status: 403 }
    );
  }
  return null;
}
