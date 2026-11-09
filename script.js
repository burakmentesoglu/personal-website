/* ==========================================================================
   BURAK MENTESOGLU — ULTRA-MINIMALIST CENTRAL COLUMN & BLUE HOUR SAKURA
   Interactive Engine (script.js):
   1. Smooth Top-to-Bottom Page Reveal
   2. SPA Tab Switcher (about, projects, art, playground, contact) with Fade
   3. Web Audio API Synthesizer (Fūrin Chime + Mechanical Desk Lamp Click)
   4. Steaming Hot Drink Micro-Interaction
   5. Floating Sakura Petals & Warm Parallax Dust Canvas
   6. "Lil Me" Companion (lil-me.zip — Male, Black Hair, Clear-Framed Glasses)
   7. 3D Hover Tilt & 180° Click Flip Polaroid Cards (photocard.zip)
   ========================================================================== */

(() => {
  'use strict';

  /* ------------------------------------------------------------------------
     1. SMOOTH PAGE REVEAL
     ------------------------------------------------------------------------ */
  window.addEventListener('DOMContentLoaded', () => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        document.body.classList.add('is-loaded');
      }, 60);
    });
  });

  /* ------------------------------------------------------------------------
     2. WEB AUDIO SYNTHESIZER (FŪRIN WIND CHIME & MECHANICAL LAMP CLICK)
     ------------------------------------------------------------------------ */
  class CozyAudioEngine {
    constructor() {
      this.ctx = null;
      this.isMuted = false;
      this.lastChimeMs = 0;
      // Pentatonic Hirajoshi / Yo high glass bell notes (Hz)
      this.notes = [1046.5, 1174.66, 1318.51, 1567.98, 1760.0, 2093.0];
    }

    ensureContext() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    }

    playWindChime() {
      if (this.isMuted) return;
      const nowMs = performance.now();
      if (nowMs - this.lastChimeMs < 300) return;
      this.lastChimeMs = nowMs;

      try {
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const strikes = 2 + Math.floor(Math.random() * 2);

        for (let i = 0; i < strikes; i++) {
          const delay = i * (0.1 + Math.random() * 0.08);
          const freq = this.notes[Math.floor(Math.random() * this.notes.length)];

          const oscMain = this.ctx.createOscillator();
          const oscOver = this.ctx.createOscillator();
          const overGain = this.ctx.createGain();
          const env = this.ctx.createGain();

          oscMain.type = 'sine';
          oscOver.type = 'triangle';
          oscMain.frequency.setValueAtTime(freq, now + delay);
          oscOver.frequency.setValueAtTime(freq * 2.756, now + delay);

          overGain.gain.setValueAtTime(0.11, now + delay);

          env.gain.setValueAtTime(0.0001, now + delay);
          env.gain.linearRampToValueAtTime(0.068 / (i + 1), now + delay + 0.016);
          env.gain.exponentialRampToValueAtTime(0.0001, now + delay + 2.2);

          oscMain.connect(env);
          oscOver.connect(overGain);
          overGain.connect(env);
          env.connect(this.ctx.destination);

          oscMain.start(now + delay);
          oscOver.start(now + delay);
          oscMain.stop(now + delay + 2.25);
          oscOver.stop(now + delay + 2.25);
        }
      } catch (_) {}
    }

    playCardFlip() {
      if (this.isMuted) return;
      try {
        this.ensureContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(250, now);
        osc.frequency.exponentialRampToValueAtTime(490, now + 0.085);

        gain.gain.setValueAtTime(0.032, now);
        gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.095);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
      } catch (_) {}
    }
  }

  const audio = new CozyAudioEngine();

  /* ------------------------------------------------------------------------
     3. INTERACTIVE WIND CHIME (FŪRIN) & MUTE BUTTON
     ------------------------------------------------------------------------ */
  const furinEl = document.getElementById('furin-chime');
  const muteBtn = document.getElementById('audio-mute-toggle');
  const muteIcon = document.getElementById('audio-mute-icon');
  const muteLabel = document.getElementById('audio-mute-label');
  let ringTimer = null;
  let windGustBoost = 0;

  function triggerWindChime() {
    if (!furinEl) return;
    furinEl.classList.remove('is-ringing');
    void furinEl.offsetWidth;
    furinEl.classList.add('is-ringing');

    windGustBoost = 2.2;
    audio.playWindChime();

    clearTimeout(ringTimer);
    ringTimer = setTimeout(() => {
      furinEl.classList.remove('is-ringing');
    }, 2250);
  }

  if (furinEl) {
    furinEl.addEventListener('mouseenter', triggerWindChime);
    furinEl.addEventListener('click', triggerWindChime);
    furinEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        triggerWindChime();
      }
    });
  }

  if (muteBtn) {
    muteBtn.addEventListener('click', () => {
      audio.isMuted = !audio.isMuted;
      muteBtn.setAttribute('aria-pressed', String(audio.isMuted));
      muteBtn.classList.toggle('is-muted', audio.isMuted);
      if (muteIcon) muteIcon.textContent = audio.isMuted ? '🔕' : '🔔';
      if (muteLabel) muteLabel.textContent = audio.isMuted ? 'muted' : 'chime on';
      if (!audio.isMuted) triggerWindChime();
    });
  }

  /* ------------------------------------------------------------------------
     4. KYLIE-STYLE TYPEWRITER & DOCUMENT BACKSPACE HEADER EFFECT
     "Hello, I'm Burak Mentesoglu" -> deletes -> "an engineer and scientist" -> deletes -> "a cat lover"
     ------------------------------------------------------------------------ */
  const typedTextEl = document.getElementById('typed-text');
  const typedCursorEl = document.querySelector('.typed-cursor');
  const typedPhrases = [
    'Burak Mentesoglu',
    'an engineer and scientist',
    'a cat lover'
  ];

  if (typedTextEl) {
    let phraseIndex = 0;
    let charIndex = typedPhrases[0].length;
    let isDeleting = true;

    function stepTypewriter() {
      const currentPhrase = typedPhrases[phraseIndex];

      if (isDeleting) {
        charIndex--;
        typedTextEl.textContent = currentPhrase.substring(0, charIndex);
        if (typedCursorEl) typedCursorEl.classList.add('is-typing');

        if (charIndex <= 0) {
          isDeleting = false;
          phraseIndex = (phraseIndex + 1) % typedPhrases.length;
          if (typedCursorEl) typedCursorEl.classList.remove('is-typing');
          setTimeout(stepTypewriter, 360);
        } else {
          // Word-like backspace speed
          setTimeout(stepTypewriter, 48 + Math.random() * 22);
        }
      } else {
        charIndex++;
        typedTextEl.textContent = currentPhrase.substring(0, charIndex);
        if (typedCursorEl) typedCursorEl.classList.add('is-typing');

        if (charIndex >= currentPhrase.length) {
          isDeleting = true;
          if (typedCursorEl) typedCursorEl.classList.remove('is-typing');
          // Pause while full phrase is displayed before backspacing
          setTimeout(stepTypewriter, phraseIndex === 0 ? 2200 : 1750);
        } else {
          // Natural typing cadence
          setTimeout(stepTypewriter, 75 + Math.random() * 35);
        }
      }
    }

    // Start backspacing "Burak Mentesoglu" after initial page reveal
    setTimeout(stepTypewriter, 2200);
  }

  /* ------------------------------------------------------------------------
     5. ULTRA-MINIMALIST TAB NAVIGATION (NO PAGE RELOAD, SMOOTH FADE)
     ------------------------------------------------------------------------ */
  const tabButtons = document.querySelectorAll('.nav-tab-link');
  const tabPanels = document.querySelectorAll('.tab-panel');
  const tabJumpBtns = document.querySelectorAll('[data-tab-jump], [data-tab-target]');

  const tabMessages = {
    about: 'welcome! here is my minimalist overview 🌸',
    projects: 'hover any polaroid to tilt in 3d, or click to flip 180°!',
    resume: 'here is my education & research experience timeline 📄',
    contact: 'feel free to reach out anytime ✨'
  };

  function switchTab(targetTab, announceCompanion = true) {
    tabButtons.forEach((btn) => {
      const isMatch = btn.getAttribute('data-tab') === targetTab;
      btn.classList.toggle('is-active', isMatch);
      btn.setAttribute('aria-selected', String(isMatch));
    });

    tabPanels.forEach((panel) => {
      const isMatch = panel.id === `tab-${targetTab}`;
      if (isMatch) {
        panel.hidden = false;
        panel.classList.remove('is-active');
        void panel.offsetWidth;
        panel.classList.add('is-active');
      } else {
        panel.hidden = true;
        panel.classList.remove('is-active');
      }
    });

    if (history.replaceState) {
      history.replaceState(null, '', `#${targetTab}`);
    }

    if (announceCompanion && tabMessages[targetTab]) {
      revealLilMeWithMessage(tabMessages[targetTab]);
    }
  }

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');
      if (target) switchTab(target, true);
    });
  });

  tabJumpBtns.forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const target = el.getAttribute('data-tab-jump') || el.getAttribute('data-tab-target');
      if (target) switchTab(target, true);
    });
  });

  // Load initial hash tab if provided
  const initialHash = window.location.hash.replace('#', '').trim().toLowerCase();
  if (['about', 'projects', 'resume', 'contact'].includes(initialHash)) {
    switchTab(initialHash, false);
  }

  // Copy Email button in Contact tab
  const copyEmailBtn = document.getElementById('copy-email-btn');
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', () => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText('brkmentesoglu@gmail.com').catch(() => {});
      }
      copyEmailBtn.textContent = 'copied ✓';
      setTimeout(() => {
        copyEmailBtn.textContent = 'copy';
      }, 1800);
    });
  }

  /* ------------------------------------------------------------------------
     7. 3D TILT + 180° FLIP POLAROID CARDS (ADAPTED FROM PHOTOCARD.ZIP)
     ------------------------------------------------------------------------ */
  const photocards = document.querySelectorAll('.photocard-wrap');

  photocards.forEach((card) => {
    const tiltEl = card.querySelector('.photocard-tilt');
    const bgLayer = card.querySelector('.polaroid-bg-layer');
    let resetTimer = null;

    card.addEventListener('mousemove', (e) => {
      if (!tiltEl) return;
      clearTimeout(resetTimer);

      const rect = card.getBoundingClientRect();
      const mouseX = e.clientX - rect.left - rect.width / 2;
      const mouseY = e.clientY - rect.top - rect.height / 2;

      const mousePX = mouseX / rect.width;
      const mousePY = mouseY / rect.height;

      // 3D Tilt angles (adapted from parallax-depth-cards.zip)
      const rY = mousePX * 22;
      const rX = mousePY * -22;
      tiltEl.style.transform = `rotateY(${rY.toFixed(2)}deg) rotateX(${rX.toFixed(2)}deg)`;

      // Specular glare coordinates
      const glareX = ((e.clientX - rect.left) / rect.width) * 100;
      const glareY = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--glare-x', `${glareX.toFixed(1)}%`);
      card.style.setProperty('--glare-y', `${glareY.toFixed(1)}%`);

      // Inner cover illustration depth parallax
      if (bgLayer) {
        const tX = mousePX * -18;
        const tY = mousePY * -18;
        bgLayer.style.transform = `translate3d(${tX.toFixed(1)}px, ${tY.toFixed(1)}px, 0)`;
      }
    });

    card.addEventListener('mouseleave', () => {
      resetTimer = setTimeout(() => {
        if (tiltEl) tiltEl.style.transform = 'rotateY(0deg) rotateX(0deg)';
        if (bgLayer) bgLayer.style.transform = 'translate3d(0, 0, 0)';
      }, 160);
    });

    const toggleCardFlip = () => {
      card.classList.toggle('is-flipped');
      audio.playCardFlip();
    };

    card.addEventListener('click', toggleCardFlip);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleCardFlip();
      }
    });
  });

  /* ------------------------------------------------------------------------
     8. "LIL ME" CHARACTER (ADAPTED FROM LIL-ME.ZIP — MALE, BLACK HAIR, CLEAR GLASSES)
     Peeks up on tab switch or scroll; tracks cursor with eyes & blinks
     ------------------------------------------------------------------------ */
  const lilMeDock = document.getElementById('lil-me-companion');
  const lilMeTrigger = document.getElementById('lil-me-trigger');
  const lilMeText = document.getElementById('lil-me-text');
  let hasPlayedEntrance = false;
  let dizzyPlaying = false;
  let dizzyTl = null;

  function initLilMeGSAP() {
    if (typeof window.gsap === 'undefined') return;

    const svgRoot = document.getElementById('lil-me-svg');
    if (!svgRoot) return;

    const q = (sel) => svgRoot.querySelector(sel);
    const qa = (sel) => svgRoot.querySelectorAll(sel);

    gsap.set(q('.bg'), { transformOrigin: '50% 50%' });
    gsap.set(q('.ear-right'), { transformOrigin: '0% 50%' });
    gsap.set(q('.ear-left'), { transformOrigin: '100% 50%' });
    gsap.set(q('.me'), { opacity: 1 });

    // Blink timeline
    const blinkTl = gsap.timeline({ repeat: -1, repeatDelay: 4.5, paused: true });
    blinkTl
      .to(qa('.eye-right, .eye-left'), { duration: 0.01, opacity: 0 }, 0)
      .to(qa('.eye-right-2, .eye-left-2'), { duration: 0.01, opacity: 1 }, 0)
      .to(qa('.eye-right, .eye-left'), { duration: 0.01, opacity: 1 }, 0.15)
      .to(qa('.eye-right-2, .eye-left-2'), { duration: 0.01, opacity: 0 }, 0.15);

    // Dizzy animation timeline
    dizzyTl = gsap.timeline({
      paused: true,
      onComplete: () => {
        dizzyPlaying = false;
      }
    });

    dizzyTl
      .to(q('.eyes'), { duration: 0.01, opacity: 0 }, 0)
      .to(qa('.dizzy'), { duration: 0.01, opacity: 0.55 }, 0)
      .to(q('.mouth'), { duration: 0.01, opacity: 0 }, 0)
      .to(q('.oh'), { duration: 0.01, opacity: 0.85 }, 0)
      .to(
        qa('.head, .hair-back, .shadow'),
        {
          duration: 3.2,
           keyframes: [
            { rotate: 4 },
            { rotate: -4 },
            { rotate: 3 },
            { rotate: -2 },
            { rotate: 0 }
          ],
          transformOrigin: '50% 50%'
        },
        0
      )
      .to(
        q('.dizzy-1'),
        { rotate: -360, duration: 0.8, repeat: 3, transformOrigin: '50% 50%', ease: 'none' },
        0.01
      )
      .to(
        q('.dizzy-2'),
        { rotate: 360, duration: 0.8, repeat: 3, transformOrigin: '50% 50%', ease: 'none' },
        0.01
      )
      .to(q('.eyes'), { duration: 0.01, opacity: 1 }, 2.6)
      .to(qa('.dizzy'), { duration: 0.01, opacity: 0 }, 2.6)
      .to(q('.oh'), { duration: 0.01, opacity: 0 }, 2.6)
      .to(q('.mouth'), { duration: 0.01, opacity: 1 }, 2.6);

    // Eye & face mouse tracking (adapted from lil-me/script.js)
    const dom = {
      face: q('.face'),
      eye: qa('.eye'),
      innerFace: q('.inner-face'),
      hairFront: q('.hair-front'),
      hairBack: q('.hair-back'),
      shadow: qa('.shadow'),
      ear: qa('.ear'),
      eyebrows: qa('.eyebrow-left, .eyebrow-right')
    };

    let xPos = window.innerWidth / 2;
    let yPos = window.innerHeight / 2;
    let storedX = 0;
    let storedY = 0;

    window.addEventListener(
      'mousemove',
      (ev) => {
        if (!dizzyPlaying) {
          xPos = ev.clientX;
          yPos = ev.clientY;
        }
        if (!dizzyPlaying && Math.abs(ev.movementX) > 520 && lilMeDock?.classList.contains('is-peeking')) {
          dizzyPlaying = true;
          if (lilMeText) lilMeText.textContent = 'whoa! fast cursor—my clear glasses spun! 🌀';
          dizzyTl.restart();
        }
      },
      { passive: true }
    );

    gsap.ticker.add(() => {
      if (storedX === xPos && storedY === yPos) return;
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;

      const x = (100 * xPos) / w - 50;
      const y = (100 * yPos) / h - 50;
      const yHigh = (100 * yPos) / h - 20;
      const yLow = (100 * yPos) / h - 80;

      gsap.to(dom.face, { yPercent: yLow / 30, xPercent: x / 30, duration: 0.25, overwrite: 'auto' });
      gsap.to(dom.eye, { yPercent: yHigh / 3, xPercent: x / 2, duration: 0.2, overwrite: 'auto' });
      gsap.to(dom.innerFace, { yPercent: y / 6, xPercent: x / 8, duration: 0.25, overwrite: 'auto' });
      gsap.to(dom.hairFront, { yPercent: yHigh / 15, xPercent: x / 22, duration: 0.25, overwrite: 'auto' });
      gsap.to([dom.hairBack, dom.shadow], {
        yPercent: (yLow / 20) * -1,
        xPercent: (x / 20) * -1,
        duration: 0.25,
        overwrite: 'auto'
      });
      gsap.to(dom.ear, {
        yPercent: (y / 1.5) * -1,
        xPercent: (x / 10) * -1,
        duration: 0.25,
        overwrite: 'auto'
      });
      gsap.to(dom.eyebrows, { yPercent: y * 2.2, duration: 0.25, overwrite: 'auto' });

      storedX = xPos;
      storedY = yPos;
    });

    blinkTl.play();
  }

  function playLilMeEntrance() {
    if (hasPlayedEntrance || typeof window.gsap === 'undefined') return;
    hasPlayedEntrance = true;

    const svgRoot = document.getElementById('lil-me-svg');
    if (!svgRoot) return;

    const q = (sel) => svgRoot.querySelector(sel);
    const qa = (sel) => svgRoot.querySelectorAll(sel);

    const meTl = gsap.timeline();
    meTl
      .from(q('.me'), { duration: 0.95, yPercent: 100, ease: 'elastic.out(0.55, 0.4)' }, 0.05)
      .from(qa('.head, .hair, .shadow'), { duration: 0.85, yPercent: 20, ease: 'elastic.out(0.58, 0.25)' }, 0.12)
      .from(q('.ear-right'), { duration: 0.9, rotate: 40, yPercent: 10, ease: 'elastic.out(0.5, 0.2)' }, 0.2)
      .from(q('.ear-left'), { duration: 0.9, rotate: -40, yPercent: 10, ease: 'elastic.out(0.5, 0.2)' }, 0.2)
      .to(
        q('.glasses'),
        { duration: 0.9, keyframes: [{ yPercent: -12 }, { yPercent: 0 }], ease: 'elastic.out(0.5, 0.2)' },
        0.25
      )
      .from(qa('.eyebrow-right, .eyebrow-left'), { duration: 0.9, yPercent: 280, ease: 'elastic.out(0.5, 0.2)' }, 0.2);
  }

  function revealLilMeWithMessage(msg) {
    if (!lilMeDock) return;
    if (!lilMeDock.classList.contains('is-peeking')) {
      lilMeDock.classList.add('is-peeking');
      playLilMeEntrance();
    }
    if (msg && lilMeText) {
      lilMeText.textContent = msg;
    }
  }

  initLilMeGSAP();

  // Peek up automatically after a gentle moment or when scrolling / switching tabs
  setTimeout(() => {
    revealLilMeWithMessage('hi! i’m lil’ burak. switch tabs or move your cursor ✨');
  }, 1400);

  window.addEventListener(
    'scroll',
    () => {
      if (window.scrollY > 20) {
        revealLilMeWithMessage();
      }
    },
    { passive: true }
  );

  if (lilMeTrigger) {
    lilMeTrigger.addEventListener('click', () => {
      if (dizzyTl && !dizzyPlaying) {
        dizzyPlaying = true;
        if (lilMeText) lilMeText.textContent = 'adjusting my clear-framed glasses! 👓✨';
        dizzyTl.restart();
      }
    });
  }

  /* ------------------------------------------------------------------------
     8. FLOATING SAKURA PETALS & WARM PARALLAX DUST CANVAS
     ------------------------------------------------------------------------ */
  const canvas = document.getElementById('sakura-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let cw = (canvas.width = window.innerWidth);
    let ch = (canvas.height = window.innerHeight);

    window.addEventListener(
      'resize',
      () => {
        cw = canvas.width = window.innerWidth;
        ch = canvas.height = window.innerHeight;
      },
      { passive: true }
    );

    let mouseOffsetX = 0;
    let mouseOffsetY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    window.addEventListener(
      'mousemove',
      (e) => {
        targetMouseX = (e.clientX / cw - 0.5) * 28;
        targetMouseY = (e.clientY / ch - 0.5) * 20;
      },
      { passive: true }
    );

    const petalColors = ['#FFE3E5', '#F9B4B7', '#F2797B'];
    const petals = Array.from({ length: 26 }, () => ({
      x: Math.random() * cw,
      y: Math.random() * ch,
      rx: 4 + Math.random() * 4.5,
      ry: 2.2 + Math.random() * 2.5,
      vy: 0.35 + Math.random() * 0.55,
      vx: -0.25 + Math.random() * 0.6,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.018,
      swayPhase: Math.random() * Math.PI * 2,
      swaySpeed: 0.012 + Math.random() * 0.015,
      color: petalColors[Math.floor(Math.random() * petalColors.length)],
      alpha: 0.45 + Math.random() * 0.4,
      depth: 0.4 + Math.random() * 0.7
    }));

    const motes = Array.from({ length: 22 }, () => ({
      x: Math.random() * cw,
      y: Math.random() * ch,
      r: 1.1 + Math.random() * 2.1,
      vy: -0.12 - Math.random() * 0.22,
      phase: Math.random() * Math.PI * 2,
      color: Math.random() > 0.4 ? '#DEB892' : '#43E8D8',
      depth: 0.5 + Math.random() * 0.8
    }));

    function renderCanvas() {
      ctx.clearRect(0, 0, cw, ch);

      mouseOffsetX += (targetMouseX - mouseOffsetX) * 0.05;
      mouseOffsetY += (targetMouseY - mouseOffsetY) * 0.05;
      windGustBoost *= 0.96;

      // 1. Warm Parallax Light Motes
      for (const m of motes) {
        m.y += m.vy;
        m.phase += 0.02;
        if (m.y < -10) {
          m.y = ch + 10;
          m.x = Math.random() * cw;
        }

        const drawX = m.x + mouseOffsetX * m.depth;
        const drawY = m.y + mouseOffsetY * m.depth;
        const glowAlpha = 0.22 + Math.sin(m.phase) * 0.16;

        ctx.save();
        ctx.globalAlpha = Math.max(0.05, glowAlpha);
        ctx.fillStyle = m.color;
        ctx.beginPath();
        ctx.arc(drawX, drawY, m.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 2. Drifting Sakura Petals
      for (const p of petals) {
        p.swayPhase += p.swaySpeed;
        p.angle += p.spin;
        p.x += p.vx + Math.sin(p.swayPhase) * 0.45 + windGustBoost * p.depth;
        p.y += p.vy;

        if (p.y > ch + 16) {
          p.y = -14;
          p.x = Math.random() * cw;
        }
        if (p.x > cw + 20) p.x = -16;
        if (p.x < -20) p.x = cw + 16;

        const px = p.x + mouseOffsetX * p.depth;
        const py = p.y + mouseOffsetY * p.depth;

        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(p.angle);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;

        // Soft notched sakura petal shape
        ctx.beginPath();
        ctx.ellipse(0, 0, p.rx, p.ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      requestAnimationFrame(renderCanvas);
    }

    requestAnimationFrame(renderCanvas);
  }
})();
