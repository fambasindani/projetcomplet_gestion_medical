export const toIsoStartOfDay = (date?: string): string | undefined =>
  date ? `${date}T00:00:00` : undefined;

export const toIsoEndOfDay = (date?: string): string | undefined =>
  date ? `${date}T23:59:59` : undefined;

export const toIsoDateTime = (date?: string, endOfDay = false): string | undefined =>
  endOfDay ? toIsoEndOfDay(date) : toIsoStartOfDay(date);
