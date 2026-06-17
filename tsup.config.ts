import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index:            "src/index.ts",
    "modules/identity": "src/modules/identity.ts",
    "modules/trust":    "src/modules/trust.ts",
    "modules/wallet":   "src/modules/wallet.ts",
    "modules/alia":     "src/modules/alia.ts",
    "modules/mail":     "src/modules/mail.ts",
    "modules/products": "src/modules/products.ts",
  },
  format:  ["esm", "cjs"],
  dts:     true,
  clean:   true,
  treeshake:  true,
  sourcemap:  true,
  target:     "es2020",
  platform:   "neutral",
});
