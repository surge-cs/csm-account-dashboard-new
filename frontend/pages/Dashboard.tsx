import { useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import {
  Building2, Activity, Lightbulb, Users, CheckSquare,
  RefreshCw, ExternalLink, Calendar, TrendingUp,
  Zap, Clock, AlertTriangle, RefreshCcw, User, ArrowUp
} from 'lucide-react'
import { useGetDashboardData } from '../hooks/backend/dashboard'
import {
  StatCard, HealthCard, Section,
  SupporterCard, StatusBadge, TrafficDot
} from './dashboard/components'
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent
} from '../lib/shadcn/accordion'
import type { TrafficStatus, DashboardData, Opportunity } from './dashboard/types'
import RevenueTrackerChart from './dashboard/RevenueTrackerChart'

// ─── Status helpers ───────────────────────────────────────────────────────────

function pctNum(val: string) { return parseInt(val.replace('%', '')) || 0 }

function seatStatus(val: string): TrafficStatus {
  if (val === '—') return 'neutral'
  const n = pctNum(val)
  return n >= 75 ? 'green' : n >= 50 ? 'yellow' : 'red'
}

function appsStatus(val: string): TrafficStatus {
  if (val === '—') return 'neutral'
  const n = parseInt(val) || 0
  return n >= 4 ? 'green' : n >= 2 ? 'yellow' : 'red'
}

function confidenceStatus(val: string): TrafficStatus {
  if (val === '—') return 'neutral'
  const v = val.toLowerCase()
  return v.includes('high') ? 'green' : v.includes('med') ? 'yellow' : 'red'
}

function scoreHealthStatus(val: string): TrafficStatus {
  if (val === '—') return 'neutral'
  const n = parseInt(val)
  if (isNaN(n)) return 'neutral'
  return n >= 85 ? 'green' : n >= 70 ? 'yellow' : 'red'
}

function scoreHealthLabel(val: string): string {
  if (val === '—') return '—'
  const n = parseInt(val)
  if (isNaN(n)) return '—'
  return n >= 85 ? 'Healthy' : n >= 70 ? 'Needs Attention' : 'At Risk'
}

function overdueStatus(val: string): TrafficStatus {
  if (val === '—') return 'neutral'
  const n = parseInt(val) || 0
  return n === 0 ? 'green' : n <= 2 ? 'yellow' : 'red'
}

// ─── Section: Account Overview ────────────────────────────────────────────────

function AccountOverviewSection({ ao, revenueTracker }: { ao: DashboardData['accountOverview']; revenueTracker: DashboardData['revenueTracker'] }) {
  const customerAdvocacyCommits = [
    { num: 1, type: 'Reference Calls',   detail: '2 by 11/21/2026' },
    { num: 2, type: 'Case Study w Logo', detail: ao.coPresentation },
    { num: 3, type: 'Co-Presentation',   detail: ao.caseStudy },
  ]
  return (
    <Section
      title="Account Overview"
      subtitle="Contract & revenue snapshot"
      icon={<Building2 className="w-5 h-5" />}
      accentColor="#60a5fa"
    >
      <div className="flex flex-col gap-4">

        {/* Row 2: 2 columns */}
        <div className="grid grid-cols-3 sm:grid-cols-3 gap-3">
          <StatCard
            label="Renewal Date"
            value={ao.renewalDate}
            subtext={ao.daysToRenewal !== '—' ? `${ao.daysToRenewal} days to renewal` : ''}
            status="green"
            valueColor="#059669"
          />
          <StatCard
            label="MSA"
            value={ao.msaContent}
            subtext={ao.msaSignedDate}
            icon={<span className="w-3 h-3 rounded-full bg-emerald-500 block" />}
            valueColor="#059669"
          />
          <StatCard
            label={ao.card25Label}
            value={ao.card25Value}
            valueSuffix={ao.card26Value}
            subtext=" "
          />
        </div>

        {/* Customer Advocacy Commits */}
        <div className="flex flex-wrap items-center gap-y-1 px-1">
          <span className="text-[15px] font-semibold tracking-widest text-emerald-600 mr-3">Client Advocacy Commits</span>
          <span className="mx-1 text-slate-400 select-none text-[11px]">│</span>
          {customerAdvocacyCommits.map((c, idx, arr) => (
            <span key={c.num} className="flex items-center">
              <span className="flex items-center gap-1.5 text-[11px] whitespace-nowrap mx-3">
                <span className="font-semibold text-slate-900">{c.type}:</span>
                <span className="text-slate-500">{c.detail}</span>
              </span>
              {idx < arr.length - 1 && (
                <span className="text-slate-400 select-none">│</span>
              )}
            </span>
          ))}
        </div>

        {/* Revenue cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label={ao.tcvLabel} value={ao.tcv} icon={<TrendingUp className="w-4 h-4" />} />
          <StatCard
            label={ao.card3Label}
            value={ao.card3Value}
            icon={<TrendingUp className="w-4 h-4" />}
            valueColor="#FFB302"
            valueSuffix={ao.card3Suffix}
          />
          <StatCard label={ao.newCard2Label} value={ao.newCard2Value} icon={<TrendingUp className="w-4 h-4" />} />
          <StatCard
            label={ao.card4Label}
            value={ao.card4Content}
            icon={<Zap className="w-4 h-4" />}
            valueColor="#dc2626"
            valueSuffix={ao.card4Suffix}
          />
        </div>

        {/* Divider */}
        <div className="w-full h-[3px] bg-slate-200 my-2" />

        {/* Revenue Tracker Chart */}
        <RevenueTrackerChart data={revenueTracker} />
      </div>
    </Section>
  )
}

