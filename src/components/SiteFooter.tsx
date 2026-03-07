import type { CSSProperties } from "react";

const footerName = "WaiJade";

function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="astro-footer" aria-label="site-footer">
      <div className="astro-footer__lines astro-footer__lines--top" aria-hidden="true">
        <img src="/footer/footer-top.png" alt="" loading="lazy" />
      </div>

      <div className="astro-footer__content">
        <h2 className="astro-footer__wordmark" aria-label={footerName}>
          {footerName.split("").map((char, index) => {
            return (
              <span
                key={`${char}-${index}`}
                className="astro-footer__glyph-wrap"
                style={{ "--index": index } as CSSProperties}
              >
                <span className="astro-footer__glyph">{char}</span>
              </span>
            );
          })}
        </h2>

        <div className="astro-footer__bottom">
          <span>© {currentYear} WaiJade. Crafted with passion and code.</span>
        </div>
      </div>

      <div className="astro-footer__lines astro-footer__lines--bottom" aria-hidden="true">
        <img src="/footer/footer-bottom.png" alt="" loading="lazy" />
      </div>
    </footer>
  );
}

export default SiteFooter;
