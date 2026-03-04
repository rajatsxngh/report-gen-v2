export function computeNextRunDate(schedule) {
  const now = new Date();
  const [hours, minutes] = schedule.time.split(':').map(Number);

  if (schedule.frequency === 'daily') {
    const next = new Date(now);
    next.setHours(hours, minutes, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    return next;
  }

  if (schedule.frequency === 'weekly') {
    const targetDay = schedule.day_of_week ?? 0;
    const next = new Date(now);
    next.setHours(hours, minutes, 0, 0);
    const currentDay = next.getDay();
    let daysUntil = targetDay - currentDay;
    if (daysUntil < 0 || (daysUntil === 0 && next <= now)) {
      daysUntil += 7;
    }
    next.setDate(next.getDate() + daysUntil);
    return next;
  }

  if (schedule.frequency === 'monthly') {
    const targetDom = schedule.day_of_month ?? 1;
    const next = new Date(now.getFullYear(), now.getMonth(), targetDom, hours, minutes, 0, 0);
    if (next <= now) {
      next.setMonth(next.getMonth() + 1);
    }
    return next;
  }

  return null;
}

export function getNextRun(schedule) {
  const next = computeNextRunDate(schedule);
  if (!next) return '--';
  return next.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
