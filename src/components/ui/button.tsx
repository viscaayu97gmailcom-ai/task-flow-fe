'use client';

import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'group/button inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 border border-transparent bg-clip-padding whitespace-nowrap select-none transition-transform duration-150 active:scale-95 disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
  {
    variants: {
      variant: {
        default:
          'rounded-full bg-[var(--apple-primary)] text-[var(--apple-on-primary)] font-normal hover:brightness-95',
        secondary:
          'rounded-full border-[var(--apple-primary)] bg-transparent text-[var(--apple-primary)] font-normal hover:bg-[var(--apple-primary)]/8',
        dark: 'rounded-[8px] bg-[var(--apple-ink)] text-[var(--apple-on-dark)] font-normal hover:bg-[#333333]',
        pearl:
          'rounded-[11px] border-[3px] border-[var(--apple-divider-soft)] bg-[var(--apple-surface-pearl)] text-[var(--apple-ink-muted-80)] font-normal hover:bg-[var(--apple-canvas-parchment)]',
        outline:
          'rounded-full border-[var(--apple-hairline)] bg-[var(--apple-canvas)] text-[var(--apple-ink)] font-normal hover:bg-[var(--apple-canvas-parchment)]',
        ghost:
          'rounded-full bg-transparent text-[var(--apple-ink)] font-normal hover:bg-[var(--apple-divider-soft)]',
        destructive:
          'rounded-full bg-[#c92a2a] text-white font-normal hover:bg-[#a61e1e]',
        'destructive-outline':
          'rounded-full border-[#c92a2a]/35 bg-transparent text-[#c92a2a] font-normal hover:bg-[#c92a2a]/8',
        link: 'rounded-sm bg-transparent p-0 text-[var(--apple-primary)] underline-offset-4 hover:underline',
        circular:
          'rounded-full bg-[rgb(210_210_215_/_0.64)] text-[var(--apple-ink)] hover:bg-[rgb(210_210_215_/_0.88)]',
      },
      size: {
        default: 'min-h-11 px-[22px] py-[11px] text-[17px] leading-[1.24] tracking-[-0.374px]',
        sm: 'min-h-11 px-[15px] py-2 text-[14px] leading-[1.29] tracking-[-0.224px]',
        compact: 'min-h-9 px-3.5 py-1.5 text-[14px] leading-[1.29] tracking-[-0.224px]',
        lg: 'min-h-12 px-7 py-3.5 text-[18px] font-light leading-none tracking-normal',
        icon: 'min-h-11 min-w-11 size-11 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
