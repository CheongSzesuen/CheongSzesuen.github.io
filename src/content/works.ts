import type { Locale } from "./locale";

export type WorksContent = {
  title: string;
  body: string;
};

const worksContentByLocale: Record<Locale, WorksContent> = {
  zh: {
    title: "WORKS",
    body: ""
  },
  en: {
    title: "WORKS",
    body: ""
  }
};

export function getWorksContent(locale: Locale): WorksContent {
  return worksContentByLocale[locale];
}
