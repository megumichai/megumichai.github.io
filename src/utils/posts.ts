import type { CollectionEntry } from "astro:content";

/**
 * Pinned entries float to the top, everything else stays newest-first.
 * Shared by the home list and the detail page's neighbour dock so the two
 * always agree on the order.
 */
export function byPinnedThenDate(a: CollectionEntry<"posts">, b: CollectionEntry<"posts">): number {
  if (a.data.pinned !== b.data.pinned) {
    return a.data.pinned ? -1 : 1;
  }
  return b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
}
