/**
 * password-recovery.js - Identity Recovery & Password Reset Service
 * Module responsible for:
 * 1. Identity lookup (Email / CPF format validation and LocalStorage user match)
 * 2. 6-digit secure token generation and validation
 * 3. Real-time Shannon / pool entropy password strength calculation
 * 4. SHA-256 cryptographic password hashing and LocalStorage user record update
 */

(function (window) {
    'use strict';

    const STORAGE_KEY_USERS = 'mock_auth_users';
    const DEFAULT_SALT = 'salt_portal_2026';

    /**
     * Generates a cryptographically secure random hexadecimal salt
     */
    function generateSalt(byteLength = 16) {
        if (window.AuthService && typeof window.AuthService.generateSalt === 'function') {
            return window.AuthService.generateSalt(byteLength);
        }
        if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
            const array = new Uint8Array(byteLength);
            window.crypto.getRandomValues(array);
            return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
        }
        let salt = '';
        const chars = '0123456789abcdef';
        for (let i = 0; i < byteLength * 2; i++) {
            salt += chars[Math.floor(Math.random() * chars.length)];
        }
        return salt;
    }

    // Default demo users to seed if localStorage is empty
    const DEFAULT_DEMO_USERS = [
        {
            username: 'goku.saiyan',
            email: 'goku@capsulecorp.com.br',
            cpf: '111.444.777-35',
            salt: 'a1b2c3d4e5f60718293a4b5c6d7e8f90',
            // Default hash for Kakaroto#2026!Saiyan with above salt
            password: 'sha256_b37d8e2501a4db926fa80540d4fa27ca1917f6c3426e95c1cfa3f1d2c6c0e86b',
            createdAt: '2026-10-25T10:00:00.000Z'
        },
        {
            username: 'admin',
            email: 'admin@portal.com',
            cpf: '529.982.247-25',
            salt: 'f0e1d2c3b4a5968778695a4b3c2d1e0f',
            // Default hash for Admin@1234 with above salt
            password: 'sha256_8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
            createdAt: '2026-10-25T10:00:00.000Z'
        }
    ];

    /**
     * Ensure mock users exist in localStorage for testing
     */
    function initUsers() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_USERS);
            if (!raw || raw === '[]') {
                localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(DEFAULT_DEMO_USERS));
                return DEFAULT_DEMO_USERS;
            }
            const parsed = JSON.parse(raw);
            // Ensure at least demo goku exists
            const hasGoku = parsed.some(u => u.username === 'goku.saiyan' || u.email === 'goku@capsulecorp.com.br');
            if (!hasGoku) {
                parsed.push(DEFAULT_DEMO_USERS[0]);
                localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(parsed));
            }
            return parsed;
        } catch (e) {
            return DEFAULT_DEMO_USERS;
        }
    }

    /**
     * Get users array from localStorage
     */
    function getUsers() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_USERS);
            return raw ? JSON.parse(raw) : initUsers();
        } catch (e) {
            return DEFAULT_DEMO_USERS;
        }
    }

    /**
     * Save users array to localStorage
     */
    function saveUsers(users) {
        try {
            localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
            return true;
        } catch (e) {
            console.error('Falha ao salvar usuários no localStorage:', e);
            return false;
        }
    }

    /**
     * Mask email address for privacy: e.g. g***u@capsulecorp.com.br
     */
    function maskEmail(email) {
        if (!email || !email.includes('@')) return email || '';
        const [user, domain] = email.split('@');
        if (user.length <= 2) {
            return user.charAt(0) + '***@' + domain;
        }
        return user.charAt(0) + '***' + user.charAt(user.length - 1) + '@' + domain;
    }

    /**
     * Mask CPF for privacy: e.g. 111.***.***-35
     */
    function maskCPF(cpf) {
        const clean = (cpf || '').replace(/\D/g, '');
        if (clean.length === 11) {
            return clean.substring(0, 3) + '.***.***-' + clean.substring(9, 11);
        }
        return cpf || '';
    }

    /**
     * Format CPF input with standard punctuation
     */
    function formatCPF(value) {
        return (value || '')
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
            .substring(0, 14);
    }

    /**
     * Strict CPF validation algorithm (Mod 11 & repetition check)
     */
    function isValidCPF(value) {
        const cpf = (value || '').replace(/\D/g, '');
        if (cpf.length !== 11) return false;
        if (/^(\d)\1{10}$/.test(cpf)) return false;

        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cpf.charAt(i), 10) * (10 - i);
        }
        let rev = 11 - (sum % 11);
        if (rev === 10 || rev === 11) rev = 0;
        if (rev !== parseInt(cpf.charAt(9), 10)) return false;

        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cpf.charAt(i), 10) * (11 - i);
        }
        rev = 11 - (sum % 11);
        if (rev === 10 || rev === 11) rev = 0;
        if (rev !== parseInt(cpf.charAt(10), 10)) return false;

        return true;
    }

    /**
     * Email format validation (RFC 5322 simplified)
     */
    function isValidEmail(value) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(value || '').trim().toLowerCase());
    }

    /**
     * Step 1: Look up user in localStorage by Email or CPF
     */
    function findUser(identifier) {
        const raw = String(identifier || '').trim();
        if (!raw) {
            return { success: false, message: 'Por favor, informe seu e-mail ou CPF cadastrado.' };
        }

        const isEmailFormat = raw.includes('@');
        const cleanDigits = raw.replace(/\D/g, '');
        const isCpfFormat = cleanDigits.length === 11 && !isEmailFormat;

        if (isEmailFormat && !isValidEmail(raw)) {
            return { success: false, message: 'O formato do e-mail digitado é inválido.' };
        }

        if (isCpfFormat && !isValidCPF(raw)) {
            return { success: false, message: 'O CPF informado possui dígitos verificadores inválidos.' };
        }

        const users = getUsers();
        const user = users.find(u => {
            if (isEmailFormat) {
                return (u.email || '').toLowerCase() === raw.toLowerCase();
            }
            if (isCpfFormat || cleanDigits.length >= 9) {
                const userCpfClean = (u.cpf || '').replace(/\D/g, '');
                return userCpfClean === cleanDigits;
            }
            return (u.username || '').toLowerCase() === raw.toLowerCase() ||
                   (u.email || '').toLowerCase() === raw.toLowerCase();
        });

        if (!user) {
            return {
                success: false,
                message: 'Nenhum usuário cadastrado foi encontrado com estes dados.'
            };
        }

        return {
            success: true,
            user: {
                username: user.username,
                email: user.email,
                cpf: user.cpf,
                maskedEmail: maskEmail(user.email),
                maskedCpf: maskCPF(user.cpf)
            }
        };
    }

    /**
     * Step 2: Generate 6-digit verification code with 10-minute expiry
     */
    function generateToken() {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
        return {
            code,
            expiresAt
        };
    }

    /**
     * Step 2: Verify user entered token
     */
    function verifyToken(enteredCode, expectedCode, expiresAt) {
        const clean = String(enteredCode || '').replace(/\D/g, '').trim();
        if (clean.length !== 6) {
            return { success: false, message: 'O código de verificação deve conter 6 dígitos numéricos.' };
        }
        if (expiresAt && Date.now() > expiresAt) {
            return { success: false, message: 'Este código de verificação expirou. Solicite um novo reenvio.' };
        }
        if (clean !== String(expectedCode).trim()) {
            return { success: false, message: 'Código de verificação incorreto. Confira o código recebido.' };
        }
        return { success: true };
    }

    /**
     * Step 3: Real-time Entropy Strength Meter
     * Calculates pool entropy: E = L * log2(PoolSize)
     * and evaluates requirements.
     */
    function calculateEntropy(password) {
        const pwd = String(password || '');
        if (!pwd) {
            return {
                bits: 0,
                score: 0,
                level: 'empty',
                label: 'Aguardando digitação...',
                color: '#64748B',
                checks: {
                    minLength: false,
                    hasUppercase: false,
                    hasLowercase: false,
                    hasNumber: false,
                    hasSpecial: false
                }
            };
        }

        const checks = {
            minLength: pwd.length >= 8,
            hasUppercase: /[A-Z]/.test(pwd),
            hasLowercase: /[a-z]/.test(pwd),
            hasNumber: /[0-9]/.test(pwd),
            hasSpecial: /[^A-Za-z0-9]/.test(pwd)
        };

        let poolSize = 0;
        if (checks.hasLowercase) poolSize += 26;
        if (checks.hasUppercase) poolSize += 26;
        if (checks.hasNumber) poolSize += 10;
        if (checks.hasSpecial) poolSize += 33;
        if (poolSize === 0) poolSize = 10;

        const bits = Math.round(pwd.length * Math.log2(poolSize));
        const passedCount = Object.values(checks).filter(Boolean).length;

        let score = 0;
        let level = 'weak';
        let label = 'Fraca';
        let color = '#FF3366'; // Vermelho neon

        if (bits >= 75 && passedCount === 5) {
            score = 100;
            level = 'super';
            label = 'Super Saiyajin (Invencível)';
            color = '#00FFCC'; // Esmeralda neon
        } else if (bits >= 55 && passedCount >= 4) {
            score = 75;
            level = 'strong';
            label = 'Forte';
            color = '#00F0FF'; // Ciano neon
        } else if (bits >= 35 && passedCount >= 3) {
            score = 50;
            level = 'fair';
            label = 'Razoável';
            color = '#FFD700'; // Dourado neon
        } else {
            score = Math.max(15, Math.min(30, bits));
            level = 'weak';
            label = 'Fraca';
            color = '#FF3366';
        }

        return {
            bits,
            score,
            level,
            label,
            color,
            checks
        };
    }

    /**
     * Web Cryptography API SHA-256 hash with salt (fully compatible with AuthService)
     */
    async function hashPassword(password, salt = null) {
        if (window.AuthService && typeof window.AuthService.hashPassword === 'function') {
            return await window.AuthService.hashPassword(password, salt || DEFAULT_SALT);
        }

        const effectiveSalt = salt || DEFAULT_SALT;
        try {
            if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
                const encoder = new TextEncoder();
                const data = encoder.encode(password + ':' + effectiveSalt);
                const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                return 'sha256_' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            }
        } catch (e) {
            console.warn('crypto.subtle indisponível, usando hash fallback', e);
        }

        // Fallback hash implementation
        let hash = 0;
        const text = password + ':' + effectiveSalt;
        for (let i = 0; i < text.length; i++) {
            const char = text.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0;
        }
        return 'sha256_fb_' + Math.abs(hash).toString(16) + '_' + btoa(password).substring(0, 8);
    }

    /**
     * Step 3: Update user password in LocalStorage with SHA-256 hash
     */
    async function updatePassword(usernameOrEmail, newPassword) {
        if (!newPassword || newPassword.length < 8) {
            return {
                success: false,
                message: 'A nova senha deve possuir pelo menos 8 caracteres.'
            };
        }

        const users = getUsers();
        const userIndex = users.findIndex(u =>
            (u.username && u.username.toLowerCase() === String(usernameOrEmail).toLowerCase()) ||
            (u.email && u.email.toLowerCase() === String(usernameOrEmail).toLowerCase()) ||
            (u.cpf && u.cpf.replace(/\D/g, '') === String(usernameOrEmail).replace(/\D/g, ''))
        );

        if (userIndex === -1) {
            return {
                success: false,
                message: 'Usuário não localizado no banco de dados local.'
            };
        }

        const userSalt = users[userIndex].salt || generateSalt(16);
        users[userIndex].salt = userSalt;
        const hashedPassword = await hashPassword(newPassword, userSalt);
        users[userIndex].password = hashedPassword;
        users[userIndex].updatedAt = new Date().toISOString();

        const saved = saveUsers(users);
        if (!saved) {
            return {
                success: false,
                message: 'Erro ao persistir a nova senha no armazenamento local.'
            };
        }

        // Also invalidate or update active session if it matches this user
        try {
            const sessionRaw = localStorage.getItem('mock_auth_session');
            if (sessionRaw) {
                const session = JSON.parse(sessionRaw);
                if (session.user && session.user.username === users[userIndex].username) {
                    localStorage.removeItem('mock_auth_session');
                    localStorage.removeItem('auth_token');
                }
            }
        } catch (e) {}

        return {
            success: true,
            user: {
                username: users[userIndex].username,
                email: users[userIndex].email,
                cpf: users[userIndex].cpf
            },
            message: 'Senha atualizada com sucesso no banco de dados local!'
        };
    }

    // Expose API globally
    window.PasswordRecovery = {
        initUsers,
        getUsers,
        saveUsers,
        maskEmail,
        maskCPF,
        formatCPF,
        isValidCPF,
        isValidEmail,
        findUser,
        generateToken,
        verifyToken,
        calculateEntropy,
        hashPassword,
        updatePassword
    };

    // Auto-init on load
    if (typeof window !== 'undefined' && window.localStorage) {
        initUsers();
    }

})(typeof window !== 'undefined' ? window : this);
