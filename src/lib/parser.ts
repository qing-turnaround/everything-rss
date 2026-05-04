import Parser from "rss-parser";

const parser = new Parser({
  timeout: 15000,
  headers: {
    "User-Agent": "Everything-RSS/1.0",
  },
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: false }],
      ["media:thumbnail", "mediaThumbnail", { keepArray: false }],
      ["enclosure", "enclosure", { keepArray: false }],
    ],
  },
});

export interface ParsedEntry {
  guid: string;
  title: string;
  url: string;
  content: string;
  summary: string;
  author: string;
  thumbnail: string | null;
  mediaUrl: string | null;
  publishedAt: number | null;
}

export interface ParsedFeed {
  title: string;
  siteUrl: string;
  description: string;
  entries: ParsedEntry[];
}

function extractThumbnail(item: Record<string, unknown>): string | null {
  const mediaThumbnail = item.mediaThumbnail as Record<string, unknown> | undefined;
  if (mediaThumbnail?.$ && (mediaThumbnail.$ as Record<string, string>).url) {
    return (mediaThumbnail.$ as Record<string, string>).url;
  }
  const mediaContent = item.mediaContent as Record<string, unknown> | undefined;
  if (mediaContent?.$ && (mediaContent.$ as Record<string, string>).url) {
    const type = (mediaContent.$ as Record<string, string>).type || "";
    if (type.startsWith("image/")) {
      return (mediaContent.$ as Record<string, string>).url;
    }
  }
  return null;
}

function extractMediaUrl(item: Record<string, unknown>): string | null {
  const mediaContent = item.mediaContent as Record<string, unknown> | undefined;
  if (mediaContent?.$ && (mediaContent.$ as Record<string, string>).url) {
    const type = (mediaContent.$ as Record<string, string>).type || "";
    if (type.startsWith("video/") || type.startsWith("audio/")) {
      return (mediaContent.$ as Record<string, string>).url;
    }
  }
  const enclosure = item.enclosure as Record<string, unknown> | undefined;
  if (enclosure?.url) {
    return enclosure.url as string;
  }
  return null;
}

export async function parseFeed(url: string): Promise<ParsedFeed> {
  const feed = await parser.parseURL(url);

  const entries: ParsedEntry[] = (feed.items || []).map((item) => {
    const raw = item as unknown as Record<string, unknown>;
    return {
      guid: (item.guid || raw.id || item.link || item.title || "") as string,
      title: (item.title || "") as string,
      url: (item.link || "") as string,
      content: ((item.content || raw["content:encoded"] || "") as string),
      summary: (item.contentSnippet || raw.summary || "") as string,
      author: (item.creator || raw.author || "") as string,
      thumbnail: extractThumbnail(raw),
      mediaUrl: extractMediaUrl(raw),
      publishedAt: item.isoDate ? Math.floor(new Date(item.isoDate).getTime() / 1000) : null,
    };
  });

  return {
    title: feed.title || "",
    siteUrl: feed.link || "",
    description: feed.description || "",
    entries,
  };
}
