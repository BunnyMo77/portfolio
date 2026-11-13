(function(root){
 function settingsFromHash(hash){
  const [route,query='']=hash.replace(/^#/,'').split('?'),q=new URLSearchParams(query);
  return {route,card:q.get('card')==='1'?1:0,amounts:q.get('amounts')!=='0',spot:q.get('spot')!=='0',merchants:q.get('merchants')!=='0'};
 }
 function previewLink(base,state){return base.split('#')[0]+'#shared-story?'+new URLSearchParams({card:String(state.card),amounts:state.amounts?'1':'0',spot:state.spot?'1':'0',merchants:state.merchants?'1':'0'});}
 if(typeof module!=='undefined'){module.exports={settingsFromHash,previewLink};return;}
 const host=document.querySelector('#share-flow');if(!host)return;
 const art=root.SHARE_ARTWORK,reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const state={...settingsFromHash(location.hash),mode:'editor',open:false,busy:false,paused:false,storyElapsed:0,storyLast:null};
 let version=0,raf=0,toastTimer;const animations=new Set();
 host.innerHTML=`<section class="share-editor" aria-label="Customize your summary">
 <div class="share-layer"><img src="assets/share/background.svg" alt=""></div>
 <div class="share-layer share-editor-header"><img src="assets/share/header.svg" alt="Share"></div>
 <div class="share-tabs" aria-label="Choose a summary"><button data-card="0" aria-label="McDonald's summary" class="is-current"></button><button data-card="1" aria-label="Alternate summary with 56 purchases"></button><i></i><i></i></div>
 <div class="share-card" id="share-card"><div class="share-card-view" data-card-view="0">${art.card}</div><div class="share-card-view" data-card-view="1" hidden>${art.alternate}</div></div>
 <div class="share-card-gesture" aria-label="Swipe left or right to choose a summary"></div>
 <div class="share-layer share-editor-controls"><img src="assets/share/controls.svg" alt="Show amounts, include spot, show merchants"></div>
 <button class="share-toggle" data-key="amounts" role="switch" aria-label="Show amounts" aria-checked="true"><span class="thumb"></span></button>
 <button class="share-toggle" data-key="spot" role="switch" aria-label="Include location" aria-checked="true"><span class="thumb"></span></button>
 <button class="share-toggle" data-key="merchants" role="switch" aria-label="Show merchants" aria-checked="true"><span class="thumb"></span></button>
 <div class="share-layer"><img src="assets/share/home.svg" alt=""></div>
 <button class="share-primary" aria-label="Open sharing options"><img src="assets/share/share-button.svg" alt="Share"></button>
 <button class="share-back" aria-label="Back to review"><img src="assets/share/back.svg" alt="back to revoluts"></button></section>
 <section class="share-story" aria-label="Your shared story preview" hidden>${art.story}<button class="share-story-pause" aria-label="Pause story" aria-pressed="false"><img src="assets/share/pause.svg" alt=""><svg viewBox="0 0 12 14" aria-hidden="true"><path d="M1 0L12 7L1 14Z" fill="#000"/></svg></button></section>
 <button class="share-dimmer" aria-label="Close sharing options" hidden><img src="assets/share/dimmer.png" alt=""></button>
 <section class="share-sheet" role="dialog" aria-modal="true" aria-label="Sharing options" hidden><img class="share-sheet-bg" src="assets/share/sheet.png" alt="">
 <button class="share-destination" data-destination="instagram" aria-label="Preview Instagram story"><img src="assets/share/instagram.png?v=share-2" alt=""><span>Instagram</span></button>
 <button class="share-destination" data-destination="linkedin" aria-label="Save image for LinkedIn"><img src="assets/share/linkedin.png?v=share-2" alt=""><span>LinkedIn</span></button>
 <button class="share-destination" data-destination="whatsapp" aria-label="Save image for WhatsApp"><img src="assets/share/whatsapp.png?v=share-2" alt=""><span>WhatsApp</span></button>
 <button class="share-save" aria-label="Save image"><img class="picker-source" src="assets/share/picker-save.svg" alt=""></button>
 <button class="share-copy" aria-label="Copy preview link"><img class="picker-source" src="assets/share/picker-copy.svg" alt=""></button></section>
 <div class="share-toast" role="status" hidden></div>`;
 const $=s=>host.querySelector(s),$$=s=>[...host.querySelectorAll(s)];
 const editor=$('.share-editor'),story=$('.share-story'),card=$('#share-card'),dimmer=$('.share-dimmer'),sheet=$('.share-sheet'),progress=$('#share-story-progress'),pauseButton=$('.share-story-pause');
 const notify=()=>{host.dataset.mode=state.mode;window.dispatchEvent(new CustomEvent('review-share-change'));};
 function stop(){version++;animations.forEach(a=>a.cancel());animations.clear();state.busy=false;}
 function animate(el,frames,options={}){
  if(!el)return Promise.resolve();
  if(reduced.matches){Object.assign(el.style,frames[frames.length-1]);return Promise.resolve();}
  const a=el.animate(frames,{duration:420,easing:'cubic-bezier(.16,1,.3,1)',fill:'both',...options});animations.add(a);return a.finished.catch(()=>{});
 }
 function preferences(){
  $$('[data-card-view]').forEach(el=>el.hidden=Number(el.dataset.cardView)!==state.card);
  $$('[data-share-variant]').forEach(el=>el.style.display=Number(el.dataset.shareVariant)===state.card?'':'none');
  $$('[data-card]').forEach(el=>{const current=Number(el.dataset.card)===state.card;el.classList.toggle('is-current',current);el.setAttribute('aria-pressed',String(current));});
  $$('[data-key]').forEach(el=>el.setAttribute('aria-checked',String(state[el.dataset.key])));
  $$('[data-share-private]').forEach(el=>el.style.display=(el.dataset.sharePrivate==='spot'?(state.spot&&state.merchants):state.merchants)?'':'none');
  $$('[data-share-cover]').forEach(el=>el.style.display=state[el.dataset.shareCover]?'none':'');
  story.querySelectorAll('[data-story-only]').forEach(el=>el.style.display='');
 }
 function editorEntrance(){
  animate(editor,[{opacity:0},{opacity:1}],{duration:300});
  animate(card,[{transform:'translate(12px,32px) scale(.94)',opacity:0},{transform:'translate(-1.6px,-3px) scale(1.008)',opacity:1,offset:.8},{transform:'none',opacity:1}],{duration:680});
  const sticker=$('#editor-sticker');if(sticker){sticker.style.transformBox='fill-box';sticker.style.transformOrigin='50% 50%';animate(sticker,[{opacity:0,transform:'scale(.85) rotate(-7deg)'},{opacity:1,transform:'none'}],{delay:260,duration:440});}
  animate($('.share-editor-header'),[{opacity:0,transform:'translateY(-8px)'},{opacity:1,transform:'none'}],{duration:360});
  animate($('.share-editor-controls'),[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'none'}],{delay:200,duration:440});
  animate($('.share-primary'),[{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'none'}],{delay:360,duration:400});
 }
 function open(mode='editor'){
  stop();host.hidden=false;host.setAttribute('aria-hidden','false');document.querySelector('.review').classList.add('sharing');state.open=true;state.mode='editor';editor.hidden=false;editor.inert=false;story.hidden=true;sheet.hidden=true;dimmer.hidden=true;preferences();notify();
  if(mode==='story')showStory(true);else editorEntrance();
 }
 async function close(){
  stop();const v=version;state.busy=true;await animate(host,[{opacity:1},{opacity:0}],{duration:240});
  if(v!==version)return;host.hidden=true;host.style.opacity='';state.open=false;state.busy=false;document.querySelector('.review').classList.remove('sharing');host.setAttribute('aria-hidden','true');stop();notify();
 }
 function edit(){stop();state.mode='editor';state.paused=false;editor.hidden=false;editor.inert=false;story.hidden=true;sheet.hidden=true;dimmer.hidden=true;preferences();notify();editorEntrance();}
 function chooseCard(index){
  if(state.mode!=='editor'||state.busy)return;const next=Math.max(0,Math.min(1,index));if(next===state.card)return;
  const direction=next>state.card?1:-1;state.card=next;preferences();
  animate(card,[{opacity:.15,transform:`translateX(${direction*32}px) scale(.97)`},{opacity:1,transform:'none'}],{duration:420});
 }
 function showSheet(){
  if(state.busy)return;stop();state.mode='sheet';editor.hidden=false;editor.inert=true;story.hidden=true;dimmer.hidden=false;sheet.hidden=false;notify();
  animate(editor,[{transform:'none'},{transform:'translateY(-8px) scale(.965)'}],{duration:440});
  animate(dimmer,[{opacity:0},{opacity:1}],{duration:300});
  animate(sheet,[{opacity:0,transform:'translateY(40px) scale(.985)'},{opacity:1,transform:'none'}],{duration:480});
  $$('.share-destination').forEach((row,i)=>animate(row,[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{delay:80+i*65,duration:300}));
  $('.share-destination').focus({preventScroll:true});
 }
 async function hideSheet(){
  if(state.mode!=='sheet')return;stop();const v=version;state.busy=true;
  await Promise.all([animate(sheet,[{opacity:1,transform:'none'},{opacity:0,transform:'translateY(25px)'}],{duration:230}),animate(dimmer,[{opacity:1},{opacity:0}],{duration:260}),animate(editor,[{transform:'translateY(-8px) scale(.965)'},{transform:'none'}],{duration:330})]);
  if(v!==version)return;sheet.hidden=true;dimmer.hidden=true;state.mode='editor';editor.inert=false;state.busy=false;notify();$('.share-primary').focus({preventScroll:true});
 }
 async function showStory(immediate=false){
  stop();const v=version;state.busy=true;state.mode='story';state.paused=false;state.storyElapsed=0;state.storyLast=null;progress.setAttribute('width','0');pauseButton.setAttribute('aria-pressed','false');pauseButton.setAttribute('aria-label','Pause story');editor.hidden=false;story.hidden=false;preferences();notify();
  if(immediate||reduced.matches){editor.hidden=true;sheet.hidden=true;dimmer.hidden=true;state.busy=false;startStory();return;}
  animate(sheet,[{opacity:1},{opacity:0,transform:'translateY(24px)'}],{duration:220});animate(dimmer,[{opacity:1},{opacity:0}],{duration:280});
  animate(card,[{transform:'none',opacity:1},{transform:art.matrix,opacity:0}],{duration:820,easing:'cubic-bezier(.22,.7,.18,1)'});
  animate(editor,[{opacity:1},{opacity:0}],{duration:650});
  animate($('#share-story-card'),[{opacity:0,transform:'translateY(30px) rotate(-5deg) scale(.94)'},{opacity:1,transform:'none'}],{delay:120,duration:760});
  animate($('#share-story-chrome'),[{opacity:0,transform:'translateY(-6px)'},{opacity:1,transform:'none'}],{delay:440,duration:300});
  await animate($('#share-story-brand'),[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'none'}],{delay:590,duration:370});
  if(v!==version)return;editor.hidden=true;sheet.hidden=true;dimmer.hidden=true;state.busy=false;startStory();pauseButton.focus({preventScroll:true});
 }
 function startStory(){if(!raf)raf=requestAnimationFrame(storyFrame);}
 function storyFrame(now){
  raf=0;if(!state.open||state.mode!=='story')return;
  if(!state.paused&&!state.busy&&!reduced.matches){if(state.storyLast!==null)state.storyElapsed+=Math.min(64,now-state.storyLast);state.storyLast=now;}else state.storyLast=null;
  progress.setAttribute('width',String(332*Math.min(1,state.storyElapsed/5200)));
  if(!state.paused&&state.storyElapsed<5200&&!reduced.matches)startStory();
 }
 function toast(text){const el=$('.share-toast');clearTimeout(toastTimer);el.textContent=text;el.hidden=false;animate(el,[{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'none'}],{duration:220});toastTimer=setTimeout(()=>el.hidden=true,2300);}
 function exportSVG(){
  preferences();const svg=story.querySelector('svg').cloneNode(true);svg.querySelectorAll('[data-export-ui]').forEach(el=>el.remove());
  svg.querySelectorAll('[data-share-variant],[data-share-private]').forEach(el=>{if(el.style.display==='none')el.remove();});
  svg.setAttribute('xmlns','http://www.w3.org/2000/svg');return new XMLSerializer().serializeToString(svg);
 }
 function download(blob,extension){
  $('#share-export-download')?.remove();const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.id='share-export-download';a.href=url;a.download=`beini-year-in-review.${extension}`;a.hidden=true;host.append(a);
  host.dataset.exportFormat=extension;host.dataset.exportBytes=String(blob.size);a.click();
  setTimeout(()=>{URL.revokeObjectURL(url);a.remove();},30000);
 }
 async function saveImage(destination=''){
  const svg=exportSVG(),blob=new Blob([svg],{type:'image/svg+xml'}),url=URL.createObjectURL(blob);
  try{
   const image=new Image();image.src=url;await image.decode();const canvas=document.createElement('canvas');canvas.width=1179;canvas.height=2550;canvas.getContext('2d').drawImage(image,0,0,1179,2550);
   const png=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!png)throw new Error('No PNG');host.dataset.exportWidth=String(canvas.width);host.dataset.exportHeight=String(canvas.height);download(png,'png');toast(destination?`Image ready for ${destination}`:'Image saved');
  }catch{download(blob,'svg');toast('Image saved as SVG');}finally{URL.revokeObjectURL(url);}
 }
 async function copyLink(){
  const text=previewLink(location.href,state);
  try{await navigator.clipboard.writeText(text);toast('Link copied');}
  catch{const input=document.createElement('textarea');input.value=text;input.style.position='fixed';input.style.opacity=0;host.append(input);input.select();const copied=document.execCommand('copy');input.remove();toast(copied?'Link copied':'Could not copy the link');}
 }
 $('.share-primary').addEventListener('click',showSheet);$('.share-back').addEventListener('click',close);dimmer.addEventListener('click',hideSheet);
 $$('[data-card]').forEach(button=>button.addEventListener('click',()=>chooseCard(Number(button.dataset.card))));
 $$('[data-key]').forEach(button=>button.addEventListener('click',()=>{state[button.dataset.key]=!state[button.dataset.key];preferences();animate(card,[{opacity:.72},{opacity:1}],{duration:220});}));
 $$('.share-destination').forEach(button=>button.addEventListener('click',()=>button.dataset.destination==='instagram'?showStory():saveImage(button.dataset.destination==='whatsapp'?'WhatsApp':'LinkedIn')));
 $('.share-save').addEventListener('click',()=>saveImage());$('.share-copy').addEventListener('click',copyLink);
 pauseButton.addEventListener('click',()=>{state.paused=!state.paused;state.storyLast=null;pauseButton.setAttribute('aria-pressed',String(state.paused));pauseButton.setAttribute('aria-label',state.paused?'Play story':'Pause story');if(!state.paused)startStory();});
 let drag=null;const gesture=$('.share-card-gesture');
 gesture.addEventListener('pointerdown',event=>{if(state.mode!=='editor'||state.busy)return;drag={x:event.clientX,y:event.clientY};gesture.setPointerCapture(event.pointerId);});
 gesture.addEventListener('pointerup',event=>{if(!drag)return;const dx=event.clientX-drag.x,dy=event.clientY-drag.y;drag=null;if(Math.abs(dx)>35&&Math.abs(dx)>Math.abs(dy))chooseCard(state.card+(dx<0?1:-1));});
 gesture.addEventListener('pointercancel',()=>drag=null);
 let sheetDrag=null;
 sheet.addEventListener('pointerdown',event=>{if(event.target.closest('button'))return;sheetDrag=event.clientY;sheet.setPointerCapture(event.pointerId);});
 sheet.addEventListener('pointerup',event=>{if(sheetDrag!==null&&event.clientY-sheetDrag>70)hideSheet();sheetDrag=null;});
 window.addEventListener('keydown',event=>{if(!state.open)return;if(event.key==='Escape'){event.preventDefault();back();}if(state.mode==='editor'&&['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();chooseCard(state.card+(event.key==='ArrowRight'?1:-1));}});
 function back(){if(state.mode==='sheet')hideSheet();else if(state.mode==='story')edit();else close();}
 root.ReviewShare={open,close,back,edit,replay:()=>state.mode==='sheet'?showSheet():state.mode==='story'?showStory():edit(),get isOpen(){return state.open;},get mode(){return state.mode;}};
 window.addEventListener('hashchange',()=>{const next=settingsFromHash(location.hash);if(['share','shared-story'].includes(next.route)){Object.assign(state,next);open(next.route==='shared-story'?'story':'editor');}});
 if(['share','shared-story'].includes(state.route))open(state.route==='shared-story'?'story':'editor');
})(typeof globalThis!=='undefined'?globalThis:this);
