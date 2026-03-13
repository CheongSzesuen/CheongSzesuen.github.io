import { useEffect, useRef, useState } from "react";
import HomeTerminal from "./components/HomeTerminal";
import SiteFooter from "./components/SiteFooter";
import StaggeredMenu, { type StaggeredMenuItem, type StaggeredMenuSocialItem } from "./components/StaggeredMenu";
import { aboutContent } from "./content/about";
import { friendsLinks } from "./content/friends";

const navItems = [
  { id: "home", label: "HOME", href: "#home" },
  { id: "about", label: "ABOUT", href: "#about" },
  { id: "works", label: "WORKS", href: "#works" },
  { id: "friends", label: "FRIENDS", href: "#friends" }
] as const;

const mobileMenuItems: StaggeredMenuItem[] = [
  { label: "HOME", ariaLabel: "Go to home section", link: "#home" },
  { label: "ABOUT", ariaLabel: "Go to about section", link: "#about" },
  { label: "WORKS", ariaLabel: "Go to works section", link: "#works" },
  { label: "FRIENDS", ariaLabel: "Go to friends section", link: "#friends" }
];

const mobileSocialItems: StaggeredMenuSocialItem[] = [
  { label: "GitHub", link: "https://github.com/CheongSzesuen" },
  { label: "BandBBS", link: "https://www.bandbbs.cn/members/344224/" }
];

