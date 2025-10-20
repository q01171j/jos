import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-sans"
});

export const metadata: Metadata = {
  title: "Sistema de Incidencias 360",
  description: "Gestion integral de incidencias para la Municipalidad de Huancayo"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className="bg-background">
      <body className={`${poppins.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
