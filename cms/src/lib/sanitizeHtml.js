const ALLOWED_TAGS = new Set([
  'a',
  'b',
  'strong',
  'i',
  'em',
  'u',
  's',
  'p',
  'br',
  'ul',
  'ol',
  'li',
  'blockquote',
  'code',
  'pre',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'span',
  'div',
  'img',
  'video',
  'source',
]);

const ALLOWED_ATTRIBUTES = {
  a: ['href', 'target', 'rel'],
  img: ['src', 'alt'],
  video: ['src', 'controls'],
  source: ['src', 'type'],
  '*': ['style'],
};

const isSafeUrl = (value) => {
  if (!value) return false;
  const trimmed = value.trim().toLowerCase();
  return trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:');
};

const sanitizeNode = (node) => {
  if (node.nodeType === Node.TEXT_NODE) return;

  if (node.nodeType === Node.ELEMENT_NODE) {
    const tagName = node.tagName.toLowerCase();
    if (!ALLOWED_TAGS.has(tagName)) {
      node.replaceWith(...node.childNodes);
      return;
    }

    Array.from(node.attributes).forEach((attr) => {
      const attrName = attr.name.toLowerCase();
      if (attrName.startsWith('on')) {
        node.removeAttribute(attr.name);
        return;
      }
      const allowedForTag = ALLOWED_ATTRIBUTES[tagName] || [];
      const allowedGlobal = ALLOWED_ATTRIBUTES['*'] || [];
      if (!allowedForTag.includes(attrName) && !allowedGlobal.includes(attrName)) {
        node.removeAttribute(attr.name);
        return;
      }
      if ((attrName === 'href' || attrName === 'src') && !isSafeUrl(attr.value)) {
        node.removeAttribute(attr.name);
      }
    });
  }

  Array.from(node.childNodes).forEach((child) => sanitizeNode(child));
};

export const sanitizeHtml = (html = '') => {
  if (typeof window === 'undefined' || !html) return html;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  Array.from(doc.body.childNodes).forEach((node) => sanitizeNode(node));
  return doc.body.innerHTML;
};
