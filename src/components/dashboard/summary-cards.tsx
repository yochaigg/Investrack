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
  accentColor: string;
  textColor: string;
  glowClass?: string;
  tag?: string;
}

export function SummaryCards({ data }: { data: DashboardData }) {
  const isPositive = data.totalPL >= 0;

  const cards: CardDef[] = [
    {
      label: "Portfolio Value",
      value: formatCurrency(data.currentValue),
      sub: "USD",
      icon: <BarChart3 className="w-3.5 h-3.5" />,
      accentColor: "#00f0ff",
      textColor: "text-neon-cyan",
      glowClass: "text-glow-cyan",
      tag: "TOTAL",
    },
    {
      label: "Total Invested",
      value: formatCurrency(data.totalInvested),
      sub: "USD",
      icon: <DollarSign className="w-3.5 h-3.5" />,
      accentColor: "#3b82f6",
      textColor: "text-blue-400",
      tag: "CAPITAL",
    },
    {
      label: "Total P/L",
      value: `${isPositive ? "+" : ""}${formatCurrency(data.totalPL)}`,
      sub: "USD",
      icon: isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />,
      accentColor: isPositive ? "#00ff88" : "#ff3366",
      textColor: isPositive ? "text-gain" : "text-loss",
      glowClass: isPositive ? "text-glow-green" : "text-glow-loss",
      tag: "PROFIT/LOSS",
    },
    {
      label: "Total Return",
      value: formatPercent(data.totalROI),
      icon: isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />,
      accentColor: isPositive ? "#f59e0b" : "#ff3366",
      textColor: isPositive ? "text-amber-400" : "text-loss",
      glowClass: isPositive ? "text-glow-amber" : "text-glow-loss",
      tag: "ROI",
    },
    {
      label: "Active Channels",
      value: data.activeChannels.toString(),
      icon: <Layers className="w-3.5 h-3.5" />,
      accentColor: "#ec4899",
      textColor: "text-pink-400",
      tag: "ASSETS",
    },
    {
      label: "Period",
      value: `${formatDate(data.firstDate)}`,
      sub: `→ ${formatDate(data.lastDate)}`,
      icon: <Calendar className="w-3.5 h-3.5" />,
      accentColor: "#8b5cf6",
      textColor: "text-violet-400",
      tag: "RANGE",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className="terminal-card relative rounded-xl p-3.5 animate-slide-up group hover:scale-[1.025] transition-all duration-300 cursor-default"
          style={{
            animationDelay: `${i * 70}ms`,
            borderColor: `${card.accentColor}20`,
          }}
        >
          {/* Colored top edge glow */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none z-10 rounded-t-xl"
            style={{
              background: `linear-gradient(90deg, transparent, ${card.accentColor}90, transparent)`,
              boxShadow: `0 0 16px ${card.accentColor}50, 0 0 32px ${card.accentColor}20`,
            }}
          />
          {/* Corner ambient glow */}
          <div
            className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-3xl opacity-25 pointer-events-none group-hover:opacity-45 transition-opacity duration-500"
            style={{ background: card.accentColor }}
          />

          <div className="relative z-10">
            {/* Tag label */}
            <div
              className="text-[8px] font-mono font-bold tracking-[0.2em] mb-2 opacity-50"
              style={{ color: card.accentColor }}
            >
              {card.tag ?? card.label.toUpperCase()}
            </div>

            {/* Icon + label row */}
            <div className="flex items-center gap-1.5 mb-1.5">
              <span style={{ color: card.accentColor }} className="opacity-70">
                {card.icon}
              </span>
              <span className="text-[10px] font-medium text-white/35 tracking-tight truncate">
                {card.label}
              </span>
            </div>

            {/* Main value */}
            <div
              className={`text-base sm:text-lg font-bold font-mono leading-none tracking-tight ${card.textColor} ${card.glowClass ?? ""}`}
            >
              {card.value}
            </div>

            {card.sub && (
              <div className="text-[10px] mt-1 text-white/30 font-mono tracking-tight">
                {card.sub}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
