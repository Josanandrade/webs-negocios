import { PageSkeleton } from "@/components/page-skeleton";

// Con un loading.tsx, Next.js precarga la navegación y muestra este esqueleto
// en cuanto se toca un enlace, en lugar de esperar a la respuesta del servidor.
export default function Loading() {
  return <PageSkeleton rows={7} />;
}
