/**
 * Escaping helpers for the build scripts.
 *
 * Every build script renders content it does not control — YAML front matter,
 * markdown metadata, the YouTube API — straight into HTML, JSON-LD and XML.
 * Each of those is a different context with a different set of dangerous
 * characters, so use the helper that matches the context you are writing into.
 */

/**
 * Escape a value for HTML text *and* attribute contexts.
 *
 * Quotes are escaped as well as angle brackets: a value dropped into
 * `alt="${...}"` can otherwise close the attribute and add its own.
 */
export function escapeHtml(str) {
  if (str == null) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Escape a value for use inside a JSON string literal.
 *
 * Our JSON-LD lives in an inline `<script>` block, so `<` and `>` are escaped
 * to their \u form too — otherwise a literal `</script>` in the content ends
 * the block early and everything after it is parsed as HTML.
 */
export function escapeJson(str) {
  if (str == null) return ''
  return JSON.stringify(String(str))
    .slice(1, -1) // drop the quotes JSON.stringify adds
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}

/** Escape a value for an XML text node or attribute. */
export function escapeXml(str) {
  if (str == null) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Make a value safe to nest inside a CDATA section by splitting any literal
 * `]]>` across two sections, which is the only way CDATA can be escaped.
 */
export function escapeCdata(str) {
  if (str == null) return ''
  return String(str).replace(/]]>/g, ']]]]><![CDATA[>')
}

/**
 * Allow-list a URL before it is written into an `href` or `src`.
 *
 * Blocks `javascript:`, `data:` and friends, which would otherwise turn a
 * content field into script execution. Site-relative paths are passed through.
 * Returns '' for anything that is not recognised, so a bad value renders as an
 * empty attribute rather than a live payload.
 */
const SAFE_URL_SCHEMES = new Set(['http:', 'https:', 'mailto:', 'tel:'])

export function safeUrl(url) {
  if (url == null) return ''
  const value = String(url).trim()
  if (value === '') return ''

  // Site-relative and fragment links carry no scheme and are always fine.
  if (/^[/#?]/.test(value) && !value.startsWith('//')) return escapeHtml(value)

  // A relative path with no scheme and no protocol-relative prefix.
  if (!/^[a-z][a-z0-9+.-]*:/i.test(value) && !value.startsWith('//')) {
    return escapeHtml(value)
  }

  try {
    const parsed = new URL(value, 'https://tylerchoulaw.com')
    if (!SAFE_URL_SCHEMES.has(parsed.protocol)) return ''
    return escapeHtml(value)
  } catch {
    return ''
  }
}
