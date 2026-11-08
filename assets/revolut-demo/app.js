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
const coffeeBackground=document.querySelector('#coffee-background');
const lastPage=pages.length-1;
const reducedQuery=matchMedia('(prefers-reduced-motion: reduce)');
const route=document.querySelector('#pink-route');
route.innerHTML=REVIEW_ARTWORK.pinkLine;
route.querySelectorAll('style').forEach(node=>node.remove());
const routeTrace=route.querySelector('mask path');
routeTrace.style.animation='none';
routeTrace.style.strokeDasharray='1';
const sourceDelays={hero:540,caption:700,beam:750,flames:850,earth:1180,morning:1380,'moments-callout':1950};
const targetKinds={date:'date',clock:'clock',merchant:'merchant','pink-route':'route',burger:'burger',accents:'accents',runner:'runner',bag:'bag',star:'star',dot:'dot','regular-callout':'dialogue'};
const layers=pages.map((page,index)=>[...page.querySelectorAll('.layer')].map(el=>{
 const inner=document.createElement('div');inner.className='entrance';
 while(el.firstChild)inner.append(el.firstChild);
 el.append(inner);
 return {el,inner,kind:index===0?el.dataset.exit:index===1?Object.keys(targetKinds).find(key=>el.classList.contains(key)):el.dataset.coffee,delay:index===0?Object.entries(sourceDelays).find(([name])=>el.classList.contains(name))?.[1]||0:0};
}));
const clockDigits=[...document.querySelectorAll('.clock-digits span')];
const state={p:0,current:0,openingStart:null,replayStart:null,spring:null,drag:null,wheel:null,frame:0,ready:false,lastTime:0,storyStart:performance.now()};

