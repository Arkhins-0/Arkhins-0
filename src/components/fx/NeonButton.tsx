'use client';

import Link from 'next/link';
import { Magnetic } from './Magnetic';
import { cn } from '@/lib/utils';

type Variant = 'solid' | 'ghost';

type Common = {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  icon?: React.ReactNode;
  magnetic?: boolean;
};

type AsLink = Common & {
  href: string;
  external?: boolean;
  onClick?: never;
  type?: never;
  disabled?: never;
};
type AsButton = Common & {
  href?: never;
  external?: never;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
};

const base =
  'group/btn relative inline-flex items-center justify-center gap-2.5 overflow-hidden px-6 py-3.5 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.18em] transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-50 notch-diag';

const skin: Record<Variant, string> = {
  solid: 'neon-fill',
  ghost: 'border border-white/15 text-ink hover:border-accent/60 hover:text-accent glass',
};

/** Shared button interior: hover shine sweep, solid-variant glow, label, and icon. */
function Inner({
  children,
  icon,
  variant,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant: Variant;
}) {
  return (
    <>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -translate-x-full skew-x-12 bg-white/25 transition-transform duration-700 ease-swift group-hover/btn:translate-x-full"
      />
      {variant === 'solid' && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100"
          style={{ boxShadow: '0 0 34px rgb(var(--accent-rgb) / 0.85)' }}
        />
      )}
      <span className="relative">{children}</span>
      {icon && (
        <span className="relative transition-transform duration-300 group-hover/btn:translate-x-1">
          {icon}
        </span>
      )}
    </>
  );
}

/** Notched neon CTA rendered as a link, external anchor, or button, optionally magnetic. */
export function NeonButton(props: AsLink | AsButton) {
  const {
    children,
    variant = 'solid',
    className,
    icon,
    magnetic = true,
  } = props;
  const cls = cn(base, skin[variant], className);
  const style = { ['--notch' as string]: '12px' };

  const node =
    'href' in props && props.href !== undefined ? (
      props.external ? (
        <a
          href={props.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cls}
          style={style}
        >
          <Inner icon={icon} variant={variant}>
            {children}
          </Inner>
        </a>
      ) : (
        <Link href={props.href} className={cls} style={style}>
          <Inner icon={icon} variant={variant}>
            {children}
          </Inner>
        </Link>
      )
    ) : (
      <button
        type={(props as AsButton).type ?? 'button'}
        onClick={(props as AsButton).onClick}
        disabled={(props as AsButton).disabled}
        className={cls}
        style={style}
      >
        <Inner icon={icon} variant={variant}>
          {children}
        </Inner>
      </button>
    );

  return magnetic ? (
    <Magnetic strength={0.22} className="inline-flex">
      {node}
    </Magnetic>
  ) : (
    node
  );
}
