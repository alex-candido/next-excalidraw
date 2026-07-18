import { describe, it, expect } from "bun:test"
import { presentationThemes } from "@/lib/excalidraw/themes/presentation-themes"

const { getByKey, getSemanticRoles, buildSemanticRolesPrompt } = presentationThemes()

const ALL_ROLES = ["success", "warning", "danger", "external", "process", "trigger", "neutral"] as const

describe("getSemanticRoles", () => {
  it("returns all 7 roles for a light theme", () => {
    const roles = getSemanticRoles("daktilo")
    expect(getByKey("daktilo").mode).toBe("light")
    for (const role of ALL_ROLES) {
      expect(roles[role]).toBeDefined()
      expect(roles[role].fill).toMatch(/^#[0-9a-fA-F]{6}$/)
      expect(roles[role].stroke).toMatch(/^#[0-9a-fA-F]{6}$/)
    }
  })

  it("returns all 7 roles for a dark theme", () => {
    const roles = getSemanticRoles("noir")
    expect(getByKey("noir").mode).toBe("dark")
    for (const role of ALL_ROLES) {
      expect(roles[role]).toBeDefined()
      expect(roles[role].fill).toMatch(/^#[0-9a-fA-F]{6}$/)
      expect(roles[role].stroke).toMatch(/^#[0-9a-fA-F]{6}$/)
    }
  })

  it("returns different pairs for light vs dark mode", () => {
    const light = getSemanticRoles("daktilo")
    const dark = getSemanticRoles("noir")
    expect(light.success.fill).not.toBe(dark.success.fill)
  })

  it("falls back to daktilo (light) semantics for unknown theme key", () => {
    const roles = getSemanticRoles("does-not-exist")
    expect(roles).toEqual(getSemanticRoles("daktilo"))
  })

  it("is consistent for all themes sharing the same mode", () => {
    // cornflower and orbit and sunset/forest/piano are light; daktilo is light too
    const daktilo = getSemanticRoles("daktilo")
    const cornflower = getSemanticRoles("cornflower")
    expect(daktilo).toEqual(cornflower)
  })
})

describe("buildSemanticRolesPrompt", () => {
  it("lists all 7 roles by name, without leaking any hex value", () => {
    const prompt = buildSemanticRolesPrompt()
    for (const role of ALL_ROLES) {
      expect(prompt).toContain(role)
    }
    expect(prompt).not.toMatch(/#[0-9a-fA-F]{6}/)
  })
})
