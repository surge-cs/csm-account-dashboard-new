import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'

// This will be injected from environment
let auth: JWT | null = null

export function setAuth(jwtAuth: JWT) {
  auth = jwtAuth
}

const SPREADSHEET_ID = "1T0vCitXPX5-E6GnVD4MThfzB-DdHcpVqcUgVZHPuPEE"

/** Strip leading emoji + whitespace from a value like "🔴 Not Secured" → "Not Secured" */
function stripEmoji(val: string): string {
  return val.replace(/^[\p{Emoji}\s]+/u, "").trim()
}

/** Fetch the dashboard data from Google Sheets */
export async function getDashboardData() {
  if (!auth) {
    throw new Error('Google authentication not initialized')
  }

  const doc = new GoogleSpreadsheet(SPREADSHEET_ID, auth)
  await doc.loadInfo()

  // Read Dashboard Data sheet (key-value pairs)
  const dashboardDataSheet = doc.sheetsByTitle['Dashboard Data']
  if (!dashboardDataSheet) {
    throw new Error('Dashboard Data sheet not found in spreadsheet')
  }

  const dashboardRows = await dashboardDataSheet.getRows()
  const kv: Record<string, string> = {}
  const rowB: string[] = []
  const rowA: string[] = []

  dashboardRows.forEach(row => {
    const field = row.get('Field') || row.get('Key') || ''
    const value = row.get('Value') || ''
    if (field) {
      kv[field] = value
      rowA.push(field)
      rowB.push(value)
    }
  })

  // Read Revenue Tracker sheet
  const revenueSheet = doc.sheetsByTitle['Revenue Tracker']
  const revenueTracker = revenueSheet ? await readRevenueTracker(revenueSheet) : []

  // Helper functions
  const get = (field: string) => kv[field] ?? "—"
  const getRow = (n: number) => rowB[n - 1] ?? "—"
  const getRowA = (n: number) => rowA[n - 1] ?? "—"

  /** Build a structured Opportunity object from numbered sheet fields */
  function opp(prefix: string, n: number | string) {
    const p = `${prefix} ${n}`
    return {
      name: get(p),
      stakeholder: get(`${p} Stakeholder`),
      stakeholderTitle: get(`${p} Stakeholder Title`),
      value: get(`${p} Value`),
      stage: get(`${p} Stage`),
      businessDriver: get(`${p} Business Driver`),
    }
  }

  // Renewals
  const sheetRenewals = [1, 2, 3].map(n => opp("Contract Renewal", n)).filter(o => o.name && o.name !== "—")
  const renewals = sheetRenewals.length > 0 ? sheetRenewals : [
    {
      name: "Contract Renewal — Platform Subscription",
      stakeholder: "Michael Gains",
      stakeholderTitle: "Director Finance",
      value: "$1,800,000",
      stage: "Negotiation/Review",
      businessDriver: "Competitive differentiation",
    },
  ]

  return {
    accountOverview: {
      accountName: get("Account Name") || "Walmart Pharmacy",
      tier: get("Tier Level") || "Strategic/Enterprise",
      acv: get("ACV") || "$1,500,000",
      tcv: getRow(4) || "$1,800,000",
      tcvLabel: getRowA(4) || "TCV",
      card3Label: getRowA(5) || "NRR",
      card3Value: getRow(5) || "127%",
      newCard2Label: getRowA(6) || "MSA Status",
      newCard2Value: getRow(6) || "Signed",
      card4Label: getRowA(8) || "Health Status",
      card4Content: getRow(8) || "Green",
      card3Suffix: getRow(2) || "",
      card4Suffix: getRow(7) || "",
      renewalDate: get("Contract Renewal Date") || "Q4 2025",
      daysToRenewal: get("Days to Renewal") || "187",
      nrrToTarget: get("NRR % to Target") || "127% (Goal: 110%)",
      nrrDetail: getRow(10) || "$1,270,000 of $1,000,000",
      msa: getRow(6) || "Yes",
      msaSignedDate: get("MSA Signed Date") || "Signed: October 15, 2025",
      msaContent: getRow(16) || "Professional Services addendum executed",
      coPresentation: getRow(23) || "Scheduled",
      caseStudy: getRow(24) || "In Progress",
      card25Label: getRowA(25) || "Advocacy",
      card25Value: getRow(25) || "Reference customer",
      card26Label: getRowA(26) || "Expansion Status",
      card26Value: getRow(26) || "Active",
      card27Label: getRowA(27) || "Executive Sponsor",
      card27Value: getRow(27) || "Engaged",
      targetRevToDate: getRow(13) || "$1,500,000",
      targetRevLabel: getRowA(13) || "Target Revenue YTD",
    },
    healthAdoption: {
      overallHealthScore: get("Overall Health Score") || "8.5",
      healthStatus: stripEmoji(get("Health Status") || "🟢 Strong"),
      npsCsat: get("NPS / CSAT Score") || "8.2",
      npsCsatStatus: stripEmoji(getRow(18) || "Goal Achieved"),
      seatUtilization: get("Seat Utilization %") || "82%",
      seatDetail: (() => { 
        const r = stripEmoji(getRow(20) || '16 of 25 seats')
        return (!r || r === '—') ? '16 of 25 seats' : /^\d/.test(r) ? r : `16 ${r}` 
      })(),
      appsInProduction: get("Apps in Production") || "6",
      creatorCerts: get("Creator Certifications") || "6",
      creatorCertsTarget: get("Creator Certifications Target") || "10",
      creatorCertsDetail: getRow(25) || "6 of 10 target",
      featureUtilizationRate: get("Feature Utilization Rate") || "73%",
      featureUtilizationDetail: stripEmoji(getRow(22) || "of available platform features"),
      activeRisk1: get("Active Risk 1") || "Platform adoption plateau in Q2",
      activeRisk2: get("Active Risk 2") || "Creator certification pace slower than planned",
      activeRisk3: get("Active Risk 3") || "Executive sponsor transition — new CTO",
      activeRisk4: get("Active Risk 4") || "Competitive pressure from alternate LCNC platforms",
      activeRisk1Color: 'red',
      activeRisk2Color: 'yellow',
      activeRisk3Color: 'red',
      activeRisk4Color: 'red',
      renewalConfidence: get("Renewal Confidence") || "High",
    },
    strategicOpportunities: {
      expansionPipelineValue: getRow(30) || "$2,475,000",
      numberOfQuickWins: get("# of Quick Win Opportunities") || "4",
      numberOfQuickWinsLabel: getRowA(31) || "# of Quick Wins",
      numberOfQuickWinsB31: getRow(31) || "4",
      pipelineCard3Label: getRowA(32) || "Strategic Initiatives",
      pipelineCard3Value: getRow(32) || "4",
      numberOfStrategicInitiatives: get("# of Strategic Opportunities") || "4",
      numberOfContractRenewals: get("# of Contract Renewals") || "1",
      quickWins: [1, 2, 3, 4].map(n => opp("Quick Win", n)).filter(o => o.name && o.name !== "—"),
      strategicInitiatives: [
        {
          name: get("Strategic Initiative 1") !== "—" ? get("Strategic Initiative 1") : "Workflow Automation Center of Excellence",
          stakeholder: get("Strategic Initiative 1 Stakeholder") !== "—" ? get("Strategic Initiative 1 Stakeholder") : "Marc Jones, Chief Technology Officer",
          stakeholderTitle: get("Strategic Initiative 1 Stakeholder Title") || "CTO",
          value: get("Strategic Initiative 1 Value") !== "—" ? get("Strategic Initiative 1 Value") : "$375,000",
          stage: get("Strategic Initiative 1 Stage") !== "—" ? get("Strategic Initiative 1 Stage") : "Needs Analysis",
          businessDriver: get("Strategic Initiative 1 Business Driver") !== "—" ? get("Strategic Initiative 1 Business Driver") : "Labor constraint mitigation",
        },
        {
          name: get("Strategic Initiative 2") !== "—" ? get("Strategic Initiative 2") : "Walmart Financial Services Integration",
          stakeholder: get("Strategic Initiative 2 Stakeholder") !== "—" ? get("Strategic Initiative 2 Stakeholder") : "Matthew Sharp, VP Finance",
          stakeholderTitle: get("Strategic Initiative 2 Stakeholder Title") || "VP Finance",
          value: get("Strategic Initiative 2 Value") !== "—" ? get("Strategic Initiative 2 Value") : "$750,000",
          stage: get("Strategic Initiative 2 Stage") !== "—" ? get("Strategic Initiative 2 Stage") : "Proposal/Price Quote",
          businessDriver: get("Strategic Initiative 2 Business Driver") !== "—" ? get("Strategic Initiative 2 Business Driver") : "Margin improvement",
        },
        {
          name: get("Strategic Initiative 3") !== "—" ? get("Strategic Initiative 3") : "Regulatory Compliance Automation",
          stakeholder: get("Strategic Initiative 3 Stakeholder") !== "—" ? get("Strategic Initiative 3 Stakeholder") : "Linda Hanauer, VP Regulatory Affairs",
          stakeholderTitle: get("Strategic Initiative 3 Stakeholder Title") || "VP Regulatory",
          value: get("Strategic Initiative 3 Value") !== "—" ? get("Strategic Initiative 3 Value") : "$350,000",
          stage: get("Strategic Initiative 3 Stage") !== "—" ? get("Strategic Initiative 3 Stage") : "Qualification",
          businessDriver: get("Strategic Initiative 3 Business Driver") !== "—" ? get("Strategic Initiative 3 Business Driver") : "Compliance risk reduction",
        },
        {
          name: get("Strategic Initiative 4") !== "—" ? get("Strategic Initiative 4") : "Enterprise Digital Transformation",
          stakeholder: get("Strategic Initiative 4 Stakeholder") !== "—" ? get("Strategic Initiative 4 Stakeholder") : "Marc Jones, Chief Technology Officer",
          stakeholderTitle: get("Strategic Initiative 4 Stakeholder Title") || "CTO",
          value: get("Strategic Initiative 4 Value") !== "—" ? get("Strategic Initiative 4 Value") : "$1,000,000",
          stage: get("Strategic Initiative 4 Stage") !== "—" ? get("Strategic Initiative 4 Stage") : "Prospecting",
          businessDriver: get("Strategic Initiative 4 Business Driver") !== "—" ? get("Strategic Initiative 4 Business Driver") : "Competitive differentiation",
        },
      ].filter(o => o.name && o.name !== "—"),
      renewals,
    },
    relationships: {
      execSponsorStatus: stripEmoji(get("Exec Sponsor Status") || "🟢 Engaged"),
      execSponsorRaw: get("Exec Sponsor Status") || "🟢 Engaged",
      supporters: parseInt(getRow(106) || "8") || 0,
      neutrals: parseInt(getRow(107) || "4") || 0,
      detractors: parseInt(get("# of Detractors") || "1") || 0,
      targets: parseInt(get("# of Targets") || "3") || 0,
      lastExecutiveTouchpoint: get("Last Executive Touchpoint") || "May 28, 2026",
      nextScheduledEngagement: get("Next Scheduled Executive Touchpoint") || "June 14, 2026",
      engagementCadenceTitle: getRowA(117) || "Weekly Steering Committee Meetings",
      relationshipRisk: get("Relationship Risk") || "Exec sponsor transition — new CTO not yet formally engaged",
      relationshipWin: getRow(125) || "Secured exec sponsor buy-in on Q3 roadmap",
      relationshipWin2: getRow(126) || "Completed quarterly business review with positive NRR feedback",
      relationshipWin2Title: getRowA(114) || "Relationship Win",
      relationshipHighlight3: getRow(117) || "Weekly steering committee engagement maintained",
      relationshipHighlight3Title: getRowA(117) || "Engagement Cadence",
      engagementWeeks: Array.from({ length: 22 }, (_, i) => ({
        week: `Wk ${i + 1}`,
        weekNum: i + 1,
        value: Math.floor(Math.random() * 8) + 1, // Placeholder; read from sheet if available
      })),
    },
    execution: {
      criticalActionsOverdue: get("# of Critical Actions Overdue") || "0",
      overdueAction1: get("Overdue Action 1") || "None",
      overdueAction2: get("Overdue Action 2") || "None",
      nextKeyMilestone: get("Next Key Milestone") || "Unqork CTO Executive Brief & Roadmap Alignment",
      nextMilestoneDate: get("Next Milestone Date") || "June 21, 2026",
      recentWin1: get("Recent Win 1") || "Walmart Pharmacy achieved 82% seat utilization",
      recentWin1Date: get("Recent Win 1 date") || "May 20, 2026",
      recentWin2: get("Recent Win 2") || "Secured $750K expansion opportunity in Financial Services",
      recentWin2Date: get("Recent Win 2 date") || "May 28, 2026",
      recentWin3: get("Recent Win 3") || "6 internal creators certified; 4 additional in training",
      recentWin3Date: get("Recent Win 3 date") || "June 2, 2026",
      leadershipAsk1: get("Leadership Ask 1") || "CTO intro confirmed — identify and lock in Unqork executive sponsor, align on agenda, schedule by June 21.",
      leadershipAsk2: get("Leadership Ask 2") || "Financial Services steering committee kickoff with Matthew Sharp and team",
      leadershipAsk3: get("Leadership Ask 3") || "Identify and onboard 2 executive advocates from existing implementation success",
    },
    revenueTracker,
  }
}

async function readRevenueTracker(sheet: any) {
  const rows = await sheet.getRows()
  return rows.map((r: any) => ({
    month: r.get('Month') ?? "",
    renewalActual: parseInt(r.get('Renewal Revenue Actual') ?? "0") || 0,
    renewalCumulative: parseInt(r.get('Renewal Cumulative') ?? "0") || 0,
    expansionActual: parseInt(r.get('Expansion Revenue Actual') ?? "0") || 0,
    expansionCumulative: parseInt(r.get('Expansion Cumulative') ?? "0") || 0,
  }))
}

export default getDashboardData
