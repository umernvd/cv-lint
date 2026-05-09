import { useAnalysisStore } from '@/store/analysisStore';
import { ScoreCircle } from './ScoreCircle';
import { ScoreBreakdown } from './ScoreBreakdown';
import { KeywordAnalysis } from './KeywordAnalysis';
import { MaterialIcon } from '@/components/shared/MaterialIcon';
import AnalysisLoadingAnimation from '@/components/shared/AnalysisLoadingAnimation';

type ResultsPanelProps = {
  isLoading: boolean;
};

export function ResultsPanel({ isLoading }: ResultsPanelProps): React.JSX.Element {
  const { atsScore, scoreBreakdown, matchedKeywords, missingKeywords, topRecommendations, bullets } = useAnalysisStore()

  if (isLoading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center p-6 md:p-8">
        <AnalysisLoadingAnimation />
      </div>
    );
  }

  if (atsScore === null) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center md:p-8">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-foreground/20 bg-white shadow-sticker">
          <MaterialIcon icon="description" className="text-muted-foreground" style={{ fontSize: '36px' }} />
        </div>
        <div className="space-y-1">
          <h2 className="text-h3 text-foreground">No Analysis Yet</h2>
          <p className="text-body text-muted-foreground">
            Upload your CV and a job description, then click Analyze Match to see your results.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-8 overflow-y-auto results-scroll p-6 md:p-8">
      <div className="rounded-2xl border-2 border-foreground/10 bg-white p-8 shadow-sticker">
        <div className="flex flex-col items-center gap-6">
          <ScoreCircle score={atsScore} />
          {scoreBreakdown && <ScoreBreakdown breakdown={scoreBreakdown} className="w-full" />}
        </div>
      </div>

      <div className="rounded-2xl border-2 border-foreground/10 bg-white p-6 shadow-sticker">
        <KeywordAnalysis
          matched={matchedKeywords}
          missing={missingKeywords}
          recommendations={topRecommendations}
        />
      </div>

      {bullets && bullets.length > 0 && (
        <div className="rounded-2xl border-2 border-foreground/10 bg-white p-6 shadow-sticker">
          <div className="mb-4 flex items-center gap-2">
            <MaterialIcon icon="format_list_bulleted" className="text-primary" filled />
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Bullet Improvements
            </h3>
          </div>
          <div className="space-y-3">
            {bullets.map((bullet) => (
              <div key={bullet.id} className="rounded-xl border-2 border-border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground line-through">{bullet.original}</p>
                <p className="mt-2 text-sm font-medium text-foreground">{bullet.improved || bullet.original}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
