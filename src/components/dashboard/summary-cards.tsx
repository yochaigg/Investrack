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
  accent?: string;
  glow?: string;
}

export function SummaryCards({ data }: { data: DashboardData }) {
  const isPositive = data.totalPL >= 0;

  const cards: CardDef[] = [
    {
      label: "Total Invested",
      value: formatCurrency(data.totalInvested),
      icon: <DollarSign className="w-4 h-4" />,
      accent: "text-neon-cyan",
    },
    {
      label: "Portfolio Value",
      value: formatCurrency(data.currentValue),
      icon: <BarChart3 className="w-4 h-4" />,
      accent: "text-neon-cyan",
      glow: "text-glow-cyan",
    },
    {
      label: "Total P/L",
      value: formatCurrency(data.totalPL),
      sub: formatPercent(data.totalROI),
      icon: isPositive ? (
        <TrendingUp className="w-4 h-4" />
      ) : (
        <TrendingDown className="w-4 h-4" />
      ),
      accent: isPositive ? "text-gain" : "text-loss",
      glow: isPositive ? "text-glow-green" : "text-glow-loss",
    },
    {
      label: "ROI",
      value: formatPercent(data.totalROI),
      icon: isPositive ? (
        <TrendingUp className="w-4 h-4" />
      ) : (
        <TrendingDown className="w-4 h-4" />
      ),
      accent: isPositive ? "text-gain" : "text-loss",
      glow: isPositive ? "text-glow-green" : "text-glow-loss",
    },
    {
      label: "Active Channels",
      value: data.activeChannels.toString(),
      icon: <Layers className="w-4 h-4" />,
      accent: "text-neon-purple",
    },
    {
      label: "Duration",
      value: `${formatDate(data.firstDate)} — ${formatDate(data.lastDate)}`,
      icon: <Calendar className="w-4 h-4" />,
      accent: "text-white/60",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="glass rounded-xl p-3.5 sm:p-4 animate-slide-up"
        >
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-white/30">{card.icon}</span>
            <span className="text-[10px] font-medium text-white/40 uppercase tracking-wider">
              {card.label}
            </span>
          </div>
          <div
            className={`text-base sm:text-lg font-bold ${card.accent} ${card.glow ?? ""} leading-tight`}
          >
            {card.value}
          </div>
          {card.sub && (
            <div className={`text-xs mt-0.5 ${card.accent} opacity-70`}>
              {card.sub}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
