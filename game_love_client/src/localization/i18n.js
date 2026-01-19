// src/localization/i18n.js
import i18n from 'i18n-js';

import en from './en.json';
import he from './he.json';

i18n.translations = { en, he };
i18n.defaultLocale = 'en';
i18n.locale = 'en';
i18n.fallbacks = true;

export default i18n;
