const SPREADSHEET_ID = "11rJLXA0b8zW6iryjDdR5D3EBY4KAdzE1fM3PyOZ6iqE"

/** Strip leading emoji + whitespace from a value like "🔴 Not Secured" → "Not Secured" */
function stripEmoji(val: string): string {
  return val.replace(/^[\p{Emoji}\s]+/u, "").trim()
}

/** Read the Revenue Tracker tab (A2:E14) — row 1 is a merged title, row 2 has real headers. */
async function readRevenueTracker() {
  const result = await csAccountPlan.read({
    spreadsheetId: SPREADSHEET_ID,
    range: "Revenue Tracker!A2:E14",
  })
  const rows = result.data as Record<string, string>[]
  return rows.map(r => ({
    month:              r["Month"] ?? "",
    renewalActual:      parseInt(r["Renewal Revenue Actual"] ?? "0") || 0,
    renewalCumulative:  parseInt(r["Renewal Cumulative"]     ?? "0") || 0,
    expansionActual:    parseInt(r["Expansion Revenue Actual"] ?? "0") || 0,
    expansionCumulative:parseInt(r["Expansion Cumulative"]   ?? "0") || 0,
  }))
}

/** Read the two-column Dashboard Data tab into a key-value map and a row-indexed array. */
async function readDashboardKV(): Promise<{ kv: Record<string, string>; rowB: string[]; rowA: string[] }> {
  const result = await csAccountPlan.read({
    spreadsheetId: SPREADSHEET_ID,
    range: "Dashboard Data!A1:B200",
  })

  const rows = result.data as Record<string, string>[]
  if (!rows.length) return { kv: {}, rowB: [], rowA: [] }

  const firstRow = rows[0]!
  const colA = Object.keys(firstRow)[0] ?? ""
  const colB = Object.keys(firstRow)[1] ?? ""

  const kv: Record<string, string> = {}
  const rowB: string[] = []
  const rowA: string[] = []

  for (const row of rows) {
    const field = row[colA]
    const value = row[colB] ?? ""
    if (field) kv[field] = value
    rowB.push(value)
    rowA.push(field ?? "")
  }

  return { kv, rowB, rowA, b1: colB }
}

