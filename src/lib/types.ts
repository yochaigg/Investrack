/* ── Raw row coming from Google Sheets ── */
export interface SheetRow {
  user_id: string;
  channel_name: string;
  date: string; // ISO or any parseable date string
  event_label: string;
  invested_amount: number;
  portfolio_value: number;
  note: string;
  marker_title?: string;
  point_description?: string;
  color?: string;
  channel_type?: string;
}

/* ── Normalised data point used by charts ── */
export interface DataPoint {
  date: string; // ISO
  timestamp: number;
  investedAmount: number;
  portfolioValue: number;
  eventLabel: string;
  note: string;
  markerTitle?: string;
  pointDescription?: string;
  isMarker: boolean;
}

/* ── Per-channel summary ── */
export interface ChannelSummary {
  name: string;
  type: string;
  color: string;
  initialInvestment: number;
  currentValue: number;
  pl: number;
  roi: number;
  points: DataPoint[];
}

/* ── Portfolio-level aggregated point ── */
export interface PortfolioPoint {
  date: string;
  timestamp: number;
  totalValue: number;
  totalInvested: number;
  pl: number;
  channels: { name: string; value: number }[];
  eventLabel?: string;
  note?: string;
  isMarker: boolean;
}

/* ── Full dashboard payload ── */
export interface DashboardData {
  totalInvested: number;
  currentValue: number;
  totalPL: number;
  totalROI: number;
  activeChannels: number;
  firstDate: string;
  lastDate: string;
  portfolioSeries: PortfolioPoint[];
  channels: ChannelSummary[];
}

/* ── Filter state ── */
export interface FilterState {
  dateRange: "1m" | "3m" | "6m" | "1y" | "all";
  selectedChannels: string[];
}
