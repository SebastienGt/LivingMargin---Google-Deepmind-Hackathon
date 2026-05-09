import type { Metadata } from "next";
import { Manrope, Crimson_Pro } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});

const crimsonPro = Crimson_Pro({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-crimson",
});

export const metadata: Metadata = {
  title: "livingMargin",
  description:
    "Upload a PDF, get AI-generated interactive components in the right margin, paragraph by paragraph.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${crimsonPro.variable} ${GeistMono.variable}`}
    >
      <body className="subpixel-antialiased">{children}</body>
    </html>
  );
}
