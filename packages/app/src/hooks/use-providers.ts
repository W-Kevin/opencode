import { useGlobalSync } from "@/context/global-sync"
import type { NormalizedProviderListResponse } from "@opencode-ai/ui/context"
import { decode64 } from "@/utils/base64"
import { useParams } from "@solidjs/router"
import { Iterable, pipe } from "effect"
import { createMemo } from "solid-js"

export const popularProviders = [
  "opencode",
  "opencode-go",
  "anthropic",
  "github-copilot",
  "openai",
  "google",
  "openrouter",
  "vercel",
]
const popularProviderSet = new Set(popularProviders)

function connectedProviders(source: NormalizedProviderListResponse) {
  const connected = new Set(source.connected)
  return pipe(
    source.all,
    Iterable.map(([, provider]) => provider),
    Iterable.filter((provider) => connected.has(provider.id)),
    (items) => Array.from(items),
  )
}

function withProviderFallback(
  primary: NormalizedProviderListResponse,
  fallback: NormalizedProviderListResponse,
) {
  if (connectedProviders(primary).length > 0) return primary
  if (connectedProviders(fallback).length > 0) return fallback
  return primary
}

export function useProviders() {
  const globalSync = useGlobalSync()
  const params = useParams()
  const dir = createMemo(() => decode64(params.dir) ?? "")
  const providers = createMemo(() => {
    const global = globalSync.data.provider
    const project = dir()
    if (!project) return global

    const [projectStore] = globalSync.child(project)
    if (!projectStore.provider_ready) return global
    return withProviderFallback(projectStore.provider, global)
  })
  return {
    all: () => providers().all,
    default: () => providers().default,
    popular: () =>
      pipe(
        providers().all,
        Iterable.map(([, provider]) => provider),
        Iterable.filter((provider) => popularProviderSet.has(provider.id)),
        (items) => Array.from(items),
      ),
    connected: () => connectedProviders(providers()),
    paid: () => {
      const source = providers()
      const connected = new Set(source.connected)
      return [
        ...Iterable.filter(
          source.all,
          ([id]) =>
            connected.has(id) &&
            (id !== "opencode" || Object.values(source.all.get(id)?.models ?? {}).some((model) => model.cost?.input)),
        ),
      ]
    },
  }
}
