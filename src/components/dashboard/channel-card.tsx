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

export function ChannelCard({ channel }: { channel: ChannelSummary }) {
  const isPositive = channel.pl >= 0;

  return (
    <div
      className="relative rounded-2xl overflow-hidden animate-slide-up"
      style={{
        background: "linear-gradient(145deg, rgba(14,14,36,0.9), rgba(6,6,16,0.95))",
        border: `1px solid ${channel.color}20`,
        boxShadow: `0 4px 20px rgba(0,0,0,0.4), 0 8px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)`,
      }}
    >
      {/* Top accent border */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${channel.color}, transparent)`,
        }}
      />

      {/* Corner glow */}
      <div
        className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ background: channel.color }}
      />

      {/* Header */}
      <div className="relative z-10 p-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{
                backgroundColor: channel.color,
                boxShadow: `0 0 10px ${channel.color}50`,
              }}
            />
            <h3 className="text-sm font-semibold text-white/90">
              {channel.name}
            </h3>
            {channel.type && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/25 uppercase tracking-wider">
                {channel.type}
              </span>
            )}
          </div>
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-lg"
            style={{
              background: isPositive
                ? "rgba(0,255,136,0.08)"
                : "rgba(255,51,102,0.08)",
            }}
          >
            {isPositive ? (
              <TrendingUp className="w-3.5 h-3.5 text-gain" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-loss" />
            )}
            <span
              className={`text-xs font-mono font-bold ${isPositive ? "text-gain" : "text-loss"}`}
            >
              {isPositive ? "+" : ""}
              {channel.roi.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <div className="text-[10px] text-white/30 uppercase tracking-wider font-medium">
              Invested
            </div>
            <div className="text-xs font-bold text-white/70 font-mono mt-0.5">
              {formatCurrency(channel.initialInvestment)}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-white/30 uppercase tracking-wider font-medium">
              Current
            </div>
            <div
              className="text-xs font-bold font-mono mt-0.5"
              style={{
                color: channel.color,
                textShadow: `0 0 8px ${channel.color}30`,
              }}
            >
              {formatCurrency(channel.currentValue)}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-white/30 uppercase tracking-wider font-medium">
              P/L
            </div>
            <div
              className={`text-xs font-bold font-mono mt-0.5 ${isPositive ? "text-gain" : "text-loss"}`}
            >
              {isPositive ? "+" : ""}
              {formatCurrency(channel.pl)}
            </div>
          </div>
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
