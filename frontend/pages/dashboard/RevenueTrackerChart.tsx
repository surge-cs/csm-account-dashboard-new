import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import type { RevenueTrackerRow } from './types'

function formatDollar(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000)     return `$${(v / 1_000).toFixed(0)}K`
  return `$${v}`
}

interface Props {
  data: RevenueTrackerRow[]
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
      <div className="font-semibold text-slate-700 mb-1">{label}</div>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-bold text-slate-900">{formatDollar(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function RevenueTrackerChart({ data }: Props) {
  const chartData = data.filter(r => r.month)

  return (
    <div className="flex flex-col gap-2 mt-2">
      <div className="text-[14px] font-bold uppercase tracking-[0.12em] text-slate-500 text-center">
        Revenue Tracker — Cumulative YTD
      </div>
      <div className="rounded-xl bg-white border border-slate-200 px-4 pt-4 pb-2">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 20, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatDollar}
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={52}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              formatter={(value) => <span style={{ color: '#64748b' }}>{value}</span>}
            />
            <Line
              type="monotone"
              dataKey="renewalCumulative"
              name="Renewal Cumulative"
              stroke="#60a5fa"
              strokeWidth={1.5}
              dot={{ r: 3, fill: '#60a5fa', strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="expansionCumulative"
              name="Expansion Cumulative"
              stroke="#34d399"
              strokeWidth={1.5}
              dot={{ r: 3, fill: '#34d399', strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
