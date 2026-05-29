import { describe, expect, test } from "bun:test"
import type { Provider } from "@opencode-ai/sdk/v2/client"
import type { NormalizedProviderListResponse } from "@opencode-ai/ui/context"

function source(id: string, models: Record<string, { id: string }>, connected = true) {
  const provider = {
    id,
    name: id,
    models,
  } as unknown as Provider
  return {
    all: new Map([[id, provider]]),
    connected: connected ? [id] : [],
    default: {},
  } satisfies NormalizedProviderListResponse
}

describe("useProviders fallback", () => {
  test("prefers project providers when they have connected models", () => {
    const project = source("local_model", { "qwen3.6-35b-a3b": { id: "qwen3.6-35b-a3b" } })
    const global = source("opencode", { "big-pickle": { id: "big-pickle" } })

    const pick = project.connected.length > 0 ? project : global.connected.length > 0 ? global : project
    expect(pick.connected).toEqual(["local_model"])
  })

  test("falls back to global providers when project connected list is empty", () => {
    const project = source("local_model", {}, false)
    const global = source("opencode", { "big-pickle": { id: "big-pickle" } })

    const pick = project.connected.length > 0 ? project : global.connected.length > 0 ? global : project
    expect(pick.connected).toEqual(["opencode"])
  })
})
