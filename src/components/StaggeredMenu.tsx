import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent
} from "react";
import { gsap } from "gsap";
import "./StaggeredMenu.css";

export interface StaggeredMenuItem {
  label: string;
  ariaLabel: string;
  link: string;
}

export interface StaggeredMenuSocialItem {
  label: string;
  link: string;
}

export interface StaggeredMenuProps {
  position?: "left" | "right";
  colors?: string[];
  items?: StaggeredMenuItem[];
  socialItems?: StaggeredMenuSocialItem[];
  displaySocials?: boolean;
  displayItemNumbering?: boolean;
  className?: string;
  menuButtonColor?: string;
  openMenuButtonColor?: string;
  accentColor?: string;
  changeMenuColorOnOpen?: boolean;
  closeOnClickAway?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
}

function StaggeredMenu({
  position = "right",
  colors = ["rgba(70, 92, 158, 0.96)", "rgba(18, 29, 56, 0.98)"],
  items = [],
  socialItems = [],
  displaySocials = true,
  displayItemNumbering = true,
  className,
  menuButtonColor = "rgba(255, 255, 255, 0.8)",
  openMenuButtonColor = "#fff",
  accentColor = "#8fa7ff",
  changeMenuColorOnOpen = true,
  closeOnClickAway = true,
  open: controlledOpen,
  onOpenChange,
  onMenuOpen,
  onMenuClose
}: StaggeredMenuProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const preLayersRef = useRef<HTMLDivElement | null>(null);
  const toggleBtnRef = useRef<HTMLButtonElement | null>(null);
  const openTlRef = useRef<gsap.core.Timeline | null>(null);
  const closeTweenRef = useRef<gsap.core.Tween | null>(null);
  const colorTweenRef = useRef<gsap.core.Tween | null>(null);
  const hasMountedRef = useRef(false);
  const openRef = useRef(false);

  const offscreenPercent = position === "left" ? -100 : 100;
  const open = controlledOpen ?? uncontrolledOpen;

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current;
      const preLayers = preLayersRef.current
        ? (Array.from(preLayersRef.current.querySelectorAll<HTMLElement>(".sm-prelayer")) ?? [])
        : [];

      if (panel) {
        gsap.set(panel, { xPercent: offscreenPercent });
      }

      if (preLayers.length) {
        gsap.set(preLayers, { xPercent: offscreenPercent });
      }

      if (toggleBtnRef.current) {
        gsap.set(toggleBtnRef.current, { color: menuButtonColor });
      }
    });

    return () => ctx.revert();
  }, [menuButtonColor, offscreenPercent]);

  const updateButtonColor = useCallback(
    (isOpen: boolean) => {
      const btn = toggleBtnRef.current;
      if (!btn) return;

      colorTweenRef.current?.kill();
      if (!changeMenuColorOnOpen) {
        gsap.set(btn, { color: menuButtonColor });
        return;
      }

      colorTweenRef.current = gsap.to(btn, {
        color: isOpen ? openMenuButtonColor : menuButtonColor,
        duration: 0.26,
        ease: "power2.out"
      });
    },
    [changeMenuColorOnOpen, menuButtonColor, openMenuButtonColor]
  );

  const playOpen = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const preLayers = preLayersRef.current
      ? (Array.from(preLayersRef.current.querySelectorAll<HTMLElement>(".sm-prelayer")) ?? [])
      : [];

    openTlRef.current?.kill();
    closeTweenRef.current?.kill();

    const itemLabels = Array.from(panel.querySelectorAll<HTMLElement>(".sm-panel-itemLabel"));
    const itemNumbers = Array.from(panel.querySelectorAll<HTMLElement>(".sm-panel-itemNumber"));
    const socialTitle = panel.querySelector<HTMLElement>(".sm-socials-title");
    const socialLinks = Array.from(panel.querySelectorAll<HTMLElement>(".sm-socials-link"));

    gsap.set(itemLabels, { yPercent: 120, opacity: 0 });
    gsap.set(itemNumbers, { opacity: 0 });
    if (socialTitle) gsap.set(socialTitle, { opacity: 0, y: 8 });
    gsap.set(socialLinks, { opacity: 0, y: 20 });

    const tl = gsap.timeline();

    if (preLayers.length) {
      tl.to(preLayers, {
        xPercent: 0,
        duration: 0.44,
        ease: "power4.out",
        stagger: 0.06
      });
    }

    tl.to(
      panel,
      {
        xPercent: 0,
        duration: 0.58,
        ease: "power4.out"
      },
      preLayers.length ? "<+0.08" : 0
    );

    if (itemLabels.length) {
      tl.to(
        itemLabels,
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.55,
          ease: "power3.out",
          stagger: 0.08
        },
        "<+0.1"
      );
    }

    if (itemNumbers.length) {
      tl.to(
        itemNumbers,
        {
          opacity: 1,
          duration: 0.35,
          stagger: 0.08,
          ease: "power2.out"
        },
        "<+0.03"
      );
    }

    if (socialTitle || socialLinks.length) {
      if (socialTitle) {
        tl.to(
          socialTitle,
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: "power2.out"
          },
          "<+0.1"
        );
      }

      if (socialLinks.length) {
        tl.to(
          socialLinks,
          {
            opacity: 1,
            y: 0,
            duration: 0.45,
            stagger: 0.07,
            ease: "power3.out"
          },
          "<+0.02"
        );
      }
    }

    openTlRef.current = tl;
  }, []);

  const playClose = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) return;

    openTlRef.current?.kill();
    closeTweenRef.current?.kill();

    const preLayers = preLayersRef.current
      ? (Array.from(preLayersRef.current.querySelectorAll<HTMLElement>(".sm-prelayer")) ?? [])
      : [];

    closeTweenRef.current = gsap.to([...preLayers, panel], {
      xPercent: offscreenPercent,
      duration: 0.32,
      ease: "power3.in"
    });
  }, [offscreenPercent]);

  const setMenuOpen = useCallback(
    (nextOpen: boolean) => {
      if (controlledOpen === undefined) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [controlledOpen, onOpenChange]
  );

  const closeMenu = useCallback(() => {
    if (!openRef.current) return;
    setMenuOpen(false);
  }, [setMenuOpen]);

  const toggleMenu = useCallback(() => {
    setMenuOpen(!openRef.current);
  }, [setMenuOpen]);

  const smoothScrollToHash = useCallback((hashLink: string) => {
    if (!hashLink.startsWith("#")) return;
    const sectionId = hashLink.slice(1);
    if (!sectionId) return;

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const section = document.getElementById(sectionId);
        if (!section) return;

        const isMobileViewport = window.matchMedia("(max-width: 768px)").matches;
        const scrollOffset = isMobileViewport ? 0 : window.innerWidth <= 1024 ? 94 : 108;
        const targetTop = Math.max(0, section.getBoundingClientRect().top + window.scrollY - scrollOffset);

        window.scrollTo({
          top: targetTop,
          behavior: "smooth"
        });
      });
    });
  }, []);

  const handleMenuItemClick = useCallback(
    (event: ReactMouseEvent<HTMLAnchorElement>, link: string) => {
      if (!link.startsWith("#")) {
        closeMenu();
        return;
      }

      event.preventDefault();
      closeMenu();
      smoothScrollToHash(link);
    },
    [closeMenu, smoothScrollToHash]
  );

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      updateButtonColor(open);
      if (open) {
        playOpen();
      }
      return;
    }

    if (open) {
      playOpen();
      updateButtonColor(true);
      onMenuOpen?.();
      return;
    }

    playClose();
    updateButtonColor(false);
    onMenuClose?.();
  }, [onMenuClose, onMenuOpen, open, playClose, playOpen, updateButtonColor]);

  useEffect(() => {
    if (!open || !closeOnClickAway) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const panel = panelRef.current;
      const btn = toggleBtnRef.current;
      if (!panel || !btn) return;
      if (!panel.contains(target) && !btn.contains(target)) {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeMenu, closeOnClickAway, open]);

  useEffect(() => {
    if (!open) return;
    if (!window.matchMedia("(max-width: 768px)").matches) return;

    const htmlStyle = document.documentElement.style;
    const bodyStyle = document.body.style;
    const scrollY = window.scrollY;

    const previousStyle = {
      htmlOverflow: htmlStyle.overflow,
      htmlScrollBehavior: htmlStyle.scrollBehavior,
      bodyOverflow: bodyStyle.overflow,
      bodyPosition: bodyStyle.position,
      bodyTop: bodyStyle.top,
      bodyLeft: bodyStyle.left,
      bodyRight: bodyStyle.right,
      bodyWidth: bodyStyle.width,
      bodyTouchAction: bodyStyle.touchAction
    };

    htmlStyle.overflow = "hidden";
    bodyStyle.overflow = "hidden";
    bodyStyle.position = "fixed";
    bodyStyle.top = `-${scrollY}px`;
    bodyStyle.left = "0";
    bodyStyle.right = "0";
    bodyStyle.width = "100%";
    bodyStyle.touchAction = "none";

    return () => {
      htmlStyle.overflow = previousStyle.htmlOverflow;
      bodyStyle.overflow = previousStyle.bodyOverflow;
      bodyStyle.position = previousStyle.bodyPosition;
      bodyStyle.top = previousStyle.bodyTop;
      bodyStyle.left = previousStyle.bodyLeft;
      bodyStyle.right = previousStyle.bodyRight;
      bodyStyle.width = previousStyle.bodyWidth;
      bodyStyle.touchAction = previousStyle.bodyTouchAction;
      htmlStyle.scrollBehavior = "auto";
      window.scrollTo(0, scrollY);
      window.requestAnimationFrame(() => {
        htmlStyle.scrollBehavior = previousStyle.htmlScrollBehavior;
      });
    };
  }, [open]);

  return (
    <div
      className={`sm-wrapper ${className ?? ""} ${open ? "is-open" : ""}`.trim()}
      data-position={position}
      style={{ "--sm-accent": accentColor } as CSSProperties}
    >
      <div ref={preLayersRef} className="sm-prelayers" aria-hidden="true">
        {colors.map((color, idx) => (
          <div key={`${color}-${idx}`} className="sm-prelayer" style={{ background: color }} />
        ))}
      </div>

      <button
        ref={toggleBtnRef}
        className="sm-toggle-btn"
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-staggered-menu-panel"
        onClick={toggleMenu}
      >
        <div className="sm-toggle-icon">
          <span className="sm-toggle-line sm-toggle-line--top" />
          <span className="sm-toggle-line sm-toggle-line--bottom" />
        </div>
      </button>

      <aside id="mobile-staggered-menu-panel" ref={panelRef} className="sm-panel" aria-hidden={!open}>
        <div className="sm-panel-inner">
          <ul className="sm-panel-list" role="list">
            {items.map((item, idx) => (
              <li key={`${item.link}-${idx}`}>
                <a
                  href={item.link}
                  aria-label={item.ariaLabel}
                  className="sm-panel-item"
                  onClick={(event) => handleMenuItemClick(event, item.link)}
                >
                  <span className="sm-panel-itemLabel">{item.label}</span>
                  {displayItemNumbering && <span className="sm-panel-itemNumber">{String(idx + 1).padStart(2, "0")}</span>}
                </a>
              </li>
            ))}
          </ul>

          {displaySocials && socialItems.length > 0 && (
            <div className="sm-socials">
              <h3 className="sm-socials-title">Socials</h3>
              <ul className="sm-socials-list" role="list">
                {socialItems.map((item, idx) => (
                  <li key={`${item.link}-${idx}`}>
                    <a className="sm-socials-link" href={item.link} target="_blank" rel="noreferrer">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

export default StaggeredMenu;
