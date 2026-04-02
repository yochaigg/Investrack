import { parse, isValid, format } from "date-fns";
import type {
  SheetRow,
  DataPoint,
  ChannelSummary,
  PortfolioPoint,
  DashboardData,
} from "./types";

const CHANNEL_COLORS = [
  "#00f0ff", // cyan
  "#8b5cf6", // purple
  "#00ff88", // green
  "#f59e0b", // amber
  "#ec4899", // pink
  "#3b82f6", // blue
  "#ef4444", // red
  "#14b8a6", // teal
];

function parseDate(raw: string): Date {
  // For slash-separated dates (e.g. "01/04/2026"), always try DD/MM/YYYY first
  // before falling back to new Date() which assumes MM/DD/YYYY in en-US
  for (const fmt of ["dd/MM/yyyy", "yyyy-MM-dd", "dd-MM-yyyy", "MM/dd/yyyy"]) {
    const d = parse(raw, fmt, new Date());
    if (isValid(d)) return d;
  }

  // ISO strings like "2026-04-01" or full timestamps
  const iso = new Date(raw);
  if (isValid(iso) && !isNaN(iso.getTime())) return iso;

  return new Date(NaN);
}

function toDataPoint(row: SheetRow): DataPoint {
  const d = parseDate(row.date);
  return {
    date: isValid(d) ? format(d, "yyyy-MM-dd") : row.date,
    timestamp: isValid(d) ? d.getTime() : 0,
    investedAmount: row.invested_amount,
    portfolioValue: row.portfolio_value,
    eventLabel: row.event_label,
    note: row.note,
    markerTitle: row.marker_title,
    pointDescription: row.point_description,
    isMarker: !!row.marker_title,
  };
}

export function transformData(rows: SheetRow[]): DashboardData {
  if (rows.length === 0) {
    return {
      totalInvested: 0,
      currentValue: 0,
      totalPL: 0,
      totalROI: 0,
      activeChannels: 0,
      firstDate: "",
      lastDate: "",
      portfolioSeries: [],
      channels: [],
    };
  }

  // Group by channel
  const channelMap = new Map<string, { rows: SheetRow[]; color: string; type: string }>();
  let colorIdx = 0;

  for (const row of rows) {
    const key = row.channel_name;
    if (!channelMap.has(key)) {
      channelMap.set(key, {
        rows: [],
        color: row.color || CHANNEL_COLORS[colorIdx++ % CHANNEL_COLORS.length],
        type: row.channel_type || "investment",
      });
    }
    channelMap.get(key)!.rows.push(row);
  }

  // Build channel summaries
  const channels: ChannelSummary[] = [];
  for (const [name, { rows: chRows, color, type }] of channelMap) {
    const points = chRows.map(toDataPoint).sort((a, b) => a.timestamp - b.timestamp);
    const initial = points[0]?.investedAmount ?? 0;
    const current = points[points.length - 1]?.portfolioValue ?? 0;
    const pl = current - initial;
    const roi = initial > 0 ? (pl / initial) * 100 : 0;

    channels.push({ name, type, color, initialInvestment: initial, currentValue: current, pl, roi, points });
  }

  // Portfolio series: aggregate by unique date across all channels
  const dateMap = new Map<string, { invested: number; value: number; channels: { name: string; value: number }[]; eventLabel?: string; note?: string; isMarker: boolean }>();

  // Get all unique dates and sort
  const allPoints = channels.flatMap((ch) =>
    ch.points.map((p) => ({ ...p, channelName: ch.name }))
  );
  const uniqueDates = [...new Set(allPoints.map((p) => p.date))].sort();

  // For each date, sum the latest known value per channel
  const latestPerChannel = new Map<string, { invested: number; value: number }>();

  for (const date of uniqueDates) {
    // Update latest values for channels that have data on this date
    const datePoints = allPoints.filter((p) => p.date === date);
    for (const p of datePoints) {
      latestPerChannel.set(p.channelName, { invested: p.investedAmount, value: p.portfolioValue });
    }

    let totalInvested = 0;
    let totalValue = 0;
    const chBreakdown: { name: string; value: number }[] = [];

    for (const [name, { invested, value }] of latestPerChannel) {
      totalInvested += invested;
      totalValue += value;
      chBreakdown.push({ name, value });
    }

    const marker = datePoints.find((p) => p.isMarker);
    const event = datePoints.find((p) => p.eventLabel);

    dateMap.set(date, {
      invested: totalInvested,
      value: totalValue,
      channels: chBreakdown,
      eventLabel: event?.eventLabel,
      note: event?.note,
      isMarker: !!marker,
    });
  }

  const portfolioSeries: PortfolioPoint[] = [];
  for (const [date, d] of dateMap) {
    const ts = parseDate(date).getTime();
    portfolioSeries.push({
      date,
      timestamp: ts,
      totalValue: d.value,
      totalInvested: d.invested,
      pl: d.value - d.invested,
      channels: d.channels,
      eventLabel: d.eventLabel,
      note: d.note,
      isMarker: d.isMarker,
    });
  }
  portfolioSeries.sort((a, b) => a.timestamp - b.timestamp);

  const totalInvested = channels.reduce((s, c) => s + c.initialInvestment, 0);
  const currentValue = channels.reduce((s, c) => s + c.currentValue, 0);
  const totalPL = currentValue - totalInvested;
  const totalROI = totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0;

  return {
    totalInvested,
    currentValue,
    totalPL,
    totalROI,
    activeChannels: channels.length,
    firstDate: portfolioSeries[0]?.date ?? "",
    lastDate: portfolioSeries[portfolioSeries.length - 1]?.date ?? "",
    portfolioSeries,
    channels,
  };
}
