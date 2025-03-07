import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Montserrat } from "next/font/google"; // Add Montserrat
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "600", "700"], // Regular, Semi-bold, Bold
});

export const metadata: Metadata = {
  title: "SetRep",
  description: "Force, Intensity, Gains",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} antialiased font-montserrat`}
      >
        {children}
      </body>
    </html>
  );
}
