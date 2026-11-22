import Link from 'next/link';
import { API_BASE_URL } from '@/lib/api-client';

export function AppFooter() {
  return (
    <footer className="border-t border-[var(--apple-hairline)] bg-[var(--apple-canvas)] px-4 pt-10 pb-28 text-[var(--apple-ink-muted-48)] sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-4 text-[12px] leading-[1.4] tracking-[-0.12px] sm:flex-row sm:items-center">
        <p>TaskFlow — Next.js App Router + TanStack Query CSR Workspace.</p>
        <div className="flex flex-wrap items-center gap-5">
          <Link
            href="/"
            className="text-[var(--apple-ink-muted-80)] hover:text-[var(--apple-primary)] hover:underline"
          >
            Workspace
          </Link>
          <Link
            href="/analytics"
            className="text-[var(--apple-ink-muted-80)] hover:text-[var(--apple-primary)] hover:underline"
          >
            Analytics
          </Link>
          <span>API: {API_BASE_URL}/v1/tasks</span>
        </div>
      </div>
    </footer>
  );
}
