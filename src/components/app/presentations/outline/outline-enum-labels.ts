import {
  AspectRatio,
  PresentationAmount,
  PresentationAudience,
  PresentationLanguage,
  PresentationScenario,
} from "@/lib/drizzle/schema/presentation";

function reverseMap<T extends Record<string, number>>(source: T) {
  return Object.fromEntries(
    Object.entries(source).map(([key, value]) => [value, key]),
  ) as Record<number, keyof T>;
}

export const LANGUAGE_KEY = reverseMap(PresentationLanguage);
export const ASPECT_RATIO_KEY = reverseMap(AspectRatio);
export const AUDIENCE_KEY = reverseMap(PresentationAudience);
export const SCENARIO_KEY = reverseMap(PresentationScenario);
export const AMOUNT_KEY = reverseMap(PresentationAmount);

export interface AppPresentationsOutlineParams {
  language: number;
  aspectRatio: number;
  slideCount: number;
  audience: number;
  scenario: number;
  amount: number;
  theme: number;
}
