// Enhance the exported React lightboxes without replacing React-managed content.
(() => {
  'use strict';
  if (window.__xwcLightboxAccessibility) return;
  window.__xwcLightboxAccessibility = true;
  let active = null;
  let returnTo = null;
  let opener = null;
  let previousOverflow = '';

  const focusable = dialog => Array.from(dialog.querySelectorAll(
    'a[href],button,input,select,textarea,[tabindex]'
  )).filter(node => !node.disabled && node.tabIndex >= 0 && node.getClientRects().length);

  function focusFirst() {
    if (!active) return;
    (focusable(active)[0] || active).focus({ preventScroll: true });
  }

  function restore() {
    const target = returnTo;
    active = null;
    returnTo = null;
    document.documentElement.style.overflow = previousOverflow;
    if (target?.isConnected && typeof target.focus === 'function') target.focus({ preventScroll: true });
  }

  function sync() {
    if (active && !active.isConnected) restore();
    if (active) return;
    const dialog = document.querySelector('.lightbox[role="dialog"]');
    if (!dialog) return;
    returnTo = opener?.isConnected ? opener : document.activeElement;
    opener = null;
    active = dialog;
    previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    if (!dialog.hasAttribute('tabindex')) dialog.setAttribute('tabindex', '-1');
    focusFirst();
  }

  document.addEventListener('click', event => {
    if (!active) opener = event.target.closest?.('button.media-placeholder') || null;
  }, true);

  document.addEventListener('keydown', event => {
    if (!active?.isConnected) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      active.querySelector('.lightbox-close')?.click();
      return;
    }
    if (event.key !== 'Tab') return;
    const items = focusable(active);
    const first = items[0];
    const last = items[items.length - 1];
    if (!first) { event.preventDefault(); active.focus(); return; }
    if (!active.contains(document.activeElement) || (event.shiftKey && document.activeElement === first)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }, true);

  document.addEventListener('focusin', event => {
    if (active?.isConnected && !active.contains(event.target)) focusFirst();
  });

  new MutationObserver(sync).observe(document.body, { childList: true, subtree: true });
  sync();
})();
