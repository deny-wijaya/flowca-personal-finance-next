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
    files: ["src/app/**"],
    rules: {
      "no-restricted-imports": forbid(
        [["**/infrastructure/**", "@/shared/config/*"]],
        "UI tidak boleh memanggil infrastructure atau membaca env langsung. Pakai use case lewat @/di/container.",
      ),
    },
  },
  {
    // Screen, komponen, dan mapper view model harus murni: tidak ada akses data atau env.
    files: [
      "src/modules/*/presentation/components/**",
      "src/modules/*/presentation/screens/**",
      "src/modules/*/presentation/view-models/**",
      "src/shared/ui/**",
    ],
    ignores: ["**/*.test.ts"],
    rules: {
      "no-restricted-imports": forbid(
        [["**/infrastructure/**", "@/shared/config/*", "@/di/*", "**/application/*-use-cases", "**/application/create-*", "**/application/list-*"]],
        "Screen & komponen hanya menerima view model lewat props. Panggil use case di page.tsx atau Server Action.",
      ),
    },
  },
  {
    // Nilai visual hanya dari token (tokens.css). Tolak hex dan nilai arbitrer px di class Tailwind.
    files: ["src/modules/*/presentation/**/*.{ts,tsx}", "src/shared/ui/**/*.{ts,tsx}", "src/app/**/*.tsx"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXAttribute[name.name='className'] Literal[value=/#[0-9a-fA-F]{3,8}|\\[[^\\]]*\\d+px[^\\]]*\\]/]",
          message: "Jangan menulis hex atau nilai arbitrer px di className. Pakai utility dari token (lihat tokens.css).",
        },
        {
          selector: "CallExpression[callee.name=/^(cva|cn)$/] Literal[value=/#[0-9a-fA-F]{3,8}|\\[[^\\]]*\\d+px[^\\]]*\\]/]",
          message: "Jangan menulis hex atau nilai arbitrer px di varian. Pakai utility dari token (lihat tokens.css).",
        },
      ],
    },
  },
  {
    // Env hanya dibaca dan divalidasi di satu tempat.
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/shared/config/env.ts", "**/*.test.ts"],
    rules: {
      "no-restricted-properties": [
        "error",
        { object: "process", property: "env", message: "Baca env lewat `env` dari @/shared/config/env, bukan process.env." },
      ],
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
