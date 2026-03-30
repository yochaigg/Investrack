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
    <div className="glass rounded-2xl overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{
                backgroundColor: channel.color,
                boxShadow: `0 0 8px ${channel.color}40`,
              }}
            />
            <h3 className="text-sm font-semibold text-white/90">
              {channel.name}
            </h3>
          </div>
          <div className="flex items-center gap-1">
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
            <div className="text-[10px] text-white/30 uppercase tracking-wider">
              Invested
            </div>
            <div className="text-xs font-semibold text-white/70 font-mono mt-0.5">
              {formatCurrency(channel.initialInvestment)}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-white/30 uppercase tracking-wider">
              Current
            </div>
            <div
              className="text-xs font-semibold font-mono mt-0.5"
              style={{ color: channel.color }}
            >
              {formatCurrency(channel.currentValue)}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-white/30 uppercase tracking-wider">
              P/L
            </div>
            <div
              className={`text-xs font-semibold font-mono mt-0.5 ${isPositive ? "text-gain" : "text-loss"}`}
            >
              {isPositive ? "+" : ""}
              {formatCurrency(channel.pl)}
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="px-2 pb-3">
        <ChannelChart
          data={channel.points}
          color={channel.color}
          name={channel.name}
        />
      </div>
    </div>
  );
}
