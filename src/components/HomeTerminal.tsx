import { useEffect, useState } from "react";

type AsciiCell = {
  glyph: string;
  color: string;
};

type TerminalEntry = {
  text: string;
  tone: "role" | "quote" | "note";
};

type SocialLink = {
  href: string;
  label: string;
  symbol: string;
  external?: boolean;
};

type ActionLink = {
  href: string;
  label: string;
  emphasis?: boolean;
};

const ASCII_SIZE = {
  width: 86,
  height: 58
};

const terminalEntries: TerminalEntry[] = [
  { text: "[ Frontend Developer | Designer ]", tone: "role" },
  { text: '"Now I am become a loser, the destroyer of myself."', tone: "quote" },
  { text: "// Looking for a new job and wanting to make more friends.", tone: "note" }
];

const socialLinks: SocialLink[] = [
  { href: "mailto:WaiJade@outlook.com", label: "Email", symbol: "@" },
  { href: "https://github.com/WaiJade", label: "GitHub", symbol: "GH", external: true },
  { href: "https://x.com", label: "X", symbol: "X", external: true },
  { href: "https://www.bilibili.com", label: "Bilibili", symbol: "B", external: true },
  { href: "https://t.me", label: "Telegram", symbol: "TG", external: true }
] as const;

const actionLinks: ActionLink[] = [
  { href: "#about", label: "About" },
  { href: "#works", label: "Works" },
  { href: "#friends", label: "Friends" },
  { href: "mailto:WaiJade@outlook.com", label: "Get in Touch", emphasis: true }
] as const;

const fallbackAscii = [
  "██      ██  █████  ██      █████  ██████  ███████",
  "██      ██ ██   ██ ██     ██   ██ ██   ██ ██",
  "██  █   ██ ███████ ██     ███████ ██   ██ █████",
  "██ ███ ██  ██   ██ ██     ██   ██ ██   ██ ██",
  " ███ ███   ██   ██ ██████ ██   ██ ██████  ███████"
];

const fallbackRows: AsciiCell[][] = fallbackAscii.map((line) =>
  line.split("").map((glyph) => ({
    glyph,
    color: "rgba(188, 205, 255, 0.72)"
  }))
);

function mapPixelToGlyph(r: number, g: number, b: number, alpha: number) {
  if (alpha < 26) {
    return { glyph: " ", color: "transparent" };
  }

  const light = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  let glyph = "█";

  if (light > 0.78) glyph = "░";
  else if (light > 0.58) glyph = "▒";
  else if (light > 0.4) glyph = "▓";

  const lift = (value: number) => Math.min(255, Math.round(value * 0.9 + 20));
  const color = `rgb(${lift(r)} ${lift(g)} ${lift(b)})`;

  return { glyph, color };
}

