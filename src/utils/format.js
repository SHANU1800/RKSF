export const formatCurrency = (value, locale = 'en-IN', currency = 'INR') => {
  const amount = Number(value) || 0;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (value, locale = 'en-IN') => {
  const amount = Number(value) || 0;
  return new Intl.NumberFormat(locale).format(amount);
};

export const formatDate = (date, locale = 'en-IN', options) => {
  const dt = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat(locale, options || { year: 'numeric', month: 'short', day: 'numeric' }).format(dt);
};

export const formatTime = (date, locale = 'en-IN') => {
  const dt = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(dt);
};
