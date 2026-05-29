import type { Provider } from "@opencode-ai/sdk/v2/client"

export type ModelKey = { providerID: string; modelID: string; variant?: string }

type ProviderLookup = {
  all: Map<string, Provider>
  connected: Provider[]
}

export function resolveModelKey(input: ProviderLookup, model: ModelKey): ModelKey | undefined {
  const direct = input.all.get(model.providerID)
  if (direct?.models[model.modelID] && input.connected.some((item) => item.id === model.providerID)) return model

  for (const provider of input.connected) {
    if (provider.models[model.modelID]) {
      return { providerID: provider.id, modelID: model.modelID }
    }

    for (const [key, info] of Object.entries(provider.models)) {
      if (info.id === model.modelID || key === model.modelID) {
        return { providerID: provider.id, modelID: key }
      }
    }
  }
}

export function defaultModelKey(input: ProviderLookup & { defaults: Record<string, string> }): ModelKey | undefined {
  for (const provider of input.connected) {
    const configured = input.defaults[provider.id]
    if (configured) {
      const model = { providerID: provider.id, modelID: configured }
      if (resolveModelKey(input, model)) return model
    }

    const entry = Object.entries(provider.models)[0]
    if (!entry) continue
    const model = { providerID: provider.id, modelID: entry[0] }
    if (resolveModelKey(input, model)) return model
  }
}
