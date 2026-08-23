import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getTenantContext, checkRoleGuard } from "@/lib/auth";

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/reports/[id]: Fetch a saved VoC report
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { authenticated, workspaceId } = await getTenantContext();
    if (!authenticated || !workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const report = await prisma.report.findFirst({
      where: {
        id: params.id,
        workspaceId, // Tenant isolation check
      },
      include: {
        generatedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json({ data: report });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch report" },
      { status: 500 }
    );
  }
}

// DELETE /api/reports/[id]: Delete report (Admin only)
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { authenticated, workspaceId, role } = await getTenantContext();
    if (!authenticated || !workspaceId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const roleError = checkRoleGuard(role, ["ADMIN"]);
    if (roleError) return roleError;

    const existing = await prisma.report.findFirst({
      where: { id: params.id, workspaceId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    await prisma.report.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Report deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete report" },
      { status: 500 }
    );
  }
}
