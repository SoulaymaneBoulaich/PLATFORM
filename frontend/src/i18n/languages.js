export const SUPPORTED_LANGUAGES = [
    { code: 'en', label: 'English', dir: 'ltr' },
    { code: 'fr', label: 'Français', dir: 'ltr' },
    { code: 'ar', label: 'العربية', dir: 'rtl' },
    { code: 'es', label: 'Español', dir: 'ltr' },
];

export const DEFAULT_LANGUAGE = 'en';

export const getLanguageConfig = (code) => {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === code) || SUPPORTED_LANGUAGES[0];
};
