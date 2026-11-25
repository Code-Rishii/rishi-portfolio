/* =========================================================================
       1. EASY-TO-EDIT PORTFOLIO CONFIGURATION
       Rishi: Edit your links, GitHub URLs, and Friends' Games right here!
       ========================================================================= */
    const PORTFOLIO_CONFIG = {
      developer: {
        name: "Rishi Raj",
        initials: "RR",
        college: "RRSDCE Begusarai (BEU - Bihar Engineering University)",
        location: "Begusarai, Bihar, India",
        bio: "My name is Rishi Raj from RRSDCE Begusarai (BEU). This interactive gaming portfolio is built for students, for fun — blending engineering, creative UI, and interactive web games.",
        skills: ["HTML5 Canvas", "JavaScript", "React / Next.js", "Tailwind CSS", "UI/UX Design", "Web Game Dev", "Creative Coding"],
        githubUrl: "https://github.com/",
        email: "rishiraj@example.com",
        discordUrl: "https://discord.com/"
      },
      projects: [
        {
          title: "RishiOS Retro",
          genre: "Interactive Desktop Portfolio",
          description: "A playful retro operating system right inside the browser featuring draggable windows, mini-games, and campus Easter eggs.",
          tags: ["React", "Tailwind", "UI/UX"],
          accent: "#a855f7",
          demoUrl: "https://github.com/",
          githubUrl: "https://github.com/",
          artType: "retro"
        },
        {
          title: "Dungeon RRSDCE",
          genre: "Campus Pixel Adventure",
          description: "A 2D pixel quest inspired by engineering college life at RRSDCE Begusarai — dodge assignment deadlines and collect power-ups!",
          tags: ["HTML5", "Canvas", "Game Dev"],
          accent: "#10b981",
          demoUrl: "https://github.com/",
          githubUrl: "https://github.com/",
          artType: "dungeon"
        },
        {
          title: "Neon Rider Arena",
          genre: "Arcade Browser Racer",
          description: "High-speed neon superbike arena with glowing Bezier drift trails, synthesized audio, and explosive rock-smashing physics.",
          tags: ["JavaScript", "Web Audio", "Physics"],
          accent: "#00b4ff",
          demoUrl: "https://github.com/",
          githubUrl: "https://github.com/",
          artType: "racer"
        }
      ],
      coderArmyFriends: [
        {
          title: "CyberQuest",
          developer: "Friend 1 • Coder Army",
          genre: "Cyber Maze",
          description: "Fast-paced neon cyber maze escape featuring laser traps, warp portals, and speedrun leaderboards.",
          color: "#00b4ff",
          url: "https://github.com/"
        },
        {
          title: "Pixel Arena",
          developer: "Friend 2 • Coder Army",
          genre: "2D Brawler",
          description: "Retro multiplayer 2D pixel brawler with combo moves, arena hazards, and local keyboard battles.",
          color: "#c026d3",
          url: "https://github.com/"
        },
        {
          title: "Campus Sim",
          developer: "Friend 3 • Coder Army",
          genre: "College Sim",
          description: "Open-world student simulator inspired by engineering campus life, tech fests, and hostel mini-quests.",
          color: "#ff9500",
          url: "https://github.com/"
        },
        {
          title: "Space Blaster",
          developer: "Friend 4 • Coder Army",
          genre: "Arcade Shooter",
          description: "Galactic neon shoot-'em-up with boss waves, plasma shields, and 60fps particle explosions.",
          color: "#10b981",
          url: "https://github.com/"
        }
      ]
    };

    /* =========================================================================
       2. GLOBAL STATE & DOM REFERENCES
       ========================================================================= */
    const bgCanvas = document.getElementById('bg-canvas');
    const bgCtx = bgCanvas.getContext('2d');
    const fxCanvas = document.getElementById('fx-canvas');
    const fxCtx = fxCanvas.getContext('2d');
    const riderEl = document.getElementById('rider-actor');
    const parkedBikeEl = document.getElementById('parked-bike-wrap');
    const arenaWrapper = document.getElementById('arena-wrapper');
    const modalEl = document.getElementById('section-modal');
    const modalCard = document.getElementById('modal-card');

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let viewW = window.innerWidth;
    let viewH = window.innerHeight;
    let bgW = viewW;
    let bgH = viewH;

    let isAnimating = false;
    let activeModalKey = null;
    let lastClosedTime = 0;
    let sfxEnabled = true;
    let audioCtx = null;

    // Cache procedural boulder canvases by sectionKey for textured shattering shards!
    const rockCanvasCache = {};

    // FX Animation Entities
    let activeTrail = null;
    const shards = [];
    const dustPuffs = [];
    const sparks = [];
    const shockwaves = [];
    const crackFlashes = [];

    // Background Environment Entities
    const stars = [];
    const waterfallStreams = [];
    const waterfallFoam = [];
    const mistClouds = [];
    const lakeRipples = [];

    /* =========================================================================
       3. PROCEDURAL PHOTOREALISTIC 3D GRANITE BOULDER GENERATOR
       Uses 2D multi-octave noise + bump-map normals + moonlight + neon rim light
       ========================================================================= */
    function hexToRgb(hex) {
      const clean = hex.replace('#', '');
      return {
        r: parseInt(clean.substring(0, 2), 16),
        g: parseInt(clean.substring(2, 4), 16),
        b: parseInt(clean.substring(4, 6), 16)
      };
    }

    function hash2D(ix, iy, seed) {
      let n = Math.sin(ix * 127.1 + iy * 311.7 + seed * 74.7) * 43758.5453123;
      return n - Math.floor(n);
    }

    function smoothNoise(x, y, seed) {
      const ix = Math.floor(x);
      const iy = Math.floor(y);
      const fx = x - ix;
      const fy = y - iy;
      const ux = fx * fx * (3 - 2 * fx);
      const uy = fy * fy * (3 - 2 * fy);
      const a = hash2D(ix, iy, seed);
      const b = hash2D(ix + 1, iy, seed);
      const c = hash2D(ix, iy + 1, seed);
      const d = hash2D(ix + 1, iy + 1, seed);
      return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
    }

    function fbm(x, y, seed) {
      let v = 0;
      let amp = 0.52;
      let freq = 1;
      for (let i = 0; i < 4; i++) {
        v += amp * smoothNoise(x * freq, y * freq, seed + i * 19);
        freq *= 2.08;
        amp *= 0.48;
      }
      return v;
    }

    function renderProceduralBoulder(canvas, accentHex, seed, isLedge = false) {
      const w = canvas.width;
      const h = canvas.height;
      const ctx = canvas.getContext('2d');
      const img = ctx.createImageData(w, h);
      const data = img.data;
      const rim = hexToRgb(accentHex);

      // Moonlight direction (from top-right waterfall glow)
      const lx = 0.48, ly = -0.62, lz = 0.62;

      const cx = w * 0.5;
      const cy = isLedge ? h * 0.62 : h * 0.53;
      const rx = w * (isLedge ? 0.47 : 0.44);
      const ry = h * (isLedge ? 0.42 : 0.42);

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const nx = (x - cx) / rx;
          const ny = (y - cy) / ry;

          // Slightly flatter bottom so boulder feels heavy and grounded
          const flatNy = ny > 0.25 ? ny * 1.18 : ny * 0.96;
          const baseDist = Math.sqrt(nx * nx + flatNy * flatNy);

          // Organic craggy rock silhouette via angular low-freq noise
          const angle = Math.atan2(ny, nx);
          const edgeWarp =
            (smoothNoise(Math.cos(angle) * 2.4 + 4, Math.sin(angle) * 2.4 + 4, seed) - 0.5) * 0.16 +
            (smoothNoise(Math.cos(angle) * 5.2 + 9, Math.sin(angle) * 5.2 + 9, seed + 5) - 0.5) * 0.06;

          const dist = baseDist + edgeWarp;
          if (dist > 1.0) continue;

          // Anti-aliased outer edge
          const edgeAlpha = dist > 0.96 ? Math.max(0, (1.0 - dist) / 0.04) : 1.0;

          // Multi-octave rock heightmap & crevices
          const u = x * 0.032;
          const v = y * 0.032;
          const nVal = fbm(u, v, seed);
          const ridge = Math.abs(fbm(u * 1.7 + 10, v * 1.7 + 10, seed + 31) - 0.5) * 2;
          const crevice = Math.pow(ridge, 0.55); // Dark angular cracks

          // Approximate bump gradient for 3D rock facets
          const nRight = fbm((x + 1.5) * 0.032, v, seed);
          const nDown = fbm(u, (y + 1.5) * 0.032, seed);
          const bx = (nVal - nRight) * 3.4;
          const by = (nVal - nDown) * 3.4;

          // Combine dome normal + rocky bump normal
          const domeZ = Math.sqrt(Math.max(0.05, 1 - Math.min(0.95, dist * dist)));
          let sx = nx * 0.78 + bx;
          let sy = ny * 0.78 + by;
          let sz = domeZ;
          const invLen = 1 / Math.sqrt(sx * sx + sy * sy + sz * sz);
          sx *= invLen; sy *= invLen; sz *= invLen;

          // Diffuse Moonlight + Subtle Specular Granite Sparkle
          const diff = Math.max(0, sx * lx + sy * ly + sz * lz);
          const microGrain = (hash2D(x, y, seed + 99) - 0.5) * 18;

          // Base weathered basalt/granite color
          const baseTone = (32 + nVal * 44) * (0.52 + 0.48 * crevice);
          let r = baseTone * 0.92 + diff * 62 + microGrain;
          let g = baseTone * 0.96 + diff * 68 + microGrain;
          let b = baseTone * 1.18 + diff * 94 + microGrain;

          // Colored Neon Under-Glow & Rim-Light wrapping the boulder's lower edge & sides
          const rimFactor = Math.pow(Math.max(0, dist), 2.5);
          const bottomBias = Math.max(0, (ny + 0.55) / 1.55);
          const glowIntensity = isLedge
            ? rimFactor * 0.25
            : (rimFactor * (0.35 + 0.85 * bottomBias) + Math.pow(bottomBias, 3.2) * 0.45);

          r += rim.r * glowIntensity * 0.78;
          g += rim.g * glowIntensity * 0.78;
          b += rim.b * glowIntensity * 0.78;

          // Darken center slightly so crisp white label & neon icon pop cleanly
          if (!isLedge) {
            const centerShade = Math.max(0, 1 - baseDist * 1.15);
            r *= (1 - centerShade * 0.22);
            g *= (1 - centerShade * 0.22);
            b *= (1 - centerShade * 0.18);
          }

          const idx = (y * w + x) * 4;
          data[idx]     = Math.max(0, Math.min(255, r));
          data[idx + 1] = Math.max(0, Math.min(255, g));
          data[idx + 2] = Math.max(0, Math.min(255, b));
          data[idx + 3] = Math.floor(edgeAlpha * 255);
        }
      }

      ctx.putImageData(img, 0, 0);
    }

    function initProceduralStones() {
      document.querySelectorAll('.stone-card').forEach(card => {
        const key = card.dataset.section;
        const color = card.dataset.color;
        const seed = parseInt(card.dataset.seed || '17', 10);
        const canvas = card.querySelector('.stone-rock-canvas');
        if (canvas) {
          renderProceduralBoulder(canvas, color, seed, false);
          rockCanvasCache[key] = canvas;
        }
      });

      const ledgeCanvas = document.getElementById('bike-ledge-canvas');
      if (ledgeCanvas) {
        renderProceduralBoulder(ledgeCanvas, '#a855f7', 91, true);
      }
    }

    /* =========================================================================
       4. WEB AUDIO API SYNTHESIZED SFX (Engine Rev + Rock Shatter)
       ========================================================================= */
    function initAudio() {
      if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) audioCtx = new AudioContextClass();
      }
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }
    }

    function toggleSFX() {
      sfxEnabled = !sfxEnabled;
      document.getElementById('sfx-icon').textContent = sfxEnabled ? '🔊' : '🔇';
      document.getElementById('sfx-label').textContent = sfxEnabled ? 'SFX ON' : 'SFX OFF';
      if (sfxEnabled) {
        initAudio();
        showToast('Sound effects enabled! Hover or click a boulder.');
      } else {
        showToast('Sound effects muted.');
      }
    }

    function playRevSound() {
      if (!sfxEnabled) return;
      try {
        initAudio();
        if (!audioCtx) return;
        const now = audioCtx.currentTime;
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        osc1.type = 'sawtooth';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(82, now);
        osc1.frequency.exponentialRampToValueAtTime(360, now + 0.56);
        osc1.frequency.exponentialRampToValueAtTime(210, now + 0.74);

        osc2.frequency.setValueAtTime(164, now);
        osc2.frequency.exponentialRampToValueAtTime(540, now + 0.56);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1100, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.085, now + 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.76);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.77);
        osc2.stop(now + 0.77);
      } catch (e) { /* Ignore before user gesture */ }
    }

    function playSmashSound() {
      if (!sfxEnabled) return;
      try {
        initAudio();
        if (!audioCtx) return;
        const now = audioCtx.currentTime;

        // Heavy Sub-Bass Impact Thump
        const sub = audioCtx.createOscillator();
        const subGain = audioCtx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(135, now);
        sub.frequency.exponentialRampToValueAtTime(26, now + 0.42);
        subGain.gain.setValueAtTime(0.32, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.44);
        sub.connect(subGain);
        subGain.connect(audioCtx.destination);
        sub.start(now);
        sub.stop(now + 0.45);

        // Granite Shatter Crunch (Filtered Noise)
        const bufLen = Math.floor(audioCtx.sampleRate * 0.42);
        const buffer = audioCtx.createBuffer(1, bufLen, audioCtx.sampleRate);
        const channel = buffer.getChannelData(0);
        for (let i = 0; i < bufLen; i++) {
          const env = Math.pow(1 - i / bufLen, 1.65);
          channel[i] = (Math.random() * 2 - 1) * env;
        }
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        const bp = audioCtx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(680, now);
        bp.Q.value = 0.8;
        const nGain = audioCtx.createGain();
        nGain.gain.setValueAtTime(0.26, now);
        nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
        noise.connect(bp);
        bp.connect(nGain);
        nGain.connect(audioCtx.destination);
        noise.start(now);
      } catch (e) { /* Ignore */ }
    }

    /* =========================================================================
       5. HIGH-DPI CANVAS SETUP & ATMOSPHERIC WATERFALL / LAKE ENGINE
       ========================================================================= */
    function resizeCanvases() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      viewW = window.innerWidth;
      viewH = window.innerHeight;
      bgW = viewW;
      bgH = Math.max(arenaWrapper.offsetHeight, viewH);

      bgCanvas.width = Math.floor(bgW * dpr);
      bgCanvas.height = Math.floor(bgH * dpr);
      bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

      fxCanvas.width = Math.floor(viewW * dpr);
      fxCanvas.height = Math.floor(viewH * dpr);
      fxCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

      initAtmosphere();
    }

    function initAtmosphere() {
      stars.length = 0;
      waterfallStreams.length = 0;
      waterfallFoam.length = 0;
      mistClouds.length = 0;
      lakeRipples.length = 0;

      // Subtle Night Sky Stars
      for (let i = 0; i < 80; i++) {
        stars.push({
          x: Math.random() * bgW,
          y: Math.random() * (bgH * 0.48),
          r: Math.random() * 1.45 + 0.35,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.02 + 0.006
        });
      }

      // Multi-layered Waterfall Streaks (Top-Right)
      const wfLeft = bgW * 0.77;
      const wfWidth = Math.max(95, bgW * 0.145);
      for (let i = 0; i < 64; i++) {
        waterfallStreams.push({
          x: wfLeft + Math.random() * wfWidth,
          y: bgH * 0.16 + Math.random() * (bgH * 0.44),
          len: Math.random() * 72 + 28,
          speed: Math.random() * 4.2 + 2.8,
          width: Math.random() * 3.4 + 1.0,
          alpha: Math.random() * 0.42 + 0.18,
          bright: Math.random() > 0.72
        });
      }

      // Waterfall Foam Crest Particles
      for (let i = 0; i < 24; i++) {
        waterfallFoam.push({
          x: wfLeft + Math.random() * wfWidth,
          y: bgH * 0.16 + Math.random() * 14,
          r: Math.random() * 10 + 5,
          phase: Math.random() * Math.PI * 2
        });
      }

      // Cascading Mist Clouds at Waterfall Base
      for (let i = 0; i < 22; i++) {
        mistClouds.push({
          x: wfLeft - 30 + Math.random() * (wfWidth + 70),
          y: bgH * 0.56 + Math.random() * 58,
          r: Math.random() * 56 + 32,
          vx: (Math.random() - 0.5) * 0.38,
          alpha: Math.random() * 0.14 + 0.05
        });
      }

      // Glassy Lake Horizontal Ripples
      const lakeTop = bgH - 175;
      for (let i = 0; i < 38; i++) {
        lakeRipples.push({
          x: Math.random() * bgW,
          y: lakeTop + 10 + Math.random() * 155,
          w: Math.random() * 90 + 35,
          speed: (Math.random() - 0.5) * 0.35,
          alpha: Math.random() * 0.16 + 0.05
        });
      }
    }

    function drawAtmosphere(timeMs) {
      const t = timeMs * 0.001;
      bgCtx.clearRect(0, 0, bgW, bgH);

      // 1. Subtle Stars
      for (const s of stars) {
        s.phase += s.speed;
        const a = 0.2 + 0.65 * Math.abs(Math.sin(s.phase));
        bgCtx.fillStyle = `rgba(224, 231, 255, ${a})`;
        bgCtx.beginPath();
        bgCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        bgCtx.fill();
      }

      // 2. Distant Misty Mountain Peaks
      const mtnGrad1 = bgCtx.createLinearGradient(0, bgH * 0.25, 0, bgH * 0.78);
      mtnGrad1.addColorStop(0, '#162052');
      mtnGrad1.addColorStop(1, '#060a1e');
      bgCtx.fillStyle = mtnGrad1;
      bgCtx.beginPath();
      bgCtx.moveTo(0, bgH * 0.68);
      bgCtx.lineTo(bgW * 0.12, bgH * 0.54);
      bgCtx.lineTo(bgW * 0.24, bgH * 0.63);
      bgCtx.lineTo(bgW * 0.39, bgH * 0.48);
      bgCtx.lineTo(bgW * 0.54, bgH * 0.58);
      bgCtx.lineTo(bgW * 0.69, bgH * 0.33);
      bgCtx.lineTo(bgW * 0.80, bgH * 0.22);
      bgCtx.lineTo(bgW, bgH * 0.17);
      bgCtx.lineTo(bgW, bgH);
      bgCtx.lineTo(0, bgH);
      bgCtx.closePath();
      bgCtx.fill();

      // Volumetric Blue-Violet Atmospheric Haze behind the boulders
      const haze = bgCtx.createRadialGradient(bgW * 0.72, bgH * 0.42, 30, bgW * 0.72, bgH * 0.42, bgW * 0.42);
      haze.addColorStop(0, 'rgba(56, 189, 248, 0.20)');
      haze.addColorStop(0.55, 'rgba(99, 102, 241, 0.10)');
      haze.addColorStop(1, 'rgba(6, 10, 30, 0)');
      bgCtx.fillStyle = haze;
      bgCtx.fillRect(0, 0, bgW, bgH);

      // Dark Wet Rocky Cliff Walls flanking the Waterfall (Top-Right)
      const cliffGrad = bgCtx.createLinearGradient(bgW * 0.7, bgH * 0.15, bgW, bgH * 0.65);
      cliffGrad.addColorStop(0, '#18214a');
      cliffGrad.addColorStop(1, '#06091a');
      bgCtx.fillStyle = cliffGrad;
      bgCtx.beginPath();
      bgCtx.moveTo(bgW * 0.68, bgH * 0.66);
      bgCtx.lineTo(bgW * 0.74, bgH * 0.34);
      bgCtx.lineTo(bgW * 0.81, bgH * 0.18);
      bgCtx.lineTo(bgW, bgH * 0.12);
      bgCtx.lineTo(bgW, bgH * 0.72);
      bgCtx.closePath();
      bgCtx.fill();

      // 3. Realistic Animated Waterfall (Top-Right)
      const wfLeft = bgW * 0.77;
      const wfWidth = Math.max(95, bgW * 0.145);
      const wfTop = bgH * 0.16;
      const wfBottom = bgH * 0.62;

      // Waterfall Core Volume Gradient
      const wfCore = bgCtx.createLinearGradient(wfLeft, wfTop, wfLeft, wfBottom);
      wfCore.addColorStop(0, 'rgba(224, 242, 254, 0.58)');
      wfCore.addColorStop(0.35, 'rgba(125, 211, 252, 0.38)');
      wfCore.addColorStop(0.85, 'rgba(56, 189, 248, 0.24)');
      wfCore.addColorStop(1, 'rgba(56, 189, 248, 0)');
      bgCtx.fillStyle = wfCore;
      bgCtx.beginPath();
      bgCtx.moveTo(wfLeft + 10, wfTop);
      bgCtx.lineTo(wfLeft + wfWidth, wfTop - 16);
      bgCtx.lineTo(wfLeft + wfWidth + 14, wfBottom);
      bgCtx.lineTo(wfLeft - 14, wfBottom);
      bgCtx.closePath();
      bgCtx.fill();

      // Cascading Water Streaks
      for (const ws of waterfallStreams) {
        ws.y += ws.speed;
        if (ws.y > wfBottom) {
          ws.y = wfTop - ws.len * 0.35;
          ws.x = wfLeft + Math.random() * wfWidth;
        }
        const g = bgCtx.createLinearGradient(ws.x, ws.y, ws.x - 5, ws.y + ws.len);
        g.addColorStop(0, 'rgba(255, 255, 255, 0)');
        g.addColorStop(0.45, ws.bright ? `rgba(240, 249, 255, ${ws.alpha + 0.25})` : `rgba(125, 211, 252, ${ws.alpha})`);
        g.addColorStop(1, 'rgba(56, 189, 248, 0)');
        bgCtx.strokeStyle = g;
        bgCtx.lineWidth = ws.width;
        bgCtx.beginPath();
        bgCtx.moveTo(ws.x, ws.y);
        bgCtx.lineTo(ws.x - 5, ws.y + ws.len);
        bgCtx.stroke();
      }

      // Crest Foam
      for (const f of waterfallFoam) {
        const pulse = 0.75 + 0.25 * Math.sin(t * 3 + f.phase);
        const fg = bgCtx.createRadialGradient(f.x, f.y, 1, f.x, f.y, f.r * pulse);
        fg.addColorStop(0, 'rgba(240, 249, 255, 0.55)');
        fg.addColorStop(1, 'rgba(186, 230, 253, 0)');
        bgCtx.fillStyle = fg;
        bgCtx.beginPath();
        bgCtx.arc(f.x, f.y, f.r * pulse, 0, Math.PI * 2);
        bgCtx.fill();
      }

      // Rising Waterfall Mist Clouds
      for (const m of mistClouds) {
        m.x += m.vx;
        if (m.x < wfLeft - 50) m.x = wfLeft + wfWidth + 30;
        if (m.x > wfLeft + wfWidth + 50) m.x = wfLeft - 30;
        const mg = bgCtx.createRadialGradient(m.x, m.y, 4, m.x, m.y, m.r);
        mg.addColorStop(0, `rgba(186, 230, 253, ${m.alpha})`);
        mg.addColorStop(1, 'rgba(56, 189, 248, 0)');
        bgCtx.fillStyle = mg;
        bgCtx.beginPath();
        bgCtx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        bgCtx.fill();
      }

      // Dark Rocky Shoreline Bank behind Boulders
      bgCtx.fillStyle = '#070a1d';
      bgCtx.beginPath();
      bgCtx.moveTo(0, bgH - 180);
      bgCtx.quadraticCurveTo(bgW * 0.25, bgH - 220, bgW * 0.52, bgH - 190);
      bgCtx.quadraticCurveTo(bgW * 0.78, bgH - 210, bgW, bgH - 175);
      bgCtx.lineTo(bgW, bgH);
      bgCtx.lineTo(0, bgH);
      bgCtx.closePath();
      bgCtx.fill();

      // 4. Realistic Reflective Dark Lake (Bottom)
      const lakeTop = bgH - 172;
      const lakeGrad = bgCtx.createLinearGradient(0, lakeTop, 0, bgH);
      lakeGrad.addColorStop(0, '#070c26');
      lakeGrad.addColorStop(0.45, '#04081a');
      lakeGrad.addColorStop(1, '#02040e');
      bgCtx.fillStyle = lakeGrad;
      bgCtx.fillRect(0, lakeTop, bgW, 172);

      // Neon Boulder Color Reflections shimmering on the Lake
      const reflections = [
        { x: bgW * 0.26, color: '255, 149, 0', w: 150 },   // About Us Orange
        { x: bgW * 0.50, color: '0, 180, 255', w: 175 },   // Projects Blue
        { x: bgW * 0.52, color: '192, 38, 211', w: 185 },  // Coder Army Purple
        { x: bgW * 0.80, color: '16, 185, 129', w: 160 }   // Contact Green
      ];

      reflections.forEach((ref, idx) => {
        for (let strip = 0; strip < 14; strip++) {
          const sy = lakeTop + 6 + strip * 11;
          const waveX = Math.sin(t * 2.1 + strip * 0.7 + idx) * (6 + strip * 0.8);
          const sw = ref.w * (1 - strip * 0.045);
          const alpha = (0.34 - strip * 0.02) * (0.85 + 0.15 * Math.sin(t * 2.6 + idx));
          if (alpha <= 0) continue;
          const rg = bgCtx.createLinearGradient(ref.x - sw / 2 + waveX, sy, ref.x + sw / 2 + waveX, sy);
          rg.addColorStop(0, `rgba(${ref.color}, 0)`);
          rg.addColorStop(0.5, `rgba(${ref.color}, ${alpha})`);
          rg.addColorStop(1, `rgba(${ref.color}, 0)`);
          bgCtx.fillStyle = rg;
          bgCtx.fillRect(ref.x - sw / 2 + waveX, sy, sw, 5.5);
        }
      });

      // Subtle Glassy Water Ripples
      for (const rp of lakeRipples) {
        rp.x += rp.speed;
        if (rp.x > bgW + 60) rp.x = -60;
        if (rp.x < -60) rp.x = bgW + 60;
        bgCtx.fillStyle = `rgba(186, 230, 253, ${rp.alpha})`;
        bgCtx.fillRect(rp.x, rp.y, rp.w, 1.2);
      }
    }

    /* =========================================================================
       6. BIKE LAUNCH, AUTO-PATH, CRACK FLASH & TEXTURED ROCK SHATTER ENGINE
       ========================================================================= */
    function getBikeLaunchOrigin() {
      const anchor = document.getElementById('bike-home-anchor');
      if (anchor && window.innerWidth >= 768) {
        const rect = anchor.getBoundingClientRect();
        return {
          x: rect.left + rect.width * 0.52,
          y: rect.top + rect.height * 0.36
        };
      }
      return {
        x: Math.max(54, viewW * 0.12),
        y: Math.min(viewH * 0.44, 320)
      };
    }

    function evalBezier(t, p0, p1, p2, p3) {
      const u = 1 - t;
      const tt = t * t, uu = u * u;
      return {
        x: uu * u * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + tt * t * p3.x,
        y: uu * u * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + tt * t * p3.y
      };
    }

    function evalBezierTangent(t, p0, p1, p2, p3) {
      const u = 1 - t;
      const dx = 3 * u * u * (p1.x - p0.x) + 6 * u * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x);
      const dy = 3 * u * u * (p1.y - p0.y) + 6 * u * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y);
      return Math.atan2(dy, dx);
    }

    function triggerStoneByKey(sectionKey) {
      const card = document.querySelector(`.stone-card[data-section="${sectionKey}"]`);
      if (!card) return;
      if (activeModalKey) {
        closeModal(() => launchBikeToStone(card));
      } else {
        launchBikeToStone(card);
      }
    }

    function launchBikeToStone(stoneEl) {
      if (isAnimating || activeModalKey) return;
      if (Date.now() - lastClosedTime < 650) return;

      isAnimating = true;
      const sectionKey = stoneEl.dataset.section;
      const color = stoneEl.dataset.color || '#00b4ff';

      const start = getBikeLaunchOrigin();
      const targetRect = stoneEl.getBoundingClientRect();
      const end = {
        x: targetRect.left + targetRect.width / 2,
        y: targetRect.top + targetRect.height / 2
      };

      // Sweeping S-Curve / Arching Neon Path matching the cinematic reference
      const arcLift = Math.max(125, Math.abs(end.x - start.x) * 0.34);
      const p0 = { x: start.x, y: start.y };
      const p1 = { x: start.x + (end.x - start.x) * 0.25, y: Math.min(start.y, end.y) - arcLift };
      const p2 = { x: start.x + (end.x - start.x) * 0.68, y: end.y - arcLift * 0.58 };
      const p3 = { x: end.x, y: end.y };

      activeTrail = { p0, p1, p2, p3, color, progress: 0, fade: 1, state: 'drawing' };

      // Swap parked matte-black superbike for the active launching neon Rider
      if (parkedBikeEl) parkedBikeEl.style.opacity = '0';
      riderEl.style.opacity = '1';
      playRevSound();

      const duration = 740;
      const startTime = performance.now();

      function animateRun(now) {
        const rawT = Math.min(1, (now - startTime) / duration);
        const easedT = rawT < 0.5
          ? 2 * rawT * rawT
          : 1 - Math.pow(-2 * rawT + 2, 2) / 2;

        if (activeTrail) {
          activeTrail.progress = Math.min(1, easedT * 1.18);
        }

        const pos = evalBezier(easedT, p0, p1, p2, p3);
        const angleRad = evalBezierTangent(easedT, p0, p1, p2, p3);
        const angleDeg = (angleRad * 180) / Math.PI;
        const jumpScale = 1 + Math.sin(easedT * Math.PI) * 0.16;

        riderEl.style.left = `${pos.x}px`;
        riderEl.style.top = `${pos.y}px`;
        riderEl.style.transform = `translate(-50%, -50%) rotate(${angleDeg}deg) scale(${jumpScale})`;

        // Emit Stardust & Neon Speed Streaks along the path
        for (let i = 0; i < 4; i++) {
          sparks.push({
            x: pos.x - Math.cos(angleRad) * 44 + (Math.random() - 0.5) * 18,
            y: pos.y - Math.sin(angleRad) * 44 + (Math.random() - 0.5) * 18,
            vx: -Math.cos(angleRad) * (Math.random() * 2.8 + 1.2) + (Math.random() - 0.5) * 1.8,
            vy: -Math.sin(angleRad) * (Math.random() * 2.8 + 1.2) + (Math.random() - 0.5) * 1.8,
            r: Math.random() * 2.8 + 1.1,
            color: i === 0 ? '#ffffff' : (i === 1 ? color : '#e879f9'),
            alpha: 1,
            decay: 0.03 + Math.random() * 0.02
          });
        }

        if (rawT < 1) {
          requestAnimationFrame(animateRun);
        } else {
          triggerCrackAndShatter(stoneEl, end.x, end.y, color, sectionKey);
        }
      }

      requestAnimationFrame(animateRun);
    }

    function triggerCrackAndShatter(stoneEl, x, y, color, sectionKey) {
      playSmashSound();

      // Phase 1: Glowing Cracks Flash across the Rock Face (110ms)
      stoneEl.classList.add('stone-cracking');
      const crackLines = [];
      for (let c = 0; c < 7; c++) {
        const baseA = (c / 7) * Math.PI * 2 + (Math.random() - 0.5) * 0.35;
        const pts = [{ x, y }];
        let cx = x, cy = y;
        for (let seg = 1; seg <= 3; seg++) {
          const stepLen = 20 + Math.random() * 22;
          const jitter = baseA + (Math.random() - 0.5) * 0.5;
          cx += Math.cos(jitter) * stepLen;
          cy += Math.sin(jitter) * stepLen;
          pts.push({ x: cx, y: cy });
        }
        crackLines.push(pts);
      }
      crackFlashes.push({ lines: crackLines, color, alpha: 1 });

      // Begin Auto-Removing Neon Path immediately on destination arrival
      if (activeTrail) {
        activeTrail.progress = 1;
        activeTrail.state = 'fading';
      }

      // Phase 2: Shatter into 38+ Textured Polygonal Granite Shards
      setTimeout(() => {
        stoneEl.classList.remove('stone-cracking', 'stone-reforming');
        stoneEl.classList.add('stone-broken');

        // Screen Shake
        arenaWrapper.classList.remove('shake-impact');
        void arenaWrapper.offsetWidth;
        arenaWrapper.classList.add('shake-impact');

        // Expanding Neon Shockwave Ring
        shockwaves.push({ x, y, r: 22, maxR: 205, color, alpha: 0.96 });

        const rockTex = rockCanvasCache[sectionKey];
        for (let i = 0; i < 38; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 10.5 + 3.2;
          const size = Math.random() * 16 + 8;
          const sides = Math.floor(Math.random() * 3) + 4;
          const vertices = [];
          for (let v = 0; v < sides; v++) {
            const a = (v / sides) * Math.PI * 2;
            const rad = size * (0.6 + Math.random() * 0.45);
            vertices.push({ x: Math.cos(a) * rad, y: Math.sin(a) * rad });
          }

          shards.push({
            x: x + (Math.random() - 0.5) * 56,
            y: y + (Math.random() - 0.5) * 38,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 4.2,
            gravity: 0.30,
            rot: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 0.26,
            size,
            vertices,
            rockTex,
            texOffsetX: rockTex ? Math.random() * (rockTex.width * 0.5) + rockTex.width * 0.2 : 0,
            texOffsetY: rockTex ? Math.random() * (rockTex.height * 0.5) + rockTex.height * 0.2 : 0,
            edgeColor: color,
            alpha: 1,
            decay: 0.014 + Math.random() * 0.01
          });
        }

        // Dust Puffs
        for (let d = 0; d < 14; d++) {
          const a = Math.random() * Math.PI * 2;
          const sp = Math.random() * 3.5 + 1.2;
          dustPuffs.push({
            x: x + (Math.random() - 0.5) * 40,
            y: y + (Math.random() - 0.5) * 28,
            vx: Math.cos(a) * sp,
            vy: Math.sin(a) * sp - 0.8,
            r: Math.random() * 22 + 16,
            color,
            alpha: 0.45
          });
        }

        // High-Energy Neon Sparks
        for (let s = 0; s < 52; s++) {
          const a = Math.random() * Math.PI * 2;
          const sp = Math.random() * 12 + 2.5;
          sparks.push({
            x, y,
            vx: Math.cos(a) * sp,
            vy: Math.sin(a) * sp - 2.2,
            r: Math.random() * 3.2 + 1.3,
            color: Math.random() > 0.32 ? color : '#ffffff',
            alpha: 1,
            decay: 0.018 + Math.random() * 0.018
          });
        }

        riderEl.style.transition = 'opacity 0.26s ease';
        riderEl.style.opacity = '0';

        setTimeout(() => {
          openSectionModal(sectionKey, color);
          isAnimating = false;
          riderEl.style.transition = '';
        }, 420);
      }, 110);
    }

    /* =========================================================================
       7. FX CANVAS RENDER LOOP (Auto-Path, Cracks, Textured Shards, Embers)
       ========================================================================= */
    function drawFX() {
      fxCtx.clearRect(0, 0, viewW, viewH);

      // Subtle Floating Embers around the 4 Boulders
      if (!activeModalKey && Math.random() < 0.28) {
        const cards = document.querySelectorAll('.stone-card:not(.stone-broken)');
        if (cards.length > 0) {
          const pick = cards[Math.floor(Math.random() * cards.length)];
          const r = pick.getBoundingClientRect();
          if (r.width > 0) {
            sparks.push({
              x: r.left + Math.random() * r.width,
              y: r.bottom - 16 + (Math.random() - 0.5) * 14,
              vx: (Math.random() - 0.5) * 0.6,
              vy: -(Math.random() * 1.1 + 0.4),
              r: Math.random() * 2 + 0.9,
              color: pick.dataset.color,
              alpha: 0.85,
              decay: 0.018
            });
          }
        }
      }

      // 1. Multi-Layered Curved Neon Auto-Path
      if (activeTrail) {
        const { p0, p1, p2, p3, color, progress, fade } = activeTrail;
        const steps = 46;
        const maxStep = Math.max(1, Math.floor(steps * progress));

        fxCtx.save();
        fxCtx.lineCap = 'round';
        fxCtx.lineJoin = 'round';

        fxCtx.beginPath();
        for (let i = 0; i <= maxStep; i++) {
          const pt = evalBezier(i / steps, p0, p1, p2, p3);
          if (i === 0) fxCtx.moveTo(pt.x, pt.y);
          else fxCtx.lineTo(pt.x, pt.y);
        }

        // Outer Wide Atmospheric Glow
        fxCtx.strokeStyle = color;
        fxCtx.globalAlpha = fade * 0.34;
        fxCtx.lineWidth = 24;
        fxCtx.shadowColor = color;
        fxCtx.shadowBlur = 26;
        fxCtx.stroke();

        // Mid Iridescent Energy Ribbon
        const grad = fxCtx.createLinearGradient(p0.x, p0.y, p3.x, p3.y);
        grad.addColorStop(0, '#c026d3');
        grad.addColorStop(0.5, '#38bdf8');
        grad.addColorStop(1, color);
        fxCtx.strokeStyle = grad;
        fxCtx.globalAlpha = fade * 0.92;
        fxCtx.lineWidth = 7.5;
        fxCtx.stroke();

        // White-Hot Core
        fxCtx.strokeStyle = '#ffffff';
        fxCtx.globalAlpha = fade * 0.96;
        fxCtx.lineWidth = 2.6;
        fxCtx.stroke();
        fxCtx.restore();

        // Auto-disintegrate path cleanly after reaching destination
        if (activeTrail.state === 'fading') {
          activeTrail.fade -= 0.036;
          if (activeTrail.fade <= 0) activeTrail = null;
        }
      }

      // 2. Impact Cracks Flash
      for (let i = crackFlashes.length - 1; i >= 0; i--) {
        const cf = crackFlashes[i];
        cf.alpha -= 0.075;
        if (cf.alpha <= 0) {
          crackFlashes.splice(i, 1);
          continue;
        }
        fxCtx.save();
        fxCtx.globalAlpha = cf.alpha;
        fxCtx.strokeStyle = '#ffffff';
        fxCtx.shadowColor = cf.color;
        fxCtx.shadowBlur = 16;
        fxCtx.lineWidth = 3;
        cf.lines.forEach(pts => {
          fxCtx.beginPath();
          pts.forEach((pt, idx) => idx === 0 ? fxCtx.moveTo(pt.x, pt.y) : fxCtx.lineTo(pt.x, pt.y));
          fxCtx.stroke();
        });
        fxCtx.restore();
      }

      // 3. Expanding Shockwaves
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.r += (sw.maxR - sw.r) * 0.16;
        sw.alpha -= 0.04;
        if (sw.alpha <= 0) {
          shockwaves.splice(i, 1);
          continue;
        }
        fxCtx.save();
        fxCtx.beginPath();
        fxCtx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2);
        fxCtx.strokeStyle = sw.color;
        fxCtx.lineWidth = 4.2;
        fxCtx.globalAlpha = sw.alpha;
        fxCtx.shadowColor = sw.color;
        fxCtx.shadowBlur = 20;
        fxCtx.stroke();
        fxCtx.restore();
      }

      // 4. Shatter Dust Puffs
      for (let i = dustPuffs.length - 1; i >= 0; i--) {
        const dp = dustPuffs[i];
        dp.x += dp.vx;
        dp.y += dp.vy;
        dp.r += 0.9;
        dp.alpha -= 0.015;
        if (dp.alpha <= 0) {
          dustPuffs.splice(i, 1);
          continue;
        }
        const dg = fxCtx.createRadialGradient(dp.x, dp.y, 2, dp.x, dp.y, dp.r);
        dg.addColorStop(0, `rgba(148, 163, 184, ${dp.alpha})`);
        dg.addColorStop(1, 'rgba(15, 23, 42, 0)');
        fxCtx.fillStyle = dg;
        fxCtx.beginPath();
        fxCtx.arc(dp.x, dp.y, dp.r, 0, Math.PI * 2);
        fxCtx.fill();
      }

      // 5. Textured Polygonal Granite Rock Shards
      for (let i = shards.length - 1; i >= 0; i--) {
        const sh = shards[i];
        sh.x += sh.vx;
        sh.y += sh.vy;
        sh.vy += sh.gravity;
        sh.rot += sh.vRot;
        sh.alpha -= sh.decay;

        if (sh.alpha <= 0) {
          shards.splice(i, 1);
          continue;
        }

        fxCtx.save();
        fxCtx.translate(sh.x, sh.y);
        fxCtx.rotate(sh.rot);
        fxCtx.globalAlpha = sh.alpha;

        fxCtx.beginPath();
        sh.vertices.forEach((v, idx) => idx === 0 ? fxCtx.moveTo(v.x, v.y) : fxCtx.lineTo(v.x, v.y));
        fxCtx.closePath();

        // Clip and fill with actual procedural granite texture from the smashed boulder!
        fxCtx.save();
        fxCtx.clip();
        if (sh.rockTex) {
          fxCtx.drawImage(
            sh.rockTex,
            sh.texOffsetX, sh.texOffsetY, sh.size * 2.4, sh.size * 2.4,
            -sh.size, -sh.size, sh.size * 2, sh.size * 2
          );
        } else {
          fxCtx.fillStyle = '#1e243b';
          fxCtx.fill();
        }
        fxCtx.restore();

        // Glowing Fractured Edge
        fxCtx.strokeStyle = sh.edgeColor;
        fxCtx.lineWidth = 1.6;
        fxCtx.shadowColor = sh.edgeColor;
        fxCtx.shadowBlur = 10;
        fxCtx.stroke();
        fxCtx.restore();
      }

      // 6. High-Energy Sparks & Stardust
      for (let i = sparks.length - 1; i >= 0; i--) {
        const sp = sparks[i];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.alpha -= sp.decay;
        if (sp.alpha <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        fxCtx.save();
        fxCtx.globalAlpha = sp.alpha;
        fxCtx.fillStyle = sp.color;
        fxCtx.shadowColor = sp.color;
        fxCtx.shadowBlur = 8;
        fxCtx.beginPath();
        fxCtx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
        fxCtx.fill();
        fxCtx.restore();
      }
    }

    function mainLoop(timeMs) {
      drawAtmosphere(timeMs);
      drawFX();
      requestAnimationFrame(mainLoop);
    }

    /* =========================================================================
       8. GAME-HUB SECTION MODALS (Projects, About Us, Coder Army, Contact)
       ========================================================================= */
    function renderCoverArt(type, accent) {
      if (type === 'retro') {
        return `
          <svg viewBox="0 0 260 120" class="w-full h-32 rounded-xl bg-slate-950 border border-white/10">
            <rect width="260" height="120" fill="#120c2c"/>
            <rect x="26" y="16" width="208" height="88" rx="9" fill="#1c1846" stroke="${accent}" stroke-width="2"/>
            <rect x="26" y="16" width="208" height="20" rx="6" fill="${accent}" opacity="0.32"/>
            <circle cx="42" cy="26" r="3.5" fill="#fb7185"/>
            <circle cx="54" cy="26" r="3.5" fill="#fbbf24"/>
            <circle cx="66" cy="26" r="3.5" fill="#34d399"/>
            <rect x="44" y="48" width="94" height="10" rx="3" fill="#e9d5ff" opacity="0.88"/>
            <rect x="44" y="66" width="146" height="8" rx="3" fill="#94a3b8" opacity="0.5"/>
            <rect x="44" y="80" width="108" height="8" rx="3" fill="#38bdf8" opacity="0.65"/>
          </svg>`;
      }
      if (type === 'dungeon') {
        return `
          <svg viewBox="0 0 260 120" class="w-full h-32 rounded-xl bg-slate-950 border border-white/10">
            <rect width="260" height="120" fill="#061914"/>
            <rect x="0" y="92" width="260" height="28" fill="#14532d"/>
            <rect x="48" y="58" width="28" height="34" fill="${accent}" rx="4"/>
            <rect x="54" y="66" width="6" height="6" fill="#052e16"/>
            <rect x="66" y="66" width="6" height="6" fill="#052e16"/>
            <rect x="132" y="38" width="24" height="24" fill="#facc15" rx="4"/>
            <rect x="188" y="56" width="34" height="36" fill="#0f172a" stroke="${accent}" stroke-width="2"/>
          </svg>`;
      }
      return `
        <svg viewBox="0 0 260 120" class="w-full h-32 rounded-xl bg-slate-950 border border-white/10">
          <rect width="260" height="120" fill="#090e26"/>
          <path d="M130 42 L8 120 L252 120 Z" fill="#050817" stroke="${accent}" stroke-width="2"/>
          <line x1="130" y1="42" x2="130" y2="120" stroke="${accent}" stroke-width="2" stroke-dasharray="6 6"/>
          <circle cx="130" cy="36" r="18" fill="#a855f7" opacity="0.55"/>
          <rect x="108" y="84" width="44" height="16" rx="5" fill="${accent}"/>
          <rect x="116" y="78" width="28" height="8" rx="3" fill="#e0f2fe"/>
        </svg>`;
    }

    function openSectionModal(sectionKey, color) {
      activeModalKey = sectionKey;
      const eyebrow = document.getElementById('modal-eyebrow');
      const title = document.getElementById('modal-title');
      const body = document.getElementById('modal-body');
      const accentBar = document.getElementById('modal-accent-bar');

      accentBar.style.background = `linear-gradient(90deg, ${color}, #a855f7, ${color})`;
      modalCard.style.borderColor = color;
      eyebrow.style.color = color;

      document.querySelectorAll('.nav-link').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.nav === sectionKey);
      });

      if (sectionKey === 'projects') {
        eyebrow.textContent = 'BLUE BOULDER SHATTERED • GAME GALLERY';
        title.textContent = 'OUR BUILDS & GAMES';
        body.innerHTML = `
          <p class="text-slate-300 text-sm sm:text-base">
            Explore interactive web games and creative builds crafted by Rishi Raj. Update links anytime inside <code>PORTFOLIO_CONFIG.projects</code>.
          </p>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            ${PORTFOLIO_CONFIG.projects.map(p => `
              <div class="rounded-2xl bg-slate-900/85 border border-white/10 hover:border-sky-400/60 p-4 flex flex-col justify-between transition">
                <div>
                  ${renderCoverArt(p.artType, p.accent)}
                  <h3 class="mt-3 font-display font-bold text-lg text-white">${p.title}</h3>
                  <span class="text-xs font-medium text-sky-300">${p.genre}</span>
                  <p class="mt-2 text-xs sm:text-sm text-slate-300/90 leading-relaxed">${p.description}</p>
                  <div class="mt-3 flex flex-wrap gap-1.5">
                    ${p.tags.map(t => `<span class="px-2.5 py-0.5 rounded-full text-[11px] bg-white/5 border border-white/10 text-slate-200">${t}</span>`).join('')}
                  </div>
                </div>
                <div class="mt-4 grid grid-cols-2 gap-2">
                  <a href="${p.demoUrl}" target="_blank" rel="noopener noreferrer"
                     onclick="showToast('Launching ${p.title} demo...')"
                     class="py-2 rounded-xl text-center text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 transition shadow-[0_0_14px_rgba(0,180,255,0.35)]">
                    PLAY / DEMO
                  </a>
                  <a href="${p.githubUrl}" target="_blank" rel="noopener noreferrer"
                     onclick="showToast('Opening ${p.title} on GitHub...')"
                     class="py-2 rounded-xl text-center text-xs font-bold text-slate-200 bg-white/10 hover:bg-white/20 border border-white/15 transition">
                    GITHUB
                  </a>
                </div>
              </div>
            `).join('')}
          </div>
        `;
      } else if (sectionKey === 'about') {
        const dev = PORTFOLIO_CONFIG.developer;
        eyebrow.textContent = 'ORANGE BOULDER SHATTERED • DEVELOPER PROFILE';
        title.textContent = 'THE RIDER: RISHI RAJ';
        body.innerHTML = `
          <div class="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
            <div class="md:col-span-2 rounded-2xl bg-gradient-to-br from-orange-500/15 via-slate-900/90 to-purple-900/25 border border-orange-400/40 p-5 text-center">
              <div class="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-orange-500 to-purple-600 p-1 shadow-[0_0_26px_rgba(255,149,0,0.45)]">
                <div class="w-full h-full rounded-full bg-slate-950 flex items-center justify-center font-display font-extrabold text-3xl text-amber-300">
                  ${dev.initials}
                </div>
              </div>
              <h3 class="mt-4 font-display font-extrabold text-xl text-white">${dev.name}</h3>
              <p class="text-xs font-semibold uppercase tracking-wider text-amber-300 mt-1">Student • Gamer • Builder</p>
              <div class="mt-4 flex flex-col gap-2 items-center">
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-400/40 text-xs text-amber-200">
                  📍 ${dev.location}
                </span>
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-400/40 text-xs text-purple-200">
                  🎓 RRSDCE (BEU) Student
                </span>
              </div>
            </div>

            <div class="md:col-span-3 space-y-5">
              <div class="rounded-2xl bg-slate-900/80 border border-white/10 p-5">
                <h4 class="font-display font-bold text-lg text-amber-300 mb-2">About Me &amp; This Project</h4>
                <p class="text-sm sm:text-base text-slate-200 leading-relaxed">${dev.bio}</p>
                <p class="mt-3 text-xs text-slate-400"><strong class="text-slate-200">Institution:</strong> ${dev.college}</p>
              </div>

              <div class="rounded-2xl bg-slate-900/80 border border-white/10 p-5">
                <h4 class="font-display font-bold text-xs uppercase tracking-[0.2em] text-slate-300 mb-3">Tech &amp; Design Skill Chips</h4>
                <div class="flex flex-wrap gap-2">
                  ${dev.skills.map(s => `<span class="px-3 py-1.5 rounded-full text-xs font-semibold bg-orange-500/10 border border-orange-400/35 text-amber-200">${s}</span>`).join('')}
                </div>
              </div>
            </div>
          </div>
        `;
      } else if (sectionKey === 'coderarmy') {
        eyebrow.textContent = 'PURPLE BOULDER SHATTERED • TEAM PORTAL';
        title.textContent = "CODER ARMY ALLIANCE — FRIENDS' GAME HUB";
        body.innerHTML = `
          <div class="rounded-2xl bg-fuchsia-500/10 border border-fuchsia-400/35 p-4 flex flex-wrap items-center justify-between gap-3">
            <p class="text-sm sm:text-base text-slate-200">
              Welcome to <strong class="text-fuchsia-300">Coder Army</strong> — our merged team game network showcasing awesome web games created by my friends!
            </p>
            <button onclick="toggleFriendSnippet()"
              class="px-3.5 py-1.5 rounded-full text-xs font-bold bg-fuchsia-600/30 hover:bg-fuchsia-600/50 border border-fuchsia-400/60 text-fuchsia-100 transition">
              + Preview How to Add a Friend's Game
            </button>
          </div>

          <!-- Toggleable Developer Tip showing exact JSON entry -->
          <div id="friend-json-tip" class="hidden rounded-2xl bg-slate-950/90 border border-fuchsia-500/40 p-4 text-xs text-slate-200">
            <p class="text-fuchsia-300 font-semibold mb-2">Paste a new entry inside <code>PORTFOLIO_CONFIG.coderArmyFriends</code> at the top of the script:</p>
            <pre class="overflow-x-auto p-3 rounded-xl bg-black/60 text-cyan-300 font-mono leading-relaxed">{
  title: "My Friend's Game",
  developer: "Friend Name • Coder Army",
  genre: "Arcade",
  description: "Short description of the game.",
  color: "#00b4ff",
  url: "https://friend-username.github.io/game-repo/"
}</pre>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            ${PORTFOLIO_CONFIG.coderArmyFriends.map(f => `
              <div class="rounded-2xl bg-slate-900/85 border border-white/10 hover:border-fuchsia-400/60 p-5 flex flex-col justify-between transition">
                <div>
                  <div class="flex items-center justify-between gap-2 mb-1.5">
                    <h3 class="font-display font-bold text-lg text-white">${f.title}</h3>
                    <span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold" style="background:${f.color}22; color:${f.color}; border:1px solid ${f.color}55;">
                      ${f.genre}
                    </span>
                  </div>
                  <p class="text-xs font-medium text-fuchsia-300 mb-2">${f.developer}</p>
                  <p class="text-xs sm:text-sm text-slate-300/90 leading-relaxed">${f.description}</p>
                </div>
                <a href="${f.url}" target="_blank" rel="noopener noreferrer"
                   onclick="showToast('Visiting ${f.title} by ${f.developer}...')"
                   class="mt-4 inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold tracking-wide text-white bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 shadow-[0_0_18px_rgba(192,38,211,0.38)] transition">
                  VISIT GAME &rarr;
                </a>
              </div>
            `).join('')}
          </div>
        `;
      } else if (sectionKey === 'contact') {
        const dev = PORTFOLIO_CONFIG.developer;
        eyebrow.textContent = 'GREEN BOULDER SHATTERED • SUPPORT DESK';
        title.textContent = 'PLAYER SUPPORT & HELP DESK';
        body.innerHTML = `
          <div class="grid grid-cols-1 md:grid-cols-5 gap-6">
            <form onsubmit="handleSupportSubmit(event)" class="md:col-span-3 space-y-4 rounded-2xl bg-slate-900/80 border border-emerald-500/35 p-5">
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-emerald-300 mb-1.5">Player Name</label>
                <input type="text" required placeholder="Enter your name or gamer tag"
                  class="w-full px-4 py-2.5 rounded-xl bg-slate-950/90 border border-white/15 text-sm text-white focus:outline-none focus:border-emerald-400" />
              </div>
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-emerald-300 mb-1.5">Game / Issue Category</label>
                <select class="w-full px-4 py-2.5 rounded-xl bg-slate-950/90 border border-white/15 text-sm text-white focus:outline-none focus:border-emerald-400">
                  <option>Gameplay Help / Controls</option>
                  <option>Report a Bug</option>
                  <option>Submit a Coder Army Friend Game</option>
                  <option>Collaboration / Feedback</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-emerald-300 mb-1.5">Message / Transmission</label>
                <textarea rows="3" required placeholder="Tell us how we can help you..."
                  class="w-full px-4 py-2.5 rounded-xl bg-slate-950/90 border border-white/15 text-sm text-white focus:outline-none focus:border-emerald-400"></textarea>
              </div>
              <button type="submit"
                class="w-full py-3 rounded-xl font-display font-bold text-sm tracking-wide text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-[0_0_24px_rgba(16,185,129,0.5)] transition">
                SEND SIGNAL 🛰️
              </button>
              <div id="support-confirm" class="hidden p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-400/50 text-xs sm:text-sm text-emerald-200">
                ✅ Transmission received! Rishi Raj &amp; the Player Support team will respond soon.
              </div>
            </form>

            <div class="md:col-span-2 space-y-3.5">
              <a href="mailto:${dev.email}" class="block rounded-2xl bg-slate-900/80 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-400/50 p-4 transition">
                <div class="text-sm font-display font-bold text-emerald-300">✉️ Email Support</div>
                <p class="text-xs text-slate-300 mt-1">Direct player assistance from Rishi Raj.</p>
              </a>
              <a href="${dev.githubUrl}" target="_blank" rel="noopener noreferrer" class="block rounded-2xl bg-slate-900/80 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-400/50 p-4 transition">
                <div class="text-sm font-display font-bold text-emerald-300">🐞 Report Bug on GitHub</div>
                <p class="text-xs text-slate-300 mt-1">Open an issue or suggest a new feature.</p>
              </a>
              <a href="${dev.discordUrl}" target="_blank" rel="noopener noreferrer" class="block rounded-2xl bg-slate-900/80 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-400/50 p-4 transition">
                <div class="text-sm font-display font-bold text-emerald-300">🎮 Join Coder Army Discord</div>
                <p class="text-xs text-slate-300 mt-1">Hang out with RRSDCE student builders &amp; gamers.</p>
              </a>
            </div>
          </div>
        `;
      }

      modalEl.classList.remove('hidden');
      modalEl.classList.add('flex');
      requestAnimationFrame(() => {
        modalEl.classList.remove('opacity-0');
        modalCard.classList.remove('scale-95', 'opacity-0');
        modalCard.classList.add('scale-100', 'opacity-100');
      });
    }

    function toggleFriendSnippet() {
      const tip = document.getElementById('friend-json-tip');
      if (tip) tip.classList.toggle('hidden');
    }

    function handleSupportSubmit(e) {
      e.preventDefault();
      const box = document.getElementById('support-confirm');
      if (box) box.classList.remove('hidden');
      e.target.reset();
      showToast('Support signal transmitted! Thank you for playing.');
    }

    function closeModal(onClosedCallback) {
      if (!activeModalKey) {
        if (typeof onClosedCallback === 'function') onClosedCallback();
        return;
      }

      modalEl.classList.add('opacity-0');
      modalCard.classList.remove('scale-100', 'opacity-100');
      modalCard.classList.add('scale-95', 'opacity-0');

      setTimeout(() => {
        modalEl.classList.add('hidden');
        modalEl.classList.remove('flex');
        activeModalKey = null;
        lastClosedTime = Date.now();
        resetArena(false);
        if (typeof onClosedCallback === 'function') {
          setTimeout(onClosedCallback, 220);
        }
      }, 280);
    }

    function resetArena(closeIfOpen) {
      if (closeIfOpen && activeModalKey) {
        closeModal();
        return;
      }

      document.querySelectorAll('.nav-link').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.nav === 'home');
      });

      // Reform shattered boulders with reverse glow pulse
      document.querySelectorAll('.stone-card.stone-broken').forEach(card => {
        card.classList.remove('stone-broken');
        card.classList.add('stone-reforming');
        setTimeout(() => card.classList.remove('stone-reforming'), 620);
      });

      // Park the realistic matte-black superbike back on the left rocky ledge
      riderEl.style.opacity = '0';
      if (parkedBikeEl) parkedBikeEl.style.opacity = '1';
    }

    /* =========================================================================
       9. TOAST HELPER
       ========================================================================= */
    let toastTimer = null;
    function showToast(message) {
      const box = document.getElementById('toast-box');
      const msg = document.getElementById('toast-msg');
      msg.textContent = message;
      box.classList.remove('translate-y-24', 'opacity-0');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        box.classList.add('translate-y-24', 'opacity-0');
      }, 2800);
    }

    /* =========================================================================
       10. HOVER-INTENT (180ms) & CLICK EVENT BINDINGS
       ========================================================================= */
    function bindStoneEvents() {
      document.querySelectorAll('.stone-card').forEach(stone => {
        let hoverTimer = null;

        // Intentional Hover (180ms) launches the Rider without accidental misfires
        stone.addEventListener('mouseenter', () => {
          if (!window.matchMedia('(hover: hover)').matches) return;
          hoverTimer = setTimeout(() => {
            launchBikeToStone(stone);
          }, 180);
        });

        stone.addEventListener('mouseleave', () => {
          if (hoverTimer) {
            clearTimeout(hoverTimer);
            hoverTimer = null;
          }
        });

        // Instant Click / Touch Tap
        stone.addEventListener('click', () => {
          if (hoverTimer) {
            clearTimeout(hoverTimer);
            hoverTimer = null;
          }
          initAudio();
          launchBikeToStone(stone);
        });

        // Keyboard Accessibility
        stone.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            initAudio();
            launchBikeToStone(stone);
          }
        });
      });

      modalEl.addEventListener('click', (e) => {
        if (e.target === modalEl) closeModal();
      });
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && activeModalKey) closeModal();
      });
    }

    window.addEventListener('resize', resizeCanvases);

    window.onload = function () {
      initProceduralStones();
      resizeCanvases();
      bindStoneEvents();
      requestAnimationFrame(mainLoop);
    };
