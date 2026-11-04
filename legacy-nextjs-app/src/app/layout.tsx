import type { Metadata } from "next";
import { Space_Grotesk, Figtree, JetBrains_Mono } from "next/font/google";
import { MotionProvider } from "@/components/motion/provider";
import "./globals.css";

const fontDisplay = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const fontBody = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const fontMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["500"],
});

export const metadata: Metadata = {
  title: "Kargatox — Strategy, Research & Growth Marketing",
  description:
    "Kargatox helps founders and leadership teams understand their market, decode their customers, and turn that insight into campaigns that move revenue — across India.",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    // src/app/favicon.ico (Next.js's file-convention route) already serves /favicon.ico.
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink font-body">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
