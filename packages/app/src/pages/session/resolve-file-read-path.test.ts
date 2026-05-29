import { describe, expect, test } from "bun:test"
import { fileContentToImageUrl, resolveFileReadPath } from "./resolve-file-read-path"

describe("resolveFileReadPath", () => {
  test("keeps relative paths unchanged", () => {
    expect(resolveFileReadPath("data/example.jsonl", "/home/maqiang/BenchClaw")).toBe("data/example.jsonl")
  })

  test("converts absolute paths inside project to relative paths", () => {
    expect(
      resolveFileReadPath(
        "/home/maqiang/BenchClaw/thirty_part/annotationTools/yoloe/figures/logo.png",
        "/home/maqiang/BenchClaw",
      ),
    ).toBe("thirty_part/annotationTools/yoloe/figures/logo.png")
  })

  test("converts sibling absolute paths to relative parent paths", () => {
    expect(
      resolveFileReadPath(
        "/home/maqiang/uav_eval_dataset_assets/img_0001/img_0001.jpg",
        "/home/maqiang/BenchClaw",
      ),
    ).toBe("../uav_eval_dataset_assets/img_0001/img_0001.jpg")
  })
})

describe("fileContentToImageUrl", () => {
  test("builds data url from base64 file content", () => {
    const url = fileContentToImageUrl(
      {
        type: "text",
        content: "abc",
        encoding: "base64",
        mimeType: "image/jpeg",
      },
      "/tmp/example.jpg",
    )

    expect(url).toBe("data:image/jpeg;base64,abc")
  })
})
