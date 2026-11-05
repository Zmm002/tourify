import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { WorkspaceShell } from "@/components/workspace-shell";
import { getCurrentSession } from "@/lib/dal";

export const metadata: Metadata = {
  title: { default: "Dashboard Admin — Tourify", template: "%s — Tourify Admin" },
  description: "Kelola pemesanan, wahana, pelanggan, dan laporan Tourify.",
};

export default async function WorkspaceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  const user = { id: session.user.id, name: session.user.name, email: session.user.email, image: session.user.image ?? null };
  return <WorkspaceShell user={user}>{children}</WorkspaceShell>;
}
