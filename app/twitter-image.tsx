import { ImageResponse } from "next/og";
import { OgCard } from "@/lib/og-card";

export const alt = "Adtell.ai. Cut the cost of work that should not still be done by hand.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(<OgCard />, { ...size });
}
