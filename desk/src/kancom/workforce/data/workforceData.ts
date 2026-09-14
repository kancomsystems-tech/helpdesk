export const workforceKpis = [
  { label: "Current Workload", value: "128", helper: "Open and pending requests" },
  { label: "Available Capacity", value: "112h", helper: "Agent hours available" },
  { label: "Required Staffing", value: "9.5", helper: "FTE needed today" },
  { label: "Staffing Gap", value: "+1.5", helper: "Capacity above forecast" },
  { label: "Service Level", value: "91%", helper: "20 minute response goal" },
  { label: "Occupancy", value: "87%", helper: "Queue handling load" },
];

export type WorkforceDemandPoint = {
  week: string;
  volume: number;
  capacity: number;
};

export const demandForecast: WorkforceDemandPoint[] = [
  { week: "This week", volume: 14250, capacity: 14800 },
  { week: "Next week", volume: 15840, capacity: 16200 },
  { week: "Week 3", volume: 16420, capacity: 16600 },
  { week: "Week 4", volume: 15760, capacity: 16000 },
];

export const teamLoad = [
  { team: "AirOps", load: 42, capacity: 48, state: "Covered" },
  { team: "HotelOps", load: 31, capacity: 34, state: "Covered" },
  { team: "VisaOps", load: 28, capacity: 24, state: "Tight" },
  { team: "ETS", load: 27, capacity: 30, state: "Covered" },
];

export const rosterActions = [
  "Forecast next four weeks from request arrival pattern",
  "Balance VisaOps coverage for documentation peaks",
  "Keep AirOps surge slot open for airline schedule changes",
];
