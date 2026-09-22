/* Authoritative progression. Call only from the mechanical action resolver, never narration. */
(function (root) {
  'use strict';
  const REALMS = Object.freeze(['Mortal','Third-Rate','Second-Rate','First-Rate','Peak','Transcendent','Profound','Life-and-Death','Heavenly']);
  const THRESHOLDS = Object.freeze([0,25,70,130,210,320,470,650,900]);
  const PATHS = Object.freeze({control:'Control: more precise application and a steadier defense.',flowing:'Flowing: conserve Qi and recover momentum.',force:'Force: turn a committed application into stronger impact.'});
  const KINDS = new Set(['skill','life','art','technique']);
  const ACTIVITIES = new Set(['combat','defense','movement','exploration','investigation','social','medicine','craft','alchemy','work','travel','quest']);
  const active = new WeakMap();
  const finite = (n, fallback=0) => Number.isFinite(Number(n)) ? Number(n) : fallback;
  const clamp = (n,min,max) => Math.min(max,Math.max(min,finite(n,min)));
  const own = (o,k) => !!o && Object.prototype.hasOwnProperty.call(o,k);
  const safeName = n => typeof n === 'string' && n.length > 0 && n.length <= 160 && !['__proto__','prototype','constructor'].includes(n);
  const threshold = p => p.mastery >= 10 ? 0 : 12 + p.mastery * 6 + p.tier * 4;
  const effective = p => p && p.acquired !== false ? p.baseline + p.mastery : 0;
  function track(tier=0,mastery=1) { return {acquired:true,tier,mastery,xp:0,baseline:0,evolutions:[],uses:0}; }
  function normalize(p,realm) {
    p.acquired=p.acquired!==false;
    p.tier=Math.trunc(clamp(p.tier,0,realm));
    p.mastery=Math.trunc(clamp(p.mastery,1,10));
    p.baseline=clamp(p.baseline,0,72);
    p.evolutions=Array.isArray(p.evolutions)?p.evolutions.slice(-8):[];
    p.uses=Math.trunc(clamp(p.uses,0,1e9));
    p.xp=p.mastery===10?0:clamp(p.xp,0,threshold(p)-1);
    return p;
  }
  function sync(entry,kind,name,art) {
    const p=entry.progress;
    if(kind==='art') { entry.mastery=effective(p)*8; entry.rank=p.mastery===10?'Mastered':p.mastery>=7?'Adept':p.mastery>=4?'Practiced':'Learning'; }
    else if(kind==='technique') { art.proficiency[name]=effective(p)*8; }
    else { entry.v=effective(p); entry.xp=p.xp; }
  }
  function initialize(player) {
    if(!player || typeof player!=='object') throw new TypeError('A player state is required.');
    player.realm=Math.trunc(clamp(player.realm,0,REALMS.length-1));
    player.realmXP=clamp(player.realmXP,0,THRESHOLDS.at(-1));
    player.cultivation??={};
    const c=player.cultivation;
    c.foundation=clamp(c.foundation??50,0,100);c.stability=clamp(c.stability??100,0,100);c.deviation=clamp(c.deviation,0,100);
    c.insight=player.realmXP;c.realm=REALMS[player.realm];
    const ledger=player.progression??={version:1,highWater:0,issued:0,receipts:[],repetition:[],acceptedUses:0};
    ledger.version=1;ledger.highWater=Math.max(0,Math.trunc(finite(ledger.highWater)));ledger.issued=Math.max(ledger.highWater,Math.trunc(finite(ledger.issued)));
    ledger.receipts=Array.isArray(ledger.receipts)?ledger.receipts.slice(-192):[];
    ledger.repetition=Array.isArray(ledger.repetition)?ledger.repetition.slice(-192):[];
    ledger.acceptedUses=Math.max(0,Math.trunc(finite(ledger.acceptedUses)));
    for(const [kind,key] of [['skill','skills'],['life','lifeSkills']]) {
      player[key]??={};
      for(const [name,entry] of Object.entries(player[key])) {
        if(!entry || typeof entry!=='object' || !safeName(name))continue;
        if(!entry.progress){entry.progress=track(player.realm,Math.trunc(clamp(entry.v||1,1,10)));entry.progress.acquired=entry.v!==0;}
        normalize(entry.progress,player.realm);sync(entry,kind,name);
      }
    }
    player.arts??={};
    for(const [name,art] of Object.entries(player.arts)) {
      if(!art || typeof art!=='object' || !safeName(name))continue;
      art.tech=Array.isArray(art.tech)?[...new Set(art.tech.filter(safeName))]:[];
      art.proficiency??={};art.techniqueProgress??={};
      art.progress??=track(player.realm);normalize(art.progress,player.realm);sync(art,'art',name);
      for(const tech of art.tech) {
        let entry=art.techniqueProgress[tech]??={progress:track(player.realm)};
        entry.progress??=track(player.realm);normalize(entry.progress,player.realm);sync(entry,'technique',tech,art);
      }
    }
    return ledger;
  }
  function lookup(player,kind,name,artName) {
    if(!KINDS.has(kind)||!safeName(name))return null;
    if(kind==='technique') {
      let art=artName&&own(player.arts,artName)?player.arts[artName]:Object.values(player.arts||{}).find(a=>a.tech?.includes(name));
      return art?.tech?.includes(name)&&own(art.techniqueProgress,name)?{entry:art.techniqueProgress[name],art}:null;
    }
    const dict=kind==='skill'?player.skills:kind==='life'?player.lifeSkills:player.arts;
    return own(dict,name)?{entry:dict[name]}:null;
  }
  function get(player,kind,name,artName) {
    initialize(player);const found=lookup(player,kind,name,artName),p=found?.entry?.progress;
    if(!p||!p.acquired)return {acquired:false,name,label:'Unlearned',mastery:null,tier:null,xp:0,need:0,effective:0,eligible:false};
    return {acquired:true,name,mastery:p.mastery,tier:p.tier,realm:REALMS[p.tier],xp:p.xp,need:threshold(p),effective:effective(p),mastered:p.mastery===10,eligible:p.mastery===10&&p.tier<player.realm,evolutions:p.evolutions.slice(),label:`${REALMS[p.tier]} · ${p.mastery}/10`,next:p.mastery===10?(p.tier<player.realm?'Transcend into the next realm form.':'Mastered here. Advance your martial realm to evolve this skill.'):'Relevant resolved use improves reliability and control.'};
  }
  function acquire(player,kind,name,options={}) {
    initialize(player);if(!KINDS.has(kind)||!safeName(name))return {ok:false,reason:'Unknown skill type or name.'};
    let found=lookup(player,kind,name,options.art);
    if(found?.entry?.progress?.acquired)return {ok:false,reason:'Already learned.'};
    const p=track(player.realm);p.source=String(options.source||'Discovery').slice(0,120);
    if(kind==='technique') {
      if(!safeName(options.art)||!own(player.arts,options.art))return {ok:false,reason:'A learned parent art is required.'};
      const a=player.arts[options.art];if(!a.tech.includes(name))a.tech.push(name);a.techniqueProgress[name]={progress:p};sync(a.techniqueProgress[name],kind,name,a);
    }else if(kind==='art') {
      player.arts[name]={progress:p,mastery:8,rank:'Learning',tech:[],proficiency:{},techniqueProgress:{},mutations:{},insights:[]};
    }else {
      const dict=kind==='skill'?player.skills:player.lifeSkills;dict[name]={...(found?.entry||{}),progress:p,v:1,xp:0};
    }
    return {ok:true,...get(player,kind,name,options.art)};
  }
  function nextSerial(player) { const l=initialize(player);return Math.max(l.issued,l.highWater)+1; }
  function validEvent(event) {
    return event && safeName(event.id) && Number.isSafeInteger(event.serial) && event.serial>0;
  }
  function begin(player,event) {
    const current=active.get(player);
    if(current){current.depth++;return {ok:true,nested:true,id:current.event.id,serial:current.event.serial};}
    const l=initialize(player);
    if(!validEvent(event))return {ok:false,reason:'A stable action ID and positive monotonic serial are required.'};
    if(event.serial<=l.highWater||l.receipts.some(r=>r.id===event.id))return {ok:false,duplicate:true,reason:'This action was already processed.'};
    l.issued=Math.max(l.issued,event.serial);
    active.set(player,{event:{...event},uses:new Map(),depth:1});
    return {ok:true,id:event.id,serial:event.serial};
  }
  function award(player,kind,name,amount,options={}) {
    const tx=active.get(player);
    if(!tx)return {ok:false,reason:'No active mechanical action. Text, menu clicks and idle time do not grant mastery.'};
    if(!KINDS.has(kind)||!safeName(name)||!Number.isFinite(amount)||amount<=0)return {ok:false,reason:'Invalid use award.'};
    const key=JSON.stringify([kind,name,options.art||'']);
    const prior=tx.uses.get(key)||{kind,name,art:options.art,amount:0};
    prior.amount=Math.min(30,prior.amount+amount);tx.uses.set(key,prior);
    return {ok:true,staged:true};
  }
  function cancel(player) { const had=active.has(player);active.delete(player);return {ok:had,cancelled:true}; }
  function end(player,outcome={}) {
    const tx=active.get(player);if(!tx)return {ok:false,reason:'No active mechanical action.'};
    Object.assign(tx.event,outcome);
    if(--tx.depth>0)return {ok:true,deferred:true};
    active.delete(player);return resolveUse(player,tx.event,[...tx.uses.values()]);
  }
  function resolveUse(player,event,uses=[]) {
    const l=initialize(player);
    if(!validEvent(event))return {ok:false,reason:'Invalid mechanical action receipt.'};
    if(event.serial<=l.highWater||l.receipts.some(r=>r.id===event.id))return {ok:false,duplicate:true,reason:'This action was already processed.'};
    if(event.resolved!==true)return {ok:false,reason:'Only resolved mechanics can grant experience.'};
    // Record even a valid zero-reward resolution, so it cannot be retried as a success.
    l.highWater=event.serial;l.issued=Math.max(l.issued,event.serial);
    l.receipts.push({id:event.id,serial:event.serial});l.receipts=l.receipts.slice(-192);
    const contribution=clamp(event.contribution??1,0,1),challenge=clamp(event.challenge??1,0,2);
    if(event.meaningful!==true||!ACTIVITIES.has(event.kind)||!contribution||challenge<.2)return {ok:true,awarded:[],insight:0,reason:'No meaningful resolved challenge.'};
    const day=Math.max(0,Math.trunc(finite(event.day))),signature=String(event.signature||`${event.kind}|${uses.map(u=>u.name).sort().join('|')}`).slice(0,240);
    l.repetition=l.repetition.filter(r=>r.day>=day-1);
    let repeated=l.repetition.find(r=>r.signature===signature&&r.day===day);
    if(!repeated){repeated={signature,day,count:0};l.repetition.push(repeated);l.repetition=l.repetition.slice(-192);}
    const suppression=[1,.55,.25,0][Math.min(3,repeated.count++)];
    const scale=contribution*challenge*(event.success===false?.55:1)*suppression;
    if(!scale)return {ok:true,awarded:[],insight:0,reason:'This approach has taught you all it can today. Try a different challenge.'};
    const merged=new Map();
    for(const u of Array.isArray(uses)?uses:[]) {
      if(!u||!KINDS.has(u.kind)||!safeName(u.name)||!Number.isFinite(u.amount)||u.amount<=0)continue;
      const key=JSON.stringify([u.kind,u.name,u.art||'']),old=merged.get(key);
      merged.set(key,{...u,amount:Math.min(30,(old?.amount||0)+u.amount)});
    }
    const awarded=[];
    for(const u of merged.values()) {
      const found=lookup(player,u.kind,u.name,u.art),p=found?.entry?.progress;
      if(!p?.acquired)continue;
      const xp=Math.min(24,Math.max(0,Math.round(u.amount*scale)));
      if(!xp)continue;
      if(p.mastery===10){awarded.push({kind:u.kind,name:u.name,xp:0,capped:true,mastery:10,tier:p.tier});continue;}
      const before=p.mastery;p.xp+=xp;p.uses++;
      while(p.mastery<10&&p.xp>=threshold(p)){p.xp-=threshold(p);p.mastery++;}
      const discarded=p.mastery===10?p.xp:0;if(p.mastery===10)p.xp=0;
      sync(found.entry,u.kind,u.name,found.art);
      awarded.push({kind:u.kind,name:u.name,xp,mastery:p.mastery,tier:p.tier,levels:p.mastery-before,capped:p.mastery===10,discarded});
    }
    // Insight belongs to the one resolved event, never to every skill or animation frame.
    const insight=Math.max(1,Math.round(2*scale));
    player.realmXP=Math.min(THRESHOLDS.at(-1),player.realmXP+insight);player.cultivation.insight=player.realmXP;
    player.cultivation.foundation=Math.min(100,player.cultivation.foundation+.35*scale);
    l.acceptedUses++;
    return {ok:true,awarded,insight,suppression};
  }
  function breakthroughStatus(player) {
    initialize(player);const r=player.realm,c=player.cultivation,next=REALMS[r+1];
    if(!next)return {ready:false,final:true,current:REALMS[r],next:null,progress:1,requirements:[],risk:'The highest martial realm is already unlocked.'};
    const requirements=[{key:'insight',label:'Cultivation insight',value:player.realmXP,need:THRESHOLDS[r+1],met:player.realmXP>=THRESHOLDS[r+1]},
      {key:'foundation',label:'Foundation',value:c.foundation,need:35+r*6,met:c.foundation>=35+r*6},
      {key:'stability',label:'Stability',value:c.stability,need:55,met:c.stability>=55},
      {key:'deviation',label:'Deviation',value:c.deviation,maximum:25,met:c.deviation<=25}];
    return {ready:requirements.every(q=>q.met),final:false,current:REALMS[r],next,progress:clamp((player.realmXP-THRESHOLDS[r])/(THRESHOLDS[r+1]-THRESHOLDS[r]),0,1),requirements,risk:'No random failure when requirements are met. Foundation falls by 8 and stability by 10; rest restores condition.',effects:'+4 maximum HP, +6 maximum Qi, stronger realm presence, and access to the next tier of mastered skills.'};
  }
  function breakthrough(player,options={}) {
    const status=breakthroughStatus(player);if(!status.ready)return {ok:false,reason:status.final?'Highest realm reached.':'Breakthrough requirements are not yet met.',status};
    const previous=player.realm;player.realm++;player.cultivation.realm=REALMS[player.realm];
    player.cultivation.foundation=Math.max(25,player.cultivation.foundation-8);player.cultivation.stability=Math.max(0,player.cultivation.stability-10);
    player.cultivation.lastBreakthrough=Math.max(0,Math.trunc(finite(options.day)));
    player.maxHp=finite(player.maxHp,100)+4;player.maxQi=finite(player.maxQi,60)+6;
    return {ok:true,previous,current:player.realm,realm:REALMS[player.realm],eligible:summary(player).filter(s=>s.eligible)};
  }
  function transcend(player,kind,name,options={}) {
    initialize(player);const found=lookup(player,kind,name,options.art),p=found?.entry?.progress;
    if(!p?.acquired)return {ok:false,reason:'Learn the skill first.'};
    if(p.mastery!==10)return {ok:false,reason:'Reach mastery 10 in this tier first.'};
    if(p.tier>=player.realm)return {ok:false,reason:'Advance your martial realm before evolving this skill.'};
    const path=options.path||'control';if(!own(PATHS,path))return {ok:false,reason:'Unknown evolution choice.'};
    const before=effective(p),previous=p.tier;p.baseline=before-1;p.tier++;p.mastery=1;p.xp=0;
    p.evolutions.push({from:previous,to:p.tier,path,day:Math.max(0,Math.trunc(finite(options.day))),baseline:before});p.evolutions=p.evolutions.slice(-8);
    sync(found.entry,kind,name,found.art);
    return {ok:true,previous,tier:p.tier,mastery:1,before,effective:effective(p),improvement:PATHS[path]};
  }
  function bonuses(player,kind,name,artName) {
    const s=get(player,kind,name,artName),out={accuracy:0,damage:0,defense:0,qi:0,momentum:0};
    for(const evolution of s.evolutions||[]) {
      if(evolution.path==='control'){out.accuracy++;out.defense++;}
      if(evolution.path==='flowing'){out.qi--;out.momentum++;}
      if(evolution.path==='force')out.damage+=2;
    }
    return out;
  }
  function summary(player) {
    initialize(player);const rows=[];
    for(const [kind,key] of [['skill','skills'],['life','lifeSkills'],['art','arts']])for(const name of Object.keys(player[key]||{}))rows.push({kind,...get(player,kind,name)});
    for(const [art,a] of Object.entries(player.arts||{}))for(const name of a.tech||[])rows.push({kind:'technique',art,...get(player,'technique',name,art)});
    return rows;
  }
  const api={REALMS,THRESHOLDS,PATHS,initialize,acquire,get,summary,threshold,effective,nextSerial,begin,award,end,cancel,resolveUse,breakthroughStatus,breakthrough,transcend,bonuses,realmPower:player=>1+clamp(player.realm,0,8)*.09};
  root.MURIM_PROGRESSION=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
