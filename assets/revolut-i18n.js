(() => {
  const entries = [];
  const add = (selector, zh, attribute = 'textContent') => {
    const node = document.querySelector(selector);
    if (!node) return;
    const en = attribute === 'textContent' ? node.textContent : node.getAttribute(attribute);
    entries.push({ node, attribute, en, zh });
  };
  const addAll = (selector, translations, attribute = 'textContent') => {
    document.querySelectorAll(selector).forEach((node, index) => {
      if (translations[index] === undefined) return;
      const en = attribute === 'textContent' ? node.textContent : node.getAttribute(attribute);
      entries.push({ node, attribute, en, zh: translations[index] });
    });
  };
  const addTextNodes = (selector, translations) => {
    const node = document.querySelector(selector);
    if (!node) return;
    [...node.childNodes].filter(child => child.nodeType === Node.TEXT_NODE).forEach((child, index) => {
      if (translations[index] !== undefined) entries.push({ node: child, attribute: 'textContent', en: child.textContent, zh: translations[index] });
    });
  };

  add('.page-header > a', '← 作品');
  add('.page-header > a', '返回精选作品', 'aria-label');
  add('.page-title', 'REVOLUT / 年度回顾');
  add('.language-switch', '语言', 'aria-label');
  add('#intro-title', '项目介绍');
  addAll('.project-intro > p', [
    'Revolut Wrapped 2026 是一项交互式年度财务回顾概念，将日常交易变成出人意料的小故事。',
    '通过有趣的 2D／3D 动效、个性化洞察和一点英式幽默，让财务数据更容易记住、分享，也更有情感温度。'
  ]);
  add('#past-title', '案例研究与洞察');
  addAll('.report-copy small', [
    '至少从 2021 年起，Revolut 就开始制作个人年度回顾。',
    '2025 年在社交平台被分享超过 6.3 亿次。',
    '在中国延续了十年的年度听歌报告。'
  ]);
  add('.report-source', '图片来源：Revolut、Spotify、网易云音乐');
  add('.case-insight summary', '洞察', 'data-label-zh');
  addAll('.case-insight-content > p', [
    '年度回顾能唤起人们几乎忘记的小瞬间，让日常习惯成为意外的惊喜。我希望这些发现能让用户与 Revolut 建立更亲近的联系。',
    '视觉上，我保留了 Revolut 鲜明的 3D 风格，融入 2D 元素和一点英式幽默，讲述这样的日常故事：',
    'Revolut 已经融入日常生活。让我们用一个个小故事，看见这些时刻。'
  ]);
  addAll('.humour-quote mark', [
    '“周五晚上，你总会对自己好一点。',
    '比工作日多花了 39%。',
    '看来你还没到家，周末就已经开始了。”'
  ]);
  add('#problem-title', '问题定义与动机');
  add('.problem-grid > p', '让交易数据成为属于每个人的年度故事。');
  addAll('.orbit-bubble', ['交易总结', '有趣的消费对比', '意想不到时刻的支付']);
  add('.gesture-note', '拖动旋转 ↗');
  add('.orbit-art', '交互式球体。向任意方向拖动，或用方向键旋转，找到三个点并查看文字。', 'aria-label');
  add('#design-title', '设计');
  addTextNodes('.design-grid > p', [
    '我采用 ',
    '，让年度报告带有怀旧气息。',
    ' 贯穿整个视觉叙事。',
    ' 和粗体字增添活力，图像则 ',
    '。'
  ]);
  addAll('.design-key', ['90 年代视觉语言', '金色人物', '四色配色', '从 3D 走向 2D']);
  add('.asset-hint', '悬停或点击高亮文字');
  add('#journey-title', '用户旅程');
  add('.journey-intro', '从发现到分享的情境式旅程。');
  add('.journey-stages', '发现、探索、回顾、分享', 'aria-label');
  addAll('.journey-action strong', ['用户行为', '用户行为', '用户行为', '用户行为']);
  addAll('.journey-response strong', ['用户反应', '用户反应', '用户反应', '用户反应']);
  addAll('.journey-action span', [
    '打开年度回顾，开始这段旅程。',
    '浏览个人专属时刻，例如每周一买咖啡的习惯。',
    '查看年度总结，发现自己的生活规律。',
    '选择一个时刻或总结卡片，分享到 Instagram Stories。'
  ], 'data-body-zh');
  addAll('.journey-response blockquote', [
    '“哦，原来 Revolut 还有这个！”',
    '“这也太像我了，同样的咖啡、同样的价格，居然买了 56 次！”',
    '“我都没发现今年去了 7 个国家！”',
    '“这个好想分享！”'
  ]);
  add('#workflow-title', 'AI 工作流程');
  add('.workflow-intro', '我如何与 AI 协作');
  document.querySelectorAll('.workflow-legend span').forEach((span, index) => {
    const child = [...span.childNodes].find(node => node.nodeType === Node.TEXT_NODE);
    if (child) entries.push({ node: child, attribute: 'textContent', en: child.textContent, zh: ['我的工作', 'AI 协助'][index] });
  });
  add('.workflow-chart', 'AI 工作流程。选择粉色的“我的工作”或蓝色的“AI 协助”节点，查看各阶段素材。', 'aria-label');
  addAll('.workflow-scale', ['低', '高']);
  addAll('.workflow-grid text', ['概念', '插画', '动效', '版式', '最终呈现']);
  add('.workflow-close', '关闭工作流程详情', 'aria-label');
  add('#lowfi-title', '低保真');
  add('#hifi-title', '高保真');
  add('.demo-frame iframe', '交互式 Revolut 年度回顾', 'title');
  add('.motion-label', '动效素材');
  addAll('.motion-item h2', ['交互', '插画', '字体', '转场']);
  addAll('.motion-item p', [
    '通过手势推进故事。',
    '金色人物串联各个时刻。',
    '粗体文字让每个时刻有了声音。',
    '动效连接一个又一个场景。'
  ]);
  add('#closing-title', '最终页面');
  add('.closing > a', '← 精选作品');
  add('.frame-dialog', '最终页面预览', 'aria-label');
  add('.frame-close', '关闭图片', 'aria-label');
  addAll('.frame-grid a', [
    '放大年度回顾加载页面', '放大转场时刻页面', '放大都灵消费页面',
    '放大早晨咖啡页面', '放大首次储蓄账户页面', '放大周五夜晚消费页面',
    '放大分享总结页面', '放大已分享的故事页面', '放大带通知的年度回顾锁屏'
  ], 'aria-label');

  const buttons = [...document.querySelectorAll('.language-switch button')];
  let language = 'en';
  const setLanguage = (next, persist = true) => {
    language = next === 'zh' ? 'zh' : 'en';
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    document.title = language === 'zh' ? 'Revolut 年度回顾 — 贝妮·莫' : 'Revolut Year in Review — Beini Mo';
    document.querySelector('meta[name="description"]')?.setAttribute('content', language === 'zh' ? '贝妮·莫的 Revolut 年度回顾设计案例。' : 'Revolut Year in Review — a visual design case study by Beini Mo.');
    for (const entry of entries) {
      if (entry.attribute === 'data-label-zh' || entry.attribute === 'data-body-zh') continue;
      const value = language === 'zh' ? entry.zh : entry.en;
      if (entry.attribute === 'textContent') entry.node.textContent = value;
      else entry.node.setAttribute(entry.attribute, value);
    }
    const insightSummary = document.querySelector('.case-insight summary');
    if (insightSummary) insightSummary.firstChild.textContent = language === 'zh' ? '洞察 ' : 'INSIGHTS ';
    document.querySelectorAll('.journey-stage h3').forEach((heading, index) => {
      const titles = language === 'zh' ? ['发现', '探索', '回顾', '分享'] : ['Discover', 'Explore', 'Reflect', 'Share'];
      const text = [...heading.childNodes].find(node => node.nodeType === Node.TEXT_NODE);
      if (text) text.textContent = ` ${titles[index]}`;
    });
    document.querySelectorAll('.journey-action span').forEach((span, index) => {
      const body = [...span.childNodes].find(node => node.nodeType === Node.TEXT_NODE);
      const english = ['Opens the annual recap and starts the journey.', 'Browses personalised moments (e.g. the Monday coffee ritual).', 'Sees the yearly summary and discovers patterns about their life.', 'Chooses a moment or summary card and shares to Instagram Stories.'];
      const chinese = ['打开年度回顾，开始这段旅程。', '浏览个人专属时刻，例如每周一买咖啡的习惯。', '查看年度总结，发现自己的生活规律。', '选择一个时刻或总结卡片，分享到 Instagram Stories。'];
      if (body) body.textContent = language === 'zh' ? chinese[index] : english[index];
    });
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.language === language)));
    if (persist) try { localStorage.setItem('revolut-language', language); } catch {}
    window.dispatchEvent(new CustomEvent('revolut:languagechange', { detail: { language } }));
  };
  window.revolutI18n = { current: () => language, setLanguage };
  buttons.forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.language)));
  const urlLanguage = new URLSearchParams(location.search).get('lang');
  let savedLanguage;
  try { savedLanguage = localStorage.getItem('revolut-language'); } catch {}
  setLanguage(urlLanguage || savedLanguage || 'en', false);
})();
