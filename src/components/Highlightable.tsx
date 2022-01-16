import { ReactNode, useMemo, useRef } from "react";
import colorScheme from "../utils/colorScheme";

type HighlightableProps = {
  text: string;
  highlightedIdxs: (Region & { color: number })[];
  className: string;
  onSelect: (selectedIdx: Region) => void;
};

function Highlightable({
  text,
  highlightedIdxs,
  onSelect: handleSelect,
  className,
  ...props
}: HighlightableProps) {
  const highlightDivRef = useRef<HTMLDivElement>(null);

  const highlightedText = useMemo(() => {
    const result: ReactNode[] = [];
    const sortedIdxs = highlightedIdxs.sort((a, b) => a.start - b.start);

    if (sortedIdxs.length === 0) return text;
    for (let i = 0; i < sortedIdxs.length; i++) {
      const prevEnd = i === 0 ? 0 : sortedIdxs[i - 1].end;
      const { color, start, end } = sortedIdxs[i];
      result.push(text.slice(prevEnd, start));
      result.push(
        <mark
          key={i}
          style={{
            backgroundColor: colorScheme[color % colorScheme.length],
            color: "transparent",
          }}
        >
          {text.slice(start, end)}
        </mark>
      );
    }
    result.push(text.slice(sortedIdxs[sortedIdxs.length - 1].end));
    return result;
  }, [text, highlightedIdxs]);

  return (
    <div className={`relative ${className}`} {...props}>
      <div className="absolute h-full w-full bg-white border rounded-md">
        <div
          className="h-full w-full p-2 text-transparent break-words whitespace-pre-wrap pointer-events-none overflow-auto"
          ref={highlightDivRef}
        >
          {highlightedText}
        </div>
      </div>
      <textarea
        className="absolute h-full w-full bg-transparent resize-none"
        onScroll={(e) =>
          (highlightDivRef.current!.scrollTop = e.currentTarget.scrollTop)
        }
        onSelect={(e) => {
          const selectedIdx: Region = {
            start: e.currentTarget.selectionStart,
            end: e.currentTarget.selectionEnd,
          };
          handleSelect(selectedIdx);
          e.currentTarget.setSelectionRange(null, null);
          e.currentTarget.blur();
        }}
        readOnly
        value={text}
      ></textarea>
    </div>
  );
}

export default Highlightable;
