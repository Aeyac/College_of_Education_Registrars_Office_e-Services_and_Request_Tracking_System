import DOMPurify from 'dompurify';
import linkifyHtml from 'linkify-html';

const ALLOWED_TAGS = [
    'a',
    'blockquote',
    'br',
    'code',
    'div',
    'em',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'hr',
    'i',
    'iframe',
    'img',
    'li',
    'ol',
    'p',
    'pre',
    's',
    'small',
    'span',
    'strike',
    'strong',
    'sub',
    'sup',
    'table',
    'tbody',
    'td',
    'tfoot',
    'th',
    'thead',
    'tr',
    'u',
    'ul',
];

const ALLOWED_ATTR = [
    'allowfullscreen',
    'alt',
    'class',
    'colspan',
    'frameborder',
    'height',
    'href',
    'rel',
    'rowspan',
    'src',
    'style',
    'target',
    'title',
    'width',
];

/** Matches only the embed URLs Quill's video tooltip is able to produce. */
const EMBED_SRC =
    /^https:\/\/(?:www\.)?(?:youtube\.com\/embed\/|youtube-nocookie\.com\/embed\/|player\.vimeo\.com\/video\/)/i;

/**
 * The editor has no uploader wired up, so pasted images arrive inline as
 * base64. DOMPurify admits any data URI on an img, so narrow it to the same
 * three types HTML Purifier sniffs server-side; a wider set here would let an
 * image render on screen and then vanish the next time it is saved.
 */
const EMBEDDED_IMAGE_SRC =
    /^data:image\/(?:png|jpe?g|gif);base64,[a-z0-9+/=\s]+$/i;

const CHAT_ALLOWED_TAGS = ['a', 'br', 'code', 'em', 'p', 'strong'];

const CHAT_ALLOWED_ATTR = ['href', 'rel', 'target', 'title'];

const CACHE_LIMIT = 200;

const cache = new Map();
const chatCache = new Map();

let purifier = null;

function getPurifier() {
    if (purifier) {
        return purifier;
    }

    if (typeof window === 'undefined') {
        return null;
    }

    purifier = DOMPurify(window);

    purifier.addHook('afterSanitizeAttributes', (node) => {
        if (node.tagName === 'A' && node.getAttribute('target') === '_blank') {
            node.setAttribute('rel', 'noopener noreferrer');
        }

        if (node.tagName === 'IFRAME') {
            const src = node.getAttribute('src') || '';

            if (!EMBED_SRC.test(src)) {
                node.remove();
            }
        }

        if (node.tagName === 'IMG') {
            const src = node.getAttribute('src') || '';

            if (src.startsWith('data:') && !EMBEDDED_IMAGE_SRC.test(src)) {
                node.removeAttribute('src');
            }
        }
    });

    return purifier;
}

/**
 * Strips every construct that can execute script from rich-text announcement
 * HTML, then auto-links bare URLs. Sanitizing runs first so that linkify only
 * ever adds anchors built from text nodes, and any pre-existing anchor has
 * already had its scheme checked, so one pass is enough.
 */
export default function sanitizeHtml(content) {
    return sanitize(content, { ALLOWED_TAGS, ALLOWED_ATTR }, cache);
}

/**
 * The same guarantee for a chat bubble, which is the one place that turns
 * plain assistant text into markup. The allowlist is deliberately prose-only:
 * a message needs emphasis and line breaks, never media, styling or frames.
 */
export function sanitizeChatHtml(content) {
    return sanitize(
        content,
        { ALLOWED_TAGS: CHAT_ALLOWED_TAGS, ALLOWED_ATTR: CHAT_ALLOWED_ATTR },
        chatCache,
    );
}

function sanitize(content, allowlist, results) {
    if (typeof content !== 'string' || content === '') {
        return '';
    }

    const cached = results.get(content);

    if (cached !== undefined) {
        return cached;
    }

    const instance = getPurifier();

    const clean = instance
        ? instance.sanitize(content, {
              ...allowlist,
              ALLOW_DATA_ATTR: false,
              ALLOW_ARIA_ATTR: false,
          })
        : '';

    const result = linkifyHtml(clean, {
        target: '_blank',
        rel: 'noopener noreferrer',
    });

    if (results.size >= CACHE_LIMIT) {
        results.delete(results.keys().next().value);
    }

    results.set(content, result);

    return result;
}
