export interface GknuCalendarEvent {
  title: string;
  notice_start_date: string;
  notice_end_date: string;
}

export function isAvailableYear(year: number): boolean {
  const AVAILABLE_YEAR_START = 2000;
  const AVAILABLE_YEAR_END = new Date().getFullYear() + 1;

  return year >= AVAILABLE_YEAR_START && year <= AVAILABLE_YEAR_END;
}

export async function fetchEventsOnYear(
  year: number
): Promise<GknuCalendarEvent[]> {
  if (!isAvailableYear(year)) {
    throw new Error(`Invalid parameter: year=${year}`);
  }

  const results = await Promise.all(
    Array.from({ length: 12 }, (_, i) => fetchEvents(year, i + 1))
  );

  return results.flat();
}

async function fetchEvents(
  year: number,
  month: number
): Promise<GknuCalendarEvent[]> {
  if (!isAvailableYear(year)) {
    throw new Error(`Invalid parameter: year=${year}`);
  }

  const JANUARY = 1;
  const DECEMBER = 12;
  if (month < JANUARY || month > DECEMBER) {
    throw new Error(`Invalid parameter: month=${month}`);
  }

  const BASE_URL = "https://www.gknu.ac.kr";
  const CORS_PROXY = "https://proxy.corsfix.com/?";

  const gknuUrl = `${BASE_URL}/main/module/schedule/view.do?category1=101&notice_start_date=${year}-${month
    .toString()
    .padStart(2, "0")}`;

  const url = `${CORS_PROXY}${gknuUrl}`;

  const response = await fetch(url, {
    method: "GET",
    headers: { "x-corsfix-cache": "true" },
  });
  if (!response.ok) {
    throw new Error(
      `Failed to fetch events: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  if (!validate(data)) {
    throw new Error("Invalid data format received from GKNU");
  }

  return data;
}

function validate(events: unknown): events is GknuCalendarEvent[] {
  if (!Array.isArray(events)) {
    return false;
  }

  for (const event of events) {
    if (
      typeof event?.title !== "string" ||
      typeof event?.notice_start_date !== "string" ||
      typeof event?.notice_end_date !== "string"
    ) {
      return false;
    }
  }

  return true;
}
