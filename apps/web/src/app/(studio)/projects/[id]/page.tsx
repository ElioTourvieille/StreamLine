import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Circle, AlertCircle, FileText, MessageSquare } from 'lucide-react'

const PROJECT = {
  id: 'demo-0',
  name: 'E-Commerce Replatforming',
  client: 'Acme Corp',
  status: 'On Track',
  phase: 'Development',
  description: 'Full-scale migration of legacy Magento 2 storefront to a headless Shopify Plus architecture with customized Hydrogen frontend components. Focus on improving LCP by 40% and reducing checkout friction.',
  timeline: 'Oct 12 — Mar 24',
  manager: 'Sarah Jenkins',
  budget: '$145,000',
  lastSync: '2 hours ago',
  health: 75,
  milestones: [
    { label: 'Discovery', done: true },
    { label: 'Strategy', done: true },
    { label: 'UX/UI', done: true },
    { label: 'Development', done: false, active: true },
    { label: 'QA', done: false },
    { label: 'Launch', done: false },
  ],
  blockers: [
    {
      title: 'API Authentication Mismatch',
      description: 'The production API keys for Shopify are not synchronizing with the dev environment secrets. Blocking cart persistence.',
      raisedBy: 'Marcus L.',
      openFor: '3 days',
      priority: 'High Priority',
    },
  ],
  validations: [
    { title: 'Checkout Flow UX', status: 'Approved', date: 'Oct 24, 2023' },
    { title: 'Category Landing Pages', status: 'Pending', date: 'Oct 22, 2023' },
    { title: 'Stripe Integration Keys', status: 'Approved', date: 'Oct 20, 2023' },
    { title: 'Brand Palette Assets', status: 'Changes Requested', date: 'Oct 18, 2023' },
    { title: 'Site Navigation Map', status: 'Approved', date: 'Oct 15, 2023' },
  ],
  team: [
    { name: 'Sarah Jenkins', role: 'Project Manager', initials: 'SJ' },
    { name: 'Marcus Lane', role: 'Fullstack Lead', initials: 'ML' },
    { name: 'Elise Voss', role: 'UI/UX Designer', initials: 'EV' },
  ],
  stats: { validations: '8/12', docs: '5/7', chat: 23 },
}

const VALIDATION_STYLES: Record<string, string> = {
  'Approved': 'bg-success/15 text-success',
  'Pending': 'bg-warning/15 text-warning',
  'Changes Requested': 'bg-danger/15 text-danger',
}

const STATUS_STYLES: Record<string, string> = {
  'On Track': 'bg-success/15 text-success',
  'At Risk': 'bg-warning/15 text-warning',
  'Overdue': 'bg-danger/15 text-danger',
}

