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
 * Fetch all rows from the configured Google Sheet.
 * Runs server-side only — credentials never reach the browser.
 */
export async function fetchSheetData(): Promise<SheetRow[]> {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  const tab = process.env.GOOGLE_SHEET_TAB || "Sheet1";

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID!,
    range: `${tab}!A:K`,
  });

  const rows = res.data.values;
  if (!rows || rows.length < 2) return [];

  const headers = rows[0].map((h: string) =>
    h.trim().toLowerCase().replace(/\s+/g, "_")
  );

  return rows.slice(1).map((row) => {
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
 * Fetch rows filtered to a specific user.
 */
export async function fetchUserData(userEmail: string): Promise<SheetRow[]> {
  const all = await fetchSheetData();
  return all.filter(
    (r) => r.user_id.toLowerCase() === userEmail.toLowerCase()
  );
}
