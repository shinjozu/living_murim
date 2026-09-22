/* The Wanderers' Guild: local contracts, mechanical proof and one-time rewards. */
(function(root){
 'use strict';
 const RANKS=Object.freeze(['F','E','D','C','B','A','S','SS','SSS']);
 const THRESHOLDS=Object.freeze([0,12,32,64,112,180,280,420,600]);
 const DISCOUNTS=Object.freeze([0,.01,.025,.04,.055,.07,.085,.10,.12]);
 const ACCESS=Object.freeze(['Local commissions','Provision rewards','Material commissions','Regional contracts','Trusted commissions','Elite bounties','Rare-material rewards','Senior commissions','Legendary writs']);
 const TYPES=new Set(['explore','travel','social','gather','craft','victory']);
 const safe=v=>typeof v==='string'&&v.length>0&&v.length<=180&&!['__proto__','constructor','prototype'].includes(v);
 const finite=(v,def=0)=>Number.isFinite(Number(v))?Number(v):def;
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,finite(n,a)));
 const hash=s=>{let n=2166136261;for(const c of String(s)){n^=c.charCodeAt(0);n=Math.imul(n,16777619);}return n>>>0;};
 let config={recipes:[],activities:{},items:{}};
 function configure(value={}){config={recipes:Array.isArray(value.recipes)?value.recipes.filter(r=>safe(r.name)&&safe(r.skillName)):[],activities:value.activities||{},items:value.items||{}};return true;}
 function ensure(S){
  if(!S?.player||!S?.world)throw new TypeError('Guild requires a game state.');
  const g=S.player.guild??={version:1,points:0,completed:0,boardDay:0,offers:[],active:[],history:[],receipts:[],highWater:{}};
  g.version=1;g.points=Math.floor(clamp(g.points,0,100000));g.completed=Math.floor(clamp(g.completed,0,100000));g.boardDay=Math.floor(clamp(g.boardDay,0,1e8));
  for(const key of ['offers','active','history','receipts'])if(!Array.isArray(g[key]))g[key]=[];
  g.offers=g.offers.slice(0,6);g.active=g.active.filter(c=>c&&safe(c.id)&&Array.isArray(c.objectives)&&c.objectives.every(o=>TYPES.has(o.kind)&&Number.isInteger(o.need)&&o.need>=1&&o.need<=5)).slice(0,3);
  g.history=g.history.slice(-96);g.receipts=g.receipts.slice(-192);if(!g.highWater||typeof g.highWater!=='object'||Array.isArray(g.highWater))g.highWater={};
  return g;
 }
 function rank(S){const g=S.player.guild||{},points=Math.floor(clamp(g.points,0,100000));let index=0;while(index<8&&points>=THRESHOLDS[index+1])index++;return {name:RANKS[index],index,points,completed:Math.floor(clamp(g.completed,0,100000)),next:RANKS[index+1]||null,need:THRESHOLDS[index+1]??null,discount:DISCOUNTS[index],access:ACCESS[index]};}
 function shopDiscount(S){return rank(S).discount;}
 const quantity=(S,item)=>S.player.inventory?.find(i=>i.name===item)?.qty||0;
 function objective(kind,target,need=1,label=''){return {kind,...target,need,progress:0,proof:[],label};}
 function reward(level,kind,skill,extra={}){return {silver:10+level*4,points:6+Math.floor(level/2),rep:1,insight:2+Math.floor(level/4),skill:skill?{kind:kind==='craft'||kind==='gather'||kind==='travel'?'life':'skill',name:skill,amount:6+Math.min(6,level)}:null,...extra};}
 function board(S){
  const g=ensure(S),day=Math.max(1,Math.floor(finite(S.world.day,1)));if(g.boardDay>=day&&g.offers.length===6)return g.offers;
  const r=rank(S),locations=Object.keys(S.world.locations||{}).filter(safe).sort(),npcs=Object.keys(S.npcs||{}).filter(safe).sort();
  if(locations.length<2)return [];
  const random=(salt,n)=>hash(`${S.seed}|guild|${day}|${salt}`)%n;
  const ordered=locations.slice().sort((a,b)=>hash(`${S.seed}|${day}|${a}`)-hash(`${S.seed}|${day}|${b}`));
  const near=locations.includes(S.world.location)?S.world.location:ordered[0],away=ordered.find(l=>l!==near),region=r.index>=3?'Regional':'Local';
  const make=(i,type,title,description,objectives,rewards,extra={})=>({id:`guild-${S.seed}-${day}-${i}`,type,title,description,rank:r.name,level:r.index,issuedDay:day,objectives,rewards,...extra});
  const survey=ordered.slice(0,r.index>=3?3:2).map(location=>objective('explore',{location},1,`Explore ${location}`));
  const bountyLocation=ordered[random('bounty',ordered.length)],enemy=`${['Ash-Reed','Broken Seal','Red Sash','Iron Thorn'][random('outlaw',4)]} Outlaw ${day}`;
  const available=config.recipes.filter(recipe=>finite(S.player.lifeSkills?.[recipe.skillName]?.v)>=recipe.skill).sort((a,b)=>a.skill-b.skill||a.name.localeCompare(b.name));
  const recipe=available.length?available[random('recipe',Math.min(available.length,3+r.index))]:null;
  const gathering=Object.entries(config.activities).filter(([,a])=>a.where?.some(l=>locations.includes(l))&&a.reward?.length),[activity,activitySpec]=gathering.length?gathering[random('gather',gathering.length)]:['forage',{where:[near],reward:['Wild Herbs'],skill:'Herbalism'}];
  const resource=activitySpec.reward[0],gatherPlace=activitySpec.where.filter(l=>locations.includes(l))[0],units=r.index>=4?3:2;
  const goodwill=npcs.slice().sort((a,b)=>hash(`${S.seed}|${day}|npc|${a}`)-hash(`${S.seed}|${day}|npc|${b}`)).slice(0,2);
  const itemReward=r.index>=6&&config.items['Spiritsteel Fragment']?'Spiritsteel Fragment':r.index>=2&&config.items['Iron Ore']?'Iron Ore':r.index>=1&&config.items['Travel Meal']?'Travel Meal':null;
  const offers=[
   make(0,'survey',`${region} road survey`,'Inspect the named routes yourself. Old discoveries and repeated menu visits are not evidence.',survey,reward(r.index,'explore','Investigation')),
   make(1,'bounty',`Writ: ${enemy}`,`Scout ${bountyLocation}, then pursue the wanted outlaw there. Sparring and unrelated victories do not satisfy this writ.`,[objective('explore',{location:bountyLocation},1,`Scout ${bountyLocation}`),objective('victory',{enemy,location:bountyLocation},1,`Defeat ${enemy}`)],reward(r.index,'victory',null,{silver:18+r.index*5,points:8+Math.floor(r.index/2),rep:2}),{enemy,location:bountyLocation,difficulty:7+r.index*4}),
   recipe?make(2,'commission',`Supply: ${recipe.name}`,`Produce a fresh ${recipe.name} and inspect its destination. The guild receives the item when you claim payment.`,[objective('craft',{item:recipe.name,skill:recipe.skillName},1,`Craft ${recipe.name} after accepting`),objective('explore',{location:recipe.location||near},1,`Inspect ${recipe.location||near}`)],reward(r.index,'craft',recipe.skillName,{silver:Math.min(140,Math.max(18,(recipe.cost||0)+12+Object.values(recipe.mats||{}).reduce((n,x)=>n+x,0)*3+r.index*3))}),{delivery:{name:recipe.name,qty:1}}):make(2,'survey','Wayfarer observations','Bring observations from two different places.',[objective('explore',{location:near},1,`Explore ${near}`),objective('explore',{location:away},1,`Explore ${away}`)],reward(r.index,'explore','Investigation')),
   make(3,'supply',`Field supplies: ${resource}`,`Gather ${resource} through ${activity} at ${gatherPlace}, on ${units} separate days. Deliver those supplies to claim payment. Purchases do not count.`,[objective('gather',{item:resource,activity,location:gatherPlace},units,`Gather ${resource} on ${units} separate days at ${gatherPlace}`)],reward(r.index,'gather',activitySpec.skill,{silver:14+r.index*4}),{delivery:{name:resource,qty:units}}),
   make(4,'goodwill','A reputation earned in person','Improve your relationship with each named person through a meaningful interaction. Merely opening dialogue earns no proof.',goodwill.map(npcId=>objective('social',{npcId},1,`Build trust or respect with ${S.npcs[npcId].name}`)),reward(r.index,'social','Persuasion')),
   make(5,'courier',`${region} courier circuit`,'Carry the sealed guild correspondence to each destination. Arrivals after accepting are recorded automatically.',ordered.filter(l=>l!==near).slice(0,r.index>=3?3:2).map(location=>objective('travel',{location},1,`Arrive at ${location}`)),reward(r.index,'travel','Navigation',{item:itemReward?{name:itemReward,qty:1}:null}))
  ];
  // Small custom worlds still receive completable local contracts.
  if(!goodwill.length)offers[4]=make(4,'survey','Quiet roads survey','Inspect two different routes.',survey.map(o=>({...o,proof:[]})),reward(r.index,'explore','Investigation'));
  g.boardDay=day;g.offers=offers;return offers;
 }
 function accept(S,id){const g=ensure(S),offer=board(S).find(o=>o.id===id);if(!offer)return {ok:false,reason:'That offer is no longer on today’s board.'};if(g.active.length>=3)return {ok:false,reason:'Finish or abandon a contract first; three may be active.'};if(g.active.some(c=>c.id===id)||g.history.some(c=>c.id===id))return {ok:false,reason:'This contract was already accepted or closed.'};const c=JSON.parse(JSON.stringify(offer));c.acceptedSerial=Math.floor(finite(S.actionNo));c.acceptedDay=S.world.day;c.status='active';g.active.push(c);return {ok:true,contract:c};}
 function abandon(S,id){const g=ensure(S),at=g.active.findIndex(c=>c.id===id);if(at<0)return {ok:false,reason:'No active contract.'};const c=g.active.splice(at,1)[0];g.history.push({id,title:c.title,status:'abandoned',day:S.world.day});return {ok:true};}
 function snapshot(S){if(!S.player.guild?.active?.length)return null;return {actionNo:S.actionNo,location:S.world.location,explored:Object.fromEntries(Object.entries(S.world.locations||{}).map(([id,l])=>[id,l.exploreCount||0])),inventory:Object.fromEntries((S.player.inventory||[]).map(i=>[i.name,i.qty])),relations:Object.fromEntries(Object.entries(S.npcs||{}).map(([id,n])=>[id,{trust:n.trust||0,respect:n.respect||0,bond:n.bond||0}])),victories:S.player.victories||0};}
 function observe(S,event={}){
  if(!S.player.guild?.active?.length)return {ok:true,advanced:[]};const g=ensure(S);
  if(!safe(event.id)||!Number.isSafeInteger(event.serial)||event.serial!==S.actionNo||event.serial<1||event.meaningful!==true||event.success!==true)return {ok:false,reason:'Only a new successful resolved action can supply proof.'};
  const before=event.before,proof=[];
  if(before&&event.serial>before.actionNo){
   if(before.location!==S.world.location)proof.push({kind:'travel',location:S.world.location});
   for(const [location,l]of Object.entries(S.world.locations||{}))if(l.exploreCount>(before.explored?.[location]||0))proof.push({kind:'explore',location});
   if(event.kind==='social')for(const [npcId,n]of Object.entries(S.npcs||{})){const old=before.relations?.[npcId];if(old&&(n.trust>old.trust||n.respect>old.respect||n.bond>old.bond))proof.push({kind:'social',npcId});}
   for(const item of S.player.inventory||[])if(item.qty>(before.inventory?.[item.name]||0)){
    const signature=String(event.signature||''),activity=Object.keys(config.activities).find(a=>signature===`Life activity: ${a}`);
    if(activity&&config.activities[activity].reward.includes(item.name))proof.push({kind:'gather',item:item.name,activity,location:before.location});
    const recipe=config.recipes.find(r=>r.name===item.name);if(recipe&&/^(Craft |Brew )/.test(signature))proof.push({kind:'craft',item:item.name,skill:recipe.skillName});
   }
  }
  // These two explicit receipts originate only in the actual craft/combat resolvers.
  if(event.kind==='craft'&&safe(event.item)&&quantity(S,event.item)>0&&config.recipes.some(r=>r.name===event.item&&r.skillName===event.skill))proof.push({kind:'craft',item:event.item,skill:event.skill});
  if(event.kind==='victory'&&event.contractId&&safe(event.enemy)&&event.won===true&&!S.combat&&before&&(S.player.victories||0)>before.victories)proof.push({kind:'victory',enemy:event.enemy,location:event.location,contractId:event.contractId});
  const advanced=[];
  for(const p of proof){const key=`${p.kind}:${event.serial}`;if(g.receipts.includes(key)||event.serial<=finite(g.highWater[p.kind]))continue;g.receipts.push(key);g.highWater[p.kind]=event.serial;
   for(const c of g.active){if(event.serial<=c.acceptedSerial||p.contractId&&p.contractId!==c.id)continue;for(const o of c.objectives){if(o.progress>=o.need||o.kind!==p.kind||['location','item','activity','npcId','enemy','skill'].some(k=>o[k]&&o[k]!==p[k]))continue;const stamp=`${S.world.day}|${p.location||''}|${p.npcId||''}|${p.item||''}`;o.proof??=[];if(o.proof.includes(stamp))continue;o.proof.push(stamp);o.progress++;advanced.push({id:c.id,title:c.title,label:o.label,progress:o.progress,need:o.need});}c.status=c.objectives.every(o=>o.progress>=o.need)?'complete':'active';}
  }
  g.receipts=g.receipts.slice(-192);return {ok:true,advanced};
 }
 function claimStatus(S,id){const c=ensure(S).active.find(c=>c.id===id);if(!c)return {ok:false,reason:'No active contract.'};if(!c.objectives.length||!c.objectives.every(o=>o.progress>=o.need&&Array.isArray(o.proof)&&o.proof.length>=o.need))return {ok:false,reason:'The contract still needs verified action proof.'};if(c.delivery){if(quantity(S,c.delivery.name)<c.delivery.qty)return {ok:false,reason:`Keep ${c.delivery.qty} ${c.delivery.name} to deliver.`};const itemId=root.MURIM_EQUIPMENT?.itemId(c.delivery.name)||config.items[c.delivery.name]?.id||c.delivery.name;if(Object.values(S.player.equipment||{}).some(value=>value===c.delivery.name||value===itemId))return {ok:false,reason:'Unequip the commissioned item before delivering it.'};}return {ok:true,contract:c};}
 function claim(S,id,options={}){
  const eligible=claimStatus(S,id);if(!eligible.ok)return eligible;const P=options.progression||root.MURIM_PROGRESSION;if(!P?.resolveUse)return {ok:false,reason:'The progression engine is unavailable.'};
  const c=eligible.contract,g=ensure(S),beforeRank=rank(S),r=c.rewards,skill=r.skill&&P.get(S.player,r.skill.kind,r.skill.name).acquired?r.skill:null;
  const xp=P.resolveUse(S.player,{id:`guild-reward:${id}`,serial:P.nextSerial(S.player),day:S.world.day,kind:'quest',signature:`guild:${id}`,resolved:true,meaningful:true,success:true,challenge:clamp(r.insight/2,1,2),contribution:1},skill?[{kind:skill.kind,name:skill.name,amount:clamp(skill.amount,1,12)}]:[]);
  if(!xp.ok)return {ok:false,reason:xp.reason};
  if(c.delivery){if(root.MURIM_EQUIPMENT)root.MURIM_EQUIPMENT.consume(S.player,c.delivery.name,c.delivery.qty);else S.player.inventory.find(i=>i.name===c.delivery.name).qty-=c.delivery.qty;}
  const silver=Math.floor(clamp(r.silver,0,140));S.player.silver=Math.max(0,finite(S.player.silver))+silver;S.player.rep=Math.min(100,Math.max(0,finite(S.player.rep))+clamp(r.rep,0,2));
  if(r.item&&safe(r.item.name)&&config.items[r.item.name]){const qty=Math.floor(clamp(r.item.qty,1,2));if(root.MURIM_EQUIPMENT)root.MURIM_EQUIPMENT.acquire(S.player,r.item.name,qty,config.items[r.item.name].type);else{let item=S.player.inventory.find(i=>i.name===r.item.name);if(!item){item={name:r.item.name,type:config.items[r.item.name].type||'Material',qty:0};S.player.inventory.push(item);}item.qty+=qty;}}
  g.points+=Math.floor(clamp(r.points,1,12));g.completed++;S.actionNo=Math.floor(finite(S.actionNo))+1;g.active=g.active.filter(x=>x.id!==id);g.history.push({id,title:c.title,status:'claimed',day:S.world.day,silver,rankPoints:r.points});g.history=g.history.slice(-96);
  const afterRank=rank(S);return {ok:true,title:c.title,silver,xp,item:r.item||null,rank:afterRank,promoted:afterRank.index>beforeRank.index,points:r.points};
 }
 function bounty(S,id){const c=ensure(S).active.find(c=>c.id===id);if(!c||c.type!=='bounty')return {ok:false,reason:'Accept an active bounty first.'};if(S.combat)return {ok:false,reason:'Finish the current combat first.'};if(c.objectives.find(o=>o.kind==='victory')?.progress)return {ok:false,reason:'This outlaw was already defeated.'};if(S.world.location!==c.location)return {ok:false,reason:`Travel to ${c.location} first.`};if(!c.objectives.filter(o=>o.kind==='explore').every(o=>o.progress>=o.need))return {ok:false,reason:'Explore the area first to locate the outlaw.'};return {ok:true,enemy:c.enemy,difficulty:c.difficulty,location:c.location,contractId:c.id};}
 const api=Object.freeze({version:1,RANKS,THRESHOLDS,configure,ensure,rank,shopDiscount,board,accept,abandon,snapshot,observe,claimStatus,claim,bounty});root.MURIM_GUILD=api;if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
