import { describe, expect, test } from "bun:test"
import type { Provider } from "@opencode-ai/sdk/v2/client"
import { defaultModelKey, resolveModelKey } from "./model-key"

const provider = (id: string, models: Record<string, { id: string }>) =>
  ({
    id,
    name: id,
    models,
  }) as unknown as Provider

describe("resolveModelKey", () => {
  test("remaps stale provider ids when the model exists on a connected provider", () => {
    const connected = [
      provider("local_model", {
        "qwen3.6-35b-a3b": { id: "qwen3.6-35b-a3b" },
      }),
    ]
    const all = new Map(connected.map((item) => [item.id, item]))

    expect(
      resolveModelKey(
        { all, connected },
        { providerID: "local_vllm", modelID: "qwen3.6-35b-a3b" },
      ),
    ).toEqual({
      providerID: "local_model",
      modelID: "qwen3.6-35b-a3b",
    })
  })

  test("matches model ids stored under a different provider.models key", () => {
    const connected = [
      provider("custom", {
        "dict-key": { id: "runtime-id" },
      }),
    ]
    const all = new Map(connected.map((item) => [item.id, item]))

    expect(
      resolveModelKey(
        { all, connected },
        { providerID: "custom", modelID: "runtime-id" },
      ),
    ).toEqual({
      providerID: "custom",
      modelID: "dict-key",
    })
  })
})

describe("defaultModelKey", () => {
  test("uses provider.models keys instead of only model ids", () => {
    const connected = [
      provider("local_model", {
        "qwen3.6-35b-a3b": { id: "qwen3.6-35b-a3b" },
      }),
    ]
    const all = new Map(connected.map((item) => [item.id, item]))

    expect(defaultModelKey({ all, connected, defaults: {} })).toEqual({
      providerID: "local_model",
      modelID: "qwen3.6-35b-a3b",
    })
  })
})
