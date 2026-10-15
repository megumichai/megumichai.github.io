import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const posts = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    /**
     * "today" makes an entry's date track the viewer's current day instead of
     * the frontmatter date — used by the pinned About post, whose date should
     * never go stale. pubDate still drives the ordering either way.
     */
    dateMode: z.enum(["fixed", "today"]).default("fixed"),
    type: z.enum(["post", "demo"]).default("post"),
    url: z.url().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    pinned: z.boolean().default(false),
  }),
});

export const collections = { posts };
