'use client';

import { useEffect, useRef } from 'react';

export interface UseModalA11yOptions {
  open: boolean;
  onClose: () => void;
  ref: React.RefObject<HTMLElement | null>;
  skipSelector?: string;
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function useModalA11y({ open, onClose, ref, skipSelector }: UseModalA11yOptions) {
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = (document.activeElement as HTMLElement) || null;
    const modal = ref.current;
    if (!modal) return;

    const focusables = getFocusables(modal, skipSelector);
    let timerId: ReturnType<typeof setTimeout> | undefined;

    if (focusables.length > 0) {
      timerId = setTimeout(() => focusables[0].focus(), 0);
    } else {
      if (!modal.hasAttribute('tabindex')) modal.setAttribute('tabindex', '-1');
      modal.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const currentFocus = document.activeElement;
      const focusableEls = getFocusables(modal, skipSelector);
      if (focusableEls.length === 0) {
        e.preventDefault();
        modal.focus();
        return;
      }
      const first = focusableEls[0];
      const last = focusableEls[focusableEls.length - 1];
      if (e.shiftKey) {
        if (currentFocus === first || !modal.contains(currentFocus)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (currentFocus === last || !modal.contains(currentFocus)) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      if (timerId) clearTimeout(timerId);
      document.removeEventListener('keydown', handleKeyDown, true);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose, ref, skipSelector]);

  useEffect(() => {
    if (open) return;
    const prev = previouslyFocused.current;
    if (prev && typeof prev.focus === 'function') {
      const id = setTimeout(() => { try { prev.focus(); } catch {} }, 0);
      return () => clearTimeout(id);
    }
  }, [open]);
}

function getFocusables(container: HTMLElement, skipSelector?: string): HTMLElement[] {
  const skip = skipSelector || '[hidden],[disabled],[aria-hidden="true"]';
  const all = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  return all.filter((el) => {
    if (el.matches(skip)) return false;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return false;
    return true;
  });
}
