/**
 * Theme Engine - Super Saiyan Ki Engine Specialist
 * Four Dragon Ball Transformation Modes:
 *   1. executive-dark: Sleek Enterprise Slate & Cobalt Blue
 *   2. super-saiyan: Golden Aura with rising flame particles & yellow neon glow
 *   3. super-saiyan-blue: God Ki Cyan/Cobalt aura with high-energy electrical arcs
 *   4. ultra-instinct: Silver/Platinum aura with ethereal purple mist & stellar stardust particles
 * Includes Custom Canvas Particle Physics, Multi-Stage Web Audio Synthesis,
 * Dynamic Body Classes & CSS Styling, and Floating Transformation Selector Badge with Sound Toggles.
 */
(function() {
    'use strict';

    const STORAGE_KEY = 'dbz_theme_mode';
    const SOUND_KEY = 'dbz_theme_sound';

    const THEMES = {
        EXECUTIVE: 'executive-dark',
        SUPER_SAIYAN: 'super-saiyan',
        SUPER_SAIYAN_BLUE: 'super-saiyan-blue',
        ULTRA_INSTINCT: 'ultra-instinct'
    };

    const THEME_CONFIG = {
        [THEMES.EXECUTIVE]: {
            id: THEMES.EXECUTIVE,
            name: 'Executive Dark',
            shortName: 'Executive',
            badge: 'Enterprise God',
            icon: '💼',
            primaryColor: '#3b82f6',
            accentColor: '#1d4ed8',
            textColor: '#f8fafc',
            subtext: 'Sleek Enterprise Slate & Cobalt Blue',
            glowColor: 'rgba(59, 130, 246, 0.5)'
        },
        [THEMES.SUPER_SAIYAN]: {
            id: THEMES.SUPER_SAIYAN,
            name: 'Super Saiyan',
            shortName: 'SSJ',
            badge: 'Lendário Guerreiro Dourado',
            icon: '⚡',
            primaryColor: '#facc15',
            accentColor: '#eab308',
            textColor: '#fef08a',
            subtext: 'Golden Aura with rising flame particles & yellow neon glow',
            glowColor: 'rgba(250, 204, 21, 0.7)'
        },
        [THEMES.SUPER_SAIYAN_BLUE]: {
            id: THEMES.SUPER_SAIYAN_BLUE,
            name: 'Super Saiyan Blue',
            shortName: 'SSB',
            badge: 'God Ki Super Saiyan God',
            icon: '🌊',
            primaryColor: '#00f0ff',
            accentColor: '#0284c7',
            textColor: '#e0f2fe',
            subtext: 'God Ki Cyan/Cobalt aura with high-energy electrical arcs',
            glowColor: 'rgba(0, 240, 255, 0.8)'
        },
        [THEMES.ULTRA_INSTINCT]: {
            id: THEMES.ULTRA_INSTINCT,
            name: 'Ultra Instinct',
            shortName: 'UI',
            badge: 'Migatte no Gokui Autônomo',
            icon: '🌌',
            primaryColor: '#f8fafc',
            accentColor: '#a855f7',
            textColor: '#ffffff',
            subtext: 'Silver/Platinum aura with ethereal purple mist & stellar stardust',
            glowColor: 'rgba(226, 232, 240, 0.8)'
        }
    };

    // --- INJECT THEME STYLES ---
    const styleEl = document.createElement('style');
    styleEl.id = 'theme-engine-styles';
    styleEl.textContent = `
        /* ==========================================================================
           TRANSITION RULES
           ========================================================================== */
        body {
            transition: background 0.6s cubic-bezier(0.4, 0, 0.2, 1), color 0.4s ease !important;
        }
        .container, .login-box, .dashboard-container, .stat-card, .btn-primary, .form-control {
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        /* ==========================================================================
           1. EXECUTIVE DARK MODE (Default Enterprise Slate & Cobalt Blue)
           ========================================================================== */
        body.executive-dark {
            background: linear-gradient(135deg, #0b0f19 0%, #0f172a 50%, #1e293b 100%) !important;
            color: #f8fafc !important;
        }
        body.executive-dark .container,
        body.executive-dark .login-box,
        body.executive-dark .dashboard-container {
            background: rgba(15, 23, 42, 0.88) !important;
            border: 1px solid rgba(59, 130, 246, 0.25) !important;
            box-shadow: 0 20px 45px -5px rgba(0, 0, 0, 0.7), 0 0 20px rgba(59, 130, 246, 0.12) !important;
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
        }
        body.executive-dark h1, body.executive-dark h2, body.executive-dark h3, body.executive-dark h4 {
            color: #f8fafc !important;
            text-shadow: 0 0 12px rgba(59, 130, 246, 0.35);
        }
        body.executive-dark .btn-primary {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
            border: 1px solid #3b82f6 !important;
            color: #ffffff !important;
            box-shadow: 0 4px 15px rgba(37, 99, 235, 0.45);
        }
        body.executive-dark .btn-primary:hover {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.6);
            transform: translateY(-2px);
        }
        body.executive-dark .form-control {
            background: rgba(15, 23, 42, 0.65) !important;
            border: 1px solid rgba(255, 255, 255, 0.12) !important;
            color: #f8fafc !important;
        }
        body.executive-dark .form-control:focus {
            border-color: #3b82f6 !important;
            box-shadow: 0 0 12px rgba(59, 130, 246, 0.5) !important;
        }
        body.executive-dark .stat-card {
            border-color: rgba(59, 130, 246, 0.25) !important;
            background: rgba(30, 41, 59, 0.5) !important;
        }
        body.executive-dark .stat-card h3 {
            color: #60a5fa !important;
        }

        /* ==========================================================================
           2. SUPER SAIYAN MODE (Golden Flame Aura & Yellow Neon Glow)
           ========================================================================== */
        body.super-saiyan {
            background: radial-gradient(circle at center, #1c1402 0%, #0c0801 70%, #050300 100%) !important;
            color: #fef08a !important;
            position: relative;
        }
        body.super-saiyan .container,
        body.super-saiyan .login-box,
        body.super-saiyan .dashboard-container {
            background: rgba(26, 18, 5, 0.9) !important;
            border: 2px solid #eab308 !important;
            box-shadow: 0 0 35px rgba(234, 179, 8, 0.5), inset 0 0 20px rgba(234, 179, 8, 0.25) !important;
            animation: ssjContainerPulse 2.8s infinite alternate ease-in-out;
            backdrop-filter: blur(12px);
        }
        body.super-saiyan h1, body.super-saiyan h2, body.super-saiyan h3, body.super-saiyan h4,
        body.super-saiyan label {
            color: #fde047 !important;
            text-shadow: 0 0 12px rgba(250, 204, 21, 0.85), 0 0 25px rgba(234, 179, 8, 0.5);
        }
        body.super-saiyan .btn-primary {
            background: linear-gradient(135deg, #facc15 0%, #ca8a04 100%) !important;
            border: 1px solid #fef08a !important;
            color: #000000 !important;
            font-weight: 800;
            letter-spacing: 0.5px;
            box-shadow: 0 0 20px rgba(250, 204, 21, 0.8);
        }
        body.super-saiyan .btn-primary:hover {
            background: linear-gradient(135deg, #fef08a 0%, #facc15 100%) !important;
            box-shadow: 0 0 35px rgba(250, 204, 21, 1), 0 0 15px #ffffff;
            transform: translateY(-2px);
        }
        body.super-saiyan .form-control {
            background: rgba(35, 25, 8, 0.7) !important;
            color: #fef08a !important;
            border: 1px solid rgba(234, 179, 8, 0.45) !important;
        }
        body.super-saiyan .form-control:focus {
            border-color: #fde047 !important;
            box-shadow: 0 0 16px rgba(250, 204, 21, 0.8) !important;
        }
        body.super-saiyan .stat-card {
            border-color: rgba(234, 179, 8, 0.45) !important;
            background: rgba(40, 28, 8, 0.55) !important;
        }
        body.super-saiyan .stat-card h3 {
            color: #facc15 !important;
            text-shadow: 0 0 10px rgba(250, 204, 21, 0.8);
        }
        body.super-saiyan .avatar-container {
            background: linear-gradient(135deg, #facc15, #ca8a04) !important;
            color: #000 !important;
            box-shadow: 0 0 25px rgba(250, 204, 21, 0.9) !important;
        }
        @keyframes ssjContainerPulse {
            0% { box-shadow: 0 0 25px rgba(234, 179, 8, 0.4), inset 0 0 12px rgba(234, 179, 8, 0.2); }
            100% { box-shadow: 0 0 45px rgba(250, 204, 21, 0.75), inset 0 0 25px rgba(250, 204, 21, 0.4); }
        }

        /* ==========================================================================
           3. SUPER SAIYAN BLUE MODE (God Ki Cyan/Cobalt & Electrical Arcs)
           ========================================================================== */
        body.super-saiyan-blue {
            background: radial-gradient(circle at center, #031b33 0%, #020b17 65%, #010408 100%) !important;
            color: #e0f2fe !important;
            position: relative;
        }
        body.super-saiyan-blue .container,
        body.super-saiyan-blue .login-box,
        body.super-saiyan-blue .dashboard-container {
            background: rgba(3, 20, 42, 0.92) !important;
            border: 2px solid #00f0ff !important;
            box-shadow: 0 0 40px rgba(0, 240, 255, 0.6), inset 0 0 22px rgba(2, 132, 199, 0.4) !important;
            animation: ssbContainerPulse 2.4s infinite alternate ease-in-out;
            backdrop-filter: blur(14px);
        }
        body.super-saiyan-blue h1, body.super-saiyan-blue h2, body.super-saiyan-blue h3, body.super-saiyan-blue h4,
        body.super-saiyan-blue label {
            color: #38bdf8 !important;
            text-shadow: 0 0 16px rgba(0, 240, 255, 0.95), 0 0 35px rgba(2, 132, 199, 0.7);
        }
        body.super-saiyan-blue .btn-primary {
            background: linear-gradient(135deg, #00f0ff 0%, #0284c7 100%) !important;
            border: 1px solid #7dd3fc !important;
            color: #020b17 !important;
            font-weight: 800;
            letter-spacing: 0.5px;
            box-shadow: 0 0 25px rgba(0, 240, 255, 0.85);
        }
        body.super-saiyan-blue .btn-primary:hover {
            background: linear-gradient(135deg, #38bdf8 0%, #00f0ff 100%) !important;
            box-shadow: 0 0 40px rgba(0, 240, 255, 1), 0 0 20px #ffffff;
            transform: translateY(-2px);
        }
        body.super-saiyan-blue .form-control {
            background: rgba(2, 28, 60, 0.75) !important;
            color: #e0f2fe !important;
            border: 1px solid rgba(0, 240, 255, 0.45) !important;
        }
        body.super-saiyan-blue .form-control:focus {
            border-color: #00f0ff !important;
            box-shadow: 0 0 18px rgba(0, 240, 255, 0.85) !important;
        }
        body.super-saiyan-blue .stat-card {
            border-color: rgba(0, 240, 255, 0.45) !important;
            background: rgba(3, 30, 60, 0.55) !important;
        }
        body.super-saiyan-blue .stat-card h3 {
            color: #38bdf8 !important;
            text-shadow: 0 0 12px rgba(0, 240, 255, 0.85);
        }
        body.super-saiyan-blue .avatar-container {
            background: linear-gradient(135deg, #00f0ff, #0284c7) !important;
            color: #020b17 !important;
            box-shadow: 0 0 30px rgba(0, 240, 255, 0.95) !important;
        }
        @keyframes ssbContainerPulse {
            0% { box-shadow: 0 0 25px rgba(0, 240, 255, 0.45), inset 0 0 15px rgba(2, 132, 199, 0.3); }
            100% { box-shadow: 0 0 50px rgba(0, 240, 255, 0.85), inset 0 0 30px rgba(6, 182, 212, 0.55); }
        }

        /* ==========================================================================
           4. ULTRA INSTINCT MODE (Silver/Platinum Aura, Ethereal Purple & Stardust)
           ========================================================================== */
        body.ultra-instinct {
            background: radial-gradient(circle at center, #170d2c 0%, #0b0617 65%, #030107 100%) !important;
            color: #f8fafc !important;
            position: relative;
        }
        body.ultra-instinct .container,
        body.ultra-instinct .login-box,
        body.ultra-instinct .dashboard-container {
            background: rgba(18, 12, 32, 0.92) !important;
            border: 2px solid #f8fafc !important;
            box-shadow: 0 0 45px rgba(248, 250, 252, 0.65), 0 0 85px rgba(168, 85, 247, 0.45), inset 0 0 25px rgba(192, 132, 252, 0.35) !important;
            animation: uiContainerPulse 3.2s infinite alternate ease-in-out;
            backdrop-filter: blur(16px);
        }
        body.ultra-instinct h1, body.ultra-instinct h2, body.ultra-instinct h3, body.ultra-instinct h4,
        body.ultra-instinct label {
            color: #ffffff !important;
            text-shadow: 0 0 12px #ffffff, 0 0 28px rgba(192, 132, 252, 0.95), 0 0 50px rgba(168, 85, 247, 0.7);
        }
        body.ultra-instinct .btn-primary {
            background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 40%, #c084fc 100%) !important;
            border: 1px solid #ffffff !important;
            color: #0b0617 !important;
            font-weight: 800;
            letter-spacing: 0.8px;
            box-shadow: 0 0 28px rgba(255, 255, 255, 0.9), 0 0 45px rgba(168, 85, 247, 0.6);
        }
        body.ultra-instinct .btn-primary:hover {
            background: linear-gradient(135deg, #ffffff 0%, #f3e8ff 100%) !important;
            box-shadow: 0 0 45px rgba(255, 255, 255, 1), 0 0 65px rgba(192, 132, 252, 0.9);
            transform: translateY(-2px);
        }
        body.ultra-instinct .form-control {
            background: rgba(28, 18, 50, 0.75) !important;
            color: #ffffff !important;
            border: 1px solid rgba(226, 232, 240, 0.45) !important;
        }
        body.ultra-instinct .form-control:focus {
            border-color: #ffffff !important;
            box-shadow: 0 0 20px rgba(192, 132, 252, 0.85), 0 0 10px #ffffff !important;
        }
        body.ultra-instinct .stat-card {
            border-color: rgba(192, 132, 252, 0.45) !important;
            background: rgba(35, 22, 60, 0.55) !important;
        }
        body.ultra-instinct .stat-card h3 {
            color: #ffffff !important;
            text-shadow: 0 0 15px rgba(192, 132, 252, 0.9), 0 0 25px rgba(255, 255, 255, 0.8);
        }
        body.ultra-instinct .avatar-container {
            background: linear-gradient(135deg, #ffffff, #c084fc) !important;
            color: #0b0617 !important;
            box-shadow: 0 0 35px rgba(255, 255, 255, 0.95), 0 0 50px rgba(168, 85, 247, 0.75) !important;
        }
        @keyframes uiContainerPulse {
            0% { box-shadow: 0 0 35px rgba(248, 250, 252, 0.5), 0 0 60px rgba(168, 85, 247, 0.35); }
            100% { box-shadow: 0 0 65px rgba(255, 255, 255, 0.85), 0 0 100px rgba(192, 132, 252, 0.65); }
        }

        /* ==========================================================================
           FULLSCREEN KI CANVAS & SHOCKWAVE EFFECT
           ========================================================================== */
        #dbz-aura-canvas {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 10;
        }
        .dbz-shockwave {
            position: fixed;
            top: 50%;
            left: 50%;
            width: 100px;
            height: 100px;
            margin-left: -50px;
            margin-top: -50px;
            border-radius: 50%;
            pointer-events: none;
            z-index: 9998;
            opacity: 0;
            transform: scale(0.1);
            animation: dbzShockwaveBurst 0.85s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
        }
        @keyframes dbzShockwaveBurst {
            0% {
                opacity: 0.9;
                transform: scale(0.2);
                border: 4px solid var(--burst-color, #ffffff);
                box-shadow: 0 0 40px var(--burst-color, #ffffff), inset 0 0 30px var(--burst-color, #ffffff);
            }
            70% {
                opacity: 0.4;
                border: 2px solid var(--burst-color, #ffffff);
                box-shadow: 0 0 80px var(--burst-color, #ffffff);
            }
            100% {
                opacity: 0;
                transform: scale(25);
                border: 0px solid transparent;
            }
        }

        /* ==========================================================================
           FLOATING THEME SELECTOR WIDGET & BADGE
           ========================================================================== */
        .dbz-theme-widget {
            position: fixed;
            bottom: 22px;
            right: 22px;
            z-index: 9999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            user-select: none;
        }

        /* Trigger Pill */
        .dbz-floating-pill {
            display: flex;
            align-items: center;
            gap: 9px;
            background: rgba(15, 23, 42, 0.92);
            border: 1.5px solid rgba(255, 255, 255, 0.2);
            color: #ffffff;
            padding: 9px 16px;
            border-radius: 40px;
            cursor: pointer;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.45);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            outline: none;
        }
        .dbz-floating-pill:hover {
            transform: translateY(-2px) scale(1.03);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.6);
        }
        .dbz-floating-pill .dbz-pill-icon {
            font-size: 1.15rem;
            line-height: 1;
            filter: drop-shadow(0 0 6px currentColor);
        }
        .dbz-floating-pill .dbz-pill-label {
            font-size: 0.85rem;
            font-weight: 700;
            letter-spacing: 0.4px;
        }
        .dbz-floating-pill .dbz-pill-chevron {
            font-size: 0.65rem;
            opacity: 0.75;
            transition: transform 0.3s ease;
        }
        .dbz-theme-widget.open .dbz-pill-chevron {
            transform: rotate(180deg);
        }

        /* Mode-specific Badge Styling */
        body.executive-dark .dbz-floating-pill {
            border-color: #3b82f6;
            color: #f8fafc;
            box-shadow: 0 0 15px rgba(59, 130, 246, 0.4);
        }
        body.super-saiyan .dbz-floating-pill {
            background: rgba(30, 20, 5, 0.94);
            border-color: #facc15;
            color: #fde047;
            box-shadow: 0 0 20px rgba(250, 204, 21, 0.65);
        }
        body.super-saiyan-blue .dbz-floating-pill {
            background: rgba(3, 20, 42, 0.94);
            border-color: #00f0ff;
            color: #38bdf8;
            box-shadow: 0 0 22px rgba(0, 240, 255, 0.75);
        }
        body.ultra-instinct .dbz-floating-pill {
            background: rgba(20, 14, 36, 0.94);
            border-color: #ffffff;
            color: #ffffff;
            box-shadow: 0 0 25px rgba(255, 255, 255, 0.8), 0 0 35px rgba(168, 85, 247, 0.5);
        }

        /* Pop-up Transformation Menu */
        .dbz-selector-panel {
            position: absolute;
            bottom: calc(100% + 14px);
            right: 0;
            width: 320px;
            background: rgba(13, 17, 30, 0.96);
            border: 1.5px solid rgba(255, 255, 255, 0.18);
            border-radius: 18px;
            padding: 16px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px);
            opacity: 0;
            pointer-events: none;
            transform: translateY(12px) scale(0.96);
            transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .dbz-theme-widget.open .dbz-selector-panel {
            opacity: 1;
            pointer-events: auto;
            transform: translateY(0) scale(1);
        }

        /* Panel Header */
        .dbz-panel-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .dbz-panel-title {
            font-size: 0.82rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #94a3b8;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .dbz-sound-btn {
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.15);
            color: #e2e8f0;
            font-size: 0.8rem;
            padding: 4px 10px;
            border-radius: 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 5px;
            transition: all 0.2s ease;
        }
        .dbz-sound-btn:hover {
            background: rgba(255, 255, 255, 0.18);
            border-color: rgba(255, 255, 255, 0.35);
        }
        .dbz-sound-btn.muted {
            opacity: 0.6;
            color: #94a3b8;
        }

        /* Transformation Grid */
        .dbz-modes-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .dbz-mode-card {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 12px;
            background: rgba(255, 255, 255, 0.04);
            border: 1.5px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.25s ease;
            text-align: left;
            position: relative;
            overflow: hidden;
        }
        .dbz-mode-card:hover {
            background: rgba(255, 255, 255, 0.09);
            transform: translateX(3px);
        }
        .dbz-mode-card.active {
            background: rgba(255, 255, 255, 0.12);
        }

        /* Specific card highlights when active */
        .dbz-mode-card[data-theme="${THEMES.EXECUTIVE}"].active {
            border-color: #3b82f6;
            box-shadow: 0 0 15px rgba(59, 130, 246, 0.45);
        }
        .dbz-mode-card[data-theme="${THEMES.SUPER_SAIYAN}"].active {
            border-color: #facc15;
            box-shadow: 0 0 18px rgba(250, 204, 21, 0.55);
        }
        .dbz-mode-card[data-theme="${THEMES.SUPER_SAIYAN_BLUE}"].active {
            border-color: #00f0ff;
            box-shadow: 0 0 20px rgba(0, 240, 255, 0.65);
        }
        .dbz-mode-card[data-theme="${THEMES.ULTRA_INSTINCT}"].active {
            border-color: #ffffff;
            box-shadow: 0 0 22px rgba(255, 255, 255, 0.75), 0 0 35px rgba(168, 85, 247, 0.5);
        }

        .dbz-card-icon {
            font-size: 1.35rem;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            background: rgba(0, 0, 0, 0.3);
            flex-shrink: 0;
        }
        .dbz-card-info {
            flex: 1;
            min-width: 0;
        }
        .dbz-card-name {
            font-size: 0.88rem;
            font-weight: 700;
            color: #ffffff;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .dbz-card-badge {
            font-size: 0.65rem;
            font-weight: 600;
            padding: 1px 6px;
            border-radius: 6px;
            background: rgba(255, 255, 255, 0.12);
            color: #cbd5e1;
        }
        .dbz-card-desc {
            font-size: 0.72rem;
            color: #94a3b8;
            margin-top: 2px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .dbz-card-active-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: transparent;
            flex-shrink: 0;
            transition: all 0.25s ease;
        }
        .dbz-mode-card.active .dbz-card-active-dot {
            background: #22c55e;
            box-shadow: 0 0 8px #22c55e;
        }

        @media (max-width: 480px) {
            .dbz-theme-widget {
                bottom: 15px;
                right: 15px;
            }
            .dbz-selector-panel {
                width: calc(100vw - 30px);
                right: 0;
            }
        }
    `;
    document.head.appendChild(styleEl);

    // ==========================================================================
    // MULTI-STAGE PROCEDURAL WEB AUDIO SYNTHESIS
    // ==========================================================================
    class SoundEngine {
        constructor() {
            this.ctx = null;
            this.enabled = localStorage.getItem(SOUND_KEY) !== 'muted';
        }

        getAudioContext() {
            if (!this.ctx) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (AudioCtx) {
                    this.ctx = new AudioCtx();
                }
            }
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume().catch(() => {});
            }
            return this.ctx;
        }

        toggleSound() {
            this.enabled = !this.enabled;
            localStorage.setItem(SOUND_KEY, this.enabled ? 'enabled' : 'muted');
            return this.enabled;
        }

        isSoundEnabled() {
            return this.enabled;
        }

        playTransformation(theme) {
            if (!this.enabled) return;

            try {
                const audioCtx = this.getAudioContext();
                if (!audioCtx) return;
                const now = audioCtx.currentTime;

                switch (theme) {
                    case THEMES.EXECUTIVE:
                        this.synthesizeExecutiveTone(audioCtx, now);
                        break;
                    case THEMES.SUPER_SAIYAN:
                        this.synthesizeSuperSaiyanSweep(audioCtx, now);
                        break;
                    case THEMES.SUPER_SAIYAN_BLUE:
                        this.synthesizeGodKiBlueShock(audioCtx, now);
                        break;
                    case THEMES.ULTRA_INSTINCT:
                        this.synthesizeUltraInstinctDivineHum(audioCtx, now);
                        break;
                }
            } catch (err) {
                // Silently handle autoplay prevention or audio context restriction
            }
        }

        // Executive Dark: Modern tech standby descent & clean digital lock
        synthesizeExecutiveTone(ctx, now) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1400, now);
            filter.frequency.exponentialRampToValueAtTime(320, now + 0.35);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(380, now);
            osc.frequency.exponentialRampToValueAtTime(120, now + 0.35);

            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 0.36);

            // Subtle digital click
            const click = ctx.createOscillator();
            const clickGain = ctx.createGain();
            click.type = 'triangle';
            click.frequency.setValueAtTime(1200, now);
            clickGain.gain.setValueAtTime(0.08, now);
            clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
            click.connect(clickGain);
            clickGain.connect(ctx.destination);
            click.start(now);
            click.stop(now + 0.045);
        }

        // Super Saiyan: Golden soaring power-up sweep, resonant bandpass & electric spark rumble
        synthesizeSuperSaiyanSweep(ctx, now) {
            // Stage 1: Deep Charging Sub Rumble
            const sub = ctx.createOscillator();
            const subGain = ctx.createGain();
            sub.type = 'sine';
            sub.frequency.setValueAtTime(65, now);
            sub.frequency.exponentialRampToValueAtTime(160, now + 0.6);
            subGain.gain.setValueAtTime(0.2, now);
            subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
            sub.connect(subGain);
            subGain.connect(ctx.destination);
            sub.start(now);
            sub.stop(now + 0.7);

            // Stage 2: Blazing Soaring Sawtooth Ki Sweep
            const kiOsc = ctx.createOscillator();
            const kiGain = ctx.createGain();
            const kiFilter = ctx.createBiquadFilter();

            kiFilter.type = 'bandpass';
            kiFilter.Q.setValueAtTime(3.8, now);
            kiFilter.frequency.setValueAtTime(180, now);
            kiFilter.frequency.exponentialRampToValueAtTime(1800, now + 0.75);

            kiOsc.type = 'sawtooth';
            kiOsc.frequency.setValueAtTime(90, now);
            kiOsc.frequency.exponentialRampToValueAtTime(540, now + 0.35);
            kiOsc.frequency.exponentialRampToValueAtTime(920, now + 0.75);

            kiGain.gain.setValueAtTime(0.01, now);
            kiGain.gain.linearRampToValueAtTime(0.28, now + 0.2);
            kiGain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

            kiOsc.connect(kiFilter);
            kiFilter.connect(kiGain);
            kiGain.connect(ctx.destination);
            kiOsc.start(now);
            kiOsc.stop(now + 0.85);

            // Stage 3: Electric Spark Crackles
            [0.18, 0.38, 0.58].forEach((offset, idx) => {
                const spark = ctx.createOscillator();
                const sparkGain = ctx.createGain();
                spark.type = 'square';
                spark.frequency.setValueAtTime(400 + idx * 250, now + offset);
                spark.frequency.linearRampToValueAtTime(1400 + idx * 300, now + offset + 0.1);

                sparkGain.gain.setValueAtTime(0.07, now + offset);
                sparkGain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.12);

                spark.connect(sparkGain);
                sparkGain.connect(ctx.destination);
                spark.start(now + offset);
                spark.stop(now + offset + 0.13);
            });
        }

        // Super Saiyan Blue: God Ki Shockwave, Crystalline Resonance & High-Energy Electrical Arc Zaps
        synthesizeGodKiBlueShock(ctx, now) {
            // Stage 1: Explosive God Ki Detonation Swell (Sub-bass impact)
            const godSub = ctx.createOscillator();
            const godSubGain = ctx.createGain();
            godSub.type = 'sine';
            godSub.frequency.setValueAtTime(95, now);
            godSub.frequency.exponentialRampToValueAtTime(38, now + 0.45);
            godSubGain.gain.setValueAtTime(0.3, now);
            godSubGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
            godSub.connect(godSubGain);
            godSubGain.connect(ctx.destination);
            godSub.start(now);
            godSub.stop(now + 0.8);

            // Stage 2: Dual Crystalline God Frequencies (Harmonic Fifths with High Vibrato)
            const lfo = ctx.createOscillator();
            const lfoGain = ctx.createGain();
            lfo.type = 'sine';
            lfo.frequency.setValueAtTime(16, now); // 16Hz Vibrato
            lfoGain.gain.setValueAtTime(25, now);

            [320, 480].forEach(baseFreq => {
                const godOsc = ctx.createOscillator();
                const godGain = ctx.createGain();
                godOsc.type = 'triangle';
                godOsc.frequency.setValueAtTime(baseFreq, now);
                godOsc.frequency.exponentialRampToValueAtTime(baseFreq * 3.2, now + 0.65);

                lfoGain.connect(godOsc.frequency);

                godGain.gain.setValueAtTime(0.02, now);
                godGain.gain.linearRampToValueAtTime(0.22, now + 0.2);
                godGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

                godOsc.connect(godGain);
                godGain.connect(ctx.destination);
                godOsc.start(now);
                godOsc.stop(now + 0.95);
            });
            lfo.start(now);
            lfo.stop(now + 0.95);

            // Stage 3: High-Voltage Electrical Arc Discharges (FM synthesis zaps)
            [0.12, 0.28, 0.46, 0.62].forEach((offset, idx) => {
                const carrier = ctx.createOscillator();
                const modulator = ctx.createOscillator();
                const modGain = ctx.createGain();
                const arcGain = ctx.createGain();

                carrier.type = 'sawtooth';
                carrier.frequency.setValueAtTime(950 + idx * 280, now + offset);

                modulator.type = 'square';
                modulator.frequency.setValueAtTime(220, now + offset);
                modGain.gain.setValueAtTime(500, now + offset);

                modulator.connect(modGain);
                modGain.connect(carrier.frequency);

                arcGain.gain.setValueAtTime(0.09, now + offset);
                arcGain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.1);

                carrier.connect(arcGain);
                arcGain.connect(ctx.destination);

                modulator.start(now + offset);
                carrier.start(now + offset);
                modulator.stop(now + offset + 0.11);
                carrier.stop(now + offset + 0.11);
            });
        }

        // Ultra Instinct: Transcendent Divine Hum, Solfeggio 528Hz Chime & Ethereal Cosmic Mist Whoosh
        synthesizeUltraInstinctDivineHum(ctx, now) {
            // Stage 1: Transcendent 55Hz Divine Drone
            const drone = ctx.createOscillator();
            const droneGain = ctx.createGain();
            drone.type = 'sine';
            drone.frequency.setValueAtTime(55, now);
            droneGain.gain.setValueAtTime(0.02, now);
            droneGain.gain.linearRampToValueAtTime(0.24, now + 0.4);
            droneGain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
            drone.connect(droneGain);
            droneGain.connect(ctx.destination);
            drone.start(now);
            drone.stop(now + 1.45);

            // Stage 2: Solfeggio 528Hz & 1056Hz Celestial Singing Bowl Bells
            const bellLFO = ctx.createOscillator();
            const bellLFOGain = ctx.createGain();
            bellLFO.frequency.setValueAtTime(4.5, now); // Gentle serene 4.5Hz shimmer
            bellLFOGain.gain.setValueAtTime(8, now);

            [528, 1056].forEach((freq, idx) => {
                const bell = ctx.createOscillator();
                const bellGain = ctx.createGain();
                bell.type = 'sine';
                bell.frequency.setValueAtTime(freq, now);

                bellLFOGain.connect(bell.frequency);

                bellGain.gain.setValueAtTime(0.01, now);
                bellGain.gain.linearRampToValueAtTime(0.18 / (idx + 1), now + 0.25);
                bellGain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);

                bell.connect(bellGain);
                bellGain.connect(ctx.destination);
                bell.start(now);
                bell.stop(now + 1.35);
            });
            bellLFO.start(now);
            bellLFO.stop(now + 1.35);

            // Stage 3: Ethereal Cosmic Mist Sweeping Bandpass
            const bufferSize = ctx.sampleRate * 1.2;
            const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                output[i] = (Math.random() * 2 - 1) * 0.4;
            }

            const whiteNoise = ctx.createBufferSource();
            whiteNoise.buffer = noiseBuffer;

            const bandpass = ctx.createBiquadFilter();
            bandpass.type = 'bandpass';
            bandpass.Q.setValueAtTime(6.0, now);
            bandpass.frequency.setValueAtTime(650, now);
            bandpass.frequency.exponentialRampToValueAtTime(2400, now + 0.6);
            bandpass.frequency.exponentialRampToValueAtTime(850, now + 1.2);

            const noiseGain = ctx.createGain();
            noiseGain.gain.setValueAtTime(0.01, now);
            noiseGain.gain.linearRampToValueAtTime(0.14, now + 0.35);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

            whiteNoise.connect(bandpass);
            bandpass.connect(noiseGain);
            noiseGain.connect(ctx.destination);

            whiteNoise.start(now);
            whiteNoise.stop(now + 1.25);
        }
    }

    const soundEngine = new SoundEngine();

    // ==========================================================================
    // CUSTOM CANVAS PARTICLE & LIGHTNING AURA PHYSICS ENGINE
    // ==========================================================================
    let canvas = null;
    let ctx = null;
    let width = (typeof window !== 'undefined' && window.innerWidth) || 800;
    let height = (typeof window !== 'undefined' && window.innerHeight) || 600;
    let currentTheme = (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY)) || THEMES.EXECUTIVE;

    function resizeCanvas() {
        if (!canvas) return;
        width = canvas.width = (typeof window !== 'undefined' && window.innerWidth) || 800;
        height = canvas.height = (typeof window !== 'undefined' && window.innerHeight) || 600;
    }

    if (typeof window !== 'undefined' && typeof document !== 'undefined' && document.body) {
        canvas = document.createElement('canvas');
        canvas.id = 'dbz-aura-canvas';
        document.body.appendChild(canvas);
        ctx = canvas.getContext ? canvas.getContext('2d') : null;
        if (typeof window.addEventListener === 'function') {
            window.addEventListener('resize', resizeCanvas);
        }
        resizeCanvas();
    }

    // Particle Classes
    class ExecutiveParticle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 2 + 1;
            this.speedY = -(Math.random() * 0.4 + 0.2);
            this.speedX = (Math.random() - 0.5) * 0.4;
            this.alpha = Math.random() * 0.3 + 0.1;
        }
        update() {
            this.y += this.speedY;
            this.x += this.speedX;
            if (this.y < 0) this.y = height;
            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
        }
        draw() {
            ctx.fillStyle = 'rgba(96, 165, 250, ' + this.alpha + ')';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    class FlameParticle {
        constructor() {
            this.reset(true);
        }
        reset(randomY = false) {
            this.x = Math.random() * width;
            this.y = randomY ? Math.random() * height : height + Math.random() * 40;
            this.size = Math.random() * 5 + 1.5;
            this.speedY = Math.random() * 4.5 + 3.2;
            this.speedX = (Math.random() - 0.5) * 1.6;
            this.alpha = Math.random() * 0.75 + 0.25;
            this.swayFreq = Math.random() * 0.03 + 0.015;
            this.swayAmp = Math.random() * 2 + 0.8;
            this.isCoreSpark = Math.random() < 0.25;
            this.color = this.pickColor();
        }
        pickColor() {
            const colors = ['#fef08a', '#facc15', '#eab308', '#f59e0b', '#fbbf24', '#ffffff'];
            return colors[Math.floor(Math.random() * colors.length)];
        }
        update(time) {
            this.y -= this.speedY;
            this.x += this.speedX + Math.sin(this.y * this.swayFreq + time * 3) * this.swayAmp;
            this.alpha -= 0.0075;
            this.size *= 0.992;
            if (this.alpha <= 0 || this.y < -20 || this.size <= 0.4) {
                this.reset(false);
            }
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = Math.max(0, this.alpha);
            ctx.fillStyle = this.color;
            ctx.shadowBlur = this.isCoreSpark ? 18 : 10;
            ctx.shadowColor = '#facc15';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    class GodKiParticle {
        constructor() {
            this.reset(true);
        }
        reset(randomY = false) {
            this.x = Math.random() * width;
            this.y = randomY ? Math.random() * height : height + Math.random() * 50;
            this.size = Math.random() * 4.5 + 1.5;
            this.speedY = Math.random() * 5.2 + 3.8;
            this.phase = Math.random() * Math.PI * 2;
            this.swayAmp = Math.random() * 2.8 + 1.2;
            this.alpha = Math.random() * 0.8 + 0.2;
            const colors = ['#ffffff', '#e0f2fe', '#38bdf8', '#00f0ff', '#0284c7'];
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }
        update(time) {
            this.y -= this.speedY;
            this.x += Math.cos(this.y * 0.028 + this.phase) * this.swayAmp;
            this.alpha -= 0.007;
            this.size *= 0.993;
            if (this.alpha <= 0 || this.y < -20 || this.size <= 0.4) {
                this.reset(false);
            }
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = Math.max(0, this.alpha);
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 16;
            ctx.shadowColor = '#00f0ff';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // High-Energy Electrical Lightning Arc for Super Saiyan Blue
    class LightningArc {
        constructor() {
            this.reset();
        }
        reset() {
            const startX = Math.random() * width;
            const startY = Math.random() * height;
            const angle = Math.random() * Math.PI * 2;
            const length = Math.random() * 140 + 70;
            const endX = startX + Math.cos(angle) * length;
            const endY = startY + Math.sin(angle) * length;

            this.segments = this.generateJaggedPath(startX, startY, endX, endY, 7);
            this.life = Math.floor(Math.random() * 3) + 2; // Lasts 2-4 frames
            this.alpha = Math.random() * 0.6 + 0.4;
        }

        generateJaggedPath(x1, y1, x2, y2, segments) {
            const points = [{ x: x1, y: y1 }];
            const dx = (x2 - x1) / segments;
            const dy = (y2 - y1) / segments;

            for (let i = 1; i < segments; i++) {
                const perpX = -dy;
                const perpY = dx;
                const jitter = (Math.random() - 0.5) * 28;
                points.push({
                    x: x1 + dx * i + perpX * (jitter / Math.hypot(dx, dy) || 0),
                    y: y1 + dy * i + perpY * (jitter / Math.hypot(dx, dy) || 0)
                });
            }
            points.push({ x: x2, y: y2 });
            return points;
        }

        update() {
            this.life--;
        }

        draw() {
            if (this.segments.length < 2) return;
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            // Pass 1: Outer Cyan Halo
            ctx.strokeStyle = '#00f0ff';
            ctx.lineWidth = 3.5;
            ctx.shadowBlur = 18;
            ctx.shadowColor = '#00f0ff';
            ctx.beginPath();
            ctx.moveTo(this.segments[0].x, this.segments[0].y);
            for (let i = 1; i < this.segments.length; i++) {
                ctx.lineTo(this.segments[i].x, this.segments[i].y);
            }
            ctx.stroke();

            // Pass 2: White Core
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.4;
            ctx.shadowBlur = 4;
            ctx.shadowColor = '#ffffff';
            ctx.stroke();

            ctx.restore();
        }
    }

    // Ultra Instinct Ethereal Purple Mist Puff
    class EtherealMist {
        constructor() {
            this.reset(true);
        }
        reset(randomY = false) {
            this.x = Math.random() * width;
            this.y = randomY ? Math.random() * height : height + Math.random() * 80;
            this.radius = Math.random() * 70 + 40;
            this.speedY = Math.random() * 0.8 + 0.4;
            this.speedX = (Math.random() - 0.5) * 0.6;
            this.alpha = Math.random() * 0.05 + 0.025;
            this.maxAlpha = this.alpha;
        }
        update() {
            this.y -= this.speedY;
            this.x += this.speedX;
            if (this.y < -this.radius) {
                this.reset(false);
            }
        }
        draw() {
            ctx.save();
            const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
            grad.addColorStop(0, 'rgba(168, 85, 247, ' + this.alpha + ')');
            grad.addColorStop(0.5, 'rgba(126, 34, 206, ' + (this.alpha * 0.6) + ')');
            grad.addColorStop(1, 'rgba(59, 7, 100, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // Ultra Instinct Stellar Stardust & Diamond Sparkles
    class StardustParticle {
        constructor() {
            this.reset(true);
        }
        reset(randomY = false) {
            this.x = Math.random() * width;
            this.y = randomY ? Math.random() * height : height + Math.random() * 30;
            this.size = Math.random() * 3.5 + 1;
            this.speedY = Math.random() * 1.8 + 0.8;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.alpha = Math.random() * 0.7 + 0.3;
            this.twinkleSpeed = Math.random() * 0.06 + 0.03;
            this.phase = Math.random() * Math.PI * 2;
            this.isDiamondSparkle = Math.random() < 0.28;
            const colors = ['#ffffff', '#f8fafc', '#e2e8f0', '#cbd5e1', '#c084fc', '#e9d5ff'];
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }
        update() {
            this.y -= this.speedY;
            this.x += this.speedX;
            this.phase += this.twinkleSpeed;
            if (this.y < -20) {
                this.reset(false);
            }
        }
        draw() {
            const currentAlpha = Math.max(0.1, this.alpha + Math.sin(this.phase) * 0.3);
            ctx.save();
            ctx.globalAlpha = Math.min(1, currentAlpha);
            ctx.fillStyle = this.color;
            ctx.shadowBlur = this.isDiamondSparkle ? 14 : 6;
            ctx.shadowColor = '#ffffff';

            if (this.isDiamondSparkle) {
                // 4-point Diamond Star Sparkle
                const s = this.size * (1 + Math.sin(this.phase) * 0.3);
                ctx.beginPath();
                ctx.moveTo(this.x, this.y - s * 2.2);
                ctx.lineTo(this.x + s * 0.6, this.y);
                ctx.lineTo(this.x, this.y + s * 2.2);
                ctx.lineTo(this.x - s * 0.6, this.y);
                ctx.closePath();
                ctx.fill();

                ctx.beginPath();
                ctx.moveTo(this.x - s * 2.2, this.y);
                ctx.lineTo(this.x, this.y + s * 0.6);
                ctx.lineTo(this.x + s * 2.2, this.y);
                ctx.lineTo(this.x, this.y - s * 0.6);
                ctx.closePath();
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
    }

    // Instantiate Particle Pools
    const executiveParticles = Array.from({ length: 25 }, () => new ExecutiveParticle());
    const flameParticles = Array.from({ length: 75 }, () => new FlameParticle());
    const godKiParticles = Array.from({ length: 70 }, () => new GodKiParticle());
    let activeLightning = [];
    const etherealMist = Array.from({ length: 16 }, () => new EtherealMist());
    const stardustParticles = Array.from({ length: 50 }, () => new StardustParticle());

    let animationTime = 0;
    function animateParticles() {
        if (!ctx || typeof requestAnimationFrame !== 'function') return;
        ctx.clearRect(0, 0, width, height);
        animationTime += 0.016;

        if (currentTheme === THEMES.EXECUTIVE) {
            // Executive: Discrete floating slate motes with subtle proximity constellation links
            for (let i = 0; i < executiveParticles.length; i++) {
                const p = executiveParticles[i];
                p.update();
                p.draw();
                for (let j = i + 1; j < executiveParticles.length; j++) {
                    const p2 = executiveParticles[j];
                    const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
                    if (dist < 65) {
                        ctx.strokeStyle = 'rgba(59, 130, 246, ' + (0.15 * (1 - dist / 65)) + ')';
                        ctx.lineWidth = 0.75;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            }
        } else if (currentTheme === THEMES.SUPER_SAIYAN) {
            // Super Saiyan: Golden Flame Aura
            // Bottom golden bloom wash
            const flameGrad = ctx.createLinearGradient(0, height, 0, height - 160);
            flameGrad.addColorStop(0, 'rgba(234, 179, 8, 0.22)');
            flameGrad.addColorStop(1, 'rgba(234, 179, 8, 0)');
            ctx.fillStyle = flameGrad;
            ctx.fillRect(0, height - 160, width, 160);

            flameParticles.forEach(p => {
                p.update(animationTime);
                p.draw();
            });
        } else if (currentTheme === THEMES.SUPER_SAIYAN_BLUE) {
            // Super Saiyan Blue: God Ki cyan motes + high-energy electrical arcs
            godKiParticles.forEach(p => {
                p.update(animationTime);
                p.draw();
            });

            // Randomly trigger high-energy electrical lightning arcs
            if (Math.random() < 0.22 && activeLightning.length < 4) {
                activeLightning.push(new LightningArc());
            }

            activeLightning = activeLightning.filter(arc => {
                arc.update();
                arc.draw();
                return arc.life > 0;
            });
        } else if (currentTheme === THEMES.ULTRA_INSTINCT) {
            // Ultra Instinct: Ethereal Purple Mist + Stellar Stardust & Diamond Sparkles
            etherealMist.forEach(m => {
                m.update();
                m.draw();
            });
            stardustParticles.forEach(s => {
                s.update();
                s.draw();
            });
        }

        requestAnimationFrame(animateParticles);
    }
    if (typeof window !== 'undefined' && typeof document !== 'undefined' && document.body && ctx) {
        animateParticles();
    }

    // ==========================================================================
    // THEME TRANSFORMATION CONTROLLER & SHOCKWAVE TRIGGER
    // ==========================================================================
    function triggerShockwave(theme) {
        const config = THEME_CONFIG[theme] || THEME_CONFIG[THEMES.EXECUTIVE];
        const burst = document.createElement('div');
        burst.className = 'dbz-shockwave';
        burst.style.setProperty('--burst-color', config.primaryColor);
        document.body.appendChild(burst);
        setTimeout(() => burst.remove(), 900);
    }

    function setTheme(theme, playSound = false) {
        if (!Object.values(THEMES).includes(theme)) {
            theme = THEMES.EXECUTIVE;
        }

        // Remove all previous transformation classes
        Object.values(THEMES).forEach(t => document.body.classList.remove(t));
        document.body.classList.add(theme);

        currentTheme = theme;
        localStorage.setItem(STORAGE_KEY, theme);

        if (playSound) {
            soundEngine.playTransformation(theme);
            triggerShockwave(theme);
        }

        updateBadgeUI(theme);
    }

    function cycleNextTheme() {
        const list = [THEMES.EXECUTIVE, THEMES.SUPER_SAIYAN, THEMES.SUPER_SAIYAN_BLUE, THEMES.ULTRA_INSTINCT];
        const nextIdx = (list.indexOf(currentTheme) + 1) % list.length;
        setTheme(list[nextIdx], true);
    }

    // ==========================================================================
    // FLOATING THEME SELECTOR BADGE & INTERACTIVE MENU UI
    // ==========================================================================
    let widgetEl = null;

    function buildFloatingBadge() {
        if (document.getElementById('dbz-theme-widget')) return;

        widgetEl = document.createElement('div');
        widgetEl.id = 'dbz-theme-widget';
        widgetEl.className = 'dbz-theme-widget';

        widgetEl.innerHTML = `
            <!-- Transformation Pop-up Panel -->
            <div class="dbz-selector-panel" id="dbz-selector-panel" role="dialog" aria-label="Transformações Dragon Ball">
                <div class="dbz-panel-header">
                    <span class="dbz-panel-title">⚡ Dragon Ball Ki Engine</span>
                    <button class="dbz-sound-btn ${soundEngine.isSoundEnabled() ? '' : 'muted'}" id="dbz-sound-btn" title="Alternar Efeitos Sonoros">
                        <span id="dbz-sound-icon">${soundEngine.isSoundEnabled() ? '🔊' : '🔇'}</span>
                        <span id="dbz-sound-text">${soundEngine.isSoundEnabled() ? 'Som' : 'Mudo'}</span>
                    </button>
                </div>
                <div class="dbz-modes-list">
                    ${Object.values(THEME_CONFIG).map(config => `
                        <div class="dbz-mode-card ${config.id === currentTheme ? 'active' : ''}" data-theme="${config.id}" role="button" tabindex="0">
                            <div class="dbz-card-icon" style="color: ${config.primaryColor}">${config.icon}</div>
                            <div class="dbz-card-info">
                                <div class="dbz-card-name">
                                    <span>${config.name}</span>
                                    <span class="dbz-card-badge">${config.shortName}</span>
                                </div>
                                <div class="dbz-card-desc">${config.subtext}</div>
                            </div>
                            <div class="dbz-card-active-dot"></div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Floating Trigger Pill (also maintains id dbz-theme-btn for backward compatibility) -->
            <button class="dbz-floating-pill" id="dbz-theme-btn" aria-haspopup="true" aria-expanded="false" title="Alternar Transformação Ki (DBZ)">
                <span class="dbz-pill-icon" id="dbz-pill-icon">⚡</span>
                <span class="dbz-pill-label" id="dbz-pill-label">Super Saiyan</span>
                <span class="dbz-pill-chevron">▲</span>
            </button>
        `;

        document.body.appendChild(widgetEl);

        const pill = widgetEl.querySelector('#dbz-theme-btn');
        const soundBtn = widgetEl.querySelector('#dbz-sound-btn');
        const soundIcon = widgetEl.querySelector('#dbz-sound-icon');
        const soundText = widgetEl.querySelector('#dbz-sound-text');
        const modeCards = widgetEl.querySelectorAll('.dbz-mode-card');

        // Toggle menu open/close
        if (pill) {
            pill.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = widgetEl.classList.toggle('open');
                pill.setAttribute('aria-expanded', isOpen);
            });
        }

        // Toggle sound
        if (soundBtn) {
            soundBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const enabled = soundEngine.toggleSound();
                soundBtn.classList.toggle('muted', !enabled);
                if (soundIcon) soundIcon.textContent = enabled ? '🔊' : '🔇';
                if (soundText) soundText.textContent = enabled ? 'Som' : 'Mudo';
            });
        }

        // Mode cards click
        modeCards.forEach(card => {
            const targetTheme = card.getAttribute('data-theme');
            card.addEventListener('click', (e) => {
                e.stopPropagation();
                if (targetTheme !== currentTheme) {
                    setTheme(targetTheme, true);
                }
                widgetEl.classList.remove('open');
                if (pill) pill.setAttribute('aria-expanded', 'false');
            });
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    card.click();
                }
            });
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (widgetEl && !widgetEl.contains(e.target)) {
                widgetEl.classList.remove('open');
                pill.setAttribute('aria-expanded', 'false');
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && widgetEl && widgetEl.classList.contains('open')) {
                widgetEl.classList.remove('open');
                pill.setAttribute('aria-expanded', 'false');
            }
        });

        updateBadgeUI(currentTheme);
    }

    function updateBadgeUI(theme) {
        const config = THEME_CONFIG[theme] || THEME_CONFIG[THEMES.EXECUTIVE];
        const iconEl = document.getElementById('dbz-pill-icon');
        const labelEl = document.getElementById('dbz-pill-label');

        if (iconEl) iconEl.textContent = config.icon;
        if (labelEl) labelEl.textContent = config.name;

        // Update active card state in menu
        if (widgetEl) {
            const cards = widgetEl.querySelectorAll('.dbz-mode-card');
            cards.forEach(card => {
                const cardTheme = card.getAttribute('data-theme');
                card.classList.toggle('active', cardTheme === theme);
            });
        }
    }

    // ==========================================================================
    // INITIALIZATION & PUBLIC API EXPORT
    // ==========================================================================
    function init() {
        const savedTheme = localStorage.getItem(STORAGE_KEY) || THEMES.EXECUTIVE;
        setTheme(savedTheme, false);
        buildFloatingBadge();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose Global Public API for external scripts & tests
    window.DBZThemeEngine = {
        THEMES,
        THEME_CONFIG,
        setTheme: (theme, playAudio = true) => setTheme(theme, playAudio),
        getTheme: () => currentTheme,
        cycleNextTheme,
        toggleSound: () => soundEngine.toggleSound(),
        isSoundEnabled: () => soundEngine.isSoundEnabled(),
        playTransformationSound: (theme) => soundEngine.playTransformation(theme)
    };
})();
