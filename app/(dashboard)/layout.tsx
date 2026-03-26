import { requireSessionUser } from "@/lib/auth";

export default async function DashboardGroupLayout({
  children
}: {
  children: React.ReactNode;
}) {
  await requireSessionUser("/dashboard");
  return children;
}
