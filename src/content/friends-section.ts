import type { Locale } from "./locale";

export type FriendsSectionContent = {
  title: string;
  body: string;
};

const friendsSectionContentByLocale: Record<Locale, FriendsSectionContent> = {
  zh: {
    title: "FRIENDS",
    body: ""
  },
  en: {
    title: "FRIENDS",
    body: ""
  }
};

export function getFriendsSectionContent(locale: Locale): FriendsSectionContent {
  return friendsSectionContentByLocale[locale];
}
