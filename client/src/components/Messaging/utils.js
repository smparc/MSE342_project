const systemTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

export const formatMessageTimestamp = (createdAt) => {
  if (!createdAt) return '';
  const d = new Date(createdAt);
  if (isNaN(d.getTime())) return '';
  const tz = systemTimeZone();
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: tz });
  }
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', timeZone: tz });
};

export const formatDayHeader = (createdAt) => {
  if (!createdAt) return '';
  const d = new Date(createdAt);
  if (isNaN(d.getTime())) return '';
  const tz = systemTimeZone();
  const datePart = d.toLocaleDateString([], {
    month: 'long',
    day: 'numeric',
    timeZone: tz,
  });
  const timePart = d.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: tz,
  });
  return `${datePart} ${timePart}`;
};
