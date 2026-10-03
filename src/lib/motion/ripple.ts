/**
 * m-ripple: makes the CSS clip-path wash in motion.css start where the pointer entered the card.
 * Without JS (or on keyboard focus) the wash grows from the centre. Reduced motion: the CSS turns the
 * transition off, so the wash appears without movement.
 */
export function ripple(root: ParentNode = document) {
  const cards = root.querySelectorAll<HTMLElement>('.m-ripple');
  const onEnter = (e: PointerEvent) => {
    const el = e.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--rx', `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
    el.style.setProperty('--ry', `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
  };
  cards.forEach((c) => c.addEventListener('pointerenter', onEnter));
  return () => cards.forEach((c) => c.removeEventListener('pointerenter', onEnter));
}
