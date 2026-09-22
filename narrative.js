/* Living Murim: public narrative data and intent, never authoritative mechanics. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.LMNarrative=api;})(typeof window!=='undefined'?window:globalThis,function(){
 'use strict';
 const MAX_INPUT=1200,MAX_REPLY=12000,LENGTHS=['brief','balanced','detailed'],MODES=['offline','local','online'];
 const clean=(v,max=600)=>typeof v==='string'?v.normalize('NFKC').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'').trim().slice(0,max):'';
 const frozen=x=>{Object.values(x).forEach(v=>{if(v&&typeof v==='object')frozen(v)});return Object.freeze(x)};
 const encoder=typeof TextEncoder!=='undefined'?new TextEncoder():null,sizeOf=x=>{const s=JSON.stringify(x);return encoder?encoder.encode(s).byteLength:s.length*3;};
 const fail=(code,message)=>Object.assign(new Error(message),{name:'NarrationError',code});
 function interpret(value,context={}){
  const text=clean(value,MAX_INPUT),q=text.toLowerCase(),participants=Array.isArray(context.participants)?context.participants:[];
  if(!text)return {kind:'clarify',intent:'unknown',parts:[],targetId:null,clarification:'What would you like to say or attempt?'};
  if(/^\/?ooc\s*[: ]|^\/?(?:help|rules?)\s*:|^\/(?:help|rules?)(?:\s|$)|^\((?:ooc|out of character)\b|\bhow (?:do|does) (?:mastery|transcendence|the game|saving|skill experience|breakthrough)\b/i.test(text))return {kind:'ooc',intent:'ooc',text,parts:[{type:'ooc',text}],targetId:null};
  if(/^(?:pause|wait here|hold on|one moment|stop for now)[.!]?$/i.test(text))return {kind:'pause',intent:'pause',text,parts:[],targetId:context.currentNpc||null};
  const mentions=participants.filter(n=>n&&[n.name,n.id].some(name=>name&&new RegExp('(?:^|\\W)'+String(name).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?:$|\\W)','i').test(q)));
  const targetId=mentions.length===1?mentions[0].id:context.currentNpc||null;
  if(/^(?:do it|use it|give (?:him|her|them) (?:it|that)|take (?:it|that)|attack (?:him|her|them))[.!]?$/i.test(text)&&(!targetId||/\bit\b|\bthat\b/i.test(text)))return {kind:'clarify',intent:'unknown',text,parts:[],targetId,clarification:'Please name the person or object and what you intend to do with them.'};
  const pieces=[];let cursor=0;const quote=/[“"]([^”"]+)[”"]|[‘]([^’]+)[’]|(?:^|\s)'([^'\n]+)'(?=\s|[.!?,;]|$)/g;let match;
  while((match=quote.exec(text))){if(match.index>cursor)pieces.push({type:'action',text:text.slice(cursor,match.index)});pieces.push({type:'speech',text:match[1]||match[2]||match[3]});cursor=quote.lastIndex;}if(cursor<text.length)pieces.push({type:'action',text:text.slice(cursor)});
  const classify=t=>{let a=t.toLowerCase().replace(/^\s*(?:and\s+)?(?:i\s+)?(?:try to\s+|attempt to\s+|want to\s+)?/,'');
   // A refusal or hypothetical is not authorization for the action it mentions.
   if(/^(?:don['’]t|do not|won['’]t|will not|never|refuse to|avoid|refrain from|decide not to|should\b|if\b|unless\b|suppose\b|imagine\b|consider\b)/.test(a))return 'unknown';
   if(/^(?:and\s+)?(?:say|ask|tell|speak|talk|whisper|shout|promise|apologize|thank|greet|discuss|question|persuade|convince|negotiate|bargain|insult|threaten)\b|^(?:hello|hi|greetings|who|what|why|how|where|when|could|would|will|can|do|did|are|is)\b/.test(a))return 'speak';
   if(/^(?:leave|depart|end (?:this|the) conversation|say goodbye)\b/.test(a))return 'leave';
   if(/^(?:go\s+(?:and\s+|to\s+)?)?(?:attack|strike|fight|punch|slash|challenge|duel|draw my (?:blade|sword)|spar)\b/.test(a))return 'attack';
   if(/^(?:defend|guard|parry|block|dodge|evade)\b/.test(a))return 'guard';
   if(/^(?:treat|heal|bandage|tend|diagnose)\b/.test(a))return 'treat';
   if(/^(?:craft|forge|brew|sew|repair|make)\b/.test(a))return 'craft';
   if(/^(?:gift|give|offer)\b/.test(a))return 'gift';
   if(/^(?:inspect|investigate|search|examine|study|read|trace|listen for|pick (?:the |a )?lock|unlock)\b/.test(a))return 'investigate';
   if(/^(?:look|observe|watch|listen|notice)\b/.test(a))return 'observe';
   if(/^(?:go|travel|walk|climb|run|explore|enter|follow|cross|move|sneak|hide|slip|slink|crawl)\b/.test(a))return 'move';
   if(/^(?:protect|rescue|help|assist|support|save|shield)\b/.test(a))return 'assist';
   if(/^(?:rest|sleep|eat|drink|meditate|recover)\b/.test(a))return 'rest';
   if(/^(?:use|consume|apply|burn|perform|cast|channel|invoke|activate)\b|^take\s+(?:an? |the )?.*(?:pill|salve|draught|dewstone)\b/.test(a))return 'use_technique';
   if(/^(?:bow|nod|smile|sit|stand|greet|wait)\b/.test(a))return 'gesture';
   if(/^(?:lift|push|pull|open|close|break|disarm|distract|bind|untie|reach|touch|steal|pick up|put down|test|searchpath)\b/.test(a))return 'attempt';
   return 'unknown';};
  function splitActions(value){if(classify(value)==='speak')return [value];const parts=value.split(/\s+(?:and then|then|and I)\s+|\s+and\s+(?=(?:ask|tell|say|inspect|examine|bow|leave|attack|offer|give|treat)\b)|;\s*/i);const speechAt=parts.findIndex(p=>classify(p)==='speak');return speechAt<0?parts:[...parts.slice(0,speechAt),parts.slice(speechAt).join(' and ')];}
  const parts=pieces.filter((p,i)=>!(p.type==='action'&&pieces[i+1]?.type==='speech'&&/^\s*(?:i\s+)?(?:say|ask|tell|whisper|shout|reply|respond)\b[^.!?]*[, :]?\s*$/i.test(p.text))).flatMap(p=>p.type==='speech'?[{...p,intent:'speak'}]:splitActions(p.text).map(t=>({type:'action',text:clean(t,MAX_INPUT),intent:classify(t)}))).filter(p=>p.text&&!/^(?:and|i|,)$/i.test(p.text)).slice(0,5);
  if(parts.length===1&&parts[0].intent==='speak')parts[0].type='speech';
  const meaningful=parts.filter(p=>!['gesture','unknown'].includes(p.intent)),intent=meaningful[0]?.intent||parts[0]?.intent||'unknown';
  if(mentions.length>1&&['attack','gift','treat','use_technique'].includes(intent))return {kind:'clarify',intent,parts,text,targetId:null,clarification:'Which person should that action affect? Name one target before the attempt is resolved.'};
  if(intent==='unknown')return {kind:'clarify',intent,parts,text,targetId,clarification:'What outcome are you trying to achieve, and which present person or object does the attempt concern? You can speak, investigate, move, help, craft, rest, or attempt a physical action.'};
  return {kind:parts.length>1?'multipart':intent==='speak'?'dialogue':'action',intent,parts,text,targetId};
 }
 function shouldNarrate(input,intent,options={}){const mode=options.mode==='connected'?'online':options.mode;if(mode==='offline'||!MODES.includes(mode)||options.choice)return false;if(options.expand)return true;if(['ooc','pause','clarify','suggestion'].includes(intent.kind))return false;if(!['speak','investigate','treat'].includes(intent.intent))return false;const words=clean(input,MAX_INPUT).split(/\s+/).length;return mode==='local'?words>=4:words>=18;}
 function memoryId(value){let h=2166136261;for(const c of String(value))h=Math.imul(h^c.charCodeAt(0),16777619);return (h>>>0).toString(36)}
 function contextFromState(state,focus=''){
  const w=state.world||{},scene=state.scene||{},npcs={...Object.fromEntries((w.encounters?.records||[]).map(n=>[n.id,n])),...(state.npcs||{})},candidate=scene.npc||scene.npcId||null,currentNpc=candidate&&npcs[candidate]?.location===w.location?candidate:null,commitments=w.relationships?.commitments||{};
  const memory=[];for(const fact of (Array.isArray(scene.actionFacts)?scene.actionFacts:[]).slice(-8))memory.push({kind:'fact',text:clean(fact,240),source:'resolved-physical-attempt',eventId:'scene-object:'+memoryId(scene.id+fact),ownerId:'',day:w.day||0});for(const p of (Array.isArray(w.narrative?.promises)?w.narrative.promises:[]).filter(p=>p&&p.npc&&npcs[p.npc]?.location===w.location&&p.status!=='fulfilled'&&p.status!=='cancelled').slice(-8))memory.push({kind:'commitment',text:clean(p.text,240)+' ['+clean(p.status||'open',30)+']',source:clean(p.source||'engine-promise',80),eventId:clean(p.id,100),ownerId:clean(p.npc,60),day:Number.isFinite(p.day)?p.day:0});for(const [id,n] of Object.entries(npcs)){if(n.location!==w.location)continue;const promise=clean(commitments[id]?.status||n.promise,240);if(promise)memory.push({kind:'commitment',text:promise,source:'engine-relationship',eventId:'commitment:'+id,ownerId:id,day:commitments[id]?.day||0});for(const m of (Array.isArray(n.memory)?n.memory:[]).slice(0,4))memory.push({kind:'fact',text:clean(m,240),source:'engine-recorded-interaction',eventId:'memory:'+id+':'+memoryId(m),ownerId:id,day:0});}
  const publicRumors=(Array.isArray(w.rumors)?w.rumors:[]).slice(0,3).map(x=>({kind:'rumor',text:clean(x,220),source:'world-rumor',eventId:'rumor:'+memoryId(x),ownerId:'public',day:0}));
  const player=state.player||{},skillEntries=Object.entries(player.skills||{}).filter(([name])=>focus.toLowerCase().includes(name.toLowerCase())).slice(0,4);
  return {location:clean(w.location,100),day:Number.isFinite(w.day)?w.day:1,currentNpc,stateVersion:clean([state.build||'',state.actionNo||0,w.day||1,w.phase||0].join(':'),100),
   participants:Object.entries(npcs).filter(([id,n])=>n.location===w.location).slice(0,12).map(([id,n])=>({id:clean(id,60),name:clean(n.name,100),role:clean(n.role,120),mood:clean(n.mood,80),relationship:clean(n.relationshipStatus,120),memories:(Array.isArray(n.memory)?n.memory:[]).slice(0,6).map(m=>clean(m,300)),commitment:clean(commitments[id]?.status||n.promise,200)})),
   knownFacts:[],rumors:publicRumors.map(x=>x.text),memory:[...memory.filter(m=>m.kind==='commitment'),...memory.filter(m=>m.kind!=='commitment'),...publicRumors].slice(0,18),
   player:{realm:clean(String(player.realm??''),100),condition:['hp','qi','fatigue'].filter(k=>Number.isFinite(player[k])).map(k=>k+': '+player[k]),equipment:Object.entries(player.equipped||player.equipment||{}).filter(([,v])=>typeof v==='string').slice(0,4).map(([slot,item])=>clean(slot+': '+item,100)),skills:skillEntries.map(([name,s])=>clean(name+': '+(s.progress?.acquired===false?'unlearned':'mastery '+Math.max(1,Math.min(10,s.progress?.mastery||1))+' / tier '+(s.progress?.tier||0)),100))},
   recentDialogue:(state.chat?.history||[]).slice(-4).map(x=>({role:x.role==='player'?'player':'narrator',text:clean(x.text,350),source:x.role==='player'?'player-utterance':x.mode==='offline'?'authored-outcome':'generated-prose-not-canonical'})),
   unresolvedThreads:Object.entries(w.threads||{}).filter(([,v])=>Number(v)>0).slice(0,8).map(([name])=>clean(name,100))};
 }
 function makeReceipt(source){
  if(!source||typeof source!=='object')throw fail('INVALID_RECEIPT','A resolved action receipt is required.');
  const id=clean(source.id,100),input=clean(source.input,MAX_INPUT),outcome=clean(source.outcome,4000);
  if(!/^[a-zA-Z0-9_.:-]{1,100}$/.test(id)||!outcome)throw fail('INVALID_RECEIPT','The action ID and resolved outcome are required.');
  const context=source.scene||{},participant=source.participant||null;
  return frozen({id,input,intent:clean(typeof source.intent==='string'?source.intent:source.intent?.intent,50),
   scene:{location:clean(context.location,100),title:clean(context.title,120),description:clean(context.description,1400),weather:clean(context.weather,60),day:Number.isFinite(context.day)?context.day:1},
   outcome,facts:(Array.isArray(source.facts)?source.facts:[]).slice(0,16).map(x=>clean(x,320)),
   participant:participant?{id:clean(participant.id,60),name:clean(participant.name,100),role:clean(participant.role,120),mood:clean(participant.mood,80),relationship:clean(participant.relationship,120),memories:(Array.isArray(participant.memories)?participant.memories:[]).slice(0,6).map(x=>clean(x,300)),commitment:clean(participant.commitment,200)}:null,
   unresolvedThreads:(Array.isArray(source.unresolvedThreads)?source.unresolvedThreads:[]).slice(0,8).map(x=>clean(x,100)),
   stateVersion:clean(source.stateVersion,100),locale:clean(source.locale||'en',20),
   memory:(Array.isArray(source.memory)?source.memory:[]).filter(x=>x&&['fact','rumor','belief','commitment','summary'].includes(x.kind)&&(!participant||!x.ownerId||x.ownerId==='public'||x.ownerId===participant.id)).sort((a,b)=>(b.kind==='commitment')-(a.kind==='commitment')).slice(0,18).map(x=>({kind:x.kind,text:clean(x.text,260),source:clean(x.source,80),eventId:clean(x.eventId,100),ownerId:clean(x.ownerId,60),day:Number.isFinite(x.day)?x.day:0})),
   player:{realm:clean(source.player?.realm,100),condition:(Array.isArray(source.player?.condition)?source.player.condition:[]).slice(0,4).map(x=>clean(x,100)),equipment:(Array.isArray(source.player?.equipment)?source.player.equipment:[]).slice(0,4).map(x=>clean(x,100)),skills:(Array.isArray(source.player?.skills)?source.player.skills:[]).slice(0,4).map(x=>clean(x,100))},
   recentDialogue:(Array.isArray(source.recentDialogue)?source.recentDialogue:[]).slice(-4).map(x=>({role:x.role==='player'?'player':'narrator',text:clean(x.text,350),source:clean(x.source||'unknown-not-canonical',80)}))});
 }
 function validateNarration(value,receipt){
  if(typeof value!=='string'||value.length>MAX_REPLY)throw fail('INVALID_RESPONSE','The narrator returned an invalid response.');
  const text=clean(value,MAX_REPLY);
  if(!text||/^(?:\s*[{[]|```)|<\/?(?:script|iframe|style)\b|\b(?:system prompt|developer instructions|api[_ -]?key)\s*[:=]/i.test(text))throw fail('INVALID_RESPONSE','The narrator returned instructions or data instead of scene prose.');
  // The rules engine remains authoritative even when this conservative prose check cannot detect a fictional claim.
  const claims=text.match(/\byou (?:gain|receive|acquire|learn|unlock|earn|obtain|become|advance to|transcend)\b[^.!?\n]{0,160}/gi)||[];
  const grounded=[receipt?.outcome,...(receipt?.facts||[])].join(' ').toLowerCase();
  if(claims.some(c=>!grounded.includes(c.toLowerCase())))throw fail('UNGROUNDED_RESPONSE','The narrator proposed a progression or reward change outside the resolved action.');
  return text;
 }
 function offline(receipt,options={}){
  const r=makeReceipt(receipt),length=LENGTHS.includes(options.length)?options.length:'balanced';
  // The existing engine authors the outcome. Offline mode must not fabricate an answer to an arbitrary question.
  const context=length==='detailed'&&r.scene.description?r.scene.description+'\n\n':'';
  return {text:context+r.outcome,mode:'offline',provider:null,model:null};
 }
 function ledger(chat){
  if(!chat||typeof chat!=='object')throw fail('INVALID_LEDGER','Chat state is required.');
  chat.transactions=Array.isArray(chat.transactions)?chat.transactions.filter(x=>x&&typeof x.id==='string'&&['pending','resolved','committed'].includes(x.status)).slice(-120):[];
  const find=id=>chat.transactions.find(x=>x.id===id);
  return {find,begin(id,input){if(!/^[\w.:-]{1,100}$/.test(id))throw fail('INVALID_ID','Invalid action ID.');const old=find(id);if(old){if(old.input!==clean(input,MAX_INPUT))throw fail('ID_CONFLICT','That action ID belongs to a different input.');return {fresh:false,transaction:old};}const serial=/^chat:[^:]+:(\d+)$/.exec(id);if(serial&&Number(serial[1])<=(chat.submittedHighwater||0))throw fail('EXPIRED_TURN','That completed turn is outside retained history and cannot be replayed.');if(chat.transactions.some(x=>x.status!=='committed'))throw fail('UNFINISHED_TURN','Finish the saved response before submitting a new action.');if(serial)chat.submittedHighwater=Number(serial[1]);const x={id,input:clean(input,MAX_INPUT),status:'pending'};chat.transactions.push(x);compactChat(chat);return {fresh:true,transaction:x};},
   resolved(id,receipt){let x=find(id);if(!x)throw fail('UNKNOWN_ID','Begin the action before resolving it.');if(x.status==='committed'||x.status==='resolved')return x;let validated=makeReceipt(receipt);if(validated.id!==id||validated.input!==x.input)throw fail('ID_CONFLICT','The receipt does not describe this submitted action.');x.receipt=validated;x.status='resolved';compactChat(chat);return x;},
   committed(id,text,mode='offline'){let x=find(id);if(!x||x.status==='pending')throw fail('UNRESOLVED','Resolve the action before completing it.');if(x.status==='committed')return x;x.text=clean(text,MAX_REPLY);x.mode=mode==='connected'?'online':MODES.includes(mode)?mode:'offline';x.status='committed';compactChat(chat);return x;}};
 }
 function compactChat(chat){
  if(Array.isArray(chat.history)){let size=chat.history.reduce((n,x)=>n+sizeOf(x),0),removed=0;while(chat.history.length>80||size>180000&&chat.history.length>2){size-=sizeOf(chat.history.shift());removed++;}if(removed){chat.archivedMessages=(chat.archivedMessages||0)+removed;chat.historySummary=`${chat.archivedMessages} older transcript messages were omitted to keep the save compact. NPC memories, promises, and world consequences remain in the game state.`;}}
  if(Array.isArray(chat.transactions)){let size=chat.transactions.reduce((n,x)=>n+sizeOf(x),0);while(chat.transactions.length>120||size>260000){const at=chat.transactions.findIndex(x=>x.status==='committed'&&x.id!==chat.pendingId);if(at<0)break;size-=sizeOf(chat.transactions[at]);chat.transactions.splice(at,1);}}
  return chat;
 }
 async function request(receipt,options={}){
  const r=makeReceipt(receipt),endpoint=options.endpoint||'/api/narrate';
  if(!/^\/(?!\/)[a-zA-Z0-9/_-]+$/.test(endpoint))throw fail('INVALID_ENDPOINT','The narrator must use a same-origin server endpoint.');
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort('timeout'),Math.max(1000,Math.min(options.timeoutMs||45000,90000))),abort=()=>controller.abort(options.signal?.reason||'cancelled');
  if(options.signal?.aborted)abort();else options.signal?.addEventListener('abort',abort,{once:true});
  let text='',done=null,total=0,firstDeltaMs=null;const requestStarted=Date.now();
  try{
   if(controller.signal.aborted)throw fail('CANCELLED','Narration cancelled. Your action is not repeated.');
   options.onProgress?.('connecting');
   const response=await (options.fetch||fetch)(endpoint,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/x-ndjson'},body:JSON.stringify({receipt:r,length:LENGTHS.includes(options.length)?options.length:'balanced',mode:options.mode==='local'?'local':'online',purpose:options.purpose==='expand'?'expand':'complex'}),credentials:'same-origin',signal:controller.signal});
   if(!response.ok){let code='SERVICE_UNAVAILABLE',message;try{let body=await response.json();code=body.code||code;message=clean(body.message,300)}catch{}throw fail(code,message|| (code==='NOT_CONFIGURED'?'Model narration is not configured. Your resolved action and draft are safe.':`Model narration is unavailable (${response.status}). Your resolved action and draft are safe.`));}
   if(!response.body||!String(response.headers.get('Content-Type')).includes('application/x-ndjson'))throw fail('INVALID_RESPONSE','The narration server returned an unsupported response.');
   const reader=response.body.getReader(),decoder=new TextDecoder();let buffer='';
   function consume(line){if(!line.trim())return;let message;try{message=JSON.parse(line)}catch{throw fail('INVALID_RESPONSE','The narration stream was malformed.');}if(!message||typeof message!=='object'||Array.isArray(message))throw fail('INVALID_RESPONSE','The narration stream was malformed.');
    if(message.type==='status'){options.onProgress?.(clean(message.stage,60));return;}
    if(message.type==='delta'){if(done||typeof message.text!=='string'||message.text.length>4000)throw fail('INVALID_RESPONSE','The narration stream was malformed.');if(firstDeltaMs===null)firstDeltaMs=Date.now()-requestStarted;text+=message.text;if(text.length>MAX_REPLY)throw fail('INVALID_RESPONSE','The narration exceeded its response limit.');options.onDelta?.(message.text,text);return;}
    if(message.type==='done'){if(done||message.id!==r.id||typeof message.text!=='string'||message.text!==text)throw fail('INVALID_RESPONSE','The narration receipt does not match this action.');done={text:validateNarration(message.text,r),mode:message.mode==='local'?'local':'online',provider:clean(message.provider,80),model:clean(message.model,100),diagnostics:message.diagnostics&&typeof message.diagnostics==='object'?message.diagnostics:null};return;}
    if(message.type==='error')throw fail(clean(message.code,60)||'SERVICE_UNAVAILABLE',clean(message.message,240)||'The narration was interrupted. Your resolved action remains safe.');
    throw fail('INVALID_RESPONSE','The narration server returned an unsupported event.');
   }
   try{while(true){const chunk=await reader.read();if(chunk.done)break;total+=chunk.value.length;if(total>100000)throw fail('INVALID_RESPONSE','The narration stream exceeded its limit.');buffer+=decoder.decode(chunk.value,{stream:true});let at;while((at=buffer.indexOf('\n'))>=0){consume(buffer.slice(0,at));buffer=buffer.slice(at+1);}}buffer+=decoder.decode();if(buffer.trim())consume(buffer);}finally{await reader.cancel().catch(()=>{});}
   if(!done)throw fail('INTERRUPTED','The narration ended before completion. Your resolved action and draft are safe.');done.diagnostics={...done.diagnostics,clientFirstDeltaMs:firstDeltaMs,clientTotalMs:Date.now()-requestStarted};return done;
  }catch(error){if(controller.signal.aborted)throw fail(options.signal?.aborted?'CANCELLED':'TIMEOUT',options.signal?.aborted?'Narration cancelled. Your action is not repeated.':'Narration timed out. Your action is not repeated.');if(error.name==='NarrationError')throw error;throw fail('OFFLINE','Could not reach the narrator. Your resolved action and draft are safe.');}
  finally{clearTimeout(timeout);options.signal?.removeEventListener('abort',abort);}
 }
 async function serviceStatus(options={}){const response=await (options.fetch||fetch)(options.test?'/api/narrator-test':'/api/narrator-status',{method:options.test?'POST':'GET',headers:options.test?{'Content-Type':'application/json'}:{},body:options.test?JSON.stringify({mode:options.mode==='local'?'local':'online'}):undefined,credentials:'same-origin',signal:options.signal});let data=await response.json();if(!response.ok)throw fail(data.code||'SERVICE_UNAVAILABLE',clean(data.message,300)||'The model service is unavailable.');return data;}
 return Object.freeze({MAX_INPUT,MAX_REPLY,LENGTHS,MODES,interpret,shouldNarrate,contextFromState,makeReceipt,validateNarration,offline,ledger,compactChat,request,serviceStatus});
});
