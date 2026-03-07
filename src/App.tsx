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
              {navItems.map((item, index) => (
                <li key={item.href}>
                  <a className={index === 0 ? "is-active" : ""} href={item.href}>
                    {item.label}
                  </a>
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
    </div>
  );
}

export default App;
