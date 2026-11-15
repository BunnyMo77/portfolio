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
  const translations = {
    me: [
      {stage:'概念',title:'故事与语气',items:['2 项概念研究','旅程：4 个阶段','英式幽默']},
      {stage:'插画',title:'视觉艺术指导',items:['复古与霓虹风格','2D／3D 组合','绘制最初的金色人物插画']},
      {stage:'动效',title:'节奏与叙事',items:['2 项动效研究','After Effects 动效','页面转场']},
      {stage:'版式',title:'信息层级',items:['逐屏叙事','低保真版式','阅读动线']},
      {stage:'最终呈现',title:'筛选与完善',items:['最终筛选','动效打磨','视觉一致性']}
    ],
    ai: [
      {stage:'概念',title:'探索与精炼',items:['故事一致性','标题方案','文字精炼']},
      {stage:'插画',title:'视觉实验',items:['姿态探索','图像处理']},
      {stage:'动效',title:'原型辅助',items:['5 幕演示','动效代码','交互测试']},
      {stage:'版式',title:'构建与测试',items:['网页原型','响应式修正','版式备选方案']},
      {stage:'最终呈现',title:'制作支持',items:['响应式检查','交互调试','呈现细节']}
    ]
  };
  const isChinese = () => window.revolutI18n?.current() === 'zh';
  const getCopy = (role, index) => isChinese() ? translations[role][index] : data[role][index];
  let activeNode = null;
  let activeOpen = null;
  const close = () => { bloom.hidden = true; activeNode = null; activeOpen = null; section.querySelectorAll('.workflow-points circle').forEach(n => n.setAttribute('aria-expanded','false')); };
  bloom.querySelector('.workflow-close').addEventListener('click', close);
  document.addEventListener('keydown', e => { if(e.key === 'Escape' && !bloom.hidden) close(); });
  for (const role of ['me','ai']) {
    section.querySelectorAll(`.workflow-points.${role} circle`).forEach((node,index) => {
      const d=data[role][index];
      node.setAttribute('tabindex','0'); node.setAttribute('role','button');
      const updateAria = () => node.setAttribute('aria-label', isChinese() ? `${role === 'me' ? '我的工作' : 'AI 协助'}：${getCopy(role,index).stage}。打开素材` : `${role === 'me' ? 'My work' : 'AI support'}: ${d.stage}. Open materials`);
      updateAria();
      node.setAttribute('aria-expanded','false');
      const open=()=>{
        const wasOpen=node.getAttribute('aria-expanded')==='true'; close(); if(wasOpen) return;
        activeNode = node;
        activeOpen = open;
        const copy = getCopy(role,index);
        bloom.querySelector('.workflow-bloom-kicker').textContent=`${isChinese() ? (role === 'me' ? '我的工作' : 'AI 协助') : (role === 'me' ? 'MY WORK' : 'AI SUPPORT')} · ${copy.stage}`;
        bloom.querySelector('.workflow-bloom-title').textContent=copy.title;
        const petals=bloom.querySelector('.workflow-bloom-petals'); petals.replaceChildren();
        for (const [itemIndex,[label,img]] of d.items.entries()) {
          const card=document.createElement('div'); card.className='workflow-petal'+(img?' has-image':' text-only')+(img==='Illustration_Me-01.png'?' golden-figure':'');
          if(img==='Illustration_Me-01.png'){const heading=document.createElement('strong');heading.className='workflow-petal-heading';heading.textContent=isChinese()?'金色人物':'GOLDEN FIGURE';card.append(heading);}
          if(img){
            const frame=document.createElement('div'); frame.className='workflow-petal-media';
            const image=document.createElement('img'); image.src=A+img; image.alt=''; image.loading='lazy';
            image.addEventListener('load',()=>{ if(image.naturalHeight/image.naturalWidth>1.2) frame.classList.add('is-tall'); });
            frame.append(image);card.append(frame);
          }
          const text=document.createElement('span');text.textContent=isChinese()?copy.items[itemIndex]:label;card.append(text);petals.append(card);
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
      window.addEventListener('revolut:languagechange', updateAria);
    });
  }
  window.addEventListener('revolut:languagechange', () => { const reopen = activeOpen; if (reopen) { close(); reopen(); } });
})();
