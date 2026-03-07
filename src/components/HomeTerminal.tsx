import { useEffect, useRef, useState, type CSSProperties } from "react";

type AsciiCell = {
  glyph: string;
  color: string;
};

type AnsiAvatarPayload = {
  width: number;
  height: number;
  rows: Array<Array<number | null>>;
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

const terminalEntries: TerminalEntry[] = [
  { text: "[ Frountend Developer ]", tone: "role" },
  { text: '"Now I am become a loser, the destroyer of myself."', tone: "quote" },
  { text: "// VibeCoding Enjoyer", tone: "note" }
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

function ansi256ToRgb(index: number): [number, number, number] {
  const base16: Array<[number, number, number]> = [
    [0, 0, 0],
    [128, 0, 0],
    [0, 128, 0],
    [128, 128, 0],
    [0, 0, 128],
    [128, 0, 128],
    [0, 128, 128],
    [192, 192, 192],
    [128, 128, 128],
    [255, 0, 0],
    [0, 255, 0],
    [255, 255, 0],
    [0, 0, 255],
    [255, 0, 255],
    [0, 255, 255],
    [255, 255, 255]
  ];

  if (index < 16) {
    return base16[index];
  }

  if (index <= 231) {
    const n = index - 16;
    const r = Math.floor(n / 36);
    const g = Math.floor((n % 36) / 6);
    const b = n % 6;
    const steps = [0, 95, 135, 175, 215, 255];
    return [steps[r], steps[g], steps[b]];
  }

  const gray = 8 + (index - 232) * 10;
  return [gray, gray, gray];
}

function parseAvatarPayload(payload: AnsiAvatarPayload): AsciiCell[][] {
  return payload.rows.map((row) =>
    row.map((colorIndex) => {
      if (colorIndex === null || Number.isNaN(colorIndex)) {
        return {
          glyph: " ",
          color: "transparent"
        };
      }

      const [r, g, b] = ansi256ToRgb(colorIndex);
      return {
        glyph: "█",
        color: `rgb(${r} ${g} ${b})`
      };
    })
  );
}

function HomeTerminal() {
  const [asciiRows, setAsciiRows] = useState<AsciiCell[][]>([]);
  const [revealedRows, setRevealedRows] = useState(0);
  const [asciiStyle, setAsciiStyle] = useState<CSSProperties | undefined>(undefined);
  const [terminalStyle, setTerminalStyle] = useState<CSSProperties | undefined>(undefined);
  const [typedLines, setTypedLines] = useState<string[]>(() => terminalEntries.map(() => ""));
  const [typingState, setTypingState] = useState({
    lineIndex: 0,
    charIndex: 0,
    done: false
  });
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let canceled = false;

    fetch("/ansi-avatar.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Cannot load avatar json: ${response.status}`);
        }
        return response.json() as Promise<AnsiAvatarPayload>;
      })
      .then((payload) => {
        if (canceled) return;
        if (!Array.isArray(payload.rows) || payload.rows.length === 0) {
          throw new Error("Invalid avatar rows");
        }
        setAsciiRows(parseAvatarPayload(payload));
      })
      .catch(() => {
        if (!canceled) {
          setAsciiRows(fallbackRows);
        }
      });

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
    if (!asciiRows.length || !terminalRef.current || !bodyRef.current) return;

    const rows = asciiRows.length;
    const cols = asciiRows.reduce((max, row) => Math.max(max, row.length), 0);
    if (!rows || !cols) return;

    const baseLineHeight = 1.18;
    const baseCellWidth = 0.62;
    const minFontSize = 1.6;
    const maxFontSize = 10;
    const minBodyWidth = 320;
    const minAvatarWidth = 180;

    const updateLayout = () => {
      if (window.innerWidth <= 768) {
        setAsciiStyle(undefined);
        setTerminalStyle(undefined);
        return;
      }

      const terminalEl = terminalRef.current;
      const bodyEl = bodyRef.current;
      if (!terminalEl || !bodyEl) return;

      const terminalRect = terminalEl.getBoundingClientRect();
      const bodyHeight = bodyRef.current?.getBoundingClientRect().height ?? 0;
      if (!bodyHeight) return;

      const computed = window.getComputedStyle(terminalEl);
      const gap = Number.parseFloat(computed.columnGap || computed.gap || "0") || 0;

      const ratio = (cols * baseCellWidth) / (rows * baseLineHeight);
      const desiredAvatarWidth = bodyHeight * ratio;
      const maxAvatarWidth = Math.max(minAvatarWidth, terminalRect.width - gap - minBodyWidth);
      const avatarWidth = Math.min(desiredAvatarWidth, maxAvatarWidth);

      const heightBasedFont = bodyHeight / (rows * baseLineHeight);
      const widthBasedFont = avatarWidth / (cols * baseCellWidth);
      const nextFontSize = Math.max(minFontSize, Math.min(maxFontSize, Math.min(heightBasedFont, widthBasedFont)));

      setAsciiStyle((prev) => {
        const next: CSSProperties = {
          "--ascii-font-size": `${nextFontSize.toFixed(2)}px`,
          "--ascii-line-height": baseLineHeight.toFixed(4),
          "--ascii-cell-width": `${baseCellWidth.toFixed(4)}em`
        } as CSSProperties;

        if (
          prev &&
          prev["--ascii-font-size" as keyof CSSProperties] === next["--ascii-font-size" as keyof CSSProperties] &&
          prev["--ascii-line-height" as keyof CSSProperties] === next["--ascii-line-height" as keyof CSSProperties] &&
          prev["--ascii-cell-width" as keyof CSSProperties] === next["--ascii-cell-width" as keyof CSSProperties]
        ) {
          return prev;
        }

        return next;
      });

      setTerminalStyle((prev) => {
        const next: CSSProperties = {
          gridTemplateColumns: `${avatarWidth.toFixed(2)}px minmax(0, 1fr)`
        };

        if (prev && prev.gridTemplateColumns === next.gridTemplateColumns) {
          return prev;
        }

        return next;
      });
    };

    updateLayout();
    const observer = new ResizeObserver(updateLayout);
    observer.observe(bodyRef.current);
    observer.observe(terminalRef.current);

    return () => {
      observer.disconnect();
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
    <div className="home-terminal" aria-label="home-terminal" ref={terminalRef} style={terminalStyle}>
      <div className="home-terminal__ascii" aria-label="ascii-avatar" style={asciiStyle}>
        {asciiRows.length
          ? asciiRows.map((row, rowIndex) => (
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
          : null}
      </div>

      <div className="home-terminal__body" ref={bodyRef}>
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
