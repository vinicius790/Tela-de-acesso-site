/**
 * unit-tests.js - Interactive Test Suite & Assertion Runner for Tela-de-acesso-site
 * Tests: CPF validation, password strength, masks, email validation, XSS sanitization,
 * Web Cryptography SHA-256, ViaCEP service, and LocalStorage auth mock.
 */

(function () {
    'use strict';

    function escapeHTML(str) {
        return (str || '').replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    // --- TEST RUNNER CLASS ---
    class TestRunner {
        constructor() {
            this.tests = [];
            this.passedCount = 0;
            this.failedCount = 0;
            this.totalTime = 0;
        }

        add(name, fn) {
            this.tests.push({ name, fn });
        }

        async run() {
            this.passedCount = 0;
            this.failedCount = 0;
            const startTime = performance.now();
            const resultsContainer = document.getElementById('test-results');
            if (resultsContainer) resultsContainer.innerHTML = '';

            for (const test of this.tests) {
                const testStart = performance.now();
                let passed = false;
                let errorMsg = '';

                try {
                    await test.fn();
                    passed = true;
                    this.passedCount++;
                } catch (err) {
                    passed = false;
                    this.failedCount++;
                    errorMsg = err.message + (err.stack ? '\n' + err.stack : '');
                }

                const testDuration = (performance.now() - testStart).toFixed(2);
                this.renderTestResult(test.name, passed, errorMsg, testDuration);
            }

            this.totalTime = (performance.now() - startTime).toFixed(2);
            this.renderSummary();
        }

        renderTestResult(name, passed, errorMsg, duration) {
            const container = document.getElementById('test-results');
            if (!container) return;

            const item = document.createElement('div');
            item.className = `test-item ${passed ? 'passed' : 'failed'}`;
            item.innerHTML = `
                <div class="test-header" onclick="this.parentElement.classList.toggle('expanded')">
                    <span class="test-name">
                        <span>${passed ? '✅' : '❌'}</span>
                        <span>${escapeHTML(name)}</span>
                    </span>
                    <span class="test-duration">${duration}ms</span>
                </div>
                ${errorMsg ? `<div class="test-error"><pre>${escapeHTML(errorMsg)}</pre></div>` : ''}
            `;
            container.appendChild(item);
        }

        renderSummary() {
            const summaryEl = document.getElementById('test-summary');
            if (!summaryEl) return;

            const total = this.tests.length;
            const hasFailures = this.failedCount > 0;
            const rate = total > 0 ? ((this.passedCount / total) * 100).toFixed(0) : 0;

            summaryEl.innerHTML = `
                <div class="summary-card ${hasFailures ? 'has-failures' : 'success'}">
                    <h3>${hasFailures ? '⚠️ Alguns Testes Falharam' : '🎉 Todos os Testes Passaram com Sucesso!'}</h3>
                    <div class="summary-stats">
                        <div class="stat-item">
                            <span class="stat-label">Total de Testes</span>
                            <span class="stat-value">${total}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Passaram</span>
                            <span class="stat-value text-success">${this.passedCount}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Falharam</span>
                            <span class="stat-value ${hasFailures ? 'text-danger' : ''}">${this.failedCount}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Taxa de Sucesso</span>
                            <span class="stat-value text-success">${rate}%</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Tempo Total</span>
                            <span class="stat-value">${this.totalTime}ms</span>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    // --- ASSERTIONS HELPER ---
    const assert = {
        isTrue(val, msg = 'Esperava valor verdadeiro') {
            if (val !== true) throw new Error(`${msg} (Recebido: ${val})`);
        },
        isFalse(val, msg = 'Esperava valor falso') {
            if (val !== false) throw new Error(`${msg} (Recebido: ${val})`);
        },
        equal(actual, expected, msg = 'Valores não são iguais') {
            if (actual !== expected) throw new Error(`${msg} (Esperado: ${expected}, Recebido: ${actual})`);
        },
        notEqual(actual, expected, msg = 'Valores deveriam ser diferentes') {
            if (actual === expected) throw new Error(`${msg} (Valor: ${actual})`);
        },
        includes(str, substr, msg = 'String não contém o trecho esperado') {
            if (!str || !str.includes(substr)) throw new Error(`${msg} (Texto: "${str}", Esperava conter: "${substr}")`);
        }
    };

    // --- DEFINIÇÃO DOS TESTES ---
    const runner = new TestRunner();

    // 1. Testes de CPF
    runner.add('CPF: Deve aceitar CPFs matematicamente válidos conhecidos', () => {
        // CPFs válidos conhecidos
        const validCpfs = ['52998224725', '11144477735', '00000000191'];
        validCpfs.forEach(cpf => {
            assert.isTrue(window.Validators.validateCPF(cpf), `Deveria aceitar CPF válido: ${cpf}`);
        });
    });

    runner.add('CPF: Deve rejeitar sequências de dígitos repetidos (ex: 111.111.111-11)', () => {
        const invalidIdentical = [
            '00000000000', '11111111111', '22222222222',
            '33333333333', '44444444444', '55555555555'
        ];
        invalidIdentical.forEach(cpf => {
            assert.isFalse(window.Validators.validateCPF(cpf), `Deveria rejeitar dígito repetido: ${cpf}`);
        });
    });

    runner.add('CPF: Deve rejeitar CPFs com dígitos verificadores corrompidos', () => {
        assert.isFalse(window.Validators.validateCPF('52998224720'), 'Deveria rejeitar último dígito incorreto');
        assert.isFalse(window.Validators.validateCPF('12345678900'), 'Deveria rejeitar CPF inválido aleatório');
        assert.isFalse(window.Validators.validateCPF('123'), 'Deveria rejeitar CPF incompleto');
    });

    // 2. Testes de Força de Senha
    runner.add('Senha: Deve pontuar senhas conforme entropia e complexidade', () => {
        const weak = window.Validators.getPasswordStrength('12345');
        assert.equal(weak.level, 'weak', 'Senha curta deve ser fraca');
        assert.isTrue(weak.score < 50, 'Score fraco deve ser < 50');

        const strong = window.Validators.getPasswordStrength('Kakaroto#2026!Super');
        assert.isTrue(strong.score >= 80, 'Senha com maiúsculas, números e símbolos deve ser forte');
        assert.isTrue(strong.requirements.hasUppercase, 'Deve detectar maiúscula');
        assert.isTrue(strong.requirements.hasSpecial, 'Deve detectar caractere especial');
    });

    // 3. Testes de Máscaras
    runner.add('Máscaras: Deve formatar CPF (000.000.000-00)', () => {
        const masked = window.Validators.masks.cpf('52998224725');
        assert.equal(masked, '529.982.247-25', 'Máscara de CPF incorreta');
    });

    runner.add('Máscaras: Deve formatar Telefone móvel BR ((00) 00000-0000)', () => {
        const masked = window.Validators.masks.phone('11987654321');
        assert.equal(masked, '(11) 98765-4321', 'Máscara de celular incorreta');
    });

    runner.add('Máscaras: Deve formatar CEP (00000-000)', () => {
        const masked = window.Validators.masks.cep('01310100');
        assert.equal(masked, '01310-100', 'Máscara de CEP incorreta');
    });

    // 4. Testes de E-mail RFC 5322
    runner.add('E-mail: Validação de formatos válidos e inválidos', () => {
        assert.isTrue(window.Validators.validateEmail('usuario@dominio.com.br'), 'Deveria aceitar email normal');
        assert.isTrue(window.Validators.validateEmail('goku.saiyan+treino@capsule.corp'), 'Deveria aceitar subendereçamento');
        assert.isFalse(window.Validators.validateEmail('email-sem-arroba.com'), 'Deveria rejeitar email sem @');
        assert.isFalse(window.Validators.validateEmail('usuario@.com'), 'Deveria rejeitar domínio inválido');
    });

    // 5. Testes de Segurança & XSS
    runner.add('Segurança: Deve sanitizar tags HTML e atributos maliciosos (XSS)', () => {
        const malicious = '<script>alert("xss")</script><img src=x onerror=alert(1)><b>Texto</b>';
        const clean = window.Security.sanitizeHTML(malicious);
        assert.isFalse(clean.includes('<script>'), 'Não deve conter tag script');
        assert.isFalse(clean.includes('onerror='), 'Não deve conter evento onerror');
        assert.includes(clean, 'Texto', 'Deve preservar texto seguro');
    });

    // 6. Teste da Web Cryptography API (SHA-256)
    runner.add('Web Cryptography API: Deve gerar hash SHA-256 consistente', async () => {
        assert.isTrue(typeof window.AuthService?.hashPassword === 'function', 'AuthService.hashPassword deve existir');
        const hash1 = await window.AuthService.hashPassword('senhaSuperSecreta123');
        const hash2 = await window.AuthService.hashPassword('senhaSuperSecreta123');
        const hashOther = await window.AuthService.hashPassword('outraSenha456');

        assert.equal(hash1, hash2, 'Hashes para o mesmo texto devem ser idênticos');
        assert.notEqual(hash1, hashOther, 'Hashes para textos diferentes devem ser distintos');
        assert.isTrue(hash1.startsWith('sha256_') || hash1.startsWith('hash_'), 'Hash deve possuir prefixo criptográfico');
    });

    // 7. Teste do Serviço de CEP (ViaCEP / BrasilAPI)
    runner.add('API de CEP: Deve validar regra de 8 dígitos e rejeitar CEP malformado', async () => {
        assert.isTrue(typeof window.cepService?.fetchAddress === 'function', 'cepService.fetchAddress deve existir');
        const invalidRes = await window.cepService.fetchAddress('123');
        assert.isFalse(invalidRes.success, 'Deve rejeitar CEP com menos de 8 dígitos');
    });

    // 8. Teste de Autenticação e Mock Backend
    runner.add('Mock Backend: Deve autenticar e emitir token JWT de sessão', async () => {
        assert.isTrue(typeof window.AuthService?.login === 'function', 'AuthService.login deve existir');
        const res = await window.AuthService.login({
            username: 'test_user_unit',
            password: 'Password#2026',
            cpf: '52998224725'
        });

        assert.isTrue(res.data.success, 'Login deve retornar sucesso');
        assert.isTrue(typeof res.data.token === 'string', 'Deve retornar um token JWT');
        assert.includes(res.data.token, '.', 'JWT deve conter separadores de ponto (Header.Payload.Signature)');
    });

    window.runUnitTests = () => runner.run();

    // Auto-run when page loads
    window.addEventListener('DOMContentLoaded', () => {
        runner.run();
    });
})();
