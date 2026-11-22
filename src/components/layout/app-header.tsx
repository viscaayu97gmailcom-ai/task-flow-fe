'use client';

import { BarChart3, LayoutGrid, Plus, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  onNewTask?: () => void;
  onSync?: () => void;
  isSyncing?: boolean;
}

const NAV_ITEMS = [
  { href: '/', label: 'Workspace', icon: LayoutGrid },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
] as const;

export function AppHeader({
  onNewTask,
  onSync,
  isSyncing = false,
}: AppHeaderProps) {
  const pathname = usePathname();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-40 px-4">
      <nav
        aria-label="Primary Bottom App Bar"
        className="pointer-events-auto mx-auto flex min-h-14 w-fit max-w-full items-center gap-1.5 rounded-full border border-[rgb(0_0_0_/_0.12)] bg-white/92 px-2.5 py-1.5 backdrop-blur-xl sm:gap-2 sm:px-3"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/'
              ? pathname === '/' || pathname.startsWith('/tasks/')
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-[14px] leading-[1.29] tracking-[-0.224px] transition-all active:scale-95',
                isActive
                  ? 'bg-[var(--apple-primary)] font-semibold text-white'
                  : 'text-[var(--apple-ink-muted-80)] hover:bg-[var(--apple-canvas-parchment)] hover:text-[var(--apple-ink)]',
              )}
            >
              <Icon aria-hidden="true" className="size-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {onSync || onNewTask ? (
          <Separator orientation="vertical" className="mx-0.5 h-6 bg-black/12" />
        ) : null}

        {onSync ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onSync}
            aria-label="Sync tasks from API"
            className="rounded-full"
          >
            <RefreshCw
              aria-hidden="true"
              className={cn('size-4', isSyncing ? 'animate-spin' : '')}
            />
          </Button>
        ) : null}

        {onNewTask ? (
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={onNewTask}
            className="px-4"
          >
            <Plus aria-hidden="true" className="size-4" />
            <span>New Task</span>
          </Button>
        ) : null}
      </nav>
    </div>
  );
}
