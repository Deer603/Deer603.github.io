// Keep the same rows between frames; announce changes in the stable leader only.
export function createResultsView(list, announcement) {
  const groups = [];
  const empty = make('div', '等待画面', 'empty-state plain-empty');
  let candidate = '', repeats = 0, announced = '';

  function make(tag, text, className) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  }

  function text(node, value) {
    if (node.textContent !== value) node.textContent = value;
  }

  function makeGroup() {
    const section = make('section', undefined, 'face-result');
    const heading = make('div', '', 'result-heading');
    const status = make('div', '', 'empty-state plain-empty');
    const rows = make('div');
    section.append(heading, status, rows);
    list.append(section);
    return { section, heading, status, rows, people: new Map() };
  }

  function reset() {
    groups.length = 0;
    candidate = announced = '';
    repeats = 0;
    text(empty, '等待画面');
    list.replaceChildren(empty);
    text(announcement, '');
  }

  function render(results, mode) {
    while (groups.length > results.length) groups.pop().section.remove();
    if (!results.length) {
      text(empty, '未检测到人脸');
      if (empty.parentNode !== list) list.append(empty);
    } else empty.remove();
    const summaries = [];
    const keys = [];
    results.forEach(({ ranking, decision, qualityBlocked }, index) => {
      const group = groups[index] || (groups[index] = makeGroup());
      text(group.heading, `人脸${index + 1}`);
      group.heading.hidden = results.length < 2;
      const pending = decision.type === 'pending';
      const status = qualityBlocked ? '请靠近镜头' : pending ? '正在识别…' : !ranking.length ? '暂无匹配结果' : '';
      group.status.hidden = !status;
      group.rows.hidden = !!status;
      text(group.status, status);
      const prefix = results.length > 1 ? `人脸${index + 1}，` : '';
      if (status) {
        keys.push(status);
        summaries.push(prefix + status);
        return;
      }
      const present = new Set(ranking.map(person => person.id));
      for (const [id, row] of group.people) {
        if (!present.has(id)) { row.node.remove(); group.people.delete(id); }
      }
      ranking.forEach((person, position) => {
        let row = group.people.get(person.id);
        if (!row) {
          const node = make('div', undefined, 'match-row');
          const top = make('div', undefined, 'match-top');
          const name = make('span', person.name, 'match-name');
          const score = make('span', '', 'match-score');
          const track = make('div', undefined, 'score-track');
          const fill = make('span');
          top.append(name, score);
          track.append(fill);
          node.append(top, track);
          row = { node, name, score, fill };
          group.people.set(person.id, row);
        }
        row.node.classList.toggle('best', position === 0);
        text(row.name, person.name);
        const value = person.score.toFixed(1) + '%';
        text(row.score, value);
        if (row.fill.style.width !== value) row.fill.style.width = value;
        if (group.rows.children[position] !== row.node) {
          group.rows.insertBefore(row.node, group.rows.children[position] || null);
        }
      });
      keys.push(ranking[0].id);
      summaries.push(`${prefix}当前最高匹配度：${ranking[0].name}，${ranking[0].score.toFixed(1)}%`);
    });
    const signature = JSON.stringify(keys);
    if (signature === candidate) repeats++;
    else { candidate = signature; repeats = 1; }
    // Percentage movement alone does not interrupt the user's screen reader.
    if (signature !== announced && (mode === 'photo' || repeats >= 3)) {
      announced = signature;
      text(announcement, results.length ? summaries.join('；') : '未检测到人脸');
    }
  }

  reset();
  return { reset, render };
}
