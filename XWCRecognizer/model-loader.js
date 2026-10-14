import {loadSFace} from './sface.js';
const assets = [
  ['ssd_mobilenetv1_model-weights_manifest.json',28233],['ssd_mobilenetv1_model.bin',5616957],
  ['face_landmark_68_model-weights_manifest.json',8485],['face_landmark_68_model.bin',356840],
  ['face_recognition_model-weights_manifest.json',19615],['face_recognition_model.bin',6444032],
  ['face_recognition_sface_2021dec.onnx',38696353],
];

export async function loadModels(api,report) {
  const controller=new AbortController();
  const total=assets.reduce((n,a)=>n+a[1],0);let loaded=0;
  report(0,'正在下载模型');
  try {
    const contents=await Promise.all(assets.map(async([file])=>{
      const response=await fetch(new URL('./models/'+file,import.meta.url),{signal:controller.signal});
      if(!response.ok)throw new Error('模型文件无法加载：'+file);
      const reader=response.body.getReader(),chunks=[];let length=0;
      for(;;){const {done,value}=await reader.read();if(done)break;chunks.push(value);length+=value.length;loaded+=value.length;report(Math.min(85,Math.floor(loaded/total*85)),'正在下载模型');}
      const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
      return [file,bytes];
    }));
    const buffers=new Map(contents);
    report(86,'正在准备模型');
    for(const [name,net] of [['ssd_mobilenetv1',api.nets.ssdMobilenetv1],['face_landmark_68',api.nets.faceLandmark68Net],['face_recognition',api.nets.faceRecognitionNet]]) {
      const manifest=JSON.parse(new TextDecoder().decode(buffers.get(name+'_model-weights_manifest.json')));
      const weights=api.tf.io.decodeWeights(buffers.get(name+'_model.bin').buffer,manifest.flatMap(g=>g.weights));
      if(net.isLoaded)net.dispose();
      net.loadFromWeightMap(weights);
    }
    report(90,'正在准备模型');
    await loadSFace(buffers.get('face_recognition_sface_2021dec.onnx'));
    report(96,'正在读取人物资料');
  } catch(error) {controller.abort();throw error;}
}
