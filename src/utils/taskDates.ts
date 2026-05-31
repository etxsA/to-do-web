/** Backend dueDate is `YYYY-MM-DDTHH:mm:ss` (no tz). The web date input uses
 *  `YYYY-MM-DD`. These bridge the two; we anchor the time at noon to dodge
 *  timezone day-rollover when the backend compares against its local date. */
export function dueDateToInput(iso?: string): string {
  return iso ? iso.slice(0, 10) : ''
}

export function inputToDueDate(date?: string): string | undefined {
  return date ? `${date}T12:00:00` : undefined
}
