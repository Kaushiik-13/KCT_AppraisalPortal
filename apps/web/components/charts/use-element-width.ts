'use client';

import { useEffect, useRef, useState } from 'react';

/** Tracks an element's rendered width so SVG charts can draw at real pixel size (text and dots never scale). */
export function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(Math.floor(el.clientWidth)));
    ro.observe(el);
    setWidth(Math.floor(el.clientWidth));
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}