export default function ProjectDetailPage() {
  const p = PROJECT

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <Link href="/dashboard" className="text-ink-muted hover:text-ink transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-semibold text-ink tracking-tight">{p.name}</h1>
        <span className="px-2.5 py-1 bg-surface-high border border-line rounded-full text-xs font-medium text-ink-dim">
          {p.client}
        </span>
        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[p.status]}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {p.status}
        </span>
        <span className="px-2.5 py-1 bg-surface-high border border-line rounded-full text-xs font-medium text-ink-dim">
          {p.phase}
        </span>
        <div className="ml-auto">
          <button className="bg-violet hover:bg-violet-hover text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors active:scale-[0.98]">
            Request Validation
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-line mb-6 mt-4">
        {['Overview', 'Validations', 'Documents', 'Timeline', 'Messages', 'Settings'].map((tab, i) => (
          <button key={tab}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              i === 0
                ? 'text-ink border-violet'
                : 'text-ink-muted border-transparent hover:text-ink'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_300px] gap-6">
        {/* Left column */}
        <div className="space-y-5">
          {/* Scope card */}
          <div className="bg-surface border border-line rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-base font-semibold text-ink">Project Scope</h2>
              <div className="flex -space-x-2">
                {p.team.map((m) => (
                  <div key={m.name}
                    className="w-7 h-7 rounded-full bg-violet/20 border-2 border-surface flex items-center justify-center text-[10px] font-bold text-violet-glow"
                    title={m.name}>
                    {m.initials}
                  </div>
                ))}
                <div className="w-7 h-7 rounded-full bg-surface-higher border-2 border-surface flex items-center justify-center text-[10px] font-bold text-ink-muted">
                  +4
                </div>
              </div>
            </div>
            <p className="text-sm text-ink-dim leading-relaxed mb-5">{p.description}</p>
            <div className="grid grid-cols-4 gap-4 pt-4 border-t border-line">
              {[
                { label: 'Timeline', value: p.timeline },
                { label: 'Project Manager', value: p.manager },
                { label: 'Total Budget', value: p.budget },
                { label: 'Last Sync', value: p.lastSync },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[11px] text-ink-muted uppercase tracking-wide mb-1">{label}</p>
                  <p className="text-sm font-medium text-ink">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Milestone timeline */}
          <div className="bg-surface border border-line rounded-lg p-6">
            <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-widest mb-5">Milestone Timeline</p>
            <div className="relative flex items-center justify-between">
              {/* Track line */}
              <div className="absolute top-4 left-4 right-4 h-0.5 bg-line" />
              <div className="absolute top-4 left-4 h-0.5 bg-violet" style={{ width: '50%' }} />

              {p.milestones.map((m) => (
                <div key={m.label} className="flex flex-col items-center gap-2 relative z-10">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                    m.done
                      ? 'bg-success border-success'
                      : m.active
                        ? 'bg-surface border-violet ring-4 ring-violet/20'
                        : 'bg-surface border-line'
                  }`}>
                    {m.done
                      ? <CheckCircle2 className="w-4 h-4 text-white" />
                      : m.active
                        ? <Circle className="w-3 h-3 text-violet fill-violet" />
                        : <Circle className="w-3 h-3 text-line" />}
                  </div>
                  <span className={`text-xs font-medium ${m.active ? 'text-ink' : m.done ? 'text-success' : 'text-ink-muted'}`}>
                    {m.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Blockers */}
          {p.blockers.length > 0 && (
            <div className="bg-surface border border-line rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-danger" />
                  <h2 className="text-base font-semibold text-danger">Active Blockers</h2>
                </div>
                <span className="bg-danger/15 text-danger text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  High Priority
                </span>
              </div>
              {p.blockers.map((b, i) => (
                <div key={i} className="bg-surface-high border border-line rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-ink mb-1">{b.title}</p>
                      <p className="text-sm text-ink-dim leading-relaxed">{b.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[11px] text-ink-muted">Raised by: <span className="font-semibold text-ink-dim">{b.raisedBy}</span></span>
                        <span className="text-[11px] text-ink-muted">Open for: <span className="font-semibold text-danger">{b.openFor}</span></span>
                      </div>
                    </div>
                    <button className="flex-shrink-0 bg-surface-higher border border-line hover:border-line-dim text-ink-dim text-xs font-medium px-3 py-1.5 rounded-md transition-colors whitespace-nowrap">
                      Mark as Resolved
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Validations */}
          <div className="bg-surface border border-line rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-line">
              <h2 className="text-base font-semibold text-ink">Recent Validations</h2>
              <button className="text-sm text-ink-muted hover:text-ink transition-colors">View All</button>
            </div>
            <table className="w-full">
              <tbody>
                {p.validations.map((v, i) => (
                  <tr key={v.title}
                    className={`h-12 border-b border-line hover:bg-surface-high transition-colors cursor-pointer ${i === p.validations.length - 1 ? 'border-b-0' : ''}`}>
                    <td className="px-6 text-sm font-medium text-ink">{v.title}</td>
                    <td className="px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${VALIDATION_STYLES[v.status] ?? 'bg-white/5 text-ink-muted'}`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="px-6 text-sm text-ink-muted text-right">{v.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Client actions */}
          <div className="bg-surface border border-line rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4 text-warning" />
              <h2 className="text-sm font-semibold text-ink">Client Actions</h2>
            </div>
            <div className="space-y-3">
              {[
                { title: 'DNS Records Setup', cat: 'Technical', due: 'Oct 20', status: 'Overdue' },
                { title: 'Legal Terms Approval', cat: 'Legal', due: 'Oct 28', status: 'Due in 2d' },
              ].map((a) => (
                <div key={a.title} className="bg-surface-high border border-line rounded-lg p-3.5">
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-sm font-medium text-ink">{a.title}</p>
                    <span className={`text-[11px] font-semibold ${a.status === 'Overdue' ? 'text-danger' : 'text-warning'}`}>
                      {a.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-ink-muted mb-3">{a.cat} / {a.due}</p>
                  <button className="w-full bg-surface-higher hover:bg-line border border-line text-ink-dim text-xs font-medium py-1.5 rounded-md transition-colors">
                    Send Reminder
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Project health */}
          <div className="bg-surface border border-line rounded-lg p-5">
            <h2 className="text-sm font-semibold text-ink mb-4">Project Health</h2>
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                  <circle cx="48" cy="48" r="38" fill="none" stroke="#2D2D3D" strokeWidth="8" />
                  <circle cx="48" cy="48" r="38" fill="none" stroke="#7c3aed" strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 38 * p.health / 100} ${2 * Math.PI * 38 * (1 - p.health / 100)}`}
                    strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-ink">{p.health}%</span>
                  <span className="text-[10px] text-ink-muted">On Track</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-line">
              {[
                { icon: CheckCircle2, label: 'Valids', value: p.stats.validations },
                { icon: FileText, label: 'Docs', value: p.stats.docs },
                { icon: MessageSquare, label: 'Chat', value: p.stats.chat },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="text-base font-bold text-ink">{value}</p>
                  <p className="text-[11px] text-ink-muted">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Team */}
          <div className="bg-surface border border-line rounded-lg p-5">
            <h2 className="text-sm font-semibold text-ink mb-4">Assigned Team</h2>
            <div className="space-y-3">
              {p.team.map((m) => (
                <div key={m.name} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet/20 border border-violet/30 flex items-center justify-center text-xs font-bold text-violet-glow">
                    {m.initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink">{m.name}</p>
                    <p className="text-[11px] text-ink-muted">{m.role}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 w-full bg-surface-high hover:bg-surface-higher border border-line text-ink-dim text-xs font-medium py-2 rounded-md transition-colors">
              <Users className="w-3.5 h-3.5 inline mr-1.5" />
              Manage Access
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Users(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
