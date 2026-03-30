"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceDot,
} from "recharts";
import { format } from "date-fns";
import type { DataPoint } from "@/lib/types";

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
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
      {d.pointDescription && (
        <div className="text-[10px] text-white/40 mt-0.5">
          {d.pointDescription}
        </div>
      )}
    </div>
  );
}

function MarkerDot({
  cx = 0,
  cy = 0,
  color,
}: {
  cx?: number;
  cy?: number;
  color: string;
}) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={7} fill={`${color}20`} />
      <circle
        cx={cx}
        cy={cy}
        r={3.5}
        fill={color}
        stroke="#06060f"
        strokeWidth={2}
      />
    </g>
  );
}

interface ChannelChartProps {
  data: DataPoint[];
  color: string;
  name: string;
}

export function ChannelChart({ data, color, name }: ChannelChartProps) {
  const markers = data.filter((d) => d.isMarker);
  const gradId = `grad-${name.replace(/\s/g, "-")}`;

  return (
    <div className="h-[200px] sm:h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(v) => format(new Date(v), "MMM yy")}
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
            domain={["dataMin * 0.95", "dataMax * 1.05"]}
          />
          <Tooltip content={<CustomTooltip color={color} />} />
          <Area
            type="monotone"
            dataKey="portfolioValue"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradId})`}
            dot={false}
            activeDot={{
              r: 4,
              fill: color,
              stroke: "#06060f",
              strokeWidth: 2,
            }}
          />
          {markers.map((m, i) => (
            <ReferenceDot
              key={i}
              x={m.date}
              y={m.portfolioValue}
              shape={<MarkerDot color={color} />}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
