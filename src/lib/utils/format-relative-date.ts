export function formatRelativeDate(iso: string, locale: string = "en-US") {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })
  const diffMs = new Date(iso).getTime() - Date.now()
  const diffHours = Math.round(diffMs / (1000 * 60 * 60))

  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, "hour")

  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
  if (Math.abs(diffDays) < 30) return rtf.format(diffDays, "day")

  const diffMonths = Math.round(diffDays / 30)
  return rtf.format(diffMonths, "month")
}
