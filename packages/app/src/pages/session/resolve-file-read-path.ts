function splitPath(input: string) {
  return input.replace(/\\/g, "/").replace(/\/+$/, "").split("/").filter(Boolean)
}

function relativeUnixPath(from: string, to: string) {
  const fromParts = splitPath(from)
  const toParts = splitPath(to)
  let index = 0
  while (index < fromParts.length && index < toParts.length && fromParts[index] === toParts[index]) index++

  const up = fromParts.length - index
  const down = toParts.slice(index)
  if (up === 0) return down.join("/")
  return `${"../".repeat(up)}${down.join("/")}`
}

export function resolveFileReadPath(input: string, projectDirectory: string) {
  const file = input.replace(/\\/g, "/").trim()
  if (!file) return file

  const root = projectDirectory.replace(/\\/g, "/").replace(/\/+$/, "")
  const absolute = file.startsWith("/") || /^[A-Za-z]:\//.test(file)
  if (!absolute) return file

  const normalized = file.replace(/\/+$/, "")
  const rootKey = root.toLowerCase()
  const fileKey = normalized.toLowerCase()

  if (fileKey === rootKey) return "."
  if (fileKey.startsWith(`${rootKey}/`)) return normalized.slice(root.length + 1)

  return relativeUnixPath(root, normalized)
}

export function fileContentToImageUrl(content: unknown, filePath: string) {
  if (!content || typeof content !== "object") return

  const record = content as {
    content?: unknown
    encoding?: unknown
    mimeType?: unknown
    type?: unknown
  }

  if (typeof record.content !== "string" || !record.content) return

  const ext = filePath.split(".").pop()?.toLowerCase()
  const mimeFromExt =
    ext === "jpg" || ext === "jpeg"
      ? "image/jpeg"
      : ext === "png"
        ? "image/png"
        : ext === "gif"
          ? "image/gif"
          : ext === "webp"
            ? "image/webp"
            : ext
              ? `image/${ext}`
              : undefined

  const mime =
    typeof record.mimeType === "string"
      ? record.mimeType.split(";", 1)[0]?.trim().toLowerCase()
      : mimeFromExt

  if (!mime?.startsWith("image/")) return
  if (record.encoding !== "base64") return

  return `data:${mime};base64,${record.content}`
}
