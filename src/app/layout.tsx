import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "myROI Reviews",
  description: "Turn customer trust into visible proof.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
