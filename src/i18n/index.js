import en from './en';

const dictionaries = { en };

export const t = (key, locale = 'en') => {
  const dict = dictionaries[locale] || dictionaries.en;
  return key.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : null), dict) || key;
};

export const currentLocale = 'en';
