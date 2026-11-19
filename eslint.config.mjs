import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

// Pakai aturan Next.js/TypeScript dan abaikan output serta file lama.
export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  globalIgnores([".next/**", "src/generated/**", "legacy-tourify/**", "next-env.d.ts"]),
]);
