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

// ── Types ─────────────────────────────────────────────────────────────────────

export type AuthUser = { id: string; name: string; email: string; role: string }
export type AuthResponse = { accessToken: string; user: AuthUser }

export type UserProfile = {
  id: string; name: string; email: string; role: string
  organizationId?: string; avatarUrl?: string; jobTitle?: string
}

export type Organization = {
  id: string; name: string; slug: string; primaryColor?: string; logoUrl?: string
}

export type Client = {
  id: string; name: string; contactEmail: string
  company?: string; phone?: string; status: 'ACTIVE' | 'ARCHIVED'
  inviteToken?: string; organizationId?: string
}

export type Milestone = {
  id: string; title: string; dueDate?: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
}

export type Project = {
  id: string; name: string; clientId: string; organizationId?: string
  description?: string; status: string; startDate?: string; endDate?: string
  milestones?: Milestone[]; members?: unknown[]
}

export type Deliverable = {
  id: string; projectId: string; title: string
  type: string; description?: string; previewUrl?: string
  deadline?: string; status: string
  comments: Array<{ id: string; name: string; text: string; createdAt: string }>
}

export type PortalContext = {
  client: { id: string; name: string; company: string; email: string }
  projects: Project[]
  deliverablesByProject: Array<{ projectId: string; items: Deliverable[] }>
}

export type InviteResponse = { inviteToken: string; portalUrl: string; email: string }

// ── API ───────────────────────────────────────────────────────────────────────

export const api = {
  auth: {
    register: (data: { email: string; password: string; name: string; organizationName?: string }) =>
      apiFetch<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (email: string, password: string) =>
      apiFetch<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    me: () => apiFetch('/auth/me'),
  },

  clients: {
    list: () => apiFetch<Client[]>('/clients'),
    get: (id: string) => apiFetch<Client>(`/clients/${id}`),
    create: (data: Omit<Client, 'id' | 'status'>) =>
      apiFetch<Client>('/clients', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Client>) =>
      apiFetch<Client>(`/clients/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    invite: (id: string, data: { email: string; name: string }) =>
      apiFetch<InviteResponse>(`/clients/${id}/invite`, { method: 'POST', body: JSON.stringify(data) }),
  },

  projects: {
    list: (clientId?: string) =>
      apiFetch<Project[]>(`/projects${clientId ? `?clientId=${clientId}` : ''}`),
    get: (id: string) => apiFetch<Project>(`/projects/${id}`),
    create: (data: unknown) =>
      apiFetch<Project>('/projects', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: unknown) =>
      apiFetch<Project>(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  },

  deliverables: {
    list: (projectId: string) =>
      apiFetch<Deliverable[]>(`/deliverables?projectId=${projectId}`),
    get: (id: string) => apiFetch<Deliverable>(`/deliverables/${id}`),
    create: (data: { title: string; projectId: string; type?: string; description?: string; previewUrl?: string; deadline?: string }) =>
      apiFetch<Deliverable>('/deliverables', { method: 'POST', body: JSON.stringify(data) }),
  },

  portal: {
    get: (token: string) => apiFetch<PortalContext>(`/portal/${token}`),
    validate: (token: string, id: string, data: { action: string; comment?: string }) =>
      apiFetch(`/portal/${token}/deliverables/${id}/validate`, { method: 'POST', body: JSON.stringify(data) }),
  },

  users: {
    me: () => apiFetch<UserProfile>('/users/me'),
    update: (data: Partial<Pick<UserProfile, 'name' | 'avatarUrl' | 'jobTitle'>>) =>
      apiFetch<UserProfile>('/users/me', { method: 'PATCH', body: JSON.stringify(data) }),
  },

  organizations: {
    get: (id: string) => apiFetch<Organization>(`/organizations/${id}`),
  },
}
