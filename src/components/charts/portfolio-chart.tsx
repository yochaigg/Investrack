"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
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

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n.toFixed(0)}`;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: PortfolioPoint }>;
}) {
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
        <span className="text-white/70">
          ${d.totalInvested.toLocaleString()}
        </span>
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

/* Dot rendered at every data point on the line */
function DateDot(props: {
  cx?: number;
  cy?: number;
  index?: number;
  payload?: PortfolioPoint;
}) {
  const { cx = 0, cy = 0, payload } = props;
  if (!payload) return null;

  return (
    <g>
      <circle cx={cx} cy={cy} r={8} fill="rgba(0,240,255,0.1)" />
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill="#00f0ff"
        stroke="#06060f"
        strokeWidth={2}
      />
      {/* Value label above dot */}
      <text
        x={cx}
        y={cy - 14}
        textAnchor="middle"
        fill="#00f0ff"
        fontSize={10}
        fontWeight={700}
        fontFamily="Inter, system-ui, sans-serif"
      >
        {formatCompact(payload.totalValue)}
      </text>
    </g>
  );
}

/* End-value callout annotation box */
function EndValueAnnotation(props: {
  cx?: number;
  cy?: number;
  payload?: PortfolioPoint;
  totalROI?: number;
}) {
  const { cx = 0, cy = 0, payload, totalROI = 0 } = props;
  if (!payload) return null;

  const isPositive = payload.pl >= 0;
  const boxW = 160;
  const boxH = 42;
  const boxX = cx - boxW - 16;
  const boxY = cy - boxH / 2;

  return (
    <g>
      {/* Connector line */}
      <line
        x1={cx - 6}
        y1={cy}
        x2={boxX + boxW}
        y2={cy}
        stroke="rgba(0,240,255,0.3)"
        strokeWidth={1}
        strokeDasharray="3 2"
      />
      {/* Box background */}
      <rect
        x={boxX}
        y={boxY}
        width={boxW}
        height={boxH}
        rx={8}
        fill="rgba(6,6,15,0.85)"
        stroke="rgba(0,240,255,0.25)"
        strokeWidth={1}
      />
      {/* Value */}
      <text
        x={boxX + 10}
        y={boxY + 17}
        fill="#ffffff"
        fontSize={12}
        fontWeight={700}
        fontFamily="Inter, system-ui, sans-serif"
      >
        End Value: ${payload.totalValue.toLocaleString()}
      </text>
      {/* ROI line */}
      <text
        x={boxX + 10}
        y={boxY + 33}
        fill={isPositive ? "#00ff88" : "#ff3366"}
        fontSize={10}
        fontWeight={600}
        fontFamily="Inter, system-ui, sans-serif"
      >
        {isPositive ? "+" : ""}
        {totalROI.toFixed(0)}% return
      </text>
    </g>
  );
}

interface PortfolioChartProps {
  data: PortfolioPoint[];
  totalROI?: number;
}

export function PortfolioChart({ data, totalROI = 0 }: PortfolioChartProps) {
  const lastPoint = data[data.length - 1];
  const firstPoint = data[0];

  return (
    <div className="relative glass rounded-2xl p-4 sm:p-6 overflow-hidden">
      {/* Subtle glow behind chart */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[60%] h-[40%] bg-neon-cyan/[0.03] rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white/80 tracking-tight">
            Total Portfolio Performance
          </h2>
          {data.length > 0 && (
            <span className="text-xs text-white/30 font-mono">
              {format(new Date(data[0].date), "MMM yyyy")} —{" "}
              {format(new Date(data[data.length - 1].date), "MMM yyyy")}
            </span>
          )}
        </div>

        {/* Initial investment legend */}
        {firstPoint && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-[2px] bg-neon-cyan/50 inline-block" />
              <span className="text-[10px] text-white/40 font-mono">
                ${firstPoint.totalInvested.toLocaleString()} | Initial
                Investment
              </span>
            </div>
          </div>
        )}

        <div className="h-[320px] sm:h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 30, right: 20, left: 0, bottom: 0 }}
            >
              <defs>
                <filter id="glow">
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
                tickFormatter={(v) => format(new Date(v), "MMM dd")}
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
                domain={["dataMin * 0.85", "dataMax * 1.15"]}
              />
              <Tooltip content={<CustomTooltip />} />
              {/* Ghost glow line */}
              <Line
                type="monotone"
                dataKey="totalValue"
                stroke="#00f0ff"
                strokeWidth={6}
                strokeOpacity={0.15}
                dot={false}
                activeDot={false}
              />
              {/* Main line with dots on every date point */}
              <Line
                type="monotone"
                dataKey="totalValue"
                stroke="#00f0ff"
                strokeWidth={2.5}
                dot={<DateDot />}
                activeDot={{
                  r: 7,
                  fill: "#00f0ff",
                  stroke: "#06060f",
                  strokeWidth: 2,
                }}
                filter="url(#glow)"
              />
              {/* End value annotation */}
              {lastPoint && data.length > 1 && (
                <ReferenceDot
                  x={lastPoint.date}
                  y={lastPoint.totalValue}
                  shape={
                    <EndValueAnnotation
                      payload={lastPoint}
                      totalROI={totalROI}
                    />
                  }
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
