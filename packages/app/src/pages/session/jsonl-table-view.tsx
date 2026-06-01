import { Spinner } from "@opencode-ai/ui/spinner"
import { useDialog } from "@opencode-ai/ui/context/dialog"
import { ImagePreview } from "@opencode-ai/ui/image-preview"
import { createMemo, createResource, For, Show } from "solid-js"
import { useSDK } from "@/context/sdk"
import { useLanguage } from "@/context/language"
import {
  collectJsonlColumns,
  formatJsonlText,
  jsonlImagePaths,
  parseJsonlContent,
} from "@/pages/session/parse-jsonl"
import { fileContentToImageUrl, resolveFileReadRequest } from "@/pages/session/resolve-file-read-path"

function JsonlImage(props: { path: string }) {
  const sdk = useSDK()
  const dialog = useDialog()
  const language = useLanguage()

  const readRequest = createMemo(() => resolveFileReadRequest(props.path, sdk.directory))

  const [loaded] = createResource(
    readRequest,
    (request) =>
      sdk.client.file
        .read({ path: request.path, directory: request.directory })
        .then((result) => fileContentToImageUrl(result.data, props.path))
        .catch(() => undefined),
  )

  return (
    <Show
      when={!loaded.loading}
      fallback={
        <div class="flex h-24 items-center justify-center">
          <Spinner class="size-4" />
        </div>
      }
    >
      <Show
        when={loaded()}
        fallback={<span class="text-12-regular text-text-weak break-all">{props.path}</span>}
      >
        {(src) => (
          <button
            type="button"
            class="block max-w-full cursor-zoom-in rounded border border-border-weak-base bg-surface-panel p-1"
            onClick={() => dialog.show(() => <ImagePreview src={src()} alt={props.path} />)}
            aria-label={language.t("ui.imagePreview.alt")}
          >
            <img src={src()} alt={props.path} class="max-h-32 max-w-full object-contain" loading="lazy" />
          </button>
        )}
      </Show>
    </Show>
  )
}

function JsonlTextCell(props: { text: string }) {
  return (
    <div class="rounded-sm line-clamp-3 overflow-hidden break-words whitespace-pre-wrap text-12-regular text-text-strong transition-[box-shadow,background-color] group-hover/cell:line-clamp-none group-hover/cell:overflow-visible group-hover/cell:relative group-hover/cell:z-[5] group-hover/cell:-m-2 group-hover/cell:bg-surface-raised-base group-hover/cell:p-2 group-hover/cell:shadow-md">
      {props.text}
    </div>
  )
}

function JsonlCell(props: { column: string; value: unknown }) {
  if (props.column === "image" || props.column === "auxiliary_images") {
    const paths = jsonlImagePaths(props.value)
    return (
      <Show when={paths.length > 0} fallback={<span class="text-12-regular text-text-weak">—</span>}>
        <div class="flex flex-col gap-2">
          <For each={paths}>{(path) => <JsonlImage path={path} />}</For>
        </div>
      </Show>
    )
  }

  return <JsonlTextCell text={formatJsonlText(props.value)} />
}

export function JsonlTableView(props: { content: string; class?: string }) {
  const parsed = createMemo(() => {
    try {
      const rows = parseJsonlContent(props.content)
      return {
        rows,
        columns: collectJsonlColumns(rows),
        error: undefined as string | undefined,
      }
    } catch (error) {
      return {
        rows: [] as Record<string, unknown>[],
        columns: [] as string[],
        error: error instanceof Error ? error.message : String(error),
      }
    }
  })

  return (
    <div
      classList={{
        "flex h-full min-h-0 flex-col px-4 py-4": true,
        [props.class ?? ""]: !!props.class,
      }}
    >
      <Show when={parsed().error}>
        {(error) => <div class="text-12-regular text-text-weak">{error()}</div>}
      </Show>
      <Show when={!parsed().error && parsed().rows.length === 0}>
        <div class="text-12-regular text-text-weak">—</div>
      </Show>
      <Show when={!parsed().error && parsed().rows.length > 0}>
        <div class="min-h-0 flex-1 overflow-auto rounded-md border border-border-weak-base bg-background-stronger">
          <table class="min-w-full border-separate border-spacing-0 text-left">
            <thead>
              <tr>
                <For each={parsed().columns}>
                  {(column) => (
                    <th class="sticky top-0 z-30 border-b border-border-weak-base bg-background-stronger px-3 py-2 text-12-medium text-text-strong whitespace-nowrap shadow-[0_1px_0_0_var(--border-weak-base)]">
                      {column}
                    </th>
                  )}
                </For>
              </tr>
            </thead>
            <tbody>
              <For each={parsed().rows}>
                {(row) => (
                  <tr class="align-top odd:bg-surface-base even:bg-surface-panel/40">
                    <For each={parsed().columns}>
                      {(column) => (
                        <td class="group/cell relative border-b border-border-weak-base px-3 py-2 min-w-[120px] max-w-[420px] align-top">
                          <JsonlCell column={column} value={row[column]} />
                        </td>
                      )}
                    </For>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
      </Show>
    </div>
  )
}
