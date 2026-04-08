"use client";
import { useState, useEffect } from "react";

/**
 * Returns [lang, setLang, mounted].
 * - lang defaults to "hi" until the client hydrates.
 * - mounted is false on the first render (SSR), true after hydration.
 * - Use `if (!mounted) return null;` at the top of your component to
 *   prevent the Hindi→English flicker.
 */
export function useLang() {
  const [lang, setLang]     = useState("hi");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLang(localStorage.getItem("lang") || "hi");
    setMounted(true);
  }, []);

  const saveLang = (l: string) => {
    setLang(l);
    localStorage.setItem("lang", l);
  };

  return { lang, setLang: saveLang, mounted };
}
