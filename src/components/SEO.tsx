import { Helmet } from "react-helmet-async";
import type { Locale } from "../content/locale";

const siteUrl = "https://cheongszesuen.github.io";

const seoData: Record<Locale, {
  title: string;
  description: string;
  ogLocale: string;
  htmlLang: string;
}> = {
  zh: {
    title: "WaiJade",
    description: "WaiJade的个人网站，一名热衷开源的前端开发者，Vibe Coding Enjoyer。",
    ogLocale: "zh_CN",
    htmlLang: "zh-CN"
  },
  en: {
    title: "WaiJade",
    description: "WaiJade的个人网站，一名热衷开源的前端开发者，Vibe Coding Enjoyer。",
    ogLocale: "en_US",
    htmlLang: "en"
  }
};

type SEOProps = {
  locale: Locale;
};

function SEO({ locale }: SEOProps) {
  const data = seoData[locale];

  return (
    <Helmet>
      <html lang={data.htmlLang} />
      <title>{data.title}</title>
      <meta name="description" content={data.description} />
      <link rel="canonical" href={siteUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:title" content={data.title} />
      <meta property="og:description" content={data.description} />
      <meta property="og:locale" content={data.ogLocale} />
      <meta property="og:image" content={`${siteUrl}/avatar.png`} />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={data.title} />
      <meta name="twitter:description" content={data.description} />
      <meta name="twitter:image" content={`${siteUrl}/avatar.png`} />
      <link rel="alternate" hrefLang="zh" href={siteUrl} />
      <link rel="alternate" hrefLang="en" href={siteUrl} />
      <link rel="alternate" hrefLang="x-default" href={siteUrl} />
    </Helmet>
  );
}

export default SEO;
