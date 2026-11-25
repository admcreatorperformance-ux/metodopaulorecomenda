import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Fontes do layout (OFL), servidas pelo próprio app: sem depender do Google Fonts.
const poppins = localFont({
  src: [
    { path: "../fonts/poppins-latin-300-normal.woff2", weight: "300", style: "normal" },
    { path: "../fonts/poppins-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../fonts/poppins-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../fonts/poppins-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../fonts/poppins-latin-600-italic.woff2", weight: "600", style: "italic" },
    { path: "../fonts/poppins-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-poppins",
  display: "swap",
});

const montserrat = localFont({
  src: [{ path: "../fonts/montserrat-latin-500-normal.woff2", weight: "500", style: "normal" }],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Área de Membros | Método Paulo Recomenda",
  description: "Aulas, lives e comunidade do Método Paulo Recomenda.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#050505",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${poppins.variable} ${montserrat.variable}`}>
      <body>{children}</body>
    </html>
  );
}
