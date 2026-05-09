export default function AnalysisLoadingAnimation(): React.JSX.Element {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-6 md:p-8">
      <div className="flex flex-col items-center gap-8">
        <div className="relative flex h-32 w-32 items-center justify-center">
          <div className="absolute h-32 w-32 animate-pulse rounded-full border-2 border-dashed border-primary/30" />
          <div className="absolute h-28 w-28 animate-spin rounded-full border-2 border-transparent border-t-primary" style={{ animationDuration: '1.5s' }} />
          <div className="absolute h-20 w-20 animate-pulse rounded-full bg-primary/10" />
          <div className="animate-float">
            <div className="h-16 w-16 rounded-full border-2 border-primary/50 bg-white shadow-sticker" />
          </div>
          <span className="absolute bottom-1 text-xs font-medium text-muted-foreground">
            Analyzing…
          </span>
        </div>

        <div className="w-full max-w-xs space-y-3">
          <div className="h-3 w-full overflow-hidden rounded-full bg-primary/10">
            <div
              className="h-full rounded-full animate-shimmer"
              style={{
                width: '60%',
                background: 'linear-gradient(90deg, hsl(var(--primary) / 0.1) 0%, hsl(var(--primary) / 0.5) 50%, hsl(var(--primary) / 0.1) 100%)',
                backgroundSize: '200% 100%',
              }}
            />
          </div>

          <div className="space-y-2 pt-2">
            <div className="h-2.5 w-3/4 animate-pulse rounded-full bg-muted" />
            <div className="h-2.5 w-1/2 animate-pulse rounded-full bg-muted" style={{ animationDelay: '0.2s' }} />
            <div className="h-2.5 w-2/3 animate-pulse rounded-full bg-muted" style={{ animationDelay: '0.4s' }} />
            <div className="h-2.5 w-3/5 animate-pulse rounded-full bg-muted" style={{ animationDelay: '0.6s' }} />
            <div className="h-2.5 w-1/3 animate-pulse rounded-full bg-muted" style={{ animationDelay: '0.8s' }} />
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 pt-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-6 animate-pulse rounded-full bg-primary/10 px-3"
              style={{
                width: `${30 + Math.random() * 40}px`,
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
