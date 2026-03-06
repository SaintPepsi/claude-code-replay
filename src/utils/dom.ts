/**
 * DOM element creation helpers — DRY extraction of repeated createElement patterns.
 */

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs?: Partial<Record<string, string>>,
  children?: (Node | string)[]
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      if (value !== undefined) element.setAttribute(key, value);
    }
  }
  if (children) {
    for (const child of children) {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    }
  }
  return element;
}

export function span(className: string, text: string): HTMLSpanElement {
  const s = document.createElement('span');
  s.className = className;
  s.textContent = text;
  return s;
}

export function div(className: string, innerHTML?: string): HTMLDivElement {
  const d = document.createElement('div');
  d.className = className;
  if (innerHTML !== undefined) d.innerHTML = innerHTML;
  return d;
}

export function toFragment(...nodes: Node[]): DocumentFragment {
  const frag = document.createDocumentFragment();
  for (const node of nodes) frag.appendChild(node);
  return frag;
}
