import type { Metadata } from 'next';
import { QueryProvider } from '@/providers/query-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'TaskFlow — Workspace | Task Management',
  description:
    'Minimalist, responsive task management workspace with pagination, status workflows, and accessible dialogs.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className="min-h-dvh antialiased">
      <body className="flex min-h-dvh flex-col">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
