import { PageSkeleton } from "@/components/page-skeleton";

// Navegación entre pantallas de admin (comparten layout): respuesta inmediata.
export default function Loading() {
  return <PageSkeleton rows={5} />;
}
