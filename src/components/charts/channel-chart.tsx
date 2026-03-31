"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { format } from "date-fns";
import type { DataPoint } from "@/lib/types";

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n.toFixed(0)}`;
}

function CustomTooltip({
  active,
  payload,
  color,
}: {
  active?: boolean;
  payload?: Array<{ payload: DataPoint }>;
  color: string;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const pl = d.portfolioValue - d.investedAmount;
  const isPositive = pl >= 0;

  return (
    <div className="chart-tooltip">
      <div className="text-[11px] text-white/50 mb-1.5">
        {format(new Date(d.date), "MMM dd, yyyy")}
      </div>
      <div className="text-sm font-bold" style={{ color }}>
        ${d.portfolioValue.toLocaleString()}
      </div>
      <div className="text-xs mt-1">
        <span className="text-white/40">Invested: </span>
        <span className="text-white/70">
          ${d.investedAmount.toLocaleString()}
        </span>
      </div>
      <div className="text-xs">
        <span className="text-white/40">P/L: </span>
        <span className={isPositive ? "text-gain" : "text-loss"}>
          {isPositive ? "+" : ""}${pl.toLocaleString()}
        </span>
      </div>
      {d.eventLabel && (
        <div
          className="text-xs mt-1.5 pt-1.5 border-t border-white/10"
          style={{ color }}
        >
          {d.eventLabel}
        </div>
      )}
      {d.note && (
        <div className="text-[10px] text-white/40 mt-0.5">{d.note}</div>
      )}
    </div>
  );
}

/* Dot on every date point with value label */
function DateDot({
  cx = 0,
  cy = 0,
  payload,
  color,
}: {
  cx?: number;
  cy?: number;
  payload?: DataPoint;
  color: string;
}) {
  if (!payload) return null;

  return (
    <g>
      <circle cx={cx} cy={cy} r={7} fill={`${color}15`} />
      <circle
        cx={cx}
        cy={cy}
        r={3.5}
        fill={color}
        stroke="#06060f"
        strokeWidth={2}
      />
      {/* Value label */}
      <text
        x={cx}
        y={cy - 12}
        textAnchor="middle"
        fill={color}
        fontSize={9}
        fontWeight={700}
        fontFamily="Inter, system-ui, sans-serif"
      >
        {formatCompact(payload.portfolioValue)}
      </text>
    </g>
  );
}

interface ChannelChartProps {
  data: DataPoint[];
  color: string;
  name: string;
}

export function ChannelChart({ data, color, name }: ChannelChartProps) {
  const glowId = `glow-${name.replace(/\s+/g, "-")}`;

  return (
    <div className="h-[200px] sm:h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 24, right: 8, left: 0, bottom: 0 }}
        >
          <defs>
            <filter id={glowId}>
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="rgba(255,255,255,0.03)"
          />
          <XAxis
            dataKey="date"
            tickFormatter={(v) => format(new Date(v), "MMM dd")}
            tick={{ fontSize: 10, fill: "rgba(255,255,255,0.25)" }}
            axisLine={false}
            tickLine={false}
            minTickGap={30}
          />
          <YAxis
            tickFormatter={formatCurrency}
            tick={{ fontSize: 10, fill: "rgba(255,255,255,0.25)" }}
            axisLine={false}
            tickLine={false}
            width={48}
            domain={["dataMin * 0.85", "dataMax * 1.15"]}
          />
          <Tooltip
            content={<CustomTooltip color={color} />}
            cursor={{ stroke: `${color}30`, strokeWidth: 1, strokeDasharray: "4 3" }}
          />
          {/* Main line with glowing dots on every date */}
          <Line
            type="monotone"
            dataKey="portfolioValue"
            stroke={color}
            strokeWidth={2.5}
            dot={<DateDot color={color} />}
            activeDot={{
              r: 7,
              fill: color,
              stroke: "#06060f",
              strokeWidth: 2,
            }}
            filter={`url(#${glowId})`}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