export default async function (_req: { params: Record<string, never>; user: User }) {
  const [{ kv, rowB, rowA, b1 }, revenueTracker] = await Promise.all([
    readDashboardKV(),
    readRevenueTracker(),
  ])
  const get    = (field: string) => kv[field] ?? "—"
  const getRow = (n: number) => rowB[n - 1] ?? "—"  // 1-indexed, matches sheet row numbers
  const getRowA = (n: number) => rowA[n - 1] ?? "—" // column A value at row n

  /** Build a structured Opportunity object from numbered sheet fields */
  function opp(prefix: string, n: number | string) {
    const p = `${prefix} ${n}`
    return {
      name:             get(p),
      stakeholder:      get(`${p} Stakeholder`),
      stakeholderTitle: get(`${p} Stakeholder Title`),
      value:            get(`${p} Value`),
      stage:            get(`${p} Stage`),
      businessDriver:   get(`${p} Business Driver`),
    }
  }

  // Renewals: use sheet data if present, otherwise show demo renewal
  const sheetRenewals = [1, 2, 3].map(n => opp("Contract Renewal", n)).filter(o => o.name && o.name !== "—")
  const renewals = sheetRenewals.length > 0 ? sheetRenewals : [
    {
      name:             "Contract Renewal — Platform Subscription",
      stakeholder:      "Michael Gains",
      stakeholderTitle: "Director Finance",
      value:            "$1,800,000",
      stage:            "Negotiation/Review",
      businessDriver:   "Competitive differentiation",
    },
  ]

  return {
    accountOverview: {
      accountName:   b1 || get("Account Name"),
      tier:          get("Tier Level"),
      acv:           get("ACV"),
      tcv:           getRow(4),
      tcvLabel:      getRowA(4),
      card3Label:    getRowA(5),
      card3Value:    getRow(5),
      newCard2Label: getRowA(6),
      newCard2Value: getRow(6),
      card4Label:    getRowA(8),
      card4Content:  getRow(8),
      card3Suffix:   getRow(2),
      card4Suffix:   getRow(7),
      renewalDate:   get("Contract Renewal Date"),
      daysToRenewal: get("Days to Renewal"),
      nrrToTarget:   get("NRR % to Target"),
      nrrDetail:     getRow(10) || "$870,000 of $1,000,000",
      msa:           getRow(6) || "Yes",
      msaSignedDate: get("MSA Signed Date") || "Signed: October 15, 2025",
      msaContent:    getRow(16),
      coPresentation: getRow(23),
      caseStudy:      getRow(24),
      card25Label:    getRowA(25),
      card25Value:    getRow(25),
      card26Label:    getRowA(26),
      card26Value:    getRow(26),
      card27Label:    getRowA(27),
      card27Value:    getRow(27),
      targetRevToDate: getRow(13),
      targetRevLabel:   getRowA(13),
    },
    healthAdoption: {
      overallHealthScore:    get("Overall Health Score"),
      healthStatus:          stripEmoji(get("Health Status")),
      npsCsat:               get("NPS / CSAT Score") || "8.2",
      npsCsatStatus:         stripEmoji(getRow(18)) || "Goal Achieved",
      seatUtilization:       get("Seat Utilization %"),
      seatDetail:            (() => { const r = stripEmoji(getRow(20)); return (!r || r === '—') ? '16 of 25 seats' : /^\d/.test(r) ? r : `16 ${r}` })(),
      appsInProduction:      get("Apps in Production"),
      creatorCerts:          get("Creator Certifications"),
      creatorCertsTarget:     get("Creator Certifications Target") || "10",
      creatorCertsDetail:     getRow(25) || "6 of 10 target",
      featureUtilizationRate: get("Feature Utilization Rate"),
      featureUtilizationDetail: stripEmoji(getRow(22)) || "of available platform features",
      activeRisk1:           get("Active Risk 1"),
      activeRisk2:           get("Active Risk 2"),
      activeRisk3:           get("Active Risk 3"),
      activeRisk4:           get("Active Risk 4"),
      activeRisk1Color:      'red',
      activeRisk2Color:      'yellow',
      activeRisk3Color:      'red',
      activeRisk4Color:      'red',
      renewalConfidence:     get("Renewal Confidence"),
    },
    strategicOpportunities: {
      expansionPipelineValue:       getRow(30) || get("Expansion Pipeline Value"),
      numberOfQuickWins:            get("# of Quick Win Opportunities"),
      numberOfQuickWinsLabel:        getRowA(31) || "# of Quick Wins",
      numberOfQuickWinsB31:          getRow(31),
      pipelineCard3Label:            getRowA(32),
      pipelineCard3Value:            getRow(32),
      numberOfStrategicInitiatives: get("# of Strategic Opportunities"),
      numberOfContractRenewals:     get("# of Contract Renewals") || "1",
      quickWins: [1, 2, 3, 4].map(n => opp("Quick Win", n)).filter(o => o.name && o.name !== "—"),
      strategicInitiatives: [
        {
          name:             get("Strategic Initiative 1") !== "—" ? get("Strategic Initiative 1") : get("Top Strategic Initiative"),
          stakeholder:      get("Strategic Initiative 1 Stakeholder") !== "—" ? get("Strategic Initiative 1 Stakeholder") : "Marc Jones, Chief Technology Officer",
          stakeholderTitle: get("Strategic Initiative 1 Stakeholder Title"),
          value:            get("Strategic Initiative 1 Value") !== "—" ? get("Strategic Initiative 1 Value") : "$375,000",
          stage:            get("Strategic Initiative 1 Stage") !== "—" ? get("Strategic Initiative 1 Stage") : "Needs Analysis",
          businessDriver:   get("Strategic Initiative 1 Business Driver") !== "—" ? get("Strategic Initiative 1 Business Driver") : "Automation / workflow improvement",
        },
        {
          name:             get("Strategic Initiative 2") !== "—" ? get("Strategic Initiative 2") : "Walmart Financial Services",
          stakeholder:      get("Strategic Initiative 2 Stakeholder") !== "—" ? get("Strategic Initiative 2 Stakeholder") : "Matthew Sharp, VP, Finance",
          stakeholderTitle: get("Strategic Initiative 2 Stakeholder Title"),
          value:            get("Strategic Initiative 2 Value") !== "—" ? get("Strategic Initiative 2 Value") : "$750,000",
          stage:            get("Strategic Initiative 2 Stage") !== "—" ? get("Strategic Initiative 2 Stage") : "Proposal/Price Quote",
          businessDriver:   get("Strategic Initiative 2 Business Driver") !== "—" ? get("Strategic Initiative 2 Business Driver") : "Automation/workflow improvement",
        },
        {
          name:             get("Strategic Initiative 3") !== "—" ? get("Strategic Initiative 3") : "Regulatory Compliance Automation",
          stakeholder:      get("Strategic Initiative 3 Stakeholder") !== "—" ? get("Strategic Initiative 3 Stakeholder") : "Linda Hanauer, VP, Regulatory Affairs",
          stakeholderTitle: get("Strategic Initiative 3 Stakeholder Title"),
          value:            get("Strategic Initiative 3 Value") !== "—" ? get("Strategic Initiative 3 Value") : "$350,000",
          stage:            get("Strategic Initiative 3 Stage") !== "—" ? get("Strategic Initiative 3 Stage") : "Qualification",
          businessDriver:   get("Strategic Initiative 3 Business Driver") !== "—" ? get("Strategic Initiative 3 Business Driver") : "Margin pressure",
        },
        {
          name:             get("Strategic Initiative 4") !== "—" ? get("Strategic Initiative 4") : "Enterprise Digital Transformation",
          stakeholder:      get("Strategic Initiative 4 Stakeholder") !== "—" ? get("Strategic Initiative 4 Stakeholder") : "Marc Jones, Chief Technology Officer",
          stakeholderTitle: get("Strategic Initiative 4 Stakeholder Title"),
          value:            get("Strategic Initiative 4 Value") !== "—" ? get("Strategic Initiative 4 Value") : "$400,000",
          stage:            get("Strategic Initiative 4 Stage") !== "—" ? get("Strategic Initiative 4 Stage") : "Prospecting",
          businessDriver:   get("Strategic Initiative 4 Business Driver") !== "—" ? get("Strategic Initiative 4 Business Driver") : "Competitive differentiation",
        },
      ].filter(o => o.name && o.name !== "—"),
      renewals,
    },
    relationships: {
      execSponsorStatus:       stripEmoji(get("Exec Sponsor Status")),
      execSponsorRaw:          get("Exec Sponsor Status"),
      supporters:              parseInt(getRow(106)) || 0,
      neutrals:                parseInt(getRow(107)) || 0,
      detractors:              parseInt(get("# of Detractors")) || 0,
      targets:                 parseInt(get("# of Targets")) || 0,
      lastExecutiveTouchpoint: get("Last Executive Touchpoint"),
      nextScheduledEngagement: get("Next Scheduled Executive Touchpoint"),
      engagementCadenceTitle:  getRowA(117) || "Weekly Steering Committee Meetings",
      relationshipRisk:        get("Relationship Risk") || "Exec sponsor transition — new CTO not yet formally engaged",
      relationshipWin:         getRow(125),
      relationshipWin2:        getRow(126),
      relationshipWin2Title:     getRowA(114) || "Relationship Win",
      relationshipHighlight3:    getRow(117),
      relationshipHighlight3Title: getRowA(117) || "Relationship Win",
      engagementWeeks: Array.from({ length: 22 }, (_, i) => ({
        week: `Wk ${i + 1}`,
        weekNum: i + 1,
        value: parseInt(get(`Engagement Week ${i + 1}`)) || 0,
      })),
    },
    execution: {
      criticalActionsOverdue: get("# of Critical Actions Overdue"),
      overdueAction1:         get("Overdue Action 1"),
      overdueAction2:         get("Overdue Action 2"),
      nextKeyMilestone:       get("Next Key Milestone"),
      nextMilestoneDate:      get("Next Milestone Date"),
      recentWin1:       get("Recent Win 1"),
      recentWin1Date:   get("Recent Win 1 date"),
      recentWin2:       get("Recent Win 2"),
      recentWin2Date:   get("Recent Win 2 date"),
      recentWin3:       get("Recent Win 3"),
      recentWin3Date:   get("Recent Win 3 date"),
      leadershipAsk1:   get("Leadership Ask 1") || "CTO intro confirmed — need to identify and lock in Unqork executive sponsor, align on agenda, and schedule.",
      leadershipAsk2:   get("Leadership Ask 2"),
      leadershipAsk3:   get("Leadership Ask 3"),
    },
    revenueTracker,
  }
}
