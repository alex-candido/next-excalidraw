"use client";

import {
  useStudioActions,
  useStudioActiveSlideId,
  useStudioSlides,
} from "@/providers/app/app-presentations-studio-provider";

export function useAppPresentationsPresentNavigation() {
  const slides = useStudioSlides();
  const activeSlideId = useStudioActiveSlideId();
  const { onSelectSlide } = useStudioActions();

  const presentableSlides = slides.filter((slide) => !slide.isHidden);
  const currentIndex = presentableSlides.findIndex((slide) => slide.id === activeSlideId);
  const previousSlide = presentableSlides[currentIndex - 1];
  const nextSlide = presentableSlides[currentIndex + 1];

  return {
    currentIndex,
    totalSlides: presentableSlides.length,
    hasPrevious: Boolean(previousSlide),
    hasNext: Boolean(nextSlide),
    onPrevious: () => previousSlide && onSelectSlide(previousSlide.id),
    onNext: () => nextSlide && onSelectSlide(nextSlide.id),
  };
}
