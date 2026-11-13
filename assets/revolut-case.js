(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  if (!reducedMotion.matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    }, { threshold: .12 });
    document.querySelectorAll('.report-card,.problem-grid,.design-grid,.asset-card,.wire-grid,.hifi-content,.motion-grid,.frame-grid').forEach(el => {
      el.classList.add('reveal');
      observer.observe(el);
    });
  }

  const globe = document.querySelector('.orbit-art');
  if (globe) {
    const svg = globe.querySelector('.globe-lines');
    const ns = 'http://www.w3.org/2000/svg';
    const curves = [];
    const project = (latitude, longitude, yaw, pitch) => {
      const turned = longitude + yaw;
      const x = Math.cos(latitude) * Math.sin(turned);
      const y = Math.sin(latitude);
      const z = Math.cos(latitude) * Math.cos(turned);
      const vertical = y * Math.cos(pitch) - z * Math.sin(pitch);
      const depth = y * Math.sin(pitch) + z * Math.cos(pitch);
      return { x: 93 * x, y: -93 * vertical, depth, front: depth >= 0 };
    };
    const addCurve = pointAt => {
      const back = document.createElementNS(ns, 'path');
      const front = document.createElementNS(ns, 'path');
      back.setAttribute('class', 'globe-back');
      front.setAttribute('class', 'globe-front');
      svg.append(back, front);
      curves.push({ pointAt, back, front });
    };
    for (let index = 0; index < 12; index++) {
      const longitude = index * Math.PI / 6;
      addCurve((fraction, yaw, pitch) => project((fraction - .5) * Math.PI, longitude, yaw, pitch));
    }
    for (const latitude of [-60, -30, 0, 30, 60]) {
      addCurve((fraction, yaw, pitch) => project(latitude * Math.PI / 180, (fraction * 2 - 1) * Math.PI, yaw, pitch));
    }
    svg.append(...curves.map(curve => curve.front));

    const markers = [
      { latitude: .24, longitude: 1.0, size: 5.4 },
      { latitude: -.24, longitude: -1.0, size: 5.2 },
      { latitude: .90, longitude: Math.PI, size: 4.7 }
    ].map((point, index) => {
      const element = document.createElementNS(ns, 'circle');
      element.setAttribute('class', 'globe-marker');
      svg.append(element);
      return { ...point, element, bubble: globe.querySelector(`[data-marker="${index}"]`) };
    });
    const pathFor = (pointAt, yaw, pitch, front) => {
      let path = '';
      let drawing = false;
      for (let index = 0; index <= 72; index++) {
        const point = pointAt(index / 72, yaw, pitch);
        if (point.front !== front) { drawing = false; continue; }
        path += `${drawing ? 'L' : 'M'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
        drawing = true;
      }
      return path;
    };

    let yaw = 0;
    let pitch = 0;
    let interacted = false;
    let activePointer = null;
    let startX = 0;
    let startY = 0;
    let startYaw = 0;
    let startPitch = 0;
    const render = (nextYaw, nextPitch) => {
      yaw = nextYaw;
      pitch = nextPitch;
      const yawRadians = yaw * Math.PI / 180;
      const pitchRadians = pitch * Math.PI / 180;
      globe.dataset.yaw = yaw.toFixed(1);
      globe.dataset.pitch = pitch.toFixed(1);
      for (const curve of curves) {
        curve.back.setAttribute('d', pathFor(curve.pointAt, yawRadians, pitchRadians, false));
        curve.front.setAttribute('d', pathFor(curve.pointAt, yawRadians, pitchRadians, true));
      }
      for (const marker of markers) {
        const point = project(marker.latitude, marker.longitude, yawRadians, pitchRadians);
        marker.element.setAttribute('cx', point.x.toFixed(1));
        marker.element.setAttribute('cy', point.y.toFixed(1));
        marker.element.setAttribute('r', (marker.size * (.75 + .25 * Math.max(0, point.depth))).toFixed(1));
        marker.element.style.opacity = point.front ? '1' : '.18';
        marker.bubble.style.left = `${50 + point.x * .37}%`;
        marker.bubble.style.top = `${50 + point.y * .37}%`;
        marker.bubble.classList.toggle('is-left', point.x > 0);
        const visible = interacted && point.depth > .88;
        marker.bubble.classList.toggle('is-visible', visible);
        marker.bubble.setAttribute('aria-hidden', String(!visible));
      }
    };
    render(0, 0);
    globe.addEventListener('pointerdown', event => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      activePointer = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;
      startYaw = yaw;
      startPitch = pitch;
      globe.classList.add('is-dragging');
      globe.setPointerCapture(activePointer);
    });
    globe.addEventListener('pointermove', event => {
      if (event.pointerId !== activePointer) return;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      if (Math.abs(dx) + Math.abs(dy) < 2 && !interacted) return;
      interacted = true;
      render(startYaw + dx * .8, startPitch + dy * .8);
    });
    const endDrag = event => {
      if (event.pointerId !== activePointer) return;
      activePointer = null;
      globe.classList.remove('is-dragging');
    };
    globe.addEventListener('pointerup', endDrag);
    globe.addEventListener('pointercancel', endDrag);
    globe.addEventListener('lostpointercapture', endDrag);
    globe.addEventListener('keydown', event => {
      const turns = { ArrowLeft: [-20, 0], ArrowRight: [20, 0], ArrowUp: [0, -20], ArrowDown: [0, 20] };
      const turn = turns[event.key];
      if (!turn) return;
      event.preventDefault();
      interacted = true;
      render(yaw + turn[0], pitch + turn[1]);
    });
  }

  const assetRow = document.querySelector('.asset-row');
  const keys = [...document.querySelectorAll('.design-key')];
  const image = (src, alt) => ({ src, alt });
  const groups = {
    nineties: [image('assets/revolut-motion-type.gif', 'Animated year typography'), image('assets/revolut-motion-transition.gif', 'Gold figure on a checkerboard world'), image('assets/revolut-motion-orbit.gif', 'Globe moving through a spotlight'), image('assets/revolut-disco.png', 'Pink checkerboard disco ball')],
    figures: [image('assets/revolut-gold-runner.png', 'Gold running figure'), image('assets/revolut-gold-dancer.png', 'Gold dancing figure'), image('assets/revolut-gold-floating.png', 'Gold floating figure'), image('assets/revolut-gold-coffee.png', 'Gold figure with laptop')],
    colour: [{ swatch: 'PINK', color: '#f0a3d0' }, { swatch: 'CHOCOLATE', color: '#321b29' }, { swatch: 'WARM YELLOW', color: '#efd2a0' }, { swatch: 'WARM GRAY', color: '#c9c3bd' }],
    dimension: [image('assets/revolut-motion-2d-figure.gif', 'Dimensional elements turning into flat illustrations'), image('assets/revolut-motion-coffee.gif', 'Gold figure and flat coffee cup illustration'), image('assets/revolut-2d-burger.png', 'Flat burger illustration')]
  };
  const renderGroup = groupName => {
    assetRow.replaceChildren(...groups[groupName].map(item => {
      const card = document.createElement('div');
      card.className = 'asset-card';
      if (item.src) {
        const img = document.createElement('img');
        img.src = item.src;
        img.alt = item.alt;
        img.loading = 'lazy';
        card.append(img);
      } else {
        const label = document.createElement('span');
        label.textContent = item.swatch || item.text;
        card.append(label);
        if (item.swatch) {
          card.classList.add('swatch');
          card.style.background = item.color;
          if (item.swatch === 'CHOCOLATE') card.style.color = '#f0a3d0';
        } else card.classList.add('empty-block');
      }
      return card;
    }));
  };
  let activeGroup = 'figures';
  let exitTimer;
  let enterTimer;
  let changeNumber = 0;
  const showGroup = groupName => {
    if (!assetRow || !groups[groupName] || groupName === activeGroup) return;
    activeGroup = groupName;
    keys.forEach(key => key.classList.toggle('is-active', key.dataset.set === groupName));
    const change = ++changeNumber;
    clearTimeout(exitTimer);
    clearTimeout(enterTimer);
    assetRow.classList.remove('is-exiting', 'is-entering');
    if (reducedMotion.matches) {
      renderGroup(groupName);
      return;
    }
    void assetRow.offsetWidth;
    assetRow.classList.add('is-exiting');
    exitTimer = setTimeout(() => {
      if (change !== changeNumber) return;
      renderGroup(groupName);
      assetRow.classList.remove('is-exiting');
      assetRow.classList.add('is-entering');
      enterTimer = setTimeout(() => assetRow.classList.remove('is-entering'), 310);
    }, 210);
  };
  keys.forEach(key => {
    key.addEventListener('pointerenter', () => showGroup(key.dataset.set));
    key.addEventListener('focus', () => showGroup(key.dataset.set));
    key.addEventListener('click', () => showGroup(key.dataset.set));
  });

  const iframe = document.querySelector('.demo-frame iframe');
  const heading = document.querySelector('#demo-heading');
  const step = document.querySelector('#demo-step');
  const primary = document.querySelector('#demo-detail-primary');
  const secondary = document.querySelector('#demo-detail-secondary');
  const stories = [
    ['01 / A YEAR OF MOMENTS', 'TRANSITION<br>MOMENTS', '189 transitions during 2026.', 'That’s 1,284 little moments.'],
    ['02 / A LATE-NIGHT MOMENT', 'TRANSITION<br>MOMENTS', 'You made a purchase at a <mark>McDonald’s in Turin.</mark>', 'Who doesn’t fancy a cheeky McDonald’s when hunger strikes?'],
    ['03 / A SAVINGS MOMENT', 'FIRST SAVINGS<br>ACCOUNT', 'You opened your first Revolut Savings account after paying rent.', 'We’re glad you made room for us too.'],
    ['04 / A MORNING MOMENT', 'MORNING<br>COFFEE', 'You made 89 coffee purchases at WTF Coffee in the morning.', 'At this point, calling yourself a regular feels rather modest.'],
    ['05 / A FRIDAY MOMENT', 'FRIDAY<br>NIGHTS', 'You treated yourself a little better on Friday nights: 39% more than on weekdays.', 'Apparently, your weekend starts before you even get home.']
  ];
  const shareStories = {
    editor: ['06 / YOUR STORY', 'SHARE YOUR<br>YEAR', 'Choose the details that appear in your recap.', 'Preview your card before sharing.'],
    sheet: ['07 / SHARE', 'CHOOSE WHERE<br>TO SHARE', 'Your recap is ready.', 'Pick where you want to share it.'],
    story: ['08 / STORY PREVIEW', 'YOUR STORY', 'See your recap as a story.', 'Go back to make changes.']
  };
  const demoOrigin = iframe ? new URL(iframe.src, location.href).origin : null;
  window.addEventListener('message', event => {
    if (event.source !== iframe?.contentWindow) return;
    const page = event.data?.revolutDemoPage;
    if (!Number.isInteger(page) || page < 0 || page >= stories.length) return;
    const story = shareStories[event.data?.revolutShareMode] || stories[page];
    if (step.textContent === story[0] && heading.innerHTML === story[1]) return;
    step.textContent = story[0];
    heading.innerHTML = story[1];
    primary.innerHTML = story[2];
    secondary.innerHTML = story[3];
    if (!reducedMotion.matches) {
      heading.classList.remove('is-changing');
      void heading.offsetWidth;
      heading.classList.add('is-changing');
      clearTimeout(heading.changeTimer);
      heading.changeTimer = setTimeout(() => heading.classList.remove('is-changing'), 170);
    }
  });

  const frameGrid = document.querySelector('.frame-grid');
  const frameDialog = document.querySelector('.frame-dialog');
  if (frameGrid) {
    const cards = [...frameGrid.querySelectorAll(':scope > a')];
    frameGrid.replaceChildren();
    for (let laneIndex = 0; laneIndex < 4; laneIndex++) {
      const lane = document.createElement('div');
      lane.className = 'frame-lane';
      lane.style.setProperty('--lane-speed', `${22 + laneIndex * 4}s`);
      const track = document.createElement('div');
      track.className = 'frame-track';
      const cycle = document.createElement('div');
      cycle.className = 'frame-cycle';
      cards.filter((_, index) => index % 4 === laneIndex).forEach(card => cycle.append(card));
      const repeat = cycle.cloneNode(true);
      repeat.setAttribute('aria-hidden', 'true');
      repeat.querySelectorAll('a').forEach(link => link.tabIndex = -1);
      track.append(cycle, repeat);
      lane.append(track);
      frameGrid.append(lane);
    }
  }
  if (frameGrid && frameDialog && typeof frameDialog.showModal === 'function') {
    const preview = frameDialog.querySelector('img');
    frameGrid.addEventListener('click', event => {
      const link = event.target.closest('a');
      if (!link || !frameGrid.contains(link)) return;
      event.preventDefault();
      preview.src = link.href;
      preview.alt = link.querySelector('img')?.alt || 'Final page';
      frameDialog.showModal();
    });
    frameDialog.querySelector('.frame-close').addEventListener('click', () => frameDialog.close());
    frameDialog.addEventListener('click', event => {
      if (event.target === frameDialog) frameDialog.close();
    });
  }
})();
