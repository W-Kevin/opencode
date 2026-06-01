function splitPath(input: string) {
  return input.replace(/\\/g, "/").replace(/\/+$/, "").split("/").filter(Boolean)
}

function normalizeDirectory(input: string) {
  return input.replace(/\\/g, "/").replace(/\/+$/, "")
}

function isAbsolutePath(input: string) {
  return input.startsWith("/") || /^[A-Za-z]:\//.test(input)
}

function resolveAbsolutePath(file: string, projectDirectory: string) {
  const normalized = file.replace(/\\/g, "/").trim()
  if (!normalized) return normalized
  if (isAbsolutePath(normalized)) return normalized.replace(/\/+$/, "")

  const root = normalizeDirectory(projectDirectory)
  const parts = [...splitPath(root), ...splitPath(normalized)]
  const resolved: string[] = []
  for (const part of parts) {
    if (part === ".") continue
    if (part === "..") {
      resolved.pop()
      continue
    }
    resolved.push(part)
  }

  if (/^[A-Za-z]:\//.test(root)) {
    const drive = root.slice(0, 2)
    return `${drive}/${resolved.slice(1).join("/")}`.replace(/\/+$/, "")
  }

  return `/${resolved.join("/")}`.replace(/\/+$/, "")
}

function isInsideDirectory(file: string, root: string) {
  const fileKey = file.toLowerCase()
  const rootKey = root.toLowerCase()
  return fileKey === rootKey || fileKey.startsWith(`${rootKey}/`)
}

export function resolveFileReadRequest(input: string, projectDirectory: string) {
  const root = normalizeDirectory(projectDirectory)
  const absolute = resolveAbsolutePath(input, root)
  if (!absolute) return { directory: root, path: input }

  if (isInsideDirectory(absolute, root)) {
    if (absolute.toLowerCase() === root.toLowerCase()) return { directory: root, path: "." }
    return { directory: root, path: absolute.slice(root.length + 1) }
  }

  const index = absolute.lastIndexOf("/")
  if (index === -1) return { directory: root, path: absolute }
  return { directory: absolute.slice(0, index), path: absolute.slice(index + 1) }
}

export function resolveFileReadPath(input: string, projectDirectory: string) {
  return resolveFileReadRequest(input, projectDirectory).path
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
