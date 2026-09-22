/* Canonical item identities, loadout slots and reversible equipment effects. */
(function(root,factory){const api=factory();root.MURIM_EQUIPMENT=api;if(typeof module==='object'&&module.exports)module.exports=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
'use strict';
const slots=['weapon','head','chest','gloves','legs','feet','ring1','ring2','necklace','pet'];
const slotLabels={weapon:'Weapon',head:'Head',chest:'Chest',gloves:'Gloves',legs:'Legs',feet:'Feet',ring1:'Ring I',ring2:'Ring II',necklace:'Necklace',pet:'Spirit companion'};
const statLabels={sword:'Weapon force',unarmed:'Handwork',qi:'Qi force',defense:'Protection',movement:'Movement',perception:'Awareness',body:'Body',insight:'Insight',herbalism:'Herbalism',navigation:'Navigation',rest:'Recovery',etiquette:'Etiquette'};
const rows=[
['plain-iron-sword','Plain Iron Sword','weapon',{sword:1},{weapon:'sword'},18,'An honest iron jian, plain guard, brown cord grip.'],
['steel-jian','Steel Jian','weapon',{sword:2},{weapon:'sword'},48,'A polished narrow jian with a blue tassel.'],
['tempered-steel-jian','Tempered Steel Jian','weapon',{sword:3},{weapon:'sword'},62,'A smoke-patterned steel jian with brass fittings.'],
['cold-iron-jian','Cold Iron Jian','weapon',{sword:4,qi:1},{weapon:'sword'},110,'A pale blue blade with frost-white steel fittings.'],
['spiritsteel-jian','Spiritsteel Jian','weapon',{sword:5,qi:2},{weapon:'sword'},180,'A jade-veined blade with a quiet green radiance.'],
['heavy-saber','Heavy Saber','weapon',{sword:3,movement:-1},{weapon:'saber'},60,'A broad single-edged saber with an oxblood wrap.'],
['meteor-iron-saber','Meteor-Iron Saber','weapon',{sword:5,body:1},{weapon:'saber'},150,'A dark broad saber flecked with meteoric silver.'],
['whispersteel-needles','Whispersteel Needles','weapon',{qi:2,perception:2},{weapon:'needles'},120,'Seven silver throwing needles in a midnight silk roll.'],
['starfall-jian','Starfall Jian','weapon',{sword:6,qi:2,perception:1},{weapon:'sword'},240,'A midnight jian with a star-pierced golden guard.'],
['ironwood-staff','Ironwood Staff','weapon',{unarmed:2,defense:1},{weapon:'staff'},40,'An iron-capped dark wood staff with a knotted grain.'],
['reedwind-spear','Reedwind Spear','weapon',{sword:3,movement:1},{weapon:'spear'},72,'A long bamboo-green spear with a white horsehair tassel.'],
['moonlit-war-fan','Moonlit War Fan','weapon',{qi:3,perception:1},{weapon:'fan'},85,'An open ivory war fan with steel ribs and a moon design.'],
['tiger-knuckle-gauntlets','Tiger Knuckle Gauntlets','weapon',{unarmed:4,body:1},{weapon:'gauntlet'},95,'Paired black steel fist weapons with subtle tiger engraving.'],
['reed-travel-hat','Reed Travel Hat','head',{perception:1},{},22,'A conical woven reed hat with a dark chin cord.'],
['cloudveil-circlet','Cloudveil Circlet','head',{qi:1},{},45,'A silver forehead circlet centered with a cloud jade.'],
['lamellar-helm','Lamellar Helm','head',{defense:1,movement:-1},{},52,'A practical lacquered lamellar helm with bronze edging.'],
['scholar-hairpin','Scholar Hairpin','head',{insight:1,perception:1},{},44,'A carved ivory hairpin shaped like a folded scroll.'],
['jade-visage','Jade Visage','head',{qi:1,perception:1},{mask:'jade'},70,'A full pale jade face mask with serene narrow eye openings.'],
['iron-warden-mask','Iron Warden Mask','head',{defense:1,body:1},{mask:'iron'},76,'A dark iron half-mask with squared cheek plates.'],
['fox-festival-mask','Fox Festival Mask','head',{movement:1,perception:1},{mask:'fox'},62,'An ivory fox mask with restrained vermilion markings.'],
['night-silk-veil','Night Silk Veil','head',{movement:2},{mask:'veil'},58,'A charcoal cloth veil covering the lower face.'],
['traveling-robes','Traveling Robes','chest',{defense:0},{outfit:'robe',palette:null},24,'Plain dark traveling robes with a cream inner collar.'],
['reinforced-traveling-robes','Reinforced Traveling Robes','chest',{defense:2},{outfit:'robe',palette:3},42,'Brown road robes with understated reinforced seams.'],
['cloudsilk-robes','Cloudsilk Robes','chest',{defense:2,movement:2},{outfit:'robe',palette:2},95,'Flowing jade robes with pale cloud embroidery.'],
['black-leather-lamellar','Black Leather Lamellar','chest',{defense:3,movement:-1},{outfit:'lamellar',palette:6},82,'Black overlapping leather armor with brass ties.'],
['frostwoven-cloak','Frostwoven Cloak','chest',{defense:1,qi:1},{outfit:'ceremonial',palette:7},110,'Ivory layered ceremonial cloak with icy blue trim.'],
['moonweave-inner-robe','Moonweave Inner Robe','chest',{defense:3,qi:2},{outfit:'ceremonial',palette:4},148,'A plum formal robe with silver lunar threadwork.'],
['ghostsilk-traveling-coat','Ghostsilk Traveling Coat','chest',{defense:3,movement:3,perception:1},{outfit:'scout',palette:6},235,'A fitted charcoal scout coat with split tails and quiet fastenings.'],
['crimson-scout-jacket','Crimson Scout Jacket','chest',{defense:1,movement:2,body:1},{outfit:'scout',palette:1},78,'A short crimson martial jacket with leather cross-straps.'],
['linen-hand-wraps','Linen Hand Wraps','gloves',{unarmed:1},{},18,'Cream martial hand wraps with worn edges.'],
['spirit-thread-wristguard','Spirit-thread Wristguard','gloves',{qi:1,sword:1},{},90,'White silk wristguards bound in luminous spirit thread.'],
['smith-leather-gloves','Smith Leather Gloves','gloves',{body:1},{},30,'Soot-brown thick leather smith gloves.'],
['silk-needle-gloves','Silk Needle Gloves','gloves',{perception:1,qi:1},{},62,'Dark fitted silk gloves with silver needle loops.'],
['iron-palm-bracers','Iron Palm Bracers','gloves',{unarmed:2,movement:-1},{},65,'Bronze-banded forearm bracers leaving the palms free.'],
['cloud-step-gloves','Cloud Step Gloves','gloves',{movement:1,sword:1},{},58,'Pale blue fingerless dueling gloves with a cloud cuff.'],
['road-linen-trousers','Road Linen Trousers','legs',{movement:1},{},24,'Loose oat-colored trousers tied neatly at the ankle.'],
['hidden-pocket-sash','Hidden Pocket Sash','legs',{perception:1},{},35,'A navy trouser-and-sash set with hidden flat pockets.'],
['ten-pocket-wanderer-sash','Ten-Pocket Wanderer Sash','legs',{perception:2,movement:1},{},78,'Brown riding trousers with an elaborate practical pocket sash.'],
['lamellar-greaves','Lamellar Greaves','legs',{defense:1,body:1,movement:-1},{},60,'Dark armored leg guards with bronze articulated knees.'],
['moonweave-trousers','Moonweave Trousers','legs',{qi:1,movement:1},{},68,'Soft silver-gray silk trousers with plum knee panels.'],
['crane-rider-trousers','Crane Rider Trousers','legs',{navigation:2,movement:1},{},52,'Deep teal riding trousers with reinforced inner seams.'],
['straw-road-sandals','Straw Road Sandals','feet',{movement:1},{},15,'Straw sandals with pale braided straps.'],
['wayfarer-boots','Wayfarer Boots','feet',{movement:2,navigation:2},{},60,'Weathered brown ankle boots with reinforced soles.'],
['cloud-step-slippers','Cloud Step Slippers','feet',{movement:3,defense:-1},{},74,'Ivory cloth slippers with blue cloud embroidery.'],
['iron-heel-boots','Iron Heel Boots','feet',{defense:1,unarmed:1,movement:-1},{},58,'Black leather boots capped at heel and toe in iron.'],
['frost-pine-boots','Frost Pine Boots','feet',{qi:1,navigation:1},{},66,'Slate-blue winter boots trimmed in pale cloth.'],
['shadow-reed-shoes','Shadow Reed Shoes','feet',{movement:2,perception:1},{},80,'Flexible charcoal shoes with green reed stitching.'],
['iron-ring','Iron Ring','ring',{body:1},{},28,'An unadorned forged iron finger ring.'],
['river-jade-ring','River Jade Ring','ring',{qi:1},{},44,'A translucent deep-green jade finger ring.'],
['ember-copper-ring','Ember Copper Ring','ring',{sword:1},{},42,'A copper ring inset with a small red ember stone.'],
['moon-silver-ring','Moon Silver Ring','ring',{perception:1},{},46,'A thin silver ring carrying a blue moonstone.'],
['crane-feather-ring','Crane Feather Ring','ring',{movement:1},{},48,'A white-gold ring engraved with a folded crane feather.'],
['black-tortoise-ring','Black Tortoise Ring','ring',{defense:1},{},64,'A dark stone signet bearing a tortoise-shell pattern.'],
['cold-jade-talisman','Cold Jade Talisman','necklace',{qi:1},{},65,'A cool pale jade pendant suspended on navy cord.'],
['red-thread-amulet','Red Thread Amulet','necklace',{rest:1,body:1},{},40,'A braided red thread necklace with a small bronze charm.'],
['lotus-prayer-beads','Lotus Prayer Beads','necklace',{qi:1,rest:1},{},74,'A string of sandalwood prayer beads with a lotus pendant.'],
['eagle-eye-pendant','Eagle Eye Pendant','necklace',{perception:2},{},80,'An amber eye-shaped pendant framed in dark silver.'],
['mountain-oath-medallion','Mountain Oath Medallion','necklace',{defense:1,body:1},{},92,'A weighty bronze medallion carved with three mountain peaks.'],
['travelers-bedroll',"Traveler's Bedroll",null,{rest:2},{},34,'A rolled indigo sleeping mat tied with a tan strap.'],
['herbalist-satchel','Herbalist Satchel',null,{herbalism:2,perception:1},{},40,'A green herb gatherer bag with dried leaves in its pockets.'],
['scholars-brush-case',"Scholar's Brush Case",null,{insight:1,etiquette:1},{},38,'A lacquered bamboo case holding two calligraphy brushes.'],
['crimson-oni-mask','Crimson Oni Mask','head',{unarmed:2,movement:-1},{mask:'crimson-oni'},108,'A lacquered crimson oni mask with short black horns, white fangs and a fierce brow.'],
['ivory-oni-mask','Ivory Oni Mask','head',{qi:2,perception:1},{mask:'ivory-oni'},122,'An ivory oni mask with elegant swept gold horns and ink-dark eyes.'],
['shadow-assassin-mask','Shadow Assassin Mask','head',{movement:2,perception:1},{mask:'shadow-assassin'},105,'A fitted black assassin face mask with narrow silver eye accents and no horns.'],
['golden-demon-mask','Golden Demon Mask','head',{defense:1,qi:2,movement:-1},{mask:'golden-demon'},145,'An ornate golden demon mask with flame-shaped horns and a deep red forehead jewel.'],
['heavenly-demon-raiment','Heavenly Demon Raiment','chest',{defense:3,unarmed:2,qi:1,movement:-1},{outfit:'demon',palette:1},220,'A dramatic crimson and black martial raiment with angular gold shoulder armor and long dark red tails.'],
['phoenix-silk-regalia','Phoenix Silk Regalia','chest',{defense:2,qi:2,movement:1},{outfit:'ceremonial',palette:5},215,'Flowing ivory and gold ceremonial regalia with phoenix feather embroidery and layered golden sleeves.']
];
const catalog=rows.map(([id,name,slot,stats,visual,buy,description],index)=>({id,name,slot,stats,visual,buy,sell:Math.max(1,Math.floor(buy*.44)),description,icon:'./art/items/'+id+'.webp',iconIndex:index,type:slot==='weapon'?'Weapon':slot==='chest'||slot==='head'||slot==='legs'?'Armor':slot?'Accessory':'Tool'}));
const byId=Object.assign(Object.create(null),Object.fromEntries(catalog.map(x=>[x.id,x]))),byName=Object.assign(Object.create(null),Object.fromEntries(catalog.map(x=>[x.name,x])));
const get=key=>byId[key]||byName[key]||null;
function registerItems(items){for(const c of items||[]){if(!c||typeof c.id!=='string'||typeof c.name!=='string'||get(c.id)||get(c.name))continue;byId[c.id]=byName[c.name]={...c,slot:null,stats:{},visual:{},description:c.description||c.desc||''};}}
const itemId=name=>get(name)?.id||'item-'+String(name).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const name=key=>get(key)?.name||key;
const compatible=(item,slot)=>item&&item.slot&&(item.slot===slot||(item.slot==='ring'&&['ring1','ring2'].includes(slot)));
function ensure(p){
 p.inventory??=[];const inv=new Map();for(const x of p.inventory){if(!x||typeof x.name!=='string')continue;const c=get(x.id)||get(x.name),id=c?.id||itemId(x.name),qty=Math.max(0,Number.isInteger(x.qty)?Math.min(99999,x.qty):0);if(inv.has(id))inv.get(id).qty=Math.min(99999,inv.get(id).qty+qty);else inv.set(id,{...x,id,name:c?.name||x.name,qty,type:c?.type||x.type||'Material'});}p.inventory=[...inv.values()];
 const old=p.equipment||{},next=Object.fromEntries(slots.map(s=>[s,null])),used={};
 for(const slot of slots){if(slot==='pet'){next.pet=typeof old.pet==='string'?old.pet:null;continue;}const source=old[slot]||(slot==='chest'?old.armor:null),c=get(source);if(compatible(c,slot)&&(p.inventory.find(x=>x.id===c.id)?.qty||0)>(used[c.id]||0)){next[slot]=c.id;used[c.id]=(used[c.id]||0)+1;}}
 if(old.accessory){const c=get(old.accessory),slot=c?.slot==='ring'?(next.ring1?'ring2':'ring1'):c?.slot;if(slot&&!next[slot]&&(p.inventory.find(x=>x.id===c.id)?.qty||0)>(used[c.id]||0))next[slot]=c.id;}
 p.equipment=next;p.equipmentVersion=1;const dyes={};for(const [key,palette] of Object.entries(p.equipmentDyes&&typeof p.equipmentDyes==='object'&&!Array.isArray(p.equipmentDyes)?p.equipmentDyes:{})){const c=get(key);if(c?.slot==='chest'&&Number.isInteger(palette)&&palette>=0&&palette<8)dyes[c.id]=palette;}p.equipmentDyes=dyes;return next;
}
function quantity(p,key){const id=itemId(name(key));return (p.inventory||[]).filter(x=>(x.id||itemId(x.name))===id).reduce((n,x)=>n+Math.max(0,x.qty||0),0)}
function equippedSlots(p,key){const id=get(key)?.id;return id?slots.filter(s=>s!=='pet'&&p.equipment?.[s]===id):[];}
function equip(p,key,slot){ensure(p);const c=get(key);if(!c?.slot||slot==='pet')return {ok:false,reason:'This item is not wearable equipment.'};slot??=c.slot==='ring'?(!p.equipment.ring1?'ring1':!p.equipment.ring2?'ring2':'ring1'):c.slot;if(!compatible(c,slot))return {ok:false,reason:'That item does not fit this slot.'};if(p.equipment[slot]===c.id)return {ok:true,changed:false,slot,id:c.id};if(quantity(p,c.id)<=equippedSlots(p,c.id).length)return {ok:false,reason:'You need another copy to fill both slots.'};p.equipment[slot]=c.id;return {ok:true,changed:true,slot,id:c.id};}
function unequip(p,slot){ensure(p);if(!slots.includes(slot)||slot==='pet')return {ok:false,reason:'Choose a valid equipment slot.'};const id=p.equipment[slot];p.equipment[slot]=null;return {ok:true,changed:!!id,slot,id};}
function acquire(p,key,qty=1,type='Material'){if(!Number.isInteger(qty)||qty<=0||qty>99999)return false;ensure(p);const c=get(key),label=c?.name||key,id=c?.id||itemId(label);let x=p.inventory.find(x=>x.id===id);if(x){if(x.qty+qty>99999)return false;x.qty+=qty;}else p.inventory.push({id,name:label,qty,type:c?.type||type});return true;}
function consume(p,key,qty=1){if(!Number.isInteger(qty)||qty<=0)return false;ensure(p);const id=itemId(name(key)),x=p.inventory.find(i=>i.id===id);if(!x||x.qty<qty)return false;x.qty-=qty;const assigned=equippedSlots(p,id);while(assigned.length>x.qty)p.equipment[assigned.pop()]=null;return true;}
function entries(p){return slots.filter(s=>s!=='pet').map(slot=>({slot,item:get(p.equipment?.[slot])})).filter(x=>x.item);}
function baseStats(p){const total={};for(const {item} of entries(p))for(const [k,v] of Object.entries(item.stats))total[k]=(total[k]||0)+v;return total;}
function carriedBonus(p,kind){return catalog.filter(c=>!c.slot&&quantity(p,c.id)>0).reduce((n,c)=>n+(c.stats[kind]||0),0);}
function compare(p,key,slot){const c=get(key);if(!c)return {};slot??=c.slot==='ring'?'ring1':c.slot;const old=get(p.equipment?.[slot]),delta={};for(const k of new Set([...Object.keys(c.stats),...Object.keys(old?.stats||{})])){const value=(c.stats[k]||0)-(old?.stats[k]||0);if(value)delta[k]=value;}return delta;}
function visual(p){const e=p.equipment||{},chest=get(e.chest||e.armor),head=get(e.head),weapon=get(e.weapon),v=chest?.visual||{};return {outfit:v.outfit||'robe',palette:p.equipmentDyes?.[chest?.id]??v.palette??p.appearance?.palette??0,weapon:weapon?.visual.weapon||null,weaponId:weapon?.id||null,mask:head?.visual.mask||null,head:head?.id||null,chest:chest?.id||null};}
function recipes(){return catalog.filter(c=>c.slot&&!['Plain Iron Sword','Steel Jian','Traveling Robes'].includes(c.name)).map(c=>{const kind=c.slot==='weapon'||c.slot==='ring'||c.slot==='necklace'||c.slot==='head'&&c.visual.mask==='iron'?'smith':'tailor',skill=c.buy>=140?8:c.buy>=90?6:c.buy>=55?4:2;return {kind,name:c.name,skill,cost:Math.max(5,Math.ceil(c.buy*.22)),type:c.type,desc:c.description,mats:kind==='smith'?(skill>=6?{'Cold Iron Ore':2,'Spiritsteel Fragment':1,'Spirit Stone':1}:{'Iron Ore':2,'Blackwood':1}):(skill>=6?{'Cloudsilk Bolt':2,'Spirit Thread':1}:{'Fine Silk Thread':2,'Beast Leather':1})};});}
return {version:1,catalog,slots,slotLabels,statLabels,get,registerItems,name,itemId,ensure,quantity,equippedSlots,equip,unequip,acquire,consume,entries,baseStats,carriedBonus,compare,visual,recipes};
});
