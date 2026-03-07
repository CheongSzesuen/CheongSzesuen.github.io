import { useEffect, useState } from "react";
import SiteFooter from "./components/SiteFooter";

const navItems = [
  { id: "home", label: "Home", href: "#home" },
  { id: "about", label: "About", href: "#about" },
  { id: "works", label: "Works", href: "#works" },
  { id: "friends", label: "Friends", href: "#friends" }
] as const;

function App() {
  const [activeSection, setActiveSection] = useState<(typeof navItems)[number]["id"]>("home");
  const [showHeader, setShowHeader] = useState(false);

  useEffect(() => {
    const sections = navItems
      .map((item) => document.getElementById(item.id))
      .filter((section): section is HTMLElement => Boolean(section));
    if (!sections.length) return;
    const homeSection = document.getElementById("home");
    const aboutSection = document.getElementById("about");

    let ticking = false;
    let lastGridOpacity = -1;
    const getSectionTop = (section: HTMLElement) => section.getBoundingClientRect().top + window.scrollY;
    const updateGridOpacity = () => {
      if (!homeSection || !aboutSection) {
        if (lastGridOpacity !== 0.4) {
          document.documentElement.style.setProperty("--hero-grid-opacity", "0.4");
          lastGridOpacity = 0.4;
        }
        return;
      }

      const homeTop = getSectionTop(homeSection);
      const aboutTop = getSectionTop(aboutSection);
      const totalDistance = Math.max(aboutTop - homeTop, 1);
      const progress = Math.min(1, Math.max(0, (window.scrollY - homeTop) / totalDistance));
      const nextGridOpacity = Number((0.4 * (1 - progress)).toFixed(3));

      if (nextGridOpacity !== lastGridOpacity) {
        document.documentElement.style.setProperty("--hero-grid-opacity", nextGridOpacity.toString());
        lastGridOpacity = nextGridOpacity;
      }
    };

    const updateActiveSection = () => {
      const aboutTop = aboutSection ? getSectionTop(aboutSection) : window.innerHeight;
      const isInHome = aboutSection
        ? window.scrollY + 1 < aboutTop
        : window.scrollY < window.innerHeight * 0.9;
      let current: (typeof navItems)[number]["id"] = "home";

      if (!isInHome) {
        const marker = window.scrollY + 112;
        for (const section of sections) {
          if (section.id === "home") continue;
          if (getSectionTop(section) <= marker) {
            current = section.id as (typeof navItems)[number]["id"];
          } else {
            break;
          }
        }
      }

      setActiveSection((prev) => (prev === current ? prev : current));

      const shouldShowHeader = current !== "home";
      setShowHeader((prev) => (prev === shouldShowHeader ? prev : shouldShowHeader));

      updateGridOpacity();
    };

    const onScrollOrResize = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        updateActiveSection();
        ticking = false;
      });
    };

    updateActiveSection();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      document.documentElement.style.removeProperty("--hero-grid-opacity");
    };
  }, []);

  return (
    <div className="page">
      <div className="page__bg" aria-hidden="true">
        <div className="hero__grid" />
        <div className="hero__glow" />
        <div className="hero__vignette" />
      </div>

      <header className={`topbar ${showHeader ? "is-visible" : ""}`} aria-label="main-header" data-nav-header>
        <div className="topbar__fade" aria-hidden="true" />
        <div className="topbar__inner">
          <a className="topbar__brand" href="#home">
            <img src="/favicon.png" alt="WaiJade 头像" />
            <span>WaiJade</span>
          </a>

          <nav className="topbar__nav-wrap" aria-label="主导航">
            <ul className="topbar__nav">
              {navItems.map((item) => (
                <li key={item.href}>
                  <a
                    className={activeSection === item.id ? "is-active" : ""}
                    href={item.href}
                    aria-current={activeSection === item.id ? "page" : undefined}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <section id="home" className="hero" aria-label="first-screen">
        <div className="hero__content">
          <p className="hero__tag">Phase 01</p>
          <h1 className="hero__title">WaiJade</h1>
          <p className="hero__hint">后续内容按你的要求逐步添加</p>
        </div>
      </section>

      <main className="scroll-content" aria-label="scroll-sections">
        <section id="about" className="anchor-section">
          <h2>About</h2>
          <p>这里是关于区块，后续按你的指令填充真实内容。</p>
        </section>
        <section id="works" className="anchor-section">
          <h2>Works</h2>
          <p>这里是作品区块，后续按你的指令填充项目卡片与详情。</p>
        </section>
        <section id="friends" className="anchor-section">
          <h2>Friends</h2>
          <p>这里是友链区块，后续按你的指令填充列表与交互。</p>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

export default App;
