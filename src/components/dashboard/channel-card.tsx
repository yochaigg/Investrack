"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { ChannelChart } from "@/components/charts/channel-chart";
import type { ChannelSummary } from "@/lib/types";

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

export function ChannelCard({ channel }: { channel: ChannelSummary }) {
  const isPositive = channel.pl >= 0;

  return (
    <div
      className="terminal-card relative rounded-2xl animate-slide-up group hover:scale-[1.01] transition-all duration-300"
      style={{ borderColor: `${channel.color}18` }}
    >
      {/* Colored top edge with glow */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none z-20 rounded-t-2xl"
        style={{
          background: `linear-gradient(90deg, transparent 5%, ${channel.color}90 30%, ${channel.color} 50%, ${channel.color}90 70%, transparent 95%)`,
          boxShadow: `0 0 20px ${channel.color}60, 0 0 40px ${channel.color}20`,
        }}
      />

      {/* Corner ambient glow */}
      <div
        className="absolute -top-20 -right-20 w-44 h-44 rounded-full blur-3xl opacity-15 pointer-events-none group-hover:opacity-30 transition-opacity duration-500"
        style={{ background: channel.color }}
      />
      {/* Bottom left glow */}
      <div
        className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full blur-2xl opacity-08 pointer-events-none"
        style={{ background: channel.color }}
      />

      {/* Header */}
      <div className="relative z-10 p-4 pb-2">
        {/* Top row: name + ROI badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{
                backgroundColor: channel.color,
                boxShadow: `0 0 8px ${channel.color}70, 0 0 16px ${channel.color}30`,
              }}
            />
            <div>
              <h3 className="text-sm font-bold text-white/90 font-mono tracking-tight">
                {channel.name.toUpperCase()}
              </h3>
              {channel.type && (
                <span className="text-[9px] font-mono text-white/25 uppercase tracking-wider">{channel.type}</span>
              )}
            </div>
          </div>

          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg"
            style={{
              background: isPositive ? "rgba(0,255,136,0.08)" : "rgba(255,51,102,0.08)",
              border: `1px solid ${isPositive ? "rgba(0,255,136,0.15)" : "rgba(255,51,102,0.15)"}`,
            }}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3 text-gain" />
            ) : (
              <TrendingDown className="w-3 h-3 text-loss" />
            )}
            <span className={`text-xs font-mono font-bold ${isPositive ? "text-gain" : "text-loss"}`}>
              {isPositive ? "+" : ""}
              {channel.roi.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { tag: "INVESTED", val: formatCompact(channel.initialInvestment), color: "rgba(255,255,255,0.50)" },
            { tag: "CURRENT", val: formatCompact(channel.currentValue), color: channel.color },
            { tag: "P/L", val: `${isPositive ? "+" : ""}${formatCompact(channel.pl)}`, color: isPositive ? "#00ff88" : "#ff3366" },
          ].map(({ tag, val, color }) => (
            <div
              key={tag}
              className="rounded-lg p-2"
              style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.04)" }}
            >
              <div className="text-[8px] font-mono tracking-[0.15em] text-white/25 mb-1">{tag}</div>
              <div
                className="text-xs font-bold font-mono"
                style={{
                  color,
                  textShadow: color !== "rgba(255,255,255,0.50)" ? `0 0 8px ${color}40` : "none",
                }}
              >
                {val}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="relative z-10 px-2 pb-3">
        <ChannelChart
          data={channel.points}
          color={channel.color}
          name={channel.name}
        />
      </div>
    </div>
  );
}
