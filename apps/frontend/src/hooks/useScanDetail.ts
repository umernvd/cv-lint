import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { fetchScanDetail } from '@/lib/history-api'
import type { ScanDetailForDisplay } from '@/types/analysis'

export function useScanDetail(id: string): UseQueryResult<ScanDetailForDisplay> {
  return useQuery({
    queryKey: queryKeys.scans.detail(id),
    queryFn: () => fetchScanDetail(id),
    enabled: Boolean(id),
  })
}
