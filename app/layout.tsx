import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Assembly - School life. All here.",
  description:
    "Discover school events, explore the calendar and reserve your place. A BTUI 2026 competition demonstration.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
