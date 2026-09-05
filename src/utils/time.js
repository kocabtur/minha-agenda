export function timeToMinutes(time) {
  if (!time) return null;
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function durationMinutes(startTime, endTime) {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  if (start === null || end === null) return 0;
  // Suporta horários que atravessam a meia-noite (ex.: Dormir 23:00 -> 06:00)
  const diff = end - start;
  return diff >= 0 ? diff : diff + 24 * 60;
}

export function formatHoursMinutes(totalMinutes) {
  const clamped = Math.max(0, Math.round(totalMinutes));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  if (m === 0) return `${h}h`;
  return `${h}h${String(m).padStart(2, '0')}`;
}

export function sortByStartTime(events) {
  return [...events].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
}
