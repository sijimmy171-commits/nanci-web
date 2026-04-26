'use client';

import { useEffect } from 'react';

/**
 * Sets the <html lang> attribute on the client side.
 * This is needed because the root layout renders a static <html lang="en">
 * while the actual locale is determined by the [lang] route segment.
 */
export function HtmlLangSetter({ lang, dir }: { lang: string; dir?: string }) {
  useEffect(() => {
    const html = document.documentElement;
    html.lang = lang;
    if (dir) {
      html.dir = dir;
    } else {
      html.removeAttribute('dir');
    }
  }, [lang, dir]);

  return null;
}
