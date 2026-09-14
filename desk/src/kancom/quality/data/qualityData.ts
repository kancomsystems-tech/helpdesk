export const qualityKpis = [
  { label: "Quality Score", value: "87.6%", helper: "+4.7% vs previous week" },
  { label: "Evaluations", value: "1,248", helper: "Completed this cycle" },
  { label: "Interactions", value: "3,562", helper: "Monitored for signals" },
  { label: "Agents Evaluated", value: "28", helper: "Across operations teams" },
  { label: "Calibration", value: "92.4%", helper: "Manager alignment" },
];

export const qualityTrend = [84, 87, 89, 86, 90, 88, 91, 87, 92, 89, 91, 88];

export const strengths = [
  { label: "Politeness and courtesy", score: 93 },
  { label: "Clear itinerary confirmation", score: 92 },
  { label: "Active listening", score: 91 },
  { label: "Closing and next steps", score: 90 },
];

export const gaps = [
  { label: "Hold time compliance", score: 68 },
  { label: "Process adherence", score: 71 },
  { label: "Documentation accuracy", score: 74 },
  { label: "Follow-up ownership", score: 75 },
];

export const agentSummary = [
  { agent: "Air Agent", evaluations: 32, score: "94%", trend: "+5%" },
  { agent: "Hotel Agent", evaluations: 26, score: "92%", trend: "+3%" },
  { agent: "ETS Agent", evaluations: 24, score: "91%", trend: "+4%" },
  { agent: "Visa Agent", evaluations: 22, score: "86%", trend: "Coach" },
];


export const qualityGoals = [
  {
    label: "Overall Quality Score",
    current: "87.6%",
    target: "90%",
    progress: 87.6,
    status: "On Track",
    tone: "good",
  },
  {
    label: "Documentation Accuracy",
    current: "74%",
    target: "88%",
    progress: 74,
    status: "Needs Attention",
    tone: "risk",
  },
  {
    label: "Follow-up Ownership",
    current: "75%",
    target: "90%",
    progress: 75,
    status: "Watch",
    tone: "watch",
  },
  {
    label: "Calibration Alignment",
    current: "92.4%",
    target: "90%",
    progress: 92.4,
    status: "On Track",
    tone: "good",
  },
];

export const qualityAlertSummary = {
  label: "Critical Issues",
  value: "23",
  helper: "Requires coaching",
};

export const monitoringAlerts = [
  {
    label: "Low-score interaction detected",
    description: "VisaOps calls below quality threshold need review.",
    count: 6,
    severity: "High",
    tone: "risk",
    route: "/tickets",
  },
  {
    label: "Hold-time compliance below target",
    description: "Refund queue hold-time pattern is trending down.",
    count: 9,
    severity: "Medium",
    tone: "watch",
    route: "/tickets",
  },
  {
    label: "Documentation gap recurring",
    description: "Missing next-step notes across recent travel requests.",
    count: 14,
    severity: "Medium",
    tone: "watch",
    route: "/tickets",
  },
  {
    label: "Coaching review pending",
    description: "Manager acknowledgement pending for flagged agents.",
    count: 4,
    severity: "Review",
    tone: "neutral",
    route: "/tickets",
  },
];

export const coachingSummary = [
  {
    label: "Evaluations pending",
    value: "212",
    helper: "Awaiting QA completion",
    tone: "watch",
  },
  {
    label: "Coaching sessions due",
    value: "18",
    helper: "Scheduled this cycle",
    tone: "risk",
  },
  {
    label: "Calibration reviews",
    value: "9",
    helper: "Manager alignment checks",
    tone: "good",
  },
  {
    label: "Agents requiring follow-up",
    value: "7",
    helper: "Focused quality support",
    tone: "neutral",
  },
];
