/**
 * auth-service.js - Mock Backend & Local Auth System
 * Simulates an authentication backend using localStorage, Web Cryptography API (SHA-256),
 * JWT token generation, and Axios interception for /api/login and /api/register.
 */

(function () {
    'use strict';

    const STORAGE_KEY_USERS = 'mock_auth_users';
    const STORAGE_KEY_SESSION = 'mock_auth_session';

    // Cryptographic SHA-256 with salt + fallback
    async function hashPassword(password) {
        try {
            if (window.crypto && crypto.subtle) {
                const msgBuffer = new TextEncoder().encode(password + '_salt_portal_2026');
                const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                return 'sha256_' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            }
        } catch (e) {}

        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash |= 0;
        }
        return 'hash_' + Math.abs(hash).toString(16) + '_' + btoa(password).substring(0, 6);
    }

    // Simulated JWT generator (Header.Payload.Signature)
    function generateJwtToken(user) {
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const payload = btoa(JSON.stringify({
            sub: user.username,
            email: user.email,
            cpf: user.cpf,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 horas
        }));
        const signature = btoa('mock_signature_' + user.username + '_' + Date.now());
        return `${header}.${payload}.${signature}`;
    }

    function getUsers() {
        const usersJson = localStorage.getItem(STORAGE_KEY_USERS);
        return usersJson ? JSON.parse(usersJson) : [];
    }

    function saveUsers(users) {
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    }

    async function mockApiCall(url, data) {
        // Simulate network latency (250ms)
        await new Promise(resolve => setTimeout(resolve, 250));

        let users = getUsers();

        if (url.includes('/api/login')) {
            const user = users.find(u => (u.username === data.username || u.email === data.username));
            const hashed = await hashPassword(data.password);

            if (!user) {
                // If user doesn't exist, create account and authenticate for seamless demo
                const newUser = {
                    username: data.username,
                    password: hashed,
                    cpf: data.cpf || '000.000.000-00',
                    email: data.email || (data.username + '@portal.com'),
                    createdAt: new Date().toISOString()
                };
                users.push(newUser);
                saveUsers(users);

                const token = generateJwtToken(newUser);
                const sessionData = { token, user: { username: newUser.username, email: newUser.email, cpf: newUser.cpf } };
                
                localStorage.setItem('auth_token', token);
                localStorage.setItem('user_data', JSON.stringify(sessionData.user));
                localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(sessionData));

                return {
                    status: 200,
                    data: {
                        success: true,
                        message: 'Conta autenticada com sucesso!',
                        token,
                        user: sessionData.user
                    }
                };
            }

            // Check password hash or fallback
            if (user.password !== hashed && user.password !== ('hash_' + Math.abs(data.password.length).toString(16))) {
                return {
                    status: 401,
                    data: {
                        success: false,
                        message: 'Senha incorreta.'
                    }
                };
            }

            const token = generateJwtToken(user);
            const sessionData = { token, user: { username: user.username, email: user.email, cpf: user.cpf } };

            localStorage.setItem('auth_token', token);
            localStorage.setItem('user_data', JSON.stringify(sessionData.user));
            if (data.rememberMe) {
                localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(sessionData));
            } else {
                sessionStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(sessionData));
            }

            return {
                status: 200,
                data: {
                    success: true,
                    message: 'Login realizado com sucesso!',
                    token,
                    user: sessionData.user
                }
            };
        }

        if (url.includes('/api/register')) {
            const existing = users.find(u => u.username === data.username || u.email === data.email);
            if (existing) {
                return {
                    status: 400,
                    data: { success: false, message: 'Usuário ou e-mail já cadastrado.' }
                };
            }

            const hashed = await hashPassword(data.password);
            const newUser = {
                username: data.username,
                password: hashed,
                cpf: data.cpf,
                email: data.email,
                city: data.city || '',
                state: data.state || '',
                createdAt: new Date().toISOString()
            };
            users.push(newUser);
            saveUsers(users);

            const token = generateJwtToken(newUser);
            const sessionData = { token, user: { username: newUser.username, email: newUser.email, cpf: newUser.cpf } };
            localStorage.setItem('auth_token', token);
            localStorage.setItem('user_data', JSON.stringify(sessionData.user));
            localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(sessionData));

            return {
                status: 201,
                data: { success: true, message: 'Usuário cadastrado com sucesso!', token, user: sessionData.user }
            };
        }

        return {
            status: 404,
            data: { success: false, message: 'Endpoint não encontrado.' }
        };
    }

    // Intercept Axios
    if (window.axios) {
        const originalAxiosPost = window.axios.post;
        window.axios.post = async function (url, data, config) {
            if (url && (url.includes('/api/login') || url.includes('/api/register'))) {
                const response = await mockApiCall(url, data);
                if (response.status >= 400) {
                    const err = new Error(response.data.message || 'Erro na requisição');
                    err.response = response;
                    throw err;
                }
                return response;
            }
            if (originalAxiosPost) {
                return originalAxiosPost.apply(window.axios, arguments);
            }
            throw new Error('Axios post indisponível');
        };
    }

    // Public API
    window.AuthService = {
        hashPassword,
        login: async (credentials) => mockApiCall('/api/login', credentials),
        register: async (userData) => mockApiCall('/api/register', userData),
        getSession: () => {
            const sess = localStorage.getItem(STORAGE_KEY_SESSION) || sessionStorage.getItem(STORAGE_KEY_SESSION);
            return sess ? JSON.parse(sess) : null;
        },
        logout: () => {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
            localStorage.removeItem(STORAGE_KEY_SESSION);
            sessionStorage.removeItem(STORAGE_KEY_SESSION);
        }
    };
})();
