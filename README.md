# Astro Starter Kit: Minimal

```sh
pnpm create astro@latest -- --template minimal
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `pnpm install`         | Installs dependencies                            |
| `pnpm dev`             | Starts local dev server at `localhost:4321`      |
| `pnpm build`           | Build your production site to `./dist/`          |
| `pnpm preview`         | Preview your build locally, before deploying     |
| `pnpm fmt`             | Formats the source with oxfmt                    |
| `pnpm lint`            | Lints the source with oxlint                     |
| `pnpm typecheck`       | Type-checks the project with astro check         |
| `pnpm astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `pnpm astro -- --help` | Get help using the Astro CLI                     |

## 🪝 Git hooks

[Husky](https://typicode.github.io/husky/) installs a `pre-commit` hook that runs
[lint-staged](https://github.com/lint-staged/lint-staged), so only the files you are
about to commit are checked. The tasks live in `.lintstagedrc.mjs`:

- `oxlint --fix` on JavaScript, TypeScript, and `.astro` files
- `oxfmt --write` on the file types oxfmt supports
- `pnpm typecheck` (once) when a TypeScript or `.astro` file is staged

Any fixes are added back to the commit automatically. If something cannot be fixed
automatically — or the type check fails — the commit is aborted.

The hook is installed by the `prepare` script on `pnpm install`.

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
