import aboutEnSource from "./about.en.mdx?raw";
import aboutZhSource from "./about.zh.mdx?raw";
import type { Locale } from "./locale";

export type AboutContent = {
  title: string;
  lead: string;
  paragraphs: string[];
};

const FRONTMATTER_PATTERN = /^\s*---\s*\n([\s\S]*?)\n\s*---\s*\n?/;
const FRONTMATTER_LINE_PATTERN = /^([a-zA-Z][\w-]*):\s*(.*)$/;
const PARAGRAPH_PATTERN = /<p>([\s\S]*?)<\/p>/g;

function parseFrontmatter(raw: string) {
  const matched = raw.match(FRONTMATTER_PATTERN);
  if (!matched) {
    throw new Error("about.mdx 缺少 frontmatter");
  }

  const fields = matched[1]
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((result, line) => {
      const fieldMatch = line.match(FRONTMATTER_LINE_PATTERN);
      if (!fieldMatch) {
        return result;
      }

      result[fieldMatch[1]] = fieldMatch[2].trim();
      return result;
    }, {});

  return {
    fields,
    body: raw.slice(matched[0].length)
  };
}

function parseParagraphs(body: string) {
  const paragraphs = Array.from(body.matchAll(PARAGRAPH_PATTERN), (match) => match[1].trim()).filter(Boolean);

  if (!paragraphs.length) {
    throw new Error("about.mdx 缺少正文段落");
  }

  return paragraphs;
}

function parseAboutContent(raw: string): AboutContent {
  const { fields, body } = parseFrontmatter(raw);
  const title = fields.title;
  const lead = fields.lead;

  if (!title) {
    throw new Error("about.mdx 缺少 title");
  }

  if (!lead) {
    throw new Error("about.mdx 缺少 lead");
  }

  return {
    title,
    lead,
    paragraphs: parseParagraphs(body)
  };
}

const aboutContentByLocale: Record<Locale, AboutContent> = {
  zh: parseAboutContent(aboutZhSource),
  en: parseAboutContent(aboutEnSource)
};

export function getAboutContent(locale: Locale): AboutContent {
  return aboutContentByLocale[locale];
}
