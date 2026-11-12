/* One reversible progress value owns the scene; video and idle motion stay independent. */
const M=ReviewMotion;
const viewport=document.querySelector('#viewport');
const artboard=document.querySelector('#artboard');
const pages=[...document.querySelectorAll('.page')];
const segments=[...document.querySelectorAll('.segment')];
const progressBar=document.querySelector('.story-progress');
const video=document.querySelector('#disco');
const ball=document.querySelector('#shared-ball');
const ballOpening=document.querySelector('#ball-opening');
const background=document.querySelector('#burgundy-background');
const savingsBackground=document.querySelector('#savings-background');
const coffeeBackground=document.querySelector('#coffee-background');
const fridayBackground=document.querySelector('#friday-background');
const edgeCanvas=document.querySelector('#pink-edge-sequence');
const edgeSequence=new PngSequence(edgeCanvas,{
 sources:Array.from({length:20},(_,i)=>`assets/friday/frames/Comp 2_${String(i+25).padStart(5,'0')}.png`)
});
const lastPage=pages.length-1;
const reducedQuery=matchMedia('(prefers-reduced-motion: reduce)');
const route=document.querySelector('#pink-route');
route.innerHTML=REVIEW_ARTWORK.pinkLine;
route.querySelectorAll('style').forEach(node=>node.remove());
const routeTrace=route.querySelector('mask path');
document.querySelector('#savings-light').innerHTML=SAVINGS_ARTWORK;
document.querySelector('#savings-orbit').innerHTML=SAVINGS_ORBIT_ARTWORK;
const streaks=document.querySelector('#savings-streaks');
const lightLines=[...streaks.querySelectorAll('.savings-streak')].map(el=>({el,x:Number(el.dataset.x),speed:Number(el.dataset.speed),phase:Number(el.dataset.phase),copy:Number(el.dataset.copy)}));
const orbitTrace=document.querySelector('#savings-orbit-trace'),orbitTrack=document.querySelector('#savings-orbit-track');
const sparkles=[...document.querySelectorAll('.savings-sparkle')].map(el=>({el,phase:Number(el.dataset.phase),duration:Number(el.dataset.duration)}));
routeTrace.style.animation='none';
routeTrace.style.strokeDasharray='1';
const sourceDelays={hero:540,caption:700,beam:750,flames:850,earth:1180,morning:1380,'moments-callout':1950};
const targetKinds={date:'date',clock:'clock',merchant:'merchant','pink-route':'route',burger:'burger',accents:'accents',runner:'runner',bag:'bag',star:'star',dot:'dot','regular-callout':'dialogue'};
const layers=pages.map((page,index)=>[...page.querySelectorAll('.layer')].map(el=>{
 const inner=document.createElement('div');inner.className='entrance';
 while(el.firstChild)inner.append(el.firstChild);
 el.append(inner);
 return {el,inner,kind:index===0?el.dataset.exit:index===1?Object.keys(targetKinds).find(key=>el.classList.contains(key)):index===2?el.dataset.savings:index===3?el.dataset.coffee:el.dataset.friday,delay:index===0?Object.entries(sourceDelays).find(([name])=>el.classList.contains(name))?.[1]||0:0};
}));
const clockDigits=[...document.querySelectorAll('.clock-digits span')];
const state={p:0,current:0,openingStart:null,replayStart:null,spring:null,drag:null,wheel:null,frame:0,ready:false,lastTime:0,storyStart:performance.now(),edgeActive:false,lightActive:false,lightElapsed:0,lightLast:null};

function syncEdges(active){
 if(active===state.edgeActive)return;
 state.edgeActive=active;
 if(active)edgeSequence.play(performance.now());
 else edgeSequence.pause(performance.now());
}

