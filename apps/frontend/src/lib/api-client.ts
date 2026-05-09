import axios, { AxiosError } from 'axios'
import { useAuthStore, type User } from '@/store/authStore'
import { toast } from 'sonner'

const baseURL = process.env.NEXT_PUBLIC_API_URL
if (!baseURL) {
  throw new Error('NEXT_PUBLIC_API_URL is not defined in environment variables')
}

const apiBaseURL = baseURL.endsWith('/api/v1') ? baseURL : `${baseURL}/api/v1`

export type ApiEnvelope<T> = {
  success: boolean
  statusCode: number
  data: T
}

export type ControllerEnvelope<T> = {
  success: boolean
  data: T
  message: string
}

let isRefreshing = false
let refreshSubscribers: Array<{ resolve: (token: string) => void; reject: () => void }> = []

function subscribeTokenRefresh(cb: { resolve: (token: string) => void; reject: () => void }): void {
  refreshSubscribers.push(cb)
}

function onRefreshed(token: string): void {
  refreshSubscribers.forEach(({ resolve }) => resolve(token))
  refreshSubscribers = []
}

function onRefreshFailed(): void {
  refreshSubscribers.forEach(({ reject }) => reject())
  refreshSubscribers = []
  isRefreshing = false
}

const refreshClient = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
})

async function refreshAccessToken(): Promise<string> {
  const response = await refreshClient.post<ApiEnvelope<ControllerEnvelope<{ accessToken: string }>>>('/auth/refresh')
  return response.data.data.data.accessToken
}

export const apiClient = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
  timeout: 30000,
})

apiClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState()
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

const skipRefreshPaths = ['/auth/sign-in', '/auth/sign-up', '/auth/refresh']

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ERR_NETWORK') {
        toast.error('No internet connection.')
        return Promise.reject(error)
      }

      if (error.code === 'ECONNABORTED') {
        toast.error('Request timed out. Please try again.')
        return Promise.reject(error)
      }

      const status = error.response?.status
      if (status === 403) {
        toast.error('You do not have permission to perform this action.')
        return Promise.reject(error)
      }

      if (status === 404) {
        return Promise.reject(error)
      }

      if (status === 422) {
        return Promise.reject(error)
      }

      if (status === 429) {
        toast.error('Too many requests. Please wait a moment.')
        return Promise.reject(error)
      }

      if (status && status >= 500) {
        toast.error('Server error. Please try again later.')
        return Promise.reject(error)
      }

      if (error.response?.status === 401 && typeof window !== 'undefined') {
        const originalRequest = error.config
        if (
          originalRequest &&
          originalRequest.headers &&
          !originalRequest.headers['X-Retry-After-Refresh']
        ) {
          const requestPath = new URL(
            originalRequest.url ?? '',
            originalRequest.baseURL,
          ).pathname

          if (skipRefreshPaths.some((path) => requestPath.includes(path))) {
            useAuthStore.getState().clearAuth()
            window.location.href = '/sign-in'
            return Promise.reject(error)
          }

          if (!isRefreshing) {
            isRefreshing = true
            try {
              const newToken = await refreshAccessToken()
              useAuthStore.getState().setAccessToken(newToken)
              onRefreshed(newToken)
              isRefreshing = false
              originalRequest.headers['X-Retry-After-Refresh'] = 'true'
              return apiClient(originalRequest)
            } catch {
              onRefreshFailed()
              useAuthStore.getState().clearAuth()
              window.location.href = '/sign-in'
              return Promise.reject(error)
            }
          }

          return new Promise((resolve, reject) => {
            subscribeTokenRefresh({
              resolve: (token: string) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`
                  originalRequest.headers['X-Retry-After-Refresh'] = 'true'
                }
                resolve(apiClient(originalRequest))
              },
              reject: () => {
                useAuthStore.getState().clearAuth()
                window.location.href = '/sign-in'
                reject(new Error('Session expired. Please sign in again.'))
              },
            })
          })
        }
      }
    }

    return Promise.reject(error)
  },
)

export function extractApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ERR_NETWORK') return 'No internet connection.'
    if (error.code === 'ECONNABORTED') return 'Request timed out. Please try again.'

    const responseBody = error.response?.data as Record<string, unknown> | undefined
    const message = responseBody?.message
    if (Array.isArray(message)) return message[0] as string
    if (typeof message === 'string') return message
  }
  return 'Something went wrong. Please try again.'
}

export type SignInResponse = ControllerEnvelope<{
  user: User
  accessToken: string
}>
