function App() {
  return (
    <div className="page">
      <section className="hero" aria-label="first-screen">
        <div className="hero__bg" aria-hidden="true">
          <div className="hero__grid" />
          <div className="hero__glow" />
          <div className="hero__vignette" />
        </div>

        <div className="hero__content">
          <p className="hero__tag">Phase 01</p>
          <h1 className="hero__title">首屏背景：方格网</h1>
          <p className="hero__hint">后续内容按你的要求逐步添加</p>
        </div>
      </section>
    </div>
  );
}

export default App;
