export const analyticsKpis = [
  { label: "Total Requests", value: "1,286", trend: "+12% vs yesterday" },
  { label: "Resolved", value: "842", trend: "+15% vs yesterday" },
  { label: "Pending", value: "214", trend: "+8% vs yesterday" },
  { label: "SLA Breached", value: "7", trend: "Needs action" },
  { label: "Avg Response", value: "07m 28s", trend: "Inside target" },
  { label: "Avg Resolution", value: "4h 32m", trend: "Stable" },
];

export const requestTrend = [68, 84, 71, 92, 76, 88, 80, 96, 74, 90, 85, 98];

export const clientPerformance = [
  { name: "Demo Corporate Travel", requests: 286, sla: "91%", trend: "+6%" },
  { name: "Demo MICE Client", requests: 214, sla: "88%", trend: "+4%" },
  { name: "Demo Accounts Desk", requests: 172, sla: "82%", trend: "Watch" },
  { name: "Vendor Desk", requests: 96, sla: "78%", trend: "Review" },
];

export const agentPerformance = [
  { agent: "Air Agent", resolved: 84, response: "06m", sla: "94%" },
  { agent: "Hotel Agent", resolved: 61, response: "09m", sla: "91%" },
  { agent: "Visa Agent", resolved: 38, response: "12m", sla: "86%" },
  { agent: "ETS Agent", resolved: 47, response: "08m", sla: "92%" },
];

export const slaByTeam = [
  { team: "AirOps", score: 93 },
  { team: "HotelOps", score: 90 },
  { team: "VisaOps", score: 78 },
  { team: "ETS", score: 88 },
];
