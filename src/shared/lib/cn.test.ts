import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("membedakan ukuran huruf token dari warna teks", () => {
    expect(cn("text-ink text-15", "text-20")).toBe("text-ink text-20");
    expect(cn("text-ink text-15", "text-danger")).toBe("text-15 text-danger");
  });

  it("menggabungkan bayangan keras dan radius token", () => {
    expect(cn("shadow-hard-2 rounded-lg", "shadow-hard-4 rounded-sheet")).toBe("shadow-hard-4 rounded-sheet");
  });

  it("membedakan font keluarga dari ketebalan", () => {
    expect(cn("font-display font-bold", "font-body")).toBe("font-bold font-body");
  });
});
