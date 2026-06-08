export interface AccountOverview {
  accountName: string
  tier: string
  acv: string
  tcv: string
  tcvLabel: string
  card3Label: string
  card3Value: string
  newCard2Label: string
  newCard2Value: string
  card4Label: string
  card4Content: string
  card3Suffix: string
  card4Suffix: string
  renewalDate: string
  daysToRenewal: string
  nrrToTarget: string
  nrrDetail: string
  msa: string
  msaSignedDate: string
  msaContent: string
  coPresentation: string
  caseStudy: string
  card25Label: string
  card25Value: string
  card26Label: string
  card26Value: string
  card27Label: string
  card27Value: string
  targetRevToDate: string
  targetRevLabel: string
}

export interface HealthAdoption {
  overallHealthScore: string
  healthStatus: string
  npsCsat: string
  npsCsatStatus: string
  seatUtilization: string
  seatDetail: string
  appsInProduction: string
  creatorCerts: string
  creatorCertsTarget: string
  creatorCertsDetail: string
  featureUtilizationRate: string
  featureUtilizationDetail: string
  activeRisk1: string
  activeRisk2: string
  activeRisk3: string
  activeRisk4: string
  activeRisk1Color: string
  activeRisk2Color: string
  activeRisk3Color: string
  activeRisk4Color: string
  renewalConfidence: string
}

export interface Opportunity {
  name: string
  stakeholder: string
  stakeholderTitle: string
  value: string
  stage: string
  businessDriver: string
}

export interface StrategicOpportunities {
  expansionPipelineValue: string
  numberOfQuickWins: string
  numberOfQuickWinsLabel: string
  numberOfQuickWinsB31: string
  pipelineCard3Label: string
  pipelineCard3Value: string
  numberOfStrategicInitiatives: string
  numberOfContractRenewals: string
  quickWins: Opportunity[]
  strategicInitiatives: Opportunity[]
  renewals: Opportunity[]
}

export interface Relationships {
  execSponsorStatus: string
  execSponsorRaw: string
  supporters: number
  neutrals: number
  detractors: number
  targets: number
  lastExecutiveTouchpoint: string
  nextScheduledEngagement: string
  engagementCadenceTitle: string
  relationshipRisk: string
  relationshipWin: string
  relationshipWin2: string
  relationshipWin2Title: string
  relationshipHighlight3: string
  relationshipHighlight3Title: string
  engagementWeeks: { week: string; weekNum: number; value: number }[]
}

export interface Execution {
  criticalActionsOverdue: string
  overdueAction1: string
  overdueAction2: string
  nextKeyMilestone: string
  nextMilestoneDate: string
  recentWin1: string
  recentWin1Date: string
  recentWin2: string
  recentWin2Date: string
  recentWin3: string
  recentWin3Date: string
  leadershipAsk1: string
  leadershipAsk2: string
  leadershipAsk3: string
}

export interface DashboardData {
  accountOverview: AccountOverview
  healthAdoption: HealthAdoption
  strategicOpportunities: StrategicOpportunities
  relationships: Relationships
  execution: Execution
  revenueTracker: RevenueTrackerRow[]
}

export interface RevenueTrackerRow {
  month: string
  renewalActual: number
  renewalCumulative: number
  expansionActual: number
  expansionCumulative: number
}

export type TrafficStatus = 'green' | 'yellow' | 'red' | 'neutral' | 'purple'
