export const round = (val, decimals = 1) =>
  Math.round(val * 10 ** decimals) / 10 ** decimals;

export const formatTimestamp = (date = new Date()) =>
  date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

export const formatDate = (date) =>
  date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
