import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "@/app/globals.scss";
import { getProjectInfo } from "./utils/getProjectInfo";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${openSans.variable} h-full antialiased`}>
      <body className="flex flex-col min-h-full">{children}</body>
    </html>
  );
}
