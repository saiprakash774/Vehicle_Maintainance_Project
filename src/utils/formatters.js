export const round = (val, decimals = 1) =>
  Math.round(val * 10 ** decimals) / 10 ** decimals;

export const formatTimestamp = (date = new Date()) =>
  date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

export const formatDate = (date) =>
  date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

/** Format a Date as `YYYY-MM-DD`, the value shape `<input type="date">` expects/emits. */
export const toDateInputValue = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};
