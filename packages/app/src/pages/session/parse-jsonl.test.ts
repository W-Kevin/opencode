import { describe, expect, test } from "bun:test"
import { collectJsonlColumns, formatJsonlText, jsonlImagePaths, parseJsonlContent } from "./parse-jsonl"

describe("parseJsonlContent", () => {
  test("parses newline-separated objects", () => {
    const rows = parseJsonlContent('{"id":"a"}\n{"id":"b"}')
    expect(rows).toEqual([{ id: "a" }, { id: "b" }])
  })

  test("parses concatenated objects without newlines", () => {
    const rows = parseJsonlContent('{"id":"a"}{"id":"b"}')
    expect(rows).toEqual([{ id: "a" }, { id: "b" }])
  })

  test("handles nested braces inside strings", () => {
    const rows = parseJsonlContent('{"question":"is {this} ok?","answer":"yes"}')
    expect(rows).toEqual([{ question: "is {this} ok?", answer: "yes" }])
  })
})

describe("collectJsonlColumns", () => {
  test("preserves first-seen key order and adds later keys", () => {
    const columns = collectJsonlColumns([{ id: "1", image: "a.jpg" }, { id: "2", extra: true }])
    expect(columns).toEqual(["id", "image", "extra"])
  })
})

describe("formatJsonlText", () => {
  test("stringifies objects", () => {
    expect(formatJsonlText({ a: 1 })).toBe('{"a":1}')
  })
})

describe("jsonlImagePaths", () => {
  test("collects image paths from string and array values", () => {
    expect(jsonlImagePaths("/tmp/a.jpg")).toEqual(["/tmp/a.jpg"])
    expect(jsonlImagePaths(["/tmp/a.jpg", "", "/tmp/b.jpg"])).toEqual(["/tmp/a.jpg", "/tmp/b.jpg"])
  })
})
