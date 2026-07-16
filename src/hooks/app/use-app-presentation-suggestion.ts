"use client";

import { useQuery } from "@tanstack/react-query";

import { presentationSuggestionActions } from "@/actions/app/presentation-suggestion-actions";

export const appPresentationSuggestionKeys = {
  list: (type: number, language: number, exclude: string[]) =>
    ["presentation-suggestions", type, language, exclude] as const,
};

export function useAppPresentationSuggestion() {
  function useList(type: number, language: number, exclude: string[] = []) {
    return useQuery({
      queryKey: appPresentationSuggestionKeys.list(type, language, exclude),
      queryFn: () => presentationSuggestionActions().list({ type, language, exclude }),
    });
  }

  return { useList };
}
