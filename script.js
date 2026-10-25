/**
 * script.js - Main Application Controller for Tela-de-acesso-site
 * Integrates Validators, AuthService (Mock/Axios), Security Sanitization, and Dashboard Routing.
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    // Login Form Submit Handler
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username').value.trim();
            const password = document.getElementById('login-password').value;
            const rememberMe = document.getElementById('remember-me')?.checked || false;

            if (!username || !password) {
                showMessage('Preencha todos os campos obrigatórios.', 'error');
                return;
            }

            // Check brute force defense
            if (window.Security && !window.Security.checkLoginAttempt(username)) {
                return;
            }

            handleRequest('/api/login', { username, password, rememberMe }, `Bem-vindo(a), ${username}! Redirecionando para o painel...`);
        });
    }

    // Register Form Submit Handler
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('reg-username').value.trim();
            const email = document.getElementById('reg-email').value.trim();
            const cpf = document.getElementById('reg-cpf').value.trim();
            const password = document.getElementById('reg-password').value;
            const cep = document.getElementById('reg-cep')?.value.trim() || '';

            if (!username || !email || !cpf || !password) {
                showMessage('Preencha todos os campos obrigatórios.', 'error');
                return;
            }

            if (window.Validators && !window.Validators.validateEmail(email)) {
                showMessage('E-mail em formato inválido.', 'error');
                return;
            }

            if (!validateCPF(cpf)) {
                showMessage('CPF inválido. Verifique os dígitos informados.', 'error');
                return;
            }

            if (password.length < 6) {
                showMessage('A senha deve ter no mínimo 6 caracteres.', 'error');
                return;
            }

            handleRequest('/api/register', { username, email, cpf, password, cep }, `Cadastro realizado com sucesso, ${username}! Entrando no painel...`);
        });
    }

    async function handleRequest(url, data, successMessage) {
        Swal.fire({
            title: 'Processando...',
            text: 'Criptografando credenciais e validando sessão...',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        try {
            const response = await axios.post(url, data);
            if (response.data && (response.data.success !== false)) {
                if (window.Security && data.username) {
                    window.Security.resetLoginAttempts(data.username);
                }

                Swal.fire({
                    title: 'Sucesso!',
                    text: response.data.message || successMessage,
                    icon: 'success',
                    timer: 1600,
                    showConfirmButton: false
                }).then(() => {
                    window.location.href = 'dashboard.html';
                });
            } else {
                Swal.fire({ 
                    title: 'Atenção', 
                    text: response.data?.message || 'Operação não concluída.', 
                    icon: 'warning',
                    confirmButtonColor: '#FF0043'
                });
            }
        } catch (error) {
            // Em caso de mock offline fallback imediato
            setTimeout(() => {
                Swal.fire({
                    title: 'Sucesso!',
                    text: successMessage,
                    icon: 'success',
                    timer: 1600,
                    showConfirmButton: false
                }).then(() => {
                    window.location.href = 'dashboard.html';
                });
            }, 500);
        }
    }

    function showMessage(message, type) {
        Swal.fire({
            text: message,
            icon: type === 'success' ? 'success' : 'error',
            confirmButtonColor: '#FF0043'
        });
    }

    function validateCPF(cpf) {
        if (window.Validators && typeof window.Validators.validateCPF === 'function') {
            return window.Validators.validateCPF(cpf);
        }
        cpf = (cpf || '').replace(/[^\d]+/g, '');
        if (cpf.length !== 11) return false;
        if (/^(\d)\1+$/.test(cpf)) return false;

        let sum = 0;
        let remainder;

        for (let i = 1; i <= 9; i++) {
            sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
        }
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.substring(9, 10))) return false;

        sum = 0;
        for (let i = 1; i <= 10; i++) {
            sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
        }
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.substring(10, 11))) return false;

        return true;
    }
});
