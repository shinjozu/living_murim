/* Chat controller: the engine owns outcomes; this module owns delivery and recovery. */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./narrative.js'):root.LMNarrative);if(typeof module==='object'&&module.exports)module.exports=api;else root.MURIM_CHAT=api;})(typeof window!=='undefined'?window:globalThis,function(N){
 'use strict';
 let active=null,flight=null,lastSubmission=null;const normalized=new WeakSet();
 const clone=x=>JSON.parse(JSON.stringify(x)),text=x=>typeof x==='string'?x:'',now=()=>Date.now();
 function chatState(state){
  state.chat??={};const c=state.chat;c.draft=text(c.draft).slice(0,N.MAX_INPUT);c.serial=Math.max(Number.isSafeInteger(c.serial)&&c.serial>=0?c.serial:0,Number.isSafeInteger(c.submittedHighwater)?c.submittedHighwater:0);
  if(!normalized.has(c)){c.history=(Array.isArray(c.history)?c.history:[]).filter(x=>x&&typeof x.id==='string'&&['player','narrator'].includes(x.role)&&typeof x.text==='string');N.ledger(c);N.compactChat(c);normalized.add(c);}
  state.preferences??={};if(state.preferences.narrativeMode==='connected')state.preferences.narrativeMode='online';if(!N.MODES.includes(state.preferences.narrativeMode))state.preferences.narrativeMode='offline';if(!N.LENGTHS.includes(state.preferences.responseLength))state.preferences.responseLength='balanced';return c;
 }
 function restore(state,snapshot){for(const key of Object.keys(state))delete state[key];Object.assign(state,clone(snapshot));}
 function commit(options,state){const result=options.onCommit?.(state);if(result&&typeof result.then==='function')throw Error('The chat onCommit adapter must synchronously save the state and receipt together.');}
 function addHistory(chat,message){if(!chat.history.some(x=>x.id===message.id))chat.history.push(message);N.compactChat(chat);}
 function makeReceipt(state,input,intent,result,id,context){
  const scene=result.scene||{},candidate=Object.prototype.hasOwnProperty.call(result,'npc')?result.npc:intent.targetId||context.currentNpc,after=N.contextFromState(state,input);const npc=typeof candidate==='object'?candidate:[...(after.participants||[]),...(context.participants||[])].find(n=>n.id===candidate);context={...context,player:after.player||context.player,memory:[...(after.memory||[]),...(context.memory||[])].filter((m,i,a)=>a.findIndex(x=>x.eventId===m.eventId&&x.ownerId===m.ownerId)===i)};
  return N.makeReceipt({id,input,intent:intent.intent,scene:{location:scene.location||context.location||state.world?.location,title:scene.title||state.scene?.title||'The current scene',description:scene.description||scene.text||context.description||'',weather:scene.weather||state.world?.weather||'',day:scene.day||state.world?.day||1},outcome:result.outcome,facts:result.facts||[],participant:npc||null,unresolvedThreads:context.unresolvedThreads||[],stateVersion:[state.build||'',state.actionNo||0,state.world?.day||1,state.world?.phase||0].join(':'),locale:'en',memory:context.memory||[],player:context.player||{},recentDialogue:context.recentDialogue||[]});
 }
 function pending(state){const chat=chatState(state);return chat.pendingId?N.ledger(chat).find(chat.pendingId):null;}
 function currentFor(state){return active&&active.mountedState===state&&active.options.stateGetter()===state?active:null;}
 function notify(state){currentFor(state)?.refresh();}
 function refreshEngine(options,state){try{options.onRender?.(state)}catch(error){const c=chatState(state);c.error='The action is saved, but this screen could not refresh. Reload to restore the saved scene.';c.errorCode='RENDER_ERROR';}notify(state);}
 function finalize(options,state,transaction,result){
  const chat=chatState(state),snapshot=clone(state);N.ledger(chat).committed(transaction.id,result.text,result.mode);
  addHistory(chat,{id:transaction.id+':reply',receiptId:transaction.id,role:'narrator',text:result.text,mode:result.mode,day:state.world?.day||1});chat.pendingId=null;chat.error='';chat.errorCode='';
  if(chat.draft===transaction.input)chat.draft='';
  try{commit(options,state)}catch(error){restore(state,snapshot);chatState(state).error='The response could not be saved. Your resolved action and draft remain available; retry saving the response.';chatState(state).errorCode='SAVE_FAILED';notify(state);return {ok:false,error:'SAVE_FAILED'};}
  const mounted=currentFor(state);if(mounted&&mounted.input.value===transaction.input)mounted.input.value=chat.draft;
  refreshEngine(options,state);return {ok:true,id:transaction.id,result};
 }
 async function narrate(options,state,transaction){
  if(flight)return {ok:false,error:'BUSY'};const controller=new AbortController();flight={state,id:transaction.id,controller,provisional:'',phase:'connecting'};notify(state);
  try{
   const response=await (options.narrate||N.request)(transaction.receipt,{length:transaction.length||state.preferences.responseLength,mode:transaction.mode==='local'?'local':'online',purpose:transaction.purpose||'complex',signal:controller.signal,onProgress:stage=>{if(flight?.id===transaction.id){flight.phase=stage;notify(state)}},onDelta:(delta,full)=>{if(flight?.id===transaction.id){flight.provisional=typeof full==='string'?full:flight.provisional+delta;notify(state)}}});
   if(controller.signal.aborted)throw Object.assign(Error('Narration cancelled.'),{code:'CANCELLED'});
   if(options.stateGetter()!==state)return {ok:false,error:'STATE_CHANGED'};
   flight=null;return finalize(options,state,transaction,response);
  }catch(error){
   if(options.stateGetter()===state){const c=chatState(state);c.errorCode=error.code||'NARRATION_FAILED';c.error=(error.code==='CANCELLED'?'Narration cancelled.':error.message||'Connected narration could not finish.')+' The action is already resolved. Retry narration or use its offline outcome.';try{commit(options,state)}catch{c.error+=' The latest message could not be saved; keep this page open.';}}
   return {ok:false,error:error.code||'NARRATION_FAILED'};
  }finally{if(flight?.id===transaction.id)flight=null;notify(state);}
 }
 async function submit(options,value,choice){
  const state=options.stateGetter(),chat=chatState(state),input=text(value).trim().slice(0,N.MAX_INPUT);
  if(!input)return {ok:false,error:'EMPTY'};
  if(flight||pending(state)){notify(state);return {ok:false,error:'PENDING'};}
  const signature=input+'|'+JSON.stringify(choice??null);if(lastSubmission?.state===state&&lastSubmission.signature===signature&&now()-lastSubmission.at<650)return {ok:false,error:'DUPLICATE'};
  chat.draft=input;const snapshot=clone(state),context=options.contextGetter?.(state,input)||N.contextFromState(state,input),interpreted=N.interpret(input,context),intent=choice!==undefined&&choice!==null?{...interpreted,kind:'suggestion',suggested:true}:interpreted,id=`chat:${Number.isFinite(state.seed)?state.seed:0}:${++chat.serial}`;
  lastSubmission={state,signature,at:now()};N.ledger(chat).begin(id,input);chat.pendingId=id;chat.error='';chat.errorCode='';
  addHistory(chat,{id:id+':player',receiptId:id,role:'player',text:input,mode:'input',day:state.world?.day||1});notify(state);
  let result,transaction;
  try{
   if(intent.kind==='clarify')result={outcome:intent.clarification,facts:[],actionOccurred:false};
   else if(intent.kind==='pause')result={outcome:'The conversation pauses. The current scene remains where it is; no time or resources have been spent.',facts:[],actionOccurred:false};
   else result=options.resolveAction(input,intent,choice);
   if(result&&typeof result.then==='function')throw Error('The engine resolveAction adapter must be synchronous.');
   if(!result||typeof result.outcome!=='string'||!result.outcome.trim())throw Error('The engine did not return a resolved outcome.');
   // A named shortcut is still interpreted and resolved by the same engine adapter.
   const receipt=makeReceipt(state,input,intent,result,id,context);transaction=N.ledger(chatState(state)).resolved(id,receipt);transaction.length=state.preferences.responseLength;transaction.actionOccurred=result.actionOccurred===true;transaction.mode=state.preferences.narrativeMode;transaction.purpose='complex';transaction.engineActionNo=state.actionNo||0;
   commit(options,state);
  }catch(error){restore(state,snapshot);const c=chatState(state);c.draft=input;c.error='The attempt was not saved, so its local changes were rolled back. Your draft is preserved. '+(error.message||'Please try again.');c.errorCode='ACTION_FAILED';lastSubmission=null;notify(state);return {ok:false,error:'ACTION_FAILED'};}
  refreshEngine(options,state);
  if(!N.shouldNarrate(input,intent,{mode:transaction.mode,choice:choice!==undefined&&choice!==null}))return finalize(options,state,transaction,N.offline(transaction.receipt,{length:transaction.length}));
  return narrate(options,state,transaction);
 }
 function mount(options){
  if(!N)throw Error('Load narrative.js before chat-ui.js.');if(!options?.host||!options.form||!options.input||typeof options.stateGetter!=='function'||typeof options.resolveAction!=='function')throw Error('Chat requires host, form, input, stateGetter and synchronous resolveAction.');
  const state=options.stateGetter();chatState(state);if(flight&&flight.state!==state)flight.controller.abort('new game');const previous=active?.mountedState===state?active.viewState():null;active?.destroy();
  const doc=options.host.ownerDocument||document,win=doc.defaultView||globalThis;let disposed=false,draftTimer=null,follow=previous?.follow??true,newResponses=previous?.newResponses??false,knownLastId=previous?.knownLastId||null;const listeners=[];
  const element=(tag,id,className)=>{let existing=options.host.querySelector?.('#'+id);if(existing)return existing;let node=doc.createElement(tag);node.id=id;if(className)node.className=className;options.host.appendChild(node);return node;};
  const history=element('div','chatHistory','chatHistory');history.setAttribute('role','log');history.setAttribute('aria-label','Conversation history');history.setAttribute('aria-live','off');
  const newest=element('button','chatNewResponse','chatNewResponse');newest.type='button';newest.textContent='New response ↓';newest.hidden=!newResponses;if(previous)history.scrollTop=previous.scrollTop;
  const status=options.status||element('p','chatStatus','chatStatus');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  const modeLabel=element('p','chatMode','chatMode');
  const retry=element('button','chatRetry','chatRecovery');retry.type='button';retry.textContent='Retry narration';
  const useOffline=element('button','chatUseOffline','chatRecovery');useOffline.type='button';useOffline.textContent='Use offline outcome';
  const cancel=element('button','chatCancel','chatRecovery');cancel.type='button';cancel.textContent='Cancel narration';
  const expand=element('button','chatExpand','chatRecovery');expand.type='button';expand.textContent='Expand this scene';
  const connection=element('button','chatConnectionTest','chatRecovery');connection.type='button';connection.textContent='Check model connection';
  const budgetLabel=element('p','chatBudget','chatMode');let serviceInfo=null,connectionMessage='';
  options.input.maxLength=N.MAX_INPUT;options.input.setAttribute('aria-label',options.input.getAttribute('aria-label')||'Say something or describe your next action');options.input.value=state.chat.draft;
  const on=(node,type,fn)=>{node.addEventListener(type,fn);listeners.push(()=>node.removeEventListener(type,fn));};
  function isNearEnd(){if(history.scrollHeight>history.clientHeight+8&&history.clientHeight>0)return history.scrollHeight-history.scrollTop-history.clientHeight<100;const rect=options.form.getBoundingClientRect?.();return !rect||rect.top<(win.innerHeight||900)+120&&rect.bottom>-100;}
  function showNewest(){newResponses=false;newest.hidden=true;follow=true;if(history.scrollHeight>history.clientHeight+8&&history.clientHeight>0)history.scrollTop=history.scrollHeight;else options.form.scrollIntoView?.({block:'end',behavior:state.preferences.reducedMotion?'auto':'smooth'});}
  function refresh(){
   if(disposed)return;const current=options.stateGetter();if(current!==state)return;const c=chatState(current),tx=pending(current),running=flight?.state===state&&flight.id===tx?.id;
   const messages=c.history.slice();if(c.historySummary)messages.unshift({id:'chat-archive-summary',role:'narrator',text:c.historySummary,mode:'archive'});if(tx?.status==='resolved'&&!messages.some(x=>x.id===tx.id+':reply'))messages.push({id:tx.id+':reply',role:'narrator',text:running&&flight.provisional?flight.provisional:tx.receipt?.outcome||'',mode:running?'provisional':'resolved'});
   const map=new Map(Array.from(history.children||[]).map(n=>[n.getAttribute('data-message-id'),n]));let changed=false;
   for(const message of messages){let node=map.get(message.id);if(!node){node=doc.createElement('article');node.setAttribute('data-message-id',message.id);const label=doc.createElement('span');label.className='chatSpeaker';const body=doc.createElement('p');body.className='chatText';node.appendChild(label);node.appendChild(body);history.appendChild(node);changed=true;}map.delete(message.id);node.className='chatMessage '+(message.role==='player'?'chatPlayer':'chatNarrator');node.setAttribute('data-mode',message.mode||'offline');let label=node.children[0],body=node.children[1];const speaker=message.role==='player'?'You':message.mode==='provisional'?'Narrator · streaming':['online','connected'].includes(message.mode)?'Narrator · budgeted online':message.mode==='local'?'Narrator · local model':message.mode==='resolved'?'Resolved outcome':'Narrator · offline';if(label.textContent!==speaker)label.textContent=speaker;if(body.textContent!==message.text){body.textContent=message.text;changed=true;}}
   for(const node of map.values())node.remove();
   const lastId=messages.at(-1)?.id;if(changed&&knownLastId){if(!follow){newResponses=true;newest.hidden=false;}else if(history.scrollHeight>history.clientHeight+8&&history.clientHeight>0)history.scrollTop=history.scrollHeight;}
   knownLastId=lastId||knownLastId;const mode=current.preferences.narrativeMode;modeLabel.textContent=mode==='online'?'Budgeted online AI · only complex typed scenes or explicit expansion can request a model.':mode==='local'?'Local model · requires your own compatible inference service; no hosted API calls.':'Offline narration · authored scenes and local action rules. No model requests or API cost.';
   budgetLabel.textContent=connectionMessage|| (mode==='online'&&serviceInfo?.budget?`Hosted budget: $${Number(serviceInfo.budget.remainingUsd).toFixed(4)} of $${Number(serviceInfo.budget.limitUsd).toFixed(4)} remaining this ${serviceInfo.budget.periodKind}. ${serviceInfo.budget.uncertainRequests||0} uncertain request(s) reserved. Estimates, not provider billing.`:mode==='online'?'Hosted spending defaults to $0. Configure a server limit and explicit token prices before enabling paid narration.':'');
   if(running)status.textContent=flight.phase==='connecting'?'Action saved. Connecting to the narrator…':'Action saved. Narrator is responding…';else if(c.error)status.textContent=c.error;else if(tx?.status==='resolved')status.textContent='This action is already resolved. Use the saved outcome or retry its narration.';else if(tx?.status==='pending')status.textContent='An interrupted submission has no saved outcome. It has not been repeated. Dismiss it with the offline outcome before continuing.';else status.textContent='Describe speech or an attempt. Suggested choices are optional.';
   retry.hidden=!tx||tx.status!=='resolved'||running;useOffline.hidden=!tx||running;cancel.hidden=!running;expand.hidden=mode==='offline'||!!tx||!c.transactions.some(t=>t.status==='committed'&&t.receipt&&t.engineActionNo===(state.actionNo||0));connection.hidden=mode==='offline';
   for(const button of Array.from(options.form.querySelectorAll?.('button[type="submit"],input[type="submit"]')||[]))button.disabled=!!tx||!!flight;
   options.input.setAttribute('aria-busy',running?'true':'false');return {pending:tx?.status||null,busy:!!running,newResponses};
  }
  function saveDraft(){if(disposed||options.stateGetter()!==state)return;state.chat.draft=options.input.value.slice(0,N.MAX_INPUT);try{commit(options,state)}catch{state.chat.error='Your draft is still here, but local storage could not save it. Keep this page open.';state.chat.errorCode='SAVE_FAILED';}refresh();}
  function retryNarration(){const tx=pending(state);if(!tx||tx.status!=='resolved'||flight)return Promise.resolve({ok:false,error:'NO_RETRY'});state.chat.error='';return narrate(options,state,tx);}
  function acceptOffline(){let tx=pending(state);if(!tx||flight)return {ok:false,error:'NO_PENDING'};if(tx.status==='pending'){const receipt=makeReceipt(state,tx.input,{intent:'unknown'},{outcome:'The interrupted submission has no saved result. It was not repeated. The saved scene is unchanged; describe a new attempt when ready.',actionOccurred:false},tx.id,options.contextGetter?.(state)||N.contextFromState(state));tx=N.ledger(state.chat).resolved(tx.id,receipt);}return finalize(options,state,tx,N.offline(tx.receipt,{length:tx.length||state.preferences.responseLength}));}
  function expandScene(){const c=chatState(state);if(flight||pending(state)||state.preferences.narrativeMode==='offline')return Promise.resolve({ok:false,error:'NO_EXPANSION'});const original=[...c.transactions].reverse().find(t=>t.status==='committed'&&t.receipt&&t.engineActionNo===(state.actionNo||0));if(!original)return Promise.resolve({ok:false,error:'NO_SETTLED_SCENE'});const snapshot=clone(state),id=`chat:${Number.isFinite(state.seed)?state.seed:0}:${++c.serial}`;N.ledger(c).begin(id,original.input);const receipt=N.makeReceipt({...original.receipt,id});const tx=N.ledger(c).resolved(id,receipt);Object.assign(tx,{length:state.preferences.responseLength,mode:state.preferences.narrativeMode,purpose:'expand',engineActionNo:state.actionNo||0,actionOccurred:false});c.pendingId=id;addHistory(c,{id:id+':player',receiptId:id,role:'player',text:'Expand this settled scene.',mode:'input',day:state.world?.day||1});try{commit(options,state)}catch{restore(state,snapshot);state.chat.error='Expansion could not be saved. The settled scene is unchanged.';notify(state);return Promise.resolve({ok:false,error:'SAVE_FAILED'});}return narrate(options,state,tx);}
  async function checkConnection(test=true){connection.disabled=true;connectionMessage=test?'Testing model metadata; no generation is requested…':'Reading narration availability…';refresh();try{const data=await (options.serviceStatus||N.serviceStatus)({test,mode:state.preferences.narrativeMode});if(test){connectionMessage=data.message||'Connection test completed.';serviceInfo=await (options.serviceStatus||N.serviceStatus)({test:false,mode:state.preferences.narrativeMode});if(serviceInfo.budget)connectionMessage+=` Hosted budget remaining: $${Number(serviceInfo.budget.remainingUsd).toFixed(4)}.`;}else{serviceInfo=data;connectionMessage='';}}catch(error){connectionMessage=(error.message||'The optional narration server is unavailable.')+' Offline gameplay remains available.';}finally{connection.disabled=false;refresh();}return serviceInfo;}
  on(options.form,'submit',event=>{event.preventDefault();clearTimeout(draftTimer);follow=isNearEnd();void submit(options,options.input.value);});
  on(options.input,'input',()=>{state.chat.draft=options.input.value.slice(0,N.MAX_INPUT);clearTimeout(draftTimer);draftTimer=setTimeout(saveDraft,500)});on(options.input,'blur',()=>{clearTimeout(draftTimer);saveDraft()});
  on(history,'scroll',()=>{follow=isNearEnd();if(follow){newResponses=false;newest.hidden=true}});if(win.addEventListener)on(win,'scroll',()=>{follow=isNearEnd();if(follow){newResponses=false;newest.hidden=true}});
  on(newest,'click',showNewest);on(retry,'click',()=>void retryNarration());on(useOffline,'click',acceptOffline);on(cancel,'click',()=>flight?.state===state&&flight.controller.abort('cancelled'));on(expand,'click',()=>void expandScene());on(connection,'click',()=>void checkConnection(true));
  const api={options,mountedState:state,input:options.input,refresh,viewState:()=>({follow,newResponses,knownLastId,scrollTop:history.scrollTop}),submit:(value=options.input.value,choice)=>{clearTimeout(draftTimer);follow=isNearEnd();return submit(options,value,choice)},retry:retryNarration,useOffline:acceptOffline,expand:expandScene,checkConnection,cancel:()=>{if(flight?.state===state)flight.controller.abort('cancelled')},destroy(){if(disposed)return;disposed=true;clearTimeout(draftTimer);listeners.forEach(fn=>fn());if(active===api)active=null;}};
  active=api;refresh();return api;
 }
 // Engine events already resolved outside chat (such as combat) belong in the
 // same transcript. This never runs an action or requests provider narration.
 function recordOutcome(state,outcome){
  const value=text(outcome).trim();if(!value)return null;
  const c=chatState(state),id=`event:${Number.isFinite(state.seed)?state.seed:0}:${++c.serial}`;
  addHistory(c,{id,role:'narrator',text:value.slice(0,N.MAX_REPLY),mode:'offline',day:state.world?.day||1});
  return id;
 }
 return Object.freeze({mount,chatState,recordOutcome,get active(){return active;}});
});
