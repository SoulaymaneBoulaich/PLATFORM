import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from './i18n/languages';

// Import all translation files
import en from './i18n/locales/en.json';
import fr from './i18n/locales/fr.json';
import ar from './i18n/locales/ar.json';
import es from './i18n/locales/es.json';

const resources = {
    en: { translation: en },
    fr: { translation: fr },
    ar: { translation: ar },
    es: { translation: es },
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: DEFAULT_LANGUAGE,
        fallbackLng: DEFAULT_LANGUAGE,
        supportedLngs: SUPPORTED_LANGUAGES.map(lang => lang.code),
        interpolation: {
            escapeValue: false
        }
    });

i18n.on('languageChanged', (lng) => {
    document.documentElement.lang = lng;
    const langConfig = SUPPORTED_LANGUAGES.find(l => l.code === lng);
    document.documentElement.dir = langConfig?.dir || 'ltr';
});

export default i18n;
