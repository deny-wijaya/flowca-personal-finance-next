import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * Aturan clean architecture: arah dependency hanya boleh ke dalam.
 * presentation -> application -> domain. Infrastructure mengimplementasikan port di domain.
 */
const forbid = (patterns, message) => ["error", { patterns: patterns.map((group) => ({ group, message })) }];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/modules/*/domain/**", "src/shared/domain/**"],
    ignores: ["**/*.test.ts"],
    rules: {
      "no-restricted-imports": forbid(
        [["**/application/**", "**/infrastructure/**", "**/presentation/**", "@/di/*", "next", "next/*", "react", "react-dom", "zod"]],
        "Domain harus murni: tidak boleh import application, infrastructure, presentation, framework, atau library validasi.",
      ),
    },
  },
  {
    files: ["src/modules/*/application/**"],
    ignores: ["**/*.test.ts"],
    rules: {
      "no-restricted-imports": forbid(
        [["**/infrastructure/**", "**/presentation/**", "@/di/*", "next", "next/*", "react", "react-dom"]],
        "Application hanya boleh bergantung pada domain (lewat interface repository).",
      ),
    },
  },
  {
    files: ["src/modules/*/infrastructure/**", "src/shared/infrastructure/**"],
    ignores: ["**/*.test.ts"],
    rules: {
      "no-restricted-imports": forbid(
        [["**/presentation/**", "@/di/*", "react", "react-dom"]],
        "Infrastructure tidak boleh bergantung pada presentation atau composition root.",
      ),
    },
  },
  {
    files: ["src/app/**", "src/modules/*/presentation/components/**"],
    rules: {
      "no-restricted-imports": forbid(
        [["**/infrastructure/**", "@/shared/config/*"]],
        "UI tidak boleh memanggil infrastructure atau membaca env langsung. Pakai use case lewat @/di/container.",
      ),
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
