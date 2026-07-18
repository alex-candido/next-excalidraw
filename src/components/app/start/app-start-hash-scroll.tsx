"use client";

import { useEffect } from "react";

import { LAYOUT_HEADER_HEIGHT_PX } from "@/components/layouts/layout-header";
import { scrollToElement } from "@/lib/utils";

// O scroll-to-hash automático do <Link> no App Router depende de timing de
// hidratação e nem sempre dispara de forma confiável entre rotas diferentes
// (ver node_modules/next/dist/docs/.../link.md, "Scrolling to an id") — faz
// isso explicitamente aqui em vez de depender do comportamento nativo. O
// <Link> que aponta pra cá usa `scroll={false}` pra não competir com esse
// scroll manual (o automático do Next sobrescrevia a posição depois).
export function AppStartHashScroll() {
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    scrollToElement(hash, { offsetPx: LAYOUT_HEADER_HEIGHT_PX, gapRatio: 0.40 });
  }, []);

  return null;
}
