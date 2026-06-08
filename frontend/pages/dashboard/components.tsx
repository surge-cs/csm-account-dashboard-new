import { type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { type TrafficStatus } from './types'

// ─────────────────────────────────────────────
// Traffic Light Dot
// ─────────────────────────────────────────────
export function TrafficDot({ status, size = 'md' }: { status: TrafficStatus; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = { sm: 'w-2.5 h-2.5', md: 'w-3.5 h-3.5', lg: 'w-5 h-5' }[size]
  const colorClass = {
    green:   'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.45)]',
    yellow:  'bg-[#FFB302] shadow-[0_0_6px_rgba(255,179,2,0.45)]',
    red:     'bg-red-500    shadow-[0_0_6px_rgba(239,68,68,0.45)]',
    neutral: 'bg-slate-400',
    purple:  'bg-violet-500 shadow-[0_0_6px_rgba(139,92,246,0.45)]',
  }[status]
  return <span className={`inline-block rounded-full flex-shrink-0 ${sizeClass} ${colorClass}`} />
}

// ─────────────────────────────────────────────
// Traffic Status Badge (dot + text)
// ─────────────────────────────────────────────
export function StatusBadge({ status, label }: { status: TrafficStatus; label: string }) {
  const textColor = {
    green:   'text-emerald-600',
    yellow:  'text-[#FFB302]',
    red:     'text-red-600',
    neutral: 'text-slate-500',
    purple:  'text-violet-600',
  }[status]
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase ${textColor}`}>
      <TrafficDot status={status} size="sm" />
      {label}
    </span>
  )
}

// ─────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────
interface StatCardProps {
  label: string
  value: string
  subtext?: string
  status?: TrafficStatus
  highlight?: boolean
  boldLabel?: boolean
  labelColor?: string
  icon?: ReactNode
  centered?: boolean
  valueColor?: string
  subtextCentered?: boolean
  valueSuffix?: string
}

export function StatCard({ label, value, subtext, status, highlight, boldLabel, labelColor, icon, centered, valueColor, subtextCentered, valueSuffix }: StatCardProps) {
  const isEmpty = value === '—'
  return (
    <div
      className={`
        relative flex flex-col rounded-xl p-4 border transition-all
        ${highlight
          ? 'bg-blue-50 border-blue-200'
          : 'bg-white border-slate-200 hover:border-blue-200 hover:bg-blue-50/40'}
        ${centered ? 'items-center text-center' : ''}
      `}
    >
      <div className={`flex items-center gap-2 ${centered ? 'justify-center' : 'justify-between'}`}>
        <span
          className={`text-[11px] uppercase tracking-widest ${boldLabel ? 'font-bold' : 'font-semibold'}`}
          style={labelColor ? { color: labelColor } : { color: '#64748b' }}
        >
          {label}
        </span>
        {status && <TrafficDot status={status} />}
        {icon && !status && <span className="text-slate-400">{icon}</span>}
      </div>
      <div className={`mt-auto pt-2 text-xl font-bold leading-tight flex items-baseline ${valueColor ? '' : isEmpty ? 'text-slate-300' : 'text-slate-900'}`} style={valueColor && !isEmpty ? { color: valueColor } : undefined}>
        {value}
        {valueSuffix && <><span className="mx-2">—</span>{valueSuffix}</>}
      </div>
      {subtext && <div className={`text-[11px] text-slate-500${subtextCentered ? ' text-center' : ''}`}>{subtext}</div>}
      {isEmpty && <div className="text-[10px] text-slate-400 italic">Enter value in column B of Dashboard Data tab</div>}
    </div>
  )
}

// ─────────────────────────────────────────────
// Health Metric Card
// ─────────────────────────────────────────────
interface HealthCardProps {
  label: string
  value: string
  status: TrafficStatus
  statusLabel: string
}

export function HealthCard({ label, value, status, statusLabel }: HealthCardProps) {
  const isEmpty = value === '—'
  const borderAccent = {
    green:   'border-l-emerald-500',
    yellow:  'border-l-[#FFB302]',
    red:     'border-l-red-500',
    neutral: 'border-l-slate-300',
    purple:  'border-l-violet-500',
  }[status]
  return (
    <div className={`flex flex-col gap-3 rounded-xl p-4 bg-white border border-slate-200 border-l-4 ${borderAccent} hover:bg-blue-50/40 transition-all`}>
      <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">{label}</span>
      <div className={`text-2xl font-bold ${isEmpty ? 'text-slate-300' : 'text-slate-900'}`}>{value}</div>
      <StatusBadge status={status} label={statusLabel} />
    </div>
  )
}

// ─────────────────────────────────────────────
// Risk / Alert Banner
// ─────────────────────────────────────────────
export function RiskBanner({ topRisk }: { topRisk: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl p-4 bg-red-50 border border-red-200">
      <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-widest text-red-600 mb-1">Top Risk</div>
        <div className="text-sm font-medium text-red-700">{topRisk}</div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Pill Item (for lists)
// ─────────────────────────────────────────────
export function PillItem({ text, index }: { text: string; index: number }) {
  return (
    <div className="flex items-center gap-2.5 py-2 px-3 rounded-lg bg-white border border-slate-200 text-sm text-slate-700 hover:border-blue-200 hover:bg-blue-50/40 transition-all">
      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold flex items-center justify-center">
        {index + 1}
      </span>
      {text}
    </div>
  )
}

// ─────────────────────────────────────────────
// Section Container
// ─────────────────────────────────────────────
interface SectionProps {
  title: string
  subtitle?: string
  icon: ReactNode
  accentColor?: string
  centeredHeader?: boolean
  children: ReactNode
}

export function Section({ title, subtitle, icon, centeredHeader, children }: SectionProps) {
  return (
    <div className="rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shadow-sm">
      <div className={`flex items-center gap-3 px-6 py-4 border-b border-slate-200 bg-slate-50 ${centeredHeader ? 'justify-center' : ''}`}>
        <span className="text-slate-500">{icon}</span>
        <div className={centeredHeader ? 'text-center' : ''}>
          <h2 className="text-xl font-bold tracking-wide text-slate-900">{title}</h2>
          {subtitle && <p className="text-[13px] text-slate-500 mt-0.5 uppercase tracking-wide">{subtitle}</p>}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Supporter/Detractor Badge
// ─────────────────────────────────────────────
export function SupporterCard({ label, count, type }: { label: string; count: number; type: 'supporter' | 'detractor' | 'neutral' | 'target' }) {
  const dotStatus: TrafficStatus = ({
    supporter: 'green',
    detractor: 'red',
    neutral:   'yellow',
    target:    'purple',
  } as const)[type]

  const valueColor = {
    supporter: 'text-emerald-600',
    detractor: 'text-red-600',
    neutral:   'text-[#FFB302]',
    target:    'text-violet-600',
  }[type]

  return (
    <div className="flex flex-col justify-between rounded-xl p-4 bg-white border border-slate-200 min-h-[90px] hover:border-blue-200 hover:bg-blue-50/30 transition-all">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-widest leading-tight text-slate-500">{label}</span>
        <TrafficDot status={dotStatus} />
      </div>
      <div>
        <div className={`text-xl font-bold leading-tight mt-2 ${valueColor}`}>{count}</div>
        <div className="min-h-[1rem]" />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Progress Bar
// ─────────────────────────────────────────────
export function PlanProgress({ label, value }: { label: string; value: string }) {
  const isEmpty = value === '—'
  const pct = isEmpty ? 0 : parseInt(value.replace('%', '')) || 0
  const barColor = pct >= 80 ? '#059669' : pct >= 50 ? '#FFB302' : '#2563eb'

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
        <span className={`text-sm font-bold ${isEmpty ? 'text-slate-400' : 'text-slate-900'}`}>
          {isEmpty ? '—' : value}
        </span>
      </div>
      <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  )
}
