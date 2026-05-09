import { memo } from 'react';
import { MaterialIcon } from '@/components/shared/MaterialIcon';

type KeywordAnalysisProps = {
  matched: string[];
  missing: string[];
  recommendations: string[];
};

export const KeywordAnalysis = memo(function KeywordAnalysis({
  matched,
  missing,
  recommendations,
}: KeywordAnalysisProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <MaterialIcon icon="check_circle" className="text-primary" filled />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Matched Keywords
          </h3>
        </div>
        {matched.length === 0 ? (
          <p className="text-sm text-muted-foreground/60">No matched keywords found.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {matched.map((kw) => (
              <span
                key={kw}
                className="rounded-none border-2 border-primary bg-white px-3 py-1.5 text-xs font-medium text-foreground font-mono"
              >
                {kw}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <MaterialIcon icon="cancel" className="text-[#b91c1c]" filled />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Missing Keywords
          </h3>
        </div>
        {missing.length === 0 ? (
          <p className="text-sm text-muted-foreground/60">No missing keywords — great match!</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {missing.map((kw) => (
              <span
                key={kw}
                className="rounded-none border-2 border-[#b91c1c] bg-white px-3 py-1.5 text-xs font-medium text-foreground font-mono"
              >
                {kw}
              </span>
            ))}
          </div>
        )}
      </div>

      {recommendations.length > 0 ? (
        <div className="space-y-3 lg:col-span-2">
          <div className="flex items-center gap-2">
            <MaterialIcon icon="lightbulb" className="text-tertiary" filled />
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Recommendations
            </h3>
          </div>
          <ol className="list-inside list-decimal space-y-2">
            {recommendations.map((rec, index) => (
              <li key={index} className="text-sm leading-relaxed text-muted-foreground">
                {rec}
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <div className="space-y-2 rounded-xl border-2 border-foreground/10 bg-muted/20 p-4 lg:col-span-2">
          <div className="flex items-center gap-2">
            <MaterialIcon icon="thumb_up" className="text-primary" filled />
            <p className="text-sm font-medium text-foreground">No recommendations — your CV looks great!</p>
          </div>
          <p className="text-xs text-muted-foreground">All critical keywords from the job description are covered.</p>
        </div>
      )}
    </div>
  );
});
