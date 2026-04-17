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
    avatar:"https://zaona.top/avatar.png",
    description: {
      zh: "Explore The Edge Of Imagination",
      en: "Explore The Edge Of Imagination"
    }
  },
  {
    name: "hrsthrt74",
    url: "https://hrsthrt74.github.io/",
    avatar: "https://avatars.githubusercontent.com/u/49299205",
    description: {
      zh: "hrsthrt74的博客",
      en: "hrsthrt74's Blog"
    }
  },
  {
    name: "OrPudding",
    url: "https://orpu.moe/",
    avatar: "https://orpu.moe/upload/F337D8E876660646C6C3675320A2ABFD.webp",
    description: {
      zh: "OrPudding的博客",
      en: "OrPudding's Blog"
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