// SFace preprocessing follows OpenCV FaceRecognizerSF: aligned112×112RGB, raw0–255.
// The ONNX graph contains its own input normalization.
const TARGET = [[38.2946,51.6963],[73.5318,51.5014],[56.0252,71.7366],[41.5493,92.3655],[70.7299,92.2041]];
let sessionPromise;

export function normalizeFeature(values) {
  if (!values || values.length !== 128 || !Array.from(values).every(Number.isFinite)) throw new Error('第二模型特征格式无效');
  const norm = Math.hypot(...values);
  if (norm < 1e-8) throw new Error('第二模型特征为空');
  return Array.from(values, value => value / norm);
}

export function alignmentMatrix(points) {
  if (points.length !== 5 || points.some(p => !p.every(Number.isFinite))) throw new Error('人脸关键点无效');
  const mean = points => [0,1].map(k => points.reduce((n,p) => n+p[k],0)/points.length);
  const from = mean(points), to = mean(TARGET);
  let denominator=0, real=0, imaginary=0;
  points.forEach((p,i) => {
    const x=p[0]-from[0], y=p[1]-from[1], u=TARGET[i][0]-to[0], v=TARGET[i][1]-to[1];
    denominator+=x*x+y*y; real+=x*u+y*v; imaginary+=x*v-y*u;
  });
  if (denominator < 1e-8) throw new Error('无法对齐人脸');
  const a=real/denominator, b=imaginary/denominator;
  return [a,b,-b,a,to[0]-a*from[0]+b*from[1],to[1]-b*from[0]-a*from[1]];
}

export function alignedFace(source, landmarks) {
  const p=landmarks.positions;
  const average = points => [points.reduce((n,p)=>n+p.x,0)/points.length,points.reduce((n,p)=>n+p.y,0)/points.length];
  const eyes=[average(p.slice(36,42)),average(p.slice(42,48))].sort((a,b)=>a[0]-b[0]);
  const mouth=[[p[48].x,p[48].y],[p[54].x,p[54].y]].sort((a,b)=>a[0]-b[0]);
  const matrix=alignmentMatrix([...eyes,[p[30].x,p[30].y],...mouth]);
  const canvas=document.createElement('canvas');canvas.width=canvas.height=112;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  ctx.fillStyle='#000';ctx.fillRect(0,0,112,112);ctx.setTransform(...matrix);ctx.drawImage(source,0,0);
  return canvas;
}

export function loadSFace(modelBytes) {
  if (!sessionPromise) sessionPromise=(async()=>{
    if (!globalThis.ort) throw new Error('第二模型运行库未加载');
    ort.env.wasm.wasmPaths=new URL('./vendor/ort/',import.meta.url).href;
    ort.env.wasm.numThreads=1;
    ort.env.logLevel='error';
    return ort.InferenceSession.create(modelBytes || new URL('./models/face_recognition_sface_2021dec.onnx',import.meta.url).href,
      {executionProviders:['wasm'],graphOptimizationLevel:'all'});
  })().catch(error=>{sessionPromise=null;throw error});
  return sessionPromise;
}

export async function extractSFace(source, landmarks) {
  const session=await loadSFace();
  const canvas=alignedFace(source,landmarks),pixels=canvas.getContext('2d').getImageData(0,0,112,112).data;
  const values=new Float32Array(3*112*112);
  for(let i=0;i<112*112;i++)for(let c=0;c<3;c++)values[c*112*112+i]=pixels[i*4+c];
  const input=new ort.Tensor('float32',values,[1,3,112,112]);
  let output;
  try { output=await session.run({[session.inputNames[0]]:input}); return normalizeFeature(output[session.outputNames[0]].data); }
  finally { input.dispose();if(output)Object.values(output).forEach(tensor=>tensor.dispose()); }
}