function App() {
  const [activeSection, setActiveSection] = useState<(typeof navItems)[number]["id"]>("home");
  const [showHeader, setShowHeader] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuOpenRef = useRef(false);
  const hideHeaderTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    mobileMenuOpenRef.current = isMobileMenuOpen;
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const sections = navItems
      .map((item) => document.getElementById(item.id))
      .filter((section): section is HTMLElement => Boolean(section));
    if (!sections.length) return;
    const homeSection = document.getElementById("home");
    const aboutSection = document.getElementById("about");

    let ticking = false;
    let lastScrollY = window.scrollY;
    let lastGridOpacity = -1;
    let lastBrightOpacity = -1;
    const getSectionTop = (section: HTMLElement) => section.getBoundingClientRect().top + window.scrollY;
    const updateHeroBackgroundFade = () => {
      if (!homeSection || !aboutSection) {
        if (lastGridOpacity !== 0.4) {
          document.documentElement.style.setProperty("--hero-grid-opacity", "0.4");
          lastGridOpacity = 0.4;
        }
        if (lastBrightOpacity !== 1) {
          document.documentElement.style.setProperty("--hero-bright-opacity", "1");
          lastBrightOpacity = 1;
        }
        return;
      }

      const homeTop = getSectionTop(homeSection);
      const aboutTop = getSectionTop(aboutSection);
      const totalDistance = Math.max(aboutTop - homeTop, 1);
      const progress = Math.min(1, Math.max(0, (window.scrollY - homeTop) / totalDistance));
      const nextGridOpacity = Number((0.4 * (1 - progress)).toFixed(3));
      const nextBrightOpacity = Number((1 - progress).toFixed(3));

      if (nextGridOpacity !== lastGridOpacity) {
        document.documentElement.style.setProperty("--hero-grid-opacity", nextGridOpacity.toString());
        lastGridOpacity = nextGridOpacity;
      }

      if (nextBrightOpacity !== lastBrightOpacity) {
        document.documentElement.style.setProperty("--hero-bright-opacity", nextBrightOpacity.toString());
        lastBrightOpacity = nextBrightOpacity;
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

      const aboutTopInViewport = aboutSection
        ? aboutSection.getBoundingClientRect().top
        : Number.POSITIVE_INFINITY;
      const isScrollingUp = window.scrollY < lastScrollY;
      const headerShowTriggerRatio = window.innerWidth <= 768 ? 0.82 : 0.72;
      const headerHideTriggerRatio = window.innerWidth <= 768 ? 0.74 : 0.66;
      const headerTriggerRatio = isScrollingUp ? headerHideTriggerRatio : headerShowTriggerRatio;
      const shouldShowHeader = aboutTopInViewport <= window.innerHeight * headerTriggerRatio;
      const isTabletViewport = window.innerWidth > 768 && window.innerWidth <= 1024;

      if (!shouldShowHeader && isTabletViewport && mobileMenuOpenRef.current) {
        setIsMobileMenuOpen(false);
        if (hideHeaderTimeoutRef.current !== null) {
          window.clearTimeout(hideHeaderTimeoutRef.current);
        }
        setShowHeader(true);
        hideHeaderTimeoutRef.current = window.setTimeout(() => {
          setShowHeader(false);
          hideHeaderTimeoutRef.current = null;
        }, 340);
      } else {
        if (hideHeaderTimeoutRef.current !== null) {
          window.clearTimeout(hideHeaderTimeoutRef.current);
          hideHeaderTimeoutRef.current = null;
        }
        setShowHeader((prev) => (prev === shouldShowHeader ? prev : shouldShowHeader));
      }

      updateHeroBackgroundFade();
      lastScrollY = window.scrollY;
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
      document.documentElement.style.removeProperty("--hero-bright-opacity");
      if (hideHeaderTimeoutRef.current !== null) {
        window.clearTimeout(hideHeaderTimeoutRef.current);
        hideHeaderTimeoutRef.current = null;
      }
    };
  }, []);

  return (
    <div className="page">
      <div className="page__bg" aria-hidden="true">
        <div className="hero__grid" />
        <div className="hero__glow" />
        <div className="hero__vignette" />
      </div>

      <header className={`topbar ${showHeader ? "is-visible" : ""}`} aria-label="main-header">
        <div className="topbar__fade" aria-hidden="true" />
        <div className="topbar__inner">
          <a className="topbar__brand" href="#home">
            <img src="/favicon.png" alt="WaiJade 头像" />
            <span>WaiJade</span>
          </a>

          <nav className="topbar__nav-wrap topbar__nav-wrap--desktop" aria-label="主导航">
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

          <div className="topbar__mobile-menu" aria-label="移动端导航">
            <StaggeredMenu
              open={isMobileMenuOpen}
              onOpenChange={setIsMobileMenuOpen}
              position="right"
              items={mobileMenuItems}
              socialItems={mobileSocialItems}
              displaySocials
              displayItemNumbering
              menuButtonColor="rgba(255, 255, 255, 0.8)"
              openMenuButtonColor="#fff"
              changeMenuColorOnOpen
              colors={["rgba(85, 111, 186, 0.92)", "rgba(24, 38, 72, 0.98)"]}
              accentColor="#8fa7ff"
            />
          </div>
        </div>
      </header>

      <section id="home" className="hero" aria-label="first-screen">
        <div className="hero__content">
          <HomeTerminal />
        </div>
      </section>

      <main className="scroll-content" aria-label="scroll-sections">
        <section id="about" className="anchor-section about-section">
          <div className="about-section__container animate-fadeIn">
            <h2 className="about-section__title">
              <span className="about-section__title-text">{aboutContent.title}</span>
            </h2>

            <div className="about-section__copy">
              <p className="about-section__lead" dangerouslySetInnerHTML={{ __html: aboutContent.lead }} />
              {aboutContent.paragraphs.map((paragraph, index) => (
                <p
                  key={`about-paragraph-${index}`}
                  className="about-section__text"
                  dangerouslySetInnerHTML={{ __html: paragraph }}
                />
              ))}
            </div>

            <div className="about-section__gallery about-section__gallery--placeholder" aria-label="about-gallery-placeholder" />
          </div>
        </section>
        <section id="works" className="anchor-section">
          <h2>Works</h2>
          <p>这里是作品区块，后续按你的指令填充项目卡片与详情。</p>
        </section>
        <section id="friends" className="anchor-section">
          <h2>Friends</h2>
          <div className="friends-grid" aria-label="friends-links">
            {friendsLinks.map((friend, index) => (
              <a
                key={`${friend.name}-${friend.url}`}
                href={friend.url}
                target="_blank"
                rel="noopener noreferrer"
                className="friend-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="friend-card__inner">
                  <div className="friend-card__avatar-wrap">
                    <img
                      className="friend-card__avatar"
                      src={friend.avatar}
                      alt={friend.name}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="friend-card__meta">
                    <h3 className="friend-card__name">{friend.name}</h3>
                    {friend.description ? <p className="friend-card__desc">{friend.description}</p> : null}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

export default App;
