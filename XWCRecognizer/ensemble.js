import {rankProfiles,matchDecision} from './core.js';
import {normalizeFeature} from './sface.js';
export const SFACE_THRESHOLD = 36.3;

export function validateSFaceLibrary(data, people) {
  if(data?.engine!=='opencv-sface-2021dec' || data.version!==1 || !Array.isArray(data.people))throw new Error('第二模型参考库无效');
  if(data.people.length!==people.length)throw new Error('两个模型的人物列表不一致');
  const ids=new Set();
  return data.people.map(person=>{
    if(ids.has(person.id))throw new Error('第二模型人物编号重复');ids.add(person.id);
    const original=people.find(p=>p.id===person.id&&p.name===person.name);
    if(!original||!Array.isArray(person.samples)||!person.samples.length||person.samples.length>16||person.samples.length!==original.samples.length)throw new Error('第二模型人物样本无效');
    return {...person,samples:person.samples.map(sample=>({...sample,descriptor:normalizeFeature(sample.descriptor)}))};
  });
}

export function rankDualProfiles(faceDescriptor,sfaceDescriptor,people,sfacePeople) {
  const query=normalizeFeature(sfaceDescriptor);
  const second=new Map(sfacePeople.map(person=>{
    const values=person.samples.map(s=>Math.max(-1,Math.min(1,s.descriptor.reduce((sum,v,i)=>sum+v*query[i],0)))).sort((a,b)=>b-a).slice(0,2);
    const score=100*Math.max(0,values.reduce((n,v)=>n+v,0)/values.length);
    return [person.id,{score,supportScore:values.length===2?100*Math.max(0,values[1]):null,count:person.samples.length}];
  }));
  return rankProfiles(faceDescriptor,people).map(person=>{
    const s=second.get(person.id);if(!s)throw new Error('第二模型缺少人物');
    const score=(person.score+s.score)/2;
    return {...person,faceScore:person.score,sfaceScore:s.score,
      faceSupport:person.supportScore,sfaceSupport:s.supportScore,
      score,distance:1-score/100,supportScore:person.supportScore===null||s.supportScore===null?null:(person.supportScore+s.supportScore)/2,
      sampleCount:Math.min(person.sampleCount,s.count)};
  }).sort((a,b)=>b.score-a.score);
}

// Agreement is metadata for validation; the user-facing list always ranks combined scores.
export function dualDecision(ranking,threshold=65) {
  if(!ranking.length)return {type:'empty',label:'暂无结果'};
  const a=[...ranking].sort((x,y)=>y.faceScore-x.faceScore);
  const b=[...ranking].sort((x,y)=>y.sfaceScore-x.sfaceScore);
  const decisionA=matchDecision(a.map(p=>({...p,score:p.faceScore,supportScore:p.faceSupport})),threshold);
  const decisionB=matchDecision(b.map(p=>({...p,score:p.sfaceScore,supportScore:p.sfaceSupport})),SFACE_THRESHOLD);
  return {type:a[0].id===b[0].id&&decisionA.type==='match'&&decisionB.type==='match'?'match':'unverified',
    label:ranking[0].name,agreement:a[0].id===b[0].id,faceCandidate:a[0].id,sfaceCandidate:b[0].id};
}
