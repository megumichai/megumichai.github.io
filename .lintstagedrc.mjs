/** @type {import("lint-staged").Configuration} */
export default {
  // Run the fixers in sequence so they don't rewrite the same file at once.
  "*.{js,cjs,mjs,jsx,ts,cts,mts,tsx}": ["oxlint --fix", "oxfmt --write"],
  // oxfmt does not support Astro files, so lint them only.
  "*.astro": "oxlint --fix",
  // Everything else oxfmt understands.
  "*.{json,jsonc,json5,css,md,mdx,yml,yaml}": "oxfmt --write",
  // `astro check` always type-checks the whole project and takes no file
  // arguments, so ignore the filenames lint-staged passes and run it once.
  "*.{ts,cts,mts,tsx,astro}": () => "pnpm typecheck",
};
