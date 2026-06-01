import "./globals.css";

export const metadata = {
  title: "Plataforma Web SSP-UXLab",
  description: "MVP metodológico para el Propósito 1 de la guía UXLab",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
