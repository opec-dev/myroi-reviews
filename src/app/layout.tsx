import type { Metadata } from "next";
import "./globals.css";
import "./brand.css";
import { AppAuthProvider } from "@/components/auth-provider";

export const metadata: Metadata = {
  title: "myROI Reviews",
  description: "Turn customer trust into visible proof.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const authEnabled = process.env.STATIC_EXPORT !== "true" && Boolean(process.env.WORKOS_CLIENT_ID && process.env.WORKOS_API_KEY && process.env.WORKOS_COOKIE_PASSWORD);
  return (
    <html lang="en">
      <body><AppAuthProvider enabled={authEnabled}>{children}</AppAuthProvider></body>
    </html>
  );
}
