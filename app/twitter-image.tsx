import { ImageResponse } from "next/og";
import { OgCard } from "@/lib/og-card";
import { shareImageAlt, shareImageSize } from "@/lib/share-image";

export const alt = shareImageAlt;
export const size = shareImageSize;
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(<OgCard />, { ...size });
}
