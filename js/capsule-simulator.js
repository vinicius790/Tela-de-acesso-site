/**
 * capsule-simulator.js
 * Capsule Corporation Training Simulator & Power Level Scouter Specialist Engine
 * Features:
 *   - Web Audio API Pure Synthesizer (Zero external assets needed)
 *   - Saiyan Scouter Radar Scanner with Target Locking & "IT'S OVER 9000!" Overload
 *   - Gravity Chamber Trainer (1G to 500G) with Weight Multiplier & Stamina/BP Growth
 *   - Hoi-Poi Capsule Inventory with Dynamic Particle Explosions & Interactive Actions
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. WEB AUDIO API SYNTHESIZER
     ========================================================================== */
  class CapsuleAudioEngine {
    constructor() {
      this.ctx = null;
      this.isMuted = false;
      this.gravityOsc = null;
      this.gravityGain = null;
      this.gravityFilter = null;
      this.initContext();
    }

    initContext() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
    }

    resume() {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggleMute() {
      this.isMuted = !this.isMuted;
      if (this.isMuted && this.gravityGain) {
        this.gravityGain.gain.setValueAtTime(0, this.ctx.currentTime);
      }
      return this.isMuted;
    }

    // Scouter telemetry chirp
    playScouterChirp(freq = 1200) {
      if (this.isMuted || !this.ctx) return;
      this.resume();
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.05);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.05);
      } catch (e) {
        console.warn('Audio play error:', e);
      }
    }

    // Target locked chord tone
    playTargetLock() {
      if (this.isMuted || !this.ctx) return;
      this.resume();
      try {
        const freqs = [880, 1320];
        const now = this.ctx.currentTime;
        freqs.forEach((f) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, now);

          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.35);
        });
      } catch (e) {}
    }

    // Over 9000 Warning Klaxon
    playWarningKlaxon() {
      if (this.isMuted || !this.ctx) return;
      this.resume();
      try {
        const now = this.ctx.currentTime;
        for (let i = 0; i < 3; i++) {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const start = now + i * 0.18;

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(520, start);
          osc.frequency.setValueAtTime(780, start + 0.09);

          gain.gain.setValueAtTime(0.15, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.17);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(start);
          osc.stop(start + 0.17);
        }
      } catch (e) {}
    }

    // Scouter Glass Shatter & Meltdown Explosion Sound
    playExplosionShatter() {
      if (this.isMuted || !this.ctx) return;
      this.resume();
      try {
        const now = this.ctx.currentTime;

        // White noise burst for shattering glass
        const bufferSize = this.ctx.sampleRate * 0.5;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.setValueAtTime(1400, now);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.3, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);
        noise.start(now);
        noise.stop(now + 0.45);

        // Sub bass blast
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.4);

        oscGain.gain.setValueAtTime(0.35, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(oscGain);
        oscGain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
      } catch (e) {}
    }

    // Ki Aura & Super Saiyan Transformation Surge
    playKiSurge(freq = 440) {
      if (this.isMuted || !this.ctx) return;
      this.resume();
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq * 0.5, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 2.2, now + 0.35);
        osc.frequency.exponentialRampToValueAtTime(freq, now + 0.6);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, now);
        filter.frequency.exponentialRampToValueAtTime(3200, now + 0.3);
        filter.frequency.exponentialRampToValueAtTime(800, now + 0.6);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.65);
      } catch (e) {}
    }

    // Sedov-Taylor Shockwave Boom
    playShockwave() {
      if (this.isMuted || !this.ctx) return;
      this.resume();
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(25, now + 0.5);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.5);
      } catch (e) {}
    }

    // Scouter Reboot Ascending Glide
    playRebootSweep() {
      if (this.isMuted || !this.ctx) return;
      this.resume();
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(1800, now + 0.45);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.45);
      } catch (e) {}
    }

    // Continuous Gravity Chamber Hum Drone
    updateGravityHum(gLevel, isActive) {
      if (!this.ctx) return;
      this.resume();

      if (!isActive || this.isMuted) {
        if (this.gravityGain) {
          this.gravityGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
        }
        return;
      }

      if (!this.gravityOsc) {
        this.gravityOsc = this.ctx.createOscillator();
        this.gravityGain = this.ctx.createGain();
        this.gravityFilter = this.ctx.createBiquadFilter();

        this.gravityOsc.type = 'triangle';
        this.gravityFilter.type = 'lowpass';

        this.gravityOsc.connect(this.gravityFilter);
        this.gravityFilter.connect(this.gravityGain);
        this.gravityGain.connect(this.ctx.destination);

        this.gravityGain.gain.setValueAtTime(0, this.ctx.currentTime);
        this.gravityOsc.start();
      }

      const now = this.ctx.currentTime;
      // Frequency scales from 45Hz (1G) to 110Hz (500G)
      const baseFreq = 45 + (gLevel / 500) * 65;
      const filterFreq = 120 + (gLevel / 500) * 350;
      const targetGain = 0.08 + (gLevel / 500) * 0.14;

      this.gravityOsc.frequency.setTargetAtTime(baseFreq, now, 0.1);
      this.gravityFilter.frequency.setTargetAtTime(filterFreq, now, 0.1);
      this.gravityGain.gain.setTargetAtTime(targetGain, now, 0.1);
    }

    // Hoi-Poi Capsule Pop & Smoke Poof
    playCapsulePoof() {
      if (this.isMuted || !this.ctx) return;
      this.resume();
      try {
        const now = this.ctx.currentTime;

        // Bandpass noise puff
        const bufferSize = this.ctx.sampleRate * 0.25;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(600, now);
        filter.Q.setValueAtTime(2.0, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start(now);
        noise.stop(now + 0.25);

        // Click snap
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(700, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);

        oscGain.gain.setValueAtTime(0.2, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(oscGain);
        oscGain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      } catch (e) {}
    }

    // Senzu Bean Celestial Chime
    playSenzuChime() {
      if (this.isMuted || !this.ctx) return;
      this.resume();
      try {
        const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51]; // C5, E5, G5, C6, E6
        const now = this.ctx.currentTime;

        notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const time = now + idx * 0.08;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, time);

          gain.gain.setValueAtTime(0.15, time);
          gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.6);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(time);
          osc.stop(time + 0.6);
        });
      } catch (e) {}
    }

    // Droid Sparring Punch Impact
    playPunchSound() {
      if (this.isMuted || !this.ctx) return;
      this.resume();
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      } catch (e) {}
    }

    // Aero-Car Turbo Thruster Roar
    playThrusterSound() {
      if (this.isMuted || !this.ctx) return;
      this.resume();
      try {
        const now = this.ctx.currentTime;
        const bufferSize = this.ctx.sampleRate * 0.8;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(320, now);
        filter.frequency.linearRampToValueAtTime(800, now + 0.5);
        filter.Q.setValueAtTime(3.0, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start(now);
        noise.stop(now + 0.8);
      } catch (e) {}
    }
  }

  /* ==========================================================================
     1.5 HIGH-PRECISION NUMERICAL PHYSICS ENGINE
     ========================================================================== */
  class HighPrecisionPhysicsEngine {
    /**
     * Velocity Verlet Numerical Integrator for particle kinematics with aerodynamic Rayleigh drag
     * x(t+dt) = x(t) + v(t)*dt + 0.5*a(t)*dt^2
     * v(t+dt) = (v(t) + 0.5*(a(t) + a(t+dt))*dt) * damping
     */
    static integrateVerlet(particle, ax = 0, ay = 0, dt = 0.016, damping = 0.96) {
      if (!particle) return particle;
      const step = dt * 60;
      particle.x += particle.vx * step + 0.5 * ax * step * step;
      particle.y += particle.vy * step + 0.5 * ay * step * step;
      particle.vx = (particle.vx + ax * step) * damping;
      particle.vy = (particle.vy + ay * step) * damping;
      return particle;
    }

    /**
     * 4th-Order Runge-Kutta (RK4) Differential Solver for Continuous Metabolic Stamina Decay
     * dS/dt = - [ 0.20 + 0.0075 * (G)^1.25 ] * FormMultiplier * (0.35 + 0.65 * S/100)
     */
    static integrateStaminaRK4(currentStamina, gForce, formDrainMult = 1.0, dt = 0.5) {
      if (currentStamina <= 0) return 0;

      const f = (s) => {
        const clampedS = Math.max(0, Math.min(100, s));
        const baseStrain = 0.20 + Math.pow(Math.max(1, gForce) / 45, 1.25);
        const fatigueScaling = 0.35 + 0.65 * (clampedS / 100);
        return -baseStrain * formDrainMult * fatigueScaling;
      };

      const k1 = f(currentStamina);
      const k2 = f(currentStamina + 0.5 * dt * k1);
      const k3 = f(currentStamina + 0.5 * dt * k2);
      const k4 = f(currentStamina + dt * k3);

      const dS = (dt / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
      return Math.max(0, Math.min(100, currentStamina + dS));
    }

    /**
     * Sedov-Taylor Self-Similar Shockwave Blast Radius: R(t) = xi * (E * t^2 / rho)^(1/5)
     */
    static calculateSedovTaylorRadius(energy = 1000, density = 1.225, time = 0.1, xi = 1.033) {
      const t = Math.max(0.001, time);
      return xi * Math.pow((energy * t * t) / density, 0.2);
    }
  }

  /* ==========================================================================
     1.6 SAIYAN TRANSFORMATION MULTIPLIER ENGINE
     ========================================================================== */
  class SaiyanTransformationEngine {
    constructor(audio, particles, gravityChamber) {
      this.audio = audio;
      this.particles = particles;
      this.gravity = gravityChamber;

      this.FORMS = {
        base: {
          id: 'base',
          name: 'Base Form',
          japanese: '通常',
          multiplier: 1,
          drainMult: 1.0,
          color: '#00f0ff',
          auraKey: 'aura-base',
          colors: ['#00f0ff', '#ffffff', '#38bdf8']
        },
        kaioken: {
          id: 'kaioken',
          name: 'Kaiō-ken x20',
          japanese: '界王拳',
          multiplier: 20,
          drainMult: 2.5,
          color: '#ff1744',
          auraKey: 'aura-kaioken',
          colors: ['#ff1744', '#ff5252', '#d50000', '#ffffff']
        },
        ssj1: {
          id: 'ssj1',
          name: 'Super Saiyajin',
          japanese: '超サイヤ人',
          multiplier: 50,
          drainMult: 1.8,
          color: '#ffd700',
          auraKey: 'aura-ssj1',
          colors: ['#ffd700', '#ffea00', '#ffffff', '#f59e0b']
        },
        ssj2: {
          id: 'ssj2',
          name: 'Super Saiyajin 2',
          japanese: '超サイヤ人2',
          multiplier: 100,
          drainMult: 2.2,
          color: '#ffe600',
          auraKey: 'aura-ssj2',
          colors: ['#ffe600', '#00f0ff', '#ffffff', '#fbbf24']
        },
        ssj3: {
          id: 'ssj3',
          name: 'Super Saiyajin 3',
          japanese: '超サイヤ人3',
          multiplier: 400,
          drainMult: 3.8,
          color: '#ff9100',
          auraKey: 'aura-ssj3',
          colors: ['#ff9100', '#ffab00', '#ffd700', '#ffffff']
        },
        ssj_god: {
          id: 'ssj_god',
          name: 'Super Saiyajin Deus',
          japanese: '超サイヤ人ゴッド',
          multiplier: 20000,
          drainMult: 2.6,
          color: '#ff2d55',
          auraKey: 'aura-god',
          colors: ['#ff2d55', '#ff007f', '#ff8da1', '#ffffff']
        },
        ssj_blue: {
          id: 'ssj_blue',
          name: 'Super Saiyajin Blue',
          japanese: '超サイヤ人ブルー',
          multiplier: 50000,
          drainMult: 3.2,
          color: '#00d2ff',
          auraKey: 'aura-blue',
          colors: ['#00d2ff', '#0099ff', '#ffffff', '#7000ff']
        },
        ultra_instinct: {
          id: 'ultra_instinct',
          name: 'Instinto Superior (Migatte no Gokui)',
          japanese: '身勝手の極意',
          multiplier: 500000,
          drainMult: 4.8,
          color: '#e0e7ff',
          auraKey: 'aura-ui',
          colors: ['#e0e7ff', '#818cf8', '#c7d2fe', '#ffffff', '#a5b4fc']
        }
      };

      this.currentForm = this.FORMS.base;
    }

    transformTo(formKey) {
      const form = this.FORMS[formKey];
      if (!form) return false;
      this.currentForm = form;

      if (this.audio) {
        this.audio.playKiSurge(form.multiplier > 1000 ? 600 : 440);
        this.audio.playShockwave();
      }

      const flash = document.getElementById('kiBurstFlash');
      if (flash) {
        flash.classList.remove('ignite');
        void flash.offsetWidth;
        flash.classList.add('ignite');
      }

      if (this.particles) {
        const cx = typeof window !== 'undefined' ? window.innerWidth / 2 : 400;
        const cy = typeof window !== 'undefined' ? window.innerHeight / 2 : 300;
        this.particles.spawnShockwave(cx, cy, 380, form.color, 12, 4);
        this.particles.spawnBurst(cx, cy, 70, form.colors);
      }

      if (typeof document !== 'undefined') {
        document.querySelectorAll('.transformation-chip').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.form === formKey);
        });

        const badge = document.getElementById('currentFormBadge');
        if (badge) {
          badge.textContent = `${form.name} (x${form.multiplier.toLocaleString()})`;
          badge.style.borderColor = form.color;
          badge.style.color = form.color;
          badge.style.boxShadow = `0 0 14px ${form.color}66`;
        }
      }

      if (this.gravity) {
        this.gravity.updateTelemetry();
      }

      return true;
    }
  }

  /* ==========================================================================
     2. PARTICLE BURST CANVAS SYSTEM (Capsule Poof, Shockwaves & Ki Bursts)
     ========================================================================== */
  class ParticleSystem {
    constructor(canvasId) {
      this.canvas = typeof document !== 'undefined' ? document.getElementById(canvasId) : null;
      this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
      this.particles = [];
      this.shockwaves = [];
      this.animId = null;

      if (this.canvas && typeof window !== 'undefined') {
        this.resize();
        window.addEventListener('resize', () => this.resize());
      }
    }

    resize() {
      if (!this.canvas || typeof window === 'undefined') return;
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    spawnShockwave(x, y, maxRadius = 320, color = '#00f0ff', speed = 10, lineWidth = 3) {
      const cx = x || (this.canvas ? this.canvas.width / 2 : 200);
      const cy = y || (this.canvas ? this.canvas.height / 2 : 200);
      this.shockwaves.push({
        x: cx,
        y: cy,
        radius: 4,
        maxRadius: maxRadius,
        color: color,
        speed: speed,
        lineWidth: lineWidth,
        alpha: 1.0
      });
      if (!this.animId) this.loop();
    }

    spawnBurst(x, y, count = 45, colors = ['#00f0ff', '#ffd700', '#ffffff', '#9333ea']) {
      if (!this.ctx) return;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 2;
        const color = colors[Math.floor(Math.random() * colors.length)];
        this.particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 6 + 3,
          color: color,
          alpha: 1,
          decay: Math.random() * 0.025 + 0.015,
        });
      }

      if (!this.animId) {
        this.loop();
      }
    }

    loop() {
      if (!this.ctx) return;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Render Sedov-Taylor shockwaves
      for (let s = this.shockwaves.length - 1; s >= 0; s--) {
        const sw = this.shockwaves[s];
        sw.radius += sw.speed;
        sw.alpha = Math.max(0, 1 - (sw.radius / sw.maxRadius));

        if (sw.radius >= sw.maxRadius || sw.alpha <= 0) {
          this.shockwaves.splice(s, 1);
          continue;
        }

        this.ctx.save();
        this.ctx.globalAlpha = sw.alpha;
        this.ctx.strokeStyle = sw.color;
        this.ctx.lineWidth = sw.lineWidth;
        this.ctx.shadowBlur = 14;
        this.ctx.shadowColor = sw.color;
        this.ctx.beginPath();
        this.ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.restore();
      }

      // Render particles with Velocity Verlet integrator
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        HighPrecisionPhysicsEngine.integrateVerlet(p, 0, 0.015, 0.016, 0.96);
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          this.particles.splice(i, 1);
          continue;
        }

        this.ctx.save();
        this.ctx.globalAlpha = p.alpha;
        this.ctx.fillStyle = p.color;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = p.color;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }

      if (this.particles.length > 0 || this.shockwaves.length > 0) {
        this.animId = requestAnimationFrame(() => this.loop());
      } else {
        this.animId = null;
      }
    }
  }

  /* ==========================================================================
     3. RADAR & SCOUTER SYSTEM
     ========================================================================== */
  class SaiyanScouter {
    constructor(audio, particles) {
      this.audio = audio;
      this.particles = particles;
      this.canvas = document.getElementById('scouterRadarCanvas');
      this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
      this.angle = 0;
      this.blips = [
        { angle: 0.6, dist: 0.45, power: 1500, name: 'Raditz' },
        { angle: 1.8, dist: 0.65, power: 4000, name: 'Nappa' },
        { angle: 3.2, dist: 0.35, power: 8000, name: 'Goku (Base)' },
        { angle: 4.5, dist: 0.8, power: 18000, name: 'Vegeta (Saiyan Saga)' },
        { angle: 5.6, dist: 0.55, power: 60000, name: 'Goku (Kaioken x20)' }
      ];
      this.currentTarget = this.blips[2]; // Default: Goku Base
      this.isScanning = false;
      this.isOverheated = false;

      // DOM Elements
      this.bpValueEl = document.getElementById('scouterBpValue');
      this.bpTierEl = document.getElementById('scouterBpTier');
      this.bpLabelEl = document.getElementById('scouterBpLabel');
      this.viewportEl = document.getElementById('scouterViewport');
      this.crackedOverlayEl = document.getElementById('scouterCrackedOverlay');
      this.over9000BannerEl = document.getElementById('over9000Banner');
      this.btnScan = document.getElementById('btnScanTarget');
      this.btnReboot = document.getElementById('btnRebootScouter');
      this.reticleEl = document.getElementById('targetReticle');

      this.init();
    }

    init() {
      if (!this.canvas) return;
      this.resizeCanvas();
      this.renderLoop();

      // Scan target button
      if (this.btnScan) {
        this.btnScan.addEventListener('click', () => this.initiateScan());
      }

      // Reboot button
      if (this.btnReboot) {
        this.btnReboot.addEventListener('click', () => this.rebootScouter());
      }

      // Target selection chips
      const chips = document.querySelectorAll('.target-chip');
      chips.forEach((chip) => {
        chip.addEventListener('click', (e) => {
          if (this.isScanning || this.isOverheated) return;
          chips.forEach((c) => c.classList.remove('active'));
          chip.classList.add('active');

          const bp = parseInt(chip.dataset.bp, 10);
          const name = chip.dataset.name;
          this.currentTarget = {
            name: name,
            power: bp,
            angle: Math.random() * Math.PI * 2,
            dist: Math.random() * 0.6 + 0.2
          };

          this.initiateScan();
        });
      });
    }

    resizeCanvas() {
      if (!this.canvas) return;
      this.canvas.width = 260;
      this.canvas.height = 260;
    }

    renderLoop() {
      if (!this.ctx) return;
      const w = this.canvas.width;
      const h = this.canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const r = w / 2 - 10;

      this.ctx.clearRect(0, 0, w, h);

      // Radar Background & Concentric Rings
      this.ctx.fillStyle = 'rgba(0, 20, 10, 0.4)';
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.strokeStyle = this.isOverheated ? 'rgba(255, 0, 85, 0.3)' : 'rgba(0, 255, 119, 0.3)';
      this.ctx.lineWidth = 1;

      // Concentric Distance Circles
      [0.25, 0.5, 0.75, 1.0].forEach((ratio) => {
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, r * ratio, 0, Math.PI * 2);
        this.ctx.stroke();
      });

      // Crosshairs
      this.ctx.beginPath();
      this.ctx.moveTo(cx, cy - r);
      this.ctx.lineTo(cx, cy + r);
      this.ctx.moveTo(cx - r, cy);
      this.ctx.lineTo(cx + r, cy);
      this.ctx.stroke();

      // Blip rendering
      this.blips.forEach((blip) => {
        const bx = cx + Math.cos(blip.angle) * (r * blip.dist);
        const by = cy + Math.sin(blip.angle) * (r * blip.dist);
        const diff = Math.abs(this.angle - blip.angle);

        this.ctx.save();
        this.ctx.fillStyle = blip.power > 9000 ? '#ff0055' : '#00ff88';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = blip.power > 9000 ? '#ff0055' : '#00ff88';
        this.ctx.beginPath();
        this.ctx.arc(bx, by, diff < 0.2 ? 5 : 3, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      });

      // Rotating Radar Sweeper Line & Phosphor Glow
      if (!this.isOverheated) {
        this.angle = (this.angle + (this.isScanning ? 0.08 : 0.03)) % (Math.PI * 2);

        this.ctx.save();
        this.ctx.translate(cx, cy);
        this.ctx.rotate(this.angle);

        const sweepGrad = this.ctx.createLinearGradient(0, 0, r, 0);
        sweepGrad.addColorStop(0, 'rgba(0, 255, 119, 0)');
        sweepGrad.addColorStop(1, 'rgba(0, 255, 119, 0.9)');

        this.ctx.strokeStyle = sweepGrad;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(r, 0);
        this.ctx.stroke();
        this.ctx.restore();
      }

      requestAnimationFrame(() => this.renderLoop());
    }

    initiateScan() {
      if (this.isScanning || this.isOverheated) return;
      this.isScanning = true;
      if (this.reticleEl) this.reticleEl.classList.remove('locked');

      let counter = 0;
      const targetBP = this.currentTarget ? this.currentTarget.power : 8000;
      const targetName = this.currentTarget ? this.currentTarget.name : 'Target';

      if (this.bpLabelEl) {
        this.bpLabelEl.textContent = `ANALYZING KI SPECTRUM: ${targetName.toUpperCase()}...`;
      }

      const scanInterval = setInterval(() => {
        counter++;
        const randomNum = Math.floor(Math.random() * 99999);
        if (this.bpValueEl) this.bpValueEl.textContent = randomNum.toLocaleString();

        // High-tech telemetry chirp
        this.audio.playScouterChirp(700 + counter * 60);

        if (counter >= 16) {
          clearInterval(scanInterval);
          this.lockTarget(targetBP, targetName);
        }
      }, 70);
    }

    lockTarget(bp, name) {
      this.isScanning = false;
      this.audio.playTargetLock();

      if (this.bpValueEl) {
        this.bpValueEl.textContent = bp.toLocaleString();
      }

      if (this.reticleEl) {
        this.reticleEl.classList.add('locked');
      }

      if (this.bpLabelEl) {
        this.bpLabelEl.textContent = `TARGET LOCKED: [ ${name.toUpperCase()} ]`;
      }

      // Determine Battle Power Tier
      let tier = 'CIVILIAN / LOW TIER';
      if (bp >= 1000 && bp < 5000) tier = 'LOW-CLASS SAIYAN / SCOUT';
      else if (bp >= 5000 && bp <= 9000) tier = 'ELITE SAIYAN WARRIOR';
      else if (bp > 9000 && bp < 100000) tier = 'OVER 9,000! SUPER WARRIOR';
      else if (bp >= 100000 && bp < 10000000) tier = 'GALACTIC TYRANT / LEGENDARY';
      else if (bp >= 10000000) tier = 'GOD OF DESTRUCTION CLASS';

      if (this.bpTierEl) {
        this.bpTierEl.textContent = `TIER: ${tier}`;
      }

      // Check if Power Exceeds 9,000!
      if (bp > 9000) {
        setTimeout(() => this.triggerOver9000Explosion(), 450);
      }
    }

    triggerOver9000Explosion() {
      this.isOverheated = true;

      // Audio Explosion & Alarm
      this.audio.playWarningKlaxon();
      setTimeout(() => {
        this.audio.playExplosionShatter();
      }, 350);

      // Visual Glitch & Broken Lens
      if (this.viewportEl) {
        this.viewportEl.classList.add('overheat-danger');
      }
      if (this.crackedOverlayEl) {
        this.crackedOverlayEl.classList.add('active');
      }
      if (this.over9000BannerEl) {
        this.over9000BannerEl.classList.add('show');
      }
      if (this.bpValueEl) {
        this.bpValueEl.style.color = '#ff0055';
        this.bpValueEl.style.textShadow = '0 0 20px #ff0055';
        this.bpValueEl.textContent = 'OVER 9000!';
      }
      if (this.bpLabelEl) {
        this.bpLabelEl.textContent = 'CRITICAL OVERHEAT: SENSOR SCLERA FRACTURE!';
      }

      // Particle explosion sparks from viewport
      if (this.particles && this.viewportEl) {
        const rect = this.viewportEl.getBoundingClientRect();
        this.particles.spawnBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 60, [
          '#ff0055',
          '#ff3300',
          '#ffffff',
          '#ffd700'
        ]);
      }
    }

    rebootScouter() {
      this.audio.playRebootSweep();
      this.isOverheated = false;

      if (this.viewportEl) {
        this.viewportEl.classList.remove('overheat-danger');
      }
      if (this.crackedOverlayEl) {
        this.crackedOverlayEl.classList.remove('active');
      }
      if (this.over9000BannerEl) {
        this.over9000BannerEl.classList.remove('show');
      }
      if (this.reticleEl) {
        this.reticleEl.classList.remove('locked');
      }

      if (this.bpValueEl) {
        this.bpValueEl.style.color = '#39ff14';
        this.bpValueEl.style.textShadow = '0 0 18px #39ff14';
        this.bpValueEl.textContent = '8,000';
      }
      if (this.bpLabelEl) {
        this.bpLabelEl.textContent = 'SCOUTER REBOOTED: STANDBY RADAR SCAN';
      }
      if (this.bpTierEl) {
        this.bpTierEl.textContent = 'TIER: SYSTEM CALIBRATED';
      }
    }
  }

  /* ==========================================================================
     4. GRAVITY CHAMBER TRAINER (1G to 500G)
     ========================================================================== */
  class GravityChamber {
    constructor(audio, scouter) {
      this.audio = audio;
      this.scouter = scouter;
      this.gForce = 1;
      this.baseWeight = 75; // kg
      this.stamina = 100;
      this.userBattlePower = 8000;
      this.sessionGainedBP = 0;
      this.isTraining = false;
      this.trainTimer = null;

      // DOM Elements
      this.slider = document.getElementById('gravitySlider');
      this.gValDisplay = document.getElementById('gravityValueText');
      this.effWeightDisplay = document.getElementById('effectiveWeightText');
      this.humanEquivDisplay = document.getElementById('humanEquivText');
      this.userBpDisplay = document.getElementById('userBattlePowerText');
      this.gainedBpDisplay = document.getElementById('gainedBpText');
      this.staminaBarFill = document.getElementById('staminaBarFill');
      this.staminaPercent = document.getElementById('staminaPercentText');
      this.btnToggle = document.getElementById('btnToggleGravity');
      this.chamberBox = document.getElementById('gravityChamberBox');

      this.init();
    }

    init() {
      if (!this.slider) return;

      this.slider.addEventListener('input', (e) => {
        this.setGForce(parseInt(e.target.value, 10));
      });

      // Quick G Preset buttons
      const presetBtns = document.querySelectorAll('.g-preset-btn');
      presetBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          const val = parseInt(btn.dataset.g, 10);
          this.slider.value = val;
          this.setGForce(val);
        });
      });

      // Toggle Training Button
      if (this.btnToggle) {
        this.btnToggle.addEventListener('click', () => {
          if (this.isTraining) {
            this.stopTraining();
          } else {
            this.startTraining();
          }
        });
      }

      this.updateTelemetry();
    }

    setGForce(g) {
      this.gForce = g;
      this.updateTelemetry();
      if (this.isTraining) {
        this.audio.updateGravityHum(this.gForce, true);
      }
    }

    updateTelemetry() {
      const effWeight = this.baseWeight * this.gForce;
      let weightStr = `${effWeight.toLocaleString()} kg`;
      if (effWeight >= 1000) {
        weightStr = `${(effWeight / 1000).toFixed(2)} Toneladas`;
      }

      if (this.gValDisplay) this.gValDisplay.textContent = `${this.gForce}G`;
      if (this.effWeightDisplay) this.effWeightDisplay.textContent = weightStr;

      // Effective battle power taking transformation multiplier into account
      const mult = this.transformationEngine ? this.transformationEngine.currentForm.multiplier : 1;
      const effectiveBP = (this.userBattlePower + this.sessionGainedBP) * mult;
      if (this.userBpDisplay) this.userBpDisplay.textContent = effectiveBP.toLocaleString();
      if (this.gainedBpDisplay) this.gainedBpDisplay.textContent = `+${(this.sessionGainedBP * mult).toLocaleString()}`;

      // Human strain equivalent
      let equiv = 'Normal (Gravidade Terrestre)';
      if (this.gForce >= 10 && this.gForce < 50) equiv = 'Planeta Kaioh (Carro Compacto)';
      else if (this.gForce >= 50 && this.gForce < 100) equiv = 'Nave Capsule Corp (Caminhão)';
      else if (this.gForce >= 100 && this.gForce < 300) equiv = 'Super Saiyajin (Elefante Africano)';
      else if (this.gForce >= 300 && this.gForce < 500) equiv = 'Câmara Dr. Briefs (Escavadeira)';
      else if (this.gForce >= 500) equiv = 'Limite Divino (Boeing 737)';

      if (this.humanEquivDisplay) this.humanEquivDisplay.textContent = equiv;
    }

    startTraining() {
      if (this.stamina <= 5) {
        if (window.Swal) {
          Swal.fire({
            title: 'ESTAFA CRÍTICA!',
            text: 'Seu corpo não suportará a pressão gravitacional! Consuma uma Semente dos Deuses no inventário!',
            icon: 'warning',
            confirmButtonText: 'Entendido'
          });
        }
        return;
      }

      this.isTraining = true;
      if (this.chamberBox) this.chamberBox.classList.add('training-active');
      if (this.btnToggle) {
        this.btnToggle.textContent = 'DISSIPAR GRAVIDADE (PARAR)';
        this.btnToggle.classList.remove('btn-primary');
        this.btnToggle.classList.add('btn-danger');
      }

      this.audio.updateGravityHum(this.gForce, true);

      this.trainTimer = setInterval(() => {
        this.tickTraining();
      }, 500); // Ticks every 0.5s
    }

    stopTraining() {
      this.isTraining = false;
      if (this.trainTimer) {
        clearInterval(this.trainTimer);
        this.trainTimer = null;
      }

      if (this.chamberBox) this.chamberBox.classList.remove('training-active');
      if (this.btnToggle) {
        this.btnToggle.textContent = 'INICIAR TREINO GRAVITACIONAL';
        this.btnToggle.classList.remove('btn-danger');
        this.btnToggle.classList.add('btn-primary');
      }

      this.audio.updateGravityHum(this.gForce, false);
    }

    tickTraining() {
      if (!this.isTraining) return;

      // Numerical differential RK4 solver for metabolic stamina decay
      const formDrainMult = this.transformationEngine ? this.transformationEngine.currentForm.drainMult : 1.0;
      this.stamina = HighPrecisionPhysicsEngine.integrateStaminaRK4(this.stamina, this.gForce, formDrainMult, 0.5);

      // BP growth formula: scales exponentially with G-force and stamina level
      const growthPerSec = Math.round(Math.pow(this.gForce, 1.2) * 1.5 * (this.stamina / 100));
      const growthTick = Math.max(1, Math.round(growthPerSec * 0.5));
      this.sessionGainedBP += growthTick;

      this.updateStaminaUI();
      this.updateTelemetry();

      // Check for Exhaustion Collapse
      if (this.stamina <= 0) {
        this.triggerCollapse();
      }
    }

    updateStaminaUI() {
      const pct = Math.round(this.stamina);
      if (this.staminaPercent) this.staminaPercent.textContent = `${pct}%`;
      if (this.staminaBarFill) {
        this.staminaBarFill.style.width = `${pct}%`;
        this.staminaBarFill.classList.remove('warning', 'critical');
        if (pct < 25) {
          this.staminaBarFill.classList.add('critical');
        } else if (pct < 60) {
          this.staminaBarFill.classList.add('warning');
        }
      }
    }

    triggerCollapse() {
      this.stopTraining();
      const zenkaiBonus = 1500;
      this.userBattlePower += zenkaiBonus;
      this.sessionGainedBP += zenkaiBonus;
      if (this.userBpDisplay) this.userBpDisplay.textContent = this.userBattlePower.toLocaleString();

      if (window.Swal) {
        Swal.fire({
          title: 'COLAPSO POR EXAUSTÃO!',
          html: `<p>A pressão de <b>${this.gForce}G</b> levou seu corpo ao limite absoluto.</p>
                 <p style="color: #ffd700; font-weight: bold;">⚡ ZENKAI BOOST ATIVADO: +${zenkaiBonus} BP adicionado!</p>
                 <p>Dica: Use a <b>Cápsula #7 (Sementes dos Deuses)</b> para restauração instantânea!</p>`,
          icon: 'error',
          confirmButtonText: 'Recuperar-se'
        });
      }
    }

    restoreStaminaFull() {
      this.stamina = 100;
      this.updateStaminaUI();
    }
  }

  /* ==========================================================================
     5. HOI-POI CAPSULE INVENTORY
     ========================================================================== */
  class CapsuleInventory {
    constructor(audio, particles, gravity) {
      this.audio = audio;
      this.particles = particles;
      this.gravity = gravity;
      this.senzuStock = 3;
      this.comboCount = 0;
      this.init();
    }

    init() {
      const cards = document.querySelectorAll('.hoi-poi-capsule-card');
      cards.forEach((card) => {
        const type = card.dataset.type;

        // Click on capsule cylinder to unpack
        const cylinder = card.querySelector('.capsule-cylinder-graphic');
        if (cylinder) {
          cylinder.addEventListener('click', (e) => {
            e.stopPropagation();
            this.unpackCapsule(card, type);
          });
        }

        const btnUnpack = card.querySelector('.btn-unpack');
        if (btnUnpack) {
          btnUnpack.addEventListener('click', (e) => {
            e.stopPropagation();
            this.unpackCapsule(card, type);
          });
        }

        // Pack (Recall) button
        const btnPack = card.querySelector('.btn-pack');
        if (btnPack) {
          btnPack.addEventListener('click', (e) => {
            e.stopPropagation();
            this.packCapsule(card);
          });
        }

        // Specific Item Interactions
        const btnInteract = card.querySelector('.btn-interact');
        if (btnInteract) {
          btnInteract.addEventListener('click', (e) => {
            e.stopPropagation();
            this.interactItem(card, type);
          });
        }
      });
    }

    unpackCapsule(card, type) {
      const rect = card.getBoundingClientRect();
      const burstX = rect.left + rect.width / 2;
      const burstY = rect.top + rect.height / 3;

      // Web Audio Capsule "POOF!"
      this.audio.playCapsulePoof();

      // Particle explosion
      let colors = ['#00f0ff', '#ffffff', '#ffd700'];
      if (type === 'senzu') colors = ['#00ff88', '#ffffff', '#22c55e', '#ffd700'];
      if (type === 'droid') colors = ['#a855f7', '#ff0055', '#ffffff'];
      if (type === 'house') colors = ['#ffd700', '#f59e0b', '#ffffff'];

      this.particles.spawnBurst(burstX, burstY, 55, colors);

      card.classList.add('unpacked');
    }

    packCapsule(card) {
      this.audio.playCapsulePoof();
      card.classList.remove('unpacked');
    }

    interactItem(card, type) {
      if (type === 'vehicle') {
        // Aero-Car Turbo Thrusters
        this.audio.playThrusterSound();
        const rect = card.getBoundingClientRect();
        this.particles.spawnBurst(rect.left + rect.width / 2, rect.bottom - 40, 30, ['#00f0ff', '#ff3300', '#ffd700']);
        const statusEl = card.querySelector('.item-status-text');
        if (statusEl) {
          statusEl.textContent = 'PROPULSORES EM VELOCIDADE MÁXIMA (MACH 3.2)';
          setTimeout(() => {
            statusEl.textContent = 'Propulsores em espera.';
          }, 2500);
        }
      } else if (type === 'house') {
        // Luxury Dome House - Rest Zone
        this.audio.playSenzuChime();
        this.gravity.stamina = Math.min(100, this.gravity.stamina + 25);
        this.gravity.updateStaminaUI();
        const statusEl = card.querySelector('.item-status-text');
        if (statusEl) {
          statusEl.textContent = 'Descansando no Domo Dr. Briefs (+25% Estamina)';
          setTimeout(() => {
            statusEl.textContent = 'Domo pronto para descanso.';
          }, 2500);
        }
      } else if (type === 'droid') {
        // Combat Sparring Droid Mk-IV
        this.comboCount++;
        this.audio.playPunchSound();
        this.gravity.userBattlePower += 250;
        this.gravity.sessionGainedBP += 250;
        if (this.gravity.userBpDisplay) {
          this.gravity.userBpDisplay.textContent = this.gravity.userBattlePower.toLocaleString();
        }

        const rect = card.getBoundingClientRect();
        this.particles.spawnBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 20, ['#ff0055', '#ffd700']);

        const statusEl = card.querySelector('.item-status-text');
        if (statusEl) {
          statusEl.textContent = `GOLPE PESADO! COMBO x${this.comboCount} (+250 BP)`;
        }
      } else if (type === 'senzu') {
        // Senzu Bean Consumption
        if (this.senzuStock > 0) {
          this.senzuStock--;
          this.audio.playSenzuChime();

          // Golden Super Saiyan Ki Flash
          const flash = document.getElementById('kiBurstFlash');
          if (flash) {
            flash.classList.remove('ignite');
            void flash.offsetWidth; // trigger reflow
            flash.classList.add('ignite');
          }

          // Full stamina restore & Ki surge
          this.gravity.restoreStaminaFull();
          this.gravity.userBattlePower += 500;
          if (this.gravity.userBpDisplay) {
            this.gravity.userBpDisplay.textContent = this.gravity.userBattlePower.toLocaleString();
          }

          const stockEl = card.querySelector('.senzu-stock-count');
          if (stockEl) stockEl.textContent = this.senzuStock;

          const statusEl = card.querySelector('.item-status-text');
          if (statusEl) {
            statusEl.textContent = '100% ESTAMINA RESTAURADA! PODER RESTABELECIDO!';
          }
        } else {
          // Replenish jar
          this.senzuStock = 3;
          this.audio.playSenzuChime();
          const stockEl = card.querySelector('.senzu-stock-count');
          if (stockEl) stockEl.textContent = this.senzuStock;
          const statusEl = card.querySelector('.item-status-text');
          if (statusEl) {
            statusEl.textContent = 'Mestre Karin recarregou as sementes (+3 Sementes)';
          }
        }
      }
    }
  }

  /* ==========================================================================
     6. MAIN APPLICATION INITIALIZATION
     ========================================================================== */
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
      const audio = new CapsuleAudioEngine();
      const particles = new ParticleSystem('capsuleParticleCanvas');
      const scouter = new SaiyanScouter(audio, particles);
      const gravity = new GravityChamber(audio, scouter);
      const transformationEngine = new SaiyanTransformationEngine(audio, particles, gravity);
      gravity.transformationEngine = transformationEngine;
      const inventory = new CapsuleInventory(audio, particles, gravity);

      // Audio Toggle in Navigation
      const btnAudio = document.getElementById('btnAudioToggle');
      if (btnAudio) {
        btnAudio.addEventListener('click', () => {
          const muted = audio.toggleMute();
          btnAudio.innerHTML = muted
            ? '<i class="fas fa-volume-mute"></i> Áudio: OFF'
            : '<i class="fas fa-volume-up"></i> Áudio: ON';
          btnAudio.classList.toggle('active', !muted);
        });
      }

      // Fullscreen Toggle
      const btnFullscreen = document.getElementById('btnFullscreen');
      if (btnFullscreen) {
        btnFullscreen.addEventListener('click', () => {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
            btnFullscreen.innerHTML = '<i class="fas fa-compress"></i> Normal';
          } else {
            document.exitFullscreen().catch(() => {});
            btnFullscreen.innerHTML = '<i class="fas fa-expand"></i> Tela Cheia';
          }
        });
      }

      // Transformation Selector Chips
      document.querySelectorAll('.transformation-chip').forEach((btn) => {
        btn.addEventListener('click', () => {
          const formKey = btn.dataset.form;
          if (formKey) {
            transformationEngine.transformTo(formKey);
          }
        });
      });

      // Expose for debugging & external integrations
      window.HighPrecisionPhysicsEngine = HighPrecisionPhysicsEngine;
      window.SaiyanTransformationEngine = SaiyanTransformationEngine;
      window.CapsuleCorp = {
        audio,
        particles,
        scouter,
        gravity,
        inventory,
        transformationEngine,
        HighPrecisionPhysicsEngine
      };
    });
  }

  // Global window exposure for headless tests & unit runners
  if (typeof window !== 'undefined') {
    window.HighPrecisionPhysicsEngine = HighPrecisionPhysicsEngine;
    window.SaiyanTransformationEngine = SaiyanTransformationEngine;
  }

  // CommonJS Node.js module export support
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      HighPrecisionPhysicsEngine,
      SaiyanTransformationEngine,
      CapsuleAudioEngine,
      ParticleSystem,
      GravityChamber,
      SaiyanScouter,
      CapsuleInventory
    };
  }
})();
