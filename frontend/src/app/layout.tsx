import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cafe Admin Dashboard',
  description: 'Cafe Management System',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
