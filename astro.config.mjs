// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  // The user page repository (megumichai.github.io), so the site lives at the
  // domain root and needs no `base`.
  site: "https://megumichai.github.io",
  integrations: [mdx()],
});
