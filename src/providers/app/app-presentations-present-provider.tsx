"use client";

import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";

type AppPresentationsPresentContextProps = {
  isFullscreen: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onToggleFullscreen: () => void;
};

const AppPresentationsPresentContext = createContext<AppPresentationsPresentContextProps | undefined>(undefined);

export const useAppPresentationsPresent = () => {
  const context = useContext(AppPresentationsPresentContext);
  if (context === undefined) {
    throw new Error("useAppPresentationsPresent must be used within an AppPresentationsPresentProvider");
  }
  return context;
};

export const AppPresentationsPresentProvider = ({ children }: { children: ReactNode }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
  };

  return (
    <AppPresentationsPresentContext.Provider value={value}>
      {children}
    </AppPresentationsPresentContext.Provider>
  );
};
