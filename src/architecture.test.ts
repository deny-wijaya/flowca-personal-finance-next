import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Architecture test: menjaga aturan yang tidak bisa (atau sulit) dicek ESLint.
 * Aturan arah import per layer ada di eslint.config.mjs; test ini menjaga struktur
 * folder, batas antar modul, dan aturan keamanan data. Penjelasan tiap aturan ada
 * di docs/ARCHITECTURE.md. Kalau test ini gagal, perbaiki kodenya, bukan test-nya.
 */

const SRC = path.resolve(import.meta.dirname);
const LAYERS = ["domain", "application", "infrastructure", "presentation"] as const;
const PRESENTATION_DIRS = ["components", "screens", "view-models"];
const TOP_LEVEL = ["app", "di", "modules", "shared", "architecture.test.ts"];
const SHARED_DIRS = ["config", "domain", "infrastructure", "lib", "ui"];

const isIgnored = (name: string) => name.startsWith(".");

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (isIgnored(entry.name)) return [];
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const rel = (file: string) => path.relative(SRC, file).split(path.sep).join("/");
const isTest = (file: string) => /\.test\.tsx?$/.test(file);
const sourceFiles = walk(SRC).filter((f) => /\.(ts|tsx)$/.test(f));

type ImportEdge = { from: string; to: string };

/** Semua import dari satu file, di-resolve menjadi path relatif terhadap src/. */
function importsOf(file: string): ImportEdge[] {
  const code = fs.readFileSync(file, "utf8");
  const specs = [...code.matchAll(/(?:import|export)\s[^"';]*?from\s+["']([^"']+)["']|import\s+["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g)].map(
    (m) => m[1] ?? m[2] ?? m[3],
  );
  return specs.flatMap((spec) => {
    if (spec.startsWith("@/")) return [{ from: rel(file), to: spec.slice(2) }];
    if (spec.startsWith(".")) return [{ from: rel(file), to: rel(path.resolve(path.dirname(file), spec)) }];
    return [];
  });
}

const edges = sourceFiles.flatMap(importsOf);
const moduleOf = (p: string) => p.match(/^modules\/([^/]+)\//)?.[1];
const layerOf = (p: string) => p.match(/^modules\/[^/]+\/([^/]+)\//)?.[1];
const dirs = (dir: string) =>
  fs.readdirSync(dir, { withFileTypes: true }).filter((e) => !isIgnored(e.name));

describe("struktur folder", () => {
  it("src/ hanya berisi app, di, modules, shared", () => {
    const extra = dirs(SRC).map((e) => e.name).filter((n) => !TOP_LEVEL.includes(n));
    expect(extra, "Folder baru di src/ harus masuk ke salah satu folder yang sudah ada").toEqual([]);
  });

  it("src/shared/ hanya berisi config, domain, infrastructure, lib, ui", () => {
    const extra = dirs(path.join(SRC, "shared")).map((e) => e.name).filter((n) => !SHARED_DIRS.includes(n));
    expect(extra).toEqual([]);
  });

  it("setiap modul hanya berisi layer domain, application, infrastructure, presentation", () => {
    const violations = dirs(path.join(SRC, "modules")).flatMap((mod) =>
      dirs(path.join(SRC, "modules", mod.name))
        .filter((e) => !e.isDirectory() || !(LAYERS as readonly string[]).includes(e.name))
        .map((e) => `modules/${mod.name}/${e.name}`),
    );
    expect(violations).toEqual([]);
  });

  it("subfolder presentation hanya components, screens, view-models", () => {
    const violations = dirs(path.join(SRC, "modules")).flatMap((mod) => {
      const dir = path.join(SRC, "modules", mod.name, "presentation");
      if (!fs.existsSync(dir)) return [];
      return dirs(dir)
        .filter((e) => e.isDirectory() && !PRESENTATION_DIRS.includes(e.name))
        .map((e) => `modules/${mod.name}/presentation/${e.name}`);
    });
    expect(violations).toEqual([]);
  });
});

describe("batas antar modul", () => {
  it("shared/ tidak bergantung pada modules, di, atau app", () => {
    const violations = edges
      .filter((e) => e.from.startsWith("shared/") && /^(modules|di|app)\//.test(e.to))
      .map((e) => `${e.from} -> ${e.to}`);
    expect(violations).toEqual([]);
  });

  it("infrastructure modul lain hanya boleh dipakai di di/container.ts dan test", () => {
    const violations = edges
      .filter((e) => layerOf(e.to) === "infrastructure" && moduleOf(e.to) !== moduleOf(e.from))
      .filter((e) => e.from !== "di/container.ts" && !isTest(e.from))
      .map((e) => `${e.from} -> ${e.to}`);
    expect(violations).toEqual([]);
  });

  it("hanya app/ yang boleh import di/container", () => {
    const violations = edges
      .filter((e) => e.to === "di/container" && !e.from.startsWith("app/") && !/^modules\/[^/]+\/presentation\/actions\.ts$/.test(e.from))
      .map((e) => `${e.from} -> ${e.to}`);
    expect(violations).toEqual([]);
  });

  it("dependency antar modul tidak membentuk siklus", () => {
    const graph = new Map<string, Set<string>>();
    for (const e of edges) {
      const a = moduleOf(e.from);
      const b = moduleOf(e.to);
      if (a && b && a !== b && !isTest(e.from)) {
        if (!graph.has(a)) graph.set(a, new Set());
        graph.get(a)!.add(b);
      }
    }
    const cycles: string[] = [];
    const visit = (node: string, trail: string[]) => {
      if (trail.includes(node)) {
        cycles.push([...trail.slice(trail.indexOf(node)), node].join(" -> "));
        return;
      }
      for (const next of graph.get(node) ?? []) visit(next, [...trail, node]);
    };
    for (const node of graph.keys()) visit(node, []);
    expect([...new Set(cycles)]).toEqual([]);
  });
});

describe("keamanan data & konfigurasi", () => {
  const contentOf = (file: string) => fs.readFileSync(file, "utf8");

  it("process.env hanya dibaca di shared/config/env.ts", () => {
    const violations = sourceFiles
      .filter((f) => rel(f) !== "shared/config/env.ts" && !isTest(f) && /process\.env/.test(contentOf(f)))
      .map(rel);
    expect(violations).toEqual([]);
  });

  it("tidak ada env NEXT_PUBLIC_ (API_BASE_URL dan token tidak boleh sampai ke browser)", () => {
    const violations = sourceFiles.filter((f) => !isTest(f) && /NEXT_PUBLIC_/.test(contentOf(f))).map(rel);
    expect(violations).toEqual([]);
  });

  it('tidak ada "use cache" (data keuangan bersifat per user)', () => {
    const violations = sourceFiles.filter((f) => !isTest(f) && /["']use cache/.test(contentOf(f))).map(rel);
    expect(violations).toEqual([]);
  });

  it('env.ts dan container.ts diawali import "server-only"', () => {
    for (const file of ["shared/config/env.ts", "di/container.ts"]) {
      expect(contentOf(path.join(SRC, file)).trimStart().startsWith('import "server-only"'), file).toBe(true);
    }
  });
});
