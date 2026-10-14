import { defineMiddleware } from "astro:middleware";

// In dev, Vite injects inline <style> blocks before <head>, pushing the
// <meta charset> tag past the browser's 1024-byte encoding-sniffing window.
// Without a charset in the HTTP header the browser falls back to the system
// default encoding and renders the Chinese text as mojibake. Adding the
// charset to the Content-Type header fixes it regardless of tag position.
export const onRequest = defineMiddleware(async (_context, next) => {
  const response = await next();
  const contentType = response.headers.get("content-type");

  if (contentType?.startsWith("text/html")) {
    response.headers.set("content-type", "text/html; charset=utf-8");
  }

  return response;
});
