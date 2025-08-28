export const availableLanguages = ['en', 'sw'] as const;
export type Language = typeof availableLanguages[number];
