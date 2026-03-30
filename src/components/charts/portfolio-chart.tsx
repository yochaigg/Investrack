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
import type { PortfolioPoint } from "@/lib/types";

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: PortfolioPoint }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const isPositive = d.pl >= 0;

  return (
    <div className="chart-tooltip">
      <div className="text-[11px] text-white/50 mb-1.5">
        {format(new Date(d.date), "MMM dd, yyyy")}
      </div>
      <div className="text-sm font-bold text-white">
        ${d.totalValue.toLocaleString()}
      </div>
      <div className="text-xs mt-1">
        <span className="text-white/40">Invested: </span>
        <span className="text-white/70">${d.totalInvested.toLocaleString()}</span>
      </div>
      <div className="text-xs">
        <span className="text-white/40">P/L: </span>
        <span className={isPositive ? "text-gain" : "text-loss"}>
          {isPositive ? "+" : ""}${d.pl.toLocaleString()}
        </span>
      </div>
      {d.eventLabel && (
        <div className="text-xs mt-1.5 pt-1.5 border-t border-white/10 text-neon-cyan">
          {d.eventLabel}
        </div>
      )}
      {d.note && (
        <div className="text-[10px] text-white/40 mt-0.5">{d.note}</div>
      )}
      {d.channels.length > 1 && (
        <div className="mt-1.5 pt-1.5 border-t border-white/10 space-y-0.5">
          {d.channels.map((ch) => (
            <div key={ch.name} className="text-[10px] text-white/40">
              {ch.name}: ${ch.value.toLocaleString()}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MarkerDot(props: { cx?: number; cy?: number }) {
  const { cx = 0, cy = 0 } = props;
  return (
    <g>
      <circle cx={cx} cy={cy} r={8} fill="rgba(0,240,255,0.15)" />
      <circle cx={cx} cy={cy} r={4} fill="#00f0ff" stroke="#06060f" strokeWidth={2} />
    </g>
  );
}

export function PortfolioChart({ data }: { data: PortfolioPoint[] }) {
  const markers = data.filter((d) => d.isMarker);

  return (
    <div className="glass rounded-2xl p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-white/80">
          Total Portfolio
        </h2>
        {data.length > 0 && (
          <span className="text-xs text-white/30 font-mono">
            {format(new Date(data[0].date), "MMM yyyy")} —{" "}
            {format(new Date(data[data.length - 1].date), "MMM yyyy")}
          </span>
        )}
      </div>
      <div className="h-[300px] sm:h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00f0ff" stopOpacity={0.3} />
                <stop offset="50%" stopColor="#00f0ff" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#00f0ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(v) => format(new Date(v), "MMM yy")}
              tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }}
              axisLine={false}
              tickLine={false}
              minTickGap={40}
            />
            <YAxis
              tickFormatter={formatCurrency}
              tick={{ fontSize: 11, fill: "rgba(255,255,255,0.3)" }}
              axisLine={false}
              tickLine={false}
              width={55}
              domain={["dataMin * 0.95", "dataMax * 1.05"]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="totalValue"
              stroke="#00f0ff"
              strokeWidth={2}
              fill="url(#portfolioGrad)"
              dot={false}
              activeDot={{ r: 5, fill: "#00f0ff", stroke: "#06060f", strokeWidth: 2 }}
            />
            {markers.map((m, i) => (
              <ReferenceDot
                key={i}
                x={m.date}
                y={m.totalValue}
                shape={<MarkerDot />}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
