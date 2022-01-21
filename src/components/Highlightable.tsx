import { ReactNode, useEffect, useMemo, useRef } from "react";

type HighlightableProps = {
  text: string;
  highlightedRegions: (Region & { color: string })[];
  className: string;
  onSelect: (selectedIdx: Region) => void;
};

function Highlightable({
  text,
  highlightedRegions,
  onSelect: handleSelect,
  className,
  ...props
}: HighlightableProps) {
  const highlightDivRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const markRef = useRef<HTMLSpanElement>(null);
  const highlightedText: ReactNode[] = useMemo(() => {
    const result: ReactNode[] = [];
    if (highlightedRegions.length === 0) {
      result.push(text);
    } else {
      const sorted = highlightedRegions.sort((a, b) => a.start - b.start);
      for (let i = 0; i < sorted.length; i++) {
        const prevEnd = sorted[i - 1]?.end ?? 0;
        const { color: backgroundColor, start, end } = sorted[i];
        result.push(
          text.slice(prevEnd, start),
          <mark
            key={i}
            style={{ backgroundColor }}
            ref={i == 0 ? markRef : null}
          >
            {text.slice(start, end)}
          </mark>
        );
      }
      result.push(text.slice(sorted[sorted.length - 1].end));
    }
    return result;
  }, [highlightedRegions, text]);

  function syncScroll() {
    if (highlightDivRef.current && textAreaRef.current)
      highlightDivRef.current.scrollTop = textAreaRef.current.scrollTop;
  }

  useEffect(syncScroll);
  useEffect(() => {
    if (!(textAreaRef.current && markRef.current)) return;
    const markOffsetTop = markRef.current.offsetTop;
    const { scrollTop, offsetHeight, scrollHeight } = textAreaRef.current;
    if (
      highlightedRegions.length === 1 &&
      (markOffsetTop < scrollTop || markOffsetTop > offsetHeight - scrollTop)
    ) {
      textAreaRef.current.scrollTop = Math.min(markOffsetTop, scrollHeight);
      syncScroll();
    }
  }, [textAreaRef, highlightedRegions]);

  return (
    <div className={`relative ${className}`} {...props}>
      <div className="absolute h-full w-full bg-white text-transparent border rounded-md">
        <div
          className="h-full w-full p-2 break-words whitespace-pre-wrap pointer-events-none overflow-auto"
          ref={highlightDivRef}
        >
          {highlightedText}
        </div>
      </div>
      <textarea
        className="absolute h-full w-full bg-transparent resize-none"
        onScroll={syncScroll}
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
        ref={textAreaRef}
      ></textarea>
    </div>
  );
}

export default Highlightable;
