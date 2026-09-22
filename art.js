/* One art registry and one raster composition renderer. Coordinates use a fixed
   canvas, so changing a UI container cannot move hair relative to the face. */
globalThis.MURIM_ART=(()=>{
 const root='./art/';let serial=0;
 const poses=MURIM_OUTFITS.families.robe;
 const npcIds=['han','seo','mu','jin','tang','gwak','baek','hwang','lin'];
 const npcPose=pose=>['idle','talk','guard','strike'].includes(pose)?pose:['sword','palm','channel'].includes(pose)?'strike':pose==='evade'?'guard':'idle';
 const expressions=['neutral','soft','smile','focused','determined','angry','surprised','hurt'];
 const palettes=[
  {name:'Navy',robe:'#26384a',robe2:'#121b27',trim:'#d4b06b',sash:'#7f3033'},
  {name:'Crimson',robe:'#4b272b',robe2:'#241317',trim:'#d8b26b',sash:'#1f1d28'},
  {name:'Jade',robe:'#315342',robe2:'#162a21',trim:'#c9b071',sash:'#653932'},
  {name:'Earth',robe:'#40372f',robe2:'#211c19',trim:'#c7a267',sash:'#782c34'},
  {name:'Plum',robe:'#333047',robe2:'#181724',trim:'#aebbd1',sash:'#40312e'},
  {name:'Gold',robe:'#5a4f31',robe2:'#292617',trim:'#e0c47f',sash:'#4d2e29'},
  {name:'Charcoal',robe:'#26262a',robe2:'#101014',trim:'#c6a56a',sash:'#812f45'},
  {name:'Ivory',robe:'#d7d2c7',robe2:'#3c3b42',trim:'#b58b55',sash:'#6f2c2f'}
 ];
 function paletteFilter(id,palette){
  const p=palettes[palette]||palettes[0],rgb=p.robe.slice(1).match(/../g).map(x=>parseInt(x,16)),highlight=[252,250,242],shadow=[4,6,8];
  const values=c=>[shadow[c],rgb[c],rgb[c]+(highlight[c]-rgb[c])*.4,rgb[c]+(highlight[c]-rgb[c])*.76,highlight[c]].map(x=>(x/255).toFixed(5)).join(' ');
  // Luminance remapping gives the same named dye to gray and red source robes.
  // Shadow detail and pale inner fabric remain distinct; alpha is untouched.
  return '<filter id="'+id+'" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncR type="gamma" amplitude="1" exponent=".8" offset="0"/><feFuncG type="gamma" amplitude="1" exponent=".8" offset="0"/><feFuncB type="gamma" amplitude="1" exponent=".8" offset="0"/></feComponentTransfer><feComponentTransfer><feFuncR type="table" tableValues="'+values(0)+'"/><feFuncG type="table" tableValues="'+values(1)+'"/><feFuncB type="table" tableValues="'+values(2)+'"/><feFuncA type="identity"/></feComponentTransfer></filter>';
 }
 // Small detached neighboring atlas fragments remain inside the exported guard
 // canvases. Native-coordinate masks remove those shapes without resizing actors.
 const guardExclusions={
  han:['480,519 481,515 483,508 485,503 488,496 493,487 496,482 504,470 529,470 529,526 480,526','493,373 529,373 529,426 493,426','496,529 529,529 529,592 496,592','498,248 529,248 529,302 498,302'],
  seo:['457,91 529,91 529,298 457,298']
 };
 const hairLabels={male:['Warrior Topknot','Scholar Curtains','Low Martial Tail','Layered Martial Cut','Swept Short Fringe','Cropped Cultivator'],female:['Jade Coiled Bun','Long Scholar Silk','Braided Side Tail','Layered Bob','Short Martial Tie','Cropped Side Fringe']};
 const hair={male:[[0,0,512,610],[0,0,512,610],[0,0,512,610],[0,0,512,414],[0,20,512,414],[0,0,512,414]],female:[[0,0,512,610],[0,0,512,610],[0,0,512,610],[0,40,512,414],[0,40,512,414],[0,35,512,414]]};
 const face={male:[[136,80,240,320],[136,80,240,320],[136,80,240,320]],female:[[136,80,240,320],[136,80,240,320],[136,80,240,320]]};
 const locations={'Awakening Hall':'hall','Cloudveil Sect':'cloudveil','Frostblade Peak':'frostblade','Jade River City':'river','Crane & Reed Martial Inn':'inn','Ten Thousand Lantern Market':'market','Red Moon Ruins':'ruins','Hundred Herb Valley':'herb','Black Heaven Palace':'palace'};
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const hairAsset=(gender,id)=>root+`characters/hair/ink-${gender}-hair-${id}.webp`;
 function assets(a,expression=a.expression||'neutral'){let expr=expressions.includes(expression)?expression:expression==='smirk'?'smile':expression==='hurt'?'soft':'determined';return {face:root+`characters/face/ink-${a.body}-face-${a.face}-${expr}.webp`,hair:hairAsset(a.body,a.hair),expr}}

 const headgear={'reed-travel-hat':[6,-55,500,430],'cloudveil-circlet':[116,85,280,125],'lamellar-helm':[36,-80,560,560],'scholar-hairpin':[256,-25,145,170],'jade-visage':[116,90,280,315],'iron-warden-mask':[116,85,280,320],'fox-festival-mask':[111,55,290,345],'night-silk-veil':[116,115,280,310],'crimson-oni-mask':[106,75,300,340],'ivory-oni-mask':[106,65,300,350],'shadow-assassin-mask':[116,95,280,320],'golden-demon-mask':[96,45,320,370]};
 function headgearLayer(visual,layer){
  const r=headgear[visual.head];if(!r)return '';
  if(visual.head!=='lamellar-helm')return layer('Headgear',root+'items/'+visual.head+'.webp',r);
  const id='helm-aperture-'+(++serial);
  return '<defs><mask id="'+id+'" maskUnits="userSpaceOnUse" x="0" y="-100" width="640" height="640" style="mask-type:luminance"><rect x="0" y="-100" width="640" height="640" fill="white"/><path fill="black" d="M160 195 Q242 171 330 199 L315 342 Q250 392 176 343Z"/></mask></defs>'+layer('Headgear',root+'items/'+visual.head+'.webp',r,'mask="url(#'+id+')"');
 }
 function weaponLayer(visual,rig,pose,layer){
  if(!visual.weaponId)return '';
  const kind=visual.weapon,held=rig.gripClosed&&rig.grip&&['sword','guard'].includes(pose),point=held?rig.grip:[rig.neck[0]+34,rig.neck[1]+190];
  const pivots={sword:[200,45],saber:[200,45],staff:[128,128],spear:[105,145],fan:[115,185],needles:[128,128],gauntlet:[128,128]},pivot=pivots[kind]||[128,128];
  const size=kind==='spear'||kind==='staff'?1.1:kind==='fan'?.65:kind==='needles'||kind==='gauntlet'?.34:.75;
  const facing=point[0]<rig.neck[0]?180:0,angle=held?(kind==='fan'?0:kind==='spear'?facing+45:kind==='staff'?facing+45:facing-135):-55;
  return '<g class="lmWeapon" data-item="'+escape(visual.weaponId)+'" data-held="'+held+'" transform="translate('+point.join(' ')+') rotate('+angle+') scale('+size+') translate('+(-pivot[0])+' '+(-pivot[1])+')">'+layer('WeaponArt',root+'items/'+visual.weaponId+'.webp',[0,0,256,256])+'</g>';
 }
 function render(a,opts={}){
  const label=escape(opts.label||'Cultivator'), source=opts.source||'player',pose=opts.portrait?'idle':(poses[a.body]?.[opts.pose]?opts.pose:'idle');
  if(opts.npc&&npcIds.includes(opts.npc)){
   const frame=npcPose(opts.pose),expression=expressions.includes(opts.expression)?opts.expression:opts.expression==='smirk'?'smile':opts.expression==='attack'?'determined':opts.expression==='guard'?'focused':'neutral',url=root+'npcs/'+opts.npc+'/'+(opts.portrait?'expressions/'+expression:frame)+'.webp';
   const holes=!opts.portrait&&frame==='guard'&&guardExclusions[opts.npc],id='npc-frame-'+(++serial);
   const image=holes?'<svg width="100%" height="100%" viewBox="0 0 529 760" preserveAspectRatio="xMidYMax meet" role="img" aria-label="'+label+'"><defs><mask id="'+id+'" maskUnits="userSpaceOnUse" x="0" y="0" width="529" height="760" style="mask-type:luminance"><rect width="529" height="760" fill="white"/><g fill="black" stroke="black" stroke-width="1">'+holes.map(points=>'<polygon points="'+points+'"/>').join('')+'</g></mask></defs><image href="'+url+'" width="529" height="760" mask="url(#'+id+')"/></svg>':'<img src="'+url+'" alt="'+label+'" decoding="async" loading="'+(opts.portrait?'lazy':'eager')+'">';
   return '<span class="lmPortrait '+(opts.portrait?'portrait':'full')+'" data-art-source="npc" data-identity="'+opts.npc+'" data-pose="'+frame+'" data-expression="'+expression+'">'+image+'</span>';
  }
  const p=assets(a,opts.expression),f=face[a.body][a.face-1],h=hair[a.body][a.hair-1],visual=opts.visual||{},family=visual.outfit||'robe',rig=MURIM_OUTFITS.families[family]?.[a.body]?.[pose]||MURIM_OUTFITS.families.robe[a.body][pose],scale=1.85;
  const nx=500,ny=260+(pose==='sword'?115:pose==='evade'?85:pose==='guard'?35:0);
  const layer=(name,url,r,style='')=>'<image class="lm'+name+'" href="'+url+'" x="'+r[0]+'" y="'+r[1]+'" width="'+r[2]+'" height="'+r[3]+'" preserveAspectRatio="xMidYMid meet" '+style+'/>';
  const bodyUrl=rig.url;
  const id='garment-'+(++serial),polygons=(rig.paletteExclusions||[]).map(points=>'<polygon points="'+points+'"/>').join('')+'<ellipse cx="'+rig.neck[0]+'" cy="'+(rig.neck[1]+7)+'" rx="'+(rig.neckWidth*.65)+'" ry="20"/>'+rig.hands.map(([x,y])=>'<ellipse cx="'+x+'" cy="'+y+'" rx="17" ry="20"/>').join('');
  const mask=(suffix,base,shape)=>'<mask id="'+id+suffix+'" x="0" y="0" width="'+rig.w+'" height="'+rig.h+'" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" style="mask-type:luminance"><rect width="'+rig.w+'" height="'+rig.h+'" fill="'+base+'"/><g fill="'+shape+'">'+polygons+'</g></mask>';
  const transform='translate('+nx+' '+ny+') scale('+(rig.flip?-scale:scale)+' '+scale+') translate('+(-rig.neck[0])+' '+(-rig.neck[1])+')';
  const bodyLayer='<g class="lmBodyPose" data-facing="'+(rig.flip?'mirrored':'original')+'" transform="'+transform+'"><defs>'+mask('-cloth','white','black')+mask('-natural','black','white')+paletteFilter(id+'-dye',visual.palette??a.palette)+'</defs>'+layer('BodyNatural',bodyUrl,[0,0,rig.w,rig.h],'mask="url(#'+id+'-natural)"')+layer('Body',bodyUrl,[0,0,rig.w,rig.h],'mask="url(#'+id+'-cloth)" filter="url(#'+id+'-dye)"')+weaponLayer(visual,rig,pose,layer)+layer('Hands',bodyUrl,[0,0,rig.w,rig.h],'mask="url(#'+id+'-natural)"')+'</g>';
  const faceLayer=layer('Face',p.face,f);
  // Register the chin to the neck, then scale the whole head assembly. Hair
  // still uses individual style anchors; no shared oversized head rectangle.
  const head='<g class="lmHead" transform="translate('+nx+' '+ny+') rotate('+rig.angle+') scale(.46) translate(-256 -385)">'+faceLayer+layer('Hair',p.hair,h)+headgearLayer(visual,layer)+'</g>';
  return '<svg class="lmCharacter body-'+a.body+' face-'+a.face+' hair-'+a.hair+'" viewBox="'+(opts.portrait?'340 20 320 390':'-220 0 1440 1250')+'" role="img" aria-label="'+label+'" data-outfit="'+escape(family)+'" data-head="'+escape(visual.head||'')+'" data-art-source="'+source+'" data-face="'+a.face+'" data-hair="'+a.hair+'" data-palette="'+a.palette+'" data-expression="'+p.expr+'" data-pose="'+pose+'">'+bodyLayer+head+'</svg>';
 }
 return {headgear,poses,npcIds,npcPose,hairLabels,hair,face,expressions,palettes,assets,hairAsset,render,environment:loc=>root+'environments/'+(locations[loc]||'cloudveil')+'.webp',locations};
})();
