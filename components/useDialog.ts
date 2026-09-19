import { useEffect, useRef } from 'react';

export function useDialog(open: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusables = () => Array.from(ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not([type="file"]), select, [tabindex="0"]') ?? []).filter(el => el.getClientRects().length > 0);
    focusables()[0]?.focus();
    const trap = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const elements = focusables();
      const first = elements[0], last = elements.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    ref.current?.addEventListener('keydown', trap);
    const node = ref.current;
    return () => { document.body.style.overflow = previousOverflow; node?.removeEventListener('keydown', trap); previous?.focus(); };
  }, [open]);
  return ref;
}
