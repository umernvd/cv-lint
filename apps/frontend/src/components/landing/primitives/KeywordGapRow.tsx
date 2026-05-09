import type { KeywordStatus } from '@/components/landing/landing-content'

type KeywordGapRowProps = {
  keyword: string
  status: KeywordStatus
  label: string
}

type StatusStyle = {
  rowClasses: string
  iconName: string
  iconClasses: string
  badgeClasses: string
}

const statusStyles: Record<KeywordStatus, StatusStyle> = {
  missing: {
    rowClasses: 'bg-destructive/5 border-2 border-destructive/20',
    iconName: 'close',
    iconClasses: 'text-destructive',
    badgeClasses: 'text-caption text-destructive bg-destructive/10 px-2 py-1 rounded-full',
  },
  weak: {
    rowClasses: 'bg-muted/30 border-2 border-border/30',
    iconName: 'remove',
    iconClasses: 'text-muted-foreground',
    badgeClasses: 'text-caption text-muted-foreground bg-muted/50 px-2 py-1 rounded-full',
  },
  matched: {
    rowClasses: 'bg-primary/5 border-2 border-primary/20',
    iconName: 'check',
    iconClasses: 'text-primary',
    badgeClasses: 'text-caption text-primary bg-primary/10 px-2 py-1 rounded-full',
  },
}

export default function KeywordGapRow({
  keyword,
  status,
  label,
}: KeywordGapRowProps): React.JSX.Element {
  const style = statusStyles[status]

  return (
    <div className={`flex items-center justify-between rounded-lg p-3 ${style.rowClasses}`}>
      <div className="flex items-center gap-3">
        <span className={`material-symbols-outlined text-xl ${style.iconClasses}`}>
          {style.iconName}
        </span>
        <span className="text-sm text-foreground font-medium font-mono">{keyword}</span>
      </div>
      <span className={style.badgeClasses}>{label}</span>
    </div>
  )
}
