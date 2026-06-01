import { describe, expect, test } from "bun:test"
import { fileContentToImageUrl, resolveFileReadPath, resolveFileReadRequest } from "./resolve-file-read-path"

describe("resolveFileReadRequest", () => {
  test("keeps relative paths in the project directory", () => {
    expect(resolveFileReadRequest("data/example.jsonl", "/home/maqiang/BenchClaw")).toEqual({
      directory: "/home/maqiang/BenchClaw",
      path: "data/example.jsonl",
    })
  })

  test("converts absolute paths inside project to relative paths", () => {
    expect(
      resolveFileReadRequest(
        "/home/maqiang/BenchClaw/thirty_part/annotationTools/yoloe/figures/logo.png",
        "/home/maqiang/BenchClaw",
      ),
    ).toEqual({
      directory: "/home/maqiang/BenchClaw",
      path: "thirty_part/annotationTools/yoloe/figures/logo.png",
    })
  })

  test("reads sibling absolute paths from their parent directory", () => {
    expect(
      resolveFileReadRequest(
        "/home/maqiang/uav_eval_dataset_assets/img_0001/img_0001.jpg",
        "/home/maqiang/BenchClaw",
      ),
    ).toEqual({
      directory: "/home/maqiang/uav_eval_dataset_assets/img_0001",
      path: "img_0001.jpg",
    })
  })

  test("resolves relative parent paths outside the project", () => {
    expect(resolveFileReadRequest("../uav_eval_dataset_assets/img_0001/img_0001.jpg", "/home/maqiang/BenchClaw")).toEqual({
      directory: "/home/maqiang/uav_eval_dataset_assets/img_0001",
      path: "img_0001.jpg",
    })
  })
})

describe("resolveFileReadPath", () => {
  test("returns the read path for in-project files", () => {
    expect(resolveFileReadPath("data/example.jsonl", "/home/maqiang/BenchClaw")).toBe("data/example.jsonl")
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