function fit(){
 const availableHeight=Math.max(180,innerHeight-(innerWidth<=480?100:116));
 const width=Math.min(393,Math.max(120,innerWidth-24),availableHeight*393/852);
 const scale=width/393;
 document.documentElement.style.setProperty('--scale',scale);
 document.documentElement.style.setProperty('--board-width',`${width}px`);
 document.documentElement.style.setProperty('--board-height',`${852*scale}px`);
 const bounds=viewport.getBoundingClientRect();
 document.documentElement.style.setProperty('--sheet-left',`${bounds.left}px`);
 document.documentElement.style.setProperty('--sheet-bottom',`${Math.max(0,innerHeight-bounds.bottom)}px`);
}
function updateControls(){
 const final=state.current===lastPage;
 const sharing=window.ReviewShare?.isOpen;
 progressBar.inert=Boolean(sharing);progressBar.setAttribute('aria-hidden',String(Boolean(sharing)));
 document.querySelector('#hint').innerHTML=sharing?(window.ReviewShare.mode==='sheet'?'Choose where to share':window.ReviewShare.mode==='story'?'Your story preview':'Swipe sideways to choose'):final?'Share your year':'Swipe up to continue';
 const next=document.querySelector('#next');
 next.innerHTML=sharing?'Back':final?'Share':'Next';
 next.setAttribute('aria-label',sharing?'Back':final?'Share your review':'Next story');
 const titles=['Transition Moments','McDonald’s Purchase in Turin','First Savings Account','Morning Coffee Ritual','Friday Night Spending'];
 const shareTitles={editor:'Customize summary, step 1 of 3',sheet:'Choose sharing options, step 2 of 3',story:'Shared story preview, step 3 of 3'};
 document.querySelector('#announcement').textContent=sharing?shareTitles[window.ReviewShare.mode]:`${titles[state.current]}, story ${state.current+1} of ${pages.length}`;
 segments.forEach((segment,i)=>{if(i===state.current)segment.setAttribute('aria-current','step');else segment.removeAttribute('aria-current');});
 if(window.parent!==window){
  window.parent.postMessage({revolutDemoPage:state.current,revolutShareMode:sharing?window.ReviewShare.mode:null},'*');
 }
}
function settled(target,now){
 state.p=target;state.current=target;state.spring=null;state.storyStart=now;updateControls();
}
function requestFrame(){if(!state.frame)state.frame=requestAnimationFrame(frame);}
function render(now){
 const position=M.clamp(state.p,0,lastPage),p=M.clamp(position),q=M.clamp(position-1),r=M.clamp(position-2),u=M.clamp(position-3);
 let opening=state.openingStart===null?Infinity:now-state.openingStart;
 if(reducedQuery.matches)opening=Infinity;
 const transition=position>0&&position<lastPage&&Math.abs(position-Math.round(position))>.00001;
 artboard.dataset.transitioning=String(transition);
 // These DOM values also make a held gesture easy to inspect without changing playback.
 artboard.dataset.progress=position.toFixed(5);
 artboard.dataset.mode=state.drag?'drag':state.wheel?'wheel':state.spring?'settling':Number.isFinite(opening)?'opening':'idle';
 const b=M.ball(p);
 ball.style.transform=`translate3d(${b.x-b.size/2}px,${b.y-b.size/2+M.smooth(r,.02,.6)*80}px,0) scale(${b.size/185})`;
 ball.style.opacity=1-M.smooth(r,.04,.45);
 ball.setAttribute('aria-hidden',String(r>.5));
 ball.style.setProperty('--ball-float',1-M.smooth(p,0,.22));
 ballOpening.style.transform=`scale(${M.openingBall(opening)})`;
 background.style.opacity=1-M.smooth(p,.12,.72);
 savingsBackground.style.opacity=M.smooth(q,.04,.58);
 coffeeBackground.style.opacity=M.smooth(r,.04,.58);
 fridayBackground.style.opacity=M.smooth(u,.06,.62);
 const light=M.smooth(p,.35,.65)*(1-M.smooth(q,.18,.58));
 progressBar.style.setProperty('--progress-color',`${Math.round(M.mix(255,59,light))},${Math.round(M.mix(255,28,light))},${Math.round(M.mix(255,51,light))}`);

 for(const {el,inner,kind,delay} of layers[0]){
  const s=M.outgoing(p,kind);
  el.style.opacity=s.opacity;
  el.style.transform=`translate3d(0,${s.y}px,0) scale(${s.scale})`;
  const a=M.smooth(opening,delay,delay+620);
  inner.style.opacity=a;
  inner.style.transform=`translate3d(0,${(1-a)*20}px,0) scale(${M.mix(.97,1,a)})`;
 }
 const replay=state.replayStart===null?null:M.clamp((now-state.replayStart)/1850);
 const targetProgress=replay===null||state.current!==1?p:M.mix(.25,1,replay);
 for(const {el,inner,kind} of layers[1]){
  const s=M.incoming(targetProgress,targetKinds[kind]);
  const exit=M.outgoing(q,['date','clock','merchant'].includes(kind)?'top':kind==='regular-callout'?'bottom':'middle');
  el.style.opacity=s.opacity*exit.opacity;
  el.style.transform=`translate3d(0,${exit.y}px,0) scale(${exit.scale})`;
  inner.style.transform=`perspective(850px) translate3d(0,${s.y}px,0) rotateX(${s.rx}deg) rotateY(${s.ry}deg) scale(${s.scale})`;
 }
 routeTrace.style.strokeDashoffset=1-M.incoming(targetProgress,'route').t;
 clockDigits.forEach((digit,i)=>{
  const t=M.smooth(targetProgress,.32+i*.018,.47+i*.018);
  digit.style.transform=`perspective(500px) rotateX(${M.mix(-85,0,t)}deg)`;
 });
 const savingsProgress=replay===null||state.current!==2?q:replay;
 for(const {el,inner,kind} of layers[2]){
  const s=M.savingsIncoming(savingsProgress,kind);
  const exit=M.outgoing(r,['count','caption'].includes(kind)?'top':['dialogue','indicator'].includes(kind)?'bottom':'middle');
  el.style.opacity=s.opacity*exit.opacity;
  el.style.transform=`translate3d(0,${exit.y}px,0) scale(${exit.scale})`;
  inner.style.transform=`translate3d(0,${s.y}px,0) scale(${s.scale})`;
 }
 state.lightActive=position===2&&state.current===2&&replay===null&&!state.drag&&!state.wheel&&!reducedQuery.matches;
 if(state.lightActive){if(state.lightLast!==null)state.lightElapsed+=Math.min(64,Math.max(0,now-state.lightLast));state.lightLast=now;}else state.lightLast=null;
 lightLines.forEach(line=>{const s=M.savingsStreak(state.lightElapsed,line);line.el.setAttribute('transform',`translate(${s.x.toFixed(3)} ${s.y.toFixed(3)})`);});
 const orbit=M.savingsOrbit(state.lightElapsed);
 orbitTrace.setAttribute('stroke-dasharray',`${orbit.length} ${1-orbit.length}`);
 orbitTrace.setAttribute('stroke-dashoffset',-orbit.phase);
 orbitTrack.setAttribute('transform',`translate(${orbit.x} ${orbit.y}) rotate(${orbit.tilt} 187.708014 238.83848)`);
 sparkles.forEach(spark=>{const s=M.savingsSparkle(state.lightElapsed,spark);spark.el.style.opacity=s.opacity;spark.el.setAttribute('transform',`scale(${s.scale})`);});
 streaks.dataset.elapsed=state.lightElapsed.toFixed(3);
 streaks.dataset.active=String(state.lightActive);
 const coffeeProgress=replay===null||state.current!==3?r:replay;
 for(const {el,inner,kind} of layers[3]){
  const s=M.coffeeIncoming(coffeeProgress,kind);
  const exit=M.outgoing(u,['intro','count','caption','price'].includes(kind)?'top':['dialogue','receipts'].includes(kind)?'bottom':'middle');
  el.style.opacity=s.opacity*exit.opacity;
  el.style.transform=`translate3d(0,${exit.y}px,0) scale(${exit.scale})`;
  inner.style.transform=`translate3d(0,${s.y}px,0) rotate(${s.angle}deg) scale(${s.scale})`;
 }
 const fridayProgress=replay===null||state.current!==4?u:replay;
 for(const {el,inner,kind} of layers[4]){
  const s=M.fridayIncoming(fridayProgress,kind);
  el.style.opacity=s.opacity;
  inner.style.transform=`translate3d(0,${s.y}px,0) scale(${s.scale})`;
 }
 syncEdges(position===4&&state.current===4&&replay===null&&!state.drag&&!state.wheel&&!reducedQuery.matches&&!window.ReviewShare?.isOpen);
 edgeSequence.tick(now);
 document.querySelector('.home-indicator').style.opacity=M.smooth(p,.84,1)*(1-M.smooth(q,0,.35));
 const reading=M.clamp((now-state.storyStart)/5200);
 segments.forEach((segment,i)=>{segment.firstElementChild.style.transform=`scaleX(${i===0?(p>0?1:reading):M.clamp(position-i+1)})`;});
 const visibleIndex=Math.round(position);
 pages.forEach((page,i)=>{const hidden=i!==visibleIndex||Boolean(window.ReviewShare?.isOpen);page.setAttribute('aria-hidden',String(hidden));page.inert=hidden;});
}
function frame(now){
 state.frame=0;
 if(state.spring){
  const s=state.spring,dt=Math.min(.032,Math.max(.001,(now-s.last)/1000));s.last=now;
  s.v+=(190*(s.target-s.x)-26*s.v)*dt;s.x+=s.v*dt;
  state.p=M.clamp(s.x,0,lastPage);
  if(Math.abs(s.x-s.target)<.0005&&Math.abs(s.v)<.006)settled(s.target,now);
 }
 if(state.openingStart!==null&&now-state.openingStart>=2650)state.openingStart=null;
 if(state.replayStart!==null&&now-state.replayStart>=1850)state.replayStart=null;
 render(now);
 if(state.spring||state.openingStart!==null||state.replayStart!==null||state.edgeActive||state.lightActive||now-state.storyStart<5200)requestFrame();
}
function stopSettling(){state.spring=null;state.replayStart=null;clearTimeout(wheelEndTimer);state.wheel=null;}
function settle(target,velocity=0){
 if(reducedQuery.matches){settled(target,performance.now());render(performance.now());return;}
 state.spring={target,x:state.p,v:velocity,last:performance.now()};requestFrame();
}
function navigate(target){
 if(target>lastPage&&state.current===lastPage&&window.ReviewShare){window.ReviewShare.open();return;}
 stopSettling();state.drag=null;
 settle(M.clamp(target,0,lastPage));
}
function replay(){
 stopSettling();state.drag=null;state.p=state.current;state.storyStart=performance.now();
 if(state.current===0){state.openingStart=performance.now();state.replayStart=null;}
 else{state.openingStart=null;state.replayStart=performance.now();}
 if(state.current===2){state.lightElapsed=0;state.lightLast=null;}
 if(state.current===4){
  syncEdges(false);edgeSequence.reset();
 }
 requestFrame();
}
function beginDrag(event){
 if(window.ReviewShare?.isOpen||event.target.closest('button')||!state.ready||event.button>0)return;
 event.preventDefault();stopSettling();
 state.drag={origin:state.current,startP:state.p,startY:event.clientY,lastY:event.clientY,lastTime:performance.now(),velocity:0};
 viewport.setPointerCapture(event.pointerId);
 if(video.paused&&!reducedQuery.matches)video.play().catch(()=>{});
 requestFrame();
}
function moveDrag(event){
 const drag=state.drag;if(!drag)return;
 const now=performance.now(),elapsed=now-drag.lastTime;
 if(elapsed>0){drag.velocity=(drag.lastY-event.clientY)/elapsed;drag.lastTime=now;drag.lastY=event.clientY;}
 const distance=viewport.clientHeight*.72;
 drag.shareTravel=drag.origin===lastPage?M.clamp((drag.startY-event.clientY)/distance):0;
 state.p=M.clamp(drag.startP+(drag.startY-event.clientY)/distance,Math.max(0,drag.origin-1),Math.min(lastPage,drag.origin+1));
 render(now);
}
function finishDrag(cancelled=false){
 const drag=state.drag;if(!drag)return;state.drag=null;
 const velocity=performance.now()-drag.lastTime>110?0:drag.velocity;
 if(!cancelled&&drag.origin===lastPage&&(drag.shareTravel>=.35||(velocity>.55&&drag.shareTravel>.035))&&window.ReviewShare){stopSettling();state.p=lastPage;window.ReviewShare.open();return;}
 const target=cancelled?drag.origin:M.releaseTarget(drag.origin,state.p,velocity,lastPage);
 settle(target,velocity*1000/(viewport.clientHeight*.72));
}
let wheelEndTimer;
viewport.addEventListener('wheel',event=>{
 event.preventDefault();if(window.ReviewShare?.isOpen||!state.ready||state.drag)return;
 if(!state.wheel){state.spring=null;state.replayStart=null;state.wheel={origin:state.current,shareTravel:0};}
 const pixels=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?viewport.clientHeight:1);
 if(state.wheel.origin===lastPage)state.wheel.shareTravel=M.clamp(state.wheel.shareTravel+pixels/(viewport.clientHeight*.9));
 state.p=M.clamp(state.p+pixels/(viewport.clientHeight*.9),Math.max(0,state.wheel.origin-1),Math.min(lastPage,state.wheel.origin+1));
 render(performance.now());
 clearTimeout(wheelEndTimer);
 wheelEndTimer=setTimeout(()=>{const origin=state.wheel?.origin??state.current,shareTravel=state.wheel?.shareTravel||0;state.wheel=null;if(origin===lastPage&&shareTravel>=.35&&window.ReviewShare){state.p=lastPage;window.ReviewShare.open();return;}settle(M.releaseTarget(origin,state.p,0,lastPage));},180);
},{passive:false});
viewport.addEventListener('pointerdown',beginDrag);
viewport.addEventListener('pointermove',moveDrag);
viewport.addEventListener('pointerup',()=>finishDrag());
viewport.addEventListener('pointercancel',()=>finishDrag(true));
viewport.addEventListener('lostpointercapture',()=>finishDrag(true));
viewport.addEventListener('dragstart',event=>event.preventDefault());
document.querySelector('#next').addEventListener('click',()=>{if(window.ReviewShare?.isOpen)window.ReviewShare.back();else if(state.current===lastPage)window.ReviewShare?.open();else navigate(state.current+1);});
document.querySelector('#replay').addEventListener('click',()=>window.ReviewShare?.isOpen?window.ReviewShare.replay():replay());
window.addEventListener('review-share-change',()=>{updateControls();requestFrame();});
window.addEventListener('hashchange',async()=>{
 const route=window.location.hash.slice(1).split('?')[0],target=['share','shared-story'].includes(route)?lastPage:pages.findIndex(page=>page.id===route);
 if(target<0)return;if(!['share','shared-story'].includes(route)&&window.ReviewShare?.isOpen)await window.ReviewShare.close();
 stopSettling();state.drag=null;state.openingStart=null;settled(target,performance.now());requestFrame();
});
segments.forEach((button,i)=>button.addEventListener('click',()=>navigate(i)));
window.addEventListener('keydown',event=>{
 if(window.ReviewShare?.isOpen)return;
 if(document.querySelector('#receipts-dialog').open)return;
 if(event.target.closest('button')&&(event.key===' '||event.key==='Enter'))return;
 if(['ArrowDown','PageDown',' '].includes(event.key)){event.preventDefault();navigate(state.current+1);}
 if(['ArrowUp','PageUp'].includes(event.key)){event.preventDefault();navigate(state.current-1);}
 if(event.key.toLowerCase()==='r')replay();
});
window.addEventListener('resize',()=>{fit();requestFrame();});
const receiptsDialog=document.querySelector('#receipts-dialog');
document.querySelector('#show-receipts').addEventListener('click',()=>receiptsDialog.showModal());
document.querySelector('#show-friday-receipts').addEventListener('click',()=>receiptsDialog.showModal());
document.querySelector('#close-receipts').addEventListener('click',()=>receiptsDialog.close());
receiptsDialog.addEventListener('click',event=>{if(event.target===receiptsDialog)receiptsDialog.close();});
reducedQuery.addEventListener('change',()=>{if(reducedQuery.matches)video.pause();else video.play().catch(()=>{});requestFrame();});
fit();
Promise.all([edgeSequence.ready,...[...document.images].map(img=>img.decode().catch(()=>{}))]).then(()=>{
 state.ready=true;state.openingStart=performance.now();state.storyStart=performance.now();
 const requested=window.location?.hash?.slice(1).split('?')[0],initial=['share','shared-story'].includes(requested)?lastPage:requested?pages.findIndex(page=>page.id===requested):-1;
 if(initial>=0){state.p=initial;state.current=initial;state.openingStart=null;}
 if(reducedQuery.matches)video.pause();else video.play().catch(()=>{});
 updateControls();requestFrame();
});
