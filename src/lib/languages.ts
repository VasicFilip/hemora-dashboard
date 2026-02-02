export const SUPPORTED_LANGUAGES = {
    "de": "German (Deutsch)",
    "en": "English",
    "fr": "French (Français)",
    "it": "Italian (Italiano)",
    "tr": "Turkish (Türkçe)",
    "es": "Spanish (Español)",
    "pt": "Portuguese (Português)",
    "sq": "Albanian (Shqip)",
    "sr": "Serbian (Latin)",
    "hr": "Croatian (Hrvatski)",
    "bs": "Bosnian (Bosanski)",
    "ar": "Arabic (العربية)",
    "ta": "Tamil (தமிழ்)",
    "ru": "Russian (Русский)",
    "pl": "Polish (Polski)",
    "ro": "Romanian (Română)",
    "fa": "Persian (فارسی)",
    "ku": "Kurdish (Kurdî)",
    "zh": "Chinese (中文)",
    "hu": "Hungarian (Magyar)"
} as const;

export type SupportedLanguageCode = keyof typeof SUPPORTED_LANGUAGES;
