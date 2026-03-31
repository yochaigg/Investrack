"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { format, isValid } from "date-fns";
import type { PortfolioPoint, ChannelSummary } from "@/lib/types";

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function formatDateLabel(v: string): string {
  const d = new Date(v);
  return isValid(d) ? format(d, "MMM dd") : v;
}

/* Build flat data: { date, Total, Stock, Crypto, ... } */
function buildChartData(
  portfolioSeries: PortfolioPoint[],
  channels: ChannelSummary[]
): Record<string, string | number>[] {
  const allDates = new Set<string>();
  portfolioSeries.forEach((p) => allDates.add(p.date));
  channels.forEach((ch) => ch.points.forEach((p) => allDates.add(p.date)));

  const sorted = [...allDates].sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  const chLookup = new Map<string, Map<string, number>>();
  for (const ch of channels) {
    const m = new Map<string, number>();
    ch.points.forEach((p) => m.set(p.date, p.portfolioValue));
    chLookup.set(ch.name, m);
  }

  const totalLookup = new Map<string, number>();
  portfolioSeries.forEach((p) => totalLookup.set(p.date, p.totalValue));

  return sorted.map((date) => {
    const row: Record<string, string | number> = { date };
    row["Total"] = totalLookup.get(date) ?? 0;
    for (const ch of channels) {
      const val = chLookup.get(ch.name)?.get(date);
      if (val !== undefined) row[ch.name] = val;
    }
    return row;
  });
}

/* Tooltip */
function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length || !label) return null;

  return (
    <div className="chart-tooltip">
      <div className="text-[11px] text-white/50 mb-2">
        {formatDateLabel(label)}
      </div>
      {payload.map((entry) => (
        <div
          key={entry.name}
          className="flex items-center justify-between gap-4 text-xs"
        >
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-white/60">{entry.name}</span>
          </div>
          <span
            className="font-mono font-bold"
            style={{ color: entry.color }}
          >
            ${entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

const TOTAL_COLOR = "#00f0ff";

interface Props {
  data: PortfolioPoint[];
  channels: ChannelSummary[];
  totalROI?: number;
}

export function PortfolioChart({ data, channels, totalROI = 0 }: Props) {
  const chartData = buildChartData(data, channels);
  const firstPoint = data[0];

  return (
    <div className="relative glass rounded-2xl p-4 sm:p-6">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[60%] h-[40%] bg-neon-cyan/[0.03] rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white/80 tracking-tight">
            Total Portfolio Performance
          </h2>
          {data.length > 1 && (
            <span className="text-xs text-white/30 font-mono">
              {formatDateLabel(data[0].date)} —{" "}
              {formatDateLabel(data[data.length - 1].date)}
            </span>
          )}
        </div>

        {firstPoint && (
          <div className="flex items-center gap-4 mb-3 text-[10px] font-mono text-white/40">
            <span>Initial: ${firstPoint.totalInvested.toLocaleString()}</span>
            <span>
              Current: ${data[data.length - 1]?.totalValue.toLocaleString()}
            </span>
            <span className={totalROI >= 0 ? "text-gain" : "text-loss"}>
              {totalROI >= 0 ? "+" : ""}
              {totalROI.toFixed(1)}% ROI
            </span>
          </div>
        )}

        <div className="h-[340px] sm:h-[420px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 20, right: 12, left: 0, bottom: 4 }}
            >
              <defs>
                <linearGradient id="totalFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00f0ff" stopOpacity={0.2} />
                  <stop offset="40%" stopColor="#00f0ff" stopOpacity={0.08} />
                  <stop offset="100%" stopColor="#00f0ff" stopOpacity={0} />
                </linearGradient>
                <filter id="glowLine">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="rgba(255,255,255,0.04)"
              />
              <XAxis
                dataKey="date"
                tickFormatter={formatDateLabel}
                tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatCurrency}
                tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }}
                axisLine={false}
                tickLine={false}
                width={55}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ stroke: "rgba(0,240,255,0.2)", strokeWidth: 1, strokeDasharray: "4 3" }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11, color: "rgba(255,255,255,0.5)", paddingTop: 12 }}
              />

              {/* Total gradient fill */}
              <Area
                name="Total-fill"
                type="monotone"
                dataKey="Total"
                fill="url(#totalFill)"
                stroke="none"
                legendType="none"
              />

              {/* Total line — solid, bright, glowing */}
              <Line
                name="Total"
                type="monotone"
                dataKey="Total"
                stroke={TOTAL_COLOR}
                strokeWidth={3}
                dot={{
                  r: 5,
                  fill: TOTAL_COLOR,
                  stroke: "#03030a",
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 8,
                  fill: TOTAL_COLOR,
                  stroke: "#03030a",
                  strokeWidth: 2,
                }}
                filter="url(#glowLine)"
              />

              {/* One line per channel — dashed, distinct colors */}
              {channels.map((ch) => (
                <Line
                  key={ch.name}
                  name={ch.name}
                  type="monotone"
                  dataKey={ch.name}
                  stroke={ch.color}
                  strokeWidth={2}
                  strokeDasharray="6 3"
                  dot={{
                    r: 4,
                    fill: ch.color,
                    stroke: "#04040c",
                    strokeWidth: 2,
                    filter: `drop-shadow(0 0 4px ${ch.color}80)`,
                  }}
                  activeDot={{
                    r: 7,
                    fill: ch.color,
                    stroke: "#04040c",
                    strokeWidth: 2,
                    filter: `drop-shadow(0 0 10px ${ch.color})`,
                  }}
                  connectNulls
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
