import { Inter, Sora } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["600", "700", "800"],
  display: "swap"
});

export const metadata = {
  title: "The Shop",
  description: "A small, focused storefront."
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FAFAF8"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body className="font-body flex min-h-screen flex-col">{children}</body>
    </html>
  );
}
