import type { CSSProperties } from "react";

type SocialLink = {
  label: string;
  href: string;
  symbol: string;
  external?: boolean;
};

const contactEmail = "WaiJade@outlook.com";
const showFooterActions = false;

const socialLinks: SocialLink[] = [
  { label: "Email", href: `mailto:${contactEmail}`, symbol: "✉" },
  { label: "GitHub", href: "https://github.com/WaiJade", symbol: "GH", external: true },
  { label: "CodePen", href: "https://codepen.io", symbol: "CP", external: true },
  { label: "X", href: "https://x.com", symbol: "X", external: true },
  { label: "Bluesky", href: "https://bsky.app", symbol: "BS", external: true },
  { label: "Telegram", href: "https://t.me", symbol: "TG", external: true },
  { label: "YouTube", href: "https://www.youtube.com", symbol: "YT", external: true },
  { label: "Bilibili", href: "https://www.bilibili.com", symbol: "B", external: true }
];

const footerName = "WaiJade";

function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer" aria-label="site-footer">
      <div className="site-footer__content">
        {showFooterActions && (
          <>
            <div className="site-footer__social-row">
              {socialLinks.map((item, index) => {
                const linkStyle = {
                  "--index": index
                } as CSSProperties;

                return (
                  <a
                    key={item.label}
                    href={item.href}
                    className="site-footer__social-link"
                    style={linkStyle}
                    aria-label={item.label}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noreferrer" : undefined}
                  >
                    <span className="site-footer__social-symbol" aria-hidden="true">
                      {item.symbol}
                    </span>
                    <span className="site-footer__social-label">{item.label}</span>
                  </a>
                );
              })}
            </div>

            <a className="site-footer__cta" href={`mailto:${contactEmail}`}>
              <span>Get in Touch</span>
              <span aria-hidden="true">↗</span>
            </a>
          </>
        )}

        <div className="site-footer__brand-wrap">
          <h2 className="site-footer__name" aria-label={footerName}>
            {footerName.split("").map((char, index) => (
              <span key={`${char}-${index}`} className="site-footer__char">
                {char}
              </span>
            ))}
          </h2>
          <p className="site-footer__copyright">© {currentYear} WaiJade. Crafted with passion and code.</p>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
