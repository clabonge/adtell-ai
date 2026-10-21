import { ImageResponse } from "next/og";
import { OgCard } from "@/lib/og-card";
import { shareImageSize } from "@/lib/share-image";

export function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("title") ?? "Adtell.ai";
  const title = raw.replace(/[\r\n\t]+/g, " ").trim().slice(0, 140) || "Adtell.ai";
  return new ImageResponse(<OgCard title={title} />, {
    width: shareImageSize.width,
    height: shareImageSize.height,
  });
}
