import { createBookingProxy } from "@/lib/avanttai-booking/server";

export const dynamic = "force-dynamic";
export const { GET, POST } = createBookingProxy({
  experienceContext: "embed",
  experienceSource: "eferos_web",
});
