/**
 * dashboard-charts.js - Pure HTML5 Canvas Analytics & Security Visualizer
 * Renders interactive charts on dashboard.html:
 * - 7-Day Access Timeline (Line/Area Chart with Glow)
 * - Security Protocol Breakdown (Donut Chart)
 */
(function() {
    'use strict';

    class DashboardCharts {
        constructor() {
            this.init();
        }

        init() {
            window.addEventListener('DOMContentLoaded', () => {
                this.renderAccessTimeline();
                this.renderSecurityDonut();
            });
        }

        renderAccessTimeline() {
            const canvas = document.getElementById('accessChartCanvas');
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            
            canvas.width = (rect.width || 450) * dpr;
            canvas.height = 200 * dpr;
            ctx.scale(dpr, dpr);

            const width = rect.width || 450;
            const height = 200;
            const data = [12, 19, 15, 25, 22, 30, 42];
            const labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

            const padding = 35;
            const chartW = width - padding * 2;
            const chartH = height - padding * 2;
            const maxVal = 50;

            // Grid lines
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.lineWidth = 1;
            for (let i = 0; i <= 4; i++) {
                const y = padding + (chartH / 4) * i;
                ctx.beginPath();
                ctx.moveTo(padding, y);
                ctx.lineTo(width - padding, y);
                ctx.stroke();
            }

            // Area Gradient
            const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
            gradient.addColorStop(0, 'rgba(255, 0, 67, 0.35)');
            gradient.addColorStop(1, 'rgba(255, 0, 67, 0.0)');

            // Path calculation
            const points = data.map((val, idx) => {
                const x = padding + (chartW / (data.length - 1)) * idx;
                const y = height - padding - (val / maxVal) * chartH;
                return { x, y };
            });

            // Draw Area
            ctx.beginPath();
            ctx.moveTo(points[0].x, height - padding);
            points.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.lineTo(points[points.length - 1].x, height - padding);
            ctx.closePath();
            ctx.fillStyle = gradient;
            ctx.fill();

            // Draw Stroke Line with Glow
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            points.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.strokeStyle = '#FF0043';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#FF0043';
            ctx.shadowBlur = 10;
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Draw Points & Labels
            points.forEach((p, idx) => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
                ctx.fillStyle = '#FFF';
                ctx.fill();

                ctx.fillStyle = '#A1A1AA';
                ctx.font = '11px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(labels[idx], p.x, height - 12);
            });
        }

        renderSecurityDonut() {
            const canvas = document.getElementById('securityDonutCanvas');
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();

            canvas.width = (rect.width || 250) * dpr;
            canvas.height = 200 * dpr;
            ctx.scale(dpr, dpr);

            const width = rect.width || 250;
            const height = 200;
            const cx = width / 2;
            const cy = height / 2;
            const radius = 60;
            const lineWidth = 16;

            const segments = [
                { val: 65, color: '#FF0043' },  // JWT & SHA-256
                { val: 25, color: '#3B82F6' },  // Brute-force & XSS
                { val: 10, color: '#10B981' }   // ViaCEP / SSL
            ];

            let startAngle = -Math.PI / 2;

            segments.forEach(seg => {
                const sliceAngle = (seg.val / 100) * (Math.PI * 2);
                ctx.beginPath();
                ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
                ctx.strokeStyle = seg.color;
                ctx.lineWidth = lineWidth;
                ctx.stroke();
                startAngle += sliceAngle;
            });

            // Center Text
            ctx.fillStyle = '#FFF';
            ctx.font = 'bold 20px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('99.8%', cx, cy - 6);

            ctx.font = '10px sans-serif';
            ctx.fillStyle = '#A1A1AA';
            ctx.fillText('Segurança', cx, cy + 14);
        }
    }

    window.dashboardCharts = new DashboardCharts();
})();
