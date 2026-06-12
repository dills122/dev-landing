import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { absoluteUrl } from "../lib/seo";

const escapeXml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const formatDate = (date: Date) => date.toISOString().split("T")[0];

export const GET: APIRoute = async () => {
  const posts = (await getCollection("blog"))
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
  const tags = [...new Set(posts.flatMap((post) => post.data.tags))].sort();
  const latestPostDate = posts[0]?.data.updatedDate ?? posts[0]?.data.pubDate;

  const urls = [
    {
      path: "",
      lastmod: latestPostDate,
      changefreq: "monthly",
      priority: "1.0",
    },
    {
      path: "blog/",
      lastmod: latestPostDate,
      changefreq: "weekly",
      priority: "0.8",
    },
    {
      path: "archive/personal-website/",
      lastmod: latestPostDate,
      changefreq: "yearly",
      priority: "0.4",
    },
    ...posts.map((post) => ({
      path: `blog/${post.id}/`,
      lastmod: post.data.updatedDate ?? post.data.pubDate,
      changefreq: "monthly",
      priority: "0.7",
    })),
    ...tags.map((tag) => ({
      path: `blog/tags/${tag}/`,
      lastmod: latestPostDate,
      changefreq: "weekly",
      priority: "0.5",
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${escapeXml(absoluteUrl(url.path))}</loc>
    ${url.lastmod ? `<lastmod>${formatDate(url.lastmod)}</lastmod>` : ""}
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};
