import Link from "next/link";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const components: Components = {
  h2: ({ children }) => (
    <h2 className="mt-10 font-serif text-3xl tracking-tight text-ivory">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-8 font-serif text-2xl tracking-tight text-ivory">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="mt-4 text-lg leading-relaxed text-quiet">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mt-4 list-disc space-y-2 pl-5 text-lg leading-relaxed text-quiet">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-4 list-decimal space-y-2 pl-5 text-lg leading-relaxed text-quiet">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-ivory">{children}</strong>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mt-6 border-l-2 border-oxblood pl-4 text-lg text-ivory">
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => {
    const className =
      "font-semibold text-oxblood underline decoration-oxblood/50 underline-offset-4 hover:decoration-oxblood";
    if (href?.startsWith("/")) {
      return (
        <Link href={href} className={className}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  },
};

export function MarkdownBody({ source }: { source: string }) {
  return (
    <div>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {source}
      </ReactMarkdown>
    </div>
  );
}
