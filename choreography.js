/* Authored pose choreography. Simulation settles once; animation never mutates it. */
globalThis.MURIM_CHOREO=(()=>{
 const choreography={
  'Parting Mist':['guard','sword','evade',18,-4,1], 'Falling Cloud':['evade','sword','guard',24,-18,1.05],
  'Empty Peak Guard':['guard','evade','guard',-9,0,.98], 'Cloudless Severing':['channel','sword','guard',35,-5,1.08],
  'Stillness Before Snow':['idle','sword','guard',16,0,1], 'Winter Moon Draw':['guard','sword','evade',22,-6,1.02],
  'White Silence Descent':['channel','sword','guard',28,-22,1.06], 'Black Sky Step':['guard','evade','palm',32,-8,.98],
  'Heavenless Palm':['evade','palm','guard',31,0,1.07], 'Eclipse Meridian':['channel','palm','evade',13,-3,1.1],
  'Verdant Needle':['channel','palm','guard',8,-2,1], 'Jade Leaf Palm':['guard','palm','evade',17,3,1.03],
  'Spring Returning Breath':['guard','channel','idle',0,-5,1.02], 'Iron Palm Pressure':['guard','palm','guard',14,4,1.1],
  'Furnace-Bone Stamp':['channel','palm','guard',8,9,1.09], 'Mountain-Breaking Palm':['channel','palm','guard',30,5,1.13],
  'Dustcloak Footwork':['guard','evade','guard',-30,4,.96], 'Wayfarer Staff Sweep':['guard','sword','evade',21,7,1.04],
  'Empty Bowl Counter':['evade','palm','guard',16,2,1.01], 'Lotus Vein Pierce':['channel','palm','evade',26,0,1.05],
  'Petal Shadow Exchange':['evade','sword','evade',38,-12,1], 'Black Bloom Reversal':['guard','channel','palm',11,-11,1.12]
 };
 const defaults={sword:['guard','sword','guard',18,0,1.03],frost:['idle','sword','guard',20,-3,1],unarmed:['guard','palm','guard',18,3,1.05],qi:['channel','palm','channel',10,-3,1.05],focus:['guard','evade','guard',-20,-6,1],flee:['guard','evade','idle',-35,0,.96],defend:['idle','guard','guard',-5,2,1],breath:['idle','channel','idle',0,-3,1],reverse:['evade','channel','guard',-13,-8,1.06]};
 function sequence(fx={},role='player'){
  if(role==='enemy')return fx.enemyCounter?['guard','guard','sword',-8,0,1]:fx.enemyDamage>0?['idle','guard','idle',-14,3,.98]:['idle','guard','idle',-4,0,1];
  return choreography[fx.technique]||defaults[fx.move]||defaults.qi;
 }
 function duration(mode='full'){return mode==='reduced'?40:mode==='fast'?280:1080;}
 function actor(a,opts={}){
  const fx=opts.fx,role=opts.role||'player',render=pose=>MURIM_ART.render(a,{...opts,pose,source:opts.npc?'npc':role,portrait:false});
  if(!fx)return '<div class="choreoActor resting" data-identity="'+(opts.npc||role)+'">'+render(opts.pose||'idle')+'</div>';
  const seq=sequence(fx,role),label=String(fx.technique||fx.move||'exchange').replace(/["&<>]/g,''),ms=duration(opts.motion);
  return '<div class="choreoActor exchanging role-'+role+'" data-choreography="'+label+'" style="--choreo-duration:'+ms+'ms;--step-x:'+seq[3]+'%;--step-y:'+seq[4]+'%;--impact-scale:'+seq[5]+'">'+[seq[0],seq[1],seq[2],'idle'].map((pose,i)=>'<span class="poseFrame pose-'+i+'" data-pose="'+pose+'">'+render(pose)+'</span>').join('')+'</div>';
 }
 return {choreography,defaults,sequence,duration,actor};
})();
