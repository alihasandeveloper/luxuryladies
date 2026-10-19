export type LocaleKey = string;

export interface TranslationDictionary {
  [key: string]: string | TranslationDictionary;
}
