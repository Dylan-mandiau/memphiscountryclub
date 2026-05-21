import { cn } from '@/lib/utils'

type Props = {
  children: React.ReactNode
  variant?: 'accent' | 'neutral'
  className?: string
}

export const Badge = ({ children, variant = 'neutral', className }: Props) => {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-pill px-3 py-1 text-xs uppercase tracking-wide',
        variant === 'accent' && 'bg-accent-light text-accent',
        variant === 'neutral' && 'bg-surface text-text-secondary border border-border',
        className,
      )}
    >
      {children}
    </span>
  )
}
