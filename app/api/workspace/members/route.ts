import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getTenantContext, checkRoleGuard } from "@/lib/auth";
import { MemberInviteSchema, MemberRoleUpdateSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

// GET /api/workspace/members: List all workspace members
export async function GET() {
  try {
    const { authenticated, workspaceId } = await getTenantContext();
    if (!authenticated || !workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const members = await prisma.user.findMany({
      where: { workspaceId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { id: true, name: true, slug: true, createdAt: true },
    });

    return NextResponse.json({ workspace, members });
  } catch (error: any) {
    console.error("GET /api/workspace/members error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch members" },
      { status: 500 }
    );
  }
}

// POST /api/workspace/members: Invite new member (Admin only)
export async function POST(req: Request) {
  try {
    const { authenticated, workspaceId, role } = await getTenantContext();
    if (!authenticated || !workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const roleError = checkRoleGuard(role, ["ADMIN"]);
    if (roleError) return roleError;

    const body = await req.json();
    const parsed = MemberInviteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, email, role: memberRole, password } = parsed.data;

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A user with this email address already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password || "Password123!", 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        passwordHash,
        role: memberRole,
        workspaceId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      { message: "Member added to workspace successfully", user },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/workspace/members error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add member" },
      { status: 500 }
    );
  }
}

// PATCH /api/workspace/members: Update member role (Admin only)
export async function PATCH(req: Request) {
  try {
    const { authenticated, workspaceId, userId: currentUserId, role } = await getTenantContext();
    if (!authenticated || !workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const roleError = checkRoleGuard(role, ["ADMIN"]);
    if (roleError) return roleError;

    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("userId");

    if (!targetUserId) {
      return NextResponse.json({ error: "userId parameter required" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = MemberRoleUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    // Verify member belongs to this workspace
    const member = await prisma.user.findFirst({
      where: { id: targetUserId, workspaceId },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found in this workspace" }, { status: 404 });
    }

    // Prevent removing the last admin or changing own role if alone
    if (member.id === currentUserId && parsed.data.role !== "ADMIN") {
      const adminCount = await prisma.user.count({
        where: { workspaceId, role: "ADMIN" },
      });
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot demote yourself when you are the sole Admin of the workspace." },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: { role: parsed.data.role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({
      message: "Role updated successfully",
      user: updated,
    });
  } catch (error: any) {
    console.error("PATCH /api/workspace/members error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update role" },
      { status: 500 }
    );
  }
}

// DELETE /api/workspace/members: Remove member (Admin only)
export async function DELETE(req: Request) {
  try {
    const { authenticated, workspaceId, userId: currentUserId, role } = await getTenantContext();
    if (!authenticated || !workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const roleError = checkRoleGuard(role, ["ADMIN"]);
    if (roleError) return roleError;

    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("userId");

    if (!targetUserId) {
      return NextResponse.json({ error: "userId parameter required" }, { status: 400 });
    }

    if (targetUserId === currentUserId) {
      return NextResponse.json(
        { error: "You cannot remove yourself from the workspace." },
        { status: 400 }
      );
    }

    const member = await prisma.user.findFirst({
      where: { id: targetUserId, workspaceId },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    await prisma.user.delete({
      where: { id: targetUserId },
    });

    return NextResponse.json({ message: "Member removed from workspace" });
  } catch (error: any) {
    console.error("DELETE /api/workspace/members error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to remove member" },
      { status: 500 }
    );
  }
}
