import type { Metadata, Viewport } from "next";
import { Cinzel, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cinzel",
  display: "swap",
});

export const metadata: Metadata = {
  title: "A Diwali Wish — Made Just for You",
  description:
    "A little celebration of light, made with love for someone very special. Light the diya, unwrap the magic, and celebrate the Festival of Lights.",
  applicationName: "Diwali",
  keywords: ["Diwali", "Festival of Lights", "greeting", "rangoli", "diya"],
  authors: [{ name: "Kanchan Simlandi" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#060312",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${inter.variable} ${cinzel.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
