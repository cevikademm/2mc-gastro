import type { ReactNode, SVGProps } from 'react';

type IllustrationProps = SVGProps<SVGSVGElement> & { size?: number };

const base = (size: number): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: '0 0 200 160',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
});

export function EmptyCartIllustration({ size = 180, ...rest }: IllustrationProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M30 40h18l10 62h92l12-48H60" />
      <circle cx="72" cy="118" r="8" />
      <circle cx="132" cy="118" r="8" />
      <path d="M85 65l15 15 25-30" opacity="0.35" />
      <path d="M170 30l4 4 8-8" opacity="0.35" />
      <circle cx="176" cy="32" r="12" opacity="0.35" />
    </svg>
  );
}

export function EmptyProjectsIllustration({ size = 180, ...rest }: IllustrationProps) {
  return (
    <svg {...base(size)} {...rest}>
      <rect x="30" y="40" width="140" height="90" rx="6" />
      <path d="M30 58h140" />
      <circle cx="40" cy="49" r="1.5" fill="currentColor" />
      <circle cx="46" cy="49" r="1.5" fill="currentColor" />
      <circle cx="52" cy="49" r="1.5" fill="currentColor" />
      <path d="M50 80h40" opacity="0.5" />
      <path d="M50 92h70" opacity="0.5" />
      <path d="M50 104h55" opacity="0.5" />
      <path d="M130 95l12 12 20-22" />
    </svg>
  );
}

export function EmptySearchIllustration({ size = 180, ...rest }: IllustrationProps) {
  return (
    <svg {...base(size)} {...rest}>
      <circle cx="85" cy="75" r="38" />
      <path d="M113 103l28 28" />
      <path d="M70 75h30" opacity="0.4" />
      <path d="M85 60v30" opacity="0.4" />
      <path d="M20 140h160" opacity="0.25" strokeDasharray="3 5" />
    </svg>
  );
}

export function EmptyInboxIllustration({ size = 180, ...rest }: IllustrationProps) {
  return (
    <svg {...base(size)} {...rest}>
      <path d="M30 60l20-30h100l20 30v60a10 10 0 0 1-10 10H40a10 10 0 0 1-10-10V60Z" />
      <path d="M30 60h40l10 20h40l10-20h40" />
    </svg>
  );
}

type EmptyStateProps = {
  illustration: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ illustration, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-16 px-6 ${className}`}>
      <div className="text-primary/60 mb-6">{illustration}</div>
      <h2 className="text-2xl font-headline font-black text-on-surface">{title}</h2>
      {description && (
        <p className="mt-2 max-w-sm text-on-surface-variant">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
