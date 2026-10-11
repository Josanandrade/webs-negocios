import { requireAdmin } from "@/lib/auth";

// Las páginas también llaman a requireAdmin(): un layout no protege por sí solo
// las peticiones a páginas hijas. Y la RLS impide leer o escribir datos de admin.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return children;
}
