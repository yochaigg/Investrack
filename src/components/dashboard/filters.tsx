"use client";

import { useState } from "react";
import { Filter, ChevronDown } from "lucide-react";
import type { FilterState, ChannelSummary } from "@/lib/types";

const DATE_RANGES = [
  { value: "1m", label: "1M" },
  { value: "3m", label: "3M" },
  { value: "6m", label: "6M" },
  { value: "1y", label: "1Y" },
  { value: "all", label: "All" },
] as const;

interface FiltersProps {
  channels: ChannelSummary[];
  value: FilterState;
  onChange: (f: FilterState) => void;
}

export function Filters({ channels, value, onChange }: FiltersProps) {
  const [showChannels, setShowChannels] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Date range pills */}
      <div className="flex items-center gap-1 glass rounded-xl p-1">
        {DATE_RANGES.map((r) => (
          <button
            key={r.value}
            onClick={() => onChange({ ...value, dateRange: r.value })}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              value.dateRange === r.value
                ? "bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/20"
                : "text-white/40 hover:text-white/60 border border-transparent"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Channel filter dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowChannels(!showChannels)}
          className="flex items-center gap-2 glass rounded-xl px-3 py-2 text-xs text-white/50 hover:text-white/70 transition-colors"
        >
          <Filter className="w-3.5 h-3.5" />
          <span>
            {value.selectedChannels.length === 0
              ? "All Channels"
              : `${value.selectedChannels.length} selected`}
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform ${showChannels ? "rotate-180" : ""}`}
          />
        </button>

        {showChannels && (
          <div className="absolute top-full mt-1 left-0 z-50 glass-strong rounded-xl p-2 min-w-[180px] animate-fade-in">
            <button
              onClick={() => onChange({ ...value, selectedChannels: [] })}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                value.selectedChannels.length === 0
                  ? "bg-neon-cyan/10 text-neon-cyan"
                  : "text-white/50 hover:bg-white/5"
              }`}
            >
              All Channels
            </button>
            {channels.map((ch) => {
              const selected = value.selectedChannels.includes(ch.name);
              return (
                <button
                  key={ch.name}
                  onClick={() => {
                    const next = selected
                      ? value.selectedChannels.filter((c) => c !== ch.name)
                      : [...value.selectedChannels, ch.name];
                    onChange({ ...value, selectedChannels: next });
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2 transition-colors ${
                    selected
                      ? "bg-white/5 text-white/80"
                      : "text-white/40 hover:bg-white/5"
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: ch.color }}
                  />
                  {ch.name}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
