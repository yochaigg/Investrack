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

  // Filter out the hidden fill area
  const visible = payload.filter((e) => e.name !== "Total-fill");

  return (
    <div className="chart-tooltip">
      <div className="text-[10px] font-mono text-white/40 mb-2.5 pb-2 border-b border-white/[0.07] tracking-wider uppercase">
        {formatDateLabel(label)}
      </div>
      {visible.map((entry) => (
        <div
          key={entry.name}
          className="flex items-center justify-between gap-5 text-xs py-0.5"
        >
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{
                backgroundColor: entry.color,
                boxShadow: `0 0 6px ${entry.color}80`,
              }}
            />
            <span className="text-white/50 font-mono text-[11px]">{entry.name}</span>
          </div>
          <span
            className="font-mono font-bold text-[12px]"
            style={{ color: entry.color, textShadow: `0 0 8px ${entry.color}50` }}
          >
            {formatCurrency(entry.value)}
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
  const lastPoint = data[data.length - 1];
  const isPositive = totalROI >= 0;

  return (
    <div className="relative glass rounded-2xl p-4 sm:p-6">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[70%] h-[50%] bg-neon-cyan/[0.025] rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-mono text-neon-cyan/50 tracking-[0.2em] uppercase">Total Portfolio</span>
            </div>
            <div className="flex items-baseline gap-3">
              {lastPoint && (
                <span className="text-2xl sm:text-3xl font-bold font-mono text-neon-cyan text-glow-cyan tracking-tight">
                  {formatCurrency(lastPoint.totalValue)}
                </span>
              )}
              <span
                className={`text-sm font-mono font-bold px-2 py-0.5 rounded ${
                  isPositive
                    ? "text-gain bg-gain/10 text-glow-green"
                    : "text-loss bg-loss/10 text-glow-loss"
                }`}
              >
                {isPositive ? "+" : ""}
                {totalROI.toFixed(2)}%
              </span>
            </div>
            {firstPoint && (
              <div className="flex items-center gap-3 mt-1.5 text-[11px] font-mono text-white/30">
                <span>invested {formatCurrency(firstPoint.totalInvested)}</span>
                {lastPoint && (
                  <span className={isPositive ? "text-gain/60" : "text-loss/60"}>
                    {isPositive ? "+" : ""}
                    {formatCurrency(lastPoint.totalValue - firstPoint.totalInvested)}
                  </span>
                )}
              </div>
            )}
          </div>

          {data.length > 1 && (
            <div className="text-[10px] text-white/25 font-mono tracking-wide sm:text-right">
              <div>{formatDateLabel(data[0].date)}</div>
              <div className="text-white/15">→</div>
              <div>{formatDateLabel(data[data.length - 1].date)}</div>
            </div>
          )}
        </div>

        {/* Chart */}
        <div className="h-[340px] sm:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 16, right: 12, left: 0, bottom: 4 }}
            >
              <defs>
                <linearGradient id="totalFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00f0ff" stopOpacity={0.18} />
                  <stop offset="45%" stopColor="#00f0ff" stopOpacity={0.06} />
                  <stop offset="100%" stopColor="#00f0ff" stopOpacity={0} />
                </linearGradient>
                <filter id="glowLine" x="-20%" y="-100%" width="140%" height="300%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="glowSoft" x="-20%" y="-100%" width="140%" height="300%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="rgba(255,255,255,0.035)"
              />
              <XAxis
                dataKey="date"
                tickFormatter={formatDateLabel}
                tick={{ fontSize: 10, fill: "rgba(255,255,255,0.25)", fontFamily: "JetBrains Mono, monospace" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatCurrency}
                tick={{ fontSize: 10, fill: "rgba(255,255,255,0.25)", fontFamily: "JetBrains Mono, monospace" }}
                axisLine={false}
                tickLine={false}
                width={58}
                domain={["dataMin * 0.88", "dataMax * 1.08"]}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ stroke: "rgba(0,240,255,0.25)", strokeWidth: 1, strokeDasharray: "4 3" }}
              />
              <Legend
                iconType="circle"
                iconSize={7}
                wrapperStyle={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.45)",
                  paddingTop: 16,
                  fontFamily: "JetBrains Mono, monospace",
                }}
                formatter={(value) => value === "Total-fill" ? null : value}
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

              {/* Total line — bright glowing */}
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
                  r: 9,
                  fill: TOTAL_COLOR,
                  stroke: "#03030a",
                  strokeWidth: 2,
                }}
                filter="url(#glowLine)"
              />

              {/* Channel lines — dashed */}
              {channels.map((ch) => (
                <Line
                  key={ch.name}
                  name={ch.name}
                  type="monotone"
                  dataKey={ch.name}
                  stroke={ch.color}
                  strokeWidth={2}
                  strokeDasharray="5 3"
                  dot={{
                    r: 4,
                    fill: ch.color,
                    stroke: "#04040c",
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 7,
                    fill: ch.color,
                    stroke: "#04040c",
                    strokeWidth: 2,
                    filter: `drop-shadow(0 0 8px ${ch.color})`,
                  }}
                  filter="url(#glowSoft)"
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
