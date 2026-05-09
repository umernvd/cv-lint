'use client';

import { useEffect, useState, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useScanHistory } from '@/hooks/useScanHistory';
import { useDeleteScan } from '@/hooks/useDeleteScan';
import { HistoryHeader } from './_components/HistoryHeader';
import { ScanCard } from './_components/ScanCard';
import { EmptyState } from './_components/EmptyState';
import { PaginationControls } from './_components/PaginationControls';
import DeleteScanDialog from '@/components/dashboard/DeleteScanDialog';
import HistoryPageSkeleton from '@/components/shared/skeletons/HistoryPageSkeleton';

const PAGE_SIZE = 20;

export default function HistoryPage(): React.JSX.Element | null {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data, isLoading, isError, isFetching, refetch } = useScanHistory(
    currentPage,
    PAGE_SIZE,
  );
  const { mutate: deleteScan, isPending: isDeletePending } = useDeleteScan();

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.replace('/sign-in');
    }
  }, [hasHydrated, isAuthenticated, router]);

  // Initialize from URL if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const p = parseInt(url.searchParams.get('page') ?? '1', 10);
      if (!Number.isNaN(p) && p > 0) setCurrentPage(p);
    }
  }, []);

  // Adjust page when data is empty (after deletion)
  useEffect(() => {
    if (data && data.data.length === 0 && currentPage > 1) {
      const nextPage = currentPage - 1;
      setCurrentPage(nextPage);
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('page', String(nextPage));
        window.history.pushState({}, '', url.toString());
      }
    }
  }, [data, currentPage]);

  if (!hasHydrated) return null;
  if (!isAuthenticated) return null;

  function handleDeleteRequest(id: string): void {
    setDeleteTargetId(id);
    setIsDialogOpen(true);
  }

  function handleDeleteConfirm(): void {
    if (deleteTargetId) {
      deleteScan(deleteTargetId);
      setIsDialogOpen(false);
      setDeleteTargetId(null);
    }
  }

  function handlePageChange(page: number): void {
    startTransition(() => {
      setCurrentPage(page);
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('page', String(page));
        window.history.pushState({}, '', url.toString());
      }
    });
  }

  const scanTitle = deleteTargetId
    ? data?.data.find((s) => s.id === deleteTargetId)?.jobTitle ?? 'this scan'
    : '';

  const showSkeleton = isLoading && !data;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-10">
      <HistoryHeader />

      {showSkeleton && <HistoryPageSkeleton />}

      {isError && !showSkeleton && (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <div className="mb-2 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <span className="material-symbols-outlined text-5xl text-destructive">error</span>
          </div>
          <h2 className="font-heading text-h2 text-foreground">Failed to load history</h2>
          <p className="max-w-sm text-body text-muted-foreground">Check your connection and try again.</p>
          <button type="button" onClick={() => refetch()} className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-pop transition-all duration-300 ease-bounce hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-pop-hover">
            <span className="material-symbols-outlined text-lg">refresh</span>
            Retry
          </button>
        </div>
      )}

      {!showSkeleton && !isError && data?.data.length === 0 && <EmptyState />}

      {!showSkeleton && !isError && data && data.data.length > 0 && (
        <>
          <div className="flex flex-col gap-3">
            {data.data.map((scan) => (
              <ScanCard
                key={scan.id}
                scan={scan}
                onDelete={handleDeleteRequest}
                isDeletePending={isDeletePending && deleteTargetId === scan.id}
              />
            ))}
          </div>
          <PaginationControls
            currentPage={currentPage}
            totalPages={data.totalPages}
            onPageChange={handlePageChange}
            isLoading={isFetching}
            totalResults={data.total}
            pageSize={PAGE_SIZE}
          />
        </>
      )}

      <DeleteScanDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onConfirm={handleDeleteConfirm}
        isPending={isDeletePending}
        scanTitle={scanTitle}
      />
    </div>
  );
}
