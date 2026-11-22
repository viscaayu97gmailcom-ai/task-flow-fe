import { Skeleton } from '@/components/ui/skeleton';

export default function RootLoading() {
  return (
    <div className="flex min-h-dvh flex-col bg-[var(--apple-canvas)]">
      <div className="w-full border-b border-[var(--apple-divider-soft)] bg-[var(--apple-canvas)] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1440px] space-y-6">
          <Skeleton className="h-9 w-48" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-28 w-full rounded-[18px]" />
            <Skeleton className="h-28 w-full rounded-[18px]" />
            <Skeleton className="h-28 w-full rounded-[18px]" />
            <Skeleton className="h-28 w-full rounded-[18px]" />
          </div>
        </div>
      </div>
      <div className="mx-auto w-full max-w-[1440px] space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="h-16 w-full rounded-[18px]" />
        <Skeleton className="h-72 w-full rounded-[18px]" />
      </div>
    </div>
  );
}
