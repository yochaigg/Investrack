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
      className="glass relative rounded-2xl animate-slide-up group hover:scale-[1.01] transition-transform duration-300"
      style={{ borderColor: `${channel.color}20` }}
    >
      {/* Colored top edge with glow */}
      <div
        className="absolute top-0 left-[5%] right-[5%] h-[2px] pointer-events-none z-20"
        style={{
          background: `linear-gradient(90deg, transparent, ${channel.color}, transparent)`,
          boxShadow: `0 0 15px ${channel.color}50, 0 0 30px ${channel.color}20`,
        }}
      />

      {/* Corner ambient glow */}
      <div
        className="absolute -top-16 -right-16 w-36 h-36 rounded-full blur-3xl opacity-20 pointer-events-none group-hover:opacity-35 transition-opacity"
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
