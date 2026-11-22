'use client';

import { Tabs as TabsPrimitive } from '@base-ui/react/tabs';
import { cn } from '@/lib/utils';

function Tabs(props: TabsPrimitive.Root.Props) {
  return <TabsPrimitive.Root data-slot="tabs" {...props} />;
}

function TabsList({ className, ...props }: TabsPrimitive.List.Props) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        'inline-flex min-h-11 items-center gap-1 rounded-full border border-[var(--apple-hairline)] bg-[var(--apple-canvas-parchment)] p-1',
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        'inline-flex min-h-9 cursor-pointer items-center justify-center gap-1.5 rounded-full px-4 py-1.5 text-[14px] leading-[1.29] font-normal tracking-[-0.224px] text-[var(--apple-ink-muted-80)] transition-all select-none hover:text-[var(--apple-ink)] data-[active]:bg-[var(--apple-canvas)] data-[active]:font-semibold data-[active]:text-[var(--apple-primary)] [&_svg]:size-4',
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn('outline-none', className)}
      {...props}
    />
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
