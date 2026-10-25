/**
 * Theme Engine - Dragon Ball Easter Egg & Aura Theme Specialist
 * Supports "Executive Dark" and "Super Saiyan Mode" with aura/particles & localStorage persistence.
 */
(function() {
    const STORAGE_KEY = 'dbz_theme_mode';
    const THEMES = {
        EXECUTIVE: 'executive-dark',
        SUPER_SAIYAN: 'super-saiyan'
    };

    // Inject required styles for both themes and toggle switch / particle aura
    const styleEl = document.createElement('style');
    styleEl.id = 'theme-engine-styles';
    styleEl.textContent = `
        /* Executive Dark Theme (Default) */
        body.executive-dark {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important;
            color: #f8fafc !important;
        }
        body.executive-dark .container {
            background: rgba(15, 23, 42, 0.85) !important;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4);
        }
        body.executive-dark .btn-primary {
            background: #3b82f6 !important;
            border-color: #3b82f6 !important;
        }
        body.executive-dark .btn-primary:hover {
            background: #2563eb !important;
        }

        /* Super Saiyan Mode */
        body.super-saiyan {
            background: radial-gradient(circle at center, #1e1b4b 0%, #09090b 100%) !important;
            color: #fef08a !important;
            position: relative;
            overflow-x: hidden;
        }
        body.super-saiyan .container {
            background: rgba(20, 10, 30, 0.85) !important;
            border: 2px solid #eab308 !important;
            box-shadow: 0 0 30px rgba(234, 179, 8, 0.5), inset 0 0 15px rgba(234, 179, 8, 0.3) !important;
            animation: containerPulse 3s infinite alternate;
        }
        body.super-saiyan h2, body.super-saiyan label {
            color: #fde047 !important;
            text-shadow: 0 0 10px rgba(250, 204, 21, 0.8);
        }
        body.super-saiyan .form-control {
            color: #fde047 !important;
            border-bottom-color: #eab308 !important;
        }
        body.super-saiyan .form-control:focus {
            border-color: #38bdf8 !important;
            box-shadow: 0 0 8px rgba(56, 189, 248, 0.8) !important;
        }
        body.super-saiyan .btn-primary {
            background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%) !important;
            border: 1px solid #fef08a !important;
            color: #000 !important;
            font-weight: bold;
            box-shadow: 0 0 15px rgba(234, 179, 8, 0.8);
            transition: all 0.3s ease;
        }
        body.super-saiyan .btn-primary:hover {
            background: linear-gradient(135deg, #facc15 0%, #eab308 100%) !important;
            box-shadow: 0 0 25px rgba(250, 204, 21, 1);
        }

        @keyframes containerPulse {
            0% { box-shadow: 0 0 20px rgba(234, 179, 8, 0.4), inset 0 0 10px rgba(234, 179, 8, 0.2); }
            100% { box-shadow: 0 0 40px rgba(56, 189, 248, 0.7), inset 0 0 20px rgba(56, 189, 248, 0.4); }
        }

        /* Aura & Energy Particles Canvas */
        #dbz-aura-canvas {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 999;
            display: none;
        }
        body.super-saiyan #dbz-aura-canvas {
            display: block;
        }

        /* Discrete Theme Toggle Widget */
        .dbz-theme-toggle {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            background: rgba(15, 23, 42, 0.9);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #fff;
            padding: 8px 14px;
            border-radius: 30px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
            backdrop-filter: blur(5px);
        }
        .dbz-theme-toggle:hover {
            transform: scale(1.05);
            border-color: #3b82f6;
        }
        body.super-saiyan .dbz-theme-toggle {
            background: rgba(30, 20, 40, 0.9);
            border-color: #eab308;
            color: #fde047;
            box-shadow: 0 0 15px rgba(234, 179, 8, 0.5);
        }
        .dbz-theme-toggle .icon {
            font-size: 16px;
        }
    `;
    document.head.appendChild(styleEl);

    // Create Canvas for Aura / Ki Particles
    const canvas = document.createElement('canvas');
    canvas.id = 'dbz-aura-canvas';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let particles = [];
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = canvas.height + Math.random() * 100;
            this.size = Math.random() * 4 + 1;
            this.speedY = Math.random() * 3 + 2;
            this.speedX = (Math.random() - 0.5) * 1.5;
            this.color = Math.random() > 0.3 ? '#facc15' : '#38bdf8'; // Golden or Blue Ki
            this.alpha = Math.random() * 0.7 + 0.3;
        }
        update() {
            this.y -= this.speedY;
            this.x += this.speedX + Math.sin(this.y * 0.05) * 0.5;
            this.alpha -= 0.005;
            if (this.alpha <= 0 || this.y < 0) {
                this.reset();
            }
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 12;
            ctx.shadowColor = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    for (let i = 0; i < 60; i++) {
        particles.push(new Particle());
    }

    function animateParticles() {
        if (document.body.classList.contains(THEMES.SUPER_SAIYAN)) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
        }
        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    // Theme Management
    function setTheme(theme) {
        document.body.classList.remove(THEMES.EXECUTIVE, THEMES.SUPER_SAIYAN);
        document.body.classList.add(theme);
        localStorage.setItem(STORAGE_KEY, theme);

        const toggleBtn = document.getElementById('dbz-theme-btn');
        if (toggleBtn) {
            if (theme === THEMES.SUPER_SAIYAN) {
                toggleBtn.innerHTML = '<span class="icon">⚡</span> Super Saiyan Mode';
            } else {
                toggleBtn.innerHTML = '<span class="icon">💼</span> Executive Dark';
            }
        }
    }

    // Initialize UI and State
    document.addEventListener('DOMContentLoaded', () => {
        // Create Toggle Button
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'dbz-theme-btn';
        toggleBtn.className = 'dbz-theme-toggle';
        toggleBtn.setAttribute('title', 'Alternar Tema (Executive Dark / Super Saiyan)');
        document.body.appendChild(toggleBtn);

        toggleBtn.addEventListener('click', () => {
            const current = localStorage.getItem(STORAGE_KEY) || THEMES.EXECUTIVE;
            const next = current === THEMES.EXECUTIVE ? THEMES.SUPER_SAIYAN : THEMES.EXECUTIVE;
            setTheme(next);
        });

        // Load saved or default theme
        const savedTheme = localStorage.getItem(STORAGE_KEY) || THEMES.EXECUTIVE;
        setTheme(savedTheme);
    });
})();
