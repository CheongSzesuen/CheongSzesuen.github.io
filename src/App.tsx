type NavItem = {
  label: string;
  href: string;
};

type Highlight = {
  title: string;
  description: string;
};

type Project = {
  name: string;
  summary: string;
  stack: string[];
  status: string;
};

type TimelineItem = {
  date: string;
  title: string;
  detail: string;
};

const navItems: NavItem[] = [
  { label: "主页", href: "#home" },
  { label: "亮点", href: "#highlights" },
  { label: "项目", href: "#projects" },
  { label: "时间线", href: "#timeline" },
  { label: "联系", href: "#contact" }
];

const highlights: Highlight[] = [
  {
    title: "单页叙事",
    description: "信息结构从多页面跳转改为一条连续浏览路径，阅读更顺。"
  },
  {
    title: "TypeScript 约束",
    description: "核心数据都走类型定义，降低后续扩展和维护成本。"
  },
  {
    title: "响应式布局",
    description: "移动端优先，桌面端增强，导航和内容都可在小屏清晰呈现。"
  },
  {
    title: "视觉系统重建",
    description: "统一色彩、卡片、层次和动效，不再拼接式页面风格。"
  }
];

const projects: Project[] = [
  {
    name: "个人主站 2.0",
    summary: "全新 React + TS 架构，沉淀可复用模块与统一页面语言。",
    stack: ["React", "TypeScript", "Vite", "CSS Variables"],
    status: "进行中"
  },
  {
    name: "内容管理预留",
    summary: "预留了项目与时间线的数据模型，后续可平滑接入 API 或 CMS。",
    stack: ["Data Model", "Extensible Schema"],
    status: "规划中"
  },
  {
    name: "品牌展示页",
    summary: "用一页完成个人介绍、项目展示和联系入口，适合快速分发。",
    stack: ["Single Page", "Responsive UI"],
    status: "已上线"
  }
];

const timeline: TimelineItem[] = [
  {
    date: "阶段 01",
    title: "信息架构重排",
    detail: "从“多个独立 html”切换到统一单页结构。"
  },
  {
    date: "阶段 02",
    title: "工程化迁移",
    detail: "建立 Vite + React + TypeScript 构建和开发流程。"
  },
  {
    date: "阶段 03",
    title: "视觉系统重置",
    detail: "定义颜色变量、卡片体系、排版尺度和基础动画。"
  },
  {
    date: "阶段 04",
    title: "内容模块化",
    detail: "将亮点、项目、时间线抽成结构化数据。"
  }
];

const contactItems = [
  { label: "邮箱", value: "hello@example.com", href: "mailto:hello@example.com" },
  { label: "GitHub", value: "github.com/your-name", href: "https://github.com" },
  { label: "博客", value: "blog.example.com", href: "https://example.com" }
] as const;

function App() {
  const year = new Date().getFullYear();

  return (
    <div className="site">
      <div className="ambient" aria-hidden="true" />
      <header className="header">
        <a className="brand" href="#home">
          CSX Studio
        </a>
        <nav className="nav" aria-label="主导航">
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <a className="cta" href="#contact">
          联系我
        </a>
      </header>

      <main className="main">
        <section id="home" className="section hero reveal">
          <p className="eyebrow">React + TypeScript + Single Page</p>
          <h1>网站已切换为全新单页架构</h1>
          <p className="lead">
            这是一次从 0 到 1 的重构，不继承旧页面结构，使用统一的组件化设计和工程化流程。
          </p>
          <div className="hero-grid">
            <article className="panel">
              <h2>重构目标</h2>
              <ul>
                <li>从多页面切换为单页浏览体验</li>
                <li>建立 React + TypeScript 的长期维护基线</li>
                <li>提升移动端和桌面端的一致性</li>
              </ul>
            </article>
            <div className="stats">
              <article>
                <strong>4</strong>
                <span>核心模块</span>
              </article>
              <article>
                <strong>100%</strong>
                <span>TypeScript</span>
              </article>
              <article>
                <strong>SPA</strong>
                <span>单页信息流</span>
              </article>
            </div>
          </div>
        </section>

        <section id="highlights" className="section reveal">
          <div className="section-head">
            <p>Highlights</p>
            <h2>核心能力</h2>
          </div>
          <div className="cards four">
            {highlights.map((item) => (
              <article className="card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="projects" className="section reveal">
          <div className="section-head">
            <p>Projects</p>
            <h2>当前项目</h2>
          </div>
          <div className="cards three">
            {projects.map((project) => (
              <article className="card project-card" key={project.name}>
                <div className="project-top">
                  <h3>{project.name}</h3>
                  <span>{project.status}</span>
                </div>
                <p>{project.summary}</p>
                <div className="tag-row">
                  {project.stack.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="timeline" className="section reveal">
          <div className="section-head">
            <p>Timeline</p>
            <h2>重构进程</h2>
          </div>
          <ol className="timeline">
            {timeline.map((item) => (
              <li key={item.date + item.title}>
                <span>{item.date}</span>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="contact" className="section reveal">
          <div className="section-head">
            <p>Contact</p>
            <h2>联系方式</h2>
          </div>
          <div className="cards three">
            {contactItems.map((item) => (
              <a className="card contact-card" key={item.label} href={item.href} target="_blank" rel="noreferrer">
                <h3>{item.label}</h3>
                <p>{item.value}</p>
              </a>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>© {year} CSX Studio. Built with React + TypeScript.</p>
      </footer>
    </div>
  );
}

export default App;

