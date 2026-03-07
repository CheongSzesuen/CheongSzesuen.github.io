const socialLinks = [
  { label: "GitHub", href: "https://github.com/WaiJade", short: "GH" },
  { label: "X", href: "https://x.com", short: "X" },
  { label: "Figma", href: "https://www.figma.com", short: "Fg" },
  { label: "Email", href: "mailto:hello@waijade.com", short: "@" }
] as const;

const productLinks = [
  { label: "首页", href: "#home" },
  { label: "关于", href: "#about" },
  { label: "作品", href: "#works" }
] as const;

const resourceLinks = [
  { label: "友链", href: "#friends" },
  { label: "GitHub", href: "https://github.com/WaiJade", external: true },
  { label: "联系", href: "mailto:hello@waijade.com", external: true }
] as const;

function SiteFooter() {
  const currentYear = new Date().getFullYear();

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  return (
    <footer className="site-footer" aria-label="site-footer">
      <div className="site-footer__line site-footer__line--top" aria-hidden="true" />

      <div className="site-footer__content">
        <div className="site-footer__grid">
          <div className="site-footer__backtop site-footer__span2">
            <button className="site-footer__back-top" type="button" onClick={handleBackToTop}>
              <span>回到顶部</span>
              <span aria-hidden="true">↗</span>
            </button>
          </div>
        </div>

        <div className="site-footer__grid">
          <div className="site-footer__hero site-footer__span2">
            <h2>Keep Building, Keep Exploring.</h2>
            <div className="site-footer__social" aria-label="social-links">
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  aria-label={item.label}
                  target="_blank"
                  rel="noreferrer"
                >
                  {item.short}
                </a>
              ))}
            </div>
          </div>

          <div className="site-footer__links">
            <p className="site-footer__col-title">产品</p>
            <ul>
              {productLinks.map((item) => (
                <li key={item.href}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="site-footer__links">
            <p className="site-footer__col-title">资源</p>
            <ul>
              {resourceLinks.map((item) => {
                const isExternal = "external" in item && item.external;
                return (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noreferrer" : undefined}
                    >
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <p className="site-footer__wordmark" aria-hidden="true">
          WAIJADE
        </p>

        <div className="site-footer__bottom site-footer__grid">
          <span className="site-footer__span2">WaiJade Studio</span>
          <span>Copyright {currentYear} All rights reserved.</span>
        </div>
      </div>

      <div className="site-footer__line site-footer__line--bottom" aria-hidden="true" />
    </footer>
  );
}

export default SiteFooter;
