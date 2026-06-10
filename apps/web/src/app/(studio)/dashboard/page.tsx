import Link from 'next/link'
import { Plus, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'

const STATS = [
  {
    label: 'Active Projects',
    value: '12',
    change: '+2',
    trend: 'up',
    color: 'text-success',
  },
  {
    label: 'Pending Validations',
    value: '5',
    change: '+1',
    trend: 'up',
    color: 'text-warning',
    alert: 'Attention required',
    alertColor: 'bg-warning/15 text-warning',
  },
  {
    label: 'Active Blockers',
    value: '2',
    change: '-1',
    trend: 'down',
    color: 'text-danger',
    alert: 'Action needed',
    alertColor: 'bg-danger/15 text-danger',
  },
  {
    label: 'Completed This Month',
    value: '8',
    change: '+3',
    trend: 'up',
    color: 'text-success',
  },
]

const PROJECTS = [
  { name: 'Acme Redesign', client: 'Acme Corp', phase: 'Production', progress: 82, status: 'On Track' },
  { name: 'Mobile App 2.0', client: 'TechFlow', phase: 'Development', progress: 45, status: 'At Risk' },
  { name: 'E-commerce API', client: 'Boldmix', phase: 'Integration', progress: 12, status: 'Overdue' },
  { name: 'Brand Identity', client: 'Stellar', phase: 'Done', progress: 100, status: 'Completed' },
  { name: 'SaaS Dashboard', client: 'InnoWave', phase: 'Design', progress: 67, status: 'On Track' },
  { name: 'Legal Portal', client: 'Lexis', phase: 'QA', progress: 73, status: 'On Track' },
]

const ACTIVITY = [
  { actor: 'Acme Corp', action: 'approved Homepage Hero Section', time: '2h ago', color: 'bg-violet' },
  { actor: 'TechFlow', action: 'raised a blocker on API Integration', time: '4h ago', color: 'bg-danger' },
  { actor: 'Acme Corp', action: 'uploaded Brand Guidelines', time: 'Yesterday', color: 'bg-violet' },
  { actor: 'Sarah', action: 'replied in Homepage Hero thread', time: 'Yesterday', color: 'bg-ink-muted' },
  { actor: 'Boldmix', action: 'approved Mobile Navigation', time: '2 days ago', color: 'bg-violet' },
]

const STATUS_STYLES: Record<string, string> = {
  'On Track': 'bg-success/15 text-success',
  'At Risk': 'bg-warning/15 text-warning',
  'Overdue': 'bg-danger/15 text-danger',
  'Completed': 'bg-white/10 text-ink-muted',
  'Draft': 'bg-white/5 text-ink-muted',
}

const PROGRESS_COLORS: Record<string, string> = {
  'On Track': 'bg-success',
  'At Risk': 'bg-warning',
  'Overdue': 'bg-danger',
  'Completed': 'bg-ink-muted',
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${STATUS_STYLES[status] ?? 'bg-white/5 text-ink-muted'}`}>
      {status}
    </span>
  )
}

export default function DashboardPage() {
  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[32px] font-semibold text-ink tracking-tight leading-10">
            Good morning, Elio 👋
          </h1>
          <p className="text-ink-muted text-sm mt-1">
            Here is what&apos;s happening at Origin Studio today.
          </p>
        </div>
        <Link
          href="/projects/new"
          className="flex items-center gap-2 bg-violet hover:bg-violet-hover text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          New Project
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {STATS.map((s) => (
          <div key={s.label} className="bg-surface border border-line rounded-lg p-5 hover:bg-surface-high transition-colors">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-widest">{s.label}</p>
              <span className={`flex items-center gap-1 text-xs font-medium ${s.color}`}>
                {s.trend === 'up'
                  ? <TrendingUp className="w-3.5 h-3.5" />
                  : <TrendingDown className="w-3.5 h-3.5" />}
                {s.change}
              </span>
            </div>
            <p className="text-[2.25rem] font-semibold text-ink leading-none mb-3">{s.value}</p>
            {s.alert && (
              <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded ${s.alertColor}`}>
                <AlertTriangle className="w-3 h-3" />
                {s.alert}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-[1fr_320px] gap-6">
        {/* Projects table */}
        <div className="bg-surface border border-line rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-line">
            <h2 className="text-lg font-semibold text-ink">Recent Projects</h2>
            <div className="flex gap-2">
              <button className="text-xs px-3 py-1.5 bg-surface-high text-ink border border-line rounded-md font-medium">List</button>
              <button className="text-xs px-3 py-1.5 text-ink-muted hover:text-ink rounded-md font-medium transition-colors">Board</button>
            </div>
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-b border-line">
                {['Project Name', 'Client', 'Phase', 'Progress', 'Status'].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-[11px] font-semibold text-ink-muted uppercase tracking-widest">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PROJECTS.map((p, i) => (
                <tr
                  key={p.name}
                  className={`h-12 border-b border-line hover:bg-surface-high transition-colors cursor-pointer ${i === PROJECTS.length - 1 ? 'border-b-0' : ''}`}
                >
                  <td className="px-6">
                    <Link href={`/projects/demo-${i}`} className="text-sm font-semibold text-ink hover:text-violet-glow transition-colors">
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-6 text-sm text-ink-muted">{p.client}</td>
                  <td className="px-6 text-sm text-ink">{p.phase}</td>
                  <td className="px-6">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 rounded-full bg-white/10">
                        <div
                          className={`h-full rounded-full transition-all ${PROGRESS_COLORS[p.status] ?? 'bg-violet'}`}
                          style={{ width: `${p.progress}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6">
                    <StatusBadge status={p.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="px-6 py-4 border-t border-line">
            <Link href="/projects" className="text-sm text-ink-muted hover:text-ink transition-colors">
              View all projects →
            </Link>
          </div>
        </div>

        {/* Activity feed */}
        <div className="bg-surface border border-line rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-line">
            <h2 className="text-lg font-semibold text-ink">Activity Feed</h2>
          </div>

          <div className="p-5 space-y-4">
            {ACTIVITY.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-full ${a.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink leading-snug">
                    <span className="font-semibold">{a.actor}</span>{' '}
                    <span className="text-ink-dim">{a.action}</span>
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3 text-ink-faint" />
                    <p className="text-[11px] text-ink-muted">{a.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="px-5 py-4 border-t border-line">
            <button className="text-sm text-ink-muted hover:text-ink transition-colors w-full text-center">
              View all activity →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
