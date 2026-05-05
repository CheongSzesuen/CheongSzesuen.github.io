import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import TextType from "./TextType";

type AsciiCell = {
  glyph: string;
  color: string;
};

type AnsiAvatarPayload = {
  width: number;
  height: number;
  rows: Array<Array<number | [number, number, number] | null>>;
};

type HtmlAvatarPayload = {
  markup: string;
  width: number;
  height: number;
};

type TerminalEntry = {
  text: string;
  tone: "role" | "quote" | "note";
};

type SocialLink = {
  href: string;
  label: string;
  icon: "outlook" | "gmail" | "github" | "bilibili" | "afdian";
  color: string;
  external?: boolean;
};

type ActionLink = {
  href: string;
  label: string;
  icon: "arrow" | "mail";
  emphasis?: boolean;
  external?: boolean;
};

const quoteOptions = [
  "Stay Hungry,Stay Foolish.",
  "Open source drives development.",
  "Long live open source!"
] as const;
const socialLinks: SocialLink[] = [
  {
    href: "mailto:waijade@outlook.com",
    label: "waijade@outlook.com",
    icon: "outlook",
    color: "rgb(0 120 212)"
  },
  {
    href: "mailto:X2430442963X@gmail.com",
    label: "Gmail",
    icon: "gmail",
    color: "rgb(234 67 53)"
  },
  {
    href: "https://github.com/CheongSzesuen",
    label: "CheongSzesuen",
    icon: "github",
    color: "rgb(255 255 255)",
    external: true
  },
  {
    href: "https://space.bilibili.com/544038785",
    label: "Bilibili",
    icon: "bilibili",
    color: "rgb(0 161 214)",
    external: true
  },
  {
    href: "https://afdian.com/a/waijade",
    label: "爱发电",
    icon: "afdian",
    color: "rgb(148 108 230)",
    external: true
  }
] as const;
// 已按要求注释：X、Telegram 与其它图标按钮（注释中不保留链接）。

const actionLinks: ActionLink[] = [
  { href: "#about", label: "About", icon: "arrow" },
  { href: "#works", label: "Works", icon: "arrow" },
  { href: "#friends", label: "Friends", icon: "arrow" },
  { href: "https://blog.waijade.cn", label: "BLOG", icon: "arrow", emphasis: true, external: true }
] as const;

const fallbackAscii = [
  "██      ██  █████  ██      █████  ██████  ███████",
  "██      ██ ██   ██ ██     ██   ██ ██   ██ ██",
  "██  █   ██ ███████ ██     ███████ ██   ██ █████",
  "██ ███ ██  ██   ██ ██     ██   ██ ██   ██ ██",
  " ███ ███   ██   ██ ██████ ██   ██ ██████  ███████"
];

const fallbackRows: AsciiCell[][] = fallbackAscii.map((line) =>
  line.split("").map((glyph) => ({
    glyph,
    color: "rgba(188, 205, 255, 0.72)"
  }))
);

function ansi256ToRgb(index: number): [number, number, number] {
  const base16: Array<[number, number, number]> = [
    [0, 0, 0],
    [128, 0, 0],
    [0, 128, 0],
    [128, 128, 0],
    [0, 0, 128],
    [128, 0, 128],
    [0, 128, 128],
    [192, 192, 192],
    [128, 128, 128],
    [255, 0, 0],
    [0, 255, 0],
    [255, 255, 0],
    [0, 0, 255],
    [255, 0, 255],
    [0, 255, 255],
    [255, 255, 255]
  ];

  if (index < 16) {
    return base16[index];
  }

  if (index <= 231) {
    const n = index - 16;
    const r = Math.floor(n / 36);
    const g = Math.floor((n % 36) / 6);
    const b = n % 6;
    const steps = [0, 95, 135, 175, 215, 255];
    return [steps[r], steps[g], steps[b]];
  }

  const gray = 8 + (index - 232) * 10;
  return [gray, gray, gray];
}

function parseAvatarPayload(payload: AnsiAvatarPayload): AsciiCell[][] {
  return payload.rows.map((row) =>
    row.map((cellColor) => {
      if (cellColor === null) {
        return {
          glyph: "█",
          color: "rgb(0 0 0)"
        };
      }

      if (Array.isArray(cellColor) && cellColor.length === 3) {
        const [r, g, b] = cellColor;
        return {
          glyph: "█",
          color: `rgb(${r} ${g} ${b})`
        };
      }

      if (typeof cellColor !== "number" || Number.isNaN(cellColor)) {
        return {
          glyph: "█",
          color: "rgb(0 0 0)"
        };
      }

      const [r, g, b] = ansi256ToRgb(cellColor);
      return {
        glyph: "█",
        color: `rgb(${r} ${g} ${b})`
      };
    })
  );
}

