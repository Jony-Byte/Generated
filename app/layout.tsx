import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Generated",
    template: "%s | Generated",
  },
  description: "AIが複数の原典を確認し、技術・科学・インターネットの変化を伝える日本語ニュースサイト。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
