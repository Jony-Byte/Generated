import type { ReactNode } from "react";

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const parts = text.split(/(`[^`]+`|\[[^\]]+\]\(https?:\/\/[^)\s]+\))/g);
  return parts.filter(Boolean).map((part, index) => {
    const key = `${keyPrefix}-${index}`;
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={key}>{part.slice(1, -1)}</code>;
    }
    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);
    if (link) {
      return (
        <a key={key} href={link[2]} target="_blank" rel="noreferrer">
          {link[1]}
        </a>
      );
    }
    return part;
  });
}

export function ArticleBody({ markdown }: { markdown: string }) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const nodes: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index] ?? "";
    if (line.trim() === "") {
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{2,3})\s+(.+)$/);
    if (heading) {
      const level = heading[1]?.length ?? 2;
      const text = heading[2] ?? "";
      if (level === 2) {
        nodes.push(<h2 key={`h-${index}`}>{renderInline(text, `h-${index}`)}</h2>);
      } else {
        nodes.push(<h3 key={`h-${index}`}>{renderInline(text, `h-${index}`)}</h3>);
      }
      index += 1;
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: ReactNode[] = [];
      while (index < lines.length && /^[-*]\s+/.test(lines[index] ?? "")) {
        const item = (lines[index] ?? "").replace(/^[-*]\s+/, "");
        items.push(<li key={`li-${index}`}>{renderInline(item, `li-${index}`)}</li>);
        index += 1;
      }
      nodes.push(<ul key={`ul-${index}`}>{items}</ul>);
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: ReactNode[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index] ?? "")) {
        const item = (lines[index] ?? "").replace(/^\d+\.\s+/, "");
        items.push(<li key={`oli-${index}`}>{renderInline(item, `oli-${index}`)}</li>);
        index += 1;
      }
      nodes.push(<ol key={`ol-${index}`}>{items}</ol>);
      continue;
    }

    if (line.startsWith("> ")) {
      const quote: string[] = [];
      const start = index;
      while (index < lines.length && (lines[index] ?? "").startsWith("> ")) {
        quote.push((lines[index] ?? "").slice(2));
        index += 1;
      }
      nodes.push(
        <blockquote key={`quote-${start}`}>
          {renderInline(quote.join(" "), `quote-${start}`)}
        </blockquote>,
      );
      continue;
    }

    const paragraph: string[] = [];
    const start = index;
    while (
      index < lines.length &&
      (lines[index] ?? "").trim() !== "" &&
      !/^(#{2,3})\s+/.test(lines[index] ?? "") &&
      !/^[-*]\s+/.test(lines[index] ?? "") &&
      !/^\d+\.\s+/.test(lines[index] ?? "") &&
      !(lines[index] ?? "").startsWith("> ")
    ) {
      paragraph.push(lines[index] ?? "");
      index += 1;
    }
    nodes.push(
      <p key={`p-${start}`}>{renderInline(paragraph.join(" "), `p-${start}`)}</p>,
    );
  }

  return <div className="article-body">{nodes}</div>;
}
