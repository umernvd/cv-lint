import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDropzone, type FileRejection } from 'react-dropzone'
import { UploadCloud, X, FileText, Plus, Minus, RotateCcw, Loader2 } from 'lucide-react'
import { Document, Page, pdfjs } from 'react-pdf'
import { cn } from '@/lib/utils'

import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

const ZOOM_STEP = 0.25
const ZOOM_MIN = 0.5
const ZOOM_MAX = 3

type PdfUploaderProps = {
  onFileSelect: (file: File | null) => void
  selectedFile: File | null
}

export default function PdfUploader({
  onFileSelect,
  selectedFile,
}: PdfUploaderProps): React.JSX.Element {
  const [errors, setErrors] = useState<string[]>([])
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pdfLoadError, setPdfLoadError] = useState<string | null>(null)
  const [containerWidth, setContainerWidth] = useState<number | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setErrors([])
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0])
      }
    },
    [onFileSelect],
  )

  const onDropRejected = useCallback((fileRejections: FileRejection[]) => {
    const messages = fileRejections.flatMap((rejection) =>
      rejection.errors.map((error) => {
        if (error.code === 'file-invalid-type') return 'Only PDF files are accepted.'
        if (error.code === 'file-too-large') return 'File size must not exceed 5MB.'
        return error.message
      }),
    )
    setErrors(messages)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
    onDrop,
    onDropRejected,
  })

  function handleDeselect(): void {
    onFileSelect(null)
    setErrors([])
    setZoomLevel(1)
    setNumPages(null)
    setPdfLoadError(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }

  function zoomIn(): void {
    setZoomLevel((prev) => Math.min(prev + ZOOM_STEP, ZOOM_MAX))
  }

  function zoomOut(): void {
    setZoomLevel((prev) => Math.max(prev - ZOOM_STEP, ZOOM_MIN))
  }

  function zoomReset(): void {
    setZoomLevel(1)
  }

  function onDocumentLoadSuccess({ numPages: pages }: { numPages: number }): void {
    setNumPages(pages)
    setPdfLoadError(null)
  }

  function onDocumentLoadError(): void {
    setPdfLoadError('Failed to load PDF preview.')
  }

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile)
      setPreviewUrl(url)
      setZoomLevel(1)
      setNumPages(null)
      setPdfLoadError(null)
      setContainerWidth(null)
      return () => {
        URL.revokeObjectURL(url)
      }
    } else {
      setPreviewUrl(null)
    }
  }, [selectedFile])

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(Math.round(entry.contentRect.width))
      }
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [selectedFile, previewUrl])

  const pdfFile = useMemo(() => {
    if (!previewUrl) return null
    return { url: previewUrl }
  }, [previewUrl])

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        role="button"
        aria-label="Upload PDF file"
        tabIndex={0}
        className={cn(
          'relative flex cursor-pointer flex-col justify-center overflow-hidden rounded-xl border-2 border-foreground/15 bg-white text-center shadow-sticker transition-all duration-300 ease-bounce focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:-translate-y-0.5',
          selectedFile
            ? 'w-fit items-start min-h-[40px] px-3 py-2'
            : 'min-h-[120px] px-4 py-6 items-center',
          isDragActive && 'border-primary bg-primary/5 scale-[1.02] shadow-pop-hover',
        )}
      >
        <input {...getInputProps()} />

        {selectedFile ? (
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <FileText className="h-3.5 w-3.5" />
            </div>
            <p className="truncate text-xs font-medium text-foreground">{selectedFile.name}</p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleDeselect()
              }}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              aria-label="Remove file"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="relative flex flex-col items-center gap-2">
            <UploadCloud
              className={cn(
                'h-10 w-10 transition-colors',
                isDragActive ? 'text-primary' : 'text-muted-foreground',
              )}
            />
            <p className="text-sm font-medium text-foreground">
              {isDragActive
                ? 'Drop your PDF here'
                : 'Drag and drop your CV here, or click to browse'}
            </p>
            <p className="text-xs text-muted-foreground">PDF only &middot; Max 5MB</p>
          </div>
        )}
      </div>

      {selectedFile && previewUrl && (
        <div className="overflow-hidden rounded-xl border-2 border-foreground/15 bg-white shadow-sticker">
          <div className="flex items-center justify-between border-b border-foreground/10 bg-muted/50 px-3 py-1.5">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={zoomOut}
                disabled={zoomLevel <= ZOOM_MIN}
                className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors disabled:opacity-30 hover:bg-primary/10 hover:text-primary"
                aria-label="Zoom out"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={zoomReset}
                className="min-w-[3rem] rounded px-2 py-0.5 text-xs font-mono font-medium text-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                aria-label="Reset zoom"
              >
                {Math.round(zoomLevel * 100)}%
              </button>
              <button
                type="button"
                onClick={zoomIn}
                disabled={zoomLevel >= ZOOM_MAX}
                className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors disabled:opacity-30 hover:bg-primary/10 hover:text-primary"
                aria-label="Zoom in"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              {numPages && numPages > 1 && (
                <span className="text-xs text-muted-foreground">
                  Page 1 of {numPages}
                </span>
              )}
              {zoomLevel !== 1 && (
                <button
                  type="button"
                  onClick={zoomReset}
                  className="flex h-7 items-center gap-1 rounded px-2 text-xs text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                  aria-label="Reset to 100%"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset
                </button>
              )}
            </div>
          </div>
          <div ref={containerRef} className="relative flex h-[400px] items-start justify-center overflow-auto bg-muted/30">
            {pdfLoadError ? (
              <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                {pdfLoadError}
              </div>
            ) : containerWidth ? (
              <Document
                file={pdfFile}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div className="flex h-full w-full items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                }
              >
                <Page
                  pageNumber={1}
                  width={Math.round(containerWidth * zoomLevel)}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </Document>
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        </div>
      )}

      {errors.length > 0 && (
        <div className="space-y-1" role="alert">
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-destructive">
              {error}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
