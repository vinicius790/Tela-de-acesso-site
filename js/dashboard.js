/**
 * dashboard.js - Enterprise User Management & Session Portal Specialist
 * Features:
 * 1. Authentication Guard & Session State Management
 * 2. Enterprise User Management CRUD (Data Table, Real-time Search, Filters, Client-side Pagination)
 * 3. Add & Edit User Modals with strict CPF, Email, and Phone Validations
 * 4. User Activity Audit Log Timeline with dynamic event streaming
 * 5. Profile Drawer (Offcanvas) with HTML5 Canvas Circular Avatar Crop & Base64 storage
 * 6. CSV Data Export & KPI Metrics Calculation
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // ==========================================
    // 1. PROTEÇÃO DE ROTA & AUTENTICAÇÃO
    // ==========================================
    const token = localStorage.getItem('auth_token') || localStorage.getItem('mock_auth_session');
    if (!token) {
        if (window.Swal) {
            Swal.fire({
                title: 'Acesso Restrito',
                text: 'Por favor, realize o login para acessar o painel corporativo.',
                icon: 'warning',
                timer: 2000,
                showConfirmButton: false,
                background: '#0F172A',
                color: '#FFF'
            }).then(() => {
                window.location.href = 'index.html';
            });
        } else {
            window.location.href = 'index.html';
        }
        return;
    }

    // Recupera dados do usuário da sessão
    let currentUserData = {};
    try {
        currentUserData = JSON.parse(localStorage.getItem('user_data')) || 
                          JSON.parse(localStorage.getItem('mock_auth_session'))?.user || {};
    } catch (e) {
        currentUserData = {};
    }

    const currentUsername = currentUserData.username || currentUserData.name || 'Son Goku';
    const currentEmail = currentUserData.email || 'goku@capsulecorp.com.br';
    const currentRawCpf = currentUserData.cpf || '11144477735';
    const currentRole = currentUserData.role || 'Admin';

    // ==========================================
    // 2. UTILITÁRIOS: MÁSCARAS & VALIDAÇÃO
    // ==========================================
    function maskCPF(cpf) {
        if (!cpf) return '000.***.***-00';
        const cleaned = cpf.replace(/\D/g, '');
        if (cleaned.length === 11) {
            return cleaned.substring(0, 3) + '.***.***-' + cleaned.substring(9, 11);
        }
        return cpf;
    }

    function formatCPF(cpf) {
        const cleaned = (cpf || '').replace(/\D/g, '');
        return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    function formatPhone(phone) {
        let v = (phone || '').replace(/\D/g, '');
        if (v.length > 11) v = v.substring(0, 11);
        if (v.length > 10) {
            return v.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (v.length > 6) {
            return v.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
        } else if (v.length > 2) {
            return v.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
        }
        return v;
    }

    function validateEmail(email) {
        if (window.Validators && typeof window.Validators.validateEmail === 'function') {
            return window.Validators.validateEmail(email);
        }
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    function validateCPF(cpf) {
        if (window.Validators && typeof window.Validators.validateCPF === 'function') {
            return window.Validators.validateCPF(cpf);
        }
        const clean = (cpf || '').replace(/\D/g, '');
        if (clean.length !== 11 || /^(\d)\1+$/.test(clean)) return false;
        let sum = 0, rev;
        for (let i = 0; i < 9; i++) sum += parseInt(clean.charAt(i), 10) * (10 - i);
        rev = 11 - (sum % 11);
        if (rev === 10 || rev === 11) rev = 0;
        if (rev !== parseInt(clean.charAt(9), 10)) return false;
        sum = 0;
        for (let i = 0; i < 10; i++) sum += parseInt(clean.charAt(i), 10) * (11 - i);
        rev = 11 - (sum % 11);
        if (rev === 10 || rev === 11) rev = 0;
        if (rev !== parseInt(clean.charAt(10), 10)) return false;
        return true;
    }

    // ==========================================
    // 3. SEEDING & GERENCIAMENTO DE USUÁRIOS
    // ==========================================
    const USERS_STORAGE_KEY = 'mock_auth_users';

    function getStoredUsers() {
        try {
            const raw = localStorage.getItem(USERS_STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    function saveStoredUsers(users) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        updateKpiMetrics();
    }

    function initUsersSeed() {
        let users = getStoredUsers();
        if (!users || users.length < 3) {
            const seedUsers = [
                {
                    id: 'usr_goku',
                    name: 'Son Goku',
                    username: 'goku.saiyan',
                    email: 'goku@capsulecorp.com.br',
                    role: 'Admin',
                    cpf: '11144477735',
                    phone: '(11) 98888-7777',
                    status: 'Ativo',
                    avatar: null,
                    createdAt: '2026-01-15T09:30:00Z'
                },
                {
                    id: 'usr_vegeta',
                    name: 'Vegeta Prince',
                    username: 'vegeta.prince',
                    email: 'vegeta@saiyan.org',
                    role: 'Operador',
                    cpf: '52998224725',
                    phone: '(11) 97777-6666',
                    status: 'Ativo',
                    avatar: null,
                    createdAt: '2026-02-01T14:20:00Z'
                },
                {
                    id: 'usr_bulma',
                    name: 'Bulma Briefs',
                    username: 'bulma.briefs',
                    email: 'bulma@capsulecorp.com.br',
                    role: 'Auditor',
                    cpf: '00000000191',
                    phone: '(11) 99999-0000',
                    status: 'Ativo',
                    avatar: null,
                    createdAt: '2026-02-18T11:15:00Z'
                },
                {
                    id: 'usr_gohan',
                    name: 'Gohan Son',
                    username: 'gohan.scholar',
                    email: 'gohan@estudos.edu.br',
                    role: 'Usuário',
                    cpf: '22233344455',
                    phone: '(11) 96666-5555',
                    status: 'Ativo',
                    avatar: null,
                    createdAt: '2026-03-10T08:45:00Z'
                },
                {
                    id: 'usr_piccolo',
                    name: 'Piccolo Namek',
                    username: 'piccolo.kami',
                    email: 'piccolo@kami.com',
                    role: 'Usuário',
                    cpf: '77788899900',
                    phone: '(11) 95555-4444',
                    status: 'Bloqueado',
                    avatar: null,
                    createdAt: '2026-03-22T16:10:00Z'
                },
                {
                    id: 'usr_trunks',
                    name: 'Trunks Briefs',
                    username: 'trunks.future',
                    email: 'trunks@future.corp',
                    role: 'Operador',
                    cpf: '44455566677',
                    phone: '(11) 94444-3333',
                    status: 'Ativo',
                    avatar: null,
                    createdAt: '2026-04-05T10:00:00Z'
                }
            ];

            // Garante que o usuário logado está na lista
            const hasCurrentUser = seedUsers.some(u => u.email === currentEmail || u.username === currentUsername);
            if (!hasCurrentUser) {
                seedUsers.unshift({
                    id: 'usr_' + Date.now(),
                    name: currentUsername,
                    username: currentUsername.toLowerCase().replace(/\s+/g, '.'),
                    email: currentEmail,
                    role: currentRole,
                    cpf: currentRawCpf.replace(/\D/g, ''),
                    phone: currentUserData.phone || '(11) 99999-8888',
                    status: 'Ativo',
                    avatar: localStorage.getItem('user_avatar_base64') || null,
                    createdAt: new Date().toISOString()
                });
            }

            saveStoredUsers(seedUsers);
        }
    }
    initUsersSeed();

    // ==========================================
    // 4. TRILHA DE AUDITORIA (AUDIT LOG TIMELINE)
    // ==========================================
    const AUDIT_STORAGE_KEY = 'portal_audit_logs';

    function getAuditLogs() {
        try {
            const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    function saveAuditLogs(logs) {
        localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logs.slice(0, 100)));
        updateKpiMetrics();
    }

    function initAuditSeed() {
        const existing = getAuditLogs();
        if (!existing || existing.length === 0) {
            const initialLogs = [
                {
                    id: 'log_1',
                    action: 'Sessão iniciada com sucesso',
                    description: 'Autenticação via WebCrypt SHA-256 e emissão de JWT Bearer',
                    type: 'login',
                    user: currentUsername,
                    ip: '189.40.122.15',
                    timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString()
                },
                {
                    id: 'log_2',
                    action: 'Tentativa de acesso não autorizada',
                    description: 'Tentativa com falha: credencial inexistente no RBAC',
                    type: 'falha',
                    user: 'desconhecido@ip.br',
                    ip: '201.82.90.4',
                    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString()
                },
                {
                    id: 'log_3',
                    action: 'Alteração cadastral de perfil',
                    description: 'Telefone de contato e dados cadastrais atualizados',
                    type: 'alteracao',
                    user: 'Son Goku',
                    ip: '189.40.122.15',
                    timestamp: new Date(Date.now() - 65 * 60 * 1000).toISOString()
                },
                {
                    id: 'log_4',
                    action: 'Exportação de dados de auditoria',
                    description: 'Arquivo JSON de conformidade e integridade criptográfica exportado',
                    type: 'exportacao',
                    user: 'Bulma Briefs',
                    ip: '177.105.12.8',
                    timestamp: new Date(Date.now() - 140 * 60 * 1000).toISOString()
                },
                {
                    id: 'log_5',
                    action: 'Novo usuário corporativo criado',
                    description: 'Usuário Trunks Briefs cadastrado com perfil Operador',
                    type: 'cadastro',
                    user: 'Son Goku',
                    ip: '189.40.122.15',
                    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
                }
            ];
            saveAuditLogs(initialLogs);
        }
    }
    initAuditSeed();

    function logAuditEvent(action, description, type = 'alteracao', user = currentUsername) {
        const logs = getAuditLogs();
        const newLog = {
            id: 'log_' + Date.now(),
            action,
            description,
            type,
            user,
            ip: '189.40.122.' + (Math.floor(Math.random() * 80) + 10),
            timestamp: new Date().toISOString()
        };
        logs.unshift(newLog);
        saveAuditLogs(logs);
        renderAuditTimeline();
    }

    // Helper de formatação de data relativa
    function formatTimeAgo(isoString) {
        const date = new Date(isoString);
        const diffMs = Date.now() - date.getTime();
        const diffMinutes = Math.floor(diffMs / 60000);
        if (diffMinutes < 1) return 'Agora mesmo';
        if (diffMinutes < 60) return `Há ${diffMinutes} min`;
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) return `Há ${diffHours} h`;
        const diffDays = Math.floor(diffHours / 24);
        return `Há ${diffDays} d`;
    }

    let activeAuditFilter = 'all';

    function renderAuditTimeline() {
        const container = document.getElementById('auditTimelineStream');
        if (!container) return;

        let logs = getAuditLogs();
        if (activeAuditFilter !== 'all') {
            logs = logs.filter(log => log.type === activeAuditFilter);
        }

        if (logs.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4 text-muted small">
                    <i class="fas fa-history fa-2x mb-2 d-block"></i>
                    Nenhum evento registrado nesta categoria.
                </div>
            `;
            return;
        }

        const icons = {
            login: { icon: 'fa-sign-in-alt', bg: 'bg-success', border: '#10B981' },
            falha: { icon: 'fa-exclamation-triangle', bg: 'bg-danger', border: '#EF4444' },
            cadastro: { icon: 'fa-user-plus', bg: 'bg-info', border: '#00F0FF' },
            alteracao: { icon: 'fa-user-edit', bg: 'bg-warning text-dark', border: '#F59E0B' },
            bloqueio: { icon: 'fa-user-lock', bg: 'bg-danger', border: '#DC2626' },
            exportacao: { icon: 'fa-file-export', bg: 'bg-primary', border: '#3B82F6' }
        };

        let html = '';
        logs.forEach(log => {
            const config = icons[log.type] || icons.alteracao;
            const fullDate = new Date(log.timestamp).toLocaleString('pt-BR');
            html += `
                <div class="timeline-item">
                    <div class="timeline-badge ${config.bg}" style="border: 1px solid ${config.border}">
                        <i class="fas ${config.icon}"></i>
                    </div>
                    <div class="timeline-content">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <span class="text-white font-weight-bold small">${log.action}</span>
                            <span class="text-muted small" style="font-size: 0.72rem;" title="${fullDate}">
                                <i class="far fa-clock mr-1"></i>${formatTimeAgo(log.timestamp)}
                            </span>
                        </div>
                        <p class="text-muted small mb-1" style="font-size: 0.8rem;">${log.description}</p>
                        <div class="d-flex justify-content-between align-items-center" style="font-size: 0.72rem;">
                            <span class="text-info"><i class="fas fa-user-circle mr-1"></i>${log.user}</span>
                            <span class="text-muted"><i class="fas fa-network-wired mr-1"></i>IP ${log.ip}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    }

    // Filtros de Auditoria
    document.querySelectorAll('.audit-filter-pill').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.audit-filter-pill').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            activeAuditFilter = e.currentTarget.getAttribute('data-type');
            renderAuditTimeline();
        });
    });

    // Limpar logs
    document.getElementById('btnClearAuditLogs')?.addEventListener('click', () => {
        if (window.Swal) {
            Swal.fire({
                title: 'Limpar Trilha de Auditoria?',
                text: 'Os eventos salvos no navegador serão removidos.',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#FF0043',
                cancelButtonColor: '#334155',
                confirmButtonText: 'Sim, limpar',
                cancelButtonText: 'Cancelar',
                background: '#0F172A',
                color: '#FFF'
            }).then((res) => {
                if (res.isConfirmed) {
                    saveAuditLogs([]);
                    renderAuditTimeline();
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'info',
                        title: 'Logs limpos com sucesso!',
                        showConfirmButton: false,
                        timer: 1800,
                        background: '#0F172A',
                        color: '#FFF'
                    });
                }
            });
        }
    });

    // Exportar logs via Blob API
    document.getElementById('btnExportAuditLog')?.addEventListener('click', () => {
        const logs = getAuditLogs();
        if (window.exportService && typeof window.exportService.exportAuditLogsJSON === 'function') {
            window.exportService.exportAuditLogsJSON(logs);
        } else {
            const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const dl = document.createElement('a');
            dl.href = url;
            dl.download = `trilha_auditoria_${Date.now()}.json`;
            document.body.appendChild(dl);
            dl.click();
            setTimeout(() => { dl.remove(); URL.revokeObjectURL(url); }, 200);
        }
        logAuditEvent('Exportação de trilha de auditoria (JSON)', 'Download do histórico completo de eventos via Blob API', 'exportacao');
    });

    // ==========================================
    // 5. ATUALIZAÇÃO DOS CARDS DE MÉTRICAS (KPIS)
    // ==========================================
    function updateKpiMetrics() {
        const users = getStoredUsers();
        const total = users.length;
        const active = users.filter(u => u.status === 'Ativo').length;
        const blocked = users.filter(u => u.status === 'Bloqueado').length;

        const totalEl = document.getElementById('stat-total-users');
        if (totalEl) totalEl.textContent = total;

        const activeBadge = document.getElementById('stat-active-users-badge');
        if (activeBadge) activeBadge.innerHTML = `<i class="fas fa-check-circle mr-1"></i>${active} Ativo${active !== 1 ? 's' : ''}`;

        const blockedBadge = document.getElementById('stat-blocked-users-badge');
        if (blockedBadge) blockedBadge.innerHTML = `<i class="fas fa-ban mr-1"></i>${blocked} Bloqueado${blocked !== 1 ? 's' : ''}`;

        const logs = getAuditLogs();
        const auditCountEl = document.getElementById('stat-audit-events-count');
        if (auditCountEl) auditCountEl.textContent = logs.length;
    }

    // ==========================================
    // 6. AVATAR, UPLOAD & HTML5 CANVAS CIRCULAR CROP
    // ==========================================
    function applyUserAvatar(avatarUrlOrBase64, name = currentUsername) {
        const firstLetter = ((name || 'U').charAt(0) || 'U').toUpperCase();

        // 1. Mini avatar do Topbar
        const miniEl = document.getElementById('user-avatar-mini');
        if (miniEl) {
            if (avatarUrlOrBase64) {
                miniEl.innerHTML = `<img src="${avatarUrlOrBase64}" alt="Avatar" />`;
            } else {
                miniEl.textContent = firstLetter;
            }
        }

        // 2. Avatar grande no Drawer
        const drawerDisplay = document.getElementById('drawer-avatar-display');
        if (drawerDisplay) {
            if (avatarUrlOrBase64) {
                drawerDisplay.innerHTML = `<img src="${avatarUrlOrBase64}" alt="Avatar" />`;
            } else {
                drawerDisplay.innerHTML = `<span id="drawer-avatar-letter">${firstLetter}</span>`;
            }
        }
    }

    // Processador de Imagem: Recorte Circular via Canvas
    function cropImageToCircleBase64(imageFile, callback) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.onload = function () {
                const canvas = document.getElementById('avatarCropCanvas') || document.createElement('canvas');
                canvas.width = 160;
                canvas.height = 160;
                const ctx = canvas.getContext('2d');

                // Dimensão de recorte quadrado centralizado
                const minSide = Math.min(img.width, img.height);
                const sx = (img.width - minSide) / 2;
                const sy = (img.height - minSide) / 2;

                // Desenha máscara circular
                ctx.clearRect(0, 0, 160, 160);
                ctx.save();
                ctx.beginPath();
                ctx.arc(80, 80, 78, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();

                // Desenha imagem quadrada centralizada
                ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, 160, 160);
                ctx.restore();

                // Adiciona sutil borda neon
                ctx.beginPath();
                ctx.arc(80, 80, 78, 0, Math.PI * 2);
                ctx.lineWidth = 4;
                ctx.strokeStyle = '#FF0043';
                ctx.stroke();

                const base64Circle = canvas.toDataURL('image/png', 0.92);
                callback(base64Circle);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(imageFile);
    }

    // Disparadores de upload de Avatar
    const avatarInput = document.getElementById('avatarFileInput');
    const btnTriggerUpload = document.getElementById('btnTriggerAvatarUpload');
    const avatarWrapper = document.getElementById('drawerAvatarWrapper');

    function triggerFileSelect() {
        if (avatarInput) avatarInput.click();
    }

    if (btnTriggerUpload) btnTriggerUpload.addEventListener('click', triggerFileSelect);
    if (avatarWrapper) avatarWrapper.addEventListener('click', triggerFileSelect);

    if (avatarInput) {
        avatarInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (!file.type.startsWith('image/')) {
                if (window.Swal) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Arquivo Inválido',
                        text: 'Por favor, selecione um arquivo de imagem (PNG, JPG, WEBP).',
                        confirmButtonColor: '#FF0043',
                        background: '#0F172A',
                        color: '#FFF'
                    });
                }
                return;
            }

            cropImageToCircleBase64(file, (base64Image) => {
                // Salva no localStorage
                localStorage.setItem('user_avatar_base64', base64Image);
                currentUserData.avatar = base64Image;
                localStorage.setItem('user_data', JSON.stringify(currentUserData));

                // Atualiza sessão se houver
                try {
                    const sess = JSON.parse(localStorage.getItem('mock_auth_session') || '{}');
                    if (sess.user) {
                        sess.user.avatar = base64Image;
                        localStorage.setItem('mock_auth_session', JSON.stringify(sess));
                    }
                } catch (err) {}

                // Atualiza usuário atual na lista de usuários
                const users = getStoredUsers();
                const idx = users.findIndex(u => u.email === currentEmail || u.username === currentUsername);
                if (idx !== -1) {
                    users[idx].avatar = base64Image;
                    saveStoredUsers(users);
                }

                applyUserAvatar(base64Image, currentUsername);
                renderUserTable();
                logAuditEvent('Atualização de Avatar', 'Foto de perfil recortada circularmente e atualizada no armazenamento local.', 'alteracao');

                if (window.Swal) {
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'success',
                        title: 'Foto de perfil atualizada!',
                        showConfirmButton: false,
                        timer: 2000,
                        background: '#0F172A',
                        color: '#FFF'
                    });
                }
            });
        });
    }

    // Botão de remover Avatar
    const btnRemoveAvatar = document.getElementById('btnRemoveAvatar');
    if (btnRemoveAvatar) {
        btnRemoveAvatar.addEventListener('click', () => {
            localStorage.removeItem('user_avatar_base64');
            delete currentUserData.avatar;
            localStorage.setItem('user_data', JSON.stringify(currentUserData));

            const users = getStoredUsers();
            const idx = users.findIndex(u => u.email === currentEmail || u.username === currentUsername);
            if (idx !== -1) {
                users[idx].avatar = null;
                saveStoredUsers(users);
            }

            applyUserAvatar(null, currentUsername);
            renderUserTable();
            logAuditEvent('Foto de perfil removida', 'Avatar restaurado para inicial padrão.', 'alteracao');

            if (window.Swal) {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'info',
                    title: 'Avatar restaurado para inicial',
                    showConfirmButton: false,
                    timer: 1800,
                    background: '#0F172A',
                    color: '#FFF'
                });
            }
        });
    }

    // ==========================================
    // 7. PROFILE DRAWER (PAINEL LATERAL)
    // ==========================================
    const profileDrawer = document.getElementById('profileDrawer');
    const drawerBackdrop = document.getElementById('drawerBackdrop');
    const btnOpenDrawer = document.getElementById('btnOpenDrawer');
    const headerUserChip = document.getElementById('headerUserChip');
    const btnCloseDrawer = document.getElementById('btnCloseDrawer');
    const btnDrawerCloseFooter = document.getElementById('btnDrawerCloseFooter');

    function openProfileDrawer() {
        if (!profileDrawer || !drawerBackdrop) return;
        
        // Carrega dados mais recentes
        const uName = currentUserData.username || currentUserData.name || currentUsername;
        const uEmail = currentUserData.email || currentEmail;
        const uPhone = currentUserData.phone || '(11) 98888-7777';
        const uCpf = currentUserData.cpf || currentRawCpf;
        const uRole = currentUserData.role || currentRole;

        const dName = document.getElementById('drawer-username');
        if (dName) dName.textContent = uName;

        const dEmail = document.getElementById('drawer-email');
        if (dEmail) dEmail.textContent = uEmail;

        const dBadge = document.getElementById('drawer-role-badge');
        if (dBadge) {
            dBadge.textContent = uRole;
            dBadge.className = 'badge badge-role-' + uRole.toLowerCase();
        }

        const inputName = document.getElementById('drawer-input-name');
        if (inputName) inputName.value = uName;

        const inputEmail = document.getElementById('drawer-input-email');
        if (inputEmail) inputEmail.value = uEmail;

        const inputPhone = document.getElementById('drawer-input-phone');
        if (inputPhone) inputPhone.value = formatPhone(uPhone);

        const inputCpf = document.getElementById('drawer-input-cpf');
        if (inputCpf) inputCpf.value = maskCPF(uCpf);

        const savedAvatar = localStorage.getItem('user_avatar_base64') || currentUserData.avatar;
        applyUserAvatar(savedAvatar, uName);

        drawerBackdrop.classList.add('active');
        profileDrawer.classList.add('active');
    }

    function closeProfileDrawer() {
        if (profileDrawer) profileDrawer.classList.remove('active');
        if (drawerBackdrop) drawerBackdrop.classList.remove('active');
    }

    if (btnOpenDrawer) btnOpenDrawer.addEventListener('click', openProfileDrawer);
    if (headerUserChip) headerUserChip.addEventListener('click', openProfileDrawer);
    if (btnCloseDrawer) btnCloseDrawer.addEventListener('click', closeProfileDrawer);
    if (btnDrawerCloseFooter) btnDrawerCloseFooter.addEventListener('click', closeProfileDrawer);
    if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeProfileDrawer);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && profileDrawer && profileDrawer.classList.contains('active')) {
            closeProfileDrawer();
        }
    });

    // Salvar Dados Editados no Drawer
    const btnSaveDrawerProfile = document.getElementById('btnSaveDrawerProfile');
    if (btnSaveDrawerProfile) {
        btnSaveDrawerProfile.addEventListener('click', () => {
            const inName = document.getElementById('drawer-input-name')?.value.trim();
            const inEmail = document.getElementById('drawer-input-email')?.value.trim();
            const inPhone = document.getElementById('drawer-input-phone')?.value.trim();

            if (!inName || inName.length < 3) {
                Swal.fire({ icon: 'warning', title: 'Nome Inválido', text: 'Informe um nome com pelo menos 3 caracteres.', background: '#0F172A', color: '#FFF' });
                return;
            }
            if (!validateEmail(inEmail)) {
                Swal.fire({ icon: 'warning', title: 'E-mail Inválido', text: 'Informe um endereço de e-mail corporativo válido.', background: '#0F172A', color: '#FFF' });
                return;
            }

            currentUserData.name = inName;
            currentUserData.username = inName;
            currentUserData.email = inEmail;
            currentUserData.phone = inPhone;
            localStorage.setItem('user_data', JSON.stringify(currentUserData));

            // Atualiza na lista de usuários
            const users = getStoredUsers();
            const idx = users.findIndex(u => u.email === currentEmail || u.username === currentUsername);
            if (idx !== -1) {
                users[idx].name = inName;
                users[idx].email = inEmail;
                users[idx].phone = inPhone;
                saveStoredUsers(users);
            }

            // Atualiza Topbar
            const topName = document.getElementById('topbar-username');
            if (topName) topName.textContent = inName;
            applyUserAvatar(currentUserData.avatar, inName);

            closeProfileDrawer();
            renderUserTable();
            logAuditEvent('Atualização de Dados Cadastrais', `Perfil alterado para ${inName} (${inEmail})`, 'alteracao');

            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Perfil salvo com sucesso!',
                showConfirmButton: false,
                timer: 2000,
                background: '#0F172A',
                color: '#FFF'
            });
        });
    }

    // Formatação de telefone no drawer
    const drawerPhoneInput = document.getElementById('drawer-input-phone');
    if (drawerPhoneInput) {
        drawerPhoneInput.addEventListener('input', (e) => {
            e.target.value = formatPhone(e.target.value);
        });
    }

    // ==========================================
    // 8. DATA TABLE CRUD DE USUÁRIOS
    // ==========================================
    let currentPage = 1;
    let pageSize = 5;
    let searchQuery = '';
    let roleFilter = '';
    let statusFilter = '';

    const userTableBody = document.getElementById('userTableBody');
    const tableEmptyState = document.getElementById('tableEmptyState');
    const paginationInfo = document.getElementById('paginationInfo');
    const tablePagination = document.getElementById('tablePagination');

    function getFilteredUsers() {
        let users = getStoredUsers();

        // Filtro de Texto
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            users = users.filter(u => {
                const name = (u.name || u.username || '').toLowerCase();
                const email = (u.email || '').toLowerCase();
                const cpf = (u.cpf || '').replace(/\D/g, '');
                return name.includes(q) || email.includes(q) || cpf.includes(q);
            });
        }

        // Filtro de Papel (Role)
        if (roleFilter) {
            users = users.filter(u => u.role === roleFilter);
        }

        // Filtro de Status
        if (statusFilter) {
            users = users.filter(u => u.status === statusFilter);
        }

        return users;
    }

    function renderUserTable() {
        if (!userTableBody) return;

        const filtered = getFilteredUsers();
        const totalItems = filtered.length;
        const totalPages = Math.ceil(totalItems / pageSize) || 1;

        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;

        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, totalItems);
        const pageUsers = filtered.slice(startIndex, endIndex);

        if (totalItems === 0) {
            userTableBody.innerHTML = '';
            if (tableEmptyState) tableEmptyState.classList.remove('d-none');
            if (paginationInfo) paginationInfo.textContent = 'Exibindo 0 de 0 usuários';
            if (tablePagination) tablePagination.innerHTML = '';
            return;
        }

        if (tableEmptyState) tableEmptyState.classList.add('d-none');
        if (paginationInfo) paginationInfo.textContent = `Exibindo ${startIndex + 1} a ${endIndex} de ${totalItems} usuários`;

        // Renderização das Linhas da Tabela
        let rowsHtml = '';
        pageUsers.forEach(u => {
            const uInitial = ((u.name || u.username || 'U').charAt(0) || 'U').toUpperCase();
            const avatarHtml = u.avatar
                ? `<div class="user-cell-avatar"><img src="${u.avatar}" alt="avatar" /></div>`
                : `<div class="user-cell-avatar">${uInitial}</div>`;

            const roleClass = 'badge-role-' + (u.role || 'usuario').toLowerCase();
            const isBlocked = u.status === 'Bloqueado';
            const statusBadge = isBlocked
                ? `<span class="badge badge-status-bloqueado py-1 px-2"><span class="status-dot blocked"></span>Bloqueado</span>`
                : `<span class="badge badge-status-ativo py-1 px-2"><span class="status-dot active"></span>Ativo</span>`;

            const toggleActionText = isBlocked ? 'Desbloquear' : 'Bloquear';
            const toggleActionIcon = isBlocked ? 'fa-user-check' : 'fa-user-lock';
            const toggleActionBtnClass = isBlocked ? 'btn-outline-success' : 'btn-outline-warning';

            rowsHtml += `
                <tr data-user-id="${u.id}">
                    <td>
                        <div class="d-flex align-items-center">
                            ${avatarHtml}
                            <div class="ml-3">
                                <div class="text-white font-weight-bold">${escapeHtml(u.name || u.username)}</div>
                                <small class="text-muted">@${escapeHtml(u.username || 'user')}</small>
                            </div>
                        </div>
                    </td>
                    <td>
                        <span class="text-light">${escapeHtml(u.email)}</span>
                    </td>
                    <td>
                        <span class="badge ${roleClass} py-1 px-2 font-weight-bold">${escapeHtml(u.role || 'Usuário')}</span>
                    </td>
                    <td>
                        <code class="text-info font-weight-bold" style="background: rgba(0,240,255,0.06); padding: 2px 6px; border-radius: 4px;">
                            ${maskCPF(u.cpf)}
                        </code>
                    </td>
                    <td>
                        ${statusBadge}
                    </td>
                    <td class="text-center">
                        <div class="btn-group btn-group-sm" role="group">
                            <button type="button" class="btn btn-outline-info btn-action-icon btn-edit-user" data-id="${u.id}" title="Editar Usuário">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button type="button" class="btn ${toggleActionBtnClass} btn-action-icon ml-1 btn-toggle-status" data-id="${u.id}" data-action="${toggleActionText}" title="${toggleActionText} Usuário">
                                <i class="fas ${toggleActionIcon}"></i>
                            </button>
                            <button type="button" class="btn btn-outline-danger btn-action-icon ml-1 btn-delete-user" data-id="${u.id}" title="Excluir Usuário">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
        userTableBody.innerHTML = rowsHtml;

        // Renderiza Paginação
        renderPaginationControls(totalPages);

        // Bindings dos Botões de Ação
        bindTableActionButtons();
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s]));
    }

    function renderPaginationControls(totalPages) {
        if (!tablePagination) return;
        let pagesHtml = '';

        // Botão Anterior
        pagesHtml += `
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage - 1}" aria-label="Anterior">
                    <span aria-hidden="true">&laquo;</span>
                </a>
            </li>
        `;

        // Itens de Página
        for (let p = 1; p <= totalPages; p++) {
            pagesHtml += `
                <li class="page-item ${p === currentPage ? 'active' : ''}">
                    <a class="page-link font-weight-bold" href="#" data-page="${p}">${p}</a>
                </li>
            `;
        }

        // Botão Próximo
        pagesHtml += `
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage + 1}" aria-label="Próximo">
                    <span aria-hidden="true">&raquo;</span>
                </a>
            </li>
        `;

        tablePagination.innerHTML = pagesHtml;

        tablePagination.querySelectorAll('.page-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetPage = parseInt(e.currentTarget.getAttribute('data-page'), 10);
                if (targetPage >= 1 && targetPage <= totalPages && targetPage !== currentPage) {
                    currentPage = targetPage;
                    renderUserTable();
                }
            });
        });
    }

    function bindTableActionButtons() {
        // 1. Botão Editar
        document.querySelectorAll('.btn-edit-user').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const userId = e.currentTarget.getAttribute('data-id');
                const users = getStoredUsers();
                const user = users.find(u => u.id === userId);
                if (!user) return;

                document.getElementById('edit-user-id').value = user.id;
                document.getElementById('edit-user-name').value = user.name || user.username || '';
                document.getElementById('edit-user-email').value = user.email || '';
                document.getElementById('edit-user-cpf').value = maskCPF(user.cpf);
                document.getElementById('edit-user-phone').value = formatPhone(user.phone || '');
                document.getElementById('edit-user-role').value = user.role || 'Usuário';
                document.getElementById('edit-user-status').value = user.status || 'Ativo';

                $('#editUserModal').modal('show');
            });
        });

        // 2. Botão Bloquear / Desbloquear
        document.querySelectorAll('.btn-toggle-status').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const userId = e.currentTarget.getAttribute('data-id');
                const users = getStoredUsers();
                const user = users.find(u => u.id === userId);
                if (!user) return;

                const isCurrentlyBlocked = user.status === 'Bloqueado';
                const nextStatus = isCurrentlyBlocked ? 'Ativo' : 'Bloqueado';
                const actionWord = isCurrentlyBlocked ? 'desbloquear' : 'bloquear';

                // Impede bloquear a si mesmo
                if (user.email === currentEmail && nextStatus === 'Bloqueado') {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Ação Não Permitida',
                        text: 'Você não pode bloquear o seu próprio usuário logado.',
                        confirmButtonColor: '#FF0043',
                        background: '#0F172A',
                        color: '#FFF'
                    });
                    return;
                }

                Swal.fire({
                    title: `Deseja ${actionWord} este usuário?`,
                    text: `O status de "${user.name}" será alterado para ${nextStatus}.`,
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: nextStatus === 'Bloqueado' ? '#EF4444' : '#10B981',
                    cancelButtonColor: '#334155',
                    confirmButtonText: `Sim, ${actionWord}`,
                    cancelButtonText: 'Cancelar',
                    background: '#0F172A',
                    color: '#FFF'
                }).then((res) => {
                    if (res.isConfirmed) {
                        user.status = nextStatus;
                        saveStoredUsers(users);
                        renderUserTable();
                        logAuditEvent(
                            `Alteração de Status: Usuário ${nextStatus}`,
                            `Conta de ${user.name} (${user.email}) foi marcada como ${nextStatus}`,
                            nextStatus === 'Bloqueado' ? 'bloqueio' : 'alteracao'
                        );

                        Swal.fire({
                            toast: true,
                            position: 'top-end',
                            icon: 'success',
                            title: `Usuário ${nextStatus.toLowerCase()} com sucesso!`,
                            showConfirmButton: false,
                            timer: 2000,
                            background: '#0F172A',
                            color: '#FFF'
                        });
                    }
                });
            });
        });

        // 3. Botão Excluir Usuário
        document.querySelectorAll('.btn-delete-user').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const userId = e.currentTarget.getAttribute('data-id');
                const users = getStoredUsers();
                const user = users.find(u => u.id === userId);
                if (!user) return;

                // Não permite excluir a si mesmo
                if (user.email === currentEmail) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Operação Restrita',
                        text: 'Você não pode excluir sua própria conta de administrador ativa.',
                        confirmButtonColor: '#FF0043',
                        background: '#0F172A',
                        color: '#FFF'
                    });
                    return;
                }

                Swal.fire({
                    title: `Excluir usuário "${user.name}"?`,
                    text: 'Esta ação removerá o acesso e as credenciais corporativas do usuário.',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#EF4444',
                    cancelButtonColor: '#334155',
                    confirmButtonText: 'Sim, excluir definitivamente',
                    cancelButtonText: 'Cancelar',
                    background: '#0F172A',
                    color: '#FFF'
                }).then((res) => {
                    if (res.isConfirmed) {
                        const updated = users.filter(u => u.id !== userId);
                        saveStoredUsers(updated);
                        renderUserTable();
                        logAuditEvent(
                            'Exclusão de Usuário',
                            `Usuário ${user.name} (${user.email}) foi removido permanentemente`,
                            'alteracao'
                        );

                        Swal.fire({
                            toast: true,
                            position: 'top-end',
                            icon: 'success',
                            title: 'Usuário excluído com sucesso!',
                            showConfirmButton: false,
                            timer: 2000,
                            background: '#0F172A',
                            color: '#FFF'
                        });
                    }
                });
            });
        });
    }

    // Busca e Filtros em Tempo Real
    const searchInput = document.getElementById('userSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.trim();
            currentPage = 1;
            renderUserTable();
        });
    }

    const roleFilterSelect = document.getElementById('userRoleFilter');
    if (roleFilterSelect) {
        roleFilterSelect.addEventListener('change', (e) => {
            roleFilter = e.target.value;
            currentPage = 1;
            renderUserTable();
        });
    }

    const statusFilterSelect = document.getElementById('userStatusFilter');
    if (statusFilterSelect) {
        statusFilterSelect.addEventListener('change', (e) => {
            statusFilter = e.target.value;
            currentPage = 1;
            renderUserTable();
        });
    }

    const btnResetFilters = document.getElementById('btnResetFilters');
    if (btnResetFilters) {
        btnResetFilters.addEventListener('click', () => {
            searchQuery = '';
            roleFilter = '';
            statusFilter = '';
            if (searchInput) searchInput.value = '';
            if (roleFilterSelect) roleFilterSelect.value = '';
            if (statusFilterSelect) statusFilterSelect.value = '';
            currentPage = 1;
            renderUserTable();
        });
    }

    const pageSizeSelect = document.getElementById('pageSizeSelect');
    if (pageSizeSelect) {
        pageSizeSelect.addEventListener('change', (e) => {
            pageSize = parseInt(e.target.value, 10) || 5;
            currentPage = 1;
            renderUserTable();
        });
    }

    // ==========================================
    // 9. MODAL DE ADICIONAR NOVO USUÁRIO
    // ==========================================
    const newNameInput = document.getElementById('new-user-name');
    const newEmailInput = document.getElementById('new-user-email');
    const newCpfInput = document.getElementById('new-user-cpf');
    const newPhoneInput = document.getElementById('new-user-phone');
    const newRoleSelect = document.getElementById('new-user-role');
    const newStatusSelect = document.getElementById('new-user-status');
    const btnConfirmAddUser = document.getElementById('btnConfirmAddUser');

    // Máscaras de entrada
    if (newCpfInput) {
        newCpfInput.addEventListener('input', (e) => {
            let v = e.target.value.replace(/\D/g, '');
            if (v.length > 11) v = v.substring(0, 11);
            e.target.value = v.replace(/(\d{3})(\d)/, '$1.$2')
                             .replace(/(\d{3})(\d)/, '$1.$2')
                             .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        });
    }
    if (newPhoneInput) {
        newPhoneInput.addEventListener('input', (e) => {
            e.target.value = formatPhone(e.target.value);
        });
    }

    if (btnConfirmAddUser) {
        btnConfirmAddUser.addEventListener('click', () => {
            const name = newNameInput?.value.trim();
            const email = newEmailInput?.value.trim();
            const cpf = newCpfInput?.value.trim();
            const phone = newPhoneInput?.value.trim();
            const role = newRoleSelect?.value || 'Usuário';
            const status = newStatusSelect?.value || 'Ativo';

            // 1. Validação de Nome
            if (!name || name.length < 3) {
                newNameInput?.classList.add('is-invalid');
                return;
            } else {
                newNameInput?.classList.remove('is-invalid');
            }

            // 2. Validação de Email
            if (!validateEmail(email)) {
                newEmailInput?.classList.add('is-invalid');
                return;
            } else {
                newEmailInput?.classList.remove('is-invalid');
            }

            // 3. Validação de CPF
            if (!validateCPF(cpf)) {
                newCpfInput?.classList.add('is-invalid');
                return;
            } else {
                newCpfInput?.classList.remove('is-invalid');
            }

            const rawCpf = cpf.replace(/\D/g, '');
            const users = getStoredUsers();

            // Verificação de Duplicatas
            const duplicateEmail = users.some(u => u.email.toLowerCase() === email.toLowerCase());
            if (duplicateEmail) {
                Swal.fire({ icon: 'warning', title: 'E-mail Existente', text: 'Já existe um usuário cadastrado com este e-mail.', background: '#0F172A', color: '#FFF' });
                return;
            }
            const duplicateCpf = users.some(u => (u.cpf || '').replace(/\D/g, '') === rawCpf);
            if (duplicateCpf) {
                Swal.fire({ icon: 'warning', title: 'CPF Existente', text: 'Já existe um usuário cadastrado com este número de CPF.', background: '#0F172A', color: '#FFF' });
                return;
            }

            // Cria novo usuário
            const newUser = {
                id: 'usr_' + Date.now(),
                name,
                username: name.toLowerCase().replace(/\s+/g, '.'),
                email,
                cpf: rawCpf,
                phone: phone || '',
                role,
                status,
                avatar: null,
                createdAt: new Date().toISOString()
            };

            users.unshift(newUser);
            saveStoredUsers(users);
            renderUserTable();
            logAuditEvent('Cadastro de Usuário', `Novo usuário ${name} criado como ${role} com status ${status}`, 'cadastro');

            // Limpa formulário
            document.getElementById('formAddUser')?.reset();
            $('#addUserModal').modal('hide');

            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Usuário cadastrado com sucesso!',
                showConfirmButton: false,
                timer: 2000,
                background: '#0F172A',
                color: '#FFF'
            });
        });
    }

    // ==========================================
    // 10. MODAL DE EDIÇÃO DE USUÁRIO EXISTENTE
    // ==========================================
    const editUserIdInput = document.getElementById('edit-user-id');
    const editUserNameInput = document.getElementById('edit-user-name');
    const editUserEmailInput = document.getElementById('edit-user-email');
    const editUserPhoneInput = document.getElementById('edit-user-phone');
    const editUserRoleSelect = document.getElementById('edit-user-role');
    const editUserStatusSelect = document.getElementById('edit-user-status');
    const btnConfirmEditUser = document.getElementById('btnConfirmEditUser');

    if (editUserPhoneInput) {
        editUserPhoneInput.addEventListener('input', (e) => {
            e.target.value = formatPhone(e.target.value);
        });
    }

    if (btnConfirmEditUser) {
        btnConfirmEditUser.addEventListener('click', () => {
            const userId = editUserIdInput?.value;
            const name = editUserNameInput?.value.trim();
            const email = editUserEmailInput?.value.trim();
            const phone = editUserPhoneInput?.value.trim();
            const role = editUserRoleSelect?.value;
            const status = editUserStatusSelect?.value;

            if (!name || name.length < 3) {
                Swal.fire({ icon: 'warning', title: 'Nome Obrigatório', text: 'Informe um nome com pelo menos 3 caracteres.', background: '#0F172A', color: '#FFF' });
                return;
            }
            if (!validateEmail(email)) {
                Swal.fire({ icon: 'warning', title: 'E-mail Inválido', text: 'Informe um e-mail válido.', background: '#0F172A', color: '#FFF' });
                return;
            }

            const users = getStoredUsers();
            const user = users.find(u => u.id === userId);
            if (!user) return;

            user.name = name;
            user.email = email;
            user.phone = phone;
            user.role = role;
            user.status = status;

            saveStoredUsers(users);

            // Se for o próprio usuário logado, atualiza sessão
            if (user.email === currentEmail || user.id === currentUserData.id) {
                currentUserData.name = name;
                currentUserData.username = name;
                currentUserData.email = email;
                currentUserData.role = role;
                currentUserData.phone = phone;
                localStorage.setItem('user_data', JSON.stringify(currentUserData));
                const topName = document.getElementById('topbar-username');
                if (topName) topName.textContent = name;
                const topRole = document.getElementById('topbar-role');
                if (topRole) topRole.textContent = role;
            }

            renderUserTable();
            logAuditEvent('Alteração Cadastral', `Dados do usuário ${name} atualizados`, 'alteracao');
            $('#editUserModal').modal('hide');

            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Usuário atualizado com sucesso!',
                showConfirmButton: false,
                timer: 2000,
                background: '#0F172A',
                color: '#FFF'
            });
        });
    }

    // ==========================================
    // 11. EXPORTAÇÃO DE USUÁRIOS COMO CSV (VIA BLOB API & UTF-8 BOM)
    // ==========================================
    const btnExportUsersCsv = document.getElementById('btnExportUsersCsv');
    if (btnExportUsersCsv) {
        btnExportUsersCsv.addEventListener('click', () => {
            const users = getFilteredUsers();
            if (window.exportService && typeof window.exportService.exportUsersCSV === 'function') {
                window.exportService.exportUsersCSV(users);
            } else {
                let csvContent = '\uFEFFID,Nome,Usuario,Email,CPF,Telefone,Perfil,Status,CriadoEm\r\n';
                users.forEach(u => {
                    const row = [
                        u.id,
                        `"${(u.name || '').replace(/"/g, '""')}"`,
                        `"${(u.username || '').replace(/"/g, '""')}"`,
                        `"${(u.email || '').replace(/"/g, '""')}"`,
                        `"${formatCPF(u.cpf)}"`,
                        `"${u.phone || ''}"`,
                        `"${u.role || ''}"`,
                        `"${u.status || ''}"`,
                        `"${u.createdAt || ''}"`
                    ].join(',');
                    csvContent += row + '\r\n';
                });
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `usuarios_portal_${Date.now()}.csv`;
                document.body.appendChild(link);
                link.click();
                setTimeout(() => { link.remove(); URL.revokeObjectURL(url); }, 200);
            }

            logAuditEvent('Exportação de Usuários (CSV)', `Lista de ${users.length} usuários baixada em CSV via Blob API`, 'exportacao');
            
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Arquivo CSV gerado com sucesso!',
                showConfirmButton: false,
                timer: 2000,
                background: '#0F172A',
                color: '#FFF'
            });
        });
    }

    // ==========================================
    // 12. ENVOLVER EXPORTSERVICE PARA REGISTRAR LOG
    // ==========================================
    if (window.exportService) {
        const originalExport = window.exportService.exportSessionReport;
        window.exportService.exportSessionReport = function () {
            logAuditEvent('Exportação de Auditoria (JSON)', 'Relatório de segurança e integridade de sessão baixado', 'exportacao');
            return originalExport.apply(this, arguments);
        };
    }

    // ==========================================
    // 13. LOGOUT DO SISTEMA
    // ==========================================
    function performLogout() {
        Swal.fire({
            title: 'Encerrar Sessão?',
            text: 'Você precisará autenticar novamente para acessar o portal.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#334155',
            confirmButtonText: 'Sim, sair agora',
            cancelButtonText: 'Permanecer conectado',
            background: '#0F172A',
            color: '#FFF'
        }).then((res) => {
            if (res.isConfirmed) {
                logAuditEvent('Sessão encerrada', `Usuário ${currentUsername} efetuou logout`, 'login');
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_data');
                localStorage.removeItem('mock_auth_session');
                sessionStorage.removeItem('mock_auth_session');
                window.location.href = 'index.html';
            }
        });
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', performLogout);

    const drawerLogoutBtn = document.getElementById('drawerLogoutBtn');
    if (drawerLogoutBtn) drawerLogoutBtn.addEventListener('click', performLogout);

    // ==========================================
    // 14. INICIALIZAÇÃO VISUAL FINAL
    // ==========================================
    // Atualiza Topbar
    const topUsernameEl = document.getElementById('topbar-username');
    if (topUsernameEl) topUsernameEl.textContent = currentUsername;

    const topRoleEl = document.getElementById('topbar-role');
    if (topRoleEl) topRoleEl.textContent = currentRole;

    const savedAvatar = localStorage.getItem('user_avatar_base64') || currentUserData.avatar;
    applyUserAvatar(savedAvatar, currentUsername);

    // Renderiza tabela, timeline e métricas
    renderUserTable();
    renderAuditTimeline();
    updateKpiMetrics();
});
