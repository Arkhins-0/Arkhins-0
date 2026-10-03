export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })
}

/** "June 2025" or "Sep 2025" -> "Jun 2025", the way v3 prints month and year. */
export function formatMonthYear(value: string): string {
  const date = new Date(`1 ${value} UTC`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", timeZone: "UTC" })
}

/** Dates with days in front, like "02 April 2025" or "21–25 April 2025" -> "Apr 2025". */
export function formatLooseDate(value: string): string {
  const match = value.match(/([A-Za-z]+)\s+(\d{4})/)
  return match ? formatMonthYear(`${match[1]} ${match[2]}`) : value
}
