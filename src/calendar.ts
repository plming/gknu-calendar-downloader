import * as ics from "ics";

import { type GknuCalendarEvent } from "./scraper";

export function buildICS(events: GknuCalendarEvent[]): string {
  const eventAttributes: ics.EventAttributes[] = [];
  for (const event of events) {
    const startDate = toDateArray(event.notice_start_date);
    const endDate = isEmptyString(event.notice_end_date)
      ? startDate
      : toDateArray(event.notice_end_date);

    eventAttributes.push({
      title: event.title,
      start: startDate,
      end: endDate,
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

function toDateArray(date: string): [number, number, number] {
  const parts = date.split("-").map((v) => parseInt(v, 10));

  const year = parts[0];
  const month = parts[1];
  const day = parts[2];

  if (year === undefined || month === undefined || day === undefined) {
    throw new Error(`Invalid date format: ${date}`);
  }

  return [year, month, day];
}

function isEmptyString(str: string): boolean {
  return !str.trim();
}
