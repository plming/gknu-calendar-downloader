// gknu-calendar.ts — Browser-friendly TypeScript port
// ---------------------------------------------------
// This file ports the original C# console app to browser-ready TypeScript.
// It fetches GKNU calendar events (monthly), builds a .ics calendar, and triggers a download.
//
// Usage (no bundler): include this file via a build step (esbuild/tsup/vite) OR
// paste into a <script type="module"> in an environment that supports TypeScript-on-the-fly.
// Minimal example after bundling:
//   import { saveGknuCalendarICS } from "./gknu-calendar.js";
//   document.getElementById("btn").addEventListener("click", () => saveGknuCalendarICS(new Date().getFullYear()));
//
// NOTE: If the GKNU endpoint blocks cross-origin requests (CORS), you must proxy the request
// (e.g., Cloudflare Worker or your own tiny server). Browsers will always send a User-Agent automatically.

import { fetchEventsOnYear, type GknuCalendarEvent } from "./scraper";
import * as ics from "ics";

// ---------------------------------------------------
// Types
// ---------------------------------------------------

// ---------------------------------------------------
// ICS generation (all-day events)
// ---------------------------------------------------
// We emit a minimal RFC 5545 calendar with all-day events. For all-day ranges, DTEND is exclusive,
// so we add one day to the inclusive end date from the API.

function toDateArray(date: string): [number, number, number] {
  const parts = date.split("-").map((v) => parseInt(v, 10));
  if (parts.length !== 3) {
    throw new Error(`Invalid date format: ${date}`);
  }

  return [parts[0], parts[1], parts[2]];
}

function isEmptyString(str: string): boolean {
  return !str.trim();
}

function buildICS(events: GknuCalendarEvent[]): string {
  const eventAttributes: ics.EventAttributes[] = [];
  for (const event of events) {
    const startDate = toDateArray(event.notice_start_date);
    const endDate = isEmptyString(event.notice_end_date)
      ? startDate
      : toDateArray(event.notice_end_date);

    eventAttributes.push({
      title: event.title,
      start: startDate,
      end: [endDate[0], endDate[1], endDate[2]],
    });
  }

  const result = ics.createEvents(eventAttributes);

  if (result.error !== null) {
    throw new Error("Failed to create ICS events", { cause: result.error });
  }

  if (result.value === undefined) {
    throw new Error("Failed to create ICS events. No value returned.");
  }

  return result.value;
}

type foo = {
  title: string | null;
};

// ---------------------------------------------------
// Download helper
// ---------------------------------------------------
export function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------
// High-level convenience: fetch, build, save
// ---------------------------------------------------
export async function saveGknuCalendarICS(year = new Date().getFullYear()) {
  const events = await fetchEventsOnYear(year);
  const ics = buildICS(events);
  console.log(`ics:\n${ics}`);
  downloadText(`gknu-${year}.ics`, ics);
}

// (Optional) auto-attach to a button with id="save-ics-btn"
export function wireDefaultButton(buttonId = "save-ics-btn") {
  const btn = document.getElementById(buttonId);
  if (btn) {
    btn.addEventListener("click", () => {
      saveGknuCalendarICS().catch((err) => {
        console.error(err);
        alert(`Failed to save GKNU calendar: ${err}`);
      });
    });
  }
}
