import { useQuery, type UseQueryResult, keepPreviousData } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { fetchScanHistory } from '@/lib/history-api'
import type { PaginatedScansResponse } from '@/types/analysis'

export function useScanHistory(
  page: number,
  limit: number,
): UseQueryResult<PaginatedScansResponse> {
  return useQuery({
    queryKey: queryKeys.scans.list(page, limit),
    queryFn: () => fetchScanHistory(page, limit),
    placeholderData: keepPreviousData,
  })
}
