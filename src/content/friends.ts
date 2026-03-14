import type { Locale } from "./locale";

export type FriendLink = {
  name: string;
  url: string;
  avatar: string;
  description?: string;
};

type FriendLinkSource = Omit<FriendLink, "description"> & {
  description?: Record<Locale, string>;
};

const friendsLinkSource: FriendLinkSource[] = [
  {
    name: "Zaona",
    url: "https://zaona.top/",
    avatar: "https://zaona.top/avatar.png",
    description: {
      zh: "Explore The Edge Of Imagination",
      en: "Explore The Edge Of Imagination"
    }
  }
];

export function getFriendsLinks(locale: Locale): FriendLink[] {
  return friendsLinkSource.map((friend) => ({
    name: friend.name,
    url: friend.url,
    avatar: friend.avatar,
    description: friend.description?.[locale]
  }));
}
