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

/**
 * PUTs a file straight to S3 via a presigned URL — bypasses our own API
 * (no auth header, no JSON envelope, no apiFetch) so the file bytes never
 * pass through our server.
 */
export async function uploadFileToS3(uploadUrl: string, file: File): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  })
  if (!res.ok) {
    throw new Error(`Échec de l'envoi du fichier (${res.status})`)
  }
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type AuthUser = { id: string; name: string; email: string; role: string }
export type AuthResponse = { accessToken: string; user: AuthUser }

export type UserProfile = {
  id: string; name: string; email: string; role: string
  organizationId?: string; avatarUrl?: string; jobTitle?: string
}

export type Organization = {
  id: string; name: string; slug: string; primaryColor?: string; logoUrl?: string; website?: string
}

export type ClientStatus = 'ACTIVE' | 'FOLLOW_UP' | 'MAINTENANCE' | 'COMPLETED' | 'ARCHIVED'

export type Client = {
  id: string; name: string; contactEmail: string
  company?: string; phone?: string; status: ClientStatus
  inviteToken?: string; organizationId?: string
}

export type Milestone = {
  id: string; title: string; dueDate?: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
}

export type Project = {
  id: string; name: string; clientId: string; organizationId?: string
  description?: string; status: string; startDate?: string; endDate?: string
  createdAt?: string; updatedAt?: string
  milestones?: Milestone[]; members?: unknown[]
}

export type OrgStats = {
  activeProjects: number
  totalClients: number
  pendingValidations: number
  completedMilestones: number
}

export type ActivityEvent = {
  type: 'project_created' | 'client_added' | 'deliverable_approved' | 'deliverable_changes'
  title: string
  actor?: string
  timestamp: string
}

export type Deliverable = {
  id: string; projectId: string; title: string
  type: string; description?: string; previewUrl?: string
  fileKey?: string; fileName?: string; fileSize?: number; mimeType?: string
  deadline?: string; status: string
  comments: Array<{ id: string; name: string; text: string; createdAt: string }>
}

export type PortalContext = {
  client: { id: string; name: string; company: string; email: string }
  projects: Project[]
  deliverablesByProject: Array<{ projectId: string; items: Deliverable[] }>
}

export type InviteResponse = { inviteToken: string; portalUrl: string; email: string }

export type Notification = {
  id: string
  type: 'deliverable_approved' | 'deliverable_changes' | 'invite_accepted' | 'system'
  title: string
  description?: string
  projectId?: string
  isRead: boolean
  createdAt: string
}

export type Message = {
  id: string; projectId: string; authorId: string; authorName: string; text: string; createdAt: string
}

export type ProjectThread = {
  projectId: string; projectName: string; clientId?: string; lastMessage: Message | null
}

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
    updateMilestone: (
      projectId: string,
      milestoneId: string,
      data: { status?: Milestone['status']; title?: string; dueDate?: string },
    ) =>
      apiFetch<Milestone>(`/projects/${projectId}/milestones/${milestoneId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },

  deliverables: {
    list: (projectId: string) =>
      apiFetch<Deliverable[]>(`/deliverables?projectId=${projectId}`),
    get: (id: string) => apiFetch<Deliverable>(`/deliverables/${id}`),
    create: (data: {
      title: string; projectId: string; type?: string; description?: string
      previewUrl?: string; deadline?: string
      fileKey?: string; fileName?: string; fileSize?: number; mimeType?: string
    }) =>
      apiFetch<Deliverable>('/deliverables', { method: 'POST', body: JSON.stringify(data) }),
    requestUploadUrl: (data: { projectId: string; fileName: string; contentType: string; fileSize?: number }) =>
      apiFetch<{ uploadUrl: string; fileKey: string }>('/deliverables/upload-url', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getFileUrl: (id: string) => apiFetch<{ url: string }>(`/deliverables/${id}/file-url`),
  },

  portal: {
    get: (token: string) => apiFetch<PortalContext>(`/portal/${token}`),
    validate: (token: string, id: string, data: { action: string; comment?: string }) =>
      apiFetch(`/portal/${token}/deliverables/${id}/validate`, { method: 'POST', body: JSON.stringify(data) }),
    getFileUrl: (token: string, id: string) =>
      apiFetch<{ url: string }>(`/portal/${token}/deliverables/${id}/file-url`),
  },

  users: {
    me: () => apiFetch<UserProfile>('/users/me'),
    update: (data: Partial<Pick<UserProfile, 'name' | 'avatarUrl' | 'jobTitle'>>) =>
      apiFetch<UserProfile>('/users/me', { method: 'PATCH', body: JSON.stringify(data) }),
  },

  organizations: {
    get: (id: string) => apiFetch<Organization>(`/organizations/${id}`),
    update: (id: string, data: Partial<Pick<Organization, 'name' | 'logoUrl' | 'website' | 'primaryColor'>>) =>
      apiFetch<Organization>(`/organizations/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    stats: (id: string) => apiFetch<OrgStats>(`/organizations/${id}/stats`),
    activity: (id: string) => apiFetch<ActivityEvent[]>(`/organizations/${id}/activity`),
    messages: (id: string) => apiFetch<ProjectThread[]>(`/organizations/${id}/messages`),
  },

  messages: {
    listByProject: (projectId: string) => apiFetch<Message[]>(`/projects/${projectId}/messages`),
    send: (projectId: string, data: { text: string; authorName?: string }) =>
      apiFetch<Message>(`/projects/${projectId}/messages`, { method: 'POST', body: JSON.stringify(data) }),
  },

  notifications: {
    list: () => apiFetch<Notification[]>('/users/me/notifications'),
    markRead: (id: string) => apiFetch<Notification>(`/users/me/notifications/${id}/read`, { method: 'PATCH' }),
  },
}
