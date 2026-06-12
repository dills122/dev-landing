import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { absoluteUrl, SITE } from "../lib/seo";

const escapeXml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

export const GET: APIRoute = async () => {
  const posts = (await getCollection("blog"))
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Dylan Steele writing</title>
    <description>${escapeXml(SITE.description)}</description>
    <link>${escapeXml(absoluteUrl("blog/"))}</link>
    <atom:link href="${escapeXml(absoluteUrl("rss.xml"))}" rel="self" type="application/rss+xml" />
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${posts
  .map(
    (post) => `    <item>
      <title>${escapeXml(post.data.title)}</title>
      <description>${escapeXml(post.data.description)}</description>
      <link>${escapeXml(absoluteUrl(`blog/${post.id}/`))}</link>
      <guid>${escapeXml(absoluteUrl(`blog/${post.id}/`))}</guid>
      <pubDate>${post.data.pubDate.toUTCString()}</pubDate>
      ${post.data.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join("\n      ")}
    </item>`,
  )
  .join("\n")}
  </channel>
</rss>
`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
};
