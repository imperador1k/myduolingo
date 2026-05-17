/**
 * Server-side HTML sanitizer.
 * Uses a whitelist approach to strip dangerous tags/attributes.
 * Protects against XSS in user-generated content rendered as HTML.
 */

const ALLOWED_TAGS = new Set([
    "p", "br", "strong", "em", "u", "s", "blockquote", "ul", "ol", "li",
    "h1", "h2", "h3", "h4", "h5", "h6", "a", "code", "pre", "hr",
    "table", "thead", "tbody", "tr", "th", "td", "img",
]);

const ALLOWED_ATTRS = new Set([
    "href", "src", "alt", "title", "class", "target", "rel",
    "width", "height", "colspan", "rowspan",
]);

const DANGEROUS_PROTOCOLS = ["javascript:", "data:", "vbscript:", "blob:"];

const TAG_REGEX = /<([a-z][a-z0-9]*)\b[^>]*>|<\/([a-z][a-z0-9]*)>/gi;
const ATTR_REGEX = /\s([a-z-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/gi;

export function sanitizeHtml(html: string): string {
    if (!html) return "";

    let sanitized = html;

    sanitized = sanitized.replace(TAG_REGEX, (match, openTag, closeTag) => {
        const tagName = (openTag || closeTag).toLowerCase();

        if (!ALLOWED_TAGS.has(tagName)) {
            return "";
        }

        if (closeTag) {
            return `</${tagName}>`;
        }

        const allowedAttrs: string[] = [];
        let attrMatch: RegExpExecArray | null;
        const attrRegex = new RegExp(ATTR_REGEX.source, "gi");

        while ((attrMatch = attrRegex.exec(match)) !== null) {
            const attrName = attrMatch[1].toLowerCase();
            const attrValue = attrMatch[2] || attrMatch[3] || attrMatch[4] || "";

            if (!ALLOWED_ATTRS.has(attrName)) continue;

            if (attrName === "href" || attrName === "src") {
                const lowerValue = attrValue.toLowerCase().trim();
                if (DANGEROUS_PROTOCOLS.some(p => lowerValue.startsWith(p))) {
                    continue;
                }
            }

            if (attrName === "target" && attrValue !== "_blank") {
                continue;
            }

            if (attrName === "rel" && !attrValue.includes("noopener")) {
                continue;
            }

            allowedAttrs.push(`${attrName}="${attrValue.replace(/"/g, "&quot;")}"`);
        }

        const attrsStr = allowedAttrs.length > 0 ? " " + allowedAttrs.join(" ") : "";
        return `<${tagName}${attrsStr}>`;
    });

    return sanitized;
}

export function sanitizeText(text: string): string {
    if (!text) return "";
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;");
}

export function sanitizeFileName(fileName: string): string {
    return fileName
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .replace(/_{2,}/g, "_")
        .substring(0, 100);
}

export function validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type);
}

export function validateFileSize(file: File, maxSizeBytes: number): boolean {
    return file.size <= maxSizeBytes;
}
