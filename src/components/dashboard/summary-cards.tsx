"use client";

import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Layers,
  Calendar,
} from "lucide-react";
import type { DashboardData } from "@/lib/types";

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function formatPercent(n: number): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

function formatDate(d: string): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

interface CardDef {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  borderColor: string;
  textColor: string;
  glowColor?: string;
}

export function SummaryCards({ data }: { data: DashboardData }) {
  const isPositive = data.totalPL >= 0;

  const cards: CardDef[] = [
    {
      label: "Initial Investment",
      value: formatCurrency(data.totalInvested),
      sub: "USD",
      icon: <DollarSign className="w-4 h-4" />,
      borderColor: "#3b82f6",
      textColor: "text-blue-400",
    },
    {
      label: "Total Gain",
      value: `${isPositive ? "+" : ""}${formatCurrency(data.totalPL)}`,
      sub: "USD",
      icon: isPositive ? (
        <TrendingUp className="w-4 h-4" />
      ) : (
        <TrendingDown className="w-4 h-4" />
      ),
      borderColor: isPositive ? "#00ff88" : "#ff3366",
      textColor: isPositive ? "text-gain" : "text-loss",
      glowColor: isPositive ? "text-glow-green" : "text-glow-loss",
    },
    {
      label: "Return",
      value: formatPercent(data.totalROI),
      icon: isPositive ? (
        <TrendingUp className="w-4 h-4" />
      ) : (
        <TrendingDown className="w-4 h-4" />
      ),
      borderColor: isPositive ? "#f59e0b" : "#ff3366",
      textColor: isPositive ? "text-amber-400" : "text-loss",
      glowColor: isPositive ? undefined : "text-glow-loss",
    },
    {
      label: "Duration",
      value: `${formatDate(data.firstDate)} — ${formatDate(data.lastDate)}`,
      icon: <Calendar className="w-4 h-4" />,
      borderColor: "#8b5cf6",
      textColor: "text-violet-400",
    },
    {
      label: "Portfolio Value",
      value: formatCurrency(data.currentValue),
      icon: <BarChart3 className="w-4 h-4" />,
      borderColor: "#00f0ff",
      textColor: "text-neon-cyan",
      glowColor: "text-glow-cyan",
    },
    {
      label: "Active Channels",
      value: data.activeChannels.toString(),
      icon: <Layers className="w-4 h-4" />,
      borderColor: "#ec4899",
      textColor: "text-pink-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className="glass relative rounded-xl p-3.5 sm:p-4 animate-slide-up group hover:scale-[1.02] transition-transform duration-300"
          style={{
            animationDelay: `${i * 80}ms`,
            borderColor: `${card.borderColor}25`,
          }}
        >
          {/* Colored top edge glow */}
          <div
            className="absolute top-0 left-[5%] right-[5%] h-[2px] pointer-events-none z-10"
            style={{
              background: `linear-gradient(90deg, transparent, ${card.borderColor}, transparent)`,
              boxShadow: `0 0 12px ${card.borderColor}40, 0 0 24px ${card.borderColor}20`,
            }}
          />
          {/* Large corner glow */}
          <div
            className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-3xl opacity-30 pointer-events-none group-hover:opacity-50 transition-opacity"
            style={{ background: card.borderColor }}
          />

          <div className="relative z-10">
            <div className="flex items-center gap-1.5 mb-2.5">
              <span style={{ color: card.borderColor }} className="opacity-60">
                {card.icon}
              </span>
              <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">
                {card.label}
              </span>
            </div>
            <div
              className={`text-base sm:text-lg font-bold ${card.textColor} ${card.glowColor ?? ""} leading-tight tracking-tight`}
            >
              {card.value}
            </div>
            {card.sub && (
              <div className="text-[10px] mt-0.5 text-white/30 font-medium uppercase tracking-wider">
                {card.sub}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
