(function(root){
  const clamp=(v,min=0,max=1)=>Math.max(min,Math.min(max,v));
  const mix=(a,b,t)=>a+(b-a)*t;
  const range=(p,start,end)=>clamp((p-start)/(end-start));
  const smooth=(p,start,end)=>{const t=range(p,start,end);return t*t*(3-2*t);};
  const back=t=>1+2.70158*(t-1)**3+1.70158*(t-1)**2;
  function ball(progress){
    const t=smooth(progress,.035,.97);
    return {x:mix(195.5,196.5,t),y:mix(538.5,896.5,t),size:mix(185,565,t)};
  }
  function outgoing(p,kind){
    const limits={top:[0,.30,-120],middle:[.08,.46,-130],bottom:[.18,.53,-85]};
    const [start,end,y]=limits[kind]||limits.middle;
    const t=smooth(p,start,end);
    return {opacity:1-t,y:y*t,scale:mix(1,.92,t)};
  }
  function incoming(p,kind){
    const limits={date:[.27,.45],clock:[.30,.49],merchant:[.34,.53],route:[.36,.80],burger:[.46,.72],accents:[.51,.77],runner:[.57,.84],bag:[.61,.88],star:[.63,.86],dot:[.67,.90],dialogue:[.82,.98]};
    const [start,end]=limits[kind];
    const t=range(p,start,end),s=smooth(p,start,end),spring=back(t);
    const is3d=kind==='runner'||kind==='bag';
    return {t,opacity:s,y:(1-(is3d||kind==='burger'?spring:s))*(kind==='dialogue'?24:60),scale:kind==='burger'?mix(.65,1,spring):is3d?mix(.83,1,spring):mix(.97,1,s),rx:is3d?mix(-62,0,spring):kind==='burger'?mix(18,0,spring):0,ry:is3d?mix(kind==='bag'?-28:18,0,spring):0};
  }
  function openingBall(ms){
    const t=clamp(ms/700);
    if(t<.76)return mix(.15,1.06,1-(1-t/.76)**3);
    return mix(1.06,1,smooth(t,.76,1));
  }
  function coffeeIncoming(p,kind){
    const limits={intro:[.20,.37],count:[.26,.46],caption:[.33,.50],price:[.36,.54],cups:[.40,.70],lamp:[.40,.96],dialogue:[.80,.96],receipts:[.89,1]};
    const [start,end]=limits[kind];
    const t=range(p,start,end),s=smooth(p,start,end),spring=back(t);
    // A quick first arc gives way to smaller swings, with zero velocity at rest.
    const lampAngle=t===1?0:-95*(1-t)**4*Math.cos(2.5*Math.PI*t);
    return {t,opacity:kind==='lamp'?smooth(t,0,.2):s,y:kind==='lamp'?0:(1-(kind==='cups'?spring:s))*(kind==='cups'?65:kind==='receipts'?8:22),scale:kind==='count'?mix(.88,1,spring):1,angle:kind==='lamp'?lampAngle:kind==='cups'?mix(-6,0,spring):0};
  }
  function fridayIncoming(p,kind){
    const limits={intro:[.18,.36],count:[.25,.45],caption:[.32,.51],figure:[.42,.65],edges:[.69,.89],dialogue:[.84,.97],receipts:[.92,1]};
    const [start,end]=limits[kind],t=range(p,start,end),s=smooth(p,start,end);
    return {t,opacity:s,y:(1-s)*(kind==='figure'?30:kind==='edges'?0:kind==='receipts'?8:20),scale:kind==='edges'||kind==='receipts'?1:mix(kind==='figure'?.88:.98,1,s)};
  }
  function savingsIncoming(p,kind){
    const limits={person:[.14,.46],count:[.23,.44],caption:[.29,.49],ball:[.40,.63],orbit:[.48,.70],light:[.72,.95],dialogue:[.83,.99],indicator:[.90,1]};
    const [a,b]=limits[kind],t=smooth(p,a,b),fixed=['light','orbit','indicator'].includes(kind);
    return {opacity:t,y:fixed||t===1?0:(1-t)*(kind==='ball'?-18:kind==='person'?26:14),scale:fixed?1:mix(.97,1,t)};
  }
  function savingsStreak(ms,{x,speed,phase,copy}){
    const offset=((ms*speed/1000+phase*240)%240+240)%240;
    return {x:x+Math.sin(ms/1800+phase*Math.PI*2)*3.5,y:650-offset+copy*240};
  }
  function savingsOrbit(ms){
    const phase=(ms/6800)%1,length=.68+.08*(.5-.5*Math.cos(ms/8400*Math.PI*2));
    return {phase,length,x:7,y:10,tilt:-12+2*Math.sin(ms/14000*Math.PI*2)};
  }
  function savingsSparkle(ms,{phase,duration}){
    const pulse=(.5-.5*Math.cos((ms/duration+phase)*Math.PI*2))**1.4;
    return {opacity:.12+.88*pulse,scale:.75+.45*pulse};
  }
  function releaseTarget(origin,p,velocity,last=4){
    const travel=p-origin;
    if(travel>=.35-1e-9||(velocity>.55&&travel>.035))return Math.min(last,origin+1);
    if(travel<=-.35+1e-9||(velocity<-.55&&travel<-.035))return Math.max(0,origin-1);
    return origin;
  }
  function numberReel(ms,target,index=0,reduced=false){
    const t=clamp((ms-80-index*115)/1080),eased=1-(1-t)**3;
    return reduced?10+target:(10+target)*eased;
  }
  const api={numberReel,clamp,mix,range,smooth,back,ball,outgoing,incoming,savingsIncoming,savingsStreak,savingsOrbit,savingsSparkle,coffeeIncoming,fridayIncoming,openingBall,releaseTarget};
  root.ReviewMotion=api;if(typeof module!=='undefined')module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
