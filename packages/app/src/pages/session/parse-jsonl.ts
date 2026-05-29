export function parseJsonlContent(content: string) {
  const trimmed = content.trim()
  if (!trimmed) return [] as Record<string, unknown>[]

  const rows: Record<string, unknown>[] = []
  let i = 0

  while (i < trimmed.length) {
    while (i < trimmed.length && /\s/.test(trimmed[i]!)) i++
    if (i >= trimmed.length) break

    let depth = 0
    let inString = false
    let escape = false
    const start = i

    for (; i < trimmed.length; i++) {
      const char = trimmed[i]!
      if (inString) {
        if (escape) escape = false
        else if (char === "\\") escape = true
        else if (char === '"') inString = false
        continue
      }
      if (char === '"') inString = true
      else if (char === "{") depth++
      else if (char === "}") {
        depth--
        if (depth === 0) {
          rows.push(JSON.parse(trimmed.slice(start, i + 1)) as Record<string, unknown>)
          i++
          break
        }
      }
    }

    if (depth !== 0) throw new Error("Invalid JSONL: unclosed object")
  }

  return rows
}

export function collectJsonlColumns(rows: Record<string, unknown>[]) {
  const columns: string[] = []
  const seen = new Set<string>()

  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (seen.has(key)) continue
      seen.add(key)
      columns.push(key)
    }
  }

  return columns
}

export function formatJsonlText(value: unknown) {
  if (value === null || value === undefined) return ""
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  return JSON.stringify(value)
}

export function jsonlImagePaths(value: unknown) {
  if (typeof value === "string" && value.trim()) return [value.trim()]
  if (!Array.isArray(value)) return [] as string[]
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
}