function HomeTerminal() {
  const [asciiRows, setAsciiRows] = useState<AsciiCell[][]>([]);
  const [revealedRows, setRevealedRows] = useState(0);
  const [typedLines, setTypedLines] = useState<string[]>(() => terminalEntries.map(() => ""));
  const [typingState, setTypingState] = useState({
    lineIndex: 0,
    charIndex: 0,
    done: false
  });

  useEffect(() => {
    let canceled = false;

    const image = new Image();
    image.src = "/favicon.png";
    image.decoding = "async";

    image.onload = () => {
      if (canceled) return;

      const canvas = document.createElement("canvas");
      canvas.width = ASCII_SIZE.width;
      canvas.height = ASCII_SIZE.height;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        setAsciiRows(fallbackRows);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const rows: AsciiCell[][] = [];

      for (let y = 0; y < canvas.height; y += 1) {
        const row: AsciiCell[] = [];

        for (let x = 0; x < canvas.width; x += 1) {
          const idx = (y * canvas.width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const alpha = data[idx + 3];

          row.push(mapPixelToGlyph(r, g, b, alpha));
        }

        rows.push(row);
      }

      setAsciiRows(rows);
    };

    image.onerror = () => {
      if (!canceled) {
        setAsciiRows(fallbackRows);
      }
    };

    return () => {
      canceled = true;
    };
  }, []);

  useEffect(() => {
    if (!asciiRows.length) return;

    setRevealedRows(0);

    const timer = window.setInterval(() => {
      setRevealedRows((prev) => {
        if (prev >= asciiRows.length) {
          window.clearInterval(timer);
          return prev;
        }

        return prev + 1;
      });
    }, 22);

    return () => {
      window.clearInterval(timer);
    };
  }, [asciiRows]);

  useEffect(() => {
    if (typingState.done) return;

    const entry = terminalEntries[typingState.lineIndex];
    const delay = typingState.charIndex === 0 ? 260 : 24;

    const timer = window.setTimeout(() => {
      const nextCharIndex = typingState.charIndex + 1;

      setTypedLines((prev) => {
        const next = [...prev];
        next[typingState.lineIndex] = entry.text.slice(0, nextCharIndex);
        return next;
      });

      if (nextCharIndex >= entry.text.length) {
        if (typingState.lineIndex >= terminalEntries.length - 1) {
          setTypingState({
            lineIndex: typingState.lineIndex,
            charIndex: nextCharIndex,
            done: true
          });
          return;
        }

        setTypingState({
          lineIndex: typingState.lineIndex + 1,
          charIndex: 0,
          done: false
        });

        return;
      }

      setTypingState((prev) => ({
        ...prev,
        charIndex: nextCharIndex
      }));
    }, delay);

    return () => {
      window.clearTimeout(timer);
    };
  }, [typingState]);

  return (
    <div className="home-terminal" aria-label="home-terminal">
      <div className="home-terminal__ascii" aria-label="ascii-avatar">
        {asciiRows.length ? (
          asciiRows.map((row, rowIndex) => (
            <div
              key={`ascii-row-${rowIndex}`}
              className={`home-terminal__ascii-row ${rowIndex < revealedRows ? "is-visible" : ""}`}
            >
              {row.map((cell, colIndex) => (
                <span
                  key={`ascii-cell-${rowIndex}-${colIndex}`}
                  className="home-terminal__ascii-cell"
                  style={{ color: cell.color }}
                >
                  {cell.glyph}
                </span>
              ))}
            </div>
          ))
        ) : (
          <p className="home-terminal__ascii-loading">rendering-avatar...</p>
        )}
      </div>

      <div className="home-terminal__body">
        <p className="home-terminal__prompt">
          <span className="tone-cyan">user@waijade</span>
          <span className="tone-sep">:</span>
          <span className="tone-purple">~</span>
          <span className="tone-sep">$</span>
          <span className="home-terminal__command">whoami</span>
        </p>

        <h1 className="home-terminal__title">
          <span className="home-terminal__title-mark">&gt;</span>
          <span>WaiJade</span>
          <span className="home-terminal__cursor" aria-hidden="true">
            _
          </span>
        </h1>

        <div className="home-terminal__lines" aria-live="polite">
          {terminalEntries.map((entry, index) => {
            const typed = typedLines[index];
            const isCurrentLine = !typingState.done && typingState.lineIndex === index;
            const shouldShowLine = typed.length > 0 || index <= typingState.lineIndex;

            if (!shouldShowLine) return null;

            return (
              <p key={`terminal-line-${entry.tone}-${index}`} className={`home-terminal__line home-terminal__line--${entry.tone}`}>
                {typed}
                {isCurrentLine ? (
                  <span className="home-terminal__cursor home-terminal__cursor--line" aria-hidden="true">
                    _
                  </span>
                ) : null}
              </p>
            );
          })}
        </div>

        <div className="home-terminal__social" aria-label="social-links">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              className="home-terminal__social-link"
              href={link.href}
              aria-label={link.label}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noreferrer" : undefined}
            >
              <span className="home-terminal__social-symbol" aria-hidden="true">
                {link.symbol}
              </span>
              <span className="home-terminal__social-label">{link.label}</span>
            </a>
          ))}
        </div>

        <div className="home-terminal__actions">
          {actionLinks.map((action) => (
            <a
              key={action.label}
              className={`home-terminal__action ${action.emphasis ? "is-emphasis" : ""}`}
              href={action.href}
            >
              <span>{action.label}</span>
              <span aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HomeTerminal;
