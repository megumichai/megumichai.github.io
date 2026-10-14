---
title: 用 Astro 搭建个人博客
description: 从零开始，用 Astro 的内容集合和动态路由搭建一个轻量、快速的博客站点。
pubDate: 2026-10-12
tags: ["Astro", "教程"]
---

Astro 是一个以内容为中心的现代站点构建工具。它默认输出零 JavaScript 的静态页面，
同时又能让你在需要时按需引入交互组件。

## 内容集合

把 Markdown 文件放进 `src/content/` 目录，再用 `content.config.ts` 定义集合和字段校验：

```ts
const posts = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
  }),
});
```

## 渲染页面

在页面里用 `getCollection` 读取所有文章，按时间排序后渲染列表：

```astro
---
import { getCollection } from "astro:content";

const posts = await getCollection("posts");
---
```

配合动态路由 `[...slug].astro`，每篇文章都会自动生成一个独立页面。

## 小结

Astro 的学习曲线平缓，适合用来写博客、文档和产品官网。
