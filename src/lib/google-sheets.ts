import "server-only";

import { google } from "googleapis";
import type { SheetRow } from "./types";

function getAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
      private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
}

/**
 * Fetch raw grid from the configured Google Sheet tab.
 * Server-side only — credentials never reach the browser.
 */
async function fetchRawGrid(tab: string): Promise<string[][]> {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID!,
    range: `${tab}!A:Z`,
  });

  return (res.data.values as string[][]) ?? [];
}

/**
 * Pivot column-per-channel sheet into normalised SheetRow[].
 *
 * Expected sheet format:
 *   Row 1 (headers): Date | Channel1 | Channel2 | ... | Total (optional)
 *   Row 2+:          date | value    | value    | ... | total (optional)
 *
 * Each channel column value is treated as the portfolio_value for that
 * channel on that date. The first data row's value = initial investment.
 *
 * For the row-per-entry format (user_id, channel_name, date, ...),
 * falls back to the legacy parser.
 */
function pivotColumnsToRows(grid: string[][]): SheetRow[] {
  if (grid.length < 2) return [];

  const headers = grid[0].map((h) => h.trim());

  // Detect format: if headers include "user_id" or "channel_name", use legacy
  const lowerHeaders = headers.map((h) => h.toLowerCase().replace(/\s+/g, "_"));
  if (lowerHeaders.includes("user_id") || lowerHeaders.includes("channel_name")) {
    return parseLegacyFormat(grid);
  }

  // Column-per-channel format
  // First column = Date, remaining columns = channels (skip "Total" column)
  const channelNames = headers
    .slice(1)
    .filter((h) => h.toLowerCase() !== "total" && h.trim() !== "");

  const rows: SheetRow[] = [];
  // Track cumulative invested per channel (first row = initial investment)
  const initialInvestment: Record<string, number> = {};

  for (let r = 1; r < grid.length; r++) {
    const row = grid[r];
    const dateRaw = (row[0] ?? "").trim();

    // Skip rows with no date (like totals)
    if (!dateRaw) continue;

    for (let c = 0; c < channelNames.length; c++) {
      const colIdx = c + 1;
      const valueStr = (row[colIdx] ?? "").trim().replace(/,/g, "");
      const value = parseFloat(valueStr);
      if (isNaN(value) || value === 0) continue;

      const channelName = channelNames[c];

      // First time seeing this channel → that's the initial investment
      if (!(channelName in initialInvestment)) {
        initialInvestment[channelName] = value;
      }

      rows.push({
        user_id: "", // column format has no user_id — all data shown to logged-in user
        channel_name: channelName,
        date: dateRaw,
        event_label: r === 1 ? "Initial Investment" : "",
        invested_amount: initialInvestment[channelName],
        portfolio_value: value,
        note: "",
        marker_title: r === 1 ? "Start" : undefined,
        point_description: undefined,
        color: undefined,
        channel_type: undefined,
      });
    }
  }

  return rows;
}

/**
 * Legacy row-per-entry format parser.
 * Headers: user_id, channel_name, date, event_label, invested_amount, portfolio_value, ...
 */
function parseLegacyFormat(grid: string[][]): SheetRow[] {
  const headers = grid[0].map((h: string) =>
    h.trim().toLowerCase().replace(/\s+/g, "_")
  );

  return grid.slice(1).map((row) => {
    const obj: Record<string, string> = {};
    headers.forEach((h: string, i: number) => {
      obj[h] = (row[i] ?? "").toString().trim();
    });

    return {
      user_id: obj.user_id ?? "",
      channel_name: obj.channel_name ?? "",
      date: obj.date ?? "",
      event_label: obj.event_label ?? "",
      invested_amount: parseFloat(obj.invested_amount) || 0,
      portfolio_value: parseFloat(obj.portfolio_value) || 0,
      note: obj.note ?? "",
      marker_title: obj.marker_title || undefined,
      point_description: obj.point_description || undefined,
      color: obj.color || undefined,
      channel_type: obj.channel_type || undefined,
    } satisfies SheetRow;
  });
}

/**
 * Fetch sheet data, auto-detect format, normalise into SheetRow[].
 */
export async function fetchSheetData(): Promise<SheetRow[]> {
  const tab = process.env.GOOGLE_SHEET_TAB || "Sheet1";
  const grid = await fetchRawGrid(tab);
  return pivotColumnsToRows(grid);
}

/**
 * Fetch rows filtered to a specific user.
 * For column-per-channel sheets (no user_id column), returns ALL data
 * since every logged-in user sees the data assigned to them via their tab/sheet.
 */
export async function fetchUserData(userEmail: string): Promise<SheetRow[]> {
  const all = await fetchSheetData();

  // If no user_id in data (column format), return everything
  const hasUserId = all.some((r) => r.user_id !== "");
  if (!hasUserId) return all;

  return all.filter(
    (r) => r.user_id.toLowerCase() === userEmail.toLowerCase()
  );
}
