export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    const error = body?.error
    const message = typeof error === "string" ? error : error ? JSON.stringify(error) : res.statusText
    throw new ApiError(res.status, message)
  }

  if (res.status === 204) return undefined as T

  return res.json()
}
