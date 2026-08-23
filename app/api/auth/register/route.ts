import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";
import { SignUpSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = SignUpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, email, password, workspaceName, role = "ADMIN" } = parsed.data;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Create workspace
    const slug = workspaceName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const workspace = await prisma.workspace.create({
      data: {
        name: workspaceName,
        slug: `${slug}-${Math.random().toString(36).substring(2, 7)}`,
      },
    });

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with specified role (or default ADMIN)
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        passwordHash,
        role,
        workspaceId: workspace.id,
      },
    });

    // Seed default themes for the new workspace
    const defaultThemes = [
      { name: "Onboarding & Setup", description: "First-time user onboarding & setup", color: "#6366f1" },
      { name: "Billing & Invoicing", description: "Pricing, invoices, and payments", color: "#ec4899" },
      { name: "Performance & Speed", description: "Latency, table load speeds, and uptime", color: "#f59e0b" },
      { name: "UI/UX Navigation", description: "Design layout and navigation ease", color: "#8b5cf6" },
      { name: "Enterprise SSO", description: "SAML, Okta, and enterprise security", color: "#3b82f6" },
      { name: "Integration & API", description: "API, webhooks, and third-party tools", color: "#10b981" },
    ];

    for (const theme of defaultThemes) {
      await prisma.theme.create({
        data: {
          ...theme,
          workspaceId: workspace.id,
        },
      });
    }

    return NextResponse.json(
      {
        message: "Account and workspace created successfully",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          workspaceId: workspace.id,
          workspaceName: workspace.name,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create account" },
      { status: 500 }
    );
  }
}
