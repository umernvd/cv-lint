export const queryKeys = {
  scans: {
    all: ['scans'] as const,
    list: (page: number, limit: number) => ['scans', 'list', page, limit] as const,
    detail: (id: string) => ['scans', 'detail', id] as const,
  },
}
