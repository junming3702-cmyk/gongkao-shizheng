import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const isGitHubPages = process.env.GITHUB_PAGES === "true";
  const base = isGitHubPages
    ? new URL("https://junming3702-cmyk.github.io/gongkao-shizheng/")
    : new URL(`${protocol}://${host}`);
  const iconPath = isGitHubPages ? "/gongkao-shizheng/favicon.svg" : "/favicon.svg";
  const title = "时政 · 公考资料库";
  const description = "按月收集、整理与提炼公考时政信息。";

  return {
    metadataBase: base,
    title,
    description,
    icons: { icon: iconPath, shortcut: iconPath },
    openGraph: { title, description, images: [new URL("og.png", base).toString()] },
    twitter: { card: "summary_large_image", title, description, images: [new URL("og.png", base).toString()] },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
