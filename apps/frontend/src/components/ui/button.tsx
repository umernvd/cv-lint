import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'candy'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  asChild?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'

    const variants = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90 rounded-md',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md',
      outline: 'border-2 border-foreground bg-transparent hover:bg-tertiary/20 rounded-full',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md',
      ghost: 'hover:bg-muted hover:text-foreground rounded-md',
      link: 'text-primary underline-offset-4 hover:underline rounded-md',
      candy:
        'bg-primary text-primary-foreground rounded-full border-2 border-foreground shadow-pop hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-pop-hover active:translate-x-0.5 active:translate-y-0.5 active:shadow-pop-active ease-bounce font-bold',
    }

    const sizes = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 px-3',
      lg: 'h-11 px-8',
      icon: 'h-10 w-10',
    }

    if (asChild) {
      return (
        <span
          ref={ref}
          className={cn(base, variants[variant], sizes[size], className)}
          {...props}
        />
      )
    }

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    )
  },
)

Button.displayName = 'Button'

export { Button }
