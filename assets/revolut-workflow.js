(() => {
  const section = document.querySelector('.workflow-section');
  const bloom = document.querySelector('#workflow-bloom');
  if (!section || !bloom) return;
  const A = 'assets/ai-workflow/';
  const data = {
    me: [
      {stage:'CONCEPT',title:'Story & Voice',items:[['2 concept studies','Concept-me-01.png'],['Journey: 4 stages','Concept-me-02.png'],['British humour','']]},
      {stage:'ILLUSTRATION',title:'Visual Art Direction',items:[['Retro-meets-neon style',''],['2D / 3D composition',''],['Making the initial golden figure illustration','Illustration_Me-01.png']]},
      {stage:'MOTION',title:'Timing & Storytelling',items:[['2 motion studies','Motion-assets-me.png'],['After Effects motion','motion asset-me.png'],['Page transitions','']]},
      {stage:'LAYOUT',title:'Hierarchy',items:[['Screen-by-screen story','Layout-me.png'],['Low-fi layouts',''],['Reading flow','']]},
      {stage:'FINAL OUTPUT',title:'Selection & Finishing',items:[['Final selection','Layout-me.png'],['Motion polish',''],['Visual consistency','']]}
    ],
    ai: [
      {stage:'CONCEPT',title:'Explore & Refine',items:[['Story consistency',''],['Headline options',''],['Tighter language','']]},
      {stage:'ILLUSTRATION',title:'Visual Experiments',items:[['Pose exploration','Illustration-AI-2.png'],['Image treatment','Illustration-AI-4.png']]},
      {stage:'MOTION',title:'Prototype Assistance',items:[['5-scene demo',''],['Motion code',''],['Interaction tests','']]},
      {stage:'LAYOUT',title:'Build & Test',items:[['Web prototype',''],['Responsive fixes',''],['Layout alternatives','']]},
      {stage:'FINAL OUTPUT',title:'Production Support',items:[['Responsive checks',''],['Interaction debugging',''],['Presentation details','']]}
    ]
  };
  const close = () => { bloom.hidden = true; section.querySelectorAll('.workflow-points circle').forEach(n => n.setAttribute('aria-expanded','false')); };
  bloom.querySelector('.workflow-close').addEventListener('click', close);
  document.addEventListener('keydown', e => { if(e.key === 'Escape' && !bloom.hidden) close(); });
  for (const role of ['me','ai']) {
    section.querySelectorAll(`.workflow-points.${role} circle`).forEach((node,index) => {
      const d=data[role][index];
      node.setAttribute('tabindex','0'); node.setAttribute('role','button');
      node.setAttribute('aria-label',`${role === 'me' ? 'My work' : 'AI support'}: ${d.stage}. Open materials`);
      node.setAttribute('aria-expanded','false');
      const open=()=>{
        const wasOpen=node.getAttribute('aria-expanded')==='true'; close(); if(wasOpen) return;
        bloom.querySelector('.workflow-bloom-kicker').textContent=`${role === 'me' ? 'MY WORK' : 'AI SUPPORT'} · ${d.stage}`;
        bloom.querySelector('.workflow-bloom-title').textContent=d.title;
        const petals=bloom.querySelector('.workflow-bloom-petals'); petals.replaceChildren();
        for (const [label,img] of d.items) {
          const card=document.createElement('div'); card.className='workflow-petal'+(img?' has-image':' text-only')+(img==='Illustration_Me-01.png'?' golden-figure':'');
          if(img==='Illustration_Me-01.png'){const heading=document.createElement('strong');heading.className='workflow-petal-heading';heading.textContent='GOLDEN FIGURE';card.append(heading);}
          if(img){
            const frame=document.createElement('div'); frame.className='workflow-petal-media';
            const image=document.createElement('img'); image.src=A+img; image.alt=''; image.loading='lazy';
            image.addEventListener('load',()=>{ if(image.naturalHeight/image.naturalWidth>1.2) frame.classList.add('is-tall'); });
            frame.append(image);card.append(frame);
          }
          const text=document.createElement('span');text.textContent=label;card.append(text);petals.append(card);
        }
        bloom.hidden=false; bloom.classList.toggle('is-ai',role==='ai');
        bloom.classList.toggle('text-only',!d.items.some(item=>item[1]));
        bloom.classList.toggle('golden-mode',role==='me' && d.stage==='ILLUSTRATION');
        const parent=section.getBoundingClientRect(), rect=node.getBoundingClientRect();
        const width=Math.min(bloom.classList.contains('golden-mode')?480:340,section.clientWidth-20);
        const left=Math.max(8,Math.min(rect.left-parent.left+28,section.clientWidth-width-8));
        bloom.style.left=`${left}px`; bloom.style.top=`${rect.top-parent.top-20}px`;
        node.setAttribute('aria-expanded','true');
      };
      node.addEventListener('click',open);
      node.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});
    });
  }
})();
