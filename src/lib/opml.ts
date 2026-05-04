export interface OpmlOutline {
  title: string;
  xmlUrl?: string;
  htmlUrl?: string;
  type?: string;
  children: OpmlOutline[];
}

export function parseOpml(xml: string): OpmlOutline[] {
  const outlines: OpmlOutline[] = [];
  const bodyMatch = xml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (!bodyMatch) return outlines;

  const body = bodyMatch[1];
  return parseOutlines(body);
}

function parseOutlines(xml: string): OpmlOutline[] {
  const results: OpmlOutline[] = [];
  const regex = /<outline([^>]*?)(?:\/>|>([\s\S]*?)<\/outline>)/gi;
  let match;

  while ((match = regex.exec(xml)) !== null) {
    const attrs = match[1];
    const children = match[2] || "";

    const title = getAttr(attrs, "title") || getAttr(attrs, "text") || "";
    const xmlUrl = getAttr(attrs, "xmlUrl");
    const htmlUrl = getAttr(attrs, "htmlUrl");
    const type = getAttr(attrs, "type");

    results.push({
      title,
      xmlUrl: xmlUrl || undefined,
      htmlUrl: htmlUrl || undefined,
      type: type || undefined,
      children: children.trim() ? parseOutlines(children) : [],
    });
  }

  return results;
}

function getAttr(attrs: string, name: string): string | null {
  const regex = new RegExp(`${name}\\s*=\\s*"([^"]*)"`, "i");
  const match = attrs.match(regex);
  return match ? decodeXmlEntities(match[1]) : null;
}

function decodeXmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}
