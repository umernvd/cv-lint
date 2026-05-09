import { useMutation, type UseMutationResult } from '@tanstack/react-query'
import { queryClient } from '@/lib/query-client'
import { queryKeys } from '@/lib/query-keys'
import { deleteScan } from '@/lib/history-api'
import type { PaginatedScansResponse, DeleteScanResponse } from '@/types/analysis'
import { toast } from 'sonner'

type PreviousQuerySnapshot = Array<[readonly unknown[], PaginatedScansResponse | undefined]>

export function useDeleteScan(): UseMutationResult<DeleteScanResponse, Error, string> {
  return useMutation({
    mutationFn: deleteScan,
    onMutate: async (deletedId: string) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.scans.all })

      const previousQueries = queryClient.getQueriesData<PaginatedScansResponse>({
        queryKey: queryKeys.scans.all,
      }) as PreviousQuerySnapshot

      queryClient.setQueriesData<PaginatedScansResponse>(
        { queryKey: queryKeys.scans.all },
        (cached) => {
          if (!cached) return cached
          const newTotal = Math.max(0, cached.total - 1)
          const pageSize = cached.limit || cached.data.length || 1
          return {
            ...cached,
            data: cached.data.filter((scan) => scan.id !== deletedId),
            total: newTotal,
            totalPages: Math.max(1, Math.ceil(newTotal / pageSize)),
          }
        },
      )

      return { previousQueries }
    },
    onError: (_error: Error, _deletedId: string, context) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      toast.error('Failed to delete scan. Please try again.')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scans.all })
    },
    onSuccess: () => {
      toast.success('Scan deleted.')
    },
  })
}
