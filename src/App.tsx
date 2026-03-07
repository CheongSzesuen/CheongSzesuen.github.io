const navItems = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Works", href: "#works" },
  { label: "Friends", href: "#friends" }
];

function App() {
  return (
    <div className="page">
      <header className="topbar" aria-label="main-header">
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
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <section id="home" className="hero" aria-label="first-screen">
        <div className="hero__bg" aria-hidden="true">
          <div className="hero__grid" />
          <div className="hero__glow" />
          <div className="hero__vignette" />
        </div>

        <div className="hero__content">
          <p className="hero__tag">Phase 01</p>
          <h1 className="hero__title">WaiJade</h1>
          <p className="hero__hint">后续内容按你的要求逐步添加</p>
        </div>
      </section>
    </div>
  );
}

export default App;
