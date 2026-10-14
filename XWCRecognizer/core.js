export const MAX_SAMPLES = 16;
export const DESCRIPTOR_SIZE = 128;
export const REQUIRED_FRAMES = 3;
export const FRAME_WINDOW = 5;

export function validDescriptor(value) {
  return (Array.isArray(value) || ArrayBuffer.isView(value)) && value.length === DESCRIPTOR_SIZE
    && Array.from(value).every(x => typeof x === 'number' && Number.isFinite(x) && Math.abs(x) <= 10)
    && Array.from(value).some(x => x !== 0);
}

export function distance(a, b) {
  if (!validDescriptor(a) || !validDescriptor(b)) throw new Error('人脸特征格式无效');
  return Math.sqrt(Array.from(a).reduce((sum, value, index) => sum + (value - b[index]) ** 2, 0));
}

export function similarity(value) {
  if (!Number.isFinite(value) || value < 0) throw new Error('特征距离无效');
  return Math.max(0, Math.min(100, (1 - value / 1.2) * 100));
}

export function rankProfiles(descriptor, profiles) {
  return profiles.map(profile => {
    const distances = profile.samples.map(sample => distance(descriptor, sample.descriptor)).sort((a, b) => a - b);
    const nearest = distances.slice(0, 2);
    const d = nearest.reduce((sum, value) => sum + value, 0) / nearest.length;
    return { id: profile.id, name: profile.name, distance: d, score: similarity(d),
      supportScore: nearest.length === 2 ? similarity(nearest[1]) : null,
      sampleCount: distances.length, thumbnail: profile.samples[0]?.thumbnail };
  }).sort((a, b) => b.score - a.score);
}

export function matchDecision(ranking, threshold) {
  if (!ranking.length) return { type: 'empty', label: '请先登记人员' };
  if (ranking[0].score < threshold) return { type: 'unknown', label: '未匹配到已登记人员' };
  if (ranking[0].sampleCount < 2) return { type: 'uncertain', label: '参考样本不足，无法确认' };
  if (!Number.isFinite(ranking[0].supportScore) || ranking[0].supportScore < threshold) return { type: 'uncertain', label: '样本支持不足，无法确认' };
  return { type: 'match', label: ranking[0].name };
}

function overlap(a, b) {
  const width = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
  const height = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
  const intersection = width * height;
  return intersection / (a.width * a.height + b.width * b.height - intersection || 1);
}

// Associate boxes by position, independently of each frame's leading candidate.
// Average every candidate over the window before deciding who ranks first.
export function stabilizeMatches(current, previous = [], threshold = 65) {
  const used = new Set();
  return current.map(item => {
    if (item.qualityBlocked || !item.ranking.length) return { ...item, history: [], frameCount: 0 };
    let best = -1, bestOverlap = .4;
    previous.forEach((candidate, index) => {
      if (used.has(index) || !candidate.history?.length) return;
      const value = overlap(item.box, candidate.box);
      if (value > bestOverlap) { best = index; bestOverlap = value; }
    });
    if (best >= 0) used.add(best);
    const history = [...(best >= 0 ? previous[best].history : []), item.ranking].slice(-FRAME_WINDOW);
    const ranking = item.ranking.map(person => {
      const samples = history.map(frame => frame.find(candidate => candidate.id === person.id)).filter(Boolean);
      const average = key => samples.reduce((sum, sample) => sum + sample[key], 0) / samples.length;
      return { ...person, distance: average('distance'), score: average('score'),
        supportScore: person.sampleCount >= 2 ? average('supportScore') : null };
    }).sort((a, b) => b.score - a.score);
    const frameCount = history.length;
    return { ...item, ranking, id: ranking[0]?.id, history, frameCount,
      decision: frameCount >= REQUIRED_FRAMES ? matchDecision(ranking, threshold)
        : { type: 'pending', label: `采集中（${frameCount}/${REQUIRED_FRAMES}帧）` } };
  });
}

export function validateProfiles(data) {
  if (data?.format !== 'xwc-recognizer' || data.version !== 1 || data.engine !== '@vladmandic/face-api@1.7.15') {
    throw new Error('请选择XWCRecognizer导出的人员库文件');
  }
  if (!Array.isArray(data.people) || data.people.length > 100) throw new Error('人员库最多支持100人');
  const ids = new Set();
  return data.people.map(person => {
    if (typeof person.id !== 'string' || !/^[a-zA-Z0-9-]{1,80}$/.test(person.id) || ids.has(person.id)) throw new Error('人员编号无效或重复');
    ids.add(person.id);
    if (typeof person.name !== 'string' || !person.name.trim() || person.name.trim().length > 40) throw new Error('人员姓名无效');
    if (!Array.isArray(person.samples) || !person.samples.length || person.samples.length > MAX_SAMPLES) throw new Error(`每人需要1～${MAX_SAMPLES}个人脸样本`);
    return {
      id: person.id, name: person.name.trim(),
      samples: person.samples.map(sample => {
        if (!validDescriptor(sample?.descriptor)) throw new Error('人员库包含无效人脸特征');
        const thumbnail = typeof sample.thumbnail === 'string' && sample.thumbnail.length <= 150000
          && /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(sample.thumbnail) ? sample.thumbnail : '';
        return { descriptor: Array.from(sample.descriptor), thumbnail };
      }),
    };
  });
}
