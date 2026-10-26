/**
 * dashboard-charts.js - Pure HTML5 Canvas Analytics, Security & Telemetry Visualizer
 * High-performance, fully responsive charts rendered with zero external chart libraries:
 * 
 * 1. Line & Area Chart: 7-Day Login Frequency with smooth cubic Bezier splines,
 *    multi-stop gradient fills, glowing stroke, hover crosshair & data tooltips,
 *    and animated entrance transition.
 * 2. Donut Chart: Security Compliance & Vulnerability Breakdown (Web Crypto API,
 *    TOTP 2FA, Password Policy, Session Integrity) with center percentage score,
 *    interactive segment expansion with glow, and legend.
 * 3. Speedometer / Radial Gauge Chart: Server & Database Health Gauge showing
 *    simulated cluster load (CPU, Memory, Latency) with dynamic green/yellow/red sectors,
 *    smooth damped needle physics, digital status readout, and multi-metric switcher.
 * 
 * Automatically re-renders cleanly on window resize and handles High-DPI / Retina displays.
 */

(function () {
    'use strict';

    // --- EASING FUNCTIONS ---
    const Easing = {
        easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
        easeOutQuart: (t) => 1 - Math.pow(1 - t, 4),
        easeOutElastic: (t) => {
            const c4 = (2 * Math.PI) / 3;
            return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
        }
    };

    // Helper: Rounded Rectangle Polyfill for Canvas Context
    function drawRoundRect(ctx, x, y, width, height, radius) {
        if (typeof ctx.roundRect === 'function') {
            ctx.beginPath();
            ctx.roundRect(x, y, width, height, radius);
            return;
        }
        let r = typeof radius === 'number' ? radius : 6;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + width - r, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + r);
        ctx.lineTo(x + width, y + height - r);
        ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
        ctx.lineTo(x + r, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    class DashboardCharts {
        constructor() {
            // Configuration & Data Sets
            this.accessData = [
                { day: 'Seg', date: '20/10', count: 18, label: 'Segunda-feira' },
                { day: 'Ter', date: '21/10', count: 32, label: 'Terça-feira' },
                { day: 'Qua', date: '22/10', count: 26, label: 'Quarta-feira' },
                { day: 'Qui', date: '23/10', count: 44, label: 'Quinta-feira' },
                { day: 'Sex', date: '24/10', count: 58, label: 'Sexta-feira' },
                { day: 'Sáb', date: '25/10', count: 35, label: 'Sábado' },
                { day: 'Dom', date: '26/10', count: 68, label: 'Domingo' }
            ];

            this.securityData = [
                { id: 'crypto', label: 'Web Crypto API', detail: 'SHA-256 + Salt Nativo', value: 35, color: '#10B981' },
                { id: 'totp', label: 'TOTP 2FA (RFC 6238)', detail: 'Autenticação Temporal', value: 30, color: '#3B82F6' },
                { id: 'password', label: 'Política de Senhas', detail: 'Entropia & Complexidade', value: 20, color: '#F59E0B' },
                { id: 'session', label: 'Integridade de Sessão', detail: 'JWT & Proteção XSS', value: 15, color: '#FF0043' }
            ];
            this.complianceScore = 99.2;

            this.clusterMetrics = {
                cpu: {
                    id: 'cpu',
                    name: 'CPU Cluster Load',
                    unit: '%',
                    value: 36,
                    currentVal: 36,
                    targetVal: 36,
                    min: 0,
                    max: 100,
                    sectors: [
                        { max: 60, color: '#10B981', label: 'Normal / Otimizado' },
                        { max: 85, color: '#F59E0B', label: 'Carga Moderada' },
                        { max: 100, color: '#EF4444', label: 'Alerta / Alta Carga' }
                    ],
                    detail: '4 Cores virtuais ativos (2.8 GHz)',
                    subInfo: 'Pool de Threads Estável'
                },
                memory: {
                    id: 'memory',
                    name: 'Uso de Memória RAM',
                    unit: '%',
                    value: 52,
                    currentVal: 52,
                    targetVal: 52,
                    min: 0,
                    max: 100,
                    sectors: [
                        { max: 60, color: '#10B981', label: 'Normal' },
                        { max: 80, color: '#F59E0B', label: 'Uso Elevado' },
                        { max: 100, color: '#EF4444', label: 'Crítico' }
                    ],
                    detail: '4.16 GB / 8.00 GB alocados',
                    subInfo: 'Buffer & Cache Ativos'
                },
                latency: {
                    id: 'latency',
                    name: 'Latência do Banco de Dados',
                    unit: 'ms',
                    value: 24,
                    currentVal: 24,
                    targetVal: 24,
                    min: 0,
                    max: 100,
                    sectors: [
                        { max: 40, color: '#10B981', label: 'Ultra-rápido' },
                        { max: 75, color: '#F59E0B', label: 'Aceitável' },
                        { max: 100, color: '#EF4444', label: 'Lentidão' }
                    ],
                    detail: 'IndexedDB & Mock Postgres Sync',
                    subInfo: 'Resposta em 24ms'
                }
            };
            this.activeGaugeMetric = 'cpu';

            // Interaction States
            this.hoveredAccessIndex = -1;
            this.hoveredDonutSlice = -1;
            this.hoveredGaugeTab = null;

            // Animation Handles
            this.animTimelineProgress = 0;
            this.animDonutProgress = 0;
            this.animGaugeProgress = 0;
            this.timelineAnimId = null;
            this.donutAnimId = null;
            this.gaugeAnimId = null;
            this.telemetryIntervalId = null;

            // Responsive & Observers
            this.resizeDebounceTimer = null;
            this.resizeObserver = null;
            this.boundResizeHandler = this.handleResize.bind(this);

            this.init();
        }

        init() {
            if (document.readyState === 'loading') {
                window.addEventListener('DOMContentLoaded', () => this.boot());
            } else {
                this.boot();
            }
        }

        boot() {
            this.attachEventListeners();
            this.startTelemetrySimulation();
            this.animateAll();
        }

        // --- CANVAS UTILITIES (HIGH-DPI & GEOMETRY) ---
        getCanvasContext(canvasId) {
            const canvas = document.getElementById(canvasId);
            if (!canvas) return null;

            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            const width = rect.width || (canvas.parentElement ? canvas.parentElement.clientWidth : 300);
            const height = parseInt(canvas.getAttribute('height')) || rect.height || 220;

            // Resize internal buffer for High DPI
            if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
                canvas.width = Math.round(width * dpr);
                canvas.height = Math.round(height * dpr);
            }

            const ctx = canvas.getContext('2d');
            ctx.resetTransform();
            ctx.scale(dpr, dpr);

            return { canvas, ctx, width, height, dpr };
        }

        getCanvasRelativeCoords(canvas, evt) {
            const rect = canvas.getBoundingClientRect();
            const clientX = evt.touches && evt.touches.length > 0 ? evt.touches[0].clientX : evt.clientX;
            const clientY = evt.touches && evt.touches.length > 0 ? evt.touches[0].clientY : evt.clientY;
            return {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
        }

        // --- ANIMATION CONTROLLERS ---
        animateAll() {
            this.animateTimeline();
            this.animateDonut();
            this.animateGauge();
        }

        animateTimeline() {
            if (this.timelineAnimId) cancelAnimationFrame(this.timelineAnimId);
            const startTime = performance.now();
            const duration = 750;

            const step = (now) => {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                this.animTimelineProgress = Easing.easeOutQuart(progress);
                this.renderAccessTimeline();

                if (progress < 1) {
                    this.timelineAnimId = requestAnimationFrame(step);
                } else {
                    this.timelineAnimId = null;
                }
            };
            this.timelineAnimId = requestAnimationFrame(step);
        }

        animateDonut() {
            if (this.donutAnimId) cancelAnimationFrame(this.donutAnimId);
            const startTime = performance.now();
            const duration = 850;

            const step = (now) => {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                this.animDonutProgress = Easing.easeOutCubic(progress);
                this.renderSecurityDonut();

                if (progress < 1) {
                    this.donutAnimId = requestAnimationFrame(step);
                } else {
                    this.donutAnimId = null;
                }
            };
            this.donutAnimId = requestAnimationFrame(step);
        }

        animateGauge() {
            if (this.gaugeAnimId) cancelAnimationFrame(this.gaugeAnimId);
            const startTime = performance.now();
            const duration = 650;
            const metric = this.clusterMetrics[this.activeGaugeMetric];
            const startVal = metric.currentVal;
            const targetVal = metric.targetVal;

            const step = (now) => {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = Easing.easeOutCubic(progress);
                metric.currentVal = startVal + (targetVal - startVal) * eased;
                this.renderClusterGauge();

                if (progress < 1) {
                    this.gaugeAnimId = requestAnimationFrame(step);
                } else {
                    metric.currentVal = targetVal;
                    this.renderClusterGauge();
                    this.gaugeAnimId = null;
                }
            };
            this.gaugeAnimId = requestAnimationFrame(step);
        }

        // =========================================================================
        // 1. LINE & AREA CHART: 7-DAY LOGIN FREQUENCY
        // =========================================================================
        renderAccessTimeline() {
            const setup = this.getCanvasContext('accessChartCanvas');
            if (!setup) return;

            const { ctx, width, height } = setup;
            ctx.clearRect(0, 0, width, height);

            const padding = { top: 25, right: 30, bottom: 40, left: 45 };
            const plotW = width - padding.left - padding.right;
            const plotH = height - padding.top - padding.bottom;
            if (plotW <= 20 || plotH <= 20) return;

            const maxDataVal = Math.max(...this.accessData.map(d => d.count), 60);
            const maxY = Math.ceil(maxDataVal / 10) * 10;
            const baselineY = padding.top + plotH;

            // 1. Grid Lines and Y-Axis Labels
            const gridRows = 4;
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

            for (let i = 0; i <= gridRows; i++) {
                const ratio = i / gridRows;
                const y = padding.top + plotH * (1 - ratio);
                const val = Math.round(maxY * ratio);

                // Grid line
                ctx.beginPath();
                ctx.strokeStyle = i === 0 ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)';
                ctx.lineWidth = 1;
                ctx.setLineDash(i === 0 ? [] : [4, 4]);
                ctx.moveTo(padding.left, y);
                ctx.lineTo(width - padding.right, y);
                ctx.stroke();
                ctx.setLineDash([]);

                // Y label
                ctx.fillStyle = '#64748B';
                ctx.fillText(String(val), padding.left - 10, y);
            }

            // 2. Compute Points with Animation Progress
            const animProgress = this.animTimelineProgress;
            const points = this.accessData.map((d, i) => {
                const x = padding.left + (plotW / (this.accessData.length - 1)) * i;
                const targetY = baselineY - (d.count / maxY) * plotH;
                const currentY = baselineY - (baselineY - targetY) * animProgress;
                return { x, y: currentY, rawY: targetY, data: d, index: i };
            });

            // 3. Compute Smooth Cubic Bezier Curves (Catmull-Rom Spline to Bezier)
            const splinePoints = [];
            const tension = 0.18;
            for (let i = 0; i < points.length - 1; i++) {
                const p0 = i > 0 ? points[i - 1] : points[i];
                const p1 = points[i];
                const p2 = points[i + 1];
                const p3 = i + 2 < points.length ? points[i + 2] : p2;

                const cp1x = p1.x + (p2.x - p0.x) * tension;
                const cp1y = p1.y + (p2.y - p0.y) * tension;
                const cp2x = p2.x - (p3.x - p1.x) * tension;
                const cp2y = p2.y - (p3.y - p1.y) * tension;

                splinePoints.push({ cp1x, cp1y, cp2x, cp2y, endX: p2.x, endY: p2.y });
            }

            // 4. Draw Area Gradient under the Bezier Curve
            if (points.length > 1) {
                const areaGradient = ctx.createLinearGradient(0, padding.top, 0, baselineY);
                areaGradient.addColorStop(0, 'rgba(255, 0, 67, 0.42)');
                areaGradient.addColorStop(0.55, 'rgba(255, 0, 67, 0.12)');
                areaGradient.addColorStop(1, 'rgba(255, 0, 67, 0.00)');

                ctx.beginPath();
                ctx.moveTo(points[0].x, baselineY);
                ctx.lineTo(points[0].x, points[0].y);

                splinePoints.forEach(sp => {
                    ctx.bezierCurveTo(sp.cp1x, sp.cp1y, sp.cp2x, sp.cp2y, sp.endX, sp.endY);
                });

                ctx.lineTo(points[points.length - 1].x, baselineY);
                ctx.closePath();
                ctx.fillStyle = areaGradient;
                ctx.fill();
            }

            // 5. Draw Glowing Bezier Line Stroke
            if (points.length > 1) {
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                splinePoints.forEach(sp => {
                    ctx.bezierCurveTo(sp.cp1x, sp.cp1y, sp.cp2x, sp.cp2y, sp.endX, sp.endY);
                });

                ctx.strokeStyle = '#FF0043';
                ctx.lineWidth = 3;
                ctx.shadowColor = 'rgba(255, 0, 67, 0.75)';
                ctx.shadowBlur = 12;
                ctx.stroke();
                ctx.shadowBlur = 0;
            }

            // 6. Draw X-Axis Day Labels and Baseline Points
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';

            points.forEach((p, idx) => {
                const isHovered = (idx === this.hoveredAccessIndex);

                // X-Axis Day label
                ctx.font = isHovered ? 'bold 11px sans-serif' : '11px sans-serif';
                ctx.fillStyle = isHovered ? '#F8FAFC' : '#94A3B8';
                ctx.fillText(p.data.day, p.x, baselineY + 10);

                // Date sub-label
                ctx.font = '9px sans-serif';
                ctx.fillStyle = isHovered ? '#FF0043' : '#64748B';
                ctx.fillText(p.data.date, p.x, baselineY + 23);

                // Outer Halo on point
                ctx.beginPath();
                ctx.arc(p.x, p.y, isHovered ? 8 : 4.5, 0, Math.PI * 2);
                ctx.fillStyle = isHovered ? 'rgba(255, 0, 67, 0.35)' : 'rgba(255, 0, 67, 0.15)';
                ctx.fill();

                // Inner core dot
                ctx.beginPath();
                ctx.arc(p.x, p.y, isHovered ? 4.5 : 3, 0, Math.PI * 2);
                ctx.fillStyle = isHovered ? '#FFFFFF' : '#FF0043';
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 1.5;
                ctx.fill();
                ctx.stroke();
            });

            // 7. Interactive Hover Crosshair & Tooltip
            if (this.hoveredAccessIndex >= 0 && this.hoveredAccessIndex < points.length) {
                const p = points[this.hoveredAccessIndex];

                // Vertical Crosshair Guide Line
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
                ctx.lineWidth = 1;
                ctx.setLineDash([3, 3]);
                ctx.moveTo(p.x, padding.top);
                ctx.lineTo(p.x, baselineY);
                ctx.stroke();
                ctx.setLineDash([]);

                // Pulsing ring
                ctx.beginPath();
                ctx.arc(p.x, p.y, 11, 0, Math.PI * 2);
                ctx.strokeStyle = '#FF0043';
                ctx.lineWidth = 1.5;
                ctx.stroke();

                // Tooltip Card Geometry
                const tipW = 145;
                const tipH = 50;
                let tipX = p.x - tipW / 2;
                let tipY = p.y - tipH - 14;

                // Edge Clamping
                if (tipX < padding.left) tipX = padding.left;
                if (tipX + tipW > width - padding.right) tipX = width - padding.right - tipW;
                if (tipY < padding.top - 10) tipY = p.y + 14;

                // Tooltip Shadow and Box
                ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
                ctx.shadowBlur = 12;
                ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
                drawRoundRect(ctx, tipX, tipY, tipW, tipH, 8);
                ctx.fill();
                ctx.shadowBlur = 0;

                ctx.strokeStyle = 'rgba(255, 0, 67, 0.55)';
                ctx.lineWidth = 1;
                drawRoundRect(ctx, tipX, tipY, tipW, tipH, 8);
                ctx.stroke();

                // Tooltip Content
                ctx.textAlign = 'left';
                ctx.textBaseline = 'top';
                ctx.font = '10px sans-serif';
                ctx.fillStyle = '#94A3B8';
                ctx.fillText(`${p.data.label} (${p.data.date})`, tipX + 12, tipY + 9);

                // Indicator dot
                ctx.beginPath();
                ctx.arc(tipX + 15, tipY + 30, 4, 0, Math.PI * 2);
                ctx.fillStyle = '#FF0043';
                ctx.fill();

                ctx.font = 'bold 12px sans-serif';
                ctx.fillStyle = '#FFFFFF';
                ctx.fillText(`${p.data.count} acessos autenticados`, tipX + 25, tipY + 24);
            }
        }

        // =========================================================================
        // 2. DONUT CHART: SECURITY COMPLIANCE & VULNERABILITY BREAKDOWN
        // =========================================================================
        renderSecurityDonut() {
            const setup = this.getCanvasContext('securityDonutCanvas');
            if (!setup) return;

            const { ctx, width, height } = setup;
            ctx.clearRect(0, 0, width, height);

            const cx = width / 2;
            const legendHeight = 44;
            const cy = (height - legendHeight) / 2 + 6;
            const outerRadius = Math.min(cx - 20, cy - 14, 68);
            const innerRadius = outerRadius * 0.64;
            const gapAngle = 0.035;

            // Total Value and Normalized Slices
            const totalVal = this.securityData.reduce((sum, item) => sum + item.value, 0);
            const progress = this.animDonutProgress;
            const totalSweep = Math.PI * 2 * progress;

            let currentAngle = -Math.PI / 2;
            const renderedSlices = [];

            // 1. Draw Donut Slices
            this.securityData.forEach((slice, idx) => {
                const sliceRatio = slice.value / totalVal;
                const fullSliceAngle = sliceRatio * (Math.PI * 2);
                const actualSliceAngle = sliceRatio * totalSweep;
                const isHovered = (idx === this.hoveredDonutSlice);

                const startA = currentAngle + (actualSliceAngle > gapAngle ? gapAngle / 2 : 0);
                const endA = currentAngle + actualSliceAngle - (actualSliceAngle > gapAngle ? gapAngle / 2 : 0);

                const sliceOuterR = isHovered ? outerRadius + 5 : outerRadius;
                const sliceInnerR = isHovered ? innerRadius - 2 : innerRadius;

                if (endA > startA) {
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(cx, cy, sliceOuterR, startA, endA, false);
                    ctx.arc(cx, cy, sliceInnerR, endA, startA, true);
                    ctx.closePath();

                    if (isHovered) {
                        ctx.shadowColor = slice.color;
                        ctx.shadowBlur = 16;
                    }
                    ctx.fillStyle = slice.color;
                    ctx.fill();
                    ctx.restore();
                }

                renderedSlices.push({
                    index: idx,
                    slice,
                    startAngle: currentAngle,
                    endAngle: currentAngle + fullSliceAngle,
                    color: slice.color
                });

                currentAngle += actualSliceAngle;
            });

            // 2. Center Status / Score Readout
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            if (this.hoveredDonutSlice >= 0 && this.hoveredDonutSlice < this.securityData.length) {
                const hovered = this.securityData[this.hoveredDonutSlice];
                ctx.font = '10px sans-serif';
                ctx.fillStyle = hovered.color;
                ctx.fillText(hovered.label.substring(0, 14), cx, cy - 14);

                ctx.font = 'bold 20px sans-serif';
                ctx.fillStyle = '#FFFFFF';
                ctx.fillText(`${hovered.value}%`, cx, cy + 2);

                ctx.font = '9px sans-serif';
                ctx.fillStyle = '#94A3B8';
                ctx.fillText('Auditado OK', cx, cy + 16);
            } else {
                ctx.font = '9px sans-serif';
                ctx.fillStyle = '#94A3B8';
                ctx.fillText('COMPLIANCE', cx, cy - 13);

                ctx.font = 'bold 21px sans-serif';
                ctx.fillStyle = '#FFFFFF';
                ctx.fillText(`${this.complianceScore}%`, cx, cy + 3);

                ctx.font = 'bold 9px sans-serif';
                ctx.fillStyle = '#10B981';
                ctx.fillText('● AUDITADO A+', cx, cy + 18);
            }

            // 3. Compact Bottom Interactive Legend
            const legendY = height - legendHeight + 6;
            const colW = width / 2;

            this.securityData.forEach((slice, idx) => {
                const col = idx % 2;
                const row = Math.floor(idx / 2);
                const lx = col === 0 ? 12 : colW + 4;
                const ly = legendY + row * 18;
                const isHovered = (idx === this.hoveredDonutSlice);

                // Indicator dot
                ctx.beginPath();
                ctx.arc(lx + 6, ly + 5, isHovered ? 4.5 : 3.5, 0, Math.PI * 2);
                ctx.fillStyle = slice.color;
                ctx.fill();

                // Legend text
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                ctx.font = isHovered ? 'bold 10px sans-serif' : '10px sans-serif';
                ctx.fillStyle = isHovered ? '#FFFFFF' : '#CBD5E1';

                const truncatedName = slice.label.length > 13 ? slice.label.substring(0, 12) + '…' : slice.label;
                ctx.fillText(`${truncatedName} (${slice.value}%)`, lx + 15, ly + 5);
            });

            this.renderedDonutSlices = renderedSlices;
        }

        // =========================================================================
        // 3. SPEEDOMETER / RADIAL GAUGE CHART: SERVER & CLUSTER HEALTH
        // =========================================================================
        renderClusterGauge() {
            const setup = this.getCanvasContext('clusterHealthCanvas');
            if (!setup) return;

            const { ctx, width, height } = setup;
            ctx.clearRect(0, 0, width, height);

            const metric = this.clusterMetrics[this.activeGaugeMetric];
            const cx = width / 2;
            const bottomTabHeight = 40;
            const cy = (height - bottomTabHeight) * 0.56;
            const radius = Math.min(width * 0.38, (height - bottomTabHeight) * 0.55, 84);

            // Speedometer Arc: 140° (bottom-left) to 400° (bottom-right) => 260° sweep
            const startAngle = (140 * Math.PI) / 180;
            const endAngle = (400 * Math.PI) / 180;
            const totalSweep = endAngle - startAngle;

            // 1. Outer Dark Gauge Track
            ctx.beginPath();
            ctx.arc(cx, cy, radius, startAngle, endAngle);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.lineWidth = 14;
            ctx.lineCap = 'round';
            ctx.stroke();

            // 2. Colored Sectors (Green / Yellow / Red)
            const sectors = [
                { startRatio: 0.00, endRatio: 0.60, color: '#10B981', label: 'Seguro' },
                { startRatio: 0.60, endRatio: 0.85, color: '#F59E0B', label: 'Atenção' },
                { startRatio: 0.85, endRatio: 1.00, color: '#EF4444', label: 'Crítico' }
            ];

            sectors.forEach(sec => {
                const sAngle = startAngle + sec.startRatio * totalSweep;
                const eAngle = startAngle + sec.endRatio * totalSweep;

                ctx.beginPath();
                ctx.arc(cx, cy, radius, sAngle, eAngle);
                ctx.strokeStyle = sec.color;
                ctx.lineWidth = 6;
                ctx.lineCap = 'butt';
                ctx.stroke();
            });

            // 3. Tick Marks & Scale Annotations
            const tickCount = 10;
            for (let i = 0; i <= tickCount; i++) {
                const ratio = i / tickCount;
                const angle = startAngle + ratio * totalSweep;
                const isMajor = i % 2 === 0;
                const rInner = radius - (isMajor ? 13 : 9);
                const rOuter = radius - 4;

                const x1 = cx + Math.cos(angle) * rInner;
                const y1 = cy + Math.sin(angle) * rInner;
                const x2 = cx + Math.cos(angle) * rOuter;
                const y2 = cy + Math.sin(angle) * rOuter;

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.strokeStyle = isMajor ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.15)';
                ctx.lineWidth = isMajor ? 1.5 : 1;
                ctx.stroke();
            }

            // 4. Active Progress Arc with Luminous Glow
            const clampedVal = Math.max(metric.min, Math.min(metric.currentVal, metric.max));
            const valRatio = (clampedVal - metric.min) / (metric.max - metric.min);
            const activeAngle = startAngle + valRatio * totalSweep;

            let activeColor = '#10B981';
            if (valRatio > 0.85) activeColor = '#EF4444';
            else if (valRatio > 0.60) activeColor = '#F59E0B';

            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, radius, startAngle, activeAngle);
            ctx.strokeStyle = activeColor;
            ctx.lineWidth = 14;
            ctx.lineCap = 'round';
            ctx.shadowColor = activeColor;
            ctx.shadowBlur = 14;
            ctx.stroke();
            ctx.restore();

            // 5. Tapered Needle with Glow & Damped Physics
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(activeAngle);

            // Needle shadow
            ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.moveTo(-10, -3);
            ctx.lineTo(radius - 12, 0);
            ctx.lineTo(-10, 3);
            ctx.closePath();
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();

            // Colored needle top
            ctx.beginPath();
            ctx.moveTo(-6, -2);
            ctx.lineTo(radius - 12, 0);
            ctx.lineTo(-6, 2);
            ctx.closePath();
            ctx.fillStyle = activeColor;
            ctx.fill();
            ctx.restore();

            // Pivot Center Hub
            ctx.beginPath();
            ctx.arc(cx, cy, 8, 0, Math.PI * 2);
            ctx.fillStyle = '#1E293B';
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 2;
            ctx.fill();
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
            ctx.fillStyle = activeColor;
            ctx.fill();

            // 6. Digital Telemetry Readout
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Value + Unit
            ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(`${Math.round(clampedVal)} ${metric.unit}`, cx, cy + 30);

            // Metric Name & Status
            ctx.font = '11px sans-serif';
            ctx.fillStyle = activeColor;
            let statusText = '● Status: Estável';
            if (valRatio > 0.85) statusText = '▲ Alerta: Carga Alta';
            else if (valRatio > 0.60) statusText = '◆ Atenção: Carga Moderada';
            ctx.fillText(statusText, cx, cy + 48);

            ctx.font = '10px sans-serif';
            ctx.fillStyle = '#94A3B8';
            ctx.fillText(metric.detail, cx, cy + 63);

            // 7. Render Metric Tabs at Bottom of Canvas
            this.renderGaugeBottomTabs(ctx, width, height, bottomTabHeight);
        }

        renderGaugeBottomTabs(ctx, width, height, tabHeight) {
            const keys = ['cpu', 'memory', 'latency'];
            const labels = [
                { key: 'cpu', title: 'CPU', val: `${Math.round(this.clusterMetrics.cpu.currentVal)}%` },
                { key: 'memory', title: 'Memória', val: `${Math.round(this.clusterMetrics.memory.currentVal)}%` },
                { key: 'latency', title: 'Latência', val: `${Math.round(this.clusterMetrics.latency.currentVal)}ms` }
            ];

            const tabY = height - tabHeight + 4;
            const tabW = Math.min((width - 32) / 3, 130);
            const totalW = tabW * 3 + 16;
            const startX = (width - totalW) / 2;

            this.renderedGaugeTabs = [];

            labels.forEach((item, idx) => {
                const tx = startX + idx * (tabW + 8);
                const isActive = (this.activeGaugeMetric === item.key);
                const isHovered = (this.hoveredGaugeTab === item.key);

                // Tab background
                ctx.fillStyle = isActive ? 'rgba(255, 0, 67, 0.22)' : (isHovered ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)');
                drawRoundRect(ctx, tx, tabY, tabW, 28, 6);
                ctx.fill();

                // Tab border
                ctx.strokeStyle = isActive ? '#FF0043' : (isHovered ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.07)');
                ctx.lineWidth = 1;
                drawRoundRect(ctx, tx, tabY, tabW, 28, 6);
                ctx.stroke();

                // Tab text
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = isActive ? 'bold 11px sans-serif' : '11px sans-serif';
                ctx.fillStyle = isActive ? '#FFFFFF' : '#94A3B8';
                ctx.fillText(`${item.title}: ${item.val}`, tx + tabW / 2, tabY + 14);

                this.renderedGaugeTabs.push({
                    key: item.key,
                    x: tx,
                    y: tabY,
                    w: tabW,
                    h: 28
                });
            });
        }

        // =========================================================================
        // 4. INTERACTION & TELEMETRY SIMULATION
        // =========================================================================
        setGaugeMetric(metricKey) {
            if (!this.clusterMetrics[metricKey] || this.activeGaugeMetric === metricKey) return;
            this.activeGaugeMetric = metricKey;

            // Sync with optional DOM buttons
            document.querySelectorAll('#gauge-metric-selectors button').forEach(btn => {
                if (btn.getAttribute('data-metric') === metricKey) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            this.animateGauge();
        }

        startTelemetrySimulation() {
            if (this.telemetryIntervalId) clearInterval(this.telemetryIntervalId);

            // Periodic smooth fluctuations simulating real server cluster loads
            this.telemetryIntervalId = setInterval(() => {
                // CPU: random subtle drift between 30% and 42%
                const cpuTarget = Math.round(34 + (Math.random() - 0.5) * 12);
                this.clusterMetrics.cpu.targetVal = Math.max(10, Math.min(cpuTarget, 95));

                // RAM: slow variance between 50% and 55%
                const ramTarget = Math.round(52 + (Math.random() - 0.5) * 4);
                this.clusterMetrics.memory.targetVal = Math.max(20, Math.min(ramTarget, 90));

                // Latency: ping jitter between 18ms and 28ms
                const latencyTarget = Math.round(23 + (Math.random() - 0.5) * 8);
                this.clusterMetrics.latency.targetVal = Math.max(8, Math.min(latencyTarget, 80));

                // Smoothly animate active metric
                this.animateGauge();
            }, 3800);
        }

        attachEventListeners() {
            // 1. Line Chart Hover Tracking
            const accessCanvas = document.getElementById('accessChartCanvas');
            if (accessCanvas) {
                const onAccessMove = (evt) => {
                    const coords = this.getCanvasRelativeCoords(accessCanvas, evt);
                    const rect = accessCanvas.getBoundingClientRect();
                    const width = rect.width;
                    const paddingLeft = 45;
                    const paddingRight = 30;
                    const plotW = width - paddingLeft - paddingRight;

                    let closestIdx = -1;
                    let minDiff = Infinity;

                    this.accessData.forEach((d, idx) => {
                        const px = paddingLeft + (plotW / (this.accessData.length - 1)) * idx;
                        const diff = Math.abs(coords.x - px);
                        if (diff < minDiff && diff < (plotW / (this.accessData.length - 1)) * 0.65) {
                            minDiff = diff;
                            closestIdx = idx;
                        }
                    });

                    if (closestIdx !== this.hoveredAccessIndex) {
                        this.hoveredAccessIndex = closestIdx;
                        this.renderAccessTimeline();
                    }
                };

                const onAccessLeave = () => {
                    if (this.hoveredAccessIndex !== -1) {
                        this.hoveredAccessIndex = -1;
                        this.renderAccessTimeline();
                    }
                };

                accessCanvas.addEventListener('mousemove', onAccessMove);
                accessCanvas.addEventListener('mouseleave', onAccessLeave);
                accessCanvas.addEventListener('touchstart', onAccessMove, { passive: true });
                accessCanvas.addEventListener('touchmove', onAccessMove, { passive: true });
                accessCanvas.addEventListener('touchend', onAccessLeave);
            }

            // 2. Donut Chart Hover Tracking
            const donutCanvas = document.getElementById('securityDonutCanvas');
            if (donutCanvas) {
                const onDonutMove = (evt) => {
                    const coords = this.getCanvasRelativeCoords(donutCanvas, evt);
                    const rect = donutCanvas.getBoundingClientRect();
                    const cx = rect.width / 2;
                    const cy = (rect.height - 44) / 2 + 6;
                    const outerRadius = Math.min(cx - 20, cy - 14, 68);
                    const innerRadius = outerRadius * 0.64;

                    const dx = coords.x - cx;
                    const dy = coords.y - cy;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    let hoveredSlice = -1;
                    if (dist >= innerRadius - 4 && dist <= outerRadius + 8) {
                        let angle = Math.atan2(dy, dx);
                        if (angle < -Math.PI / 2) angle += Math.PI * 2;

                        if (this.renderedDonutSlices) {
                            for (const s of this.renderedDonutSlices) {
                                if (angle >= s.startAngle && angle <= s.endAngle) {
                                    hoveredSlice = s.index;
                                    break;
                                }
                            }
                        }
                    }

                    if (hoveredSlice !== this.hoveredDonutSlice) {
                        this.hoveredDonutSlice = hoveredSlice;
                        this.renderSecurityDonut();
                    }
                };

                const onDonutLeave = () => {
                    if (this.hoveredDonutSlice !== -1) {
                        this.hoveredDonutSlice = -1;
                        this.renderSecurityDonut();
                    }
                };

                donutCanvas.addEventListener('mousemove', onDonutMove);
                donutCanvas.addEventListener('mouseleave', onDonutLeave);
                donutCanvas.addEventListener('touchstart', onDonutMove, { passive: true });
                donutCanvas.addEventListener('touchmove', onDonutMove, { passive: true });
                donutCanvas.addEventListener('touchend', onDonutLeave);
            }

            // 3. Cluster Gauge Click & Hover on Canvas Bottom Tabs
            const gaugeCanvas = document.getElementById('clusterHealthCanvas');
            if (gaugeCanvas) {
                const onGaugeClick = (evt) => {
                    const coords = this.getCanvasRelativeCoords(gaugeCanvas, evt);
                    if (this.renderedGaugeTabs) {
                        for (const tab of this.renderedGaugeTabs) {
                            if (coords.x >= tab.x && coords.x <= tab.x + tab.w &&
                                coords.y >= tab.y && coords.y <= tab.y + tab.h) {
                                this.setGaugeMetric(tab.key);
                                break;
                            }
                        }
                    }
                };

                const onGaugeMove = (evt) => {
                    const coords = this.getCanvasRelativeCoords(gaugeCanvas, evt);
                    let foundTab = null;
                    if (this.renderedGaugeTabs) {
                        for (const tab of this.renderedGaugeTabs) {
                            if (coords.x >= tab.x && coords.x <= tab.x + tab.w &&
                                coords.y >= tab.y && coords.y <= tab.y + tab.h) {
                                foundTab = tab.key;
                                break;
                            }
                        }
                    }
                    if (foundTab !== this.hoveredGaugeTab) {
                        this.hoveredGaugeTab = foundTab;
                        gaugeCanvas.style.cursor = foundTab ? 'pointer' : 'default';
                        this.renderClusterGauge();
                    }
                };

                const onGaugeLeave = () => {
                    if (this.hoveredGaugeTab !== null) {
                        this.hoveredGaugeTab = null;
                        gaugeCanvas.style.cursor = 'default';
                        this.renderClusterGauge();
                    }
                };

                gaugeCanvas.addEventListener('click', onGaugeClick);
                gaugeCanvas.addEventListener('mousemove', onGaugeMove);
                gaugeCanvas.addEventListener('mouseleave', onGaugeLeave);
            }

            // 4. Hook Optional DOM Metric Buttons
            document.querySelectorAll('#gauge-metric-selectors button').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const metricKey = e.currentTarget.getAttribute('data-metric');
                    if (metricKey) this.setGaugeMetric(metricKey);
                });
            });

            // 5. Window Resize Listener
            window.addEventListener('resize', this.boundResizeHandler);

            // 6. ResizeObserver for parent containers
            if (typeof ResizeObserver === 'function') {
                this.resizeObserver = new ResizeObserver(() => {
                    this.handleResize();
                });
                ['accessChartCanvas', 'securityDonutCanvas', 'clusterHealthCanvas'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el && el.parentElement) {
                        this.resizeObserver.observe(el.parentElement);
                    }
                });
            }
        }

        handleResize() {
            clearTimeout(this.resizeDebounceTimer);
            this.resizeDebounceTimer = setTimeout(() => {
                this.renderAll();
            }, 80);
        }

        renderAll() {
            this.renderAccessTimeline();
            this.renderSecurityDonut();
            this.renderClusterGauge();
        }

        destroy() {
            if (this.timelineAnimId) cancelAnimationFrame(this.timelineAnimId);
            if (this.donutAnimId) cancelAnimationFrame(this.donutAnimId);
            if (this.gaugeAnimId) cancelAnimationFrame(this.gaugeAnimId);
            if (this.telemetryIntervalId) clearInterval(this.telemetryIntervalId);
            clearTimeout(this.resizeDebounceTimer);

            window.removeEventListener('resize', this.boundResizeHandler);
            if (this.resizeObserver) {
                this.resizeObserver.disconnect();
            }
        }
    }

    // Expose globally on window
    window.DashboardCharts = DashboardCharts;
    window.dashboardCharts = new DashboardCharts();
})();
