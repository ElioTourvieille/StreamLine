const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'

function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('sl_token')
}

export async function apiFetch<T = unknown>(path: string, opts?: RequestInit): Promise<T> {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts?.headers,
    },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || res.statusText)
  }
  return res.json() as Promise<T>
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      apiFetch<{ accessToken: string; user: { id: string; name: string; email: string; role: string } }>(
        '/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }
      ),
    me: () => apiFetch('/auth/me'),
  },
  projects: {
    list: (clientId?: string) => apiFetch(`/projects${clientId ? `?clientId=${clientId}` : ''}`),
    get: (id: string) => apiFetch(`/projects/${id}`),
    create: (data: unknown) => apiFetch('/projects', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: unknown) => apiFetch(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  },
  clients: {
    list: () => apiFetch('/clients'),
    get: (id: string) => apiFetch(`/clients/${id}`),
    create: (data: unknown) => apiFetch('/clients', { method: 'POST', body: JSON.stringify(data) }),
  },
}
