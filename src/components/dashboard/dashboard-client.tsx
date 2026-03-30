"use client";

import { useState, useMemo } from "react";
import { subMonths, subYears, parseISO, isAfter } from "date-fns";
import type { DashboardData, FilterState, PortfolioPoint, ChannelSummary } from "@/lib/types";
import { SummaryCards } from "./summary-cards";
import { Filters } from "./filters";
import { PortfolioChart } from "@/components/charts/portfolio-chart";
import { ChannelCard } from "./channel-card";

function getDateCutoff(range: FilterState["dateRange"]): Date | null {
  const now = new Date();
  switch (range) {
    case "1m": return subMonths(now, 1);
    case "3m": return subMonths(now, 3);
    case "6m": return subMonths(now, 6);
    case "1y": return subYears(now, 1);
    case "all": return null;
  }
}

function filterData(
  data: DashboardData,
  filters: FilterState
): DashboardData {
  const cutoff = getDateCutoff(filters.dateRange);

  const filterPoints = <T extends { date: string }>(pts: T[]): T[] => {
    if (!cutoff) return pts;
    return pts.filter((p) => isAfter(parseISO(p.date), cutoff));
  };

  let channels = data.channels;
  if (filters.selectedChannels.length > 0) {
    channels = channels.filter((ch) =>
      filters.selectedChannels.includes(ch.name)
    );
  }

  channels = channels.map((ch) => {
    const points = filterPoints(ch.points);
    const initial = points[0]?.investedAmount ?? 0;
    const current = points[points.length - 1]?.portfolioValue ?? 0;
    const pl = current - initial;
    const roi = initial > 0 ? (pl / initial) * 100 : 0;
    return { ...ch, points, initialInvestment: initial, currentValue: current, pl, roi };
  });

  let portfolioSeries = filterPoints(data.portfolioSeries);

  // Recalculate if channel filter is active
  if (filters.selectedChannels.length > 0) {
    const selectedNames = new Set(filters.selectedChannels);
    portfolioSeries = portfolioSeries.map((p) => {
      const filteredChannels = p.channels.filter((c) => selectedNames.has(c.name));
      const totalValue = filteredChannels.reduce((s, c) => s + c.value, 0);
      return { ...p, totalValue, channels: filteredChannels, pl: totalValue - p.totalInvested };
    });
  }

  const totalInvested = channels.reduce((s, c) => s + c.initialInvestment, 0);
  const currentValue = channels.reduce((s, c) => s + c.currentValue, 0);
  const totalPL = currentValue - totalInvested;
  const totalROI = totalInvested > 0 ? (totalPL / totalInvested) * 100 : 0;

  return {
    ...data,
    totalInvested,
    currentValue,
    totalPL,
    totalROI,
    activeChannels: channels.length,
    firstDate: portfolioSeries[0]?.date ?? "",
    lastDate: portfolioSeries[portfolioSeries.length - 1]?.date ?? "",
    portfolioSeries,
    channels,
  };
}

export function DashboardClient({ data }: { data: DashboardData }) {
  const [filters, setFilters] = useState<FilterState>({
    dateRange: "all",
    selectedChannels: [],
  });

  const filtered = useMemo(() => filterData(data, filters), [data, filters]);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Summary */}
      <SummaryCards data={filtered} />

      {/* Filters */}
      <Filters
        channels={data.channels}
        value={filters}
        onChange={setFilters}
      />

      {/* Portfolio chart */}
      <PortfolioChart data={filtered.portfolioSeries} channels={filtered.channels} totalROI={filtered.totalROI} />

      {/* Per-channel charts */}
      <div>
        <h2 className="text-sm font-semibold text-white/60 mb-3">
          Investment Channels
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.channels.map((ch) => (
            <ChannelCard key={ch.name} channel={ch} />
          ))}
        </div>
      </div>
    </div>
  );
}