function parseHtmlAvatarPayload(rawHtml: string): HtmlAvatarPayload | null {
  const preMatch = rawHtml.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
  if (!preMatch) return null;

  const originalMarkup = preMatch[1];
  const lines = originalMarkup.split(/\r?\n/);
  const spanCellPattern = /<span\b[\s\S]*?<\/span>/gi;
  const duplicatedLines: string[] = [];
  let width = 0;
  let height = 0;

  const withBlackFallbackColor = (cell: string): string => {
    const styleMatch = cell.match(/style\s*=\s*(['"])([\s\S]*?)\1/i);
    if (!styleMatch) {
      return cell.replace(
        /<span\b/i,
        '<span style="color: rgb(0 0 0);"'
      );
    }

    const quote = styleMatch[1];
    const styleValue = styleMatch[2];
    if (/color\s*:/i.test(styleValue)) {
      return cell;
    }

    const mergedStyle = styleValue.trim()
      ? `${styleValue.trim()}; color: rgb(0 0 0);`
      : "color: rgb(0 0 0);";

    return cell.replace(styleMatch[0], `style=${quote}${mergedStyle}${quote}`);
  };

  for (const line of lines) {
    const cells = line.match(spanCellPattern) ?? [];
    if (cells.length === 0) continue;

    const normalizedCells = cells.map(withBlackFallbackColor);
    // 每行每个最小单元在其后再复制一次：1 -> 11, 2 -> 22, 3 -> 33
    const doubledLine = normalizedCells.map((cell) => `${cell}${cell}`).join("");
    duplicatedLines.push(doubledLine);

    height += 1;
    width = Math.max(width, cells.length * 2);
  }

  if (!width || !height) return null;
  return { markup: duplicatedLines.join("\n"), width, height };
}

function renderSocialIcon(icon: SocialLink["icon"] | "vibecoding") {
  if (icon === "outlook") {
    return (
      <svg viewBox="0 0 1024 1024" aria-hidden="true">
        <path
          d="M896 42.666667H341.333333c-25.6 0-42.666667 17.066667-42.666666 42.666666v42.666667l341.333333 106.666667L938.666667 128V85.333333c0-25.6-17.066667-42.666667-42.666667-42.666666z"
          fill="#0364B8"
        />
        <path
          d="M1024 507.733333c0-8.533333-4.266667-17.066667-12.8-21.333333l-366.933333-209.066667s-4.266667 0-4.266667-4.266666c-8.533333-4.266667-12.8-4.266667-21.333333-4.266667s-17.066667 0-21.333334 4.266667c0 0-4.266667 0-4.266666 4.266666l-366.933334 209.066667c-8.533333 4.266667-12.8 12.8-12.8 21.333333s4.266667 17.066667 12.8 21.333334l366.933334 209.066666s4.266667 0 4.266666 4.266667c8.533333 4.266667 12.8 4.266667 21.333334 4.266667s17.066667 0 21.333333-4.266667c0 0 4.266667 0 4.266667-4.266667l366.933333-209.066666c8.533333-4.266667 12.8-12.8 12.8-21.333334z"
          fill="#0A2767"
        />
        <path d="M640 128H298.666667v298.666667l341.333333 341.333333h298.666667v-341.333333z" fill="#28A8EA" />
        <path d="M1006.933333 972.8L226.133333 529.066667" fill="#35B8F1" />
        <path d="M640 128h298.666667v298.666667h-298.666667z" fill="#50D9FF" />
        <path d="M298.666667 426.666667h341.333333v426.666666H298.666667z" fill="#0078D4" />
        <path
          d="M618.666667 832l-392.533334-302.933333 21.333334-38.4s362.666667 209.066667 366.933333 209.066666h8.533333c4.266667-4.266667 362.666667-204.8 362.666667-204.8l21.333333 38.4-388.266666 298.666667z"
          fill="#0A2767"
          opacity=".5"
        />
        <path
          d="M1011.2 529.066667l-362.666667 209.066666-8.533333 4.266667c-8.533333 4.266667-12.8 4.266667-21.333333 4.266667s-17.066667-4.266667-21.333334-4.266667l119.466667 166.4 290.133333 68.266667c12.8-8.533333 17.066667-21.333333 17.066667-34.133334V507.733333c0 8.533333-4.266667 17.066667-12.8 21.333334z"
          fill="#1490DF"
        />
        <path
          d="M1024 938.666667l-362.666667-209.066667-12.8 8.533333-8.533333 4.266667c-8.533333 4.266667-12.8 4.266667-21.333333 4.266667s-12.8-4.266667-17.066667-4.266667l170.666667 153.6 238.933333 76.8c4.266667-8.533333 12.8-21.333333 12.8-34.133333z"
          opacity=".1"
        />
        <path
          d="M593.066667 738.133333L298.666667 563.2l-72.533334-34.133333c-8.533333-4.266667-12.8-12.8-12.8-21.333334V938.666667c0 25.6 21.333333 42.666667 42.666667 42.666666h716.8c12.8 0 21.333333 0 34.133333-8.533333l-413.866666-234.666667z"
          fill="#28A8EA"
        />
        <path
          d="M580.266667 853.333333c29.866667 0 59.733333-29.866667 59.733333-59.733333V307.2c0-29.866667-21.333333-51.2-51.2-51.2H298.666667v192l-72.533334 42.666667c-8.533333 4.266667-12.8 8.533333-12.8 17.066666V853.333333h366.933334z"
          opacity=".5"
        />
        <path
          d="M546.133333 810.666667H51.2C21.333333 810.666667 0 789.333333 0 759.466667V264.533333C0 234.666667 21.333333 213.333333 51.2 213.333333h499.2c25.6 0 46.933333 21.333333 46.933333 51.2v499.2c0 25.6-21.333333 46.933333-51.2 46.933334z"
          fill="#0078D4"
        />
        <path
          d="M157.866667 426.666667c12.8-25.6 29.866667-46.933333 55.466666-64 25.6-12.8 55.466667-21.333333 89.6-21.333334 29.866667 0 59.733333 8.533333 81.066667 21.333334 25.6 12.8 42.666667 34.133333 55.466667 59.733333 12.8 25.6 17.066667 55.466667 17.066666 85.333333 0 34.133333-8.533333 64-21.333333 89.6-8.533333 29.866667-29.866667 51.2-51.2 64-25.6 12.8-55.466667 21.333333-85.333333 21.333334-34.133333 0-59.733333-8.533333-85.333334-21.333334-25.6-12.8-42.666667-34.133333-55.466666-59.733333-12.8-25.6-21.333333-55.466667-21.333334-85.333333 0-34.133333 8.533333-64 21.333334-89.6z m59.733333 145.066666c8.533333 17.066667 17.066667 29.866667 29.866667 42.666667 12.8 8.533333 29.866667 12.8 51.2 12.8s38.4-4.266667 51.2-17.066667c12.8-8.533333 25.6-25.6 29.866666-42.666666 8.533333-12.8 12.8-34.133333 12.8-55.466667s-4.266667-38.4-8.533333-55.466667-17.066667-29.866667-29.866667-42.666666c-17.066667-12.8-34.133333-17.066667-55.466666-17.066667s-38.4 4.266667-51.2 17.066667c-12.8 8.533333-25.6 25.6-34.133334 42.666666-4.266667 12.8-8.533333 34.133333-8.533333 55.466667s4.266667 42.666667 12.8 59.733333z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  if (icon === "gmail") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64L12 9.548l6.545-4.91l1.528-1.145C21.69 2.28 24 3.434 24 5.457"
        />
      </svg>
    );
  }

  if (icon === "github") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 .297c-6.63 0-12 5.373-12 12c0 5.303 3.438 9.8 8.205 11.385c.6.113.82-.258.82-.577c0-.285-.01-1.04-.015-2.04c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729c1.205.084 1.838 1.236 1.838 1.236c1.07 1.835 2.809 1.305 3.495.998c.108-.776.417-1.305.76-1.605c-2.665-.3-5.466-1.332-5.466-5.93c0-1.31.465-2.38 1.235-3.22c-.135-.303-.54-1.523.105-3.176c0 0 1.005-.322 3.3 1.23c.96-.267 1.98-.399 3-.405c1.02.006 2.04.138 3 .405c2.28-1.552 3.285-1.23 3.285-1.23c.645 1.653.24 2.873.12 3.176c.765.84 1.23 1.91 1.23 3.22c0 4.61-2.805 5.625-5.475 5.92c.42.36.81 1.096.81 2.22c0 1.606-.015 2.896-.015 3.286c0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
        />
      </svg>
    );
  }

  if (icon === "afdian") {
    return (
      <svg viewBox="20 33 120 92" aria-hidden="true" data-icon="afdian">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M64.9999 90.6681C63.4307 90.6681 62.1621 91.9382 62.1621 93.5091C62.1621 95.0836 63.4307 96.3537 64.9999 96.3537C66.5691 96.3537 67.8378 95.0836 67.8378 93.5091C67.8378 91.9382 66.5691 90.6681 64.9999 90.6681Z"
          fill="#946CE6"
          stroke="#946CE6"
          strokeWidth="1.3"
          paintOrder="stroke fill"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M91.7568 99.1965C90.1876 99.1965 88.9189 100.467 88.9189 102.038C88.9189 103.612 90.1876 104.882 91.7568 104.882C93.326 104.882 94.5946 103.612 94.5946 102.038C94.5946 100.467 93.326 99.1965 91.7568 99.1965Z"
          fill="#946CE6"
          stroke="#946CE6"
          strokeWidth="1.3"
          paintOrder="stroke fill"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M133.76 106.376C132.813 106.851 131.453 106.876 130.197 106.441C129.349 106.141 128.434 105.859 127.523 105.578C125.832 105.061 123.006 104.198 122.468 103.545C121.585 102.365 119.908 102.13 118.73 103.021C117.552 103.909 117.317 105.581 118.207 106.762C118.502 107.161 118.901 107.489 119.303 107.806C115.224 113.462 97.3137 124.715 71.985 119.17C60.5719 116.671 52.8897 112.107 49.7641 105.977C47.5106 101.548 48.0233 96.9879 49.1019 94.5097C52.2026 88.0593 74.5837 73.2045 88.8732 64.793C90.1405 64.0406 90.5641 62.4039 89.8166 61.131C89.069 59.8616 87.3638 59.3517 86.1641 60.1825C85.0107 60.86 81.0912 63.192 76.0896 66.3655C74.3986 65.228 71.4759 63.8231 66.7911 63.3631C59.3616 62.625 42.1921 59.341 36.6458 56.9912C32.673 55.3081 23.6557 50.851 25.6528 45.834C26.1156 44.6645 28.2907 42.7711 33.004 40.9668C36.6351 39.5797 40.2484 38.8131 42.9789 38.5065C42.6122 38.6847 42.2562 38.8559 41.9216 39.0199C38.7106 40.5817 35.2076 42.3289 32.8545 44.3935C32.6836 44.2829 32.5056 44.1724 32.3846 44.0512C31.37 42.9886 29.6969 42.9101 28.6147 43.9656C27.5467 44.9854 27.5075 46.6791 28.5292 47.7452C29.4797 48.7436 30.8859 49.496 32.6765 50.0701C32.7442 50.0915 32.8047 50.1236 32.8723 50.1378C39.095 52.0562 50.1592 51.8173 65.7587 51.1969C72.4834 50.933 78.8343 50.6834 84.1314 50.7868C101.692 51.1362 114.889 58.1322 124.479 72.1776C130.371 80.8066 128.246 89.3073 124.875 96.6955C124.472 96.3853 124.042 95.9824 123.718 95.583C122.796 94.4313 121.09 94.2708 119.969 95.1587C118.816 96.0822 118.623 97.7617 119.542 98.9169C120.083 99.6016 122.867 102.807 126.316 102.533C126.38 102.536 126.437 102.529 126.501 102.525C126.605 102.511 126.711 102.529 126.822 102.511C129.178 102.08 130.659 102.194 132.044 103.064C133.878 104.223 134.782 104.914 134.6 105.492C134.493 105.856 134.219 106.116 133.76 106.376ZM60.9493 76.5884C60.4189 76.977 59.8991 77.3621 59.3758 77.7472C58.8133 77.1411 58.3648 76.5634 58.1583 76.1427C58.7777 75.9572 59.8101 76.1783 60.9493 76.5884ZM134.614 98.3714C133.294 97.5334 131.909 97.1697 130.563 97.02C133.724 89.3002 135.736 79.1949 128.887 69.1574C118.406 53.7998 103.38 45.8198 84.2346 45.4382C78.7809 45.3312 72.3517 45.5844 65.5487 45.8554C57.6493 46.1692 47.1369 46.5793 39.9921 45.9873C41.4161 45.2136 42.9326 44.4719 44.2462 43.8336C49.2728 41.384 53.2314 39.4763 51.9214 36.0925C51.2343 34.117 49.1874 33.0794 45.8233 33.0045C38.7426 32.8441 23.4421 36.9447 20.6903 43.8586C19.1418 47.7524 18.8854 55.2689 34.5668 61.9119C41.0174 64.6503 59.237 67.9879 66.2678 68.6867C68.2542 68.8793 69.7743 69.2822 70.9277 69.7101C69.3151 70.7727 67.6597 71.8888 65.9972 73.0298C63.1102 71.3824 58.3897 69.4391 54.8654 71.846C53.502 72.7695 52.7259 74.1316 52.6903 75.6827C52.6405 77.6117 53.8081 79.498 55.1217 81.017C49.9314 85.1639 45.7343 89.1825 44.2462 92.2811C42.5873 96.0893 41.9109 102.322 45.008 108.402C48.9382 116.118 57.6279 121.499 70.8423 124.394C88.1114 128.17 103.027 124.768 112.895 119.566C118.388 116.671 122.286 113.215 124.18 110.131C124.768 110.317 125.355 110.506 125.96 110.695C126.804 110.951 127.648 111.208 128.438 111.49C131.051 112.395 133.942 112.274 136.167 111.151C136.206 111.133 136.248 111.108 136.291 111.087C137.968 110.202 139.175 108.783 139.705 107.072C141.129 102.458 137.064 99.9082 134.614 98.3714Z"
          fill="url(#afdian-gradient)"
          stroke="url(#afdian-gradient)"
          strokeWidth="1.8"
          strokeLinejoin="round"
          paintOrder="stroke fill"
        />
        <defs>
          <linearGradient id="afdian-gradient" x1="163.931" y1="112.036" x2="141.647" y2="8.79371" gradientUnits="userSpaceOnUse">
            <stop stopColor="#AA84F5" />
            <stop offset="1" stopColor="#885FD9" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  if (icon === "vibecoding") {
    return (
      <svg viewBox="200 238 624 552" aria-hidden="true">
        <circle cx="392.362667" cy="430.24" r="171.157333" fill="currentColor" />
        <circle cx="690.944" cy="430.24" r="111.445333" fill="currentColor" />
        <circle cx="586.442667" cy="664.138667" r="102.197333" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M17.813 4.653h.854q2.266.08 3.773 1.574Q23.946 7.72 24 9.987v7.36q-.054 2.266-1.56 3.773c-1.506 1.507-2.262 1.524-3.773 1.56H5.333q-2.266-.054-3.773-1.56C.053 19.614.036 18.858 0 17.347v-7.36q.054-2.267 1.56-3.76t3.773-1.574h.774l-1.174-1.12a1.23 1.23 0 0 1-.373-.906q0-.534.373-.907l.027-.027q.4-.373.92-.373t.92.373L9.653 4.44q.107.106.187.213h4.267a.8.8 0 0 1 .16-.213l2.853-2.747q.4-.373.92-.373c.347 0 .662.151.929.4s.391.551.391.907q0 .532-.373.906zM5.333 7.24q-1.12.027-1.88.773q-.76.748-.786 1.894v7.52q.026 1.146.786 1.893t1.88.773h13.334q1.12-.026 1.88-.773t.786-1.893v-7.52q-.026-1.147-.786-1.894t-1.88-.773zM8 11.107q.56 0 .933.373q.375.374.4.96v1.173q-.025.586-.4.96q-.373.375-.933.374c-.56-.001-.684-.125-.933-.374q-.375-.373-.4-.96V12.44q0-.56.386-.947q.387-.386.947-.386m8 0q.56 0 .933.373q.375.374.4.96v1.173q-.025.586-.4.96q-.373.375-.933.374c-.56-.001-.684-.125-.933-.374q-.375-.373-.4-.96V12.44q.025-.586.4-.96q.373-.373.933-.373"
      />
    </svg>
  );
}

function renderActionIcon(icon: ActionLink["icon"]) {
  if (icon === "mail") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <g fill="none">
          <path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
          <path
            fill="currentColor"
            d="m2.068 5.482l8.875 8.876a1.5 1.5 0 0 0 2.008.103l.114-.103l8.869-8.87q.043.165.058.337L22 6v12a2 2 0 0 1-1.85 1.995L20 20H4a2 2 0 0 1-1.995-1.85L2 18V6q0-.18.03-.35zM20 4q.182 0 .355.031l.17.039l-8.52 8.52l-8.523-8.522q.166-.045.34-.06L4 4z"
          />
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <g fill="none">
        <path d="M24 0v24H0V0zM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
        <path
          fill="currentColor"
          d="m15.06 5.283l5.657 5.657a1.5 1.5 0 0 1 0 2.12l-5.656 5.658a1.5 1.5 0 0 1-2.122-2.122l3.096-3.096H4.5a1.5 1.5 0 0 1 0-3h11.535L12.94 7.404a1.5 1.5 0 0 1 2.122-2.121Z"
        />
      </g>
    </svg>
  );
}

function HomeTerminal() {
  const terminalEntries = useMemo<TerminalEntry[]>(
    () => [
      { text: "[ Frontend Developer ]", tone: "role" },
      { text: "", tone: "quote" },
      { text: "// VibeCoding Enjoyer", tone: "note" }
    ],
    []
  );
  const [asciiRows, setAsciiRows] = useState<AsciiCell[][]>([]);
  const [asciiMarkup, setAsciiMarkup] = useState<string | null>(null);
  const [avatarGridSize, setAvatarGridSize] = useState<{ rows: number; cols: number }>({
    rows: 0,
    cols: 0
  });
  const [revealedCells, setRevealedCells] = useState(0);
  const [asciiStyle, setAsciiStyle] = useState<CSSProperties | undefined>(undefined);
  const asciiWrapRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const htmlRows = useMemo(() => (asciiMarkup ? asciiMarkup.split("\n") : []), [asciiMarkup]);
  const htmlRowCellCounts = useMemo(
    () =>
      htmlRows.map((row) => {
        const cells = row.match(/<span\b[\s\S]*?<\/span>/gi) ?? [];
        return cells.length;
      }),
    [htmlRows]
  );
  const revealRowLengths = useMemo(
    () => (asciiMarkup ? htmlRowCellCounts : asciiRows.map((row) => row.length)),
    [asciiMarkup, htmlRowCellCounts, asciiRows]
  );
  const revealRowOffsets = useMemo(() => {
    let offset = 0;
    return revealRowLengths.map((len) => {
      const rowStart = offset;
      offset += len;
      return rowStart;
    });
  }, [revealRowLengths]);
  const totalRevealCells = useMemo(
    () => revealRowLengths.reduce((sum, len) => sum + len, 0),
    [revealRowLengths]
  );

  useEffect(() => {
    let canceled = false;

    const cacheKey = "avatar-cache";

    const saveCache = (type: "html" | "json", data: string) => {
      try {
        localStorage.setItem(cacheKey, JSON.stringify({ type, data }));
      } catch {
        // localStorage not available or quota exceeded
      }
    };

    const loadFromCache = (): boolean => {
      try {
        const raw = localStorage.getItem(cacheKey);
        if (!raw) return false;
        const cache = JSON.parse(raw);
        if (typeof cache !== "object" || !cache) return false;

        if (cache.type === "html" && typeof cache.data === "string") {
          const parsedHtml = parseHtmlAvatarPayload(cache.data);
          if (!parsedHtml) return false;
          if (canceled) return true;
          const baseLineHeight = 1;
          const squareCellWidth = (parsedHtml.height * baseLineHeight) / parsedHtml.width;
          const baseCellWidth = Math.max(0.2, Math.min(1, squareCellWidth));
          setAsciiStyle({
            "--ascii-line-height": baseLineHeight.toFixed(4),
            "--ascii-cell-width": `${baseCellWidth.toFixed(4)}em`
          } as CSSProperties);
          setAsciiRows([]);
          setAsciiMarkup(parsedHtml.markup);
          setAvatarGridSize({ rows: parsedHtml.height, cols: parsedHtml.width });
          return true;
        }

        if (cache.type === "json" && typeof cache.data === "string") {
          const payload: AnsiAvatarPayload = JSON.parse(cache.data);
          if (!Array.isArray(payload.rows) || payload.rows.length === 0) return false;
          if (canceled) return true;
          setAsciiMarkup(null);
          setAsciiRows(parseAvatarPayload(payload));
          return true;
        }
      } catch {
        // invalid cache
      }
      return false;
    };

    const loadAvatar = async () => {
      try {
        const htmlResponse = await fetch("/ansi-avatar-source.html");
        if (htmlResponse.ok) {
          const rawHtml = await htmlResponse.text();
          const parsedHtml = parseHtmlAvatarPayload(rawHtml);
          if (parsedHtml) {
            if (canceled) return;
            saveCache("html", rawHtml);
            const baseLineHeight = 1;
            const squareCellWidth = (parsedHtml.height * baseLineHeight) / parsedHtml.width;
            const baseCellWidth = Math.max(0.2, Math.min(1, squareCellWidth));
            setAsciiStyle(
              {
                "--ascii-line-height": baseLineHeight.toFixed(4),
                "--ascii-cell-width": `${baseCellWidth.toFixed(4)}em`
              } as CSSProperties
            );
            setAsciiRows([]);
            setAsciiMarkup(parsedHtml.markup);
            setAvatarGridSize({ rows: parsedHtml.height, cols: parsedHtml.width });
            return;
          }
        }
      } catch {
        // ignore and fall back to json
      }

      try {
        const response = await fetch("/ansi-avatar.json");
        if (!response.ok) {
          throw new Error(`Cannot load avatar json: ${response.status}`);
        }
        const payload = (await response.json()) as AnsiAvatarPayload;
        if (!Array.isArray(payload.rows) || payload.rows.length === 0) {
          throw new Error("Invalid avatar rows");
        }
        if (canceled) return;
        saveCache("json", JSON.stringify(payload));
        setAsciiMarkup(null);
        setAsciiRows(parseAvatarPayload(payload));
      } catch {
        if (!canceled) {
          setAsciiMarkup(null);
          setAsciiRows(fallbackRows);
        }
      }
    };

    if (!loadFromCache()) {
      loadAvatar();
    }

    return () => {
      canceled = true;
    };
  }, []);

  useEffect(() => {
    if (!totalRevealCells) {
      setRevealedCells(0);
      return;
    }

    setRevealedCells(0);
    const step = Math.max(1, Math.ceil(totalRevealCells / 35));

    const timer = window.setInterval(() => {
      setRevealedCells((prev) => {
        if (prev >= totalRevealCells) {
          window.clearInterval(timer);
          return prev;
        }

        return Math.min(totalRevealCells, prev + step);
      });
    }, 8);

    return () => {
      window.clearInterval(timer);
    };
  }, [totalRevealCells]);

  useEffect(() => {
    if (!asciiWrapRef.current || !bodyRef.current) return;

    const usingHtmlAvatar = Boolean(asciiMarkup);
    const rows = usingHtmlAvatar ? avatarGridSize.rows : asciiRows.length;
    const cols = usingHtmlAvatar
      ? avatarGridSize.cols
      : asciiRows.reduce((max, row) => Math.max(max, row.length), 0);
    if (!rows || !cols) return;

    const baseLineHeight = usingHtmlAvatar ? 1 : 1.18;
    const squareCellWidth = (rows * baseLineHeight) / cols;
    const baseCellWidth = usingHtmlAvatar
      ? Math.max(0.2, Math.min(1, squareCellWidth))
      : 0.58;
    const minFontSize = 2;
    const maxFontSize = usingHtmlAvatar ? 20 : 16;
    const avatarScale = 1.08;

    const updateLayout = () => {
      if (window.innerWidth <= 768) {
        setAsciiStyle(
          {
            "--ascii-line-height": baseLineHeight.toFixed(4),
            "--ascii-cell-width": `${baseCellWidth.toFixed(4)}em`
          } as CSSProperties
        );
        return;
      }

      const asciiWrapEl = asciiWrapRef.current;
      const bodyEl = bodyRef.current;
      if (!asciiWrapEl || !bodyEl) return;

      const bodyHeight = bodyEl.getBoundingClientRect().height;
      if (!bodyHeight) return;

      const heightFontSize = bodyHeight / (rows * baseLineHeight);
      const nextFontSize = Math.max(
        minFontSize,
        Math.min(maxFontSize, heightFontSize * avatarScale)
      );

      setAsciiStyle((prev) => {
        const next: CSSProperties = {
          "--ascii-font-size": `${nextFontSize.toFixed(2)}px`,
          "--ascii-line-height": baseLineHeight.toFixed(4),
          "--ascii-cell-width": `${baseCellWidth.toFixed(4)}em`
        } as CSSProperties;

        if (
          prev &&
          prev["--ascii-font-size" as keyof CSSProperties] === next["--ascii-font-size" as keyof CSSProperties] &&
          prev["--ascii-line-height" as keyof CSSProperties] === next["--ascii-line-height" as keyof CSSProperties] &&
          prev["--ascii-cell-width" as keyof CSSProperties] === next["--ascii-cell-width" as keyof CSSProperties]
        ) {
          return prev;
        }

        return next;
      });
    };

    updateLayout();
    const observer = new ResizeObserver(updateLayout);
    observer.observe(bodyRef.current);
    observer.observe(asciiWrapRef.current);

    return () => {
      observer.disconnect();
    };
  }, [asciiRows, asciiMarkup, avatarGridSize]);

  const getRowRevealWidth = (rowIndex: number): string => {
    const rowLength = revealRowLengths[rowIndex] ?? 0;
    if (!rowLength) return "0%";

    const rowStart = revealRowOffsets[rowIndex] ?? 0;
    const visibleInRow = Math.max(0, Math.min(rowLength, revealedCells - rowStart));
    return `${((visibleInRow / rowLength) * 100).toFixed(2)}%`;
  };

  return (
    <div className="home-terminal" aria-label="home-terminal">
      <div className="home-terminal__ascii-wrap" ref={asciiWrapRef}>
        {asciiMarkup ? (
          <div className="home-terminal__ascii home-terminal__ascii--html" aria-label="ascii-avatar" style={asciiStyle}>
            {htmlRows.map((rowMarkup, rowIndex) => (
              <div
                key={`ascii-html-row-${rowIndex}`}
                className={`home-terminal__ascii-row ${revealedCells > (revealRowOffsets[rowIndex] ?? 0) ? "is-visible" : ""}`}
                style={{ "--row-reveal-width": getRowRevealWidth(rowIndex) } as CSSProperties}
                dangerouslySetInnerHTML={{ __html: rowMarkup }}
              />
            ))}
          </div>
        ) : (
          <div className="home-terminal__ascii" aria-label="ascii-avatar" style={asciiStyle}>
            {asciiRows.length
              ? asciiRows.map((row, rowIndex) => (
                  <div
                    key={`ascii-row-${rowIndex}`}
                    className={`home-terminal__ascii-row ${revealedCells > (revealRowOffsets[rowIndex] ?? 0) ? "is-visible" : ""}`}
                    style={{ "--row-reveal-width": getRowRevealWidth(rowIndex) } as CSSProperties}
                  >
                    {row.map((cell, colIndex) => (
                      <span
                        key={`ascii-cell-${rowIndex}-${colIndex}`}
                        className="home-terminal__ascii-cell"
                        style={{ color: cell.color }}
                      >
                        {cell.glyph}
                      </span>
                    ))}
                  </div>
                ))
              : null}
          </div>
        )}
      </div>

      <div className="home-terminal__body" ref={bodyRef}>
        <p className="home-terminal__prompt">
          <span className="tone-cyan">user@waijade</span>
          <span className="tone-sep">:</span>
          <span className="tone-purple">~</span>
          <span className="tone-sep">$</span>
          <span className="home-terminal__command">whoami</span>
        </p>

        <h1 className="home-terminal__title">
          <span className="home-terminal__title-mark">&gt;</span>
          <span className="home-terminal__title-text">WaiJade</span>
          <span className="home-terminal__cursor" aria-hidden="true">
            _
          </span>
        </h1>

        <div className="home-terminal__lines" aria-live="polite">
          {terminalEntries.map((entry, index) => (
            <p key={`terminal-line-${entry.tone}-${index}`} className={`home-terminal__line home-terminal__line--${entry.tone}`}>
              {entry.tone === "quote" ? (
                <span className="home-terminal__quote-wrap">
                  <span className="home-terminal__quote-bar" aria-hidden="true" />
                  <span className="home-terminal__quote-text">
                    "
                    <TextType
                      as="span"
                      className="home-terminal__quote-type"
                      text={[...quoteOptions]}
                      typingSpeed={75}
                      pauseDuration={1500}
                      deletingSpeed={50}
                      showCursor
                      cursorCharacter="_"
                      cursorClassName="home-terminal__quote-cursor"
                    />
                    "
                  </span>
                </span>
              ) : (
                entry.text
              )}
            </p>
          ))}
        </div>

        <div className="home-terminal__social" aria-label="social-links">
          {socialLinks.map((link, index) => (
            <a
              key={link.label}
              className="home-terminal__social-link"
              href={link.href}
              aria-label={link.label}
              title={link.label}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noreferrer" : undefined}
              style={
                {
                  "--social-color": link.color,
                  animationDelay: `${0.6 + index * 0.1}s`
                } as CSSProperties
              }
            >
              <span className="home-terminal__social-icon" aria-hidden="true">
                {renderSocialIcon(link.icon)}
              </span>
            </a>
          ))}
          <a
            className="home-terminal__social-link"
            href="https://www.bandbbs.cn/members/344224/"
            aria-label="BandBBS"
            title="BandBBS"
            target="_blank"
            rel="noreferrer"
            style={
              {
                "--social-color": "rgb(255 255 255)",
                animationDelay: `${0.6 + socialLinks.length * 0.1}s`
              } as CSSProperties
            }
          >
            <span className="home-terminal__social-icon" aria-hidden="true">
              {renderSocialIcon("vibecoding")}
            </span>
          </a>
        </div>

        <div className="home-terminal__actions animate-fadeInUp" style={{ animationDelay: "0.85s" }}>
          {actionLinks.map((action) => (
            <a
              key={action.label}
              className={`home-terminal__action ${action.emphasis ? "is-emphasis" : ""}`}
              href={action.href}
              target={action.external ? "_blank" : undefined}
              rel={action.external ? "noreferrer" : undefined}
            >
              <span className="home-terminal__action-label">{action.label}</span>
              <span
                className={`home-terminal__action-icon ${action.icon === "mail" ? "is-mail" : ""}`}
                aria-hidden="true"
                style={action.external ? { filter: "none" } : undefined}
              >
                {renderActionIcon(action.icon)}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HomeTerminal;
