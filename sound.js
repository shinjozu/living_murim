/* Authored martial foley arrangements. Recorded material: Kenney CC0; see docs/SOUND-DESIGN.md. */
(function(root){
 'use strict';
 const clamp=(n,min,max)=>Math.max(min,Math.min(max,Number.isFinite(Number(n))?Number(n):min));
 const TAU=Math.PI*2;
 const bank={};
 function define(name,family,strikes,rise,tail,body,grain,ring){bank[name]=Object.freeze({name,family,strikes:Object.freeze(strikes),rise,tail,body,grain,ring});}
 // All attack identities have authored timing and spectral structure, beyond pitch/noise seed.
 define('Parting Mist','steel',[.18],.17,.42,.58,.48,.22);
 define('Falling Cloud','steel',[.24,.39],.23,.55,.72,.39,.31);
 define('Empty Peak Guard','guard',[.2,.33],.16,.62,.65,.3,.64);
 define('Cloudless Severing','steel',[.38],.36,.75,.97,.58,.5);
 define('Stillness Before Snow','ice',[.29],.13,.71,.48,.34,.8);
 define('Winter Moon Draw','ice',[.35,.44],.31,.87,.51,.21,.94);
 define('White Silence Descent','ice',[.29,.37,.46],.26,1.02,.8,.55,.74);
 define('Black Sky Step','void',[.13,.25],.21,.4,.3,.57,.2);
 define('Heavenless Palm','void',[.22,.31],.2,.6,.87,.45,.35);
 define('Eclipse Meridian','void',[.43],.41,.87,.95,.36,.72);
 define('Verdant Needle','wood',[.16,.205,.25],.11,.44,.28,.29,.72);
 define('Jade Leaf Palm','wood',[.21,.36],.18,.55,.6,.43,.48);
 define('Spring Returning Breath','restore',[.2,.4,.63],.19,.82,.38,.15,.87);
 define('Iron Palm Pressure','palm',[.16],.14,.38,.9,.51,.18);
 define('Furnace-Bone Stamp','fire',[.24,.3],.2,.61,1,.62,.27);
 define('Mountain-Breaking Palm','palm',[.37,.43,.53],.35,.85,1,.79,.34);
 define('Dustcloak Footwork','wind',[.1,.23,.34],.12,.31,.24,.86,.13);
 define('Wayfarer Staff Sweep','wood',[.22,.34],.28,.46,.77,.51,.31);
 define('Empty Bowl Counter','guard',[.18,.39],.16,.53,.78,.28,.57);
 define('Lotus Vein Pierce','qi',[.31],.29,.57,.57,.5,.63);
 define('Petal Shadow Exchange','void',[.17,.31,.45],.19,.54,.61,.65,.29);
 define('Black Bloom Reversal','chaos',[.32,.42,.58,.68],.3,.99,.95,.64,.78);
 define('Minor Meridian Sweep','restore',[.2,.35],.22,.5,.25,.12,.46);
 define('Silent Dantian Cycle','restore',[.37],.35,.84,.61,.09,.59);
 define('Nine-Breath Reversal','reverse',[.54,.38,.22],.58,1.08,.79,.44,.85);
 define('Thunderstep Feint','lightning',[.12,.21,.34],.11,.34,.41,.69,.27);
 define('Basic Handwork','palm',[.13,.23],.09,.26,.67,.39,.1);
 define('Measured Guard','guard',[.16],.11,.37,.59,.42,.49);
 define('Qinggong Withdrawal','wind',[.11,.27],.26,.46,.19,.62,.15);
 define('Focused Qi Burst','qi',[.27],.26,.55,.65,.43,.43);
 define('Scorching Qi Burst','fire',[.23,.31],.22,.67,.71,.83,.3);
 define('Frost-Silent Qi Burst','ice',[.34],.29,.77,.43,.28,.67);
 define('Thunderstep Qi Burst','lightning',[.2,.245,.31],.19,.62,.82,.89,.42);
 define('Verdant Venom Qi Burst','wood',[.19,.26,.35],.18,.66,.39,.38,.59);
 define('Hollow Qi Burst','void',[.36],.34,.68,.74,.52,.41);
 define('Unbound Qi Burst','chaos',[.23,.35,.47],.21,.76,.73,.58,.71);
 define('Unveil the Flow','qi',[.22,.44],.26,.77,.22,.18,.91);
 define('Draw the Broken Current','void',[.25,.48],.46,.83,.86,.6,.47);
 define('Compare a Remembered Pattern','guard',[.19,.29,.41],.23,.73,.37,.17,.89);
 define('Settle a Karmic Thread','guard',[.26,.47],.24,.88,.47,.24,.83);
 define('Assimilate a Survived Form','chaos',[.25,.37,.52],.34,.9,.76,.41,.63);
 define('Open the Clear Circuit','restore',[.22,.36,.55,.74],.28,.72,.48,.12,.71);
 define('Heart Before the Blade','steel',[.31,.355],.3,.68,.81,.31,.67);
 define('Crimson Marrow Guard','fire',[.21,.37],.18,.81,.91,.74,.41);
 define('Join Two Principles','qi',[.21,.38,.48],.2,.69,.74,.49,.58);
 define('Anchor the Living Formation','guard',[.2,.4,.6],.26,.9,.92,.26,.76);
 define('Answer the Scar','restore',[.24,.46],.32,.67,.72,.2,.53);
 define('Cinder Lotus','fire',[.28,.4,.56],.26,.95,.91,.79,.55);
 define('Still Lake Mirror','ice',[.26,.45],.24,.94,.64,.27,.86);
 define('Heaven-Splitting Thread','lightning',[.31,.34,.4,.53],.29,.98,.99,.94,.57);
 define('Root and Thorn','wood',[.17,.31,.49,.61],.26,.87,.63,.42,.74);
 define('Hollow Between Steps','void',[.15,.37,.54],.29,.78,.43,.62,.52);
 define('Wheel Before Division','chaos',[.3,.49,.72],.31,1.12,.94,.57,.92);
 define('Iron Mountain Fist','palm',[.27,.39],.25,.53,.97,.68,.23);
 define('Still Water Guard','guard',[.21,.38],.19,.58,.68,.25,.72);
 define('Needle-Step Method','wind',[.11,.22,.4],.1,.42,.45,.71,.27);
 const aliases=Object.freeze({sword:'Parting Mist',frost:'Stillness Before Snow',unarmed:'Basic Handwork',qi:'Focused Qi Burst',focus:'Thunderstep Feint',defend:'Measured Guard',breath:'Minor Meridian Sweep',flee:'Qinggong Withdrawal',reverse:'Nine-Breath Reversal'});
 const catalog=Object.freeze(bank);
 const resolve=name=>catalog[name]||catalog[aliases[name]]||null;

 /* FOLEY_METADATA_START */
 const FOLEY_META={"robe":{"start":0,"frames":13395},"sleeve":{"start":13395,"frames":8475},"belt":{"start":21870,"frames":15876},"draw":{"start":37746,"frames":7644},"drawFine":{"start":45390,"frames":9398},"cut":{"start":54788,"frames":11557},"cutReturn":{"start":66345,"frames":12293},"chop":{"start":78638,"frames":4921},"step":{"start":83559,"frames":5054},"stepReturn":{"start":88613,"frames":6614},"leather":{"start":95227,"frames":9153},"grit":{"start":104380,"frames":9922},"stoneStep":{"start":114302,"frames":2310},"snow":{"start":116612,"frames":8188},"body":{"start":124800,"frames":9494},"bodyHeavy":{"start":134294,"frames":10088},"cushion":{"start":144382,"frames":6174},"wood":{"start":150556,"frames":7272},"woodHeavy":{"start":157828,"frames":6839},"plank":{"start":164667,"frames":13230},"metal":{"start":177897,"frames":5135},"metalHeavy":{"start":183032,"frames":7858},"steelRing":{"start":190890,"frames":18315},"glass":{"start":209205,"frames":4558},"glassBreak":{"start":213763,"frames":3719},"debris":{"start":217482,"frames":14332}};
 /* FOLEY_METADATA_END */
 const BANK_URL='audio/murim-foley.wav';
 const scriptBase=root.document?.currentScript?.src||root.document?.baseURI;
 let recording=null,bankPromise=null,bankError=null;
 function decodeBank(bytes){
  const view=new DataView(bytes.buffer||bytes,bytes.byteOffset||0,bytes.byteLength),str=(at,n)=>Array.from({length:n},(_,i)=>String.fromCharCode(view.getUint8(at+i))).join('');
  if(view.byteLength<44||str(0,4)!=='RIFF'||str(8,4)!=='WAVE')throw Error('The foley bank is not a WAV file.');
  let rate=0,start=0,frames=0;
  for(let at=12;at+8<=view.byteLength;){const size=view.getUint32(at+4,true),id=str(at,4);if(at+8+size>view.byteLength)throw Error('The foley bank is truncated.');
   if(id==='fmt '){if(size<16||view.getUint16(at+8,true)!==1||view.getUint16(at+10,true)!==1||view.getUint16(at+22,true)!==16)throw Error('The foley bank must be mono PCM16.');rate=view.getUint32(at+12,true);}
   if(id==='data'){start=at+8;frames=Math.floor(size/2);}at+=8+size+(size%2);
  }
  if(rate!==22050||!start||!frames)throw Error('The foley bank has invalid sample data.');
  const samples=new Float32Array(frames);for(let i=0;i<frames;i++)samples[i]=view.getInt16(start+i*2,true)/32768;
  for(const spec of Object.values(FOLEY_META))if(spec.start<0||spec.frames<1||spec.start+spec.frames>frames)throw Error('The foley bank does not match its source map.');
  recording={samples,sampleRate:rate};bankError=null;return true;
 }
 async function preload(){
  if(recording)return true;if(bankPromise)return bankPromise;
  bankPromise=(async()=>{try{
   if(typeof root.fetch!=='function')return false;
   const url=scriptBase?new URL(BANK_URL,scriptBase).href:BANK_URL,response=await root.fetch(url,{credentials:'same-origin'});
   if(!response.ok)throw Error('Foley bank HTTP '+response.status);
   return decodeBank(await response.arrayBuffer());
  }catch(error){bankError=error.message;return false;}finally{bankPromise=null;}})();return bankPromise;
 }
 if(typeof module==='object'&&module.exports){try{decodeBank(require('fs').readFileSync(require('path').join(__dirname,BANK_URL)));}catch(error){bankError=error.message;}}
 else if(root.document&&typeof root.fetch==='function')preload(); // Fetching a small bank never opens audio or starts playback.
 const outcomeOf=options=>['hit','guard','miss'].includes(options.outcome)?options.outcome:options.hit===false?'miss':'hit';
 function arrangement(name,options={}){
  const d=resolve(name);if(!d)throw new RangeError('No sound is registered for '+name);
  const outcome=outcomeOf(options),f=d.family,layers=[],first=Math.min(...d.strikes),final=Math.max(...d.strikes),soft=f==='restore'||f==='reverse';
  const add=(sample,at,gain,extra={})=>layers.push({sample,at:Math.max(0,at),gain,...extra});
  add(soft?'belt':'robe',0,soft?.12:.14+d.grain*.06,{rate:soft?.7:1.02,lowpass:soft?900:6500,duration:Math.min(.6,d.rise+.12),fadeIn:.012});
  if(!soft)add(f==='wind'?'stoneStep':'step',Math.max(0,first-.12),.09+d.body*.08,{rate:f==='palm'?.89:1.08,lowpass:3200,duration:.22});
  if(f==='steel')add(d.ring>.6?'drawFine':'draw',Math.max(0,first-.17),.1+d.ring*.12,{duration:.32,highpass:450,fadeIn:.008});
  if(['qi','void','chaos','reverse'].includes(f))add('robe',.025,.09+d.grain*.04,{rate:.63,reverse:true,lowpass:f==='void'?700:1400,duration:d.rise,fadeIn:Math.max(.02,d.rise*.8)});
  for(let j=0;j<d.strikes.length;j++){
   const at=d.strikes[j],weight=(1-j*.09),contact=.32+d.body*.2,swing=j%2?'cutReturn':'cut';
   const swish=['steel','ice'].includes(f)?swing:f==='wood'?'belt':'sleeve';
   add(swish,Math.max(0,at-.095),(.17+d.grain*.12)*weight,{rate:1.06+j*.045,highpass:180,duration:.29,fadeIn:.005});
   if(f==='wind'){add(j%2?'stepReturn':'stoneStep',at,.13*weight,{rate:1.12,lowpass:4300,duration:.22});add('grit',at+.025,.06,{duration:.22});}
   else if(f==='restore'){add('robe',at,.065,{rate:.69,lowpass:750,fadeIn:.13,duration:.54});add('glass',at+.045,.018*d.ring,{rate:.8,lowpass:1100,fadeIn:.045,duration:.35});}
   else if(f==='reverse'){add('leather',at,.075*weight,{rate:.78,reverse:true,lowpass:800,fadeIn:.12,duration:.38});}
   else if(outcome==='guard'){
    add(['palm','wood','fire'].includes(f)?'woodHeavy':'metalHeavy',at,contact*.69*weight,{lowpass:6000,duration:.31});
    add('steelRing',at+.016,.065*d.ring,{highpass:700,duration:.28});add('cushion',at+.038,.07,{lowpass:850,duration:.18});
   }else if(outcome==='hit'){
    add(d.body>.85?'bodyHeavy':'body',at,contact*weight,{rate:f==='palm'?.9:1.01,lowpass:4900,duration:.34});
    if(f==='steel')add('chop',at+.014,.15*weight,{highpass:280,duration:.25});
    if(f==='guard')add('metal',at,.2*weight,{duration:.38});
    if(f==='wood'){add(j%2?'woodHeavy':'wood',at+.006,.23*weight,{duration:.27});if(d.body>.6&&j===d.strikes.length-1)add('plank',at+.028,.07,{lowpass:2400,duration:.38});}
    if(f==='palm')add('cushion',at+.012,.19*weight,{rate:.81,lowpass:800,duration:.22});
   }
   // Restrained transformed recordings provide qi character, without tonal bleeps or oscillators.
   if(f==='ice'){add(j%2?'glassBreak':'glass',at+.008,.1*d.ring*weight,{highpass:900,duration:.33});add('snow',at+.03,.042,{duration:.29});}
   if(f==='lightning'){add('metal',at+.006,.065*weight,{rate:1.45,highpass:2500,duration:.1});add('debris',at+.035,.1*d.grain,{rate:1.33,highpass:1800,duration:.22});}
   if(f==='fire'){add('grit',at+.008,.09*d.grain,{rate:.68,lowpass:1800,duration:.5,fadeIn:.025});add('debris',at+.04,.075,{lowpass:3200,duration:.38});}
   if(f==='qi'){add('cutReturn',at+.035,.065,{rate:.58,lowpass:1700,duration:.48,fadeIn:.035});add('leather',at+.018,.045*d.body,{rate:.65,lowpass:650,duration:.36});}
   if(f==='void')add('belt',at+.04,.075*weight,{rate:.61,lowpass:620,reverse:true,duration:.45,fadeIn:.065});
   if(f==='chaos'){const material=['wood','glassBreak','metal'][j%3];add(material,at+.022,.082*weight,{rate:1,lowpass:2200+j*650,duration:.34});add('robe',at+.045,.045,{reverse:j%2===0,lowpass:900,duration:.4,fadeIn:.03});}
  }
  add(soft?'robe':f==='wind'?'grit':'sleeve',final+.07,soft?.065:.055,{rate:.86,lowpass:1500,duration:Math.min(d.tail,.48),fadeIn:.026});
  return {name:d.name,family:f,outcome,layers,duration:Math.max(final+d.tail+.16,...layers.map(l=>l.at+(l.duration||.6)))+.13,attackAt:first,descriptor:d};
 }
 function renderPCM(name,options={}){
  const plan=arrangement(name,options);if(!recording)throw Error(bankError||'The local foley bank is still loading.');
  const sampleRate=Math.round(clamp(options.sampleRate??22050,8000,48000)),intensity=clamp(options.intensity??1,.15,1.5),length=Math.ceil(plan.duration*sampleRate),dry=new Float32Array(length),samples=new Float32Array(length);
  for(const layer of plan.layers){
   const spec=FOLEY_META[layer.sample];if(!spec)throw Error('Unknown foley source: '+layer.sample);
   const rate=layer.rate||1,sourceFrames=Math.min(spec.frames,Math.ceil((layer.duration||spec.frames/recording.sampleRate/rate)*recording.sampleRate*rate)),frames=Math.ceil(sourceFrames/recording.sampleRate/rate*sampleRate),offset=Math.round(layer.at*sampleRate),step=recording.sampleRate*rate/sampleRate;
   const lo=layer.lowpass?1-Math.exp(-TAU*layer.lowpass/sampleRate):1,hi=layer.highpass?1-Math.exp(-TAU*layer.highpass/sampleRate):0;let filtered=0,base=0;
   for(let i=0;i<frames&&offset+i<length;i++){
    let position=i*step;if(layer.reverse)position=sourceFrames-1-position;position=clamp(position,0,spec.frames-1);
    const a=Math.floor(position),b=Math.min(spec.frames-1,a+1),fraction=position-a;
    let value=recording.samples[spec.start+a]*(1-fraction)+recording.samples[spec.start+b]*fraction;
    filtered+=lo*(value-filtered);value=filtered;if(hi){base+=hi*(value-base);value-=base;}
    const fade=Math.min(1,i/(sampleRate*(layer.fadeIn||.002)),(frames-1-i)/(sampleRate*.022));
    dry[offset+i]+=value*layer.gain*Math.max(0,fade)*intensity;
   }
  }
  let peak=0;
  // A few low-level early reflections give physical space, not a musical echo.
  const taps=[[.029,.055],[.067,.034],[.113,.02]].map(([time,gain])=>[Math.round(time*sampleRate),gain]);
  for(let i=0;i<length;i++){let value=dry[i];for(const [delay,gain]of taps)if(i>=delay)value+=dry[i-delay]*gain;const fade=Math.min(1,i/(sampleRate*.002),(length-1-i)/(sampleRate*.028));samples[i]=value*Math.max(0,fade);peak=Math.max(peak,Math.abs(samples[i]));}
  if(peak>.7){const gain=.7/peak;for(let i=0;i<length;i++)samples[i]*=gain;peak=.7;}
  samples[0]=0;samples[length-1]=0;
  return {samples,sampleRate,duration:plan.duration,peak,attackAt:plan.attackAt,family:plan.family,outcome:plan.outcome,descriptor:plan.descriptor,layers:plan.layers};
 }

 let context=null,master=null,unlocked=false,muted=false,volume=.55,hidden=false;
 const playing=new Set(),buffers=new Map(),seen=new Set(),seenOrder=[];
 const sessionKey='livingMurim.sfx.events.v1';
 function remember(id){if(!id)return;seen.add(id);seenOrder.push(id);while(seenOrder.length>128)seen.delete(seenOrder.shift());try{root.sessionStorage?.setItem(sessionKey,JSON.stringify(seenOrder));}catch(_){/* Storage can be unavailable in private browsing. */}}
 try{const stored=JSON.parse(root.sessionStorage?.getItem(sessionKey)||'[]');if(Array.isArray(stored))for(const id of stored.slice(-128))if(typeof id==='string'){seen.add(id);seenOrder.push(id);}}catch(_){}
 function effectiveVolume(){return muted||hidden?0:volume;}
 function applyVolume(){if(master&&context)master.gain.setTargetAtTime(effectiveVolume(),context.currentTime,.025);}
 async function unlock(){
  if(hidden || root.document?.hidden)return false;
  const Audio=root.AudioContext||root.webkitAudioContext;if(!Audio)return false;
  // unlock must be called synchronously from the user's first tap/click/key handler.
  if(root.navigator?.userActivation && !root.navigator.userActivation.isActive && !unlocked)return false;
  if(!context){try{context=new Audio();master=context.createGain();master.gain.value=effectiveVolume();master.connect(context.destination);}catch(_){return false;}}
  try{if(context.state==='suspended')await context.resume();unlocked=context.state==='running';if(unlocked)await preload();return unlocked&&!!recording&&!hidden&&context.state==='running';}catch(_){return false;}
 }
 function stop(){for(const voice of playing){try{voice.source.stop();}catch(_){}try{voice.source.disconnect();voice.gain.disconnect();voice.pan?.disconnect();}catch(_){}}playing.clear();}
 function balanceVoices(){const mix=.8/Math.max(1,playing.size);for(const voice of playing)voice.gain.gain.setTargetAtTime(voice.level*mix,context.currentTime,.012);}
 function setVolume(value){volume=clamp(value,0,1);applyVolume();return volume;}
 function setMuted(value){muted=!!value;if(muted)stop();applyVolume();return muted;}
 function cacheKey(name,options){return `${name}|${outcomeOf(options)}|${Math.round(clamp(options.intensity??1,.15,1.5)*10)}`;}
 function play(name,options={}){
  const design=resolve(name);if(!design)return {ok:false,reason:'Unknown attack sound.'};
  const eventId=options.eventId==null?null:String(options.eventId);
  if(eventId&&seen.has(eventId))return {ok:false,reason:'This audio event already played.'};
  if(muted||hidden||root.document?.hidden||volume===0||Number(options.volume)===0){remember(eventId);return {ok:false,reason:'Sound is muted or the game is hidden.'};}
  if(!unlocked||!context||context.state!=='running')return {ok:false,reason:'Sound waits for a user gesture.'};
  if(!recording)return {ok:false,reason:bankError||'The local foley bank is loading.'};
  const key=cacheKey(design.name,options);let buffer=buffers.get(key),metadata;
  if(!buffer){const pcm=renderPCM(design.name,options);buffer=context.createBuffer(1,pcm.samples.length,pcm.sampleRate);buffer.copyToChannel(pcm.samples,0);metadata=pcm;buffers.set(key,buffer);while(buffers.size>12)buffers.delete(buffers.keys().next().value);}
  const source=context.createBufferSource(),gain=context.createGain(),pan=context.createStereoPanner?.();source.buffer=buffer;gain.gain.value=0;
  source.connect(gain);if(pan){pan.pan.value=clamp(options.pan??0,-.7,.7);gain.connect(pan);pan.connect(master);}else gain.connect(master);
  const voice={source,gain,pan,level:clamp(options.volume??1,0,1)};playing.add(voice);source.onended=()=>{playing.delete(voice);balanceVoices();try{source.disconnect();gain.disconnect();pan?.disconnect();}catch(_){}};
  if(playing.size>6){const first=playing.values().next().value;try{first.source.stop();}catch(_){}playing.delete(first);}
  balanceVoices();const delay=clamp(options.delay??0,0,1);
  try{source.start(context.currentTime+delay);}catch(_){playing.delete(voice);try{source.disconnect();gain.disconnect();pan?.disconnect();}catch(_){}balanceVoices();return {ok:false,reason:'The browser interrupted audio output.'};}
  remember(eventId);
  return {ok:true,name:design.name,family:design.family,outcome:outcomeOf(options),recorded:true,attackAt:Math.min(...design.strikes)+delay,duration:buffer.duration||metadata?.duration||0};
 }
 function status(){return {unlocked,muted,volume,hidden,bankReady:!!recording,bankError,recordings:Object.keys(FOLEY_META).length,playing:playing.size,cached:buffers.size,registered:Object.keys(catalog).length,contextState:context?.state||'uninitialized'};}
 if(root.document?.addEventListener)root.document.addEventListener('visibilitychange',()=>{hidden=!!root.document.hidden;if(hidden){stop();if(context?.state==='running')context.suspend().catch(()=>{});}else if(unlocked&&context?.state==='suspended')context.resume().catch(()=>{});applyVolume();});
 const api=Object.freeze({version:2,catalog,aliases,sources:Object.freeze(FOLEY_META),arrangement,renderPCM,preload,unlock,play,setVolume,setMuted,stop,status});root.MURIM_SOUND=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
