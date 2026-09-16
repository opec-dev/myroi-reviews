import type { CSSProperties } from "react";
import { reviewPlatformCatalog, type ReviewProvider } from "@/lib/demo-data";

export function ProviderBadge({
  provider,
  label,
  iconUrl,
  size = "normal",
}: {
  provider: ReviewProvider | string;
  label?: string;
  iconUrl?: string | null;
  size?: "small" | "normal";
}) {
  const platform = reviewPlatformCatalog.find((item) => item.provider === provider);
  const name = label || platform?.name || provider;
  const fallback = provider === "google" ? "G" : provider === "yelp" ? "Y" : name.slice(0, 1).toUpperCase();
  const defaultImage = provider === "diamond" ? "/brands/diamond-certified.png" : null;
  return (
    <span
      className={`provider-badge provider-${provider} ${size === "small" ? "small" : ""}`}
      style={{ "--provider-color": platform?.color || "#6857d9" } as CSSProperties}
      aria-hidden="true"
    >
      {iconUrl || defaultImage ? <img src={iconUrl || defaultImage!} alt="" /> : fallback}
    </span>
  );
}

export function SocialBadge({ provider, iconUrl }: { provider: string; iconUrl?: string | null }) {
  const glyphs: Record<string, string> = {
    facebook: "f",
    instagram: "◎",
    x: "𝕏",
    tiktok: "♪",
    youtube: "▶",
    linkedin: "in",
    website: "↗",
  };
  return (
    <span className={`social-badge social-${provider}`} aria-hidden="true">
      {iconUrl ? <img src={iconUrl} alt="" /> : glyphs[provider] || "↗"}
    </span>
  );
}
