import { Loader2 } from 'lucide-react';
import PdfUploader from '@/components/upload/PdfUploader';
import JdTextInput from '@/components/upload/JdTextInput';
import { MaterialIcon } from '@/components/shared/MaterialIcon';

type InputPanelProps = {
  pdfFile: File | null;
  jdText: string;
  onFileSelect: (file: File | null) => void;
  onJdChange: (value: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  uploadProgress: number;
};

export function InputPanel({
  pdfFile,
  jdText,
  onFileSelect,
  onJdChange,
  onAnalyze,
  isLoading,
  uploadProgress,
}: InputPanelProps): React.JSX.Element {
  const canAnalyze = pdfFile !== null && jdText.length >= 50;

  return (
    <div className="flex h-full flex-col gap-6 p-6 md:p-8">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-h2 text-foreground">Your CV</h1>
        </div>
        <p className="text-body text-muted-foreground">
          Upload your CV and paste a job description to get your ATS score and personalized recommendations.
        </p>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto results-scroll pr-1">
        <PdfUploader onFileSelect={onFileSelect} selectedFile={pdfFile} />
        <JdTextInput value={jdText} onChange={onJdChange} />
      </div>

       <button
         type="button"
         onClick={onAnalyze}
         disabled={!canAnalyze || isLoading}
         aria-busy={isLoading}
         className={`
           flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold shadow-pop
           transition-all duration-300 ease-bounce
           ${canAnalyze && !isLoading
             ? 'bg-primary text-primary-foreground border-2 border-foreground hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-pop-hover active:translate-x-0 active:translate-y-0 active:shadow-pop-active'
             : 'bg-muted text-muted-foreground border-2 border-border shadow-none cursor-not-allowed'}
         `}
         aria-label="Analyze CV against job description"
       >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Analyzing…
          </>
        ) : (
          <>
            <MaterialIcon icon="match_case" filled />
            Analyze
          </>
        )}
      </button>

      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Uploading CV…</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
