import { NextResponse } from "next/server";

// Las notas de trabajo junto a los assets (README_ASSETS.md) no se sirven:
// la preview pública solo contiene la web.
export function proxy() {
  return new NextResponse("Not found", { status: 404 });
}

export const config = {
  matcher: ["/assets/:path*.md", "/assets/:path*.MD"],
};
