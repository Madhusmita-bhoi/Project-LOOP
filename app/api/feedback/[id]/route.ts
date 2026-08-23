import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getTenantContext, checkRoleGuard } from "@/lib/auth";
import { FeedbackStatusUpdateSchema } from "@/lib/validations";

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/feedback/[id]: Fetch a single feedback item
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { authenticated, workspaceId } = await getTenantContext();
    if (!authenticated || !workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const item = await prisma.feedback.findFirst({
      where: {
        id: params.id,
        workspaceId, // Tenant isolation check
      },
      include: {
        themes: {
          include: {
            theme: true,
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Feedback item not found" }, { status: 404 });
    }

    return NextResponse.json({ data: item });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch feedback item" },
      { status: 500 }
    );
  }
}

// PATCH /api/feedback/[id]: Update feedback status or fields (e.g. NEW -> REVIEWED -> ACTIONED)
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { authenticated, workspaceId, role } = await getTenantContext();
    if (!authenticated || !workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // RBAC: Analysts and Admins can update, Viewers cannot
    const roleError = checkRoleGuard(role, ["ADMIN", "ANALYST"]);
    if (roleError) return roleError;

    // Verify item belongs to workspace
    const existing = await prisma.feedback.findFirst({
      where: { id: params.id, workspaceId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Feedback item not found" }, { status: 404 });
    }

    const body = await req.json();
    const updateData: any = {};

    if (body.status) {
      const parsedStatus = FeedbackStatusUpdateSchema.safeParse({ status: body.status });
      if (!parsedStatus.success) {
        return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
      }
      updateData.status = parsedStatus.data.status;
    }

    if (body.customerLabel !== undefined) updateData.customerLabel = body.customerLabel;
    if (body.featureArea !== undefined) updateData.featureArea = body.featureArea;

    const updated = await prisma.feedback.update({
      where: { id: params.id },
      data: updateData,
      include: {
        themes: {
          include: {
            theme: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Feedback updated successfully",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update feedback" },
      { status: 500 }
    );
  }
}

// DELETE /api/feedback/[id]: Delete feedback item
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { authenticated, workspaceId, role } = await getTenantContext();
    if (!authenticated || !workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const roleError = checkRoleGuard(role, ["ADMIN", "ANALYST"]);
    if (roleError) return roleError;

    // Verify item belongs to workspace
    const existing = await prisma.feedback.findFirst({
      where: { id: params.id, workspaceId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Feedback item not found" }, { status: 404 });
    }

    await prisma.feedback.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Feedback deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete feedback" },
      { status: 500 }
    );
  }
}
