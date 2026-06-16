export const htmlLeafNodes = new Set([
  "area", "base", "br", "col", "command", "embed", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track", "wbr"
]);
export const htmlContainerNodes = new Map([
  ["head", new Set(["body"])], ["li", new Set(["li"])], ["dt", new Set(["dt", "dd"])],
  ["dd", new Set(["dt", "dd"])], ["p", new Set([
    "address", "article", "aside", "blockquote", "div", "dl", "fieldset", "footer",
    "form", "h1", "h2", "h3", "h4", "h5", "h6", "header", "hgroup", "hr", "main", "nav",
    "ol", "p", "pre", "section", "table", "ul"
  ])], ["rb", new Set(["rb", "rt", "rtc", "rp"])], ["rt", new Set(["rb", "rt", "rtc", "rp"])],
  ["rtc", new Set(["rb", "rtc", "rp"])], ["rp", new Set(["rb", "rt", "rtc", "rp"])],
  ["optgroup", new Set(["optgroup"])], ["option", new Set(["option", "optgroup"])],
  ["colgroup", new Set(["colgroup"])], ["thead", new Set(["tbody", "tfoot"])],
  ["tbody", new Set(["tbody", "tfoot"])], ["tfoot", new Set(["tbody"])], ["tr", new Set(["tr"])],
  ["td", new Set(["td", "th"])], ["th", new Set(["td", "th"])]
]);