// ─── Section: Health & Adoption ───────────────────────────────────────────────

function HealthSection({ ha }: { ha: DashboardData['healthAdoption'] }) {
  return (
    <Section
      title="Health & Adoption"
      subtitle="Platform health, usage, and renewal risk"
      icon={<Activity className="w-5 h-5" />}
      accentColor="#a78bfa"
    >
      <div className="flex flex-col gap-4">

        {/* Tier 1: Overall Health Score | Renewal Confidence | NPS/CSAT */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <HealthCard
            label="Overall Health Score"
            value={ha.overallHealthScore + (ha.overallHealthScore !== '—' ? '/100' : '')}
            status={scoreHealthStatus(ha.overallHealthScore)}
            statusLabel={scoreHealthLabel(ha.overallHealthScore)}
          />
          <HealthCard
            label="Renewal Confidence"
            value={ha.renewalConfidence}
            status={confidenceStatus(ha.renewalConfidence)}
            statusLabel="Progressing"
          />
          <HealthCard
            label="NPS / CSAT Score"
            value={ha.npsCsat}
            status="green"
            statusLabel={ha.npsCsatStatus}
          />
        </div>

        {/* Tier 2: Adoption Metrics */}
        <div className="flex flex-col gap-2">
          <div className="text-[14px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            Adoption Metrics
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {([
              { label: 'Apps in Production',       value: ha.appsInProduction,       status: appsStatus(ha.appsInProduction), subtext: '' },
              { label: 'Seat Utilization %',       value: ha.seatUtilization,        status: seatStatus(ha.seatUtilization),  subtext: ha.seatDetail },
              { label: 'Creator Certifications',   value: ha.creatorCerts,           status: 'yellow' as const,              subtext: ha.creatorCertsDetail },
              { label: 'Feature Utilization Rate', value: ha.featureUtilizationRate, status: 'yellow' as const,              subtext: ha.featureUtilizationDetail },
            ] as { label: string; value: string; status: import('./dashboard/types').TrafficStatus; subtext: string }[]).map(({ label, value, status, subtext }) => (
              <div
                key={label}
                className="flex flex-col justify-between rounded-xl p-4 bg-white border border-slate-200 min-h-[90px] hover:border-blue-300 hover:bg-slate-100 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-widest leading-tight text-slate-500">{label}</span>
                  <TrafficDot status={status} />
                </div>
                <div>
                  <div className={`text-xl font-bold leading-tight mt-2 ${value === '—' ? 'text-slate-400' : 'text-slate-900'}`}>{value}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 min-h-[1rem]">{subtext}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tier 3: Active Risks */}
        <div>
          <div className="text-[15px] uppercase tracking-widest text-slate-500 font-semibold mb-2">
            Active Risks
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {([  
              { text: ha.activeRisk1, color: ha.activeRisk1Color },
              { text: ha.activeRisk2, color: ha.activeRisk2Color },
              { text: ha.activeRisk3, color: ha.activeRisk3Color },
              { text: ha.activeRisk4, color: ha.activeRisk4Color },
            ] as { text: string; color: string }[])
              .filter(r => r.text && r.text !== '—')
              .map((r, i) => {
                const dot = r.color === 'yellow'
                  ? 'bg-[#FFB302] shadow-[0_0_6px_rgba(255,179,2,0.6)]'
                  : r.color === 'green'
                  ? 'bg-emerald-500 shadow-[0_0_6px_rgba(52,211,153,0.6)]'
                  : 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]'
                return (
                  <div key={i} className="flex items-center gap-2.5 py-2 px-3 rounded-lg bg-white border border-slate-200 text-sm text-slate-700 hover:border-blue-200 hover:bg-blue-50/40 transition-all">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
                    {r.text}
                  </div>
                )
              })}
          </div>
        </div>
      </div>
    </Section>
  )
}

// ─── Opportunity row inside accordion ────────────────────────────────────────

function OppRow({ opp, accent }: { opp: Opportunity; accent: string }) {
  const hasStakeholder = opp.stakeholder && opp.stakeholder !== '—'
  const hasStage       = opp.stage && opp.stage !== '—'
  const hasDriver      = opp.businessDriver && opp.businessDriver !== '—'
  const hasValue       = opp.value && opp.value !== '—'

  return (
    <div className="rounded-lg bg-white border border-slate-200 px-4 py-3 flex flex-col gap-2 hover:border-blue-200 hover:bg-blue-50/40 transition-all">
      {/* Top line: name | stakeholder | value */}
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-sm font-semibold text-slate-900 leading-snug flex-1 min-w-0">{opp.name}</span>
        {hasStakeholder && (
          <span className="flex-shrink-0 flex items-center gap-1 text-[12px] text-slate-500">
            <User className="w-3 h-3 text-slate-400 flex-shrink-0" />
            {opp.stakeholder}{opp.stakeholderTitle && opp.stakeholderTitle !== '—' ? ` · ${opp.stakeholderTitle}` : ''}
          </span>
        )}
        {hasValue && (
          <span
            className="flex-shrink-0 text-xs font-bold px-2.5 py-0.5 rounded border"
            style={{ color: accent, backgroundColor: `${accent}18`, borderColor: `${accent}40` }}
          >
            {opp.value}
          </span>
        )}
      </div>
      {/* Second line: labeled Stage + Business Driver tags */}
      {(hasStage || hasDriver) && (
        <div className="flex flex-wrap gap-2">
          {hasStage && (
            <span className="inline-flex items-center gap-1 text-[11px] bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1">
              <span className="text-slate-500 font-semibold">Stage:</span>
              <span className="text-slate-600">{opp.stage}</span>
            </span>
          )}
          {hasDriver && (
            <span className="inline-flex items-center gap-1 text-[11px] bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1">
              <span className="text-slate-500 font-semibold">Business Driver:</span>
              <span className="text-slate-600">{opp.businessDriver}</span>
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Section: Strategic Opportunities ────────────────────────────────────────

function StrategicSection({ so }: { so: DashboardData['strategicOpportunities'] }) {
  return (
    <Section
      title="Opportunities & Pipeline"
      subtitle="Expansion pipeline, quick wins, and strategic initiatives"
      icon={<Lightbulb className="w-5 h-5" />}
      accentColor="#fbbf24"
    >
      <div className="flex flex-col gap-5">

        {/* ── Stat cards row ── */}
        <div className="grid grid-cols-3 gap-3 w-full">
          {/* Total Pipeline Value — styled like ACV/StatCard */}
          <StatCard
            label="Total Pipeline Value"
            value={so.expansionPipelineValue}
            icon={<TrendingUp className="w-4 h-4" />}
            highlight
            boldLabel
            labelColor="#059669"
          />
          {/* A31/B31 and A32/B32 cards */}
          {[
            { label: so.numberOfQuickWinsLabel, value: so.numberOfQuickWinsB31, icon: <Zap       className="w-4 h-4" /> },
            { label: so.pipelineCard3Label,     value: so.pipelineCard3Value,   icon: <Lightbulb className="w-4 h-4" /> },
          ].filter(c => c.label && c.label !== '—').map(({ label, value, icon }) => (
            <div
              key={label}
              className="flex flex-col justify-between rounded-xl p-4 border min-h-[90px] transition-all bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-100"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-widest leading-tight text-slate-500">{label}</span>
                <span className="text-slate-500">{icon}</span>
              </div>
              <div className="text-xl font-bold text-slate-900 mt-2">{value}</div>
            </div>
          ))}
        </div>

        {/* ── Accordions ── */}
        <Accordion type="multiple" className="flex flex-col gap-2">

          {/* Quick Wins */}
          <AccordionItem
            value="quick-wins"
            className="rounded-xl border border-slate-200 bg-white overflow-hidden"
          >
            <AccordionTrigger className="px-4 py-3 text-sm font-semibold text-slate-900 hover:no-underline hover:bg-emerald-50 transition-colors [&>svg]:text-slate-500">
              <span className="flex flex-1 items-center justify-center gap-2">
                <Zap className="w-4 h-4 text-emerald-600" />
                Quick Wins Opportunities
                <span className="ml-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-slate-200 px-2 py-0.5 rounded-full">
                  {so.quickWins.length}
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-1">
              {so.quickWins.length === 0
                ? <p className="text-sm text-slate-500 italic">No quick wins entered yet.</p>
                : <div className="flex flex-col gap-2">
                    {so.quickWins.map((opp, i) => <OppRow key={i} opp={opp} accent="#34d399" />)}
                  </div>
              }
            </AccordionContent>
          </AccordionItem>

          {/* Strategic Initiatives */}
          <AccordionItem
            value="strategic"
            className="rounded-xl border border-slate-200 bg-white overflow-hidden"
          >
            <AccordionTrigger className="px-4 py-3 text-sm font-semibold text-slate-900 hover:no-underline hover:bg-[#FFB302]/10 transition-colors [&>svg]:text-slate-500">
              <span className="flex flex-1 items-center justify-center gap-2">
                <Lightbulb className="w-4 h-4 text-[#FFB302]" />
                Strategic Initiatives Opportunities
                <span className="ml-1.5 text-[11px] font-bold text-[#FFB302] bg-[#FFB302]/10 border border-slate-200 px-2 py-0.5 rounded-full">
                  {so.strategicInitiatives.length}
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-1">
              {so.strategicInitiatives.length === 0
                ? <p className="text-sm text-slate-500 italic">No strategic initiatives entered yet.</p>
                : <div className="flex flex-col gap-2">
                    {so.strategicInitiatives.map((opp, i) => <OppRow key={i} opp={opp} accent="#fbbf24" />)}
                  </div>
              }
            </AccordionContent>
          </AccordionItem>

          {/* Renewals */}
          <AccordionItem
            value="renewals"
            className="rounded-xl border border-slate-200 bg-white overflow-hidden"
          >
            <AccordionTrigger className="px-4 py-3 text-sm font-semibold text-slate-900 hover:no-underline hover:bg-violet-50 transition-colors [&>svg]:text-slate-500">
              <span className="flex flex-1 items-center justify-center gap-2">
                <RefreshCcw className="w-4 h-4 text-violet-600" />
                Renewals Opportunities
                <span className="ml-1.5 text-[11px] font-bold text-violet-700 bg-violet-50 border border-slate-200 px-2 py-0.5 rounded-full">
                  {so.renewals.length}
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-1">
              {so.renewals.length === 0
                ? <p className="text-sm text-slate-500 italic">No renewals entered yet.</p>
                : <div className="flex flex-col gap-2">
                    {so.renewals.map((opp, i) => <OppRow key={i} opp={opp} accent="#a78bfa" />)}
                  </div>
              }
            </AccordionContent>
          </AccordionItem>

        </Accordion>
      </div>
    </Section>
  )
}

// ─── Section: Relationships & Engagement ─────────────────────────────────────

function RelationshipsSection({ rel }: { rel: DashboardData['relationships'] }) {
  return (
    <Section
      title="Engagement & Relationships"
      subtitle="Stakeholder sentiment, executive coverage, and cadence"
      icon={<Users className="w-5 h-5" />}
      accentColor="#34d399"
    >
      {/* Sentiment row */}
      <div className="flex flex-col items-center gap-0.5">
        <div className="flex items-center justify-center gap-2">
          <span className="text-xl font-extrabold text-[#FFB302] tracking-tight">NPS +33</span>
          <span className="flex items-center gap-0.5 text-sm font-semibold text-emerald-600">
            <ArrowUp className="w-4 h-4" />8 pts
          </span>
        </div>
        <span className="text-[11px] text-slate-500 font-medium">(target: +40)</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <SupporterCard label="Promoters"  count={rel.supporters} type="supporter" />
        <SupporterCard label="Passives"   count={rel.neutrals}   type="neutral"   />
        <SupporterCard label="Detractors" count={rel.detractors} type="detractor" />
      </div>

      {/* Risk/Win cards */}
      <div className="mt-4">
        <div className="text-[15px] uppercase tracking-widest text-slate-500 font-semibold mb-2">Relationship Highlights</div>
        <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-3 rounded-xl p-4 bg-white border border-slate-200 border-l-4 border-l-red-500 hover:bg-blue-50/40 transition-all">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-red-600">Relationship Risk</span>
          <div className="text-sm font-medium text-slate-900 leading-snug">{rel.relationshipRisk}</div>
        </div>
        <div className="flex flex-col gap-3 rounded-xl p-4 bg-white border border-slate-200 border-l-4 border-l-emerald-500 hover:bg-blue-50/40 transition-all">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-emerald-600">Relationship Win</span>
          <div className="text-sm font-medium text-slate-900 leading-snug">{rel.relationshipWin}</div>
        </div>
        {rel.relationshipHighlight3 && rel.relationshipHighlight3 !== '—' && (
          <div className="flex flex-col gap-3 rounded-xl p-4 bg-white border border-slate-200 border-l-4 border-l-emerald-500 hover:bg-blue-50/40 transition-all">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-emerald-600">{rel.relationshipHighlight3Title}</span>
            <div className="text-sm font-medium text-slate-900 leading-snug">{rel.relationshipWin2}</div>
          </div>
        )}
        </div>
      </div>

      {/* 1 ── Engagement Cadence Chart */}
      <div className="mt-4">
        <div className="text-[15px] uppercase tracking-widest text-slate-500 font-semibold mb-2">Client Engagement Cadence</div>
        <div className="rounded-xl bg-white border border-slate-200 p-4">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={rel.engagementWeeks} margin={{ top: 20, right: 8, bottom: 0, left: -28 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="weekNum"
              ticks={[1, 5, 9, 14, 18, 22]}
              tickFormatter={(v: number) => (['Jan','Feb','Mar','Apr','May','Jun'][[1,5,9,14,18,22].indexOf(v)] ?? '')}
              tick={{ fill: '#64748b', fontSize: 11 }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              domain={[0, 10]}
              ticks={[2, 4, 6, 8, 10]}
              tick={{ fill: '#607ca8', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: '#64748b' }}
              itemStyle={{ color: '#60a5fa' }}
              labelFormatter={(v) => `Week ${v}`}
              formatter={(v) => [v, 'Touchpoints']}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#60a5fa"
              strokeWidth={1.5}
              dot={{ fill: '#60a5fa', r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#93c5fd', strokeWidth: 0 }}
            />
            <ReferenceLine
              y={8}
              stroke="transparent"
              label={(props: unknown) => {
                const { viewBox } = props as { viewBox: { x: number; y: number; width: number } }
                const cx = viewBox.x + viewBox.width / 2
                return (
                  <g>
                    <text x={cx} y={viewBox.y - 10} textAnchor="middle" fill="#60a5fa" fontSize={11} fontWeight={700}>Weekly: January to June 2026</text>
                    <text x={cx} y={viewBox.y + 2} textAnchor="middle" fill="#64748b" fontSize={10}>Low: 3, High: 7</text>
                  </g>
                )
              }}
            />
          </LineChart>
        </ResponsiveContainer>
        </div>
      </div>

      {/* 2 ── Touchpoint cards */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-2 rounded-xl p-4 bg-white border border-slate-200 hover:border-blue-200 hover:bg-blue-50/40 transition-all">
          <span className="text-[11px] uppercase tracking-widest text-slate-500 font-semibold">Last Executive Touchpoint</span>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-base font-bold text-slate-900">{rel.lastExecutiveTouchpoint}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 rounded-xl p-4 bg-white border border-slate-200 hover:border-blue-200 hover:bg-blue-50/40 transition-all">
          <span className="text-[11px] uppercase tracking-widest text-slate-500 font-semibold">Next Scheduled Executive Touchpoint</span>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span className="text-base font-bold text-slate-900">{rel.nextScheduledEngagement}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 rounded-xl p-4 bg-white border border-slate-200 hover:border-blue-200 hover:bg-blue-50/40 transition-all">
          <span className="text-[11px] uppercase tracking-widest text-slate-500 font-semibold">{rel.relationshipWin2Title}</span>
          <div className="flex items-start gap-2">
            <Users className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm font-medium text-slate-900 leading-snug">{rel.relationshipWin2}</span>
          </div>
        </div>
      </div>

    </Section>
  )
}

// ─── Section: Action Plan & Execution ────────────────────────────────────────

function ExecutionSection({ ex }: { ex: DashboardData['execution'] }) {
  const oStatus = overdueStatus(ex.criticalActionsOverdue)

  const recentWins = [
    { text: ex.recentWin1, date: ex.recentWin1Date },
    { text: ex.recentWin2, date: ex.recentWin2Date },
    { text: ex.recentWin3, date: ex.recentWin3Date },
  ].filter(w => w.text && w.text !== '—')

  const leadershipAsks = [ex.leadershipAsk1, ex.leadershipAsk2, ex.leadershipAsk3]
    .filter(a => a && a !== '—')

  return (
    <Section
      title="Action Plan & Execution"
      subtitle="Wins, critical actions, and leadership asks"
      icon={<CheckSquare className="w-5 h-5" />}
      accentColor="#f472b6"
    >
      <div className="flex flex-col gap-4">

        {/* 1 ── Critical Actions + Next Milestone */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div
            className={`flex flex-col gap-3 rounded-xl p-4 bg-white border border-slate-200 hover:bg-blue-50/40 transition-all
              ${oStatus === 'green' ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-red-500'}`}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${oStatus === 'green' ? 'text-emerald-600' : 'text-red-600'}`} />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Critical Actions Overdue</span>
            </div>
            <div className={`text-3xl font-extrabold ${oStatus === 'green' ? 'text-emerald-600' : 'text-red-600'}`}>
              {ex.criticalActionsOverdue}
            </div>
            <StatusBadge status={oStatus === 'green' ? 'green' : 'red'} label={oStatus === 'green' ? 'All Clear' : 'Overdue'} />
            {[ex.overdueAction1, ex.overdueAction2].filter(a => a && a !== '—').length > 0 && (
              <div className="flex flex-col gap-1 pt-1 border-t border-slate-200">
                {[ex.overdueAction1, ex.overdueAction2].filter(a => a && a !== '—').map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="col-span-1 sm:col-span-2 flex flex-col gap-3 rounded-xl p-4 bg-white border border-slate-200 border-l-4 border-l-violet-400 hover:bg-blue-50/40 transition-all">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Next Key Milestone</span>
            <div className="text-sm font-medium text-slate-900 leading-snug">{ex.nextKeyMilestone}</div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase text-violet-600">
              <span className="w-2 h-2 rounded-full bg-violet-400" />
              {ex.nextMilestoneDate}
            </span>
          </div>
        </div>

        {/* 2 ── Recent Wins (2 columns) */}
        <div>
          <div className="text-[11px] uppercase tracking-widest text-emerald-600 font-semibold mb-2">Recent Wins</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {recentWins.map((win, i) => (
              <div key={i} className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg bg-white border border-slate-200 hover:border-blue-200 hover:bg-blue-50/40 transition-all">
                <div className="flex items-center gap-2 min-w-0">
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span className="text-sm text-emerald-700 truncate">{win.text}</span>
                </div>
                <span className="flex-shrink-0 text-[11px] font-medium text-emerald-600 whitespace-nowrap ml-2">{win.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 4 ── Leadership Asks (2 columns) */}
        <div>
          <div className="text-[11px] uppercase tracking-widest text-[#FFB302] font-semibold mb-2">Leadership Asks</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {leadershipAsks.map((ask, i) => (
              <div key={i} className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-white border border-slate-200 hover:border-blue-200 hover:bg-blue-50/40 transition-all">
                <AlertTriangle className="w-3.5 h-3.5 text-[#FFB302] flex-shrink-0 mt-0.5" />
                <span className="text-sm text-[#FFB302]">{ask}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </Section>
  )
}

// ─── KPI strip helpers ──────────────────────────────────────────────────────

function KpiSep() {
  return <span className="text-slate-400 select-none mx-2 text-sm font-light hidden sm:inline">│</span>
}

function KpiChip({
  label, value, status, first = false, plain = false,
}: { label: string; value: string; status: TrafficStatus; first?: boolean; plain?: boolean }) {
  const dotColor = {
    green:   'bg-emerald-500',
    yellow:  'bg-[#FFB302]',
    red:     'bg-red-500',
    neutral: 'bg-slate-400',
    purple:  'bg-violet-500',
  }[status]
  const valueColor = {
    green:   'text-emerald-600',
    yellow:  'text-[#FFB302]',
    red:     'text-red-600',
    neutral: 'text-slate-400',
    purple:  'text-violet-600',
  }[status]
  return (
    <span className={`inline-flex items-center gap-1.5 ${first ? '' : 'sm:ml-0 ml-0'} py-0.5`}>
      {!plain && <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />}
      <span className="text-[13px] text-slate-500 font-medium hidden sm:inline">{label}:&nbsp;</span>
      <span className={`text-[13px] font-bold truncate max-w-[160px] ${plain ? 'text-slate-500' : valueColor}`} title={value}>{value}</span>
    </span>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { data, loading, error, trigger } = useGetDashboardData()

  useEffect(() => { trigger({}) }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium text-slate-500">Loading account data…</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-red-600 max-w-md text-center">
          <AlertTriangle className="w-10 h-10" />
          <p className="text-base font-semibold">Failed to load dashboard data</p>
          <p className="text-sm text-slate-500">{error ?? 'Unknown error'}</p>
          <button
            onClick={() => trigger({}, { skipCache: true })}
            className="mt-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const d = data as DashboardData

  return (
    <div className="min-h-screen bg-slate-200 text-slate-900">
      {/* ── Page Header ── */}
      <div className="sticky top-0 z-50 border-b border-slate-200" style={{ background: '#f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-widest font-semibold text-slate-500 mb-1">
              CSM Account Dashboard
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              {d.accountOverview.accountName}
            </h1>
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              <KpiChip label={d.accountOverview.card27Label} value={d.accountOverview.card27Value} status="neutral" plain first />
              <KpiSep />
              <KpiChip label="Health Status" value="Progressing" status="yellow" />
              <KpiSep />
              <KpiChip label="Days to Renewal" value={d.accountOverview.daysToRenewal + ' days'} status="green" />
              <KpiSep />
              <KpiChip label={d.accountOverview.targetRevLabel} value={d.accountOverview.targetRevToDate} status="red" />
            </div>
          </div>
          <button
            onClick={() => trigger({}, { skipCache: true })}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors border border-blue-500"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Sections ── */}
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6">
        <AccountOverviewSection ao={d.accountOverview} revenueTracker={d.revenueTracker} />
        <HealthSection          ha={d.healthAdoption} />
        <StrategicSection       so={d.strategicOpportunities} />
        <RelationshipsSection   rel={d.relationships} />
        <ExecutionSection       ex={d.execution} />

        {/* ── Quick Navigation ── */}
        <div className="flex flex-col items-center gap-3 py-4 border-t border-slate-200">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Quick Navigation
          </span>
          <nav className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2">
            {[
              'Account Plan',
              'Stakeholder Map',
              'Opportunities Detail',
              'Activity Roadmap',
              'Active Contract',
            ].map((label, idx, arr) => (
              <span key={label} className="flex items-center gap-2">
                <a
                  href="#"
                  className="text-sm font-medium text-slate-900 hover:text-blue-600 hover:underline underline-offset-2 transition-colors"
                >
                  {label}
                </a>
                {idx < arr.length - 1 && (
                  <span className="text-slate-400 select-none">|</span>
                )}
              </span>
            ))}
          </nav>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 flex-wrap gap-2">
          <span>Data source: CS Account Plan → Dashboard Data tab</span>
          <a
            href="https://docs.google.com/spreadsheets/d/11rJLXA0b8zW6iryjDdR5D3EBY4KAdzE1fM3PyOZ6iqE"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-blue-600 transition-colors"
          >
            Open in Google Sheets <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>


    </div>
  )
}
