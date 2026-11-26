import test from 'node:test';
import assert from 'node:assert/strict';
import {tutorSession} from './tutor-session.js';
import {partialString} from './json-field.js';
import type {GeminiStreamOptions} from './tts/gemini-stream.js';
const input={level:5,scenario:3,text:'Men so‘zlarni tez unutaman',history:[]};
const value={ko:'같이 연습해요. 단어를 빨리 잊기 때문에 복습이 중요해요. 어떤 단어가 어려워요?',uz:'Birga mashq qilamiz. So‘zlarni tez unutganingiz uchun takrorlash muhim. Qaysi so‘z qiyin?',fixes:[],topicStatus:'on_topic' as const,topicEvidence:'단어 복습',nextQuestion:'어떤 단어가 어려워요?'};
const raw=JSON.stringify(value);
test('JSON prefixes keep split quotes, Unicode and escape sequences safe',()=>{
 const expected='안녕 "한국"!\n😀',s=JSON.stringify({ko:expected,uz:'Salom'});
 for(let i=0;i<=s.length;i++){const parsed=partialString(s.slice(0,i),'ko');assert.ok(expected.startsWith(parsed.value));}
 assert.equal(partialString(s,'ko').value,expected);
 assert.equal(partialString('{"ko":"\\uD55','ko').value,'');
 assert.equal(partialString('{"ko":"\\ud558\\ub298"}','ko').value,'하늘');
});
test('TTS failure keeps one Gemini call and streams Uzbek before completion',async()=>{
 let calls=0;const events:{type:string;data:Record<string,unknown>}[]=[];
 const result=await tutorSession(input,{signal:AbortSignal.timeout(1000),natural:true,
  generate:async function*(_prompt:string,_options:GeminiStreamOptions={}){calls++;yield raw.slice(0,raw.indexOf('fixes')-1);await new Promise(r=>setTimeout(r,5));yield raw.slice(raw.indexOf('fixes')-1);},
  tts:{streamText:async()=>{throw new Error('Unavailable');}},emit:async e=>{events.push(e);}});
 assert.equal(calls,1);assert.equal(result.value.uz,value.uz);assert.equal(result.voiceMode,'device');assert.equal(events[0].type,'meta');
 assert.ok(events.some(e=>e.type==='mode'));assert.ok(events.some(e=>e.type==='reply_partial'&&e.data.uz===value.uz));
 assert.equal(events.filter(e=>e.type==='text').map(e=>e.data.text).join(''),value.ko);
});
test('audio runs concurrently with JSON; first-audio callback is one-shot',async()=>{
 let firstAudio=0;const events:string[]=[];
 const result=await tutorSession(input,{
  signal:AbortSignal.timeout(1000),natural:true,onFirstAudio:()=>{firstAudio++;},
  generate:async function*(){yield raw.slice(0,raw.indexOf(',"uz"'));await new Promise(r=>setTimeout(r,20));yield raw.slice(raw.indexOf(',"uz"'));},
  tts:{streamText:async(create,request)=>({
   contentType:'application/octet-stream',
   chunks:{async *[Symbol.asyncIterator](){for await(const text of create(request.signal!)){if(text){yield new Uint8Array([1,2]);yield new Uint8Array([3,4]);}}}}
  })},
  emit:async event=>{events.push(event.type);}
 });
 assert.equal(result.voiceMode,'natural');assert.equal(firstAudio,1);
 assert.ok(events.indexOf('audio')>=0);assert.ok(events.includes('audio_end'));assert.equal(result.value.uz,value.uz);
});
test('topic validator performs exactly one rewrite fallback',async()=>{
 let calls=0;const prompts:string[]=[];const invalid={...value,topicEvidence:''};
 const result=await tutorSession(input,{signal:AbortSignal.timeout(1000),natural:false,generate:async function* (prompt){calls++;prompts.push(prompt);yield JSON.stringify(calls===1?invalid:value);},emit:async()=>{}});
 assert.equal(calls,2);assert.match(prompts[1],/REWRITE ONLY/);assert.equal(result.value.topicEvidence,value.topicEvidence);
});
test('cancel stops a pending model without retry or hanging TTS',async()=>{
 let calls=0;const controller=new AbortController();
 const work=tutorSession(input,{signal:controller.signal,natural:false,generate:async function*(_p,options={}){
  calls++;yield '{"ko":"안녕';await new Promise<void>((_resolve,reject)=>options.signal!.addEventListener('abort',()=>reject(new DOMException('Cancelled','AbortError')),{once:true}));
 },emit:async()=>{}});
 setTimeout(()=>controller.abort(),10);await assert.rejects(work,{name:'AbortError'});assert.equal(calls,1);
});
