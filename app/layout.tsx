import type { Metadata, Viewport } from "next";
import { Open_Sans } from "next/font/google";
import "@/app/globals.scss";
import { getProjectInfo } from "./utils/getProjectInfo";
import Providers from "./providers";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

const projectInfo = getProjectInfo();

export const metadata: Metadata = {
  title: projectInfo.title,
  description: projectInfo.description,
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
    other: [
      { rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#1d4ed8" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#1d4ed8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${openSans.variable} h-full antialiased`}>
      <body className="flex flex-col min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
