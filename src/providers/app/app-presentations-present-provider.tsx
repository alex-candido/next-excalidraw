"use client";

import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";

import { useAppPresentationsPresentNavigation } from "@/hooks/app/use-app-presentations-present-navigation";

type AppPresentationsPresentContextProps = {
  isFullscreen: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onToggleFullscreen: () => void;
  currentIndex: number;
  totalSlides: number;
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

const AppPresentationsPresentContext = createContext<AppPresentationsPresentContextProps | undefined>(undefined);

export const useAppPresentationsPresent = () => {
  const context = useContext(AppPresentationsPresentContext);
  if (context === undefined) {
    throw new Error("useAppPresentationsPresent must be used within an AppPresentationsPresentProvider");
  }
  return context;
};

// Composição: fullscreen é estado próprio deste provider, navegação vem do
// hook (hooks/app/use-app-presentations-present-navigation.ts, deriva do
// Zustand do Studio) — chamado 1x aqui, não direto por cada componente. Troca
// de slide não é um caminho quente (poucas vezes por minuto, não por frame
// como editar no canvas), então Context aqui não reintroduz o problema que
// levou Studio/Outline pro Zustand.
export const AppPresentationsPresentProvider = ({ children }: { children: ReactNode }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigation = useAppPresentationsPresentNavigation();

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const onToggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      return;
    }
    containerRef.current?.requestFullscreen();
  };

  const value: AppPresentationsPresentContextProps = {
    isFullscreen,
    containerRef,
    onToggleFullscreen,
    ...navigation,
  };

  return (
    <AppPresentationsPresentContext.Provider value={value}>
      {children}
    </AppPresentationsPresentContext.Provider>
  );
};
