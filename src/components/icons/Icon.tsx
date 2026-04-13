import { forwardRef } from 'react';
import type { LucideIcon, LucideProps } from 'lucide-react';

export type IconSize = 'sm' | 'md' | 'lg' | 'xl' | number;

const SIZE_MAP: Record<Exclude<IconSize, number>, number> = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

type IconProps = Omit<LucideProps, 'size' | 'ref'> & {
  icon: LucideIcon;
  size?: IconSize;
};

export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  { icon: LucideIconComp, size = 'md', strokeWidth = 1.75, ...rest },
  ref,
) {
  const px = typeof size === 'number' ? size : SIZE_MAP[size];
  return <LucideIconComp ref={ref} size={px} strokeWidth={strokeWidth} {...rest} />;
});
