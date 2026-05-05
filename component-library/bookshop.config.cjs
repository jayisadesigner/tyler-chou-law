/**
 * Bookshop component library config — used by CloudCannon and the
 * @bookshop/eleventy-bookshop plugin to discover components.
 *
 * Component contract: each component lives at
 *   component-library/components/<name>/<name>.bookshop.yml
 *   component-library/components/<name>/<name>.eleventy.liquid
 *
 * Components are invoked from page layouts as:
 *   {% bookshop "<name>" prop1: value1 prop2: value2 %}
 * or from a bound block:
 *   {% bookshop "<name>" bind: block %}
 */
module.exports = {
  engines: ['eleventy']
}
