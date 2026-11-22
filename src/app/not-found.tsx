import Link from 'next/link';
import { AppFooter } from '@/components/layout/app-footer';
import { AppHeader } from '@/components/layout/app-header';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-[var(--apple-canvas)] text-[var(--apple-ink)]">
      <AppHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <p className="text-[14px] font-semibold text-[var(--apple-primary)]">
          404
        </p>
        <h1 className="mt-2 text-[clamp(1.75rem,1.2rem+2vw,3rem)] font-semibold tracking-[-0.02em] text-[var(--apple-ink)]">
          The page you’re looking for can’t be found.
        </h1>
        <p className="mt-3 max-w-md text-[17px] leading-[1.47] text-[var(--apple-ink-muted-48)]">
          Return to the TaskFlow workspace board to browse or create tasks.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--apple-primary)] px-6 py-2.5 text-[17px] text-white transition-transform duration-150 hover:brightness-95 active:scale-95"
        >
          Back to Workspace
        </Link>
      </main>
      <AppFooter />
    </div>
  );
}
