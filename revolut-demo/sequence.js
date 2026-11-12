/* Plays the supplied transparent PNG frames directly; no video autoplay dependency. */
(function(root){
 class PngSequence{
  constructor(canvas,{sources,fps=30,pulseMs=2800}){
   this.canvas=canvas;this.context=canvas.getContext('2d');
   this.fps=fps;this.pulseMs=pulseMs;this.playing=false;this.elapsed=0;this.started=0;this.images=[];
   this.ready=Promise.all(sources.map(async src=>{
    const image=new Image();image.src=src;await image.decode();return image;
   })).then(images=>{this.images=images;this.tick(0);});
  }
  play(now){if(!this.playing){this.started=now;this.playing=true;}}
  pause(now){if(this.playing){this.elapsed+=Math.max(0,now-this.started);this.playing=false;}}
  reset(){this.elapsed=0;this.playing=false;this.tick(0);}
  tick(now){
   if(!this.images.length)return;
   const elapsed=this.elapsed+(this.playing?Math.max(0,now-this.started):0);
   const index=Math.floor(elapsed*this.fps/1000)%this.images.length;
   // The short supplied wave cycle remains visible inside a slower full-canvas expansion.
   const scale=1+.12*(.5-.5*Math.cos(2*Math.PI*elapsed/this.pulseMs));
   const {width,height}=this.canvas,ctx=this.context,cx=width*.5,cy=height*.54;
   ctx.clearRect(0,0,width,height);ctx.save();ctx.translate(cx,cy);ctx.scale(scale,scale);
   ctx.drawImage(this.images[index],-cx,-cy,width,height);ctx.restore();
   this.canvas.dataset.frame=String(index+25);
   this.canvas.dataset.scale=scale.toFixed(5);
   this.canvas.dataset.playing=String(this.playing);
  }
 }
 root.PngSequence=PngSequence;
 if(typeof module!=='undefined')module.exports=PngSequence;
})(typeof globalThis!=='undefined'?globalThis:this);
