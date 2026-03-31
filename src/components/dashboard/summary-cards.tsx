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
          className="relative rounded-xl p-3.5 sm:p-4 animate-slide-up overflow-hidden"
          style={{
            animationDelay: `${i * 60}ms`,
            background: "linear-gradient(145deg, rgba(14,14,36,0.85), rgba(6,6,16,0.95))",
            border: `1px solid ${card.borderColor}33`,
            boxShadow: `0 2px 8px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04)`,
          }}
        >
          {/* Top accent border */}
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{
              background: `linear-gradient(90deg, transparent, ${card.borderColor}, transparent)`,
            }}
          />
          {/* Corner glow */}
          <div
            className="absolute -top-6 -right-6 w-16 h-16 rounded-full blur-2xl opacity-20"
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
