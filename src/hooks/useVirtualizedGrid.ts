import { useCallback, useRef, useState, useEffect } from "react";

interface UseVirtualizedGridOptions {
  itemCount: number;
  columnCount: number;
  rowHeight: number;
  overscan?: number;
  containerRef: React.RefObject<HTMLElement>;
}

interface VirtualizedGridResult {
  virtualItems: { index: number; start: number; row: number; col: number }[];
  totalHeight: number;
  scrollOffset: number;
}

export function useVirtualizedGrid({
  itemCount,
  columnCount,
  rowHeight,
  overscan = 3,
  containerRef,
}: UseVirtualizedGridOptions): VirtualizedGridResult {
  const [scrollOffset, setScrollOffset] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const scrollTimeoutRef = useRef<number | null>(null);

  // Debounced scroll handler
  const handleScroll = useCallback(() => {
    if (scrollTimeoutRef.current) {
      cancelAnimationFrame(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = requestAnimationFrame(() => {
      if (containerRef.current) {
        setScrollOffset(window.scrollY);
      }
    });
  }, [containerRef]);

  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        setContainerHeight(window.innerHeight);
      });
      resizeObserver.observe(containerRef.current);
      setContainerHeight(window.innerHeight);
      
      return () => resizeObserver.disconnect();
    }
  }, [containerRef]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        cancelAnimationFrame(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll]);

  const rowCount = Math.ceil(itemCount / columnCount);
  const totalHeight = rowCount * rowHeight;

  // Calculate visible range
  const containerTop = containerRef.current?.getBoundingClientRect().top ?? 0;
  const visibleTop = Math.max(0, scrollOffset - (containerTop + scrollOffset));
  const visibleBottom = visibleTop + containerHeight;

  const startRow = Math.max(0, Math.floor(visibleTop / rowHeight) - overscan);
  const endRow = Math.min(rowCount - 1, Math.ceil(visibleBottom / rowHeight) + overscan);

  const virtualItems: { index: number; start: number; row: number; col: number }[] = [];
  
  for (let row = startRow; row <= endRow; row++) {
    for (let col = 0; col < columnCount; col++) {
      const index = row * columnCount + col;
      if (index < itemCount) {
        virtualItems.push({
          index,
          start: row * rowHeight,
          row,
          col,
        });
      }
    }
  }

  return {
    virtualItems,
    totalHeight,
    scrollOffset,
  };
}
