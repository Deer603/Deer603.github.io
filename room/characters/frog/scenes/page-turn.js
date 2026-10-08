import content, { clamp } from '../content.js';

// WebGL 曲面纸叶、光照和连续翻页控制。
export function createPageTurn({ canvas, book, shadow, tabs, setPages, onRender, audio, reduced }) {
  const { spreads } = content;
  const N = spreads.length - 1;
  const leaves = [...Array(N).keys()];
  const mix = (a, b, t) => a + (b - a) * t;
  const easePaper = (t) => 1 - Math.pow(1 - t, 3);
  const easeOut = (t) => 1 - Math.pow(1 - t, 4);
  const bookStyle = getComputedStyle(book);
  const BOOK = { x: parseFloat(bookStyle.left), y: parseFloat(bookStyle.top) };
  const S = 0.72;
  const PW = 590 * S;
  const PH = 760 * S;
  const SPINE = BOOK.x + 425;
  const P = parseFloat(bookStyle.perspective);
  const OX = BOOK.x + parseFloat(bookStyle.width) / 2;
  const OY = BOOK.y + parseFloat(bookStyle.height) / 2;
  const gl = canvas.getContext('webgl2', { antialias: true, premultipliedAlpha: true, alpha: true });
  let fallback = !gl;
  let disposed = false;
  let canvasScale = 1;
  let canvasActive = false;
  let renderer = null;
  if (gl) {
    const vs = `#version 300 es
  in vec3 pos; in vec3 nrm; in vec2 uv;
  uniform vec2 board; uniform float P; uniform vec2 O;
  out vec3 vN; out vec2 vUV; out float vZ;
  void main(){
    float k=P/(P-pos.z);
    vec2 s=O+(pos.xy-O)*k;
    gl_Position=vec4(s.x/board.x*2.0-1.0, 1.0-s.y/board.y*2.0, 0.5-pos.z/4000.0, 1.0);
    vN=nrm; vUV=uv; vZ=pos.z;
  }`;
    const fs = `#version 300 es
  precision highp float;
  in vec3 vN; in vec2 vUV; in float vZ;
  uniform sampler2D front; uniform sampler2D back;
  out vec4 o;
  void main(){
    vec3 n=normalize(vN);
    bool isFront=n.z>=0.0;
    vec3 N=isFront?n:-n;
    vec3 col=isFront?texture(front,vUV).rgb:texture(back,vec2(1.0-vUV.x,vUV.y)).rgb;
    vec3 L=normalize(vec3(-0.45,-0.55,0.70));
    float diff=max(dot(N,L),0.0);
    float spec=pow(max(dot(reflect(-L,N),vec3(0,0,1)),0.0),28.0);
    float shade=0.70+0.38*diff;
    col=col*shade+vec3(1.0,0.98,0.92)*spec*0.10;
    o=vec4(col,1.0);
  }`;
    function sh(type, src) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
      return shader;
    }
    const prog = gl.createProgram();
    const vertex = sh(gl.VERTEX_SHADER, vs);
    const fragment = sh(gl.FRAGMENT_SHADER, fs);
    gl.attachShader(prog, vertex);
    gl.attachShader(prog, fragment);
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const loc = (name) => gl.getAttribLocation(prog, name);
    const uni = (name) => gl.getUniformLocation(prog, name);
    gl.uniform1f(uni('P'), P);
    gl.uniform2f(uni('O'), OX, OY);
    gl.uniform2f(uni('board'), 1440, 900);
    gl.uniform1i(uni('front'), 0);
    gl.uniform1i(uni('back'), 1);
    gl.enable(gl.DEPTH_TEST);

    const COLS = 56;
    const ROWS = 18;
    const NV = (COLS + 1) * (ROWS + 1);
    const posBuf = gl.createBuffer();
    const nrmBuf = gl.createBuffer();
    const uvBuf = gl.createBuffer();
    const idxBuf = gl.createBuffer();
    const uvs = new Float32Array(NV * 2);
    const idx = new Uint16Array(COLS * ROWS * 6);
    for (let r = 0, i = 0; r <= ROWS; r++) {
      for (let c = 0; c <= COLS; c++, i++) {
        uvs[i * 2] = c / COLS;
        uvs[i * 2 + 1] = r / ROWS;
      }
    }
    for (let r = 0, i = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const a = r * (COLS + 1) + c;
        const b = a + 1;
        const d = a + COLS + 1;
        const e = d + 1;
        idx.set([a, d, b, b, d, e], i);
        i += 6;
      }
    }
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
    gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(loc('uv'));
    gl.vertexAttribPointer(loc('uv'), 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.enableVertexAttribArray(loc('pos'));
    gl.vertexAttribPointer(loc('pos'), 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, nrmBuf);
    gl.enableVertexAttribArray(loc('nrm'));
    gl.vertexAttribPointer(loc('nrm'), 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
    const P3 = new Float32Array(NV * 3);
    const NR = new Float32Array(NV * 3);
    const tex = new Map();
    let loading = null;
    let uploadQueue = Promise.resolve();
    async function loadTex(id) {
      const img = new Image();
      img.src = new URL(`../assets/pages/${id}.webp`, import.meta.url).href;
      const previousUpload = uploadQueue;
      uploadQueue = (async () => {
        await previousUpload;
        if (disposed || fallback) return;
        await img.decode();
        if (disposed || fallback) return;
        let bitmap = null;
        try {
          if (typeof createImageBitmap === 'function') bitmap = await createImageBitmap(img);
          if (disposed || fallback) return;
          await new Promise((resolve) => requestAnimationFrame(resolve));
          if (disposed || fallback) return;
          const texture = gl.createTexture();
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, bitmap || img);
          gl.generateMipmap(gl.TEXTURE_2D);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          tex.set(id, texture);
        } finally {
          bitmap?.close();
        }
      })();
      return uploadQueue;
    }
    function loadTextures() {
      if (!loading) {
        loading = Promise.all(spreads.flatMap((s) => [s.left.id, s.right.id]).map(loadTex));
        loading
          .then(() => {
            if (!disposed) render();
          })
          .catch((error) => console.error(error));
      }
      return loading;
    }

    const BEND = 1.25;
    const TWIST = 0.38;
    function paperShape(t, dir) {
      const lift = Math.sin(Math.PI * t);
      for (let r = 0; r <= ROWS; r++) {
        const yn = r / ROWS;
        const y = BOOK.y + yn * PH;
        let x = SPINE;
        let z = 0;
        let prevA = 0;
        for (let c = 0; c <= COLS; c++) {
          const s = c / COLS;
          const a = clamp(
            Math.PI * t - dir * BEND * lift * Math.pow(s, 1.4) + dir * TWIST * lift * s * (yn - 0.5),
            0, Math.PI
          );
          if (c > 0) {
            const ds = PW / COLS;
            const am = (a + prevA) / 2;
            x += Math.cos(am) * ds;
            z += Math.sin(am) * ds;
          }
          prevA = a;
          const i = (r * (COLS + 1) + c) * 3;
          P3[i] = x;
          P3[i + 1] = y;
          P3[i + 2] = z + 0.6 * lift;
        }
      }
      for (let r = 0; r <= ROWS; r++) {
        for (let c = 0; c <= COLS; c++) {
          const i = r * (COLS + 1) + c;
          const a = Math.min(c + 1, COLS) - Math.max(c - 1, 0);
          const b = Math.min(r + 1, ROWS) - Math.max(r - 1, 0);
          const i1 = (r * (COLS + 1) + Math.min(c + 1, COLS)) * 3;
          const i0 = (r * (COLS + 1) + Math.max(c - 1, 0)) * 3;
          const j1 = (Math.min(r + 1, ROWS) * (COLS + 1) + c) * 3;
          const j0 = (Math.max(r - 1, 0) * (COLS + 1) + c) * 3;
          const ux = (P3[i1] - P3[i0]) / a;
          const uy = (P3[i1 + 1] - P3[i0 + 1]) / a;
          const uz = (P3[i1 + 2] - P3[i0 + 2]) / a;
          const vx = (P3[j1] - P3[j0]) / b;
          const vy = (P3[j1 + 1] - P3[j0 + 1]) / b;
          const vz = (P3[j1 + 2] - P3[j0 + 2]) / b;
          const nx = uy * vz - uz * vy;
          const ny = uz * vx - ux * vz;
          const nz = ux * vy - uy * vx;
          const length = Math.hypot(nx, ny, nz) || 1;
          NR[i * 3] = nx / length;
          NR[i * 3 + 1] = ny / length;
          NR[i * 3 + 2] = nz / length;
        }
      }
    }
    function drawLeaf(j, t, dir) {
      if (!tex.has(spreads[j].right.id) || !tex.has(spreads[j + 1].left.id)) return;
      paperShape(t, dir);
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
      gl.bufferData(gl.ARRAY_BUFFER, P3, gl.DYNAMIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, nrmBuf);
      gl.bufferData(gl.ARRAY_BUFFER, NR, gl.DYNAMIC_DRAW);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex.get(spreads[j].right.id));
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, tex.get(spreads[j + 1].left.id));
      gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
      const mid = (Math.round(ROWS / 2) * (COLS + 1) + COLS) * 3;
      return P3[mid] - SPINE;
    }
    renderer = {
      load: loadTextures,
      drawLeaf,
      clear() {
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      },
      resize() {
        gl.viewport(0, 0, canvas.width, canvas.height);
      },
      destroy() {
        tex.forEach((texture) => gl.deleteTexture(texture));
        [posBuf, nrmBuf, uvBuf, idxBuf].forEach((buffer) => gl.deleteBuffer(buffer));
        gl.deleteVertexArray(vao);
        gl.deleteProgram(prog);
        gl.deleteShader(vertex);
        gl.deleteShader(fragment);
        tex.clear();
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      },
      textureCount: () => tex.size,
    };
  }

  function load() {
    return renderer?.load() ?? Promise.resolve();
  }

  let shown = 0;
  let target = 0;
  let raf = 0;
  let last = 0;
  let snapTimer = 0;
  let tween = null;
  let riffleRun = null;
  let vel = 0;
  let lastIn = 0;
  const prevT = new Array(N).fill(0);
  const curlDir = new Array(N).fill(1);
  const soundF = new Array(N).fill(false);
  const soundB = new Array(N).fill(false);
  const tOf = (j) => riffleRun ? riffleRun.t[j] : clamp(shown - j);
  function render() {
    const ts = fallback ? leaves.map((j) => clamp(Math.round(shown) - j)) : leaves.map(tOf);
    let A = 0;
    while (A < N && ts[A] >= 1) A++;
    let B = A;
    for (let j = A; j < N; j++) if (ts[j] > 0) B = j + 1;
    setPages(spreads[A].left, spreads[Math.min(B, N)].right);
    renderer?.clear();
    const edges = {};
    let cast = null;
    ts.forEach((t, j) => {
      if (t !== prevT[j]) curlDir[j] = t > prevT[j] ? 1 : -1;
      const moving = t - prevT[j];
      prevT[j] = t;
      if (!fallback && t > 0 && t < 1 && renderer.textureCount()) {
        const edge = renderer.drawLeaf(j, t, curlDir[j]);
        if (edge !== undefined) edges[j] = edge;
        if (!cast && edge !== undefined) cast = { t, e: edge };
      }
      const volume = riffleRun ? 0.18 : 0.35 + 0.4 * Math.min(1, Math.abs(target - shown));
      if (moving > 0 && t > 0.12 && !soundF[j]) {
        soundF[j] = true;
        audio?.play('page-turn', { index: j, volume, cooldown: 0 });
      }
      if (moving < 0 && t < 0.88 && !soundB[j]) {
        soundB[j] = true;
        audio?.play('page-turn', { index: j, volume, cooldown: 0 });
      }
      if (t < 0.05) soundF[j] = false;
      if (t > 0.95) soundB[j] = false;
    });
    canvas.hidden = !cast;
    if (cast) {
      const lift = Math.sin(Math.PI * cast.t);
      const e = cast.e;
      const onRight = e > 0;
      const width = Math.max(30, Math.abs(e) * 0.9 + 60);
      shadow.style.opacity = (0.55 * lift).toFixed(3);
      shadow.style.width = `${width}px`;
      shadow.style.left = `${onRight ? 425 : 425 - width}px`;
      const angle = onRight ? 90 : 270;
      shadow.style.background =
        `linear-gradient(${angle}deg,rgba(30,24,12,.35),rgba(30,24,12,.12) 55%,transparent)`;
    } else shadow.style.opacity = '0';
    tabs.forEach(({ el, spread }) => {
      const j = spread - 1;
      const t = spread === 0 ? 1 : ts[j];
      el.dataset.side = t >= 0.5 ? 'left' : 'right';
      const width = el.offsetWidth * S;
      let x;
      if (t <= 0) x = 850 - 12.96;
      else if (t >= 1) x = -width + 12.96;
      else {
        const e = edges[j] ?? 0;
        x = t < 0.5 ? 425 + e - 12.96 : 425 + e - width + 12.96;
      }
      el.style.opacity = t > 0 && t < 1 && Math.abs(Math.cos(Math.PI * t)) < 0.25 ? '0' : '1';
      el.style.left = `${x}px`;
      el.style.zIndex = t > 0 && t < 1 ? '20' : '10';
    });
    const position = riffleRun ? ts.reduce((sum, t) => sum + t, 0) : shown;
    const current = Math.round(riffleRun ? riffleRun.to : shown);
    onRender({ position, current, turning: ts.some((t) => t > 0 && t < 1), ts, target });
  }
  function tick(now) {
    raf = 0;
    const dt = last ? Math.min(48, now - last) : 16.7;
    last = now;
    shown = mix(shown, target, 1 - Math.exp(-dt / 90));
    if (Math.abs(shown - target) < 0.0006) shown = target;
    render();
    if (shown !== target) raf = requestAnimationFrame(tick);
  }
  function go() {
    if (!raf) {
      last = 0;
      raf = requestAnimationFrame(tick);
    }
  }
  function stop() {
    clearTimeout(snapTimer);
    tween?.kill();
    tween = null;
    cancelAnimationFrame(raf);
    raf = 0;
    if (riffleRun) shown = target = clamp(riffleRun.t.reduce((sum, t) => sum + t, 0), 0, N);
    riffleRun = null;
  }
  function tweenTo(goal, ms, ease, complete) {
    const driver = { value: target };
    tween?.kill();
    tween = window.gsap.to(driver, {
      value: goal,
      duration: reduced.matches ? 0.001 : ms / 1000,
      ease,
      onUpdate() {
        target = driver.value;
        go();
      },
      onComplete() {
        tween = null;
        complete?.();
      },
    });
  }
  function snap() {
    const dir = Math.abs(vel) > 0.8 ? Math.sign(vel) : 0;
    const goal = dir > 0 ? Math.ceil(target - 0.02) : dir < 0 ? Math.floor(target + 0.02) : Math.round(target);
    tweenTo(clamp(goal, 0, N), 380, easePaper);
  }
  function input(d) {
    if (riffleRun) stop();
    const now = performance.now();
    vel = d / Math.max(16, now - lastIn) * 1000;
    lastIn = now;
    tween?.kill();
    tween = null;
    target = clamp(target + d, 0, N);
    if (fallback) {
      shown = Math.round(target);
      render();
      return;
    }
    go();
    clearTimeout(snapTimer);
    snapTimer = setTimeout(snap, 180);
  }
  function step(d) {
    if (riffleRun) stop();
    clearTimeout(snapTimer);
    if (fallback) {
      stop();
      shown = target = clamp(Math.round(target) + d, 0, N);
      render();
      return;
    }
    tweenTo(clamp(Math.round(target) + d, 0, N), 620, easePaper);
  }
  function riffle(to, complete) {
    stop();
    const from = Math.round(shown);
    if (to === from) {
      complete?.();
      return;
    }
    if (fallback) {
      shown = target = clamp(to, 0, N);
      render();
      complete?.();
      return;
    }
    const dir = Math.sign(to - from);
    const list = [];
    for (let j = from; j !== to; j += dir) list.push(dir > 0 ? j : j - 1);
    const n = list.length;
    let gap = 70;
    if ((n - 1) * gap + 420 > 1400) gap = Math.max(20, (1400 - 420) / Math.max(1, n - 1));
    riffleRun = { t: leaves.map((j) => clamp(shown - j)), to };
    // 用 GSAP timeline 编排纸叶时长、错开与缓动。
    tween = window.gsap.timeline({
      onUpdate: render,
      onComplete() {
        shown = target = to;
        riffleRun = null;
        tween = null;
        render();
        complete?.();
      },
    });
    list.forEach((j, i) => {
      tween.to(riffleRun.t, {
        [j]: dir > 0 ? 1 : 0,
        duration: reduced.matches ? 0.001 : (i === n - 1 ? 420 : 260) / 1000,
        ease: i === n - 1 ? easeOut : easePaper,
      }, reduced.matches ? 0 : i * gap / 1000);
    });
  }
  function setPosition(position) {
    stop();
    shown = target = clamp(position, 0, N);
    leaves.forEach((j) => {
      prevT[j] = clamp(shown - j);
      curlDir[j] = 1;
      soundF[j] = false;
      soundB[j] = false;
    });
    render();
  }
  function resize(scale) {
    canvasScale = scale;
    const d = devicePixelRatio || 1;
    const width = canvasActive ? Math.round(1440 * scale * d) : 0;
    const height = canvasActive ? Math.round(900 * scale * d) : 0;
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
    renderer?.resize();
    render();
  }
  function setActive(active) {
    if (canvasActive === active) return;
    canvasActive = active;
    resize(canvasScale);
  }
  function destroy() {
    disposed = true;
    stop();
    canvas.removeEventListener('webglcontextlost', loseContext);
    renderer?.destroy();
    renderer = null;
    canvas.width = 0;
    canvas.height = 0;
  }
  function loseContext(event) {
    if (disposed) return;
    event.preventDefault();
    const position = riffleRun ? riffleRun.t.reduce((sum, t) => sum + t, 0) : shown;
    fallback = true;
    renderer = null;
    setPosition(Math.round(position));
  }
  canvas.addEventListener('webglcontextlost', loseContext);
  return {
    setActive,
    load,
    input,
    step,
    riffle,
    stop,
    setPosition,
    resize,
    render,
    destroy,
    getState: () => ({
      position: shown,
      target,
      textureCount: renderer?.textureCount() ?? 0,
      jumping: Boolean(riffleRun),
      renderer: fallback ? 'direct-page' : 'webgl-paper',
    }),
  };
}
