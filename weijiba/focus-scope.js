(() => {
  "use strict";

  // 隔离弹层之外的交互，关闭后恢复每个元素原有的inert状态。
  window.WEIJIBA_FOCUS_SCOPE = (container, allowed = []) => {
    if (!container) return () => {};
    const restored = [];
    let branch = container;
    while (branch.parentElement && branch !== document.body) {
      for (const sibling of branch.parentElement.children) {
        if (sibling === branch || allowed.some(node => node && (sibling === node || sibling.contains(node)))) continue;
        restored.push([sibling, sibling.inert]);
        sibling.inert = true;
      }
      branch = branch.parentElement;
    }
    const focusable = () => [...container.querySelectorAll('a[href], button, input, select, textarea, [tabindex]')]
      .filter(node => !node.disabled && node.tabIndex >= 0 && !node.closest('[inert], [hidden]') && node.getClientRects().length);
    const onKeyDown = event => {
      if (event.key !== 'Tab') return;
      const nodes = focusable();
      if (!nodes.length) { event.preventDefault(); return; }
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (event.shiftKey && (document.activeElement === first || !container.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !container.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      restored.forEach(([node, inert]) => { node.inert = inert; });
    };
  };
})();
