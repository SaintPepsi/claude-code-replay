import { describe, it, expect } from 'vitest';
import { el, span, div, toFragment } from './dom';

describe('DOM helpers', () => {
  describe('el', () => {
    it('creates an element with the given tag', () => {
      const element = el('p');
      expect(element.tagName).toBe('P');
    });

    it('sets attributes from the attrs object', () => {
      const element = el('a', { href: 'https://example.com', target: '_blank' });
      expect(element.getAttribute('href')).toBe('https://example.com');
      expect(element.getAttribute('target')).toBe('_blank');
    });

    it('skips undefined attribute values', () => {
      const element = el('div', { id: 'test', class: undefined });
      expect(element.getAttribute('id')).toBe('test');
      expect(element.hasAttribute('class')).toBe(false);
    });

    it('appends string children as text nodes', () => {
      const element = el('p', {}, ['Hello', ' world']);
      expect(element.textContent).toBe('Hello world');
      expect(element.childNodes.length).toBe(2);
    });

    it('appends Node children directly', () => {
      const child = document.createElement('span');
      child.textContent = 'inner';
      const element = el('div', {}, [child]);
      expect(element.children[0]).toBe(child);
    });

    it('works with no attrs and no children', () => {
      const element = el('section');
      expect(element.tagName).toBe('SECTION');
      expect(element.childNodes.length).toBe(0);
    });
  });

  describe('span', () => {
    it('creates a span with the given class and text', () => {
      const s = span('highlight', 'important');
      expect(s.tagName).toBe('SPAN');
      expect(s.className).toBe('highlight');
      expect(s.textContent).toBe('important');
    });

    it('handles empty text', () => {
      const s = span('cls', '');
      expect(s.textContent).toBe('');
    });
  });

  describe('div', () => {
    it('creates a div with the given class', () => {
      const d = div('container');
      expect(d.tagName).toBe('DIV');
      expect(d.className).toBe('container');
    });

    it('sets innerHTML when provided', () => {
      const d = div('wrapper', '<span>hi</span>');
      expect(d.innerHTML).toBe('<span>hi</span>');
    });

    it('does not set innerHTML when not provided', () => {
      const d = div('empty');
      expect(d.innerHTML).toBe('');
    });
  });

  describe('toFragment', () => {
    it('creates a DocumentFragment from nodes', () => {
      const a = document.createElement('div');
      const b = document.createElement('span');
      const frag = toFragment(a, b);
      expect(frag).toBeInstanceOf(DocumentFragment);
      expect(frag.childNodes.length).toBe(2);
    });

    it('returns an empty fragment when called with no arguments', () => {
      const frag = toFragment();
      expect(frag.childNodes.length).toBe(0);
    });

    it('fragment can be appended to a parent', () => {
      const parent = document.createElement('div');
      const child = document.createElement('p');
      child.textContent = 'test';
      const frag = toFragment(child);
      parent.appendChild(frag);
      expect(parent.children.length).toBe(1);
      expect(parent.children[0].textContent).toBe('test');
    });
  });
});
