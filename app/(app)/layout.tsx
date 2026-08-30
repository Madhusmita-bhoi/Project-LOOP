import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import AppShell from "@/components/AppShell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();
  if (!session) {
    redirect("/login");
  }

  return <AppShell initialSession={session}>{children}</AppShell>;
}
