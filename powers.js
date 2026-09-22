/* Living Murim — authoritative fate actions. No DOM, random rewards, or experience grants. */
(function (root) {
  'use strict';
  const VERSION = 1;
  const bounded = (value, low, high) => Math.max(low, Math.min(high, Number.isFinite(Number(value)) ? Number(value) : low));
  const integer = value => Math.floor(bounded(value, 0, Number.MAX_SAFE_INTEGER));
  const own = (object, key) => Object.prototype.hasOwnProperty.call(object || {}, key);
  const definitions = [
    ['truth-sight','Unique Power','Eye of Truth','Unveil the Flow',8,3,2,['combat','exploration','medicine'],'Expose a combat opening for two exchanges; elsewhere prepare one careful investigation or treatment.','Reveals a useful weakness, never another person’s unspoken thoughts.'],
    ['devour-essence','Unique Power','Martial Devourer','Draw the Broken Current',12,5,5,['combat'],'Siphon a wounded opponent’s qi into a bounded strike and recover part of the damage as health.','Only below half enemy health; +3 corruption. Does not steal a learned technique.'],
    ['archive-pattern','Unique Power','Heavenly Archive','Compare a Remembered Pattern',9,4,2,['combat','craft','exploration'],'Read an enemy pattern to cushion two exchanges, or prepare a precise craft or investigation.','Only uses observed patterns. Does not unlock techniques or create knowledge rewards.'],
    ['nine-breaths','Unique Power','Nine-Breath Reversal','Nine-Breath Reversal',18,8,12,['combat'],'Restore up to 30 + 3 per realm HP, limited by health at combat entry.','Once per encounter; Soul Strain. Enemy wounds, spent qi and prior rewards are never rewound.'],
    ['karmic-balance','Unique Power','Karmic Sovereign','Settle a Karmic Thread',10,5,2,['combat','social'],'Turn a hostile opening into a guarded response, or honestly settle one debt or grievance.','Social use needs a present NPC with an existing debt or grievance; cannot compel affection.'],
    ['assimilate-form','Unique Power','Infinite Assimilation','Assimilate a Survived Form',14,5,6,['combat'],'After taking a hit, borrow one counter-form from this opponent for three exchanges.','+2 corruption. At most three recorded forms; no permanent stacking of raw stats.'],
    ['meridian-flow','Ability','Perfect Meridians','Open the Clear Circuit',6,5,4,['combat','medicine'],'Recover 20 qi in combat, or ready precise circulation for the next real treatment.','An exposed breathing action: the opponent can answer it. Cannot be used at full qi in combat.'],
    ['sword-heart','Ability','Sword Heart','Heart Before the Blade',14,4,3,['combat','exploration'],'A precise sword strike breaks a guarding line; outside combat read a difficult route.','Requires an equipped weapon in combat. A missed opening cannot grant sword experience.'],
    ['demon-marrow','Ability','Heavenly Demon Physique','Crimson Marrow Guard',10,5,5,['combat','exploration'],'Trade 6 HP for a body strike and two exchanges of protection; brace for hazardous exploration.','The 6 HP cost cannot kill you. Fatigue and incoming wounds still matter.'],
    ['myriad-principles','Ability','Ten Thousand Arts','Join Two Principles',12,4,3,['combat','craft','medicine'],'Blend two observed approaches into a flexible strike, or prepare one careful craft or treatment.','Combat requires two different moves in your recent history. Does not copy locked techniques.'],
    ['formation-mind','Ability','Divine Formation Mind','Anchor the Living Formation',12,5,4,['combat','craft','exploration'],'Anchor two exchanges of defense and expose a line; prepare an exact craft or route survey.','Useful in the current encounter only. An anchored formation cannot travel with you.'],
    ['evolution-response','Ability','Limitless Evolution','Answer the Scar',8,5,3,['combat','medicine','exploration'],'Respond to an actual wound with controlled healing and temporary protection.','Requires current missing HP or an injury. Repeating an easy action never produces permanent stat growth.'],
    ['yang-flare','Affinity','Flame Yang','Cinder Lotus',12,3,4,['combat','craft'],'A hot strike scorches for two exchanges; prepare a controlled forge heat for the next craft.','Forceful and tiring. Scorch is capped, does not stack, and ends with the encounter.'],
    ['yin-mirror','Affinity','Glacial Yin','Still Lake Mirror',11,3,2,['combat','medicine','exploration'],'A measured frost strike softens two enemy answers; prepare a calm treatment or traversal.','Less immediate force than fire. Its chill never permanently disables an opponent.'],
    ['lightning-thread','Affinity','Heavenly Lightning','Heaven-Splitting Thread',15,4,6,['combat','exploration'],'A fast piercing discharge punishes an exposed enemy; prepare a quick route crossing.','Highest immediate force, highest fatigue; offers little sustained defense.'],
    ['wood-renewal','Affinity','Venomous Wood','Root and Thorn',12,4,2,['combat','medicine','craft'],'Seed a three-exchange toxin and recover a little health; prepare living-fiber craft or medicine.','Toxin does not stack. Healing stays within max HP and never invents ingredients.'],
    ['void-step','Affinity','Void','Hollow Between Steps',14,4,3,['combat','exploration','social'],'A light strike slips one enemy answer; prepare a discreet crossing or measured conversation.','Evasion lasts one exchange and never guarantees a successful social outcome.'],
    ['chaos-wheel','Affinity','Primordial Chaos','Wheel Before Division',13,4,5,['combat','craft','exploration'],'Cycle between force, guard and flowing recovery; prepare one adaptable craft or route.','The cycle is visible and deterministic. +1 corruption when used; no limitless damage multiplier.']
  ];
  const catalog = Object.freeze(definitions.map(([id,category,fate,name,qi,cooldown,fatigue,domains,effect,tradeoff]) => Object.freeze({id,category,fate,name,qi,cooldown,fatigue,domains:Object.freeze(domains),effect,tradeoff})));
  const byId = Object.freeze(Object.fromEntries(catalog.map(action => [action.id, action])));
  const affinities = Object.freeze({
    'Flame Yang': {element:'fire',attack:'Scorch',combat:'Qi hits add 2 damage; an active Cinder Lotus burns for two exchanges.',utility:'Controlled forge heat improves the next completed gear craft by one grade.'},
    'Glacial Yin': {element:'ice',attack:'Chill',combat:'Qi hits add 1 damage and soften that answer by 2.',utility:'A prepared treatment restores 8 extra HP; careful exploration saves fatigue.'},
    'Heavenly Lightning': {element:'lightning',attack:'Pierce',combat:'Qi hits add 4 damage, or 6 against a guard, at 1 extra fatigue.',utility:'A prepared crossing reduces fatigue and builds familiarity with the current route.'},
    'Venomous Wood': {element:'wood',attack:'Leech',combat:'Qi hits add 1 damage and restore up to 2 HP after the exchange.',utility:'A prepared treatment restores 10 HP and removes one actual poison injury.'},
    'Void': {element:'void',attack:'Slip',combat:'Qi hits bypass a guard for 3 extra damage; movement avoids 2 incoming damage.',utility:'Discreet routes lower heat; respectful conversation adds at most one trust.'},
    'Primordial Chaos': {element:'chaos',attack:'Cycle',combat:'Qi alternates +3 force, 3 protection, then 2 force with 2 qi recovery.',utility:'Adaptable preparation improves one craft or conserves effort on a real route.'}
  });
  const abilities = Object.freeze({
    'Perfect Meridians':'A resolved qi attack refunds 1 qi; clear circulation is an explicit breathing action.',
    'Sword Heart':'A landed sword exchange adds 2 force, or 3 against a guard.',
    'Heavenly Demon Physique':'Resolved unarmed hits add 2 force; defense absorbs 1 more damage.',
    'Ten Thousand Arts':'Changing between two actual combat modes adds 2 force once per exchange.',
    'Divine Formation Mind':'Resolved defensive exchanges absorb 2 damage and retain 1 momentum, capped at 3.',
    'Limitless Evolution':'Below half health, a resolved guard absorbs 2 extra damage; scars never create uncapped raw stats.'
  });
  const races = Object.freeze({
    Human:'A varied approach cushions 1 damage after a different combat mode.',
    'Spirit-Blooded':'Actual qi attacks refund 1 qi; spiritual sensitivity does not grant secret knowledge.',
    Demonkin:'Below half health, a landed unarmed attack restores 2 HP.',
    'Azure Dragonkin':'Landed unarmed attacks add 1 damage; physical defense absorbs 1.',
    'Celestial Descendant':'A resolved defensive response lowers fatigue by 1.',
    'Primordial Chaosborn':'A chaos recovery phase restores 1 additional qi.'
  });

  function ensure(state) {
    if (!state || !state.player || !state.world) throw new TypeError('A game state with player and world is required.');
    const player = state.player;
    if (!player.powers || typeof player.powers !== 'object' || Array.isArray(player.powers)) player.powers = {};
    const value = player.powers;
    value.version = VERSION;
    value.readyAt ??= {};
    value.last ??= {activation:-1,combat:-1,use:-1};
    value.forms = Array.isArray(value.forms) ? value.forms.filter(x=>['iron','mirror','step'].includes(x)).slice(0,3) : [];
    value.cycle = integer(value.cycle) % 3;
    value.history = Array.isArray(value.history) ? value.history.slice(-16) : [];
    return value;
  }
  function clock(state) { return Math.max(0,(integer(state.world?.day)-1)*4+integer(state.world?.phase)); }
  function getDomain(state, context={}) { return context.domain || (state.combat ? 'combat' : 'exploration'); }
  function getNpc(state, context) { const id=context.npcId || state.scene?.npc; return id && own(state.npcs,id) ? state.npcs[id] : null; }
  function missingHealth(state) { const p=state.player,c=state.combat; return Math.max(0,p.maxHp-(c ? c.playerHp : p.hp)); }
  function combatEffects(state) { state.combat.powerEffects ??= {}; return state.combat.powerEffects; }
  function setEffect(state,name,amount,turns) { combatEffects(state)[name] = {amount,turns}; }
  function sequence(context) { const value=Number(context.eventId); return Number.isSafeInteger(value) && value>=0 ? value : -1; }
  function check(state, id, context={}) {
    const action = byId[id];
    if (!action) return {ok:false,reason:'Unknown fate action.'};
    if (state.player?.fates?.[action.category] !== action.fate) return {ok:false,reason:'This fate is not part of your character.'};
    const domain=getDomain(state,context), c=state.combat,p=state.player;
    if (!action.domains.includes(domain)) return {ok:false,reason:'This power has no safe application here.'};
    if ((domain==='combat') !== !!c) return {ok:false,reason:c?'Finish the encounter before using this elsewhere.':'This action needs a real opponent.'};
    if(c && (c.pendingResult!=null || c.playerHp<=0 || c.enemyHp<=0))return {ok:false,reason:'This encounter is already decided.'};
    const remaining=Math.max(0,integer(p.powers?.readyAt?.[id])-clock(state));
    if(remaining) return {ok:false,reason:`Recover for ${remaining} world phase${remaining===1?'':'s'} before using this again.`,remaining};
    if(p.qi<action.qi) return {ok:false,reason:`Requires ${action.qi} qi.`};
    if((p.fatigue||0)+action.fatigue>100) return {ok:false,reason:'Rest before pushing your body this far.'};
    if(id==='nine-breaths' && (c.reversed || c.playerHp>=Math.min(p.maxHp,c.openingHp)))return {ok:false,reason:c.reversed?'Nine-Breath Reversal has already been used in this encounter.':'No lost health from this encounter can be restored.'};
    if(id==='devour-essence' && c.enemyHp>(c.enemyMaxHp || c.openingEnemyHp || c.enemyHp)/2)return {ok:false,reason:'Their current is intact. First reduce the opponent below half health.'};
    if(id==='sword-heart' && domain==='combat' && !p.equipment?.weapon)return {ok:false,reason:'Equip a weapon before calling on Sword Heart.'};
    if(id==='demon-marrow' && (c?c.playerHp:p.hp)<=6)return {ok:false,reason:'The marrow cost would leave you unable to stand.'};
    if(id==='meridian-flow' && domain==='combat' && p.qi>=p.maxQi)return {ok:false,reason:'Your qi channels are already full.'};
    if(id==='myriad-principles' && domain==='combat' && new Set(c.playerMoveHistory||[]).size<2)return {ok:false,reason:'Resolve two different combat approaches before joining their principles.'};
    if(id==='assimilate-form' && c.playerHp>=Math.min(p.maxHp,c.openingHp))return {ok:false,reason:'You must first survive a real wound from this opponent.'};
    if(id==='evolution-response' && !missingHealth(state) && !(p.injuries||[]).length)return {ok:false,reason:'There is no current wound or injury to adapt around.'};
    if(domain==='social') {
      const npc=getNpc(state,context);
      if(!npc || npc.location!==state.world.location)return {ok:false,reason:'Speak with someone present at your location.'};
      if(id==='karmic-balance' && !(npc.debt>0 || npc.grudge>0))return {ok:false,reason:'There is no existing debt or grievance to settle.'};
    }
    return {ok:true,reason:'Ready',domain};
  }
  function list(state,context={}) { return catalog.filter(x=>state.player?.fates?.[x.category]===x.fate).map(x=>({...x,...check(state,x.id,context)})); }
  function addHistory(state,id,text) { const powers=ensure(state);powers.history.push({id,day:integer(state.world.day),phase:integer(state.world.phase),text});powers.history=powers.history.slice(-16); }
  function heal(state,amount) {const p=state.player,c=state.combat,key=c?'playerHp':'hp',target=c||p;const before=target[key];target[key]=Math.min(p.maxHp,before+amount);return target[key]-before;}
  function recoverQi(state,amount) {const p=state.player,before=p.qi;p.qi=Math.min(p.maxQi,p.qi+amount);return p.qi-before;}
  function fatigue(state,amount) {const p=state.player,before=p.fatigue||0;p.fatigue=bounded(before+amount,0,100);return p.fatigue-before;}
  function corruption(state,amount) {state.player.corruption=bounded((state.player.corruption||0)+amount,0,100);}
  function memory(state,npc,text) {npc.memory=Array.isArray(npc.memory)?npc.memory:[];npc.memory.unshift(`Day ${state.world.day}: ${text}`);npc.memory=npc.memory.slice(0,24);}

  function activate(state,id,context={}) {
    const eligibility=check(state,id,context);
    if(!eligibility.ok)return {...eligibility,id};
    const eventId=sequence(context),powers=ensure(state);
    if(eventId!==integer(state.actionNo)+1 || eventId<=powers.last.activation)return {ok:false,id,reason:'That action has already resolved or is no longer current.'};
    const action=byId[id],p=state.player,c=state.combat,domain=eligibility.domain,scale=Math.min(8,integer(p.realm));
    p.qi-=action.qi;fatigue(state,action.fatigue);powers.readyAt[id]=clock(state)+action.cooldown;powers.last.activation=eventId;state.actionNo=eventId;
    let text='',damage=0,healed=0,ward=0,qi=0,extra='',playerDamage=0,playerHpAfterAnswer=null;
    const priorEffects=c?{...c.powerEffects}:{};
    if(domain==='combat') {
      if(id==='truth-sight'){setEffect(state,'exposed',4,2);ward=3;text='Your gaze follows the real current. Two vulnerable lines remain exposed.';}
      if(id==='devour-essence'){damage=10+scale*2;healed=heal(state,Math.min(12,Math.floor(damage/2)));corruption(state,3);text=`A broken current feeds your own. ${healed} HP returns, but corruption deepens.`;}
      if(id==='archive-pattern'){setEffect(state,'ward',4,2);ward=4;text='A remembered pattern meets the opponent’s intent. Two answers will meet a prepared defense.';}
      if(id==='nine-breaths'){const ceiling=Math.min(p.maxHp,c.openingHp);healed=heal(state,Math.min(30+scale*3,ceiling-c.playerHp));c.reversed=true;p.injuries??=[];if(!p.injuries.some(x=>x.name==='Soul Strain'))p.injuries.push({name:'Soul Strain',severity:'Minor',day:state.world.day});ward=4;text=`Nine breaths fold inward. ${healed} HP returns; the enemy’s wounds remain and Soul Strain settles in your channels.`;}
      if(id==='karmic-balance'){ward=8;setEffect(state,'exposed',3,1);text='You yield the expected line and let hostile intent spend itself. One answering opening remains.';}
      if(id==='assimilate-form'){const form=c.style==='Aggressive'?'iron':c.style==='Patient'?'mirror':'step';if(!powers.forms.includes(form))powers.forms.push(form);powers.forms=powers.forms.slice(-3);setEffect(state,'adaptation',form==='iron'?4:3,3);if(form==='step')setEffect(state,'exposed',2,2);ward=3;corruption(state,2);text=`The survived ${form} pattern becomes a temporary counter-form. Corruption rises with the borrowed strain.`;}
      if(id==='meridian-flow'){qi=recoverQi(state,20);text=`The clear circuit recovers ${qi} qi. Your opponent can still interrupt the breathing exchange.`;}
      if(id==='sword-heart'){damage=14+scale*2+(c.style==='Patient'?5:0);ward=1;text='Your heart finds the hesitation before the blade follows. A guarding stance cannot hide the line.';}
      if(id==='demon-marrow'){c.playerHp-=6;damage=11+scale;ward=5;setEffect(state,'ward',4,2);text='Six HP kindles the marrow. Your body drives forward behind a crimson guard.';}
      if(id==='myriad-principles'){damage=12+scale*2;ward=3;setEffect(state,'exposed',2,1);text='Two approaches become one adaptable exchange. Their lesson creates an opening, not a stolen technique.';}
      if(id==='formation-mind'){ward=6;setEffect(state,'ward',4,2);setEffect(state,'exposed',3,2);text='Three points of pressure anchor the ground. Your defense and the next two lines become clearer.';}
      if(id==='evolution-response'){healed=heal(state,8+scale);ward=4;setEffect(state,'adaptation',3,2);text=`You work around the wound instead of denying it. ${healed} HP returns with a temporary adaptation.`;}
      if(id==='yang-flare'){damage=12+scale*2;setEffect(state,'scorch',3,2);text='Cinder Lotus opens along the striking line. Its ember pressure lasts two exchanges.';}
      if(id==='yin-mirror'){damage=9+scale;ward=4;setEffect(state,'chill',3,2);text='A still frost line crosses the battlefield. The next two enemy answers lose force.';}
      if(id==='lightning-thread'){damage=18+scale*2;ward=1;text='A single lightning thread pierces the interval between defense and movement.';}
      if(id==='wood-renewal'){damage=7+scale;healed=heal(state,5);setEffect(state,'poison',3,3);text=`Root and Thorn marks the current with a three-exchange toxin. ${healed} HP returns.`;}
      if(id==='void-step'){damage=8+scale;ward=100;setEffect(state,'exposed',2,1);text='A hollow step leaves the enemy answering empty space. You cross the opening with a light strike.';}
      if(id==='chaos-wheel'){const phase=powers.cycle++%3;powers.cycle%=3;corruption(state,1);if(phase===0){damage=17+scale*2;text='The wheel opens as force: an undivided current breaks forward.';}else if(phase===1){damage=8+scale;ward=7;setEffect(state,'ward',3,2);text='The wheel turns to structure: impact settles into a guarded line.';}else{damage=9+scale;qi=recoverQi(state,6);healed=heal(state,6);text='The wheel becomes flow: six qi and a little health return as the current turns.';}}
      // Old effects advance on power exchanges too; effects created by this action begin afterwards.
      for(const [name,status] of Object.entries(priorEffects)){
        if(!status || status.turns<=0)continue;
        const amount=bounded(status.amount,0,6);
        if(['scorch','poison'].includes(name))damage+=amount;
        if(name==='exposed' && damage>0)damage+=amount;
        if(['ward','chill','adaptation'].includes(name))ward+=amount;
        const current=c.powerEffects?.[name];
        if(current===status){current.turns--;if(current.turns<=0)delete c.powerEffects[name];}
      }
      damage=Math.min(c.enemyHp,Math.max(0,damage));c.enemyHp=Math.max(0,c.enemyHp-damage);
      const intent=context.enemyIntent || (c.style==='Patient' && c.round%3===1?'guard':c.round%3===0?'recover':'strike');
      const counter=c.enemyHp<=0 || intent==='recover'?0:Math.max(0,5+Math.floor(bounded(c.difficulty,0,90)/10)+(c.style==='Aggressive'?2:0)-(intent==='guard'?2:0)-ward);
      // Keep the signed remainder for later companion mitigation. Clamping first
      // must not turn an overwhelming hit into a survivable guardian exchange.
      playerDamage=counter;playerHpAfterAnswer=c.playerHp-counter;
      c.playerHp=Math.max(0,playerHpAfterAnswer);c.round=integer(c.round)+1;c.playerMoveHistory=Array.isArray(c.playerMoveHistory)?c.playerMoveHistory:[];c.playerMoveHistory.push(`power:${id}`);c.playerMoveHistory=c.playerMoveHistory.slice(-6);
      c.fx={move:'power',technique:action.name,powerId:id,affinity:p.fates.Affinity,enemyDamage:damage,playerDamage:counter,enemyCounter:counter>0,response:counter?'hit':damage?'hit':'block'};
      extra=`${damage?` ${damage} damage.`:''}${counter?` The opponent answers for ${counter} damage.`:' You avoid the answering force.'}`;
      c.log??=[];c.log.push(text+extra);c.log=c.log.slice(-60);
    } else {
      if(id==='demon-marrow')p.hp-=6;
      if(id==='chaos-wheel')corruption(state,1);
      if(domain==='social' && id==='karmic-balance'){
        const npc=getNpc(state,context),debt=npc.debt>0;
        if(debt)npc.debt=Math.max(0,npc.debt-1);else npc.grudge=Math.max(0,npc.grudge-1);
        npc.trust=bounded((npc.trust||0)+1,-100,100);npc.respect=bounded((npc.respect||0)+1,-100,100);
        text=debt?'You release one genuine obligation without demanding repayment. The gesture earns a little trust and respect.':'You acknowledge one specific grievance and make room for a less hostile next conversation.';
        memory(state,npc,`${p.name||'The wanderer'} ${debt?'released an obligation':'acknowledged a grievance'} without demanding affection.`);
      }else{
        // Preparation is one consumable benefit, bound to this location and a short window.
        powers.preparation={id,domain,location:state.world.location,npcId:context.npcId||state.scene?.npc||null,expiresAt:clock(state)+8};
        text=`${action.name} is prepared for one meaningful ${domain==='craft'?'completed craft':domain==='medicine'?'treatment':domain==='social'?'conversation':'exploration challenge'} here. It will expire after eight world phases.`;
      }
    }
    addHistory(state,id,text+extra);
    return {ok:true,id,name:action.name,domain,text:text+extra,cost:{qi:action.qi,fatigue:action.fatigue,hp:id==='demon-marrow'?6:0},changes:{enemyDamage:damage,playerDamage,playerHpAfterAnswer,healed,qi},fx:c?.fx||null,terminal:c?(c.enemyHp<=0?'win':c.playerHp<=0?'loss':null):null,eventId};
  }

  function combatExchange(state,event={}) {
    const original={enemyDamage:Math.max(0,Number(event.enemyDamage)||0),playerDamage:Math.max(0,Number(event.playerDamage)||0),notes:[]};
    if(!state.combat)return original;
    const powers=ensure(state),eventId=sequence(event);
    // Called once after ordinary combat damage is calculated, before actionNo advances.
    if(eventId!==integer(state.actionNo)+1 || eventId<=powers.last.combat)return {...original,duplicate:true};
    powers.last.combat=eventId;
    const p=state.player,c=state.combat,mode=event.mode||'',attack=original.enemyDamage>0,affinity=p.fates?.Affinity,ability=p.fates?.Ability,race=p.fates?.Race,effects=combatEffects(state);
    let outgoing=original.enemyDamage,incoming=original.playerDamage,healing=0;
    const add=(note)=>original.notes.push(note);
    if(attack && mode==='qi'){
      if(affinity==='Flame Yang'){outgoing+=2;add('Yang heat adds force.');}
      if(affinity==='Glacial Yin'){outgoing+=1;incoming-=2;add('Yin precision softens the answer.');}
      if(affinity==='Heavenly Lightning'){outgoing+=event.enemyIntent==='guard'?6:4;fatigue(state,1);add('Lightning pierces the line at a fatigue cost.');}
      if(affinity==='Venomous Wood'){outgoing+=1;healing+=2;add('Wood circulation returns a little vitality.');}
      if(affinity==='Void' && event.enemyIntent==='guard'){outgoing+=3;add('Void force passes around the guard.');}
      if(affinity==='Primordial Chaos'){
        const phase=powers.cycle++%3;powers.cycle%=3;
        if(phase===0)outgoing+=3;else if(phase===1)incoming-=3;else{outgoing+=2;recoverQi(state,race==='Primordial Chaosborn'?3:2);}
        add(`Chaos turns through ${['force','structure','flow'][phase]}.`);
      }
    }
    if(affinity==='Void' && mode==='focus')incoming-=2;
    if(ability==='Perfect Meridians' && attack && mode==='qi')recoverQi(state,1);
    if(ability==='Sword Heart' && attack && ['sword','frost'].includes(mode))outgoing+=event.enemyIntent==='guard'?3:2;
    if(ability==='Heavenly Demon Physique'){if(attack && mode==='unarmed')outgoing+=2;if(mode==='defend')incoming-=1;}
    const previous=c.powerLastMode;
    if(ability==='Ten Thousand Arts' && attack && previous && previous!==mode)outgoing+=2;
    if(ability==='Divine Formation Mind' && mode==='defend'){incoming-=2;c.momentum=bounded((c.momentum||0)+1,0,3);}
    if(ability==='Limitless Evolution' && mode==='defend' && c.playerHp<p.maxHp/2)incoming-=2;
    if(race==='Human' && previous && previous!==mode)incoming-=1;
    if(race==='Spirit-Blooded' && attack && mode==='qi')recoverQi(state,1);
    if(race==='Demonkin' && attack && mode==='unarmed' && c.playerHp<p.maxHp/2)healing+=2;
    if(race==='Azure Dragonkin'){if(attack && mode==='unarmed')outgoing+=1;if(mode==='defend')incoming-=1;}
    if(race==='Celestial Descendant' && mode==='defend')fatigue(state,-1);
    for(const [name,status] of Object.entries(effects)){
      if(!status || status.turns<=0){delete effects[name];continue;}
      const amount=bounded(status.amount,0,6);
      if(name==='exposed' && attack)outgoing+=amount;
      if(['ward','chill','adaptation'].includes(name))incoming-=amount;
      if(['scorch','poison'].includes(name)){outgoing+=amount;add(name==='scorch'?'The ember pressure burns.':'The rooted toxin pulses.');}
      status.turns=Math.max(0,integer(status.turns)-1);if(!status.turns)delete effects[name];
    }
    c.powerLastMode=mode;
    // Bound additive interactions: fate combinations cannot turn a modest hit into runaway damage.
    outgoing=Math.min(original.enemyDamage+15,Math.max(0,outgoing));incoming=Math.max(0,incoming);
    // Returned healing is applied together with damage by the caller, not before base damage.
    return {enemyDamage:outgoing,playerDamage:incoming,healing:Math.min(4,healing),notes:original.notes,eventId};
  }

  function prepared(state,domain,npcId=null) {
    const value=state.player?.powers?.preparation;
    if(!value || value.domain!==domain || value.location!==state.world?.location || value.expiresAt<=clock(state))return null;
    if(domain==='social' && value.npcId && value.npcId!==npcId)return null;
    return {...value};
  }
  function resolveUse(state,event={}) {
    const powers=ensure(state),eventId=sequence(event),domain=event.domain;
    if(eventId!==integer(state.actionNo) || eventId<=powers.last.use || eventId<0)return {ok:false,reason:'This resolved activity has already been processed or is no longer current.'};
    // The mechanics caller certifies a real cost/challenge; narration never calls this API.
    if(event.meaningful!==true || !Number.isFinite(event.challenge) || event.challenge<1 || !['craft','medicine','exploration','social'].includes(domain))return {ok:false,reason:'No meaningful resolved activity.'};
    const prep=prepared(state,domain,event.npcId);
    if(!prep)return {ok:false,reason:'No matching preparation.'};
    if(domain==='craft'){
      const item=state.player.inventory?.find(x=>x.name===event.itemName && x.qty>0);
      if(!item || event.produced!==true)return {ok:false,reason:'A real item must have been produced by this activity.'};
    }
    if(domain==='social'){
      const npc=getNpc(state,event);if(!npc || npc.location!==state.world.location)return {ok:false,reason:'The conversation partner is no longer here.'};
    }
    powers.last.use=eventId;delete powers.preparation;
    if(event.success!==true)return {ok:true,consumed:true,text:'The preparation is spent on the attempt. It cannot turn an unsuccessful action into an unearned reward.',changes:{}};
    const p=state.player,id=prep.id,changes={};let text='';
    if(domain==='craft'){
      const item=p.inventory.find(x=>x.name===event.itemName && x.qty>0);
      if(['Weapon','Armor','Accessory'].includes(item.type)){
        p.gearQuality??={};const grades=['Rough','Sound','Fine','Masterwork'],current=p.gearQuality[item.name]||{grade:'Sound',craftedDay:state.world.day};
        const grade=grades[Math.min(3,Math.max(0,grades.indexOf(current.grade))+1)];p.gearQuality[item.name]={...current,grade};changes.grade=grade;text=`Careful preparation brings ${item.name} to ${grade} quality.`;
        p.gearTraits??={};
        const trait=id==='yang-flare'?(item.type==='Weapon'?'Keen':'Guarded'):id==='wood-renewal'?(item.type==='Armor'?'Lightstep':'Qi-Conductive'):id==='formation-mind'?'Observant':id==='chaos-wheel'?'Qi-Conductive':null;
        if(trait && !p.gearTraits[item.name]){p.gearTraits[item.name]=trait;changes.trait=trait;text+=` Its ${trait} structure carries the prepared current.`;}
      }else{changes.qi=recoverQi(state,id==='wood-renewal'?5:3);changes.fatigue=fatigue(state,-3);text='The prepared current conserves qi and effort during production. Ingredients and output quantities stay governed by the recipe.';}
    }
    if(domain==='medicine'){
      changes.hp=heal(state,id==='wood-renewal'?10:id==='yin-mirror'?8:6);
      if(id==='wood-renewal'){
        const index=(p.injuries||[]).findIndex(x=>/poison|venom|toxin/i.test(x.name));if(index>=0){changes.removedInjury=p.injuries[index].name;p.injuries.splice(index,1);}
      }
      changes.fatigue=fatigue(state,id==='yin-mirror'?-4:-2);
      if(id==='meridian-flow')changes.qi=recoverQi(state,6);
      text=`The prepared treatment restores ${changes.hp} extra HP${changes.removedInjury?` and clears ${changes.removedInjury}`:''}.`;
    }
    if(domain==='exploration'){
      changes.fatigue=fatigue(state,-(['yin-mirror','evolution-response'].includes(id)?6:4));
      if(id==='void-step'){const before=p.heat||0;p.heat=Math.max(0,before-2);changes.heat=p.heat-before;}
      if(id==='chaos-wheel')changes.qi=recoverQi(state,3);
      const location=state.world.locations?.[state.world.location];
      if(location){const before=location.familiarity||0;location.familiarity=bounded(before+(id==='lightning-thread'?3:2),0,30);changes.familiarity=location.familiarity-before;}
      text='The prepared route conserves effort and builds familiarity through the crossing itself.';
    }
    if(domain==='social'){
      const npc=getNpc(state,event);npc.trust=bounded((npc.trust||0)+1,-100,100);changes.trust=1;
      text='You leave space for a considered answer. The successful exchange earns a small measure of trust.';memory(state,npc,`${p.name||'The wanderer'} respected the pace and boundaries of our conversation.`);
    }
    addHistory(state,id,text);
    return {ok:true,consumed:true,text,changes,eventId};
  }
  const api=Object.freeze({version:VERSION,catalog,affinities,abilities,races,ensure,clock,check,list,activate,combatExchange,prepared,resolveUse});
  root.MURIM_POWERS=api;
  if(typeof module==='object' && module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