function fit(){
 const availableHeight=Math.max(180,innerHeight-(innerWidth<=480?100:116));
 const width=Math.min(393,Math.max(120,innerWidth-24),availableHeight*393/852);
 const scale=width/393;
 document.documentElement.style.setProperty('--scale',scale);
 document.documentElement.style.setProperty('--board-width',`${width}px`);
 document.documentElement.style.setProperty('--board-height',`${852*scale}px`);
}
function updateControls(){
 const final=state.current===lastPage;
 document.querySelector('#hint').innerHTML=final?'Swipe down to go back <span aria-hidden="true">↓</span>':'Swipe up to continue <span aria-hidden="true">↑</span>';
 const next=document.querySelector('#next');
 next.innerHTML=final?'Back <span aria-hidden="true">↓</span>':'Next <span aria-hidden="true">↑</span>';
 next.setAttribute('aria-label',final?'Previous story':'Next story');
 const titles=['Transition Moments','McDonald’s Purchase in Turin','Morning Coffee Ritual'];
 document.querySelector('#announcement').textContent=`${titles[state.current]}, story ${state.current+1} of ${pages.length}`;
 segments.forEach((segment,i)=>{if(i===state.current)segment.setAttribute('aria-current','step');else segment.removeAttribute('aria-current');});
}
function settled(target,now){
 state.p=target;state.current=target;state.spring=null;state.storyStart=now;updateControls();
}
function requestFrame(){if(!state.frame)state.frame=requestAnimationFrame(frame);}
function render(now){
 const position=M.clamp(state.p,0,lastPage),p=M.clamp(position),q=M.clamp(position-1);
 let opening=state.openingStart===null?Infinity:now-state.openingStart;
 if(reducedQuery.matches)opening=Infinity;
 const transition=position>0&&position<lastPage&&Math.abs(position-Math.round(position))>.00001;
 artboard.dataset.transitioning=String(transition);
 // These DOM values also make a held gesture easy to inspect without changing playback.
 artboard.dataset.progress=position.toFixed(5);
 artboard.dataset.mode=state.drag?'drag':state.wheel?'wheel':state.spring?'settling':Number.isFinite(opening)?'opening':'idle';
 const b=M.ball(p);
 ball.style.transform=`translate3d(${b.x-b.size/2}px,${b.y-b.size/2+M.smooth(q,.02,.6)*80}px,0) scale(${b.size/185})`;
 ball.style.opacity=1-M.smooth(q,.04,.45);
 ball.setAttribute('aria-hidden',String(q>.5));
 ball.style.setProperty('--ball-float',1-M.smooth(p,0,.22));
 ballOpening.style.transform=`scale(${M.openingBall(opening)})`;
 background.style.opacity=1-M.smooth(p,.12,.72);
 coffeeBackground.style.opacity=M.smooth(q,.04,.58);
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
 const coffeeProgress=replay===null||state.current!==2?q:M.mix(0,1,replay);
 for(const {el,inner,kind} of layers[2]){
  const s=M.coffeeIncoming(coffeeProgress,kind);
  el.style.opacity=s.opacity;
  inner.style.transform=`translate3d(0,${s.y}px,0) rotate(${s.angle}deg) scale(${s.scale})`;
 }
 document.querySelector('.home-indicator').style.opacity=M.smooth(p,.84,1)*(1-M.smooth(q,0,.35));
 const reading=M.clamp((now-state.storyStart)/5200);
 segments[0].firstElementChild.style.transform=`scaleX(${p>0?1:reading})`;
 segments[1].firstElementChild.style.transform=`scaleX(${p})`;
 segments[2].firstElementChild.style.transform=`scaleX(${q})`;
 const visibleIndex=Math.round(position);
 pages.forEach((page,i)=>{page.setAttribute('aria-hidden',String(i!==visibleIndex));page.inert=i!==visibleIndex;});
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
 if(state.spring||state.openingStart!==null||state.replayStart!==null||now-state.storyStart<5200)requestFrame();
}
function stopSettling(){state.spring=null;state.replayStart=null;clearTimeout(wheelEndTimer);state.wheel=null;}
function settle(target,velocity=0){
 if(reducedQuery.matches){settled(target,performance.now());render(performance.now());return;}
 state.spring={target,x:state.p,v:velocity,last:performance.now()};requestFrame();
}
function navigate(target){
 stopSettling();state.drag=null;
 settle(M.clamp(target,0,lastPage));
}
function replay(){
 stopSettling();state.drag=null;state.p=state.current;state.storyStart=performance.now();
 if(state.current===0){state.openingStart=performance.now();state.replayStart=null;}
 else{state.openingStart=null;state.replayStart=performance.now();}
 requestFrame();
}
function beginDrag(event){
 if(event.target.closest('button')||!state.ready||event.button>0)return;
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
 state.p=M.clamp(drag.startP+(drag.startY-event.clientY)/distance,Math.max(0,drag.origin-1),Math.min(lastPage,drag.origin+1));
 render(now);
}
function finishDrag(cancelled=false){
 const drag=state.drag;if(!drag)return;state.drag=null;
 const velocity=performance.now()-drag.lastTime>110?0:drag.velocity;
 const target=cancelled?drag.origin:M.releaseTarget(drag.origin,state.p,velocity);
 settle(target,velocity*1000/(viewport.clientHeight*.72));
}
let wheelEndTimer;
viewport.addEventListener('wheel',event=>{
 event.preventDefault();if(!state.ready||state.drag)return;
 if(!state.wheel){state.spring=null;state.replayStart=null;state.wheel={origin:state.current};}
 const pixels=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?viewport.clientHeight:1);
 state.p=M.clamp(state.p+pixels/(viewport.clientHeight*.9),Math.max(0,state.wheel.origin-1),Math.min(lastPage,state.wheel.origin+1));
 render(performance.now());
 clearTimeout(wheelEndTimer);
 wheelEndTimer=setTimeout(()=>{const origin=state.wheel?.origin??state.current;state.wheel=null;settle(M.releaseTarget(origin,state.p,0));},180);
},{passive:false});
viewport.addEventListener('pointerdown',beginDrag);
viewport.addEventListener('pointermove',moveDrag);
viewport.addEventListener('pointerup',()=>finishDrag());
viewport.addEventListener('pointercancel',()=>finishDrag(true));
viewport.addEventListener('lostpointercapture',()=>finishDrag(true));
viewport.addEventListener('dragstart',event=>event.preventDefault());
document.querySelector('#next').addEventListener('click',()=>navigate(state.current===lastPage?state.current-1:state.current+1));
document.querySelector('#replay').addEventListener('click',replay);
segments.forEach((button,i)=>button.addEventListener('click',()=>navigate(i)));
window.addEventListener('keydown',event=>{
 if(document.querySelector('#receipts-dialog').open)return;
 if(event.target.closest('button')&&(event.key===' '||event.key==='Enter'))return;
 if(['ArrowDown','PageDown',' '].includes(event.key)){event.preventDefault();navigate(state.current+1);}
 if(['ArrowUp','PageUp'].includes(event.key)){event.preventDefault();navigate(state.current-1);}
 if(event.key.toLowerCase()==='r')replay();
});
window.addEventListener('resize',()=>{fit();requestFrame();});
const receiptsDialog=document.querySelector('#receipts-dialog');
document.querySelector('#show-receipts').addEventListener('click',()=>receiptsDialog.showModal());
document.querySelector('#close-receipts').addEventListener('click',()=>receiptsDialog.close());
receiptsDialog.addEventListener('click',event=>{if(event.target===receiptsDialog)receiptsDialog.close();});
reducedQuery.addEventListener('change',()=>{if(reducedQuery.matches)video.pause();else video.play().catch(()=>{});requestFrame();});
fit();
Promise.all([...document.images].map(img=>img.decode().catch(()=>{}))).then(()=>{
 state.ready=true;state.openingStart=performance.now();state.storyStart=performance.now();
 if(reducedQuery.matches)video.pause();else video.play().catch(()=>{});
 updateControls();requestFrame();
});
