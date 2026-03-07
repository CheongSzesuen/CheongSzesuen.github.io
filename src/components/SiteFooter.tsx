import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";

const footerName = "WaiJade";

function SiteFooter() {
  const currentYear = new Date().getFullYear();
  const footerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    const footer = footerRef.current;
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.75) {
          root.classList.add("hide-nav-header");
        } else {
          root.classList.remove("hide-nav-header");
        }
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    observer.observe(footer);

    return () => {
      observer.disconnect();
      root.classList.remove("hide-nav-header");
    };
  }, []);

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  return (
    <footer ref={footerRef} className="astro-footer" aria-label="site-footer">
      <div className="astro-footer__lines astro-footer__lines--top" aria-hidden="true">
        <img src="/footer/footer-top.png" alt="" loading="lazy" />
      </div>

      <div className="astro-footer__content">
        <div className="astro-footer__grid">
          <div className="astro-footer__backtop astro-footer__span2">
            <button className="astro-footer__back-top" type="button" onClick={handleBackToTop}>
              <span>回到顶部</span>
              <span aria-hidden="true">↗</span>
            </button>
          </div>
        </div>

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
