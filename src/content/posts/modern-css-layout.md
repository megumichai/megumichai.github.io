---
title: CSS 布局的三种现代方案
description: Flexbox、Grid 与容器查询，各自适合解决什么样的问题。
pubDate: 2026-09-28
tags: ["CSS", "前端"]
---

过去我们靠 `float` 和 `table` 拼页面，如今浏览器提供了更趁手的工具。

## Flexbox：一维布局

当你需要让一组元素在一条轴上对齐、分布时，Flexbox 是最自然的选择：

```css
.row {
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
}
```

## Grid：二维布局

需要同时控制行和列时，用 Grid：

```css
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
}
```

## 容器查询：组件级响应式

媒体查询看的是视口，容器查询看的是父容器——这让组件真正可以「即插即用」：

```css
@container (min-width: 420px) {
  .card {
    display: flex;
  }
}
```

三种方案并不互斥，组合使用才是常态。
