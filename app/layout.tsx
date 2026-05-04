import './globals.css';

export const metadata = {
  title: 'Plataforma SSP',
  description: 'Prototipo UXLab - Propósito 1',
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