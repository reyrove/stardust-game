(() => {
  // ============================================================
  //  CANVAS
  // ============================================================
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  let W, H, DPR;

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  // ============================================================
  //  CONSTANTS
  // ============================================================
  const STATE = { MENU: 0, PLAYING: 1, DEAD: 2 };
  let state = STATE.MENU;

  // Dreamy palette
  const PALETTE = [
    { hex: '#ffd6ec', glow: 'rgba(255,214,236,' },  // blush
    { hex: '#c9b6ff', glow: 'rgba(201,182,255,' },  // lavender
    { hex: '#a5f3ff', glow: 'rgba(165,243,255,' },  // aqua
    { hex: '#ffe8a3', glow: 'rgba(255,232,163,' },  // pale gold
    { hex: '#ffb8d9', glow: 'rgba(255,184,217,' },  // rose
  ];

  // ============================================================
  //  GAME STATE
  // ============================================================
  let score = 0;
  let bloom = 0;
  let flow = 0;
  let best = parseInt(localStorage.getItem('stardustBest') || '0', 10);

  let mouseX = 0, mouseY = 0;
  let hasMouse = false;

  const spark = {
    x: 0, y: 0,
    vx: 0, vy: 0,
    r: 5,
    pulse: 0,
    hue: 0,
    trail: [],
    energy: 1,
  };

  let motes = [];
  let particles = [];
  let lines = [];
  let ripples = [];
  let bgStars = [];

  let elapsed = 0;
  let spawnTimer = 0;
  let idleTimer = 0;

  // ============================================================
  //  HELPERS
  // ============================================================
  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function initBgStars() {
    bgStars = [];
    const count = Math.floor((W * H) / 9000);
    for (let i = 0; i < count; i++) {
      bgStars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.2 + 0.2,
        phase: Math.random() * Math.PI * 2,
        speed: rand(0.4, 1.6),
        color: pick(PALETTE).hex,
      });
    }
  }
  initBgStars();
  window.addEventListener('resize', initBgStars);

  // ============================================================
  //  SPAWNING
  // ============================================================
  function spawnMote() {
    let x, y, tries = 0;
    do {
      x = rand(60, W - 60);
      y = rand(80, H - 100);
      tries++;
    } while (Math.hypot(x - spark.x, y - spark.y) < 140 && tries < 20);

    const colorIdx = Math.floor(Math.random() * PALETTE.length);
    motes.push({
      x, y,
      r: 5,
      colorIdx,
      life: 0,
      maxLife: rand(9, 13),
      spawn: 0,
      bob: Math.random() * Math.PI * 2,
      absorbed: false,
    });
  }

  function spawnParticles(x, y, colorHex, count, speed) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = rand(speed * 0.2, speed);
      particles.push({
        x, y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: 0.7 + Math.random() * 0.7,
        maxLife: 1.4,
        r: rand(1.5, 3.5),
        color: colorHex,
      });
    }
  }

  function addRipple(x, y, colorHex) {
    ripples.push({
      x, y, r: 4,
      maxR: 90,
      life: 0,
      maxLife: 0.9,
      color: colorHex,
    });
  }

  // ============================================================
  //  RESET
  // ============================================================
  function reset() {
    score = 0;
    bloom = 0;
    flow = 0;
    elapsed = 0;
    spawnTimer = 0.4;
    idleTimer = 0;

    motes = [];
    particles = [];
    lines = [];
    ripples = [];

    spark.x = W / 2;
    spark.y = H / 2;
    spark.vx = 0;
    spark.vy = 0;
    spark.trail = [];
    spark.pulse = 0;
    spark.energy = 1;
    spark.hue = 0;

    mouseX = W / 2;
    mouseY = H / 2;

    for (let i = 0; i < 4; i++) spawnMote();

    updateHUD();
  }

  // ============================================================
  //  INPUT
  // ============================================================
  window.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    hasMouse = true;
  });
  window.addEventListener('touchmove', e => {
    if (e.touches[0]) {
      mouseX = e.touches[0].clientX;
      mouseY = e.touches[0].clientY;
      hasMouse = true;
    }
  }, { passive: true });
  window.addEventListener('touchstart', e => {
    if (e.touches[0]) {
      mouseX = e.touches[0].clientX;
      mouseY = e.touches[0].clientY;
      hasMouse = true;
    }
  }, { passive: true });

  // ============================================================
  //  UPDATE
  // ============================================================
  function update(dt) {
    for (const s of bgStars) {
      s.phase += s.speed * dt;
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= dt;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.94;
      p.vy *= 0.94;
    }
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i];
      r.life += dt;
      if (r.life > r.maxLife) { ripples.splice(i, 1); continue; }
      r.r = 4 + (r.maxR - 4) * (r.life / r.maxLife);
    }
    for (let i = lines.length - 1; i >= 0; i--) {
      const l = lines[i];
      l.life -= dt;
      if (l.life <= 0) lines.splice(i, 1);
    }

    spark.pulse *= Math.pow(0.9, dt * 60);

    if (state !== STATE.PLAYING) return;

    elapsed += dt;

    // --- Spark follows cursor gracefully ---
    if (hasMouse) {
      const dx = mouseX - spark.x;
      const dy = mouseY - spark.y;
      const dist = Math.hypot(dx, dy);

      const springK = 30;
      const damping = 6.5;
      spark.vx += (dx * springK - spark.vx * damping) * dt;
      spark.vy += (dy * springK - spark.vy * damping) * dt;

      const speed = Math.hypot(spark.vx, spark.vy);
      const targetEnergy = Math.min(1, speed / 700);

      if (dist < 6 && speed < 40) {
        idleTimer += dt;
      } else {
        idleTimer = 0;
      }
      const idleDim = Math.min(0.75, idleTimer / 2.2);
      spark.energy += ((targetEnergy * (1 - idleDim)) - spark.energy) * Math.min(1, dt * 3);

      if (speed > 120) {
        flow = Math.min(1, flow + dt * 0.55);
      } else {
        flow = Math.max(0, flow - dt * 0.35);
      }

      spark.hue += speed * dt * 0.02 + dt * 0.4;
    }

    spark.x += spark.vx * dt;
    spark.y += spark.vy * dt;

    const pad = 20;
    if (spark.x < pad) { spark.x = pad; spark.vx *= -0.4; }
    if (spark.x > W - pad) { spark.x = W - pad; spark.vx *= -0.4; }
    if (spark.y < pad) { spark.y = pad; spark.vy *= -0.4; }
    if (spark.y > H - pad) { spark.y = H - pad; spark.vy *= -0.4; }

    spark.trail.push({ x: spark.x, y: spark.y, life: 0.8 });
    if (spark.trail.length > 42) spark.trail.shift();
    for (const t of spark.trail) t.life -= dt;
    spark.trail = spark.trail.filter(t => t.life > 0);

    // --- Spawn motes ---
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      spawnMote();
      const interval = Math.max(0.6, 1.9 - elapsed * 0.018);
      spawnTimer = interval * rand(0.75, 1.25);
    }

    // --- Motes ---
    const collectR = 26 + flow * 14;

    for (let i = motes.length - 1; i >= 0; i--) {
      const m = motes[i];
      m.life += dt;
      m.spawn = Math.min(1, m.spawn + dt * 3);
      m.bob += dt * 2;

      const dx = spark.x - m.x;
      const dy = spark.y - m.y;
      const d = Math.hypot(dx, dy) || 1;

      if (d < 200) {
        const pull = (1 - d / 200) * (80 + flow * 260);
        m.x += (dx / d) * pull * dt;
        m.y += (dy / d) * pull * dt;
      }

      if (d < collectR) {
        m.absorbed = true;
        bloom++;

        if (motes.length > 1) {
          const other = motes.find(o => !o.absorbed && o !== m);
          if (other) {
            const color = PALETTE[m.colorIdx];
            lines.push({
              x1: m.x, y1: m.y,
              x2: other.x, y2: other.y,
              color: color.hex,
              life: 4,
              maxLife: 4,
            });
          }
        }

        const gained = Math.round(8 + flow * 22);
        score += gained;

        spark.pulse = 1;

        const color = PALETTE[m.colorIdx];
        spawnParticles(m.x, m.y, color.hex, 20, 260);
        addRipple(m.x, m.y, color.hex);

        motes.splice(i, 1);
        updateHUD();
        continue;
      }

      if (m.life > m.maxLife) {
        motes.splice(i, 1);
      }
    }

    if (spark.energy < 0.06 && idleTimer > 3.5) {
      die('The light faded');
    }
  }

  function die(reason) {
    state = STATE.DEAD;

    spawnParticles(spark.x, spark.y, '#ffd6ec', 60, 500);
    spawnParticles(spark.x, spark.y, '#c9b6ff', 40, 380);
    spawnParticles(spark.x, spark.y, '#a5f3ff', 30, 300);
    addRipple(spark.x, spark.y, '#ffd6ec');

    const isNewBest = score > best;
    if (isNewBest) {
      best = score;
      localStorage.setItem('stardustBest', best.toString());
      document.getElementById('newBest').classList.remove('hidden');
    } else {
      document.getElementById('newBest').classList.add('hidden');
    }

    document.getElementById('finalScore').textContent = score;

    setTimeout(() => {
      document.getElementById('gameOverScreen').classList.remove('hidden');
    }, 700);
  }

  function updateHUD() {
    document.getElementById('score').textContent = score;
    document.getElementById('bloom').textContent = bloom;
    document.getElementById('flowFill').style.width = (flow * 100) + '%';
  }

  // ============================================================
  //  RENDER
  // ============================================================
  function render() {
    ctx.fillStyle = 'rgba(5, 1, 15, 0.28)';
    ctx.fillRect(0, 0, W, H);

    for (const s of bgStars) {
      const twinkle = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(s.phase));
      ctx.globalAlpha = twinkle * 0.55;
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    const neb = ctx.createRadialGradient(
      spark.x, spark.y, 0,
      spark.x, spark.y, Math.max(W, H) * 0.6
    );
    const sparkColor = PALETTE[Math.floor(((spark.hue % 1) + 1) % 1 * PALETTE.length) % PALETTE.length];
    neb.addColorStop(0, sparkColor.glow + (0.03 + flow * 0.06) + ')');
    neb.addColorStop(0.5, 'rgba(201, 182, 255, 0.02)');
    neb.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = neb;
    ctx.fillRect(0, 0, W, H);

    for (const l of lines) {
      const a = Math.max(0, l.life / l.maxLife);
      ctx.strokeStyle = l.color;
      ctx.globalAlpha = a * 0.55;
      ctx.lineWidth = 1 + a * 1.2;
      ctx.shadowColor = l.color;
      ctx.shadowBlur = 15 * a;
      ctx.beginPath();
      ctx.moveTo(l.x1, l.y1);
      ctx.lineTo(l.x2, l.y2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    for (const r of ripples) {
      const a = 1 - r.life / r.maxLife;
      ctx.strokeStyle = r.color;
      ctx.globalAlpha = a * 0.7;
      ctx.lineWidth = 2 * a + 0.5;
      ctx.shadowColor = r.color;
      ctx.shadowBlur = 25 * a;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    for (const m of motes) {
      const color = PALETTE[m.colorIdx];
      const lifeRatio = m.life / m.maxLife;
      const fadeIn = m.spawn;
      const fadeOut = lifeRatio > 0.8 ? (1 - lifeRatio) / 0.2 : 1;
      const alpha = Math.min(fadeIn, fadeOut);

      const bobY = Math.sin(m.bob) * 3;
      const scale = 0.85 + m.spawn * 0.15 + Math.sin(m.bob * 1.4) * 0.08;

      ctx.save();
      ctx.globalAlpha = alpha;

      const grad = ctx.createRadialGradient(m.x, m.y + bobY, 0, m.x, m.y + bobY, m.r * 7 * scale);
      grad.addColorStop(0, color.glow + '0.95)');
      grad.addColorStop(0.25, color.glow + '0.35)');
      grad.addColorStop(1, color.glow + '0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(m.x, m.y + bobY, m.r * 7 * scale, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = color.hex;
      ctx.shadowColor = color.hex;
      ctx.shadowBlur = 25;
      ctx.beginPath();
      ctx.arc(m.x, m.y + bobY, m.r * scale, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(m.x, m.y + bobY, m.r * scale * 0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    for (let i = 0; i < spark.trail.length; i++) {
      const t = spark.trail[i];
      const ratio = i / spark.trail.length;
      const a = (t.life / 0.8) * ratio * 0.5;
      const c = PALETTE[Math.floor((spark.hue + i * 0.02) * PALETTE.length) % PALETTE.length];
      ctx.fillStyle = c.glow + a + ')';
      ctx.beginPath();
      ctx.arc(t.x, t.y, spark.r * ratio * 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    if (state !== STATE.DEAD) {
      const energy = spark.energy;
      const r = spark.r * (0.7 + energy * 0.5) + spark.pulse * 10;
      const color = PALETTE[Math.floor((spark.hue % 1) * PALETTE.length) % PALETTE.length];

      const halo = ctx.createRadialGradient(
        spark.x, spark.y, 0,
        spark.x, spark.y, r * 10
      );
      halo.addColorStop(0, color.glow + (0.5 * energy + 0.3) + ')');
      halo.addColorStop(0.3, color.glow + (0.15 * energy) + ')');
      halo.addColorStop(1, color.glow + '0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(spark.x, spark.y, r * 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = color.hex;
      ctx.shadowColor = color.hex;
      ctx.shadowBlur = 45 * (0.5 + energy);
      ctx.beginPath();
      ctx.arc(spark.x, spark.y, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(spark.x, spark.y, r * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      if (flow > 0.15) {
        const petals = 5;
        const petalAlpha = flow * 0.55;
        for (let i = 0; i < petals; i++) {
          const a = spark.hue * Math.PI * 2 + (i / petals) * Math.PI * 2;
          const pr = r * 2.6;
          const px = spark.x + Math.cos(a) * pr;
          const py = spark.y + Math.sin(a) * pr;
          const pColor = PALETTE[(i + Math.floor(spark.hue * 3)) % PALETTE.length];
          ctx.fillStyle = pColor.glow + petalAlpha + ')';
          ctx.beginPath();
          ctx.arc(px, py, r * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    for (const p of particles) {
      const a = p.life / p.maxLife;
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * a, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  // ============================================================
  //  MAIN LOOP
  // ============================================================
  let last = performance.now();
  function loop(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    update(dt);
    render();
    requestAnimationFrame(loop);
  }

  // ============================================================
  //  UI
  // ============================================================
  document.getElementById('startBtn').addEventListener('click', () => {
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');
    reset();
    state = STATE.PLAYING;
  });

  document.getElementById('restartBtn').addEventListener('click', () => {
    document.getElementById('gameOverScreen').classList.add('hidden');
    reset();
    state = STATE.PLAYING;
  });

  reset();
  state = STATE.MENU;
  requestAnimationFrame(loop);
})();