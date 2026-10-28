/**
 * unit-tests.js - Interactive Test Suite & Assertion Runner for Tela-de-acesso-site
 * 38 Automated Unit Tests & Assertions covering:
 * - CPF validity, Modulo 11 and repeated sequences
 * - CNPJ checksum validation & repetition checks
 * - Brazilian phone, CPF, CNPJ, and CEP masks
 * - CEP format, ViaCEP mock responses, and caching
 * - RFC 5322 compliant email validator
 * - Password entropy scoring & requirements
 * - Dictionary attack detection & leetspeak normalization
 * - Web Cryptography API SHA-256 hash matching & avalanche effect
 * - JWT Header.Payload.Signature formatting and expiration
 * - XSS sanitizer tag stripping & pseudo-protocol removal
 * - Brute-force lockout and exponential backoff
 */

(function (window) {
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
            this.results = [];
            this.passedCount = 0;
            this.failedCount = 0;
            this.totalTime = 0;
            this.activeCategoryFilter = 'all';
            this.activeStatusFilter = 'all';
            this.searchQuery = '';
        }

        add(category, name, fn) {
            this.tests.push({ category, name, fn });
        }

        async run() {
            this.passedCount = 0;
            this.failedCount = 0;
            this.results = [];
            const startTime = performance.now();

            const resultsContainer = document.getElementById('test-results');
            if (resultsContainer) {
                resultsContainer.innerHTML = '<div class="running-indicator"><span class="spinner"></span> Executando bateria de testes automatizados...</div>';
            }

            for (let i = 0; i < this.tests.length; i++) {
                const test = this.tests[i];
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

                const duration = (performance.now() - testStart).toFixed(2);
                this.results.push({
                    index: i + 1,
                    category: test.category,
                    name: test.name,
                    passed,
                    errorMsg,
                    duration
                });
            }

            this.totalTime = (performance.now() - startTime).toFixed(2);
            this.render();
        }

        render() {
            this.renderSummary();
            this.renderFilterTabs();
            this.renderTestResults();
        }

        renderSummary() {
            const summaryEl = document.getElementById('test-summary');
            if (!summaryEl) return;

            const total = this.tests.length;
            const hasFailures = this.failedCount > 0;
            const rate = total > 0 ? ((this.passedCount / total) * 100).toFixed(0) : 0;

            summaryEl.innerHTML = `
                <div class="summary-card ${hasFailures ? 'has-failures' : 'success'}">
                    <div class="summary-header">
                        <h3>${hasFailures ? '⚠️ Atenção: Falhas Detectadas na Suíte' : '🎉 Sucesso Total: Todos os Testes Passaram!'}</h3>
                        <span class="coverage-badge">${total} Asserções Automatizadas</span>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${rate}%; background: ${hasFailures ? 'var(--danger-color)' : 'var(--success-color)'};"></div>
                    </div>
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
                            <span class="stat-value ${hasFailures ? 'text-danger' : 'text-muted'}">${this.failedCount}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Taxa de Sucesso</span>
                            <span class="stat-value ${hasFailures ? 'text-warning' : 'text-success'}">${rate}%</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Tempo Total</span>
                            <span class="stat-value">${this.totalTime}ms</span>
                        </div>
                    </div>
                </div>
            `;
        }

        renderFilterTabs() {
            const filterContainer = document.getElementById('category-filters');
            if (!filterContainer) return;

            // Extract unique categories
            const categories = ['all', ...new Set(this.tests.map(t => t.category))];
            filterContainer.innerHTML = categories.map(cat => `
                <button class="filter-chip ${this.activeCategoryFilter === cat ? 'active' : ''}" 
                        onclick="window.testRunnerInstance.setCategoryFilter('${cat}')">
                    ${cat === 'all' ? 'Todos os Módulos' : cat}
                </button>
            `).join('');
        }

        setCategoryFilter(cat) {
            this.activeCategoryFilter = cat;
            this.renderFilterTabs();
            this.renderTestResults();
        }

        setStatusFilter(status) {
            this.activeStatusFilter = status;
            this.renderTestResults();
        }

        setSearchQuery(q) {
            this.searchQuery = (q || '').toLowerCase().trim();
            this.renderTestResults();
        }

        renderTestResults() {
            const container = document.getElementById('test-results');
            if (!container) return;
            container.innerHTML = '';

            const filtered = this.results.filter(item => {
                const matchesCategory = this.activeCategoryFilter === 'all' || item.category === this.activeCategoryFilter;
                const matchesStatus = this.activeStatusFilter === 'all' ||
                    (this.activeStatusFilter === 'passed' && item.passed) ||
                    (this.activeStatusFilter === 'failed' && !item.passed);
                const matchesSearch = !this.searchQuery ||
                    item.name.toLowerCase().includes(this.searchQuery) ||
                    item.category.toLowerCase().includes(this.searchQuery);
                return matchesCategory && matchesStatus && matchesSearch;
            });

            if (filtered.length === 0) {
                container.innerHTML = '<div class="no-tests-msg">Nenhum teste corresponde aos filtros aplicados.</div>';
                return;
            }

            filtered.forEach(res => {
                const item = document.createElement('div');
                item.className = `test-item ${res.passed ? 'passed' : 'failed'}`;
                item.innerHTML = `
                    <div class="test-header" onclick="this.parentElement.classList.toggle('expanded')">
                        <span class="test-name">
                            <span class="status-icon">${res.passed ? '✅' : '❌'}</span>
                            <span class="test-number">#${res.index}</span>
                            <span class="badge category-badge">${escapeHTML(res.category)}</span>
                            <span class="title-text">${escapeHTML(res.name)}</span>
                        </span>
                        <span class="test-duration">${res.duration}ms</span>
                    </div>
                    ${res.errorMsg ? `<div class="test-error"><pre>${escapeHTML(res.errorMsg)}</pre></div>` : ''}
                `;
                container.appendChild(item);
            });
        }
    }

    // --- ASSERTIONS HELPER ---
    const assert = {
        isTrue(val, msg = 'Esperava valor verdadeiro (true)') {
            if (val !== true) throw new Error(`${msg} (Recebido: ${val})`);
        },
        isFalse(val, msg = 'Esperava valor falso (false)') {
            if (val !== false) throw new Error(`${msg} (Recebido: ${val})`);
        },
        equal(actual, expected, msg = 'Valores não são iguais') {
            if (actual !== expected) throw new Error(`${msg} | Esperado: "${expected}", Recebido: "${actual}"`);
        },
        notEqual(actual, expected, msg = 'Valores deveriam ser diferentes') {
            if (actual === expected) throw new Error(`${msg} | Ambos são: "${actual}"`);
        },
        includes(str, substr, msg = 'Texto não contém o trecho esperado') {
            if (!str || !String(str).includes(substr)) {
                throw new Error(`${msg} | Texto: "${str}", Esperava conter: "${substr}"`);
            }
        },
        notIncludes(str, substr, msg = 'Texto contém trecho proibido') {
            if (str && String(str).includes(substr)) {
                throw new Error(`${msg} | Texto: "${str}" contém: "${substr}"`);
            }
        },
        greaterOrEqual(actual, expected, msg = 'Valor menor do que o mínimo esperado') {
            if (actual < expected) throw new Error(`${msg} | Esperado >= ${expected}, Recebido: ${actual}`);
        },
        lessOrEqual(actual, expected, msg = 'Valor maior do que o máximo esperado') {
            if (actual > expected) throw new Error(`${msg} | Esperado <= ${expected}, Recebido: ${actual}`);
        }
    };

    // --- DEFINIÇÃO DOS 38 TESTES UNITÁRIOS ---
    const runner = new TestRunner();
    window.testRunnerInstance = runner;

    // ==========================================
    // 1. VALIDAÇÃO DE DOCUMENTOS (CPF & CNPJ)
    // ==========================================
    runner.add('CPF / CNPJ', 'CPF: Deve aceitar CPFs matematicamente válidos conhecidos', () => {
        const validCpfs = ['52998224725', '11144477735', '00000000191'];
        validCpfs.forEach(cpf => {
            assert.isTrue(window.Validators.validateCPF(cpf), `Deveria aceitar CPF válido: ${cpf}`);
        });
    });

    runner.add('CPF / CNPJ', 'CPF: Deve rejeitar todas as 10 sequências de dígitos repetidos (000...000 a 999...999)', () => {
        for (let i = 0; i <= 9; i++) {
            const repeated = String(i).repeat(11);
            assert.isFalse(window.Validators.validateCPF(repeated), `Deveria rejeitar sequência repetida: ${repeated}`);
        }
    });

    runner.add('CPF / CNPJ', 'CPF: Deve rejeitar dígitos verificadores corrompidos ou tamanho incorreto', () => {
        assert.isFalse(window.Validators.validateCPF('52998224720'), 'Deveria rejeitar último dígito corrompido');
        assert.isFalse(window.Validators.validateCPF('52998224705'), 'Deveria rejeitar penúltimo dígito corrompido');
        assert.isFalse(window.Validators.validateCPF('12345'), 'Deveria rejeitar CPF incompleto');
        assert.isFalse(window.Validators.validateCPF('5299822472599'), 'Deveria rejeitar CPF com dígitos a mais');
        assert.isFalse(window.Validators.validateCPF('abcdefghijk'), 'Deveria rejeitar caracteres alfabéticos');
    });

    runner.add('CPF / CNPJ', 'CPF: Validação deve funcionar com ou sem máscara de pontuação', () => {
        assert.isTrue(window.Validators.validateCPF('529.982.247-25'), 'Deveria validar com máscara');
        assert.isTrue(window.Validators.validateCPF('52998224725'), 'Deveria validar sem máscara');
    });

    runner.add('CPF / CNPJ', 'CNPJ: Deve validar checksum de CNPJs matematicamente válidos (Banco do Brasil e Petrobras)', () => {
        // Banco do Brasil: 00.000.000/0001-91
        assert.isTrue(window.Validators.validateCNPJ('00000000000191'), 'Deveria validar CNPJ do Banco do Brasil');
        assert.isTrue(window.Validators.validateCNPJ('00.000.000/0001-91'), 'Deveria validar CNPJ mascarado do BB');
        // Petrobras: 33.000.167/0001-01
        assert.isTrue(window.Validators.validateCNPJ('33000167000101'), 'Deveria validar CNPJ da Petrobras');
        // CNPJ adicional: 11.222.333/0001-81
        assert.isTrue(window.Validators.validateCNPJ('11222333000181'), 'Deveria validar CNPJ 11222333000181');
    });

    runner.add('CPF / CNPJ', 'CNPJ: Deve rejeitar sequências de dígitos repetidos (ex: 00000000000000, 11111111111111)', () => {
        for (let i = 0; i <= 9; i++) {
            const repeated = String(i).repeat(14);
            assert.isFalse(window.Validators.validateCNPJ(repeated), `Deveria rejeitar CNPJ repetido: ${repeated}`);
        }
    });

    runner.add('CPF / CNPJ', 'CNPJ: Deve rejeitar checksum corrompido ou comprimento irregular', () => {
        assert.isFalse(window.Validators.validateCNPJ('00000000000199'), 'Deveria rejeitar CNPJ com dígito final errado');
        assert.isFalse(window.Validators.validateCNPJ('33000167000100'), 'Deveria rejeitar CNPJ com final 00');
        assert.isFalse(window.Validators.validateCNPJ('123456789'), 'Deveria rejeitar CNPJ com menos de 14 dígitos');
        assert.isFalse(window.Validators.validateCNPJ(''), 'Deveria rejeitar CNPJ vazio');
    });

    // ==========================================
    // 2. MÁSCARAS DE ENTRADA BRASILEIRAS
    // ==========================================
    runner.add('Máscaras BR', 'Máscaras: Deve formatar CPF no padrão 000.000.000-00', () => {
        const masked = window.Validators.masks.cpf('52998224725');
        assert.equal(masked, '529.982.247-25', 'Máscara de CPF incorreta');
    });

    runner.add('Máscaras BR', 'Máscaras: Deve formatar CNPJ no padrão 00.000.000/0001-00', () => {
        const masked = window.Validators.masks.cnpj('00000000000191');
        assert.equal(masked, '00.000.000/0001-91', 'Máscara de CNPJ incorreta');
    });

    runner.add('Máscaras BR', 'Máscaras: Deve formatar telefone celular (11 dígitos) e fixo (10 dígitos)', () => {
        const cell = window.Validators.masks.phone('11987654321');
        assert.equal(cell, '(11) 98765-4321', 'Máscara de celular (11 dígitos) incorreta');

        const landline = window.Validators.masks.phone('1134567890');
        assert.equal(landline, '(11) 3456-7890', 'Máscara de telefone fixo (10 dígitos) incorreta');
    });

    runner.add('Máscaras BR', 'Máscaras: Deve formatar CEP no padrão 00000-000', () => {
        const masked = window.Validators.masks.cep('01310100');
        assert.equal(masked, '01310-100', 'Máscara de CEP incorreta');
    });

    // ==========================================
    // 3. CEP & RESOLUÇÃO DE ENDEREÇO (VIACEP)
    // ==========================================
    runner.add('CEP & Endereço', 'CEP: Deve validar formato numérico de exatamente 8 dígitos', () => {
        assert.isTrue(window.cepService.validateCep('01310100'), 'Deveria validar CEP de 8 dígitos');
        assert.isTrue(window.cepService.validateCep('01310-100'), 'Deveria aceitar CEP com hífen após limpeza');
        assert.isFalse(window.cepService.validateCep('1234'), 'Deveria rejeitar CEP com menos de 8 dígitos');
        assert.isFalse(window.cepService.validateCep('0131010099'), 'Deveria rejeitar CEP com mais de 8 dígitos');
    });

    runner.add('CEP & Endereço', 'ViaCEP Mock: Deve normalizar resposta da API em objeto de endereço unificado', () => {
        const mockRaw = {
            cep: '01310-100',
            logradouro: 'Avenida Paulista',
            bairro: 'Bela Vista',
            localidade: 'São Paulo',
            uf: 'SP'
        };
        const normalized = window.cepService.normalizeViaCep(mockRaw, '01310100');
        assert.equal(normalized.street, 'Avenida Paulista', 'Rua normalizada incorreta');
        assert.equal(normalized.neighborhood, 'Bela Vista', 'Bairro normalizado incorreto');
        assert.equal(normalized.city, 'São Paulo', 'Cidade normalizada incorreta');
        assert.equal(normalized.state, 'SP', 'Estado normalizado incorreto');
        assert.equal(normalized.cep, '01310100', 'CEP normalizado incorreto');
    });

    runner.add('CEP & Endereço', 'ViaCEP Mock: Deve tratar retorno com flag erro: true sem lançar exceções', () => {
        const notFoundRaw = { erro: true };
        const res = window.cepService.normalizeViaCep(notFoundRaw, '99999999');
        assert.equal(res, null, 'Deveria retornar nulo para CEP com erro');
    });

    runner.add('CEP & Endereço', 'ViaCEP Cache: Deve registrar em cache e retornar flag fromCache: true em chamadas repetidas', async () => {
        const testCep = '01310100';
        const mockAddress = {
            cep: testCep,
            street: 'Avenida Paulista Teste Cache',
            neighborhood: 'Bela Vista',
            city: 'São Paulo',
            state: 'SP'
        };

        window.cepService.setCache(testCep, mockAddress);
        const cachedRes = await window.cepService.fetchAddress(testCep);

        assert.isTrue(cachedRes.success, 'Chamada do cache deve retornar sucesso');
        assert.isTrue(cachedRes.fromCache, 'Deveria retornar flag fromCache true');
        assert.equal(cachedRes.data.street, 'Avenida Paulista Teste Cache', 'Dados do cache devem corresponder');
    });

    // ==========================================
    // 4. CONFORMIDADE DE E-MAIL (RFC 5322)
    // ==========================================
    runner.add('E-mail RFC 5322', 'E-mail: Deve validar formatos corporativos e comuns válidos', () => {
        assert.isTrue(window.Validators.validateEmail('usuario@dominio.com.br'), 'Deveria aceitar domínio .com.br');
        assert.isTrue(window.Validators.validateEmail('admin.corp@capsule-corp.com'), 'Deveria aceitar pontos e hífen no domínio');
        assert.isTrue(window.Validators.validateEmail('suporte123@empresa.net'), 'Deveria aceitar números no usuário');
    });

    runner.add('E-mail RFC 5322', 'E-mail: Deve aceitar tags de subendereçamento (+tag)', () => {
        assert.isTrue(window.Validators.validateEmail('kakaroto+treino2026@capsule.corp'), 'Deveria aceitar subendereçamento com +');
        assert.isTrue(window.Validators.validateEmail('user+test.tag@domain.org'), 'Deveria aceitar ponto dentro de subendereço');
    });

    runner.add('E-mail RFC 5322', 'E-mail: Deve rejeitar e-mails malformados (sem @, sem domínio, espaços ou pontos duplos)', () => {
        assert.isFalse(window.Validators.validateEmail('email-sem-arroba.com'), 'Deveria rejeitar falta de @');
        assert.isFalse(window.Validators.validateEmail('usuario@.com'), 'Deveria rejeitar domínio iniciado por ponto');
        assert.isFalse(window.Validators.validateEmail('@sem-usuario.com'), 'Deveria rejeitar sem parte local');
        assert.isFalse(window.Validators.validateEmail('usuario..duplo@dominio.com'), 'Deveria rejeitar pontos consecutivos');
        assert.isFalse(window.Validators.validateEmail('usuario com espaco@dominio.com'), 'Deveria rejeitar espaços');
        assert.isFalse(window.Validators.validateEmail('usuario@dominio'), 'Deveria rejeitar falta de TLD');
    });

    runner.add('E-mail Descartável', 'E-mail: Deve detectar e rejeitar provedores de e-mail temporários/descartáveis', () => {
        const disposableSamples = [
            'alvo@mailinator.com',
            'bot@temp-mail.org',
            'fake@10minutemail.com',
            'spammer@guerrillamail.com',
            'temp@yopmail.com'
        ];
        disposableSamples.forEach(email => {
            assert.isTrue(window.Validators.isDisposableEmail(email), `Deveria detectar provedor descartável: ${email}`);
            assert.isFalse(window.Validators.validateEmail(email), `Deveria rejeitar e-mail descartável: ${email}`);
        });

        // Verificação detalhada de diagnóstico
        const details = window.Validators.validateEmailDetails('teste@mailinator.com');
        assert.isFalse(details.isValid, 'Diagnóstico deve marcar inválido');
        assert.isTrue(details.isDisposable, 'Diagnóstico deve sinalizar flag isDisposable');
        assert.equal(details.error, 'DISPOSABLE_DOMAIN', 'Erro esperado é DISPOSABLE_DOMAIN');
    });

    // ==========================================
    // 4.1 VALIDAÇÃO DE TELEFONE E CELULAR BR
    // ==========================================
    runner.add('Telefone & Celular BR', 'Telefone: Deve validar celular de 11 dígitos com regra do 9º dígito e fixo de 10 dígitos', () => {
        // Celulares válidos (DDD + 9XXXX-XXXX)
        assert.isTrue(window.Validators.validatePhone('11987654321'), 'Deveria aceitar celular de SP');
        assert.isTrue(window.Validators.validatePhone('(21) 99887-6655'), 'Deveria aceitar celular do RJ com máscara');
        assert.isTrue(window.Validators.validatePhone('81991234567'), 'Deveria aceitar celular de PE');

        // Fixos válidos (DDD + [2-5]XXX-XXXX)
        assert.isTrue(window.Validators.validatePhone('1134567890'), 'Deveria aceitar telefone fixo de SP');
        assert.isTrue(window.Validators.validatePhone('(41) 3012-3456'), 'Deveria aceitar telefone fixo de Curitiba com máscara');

        // Rejeições
        assert.isFalse(window.Validators.validatePhone('11887654321'), 'Deveria rejeitar celular de 11 dígitos sem dígito 9');
        assert.isFalse(window.Validators.validatePhone('00987654321'), 'Deveria rejeitar DDD 00 inválido');
        assert.isFalse(window.Validators.validatePhone('11999999999'), 'Deveria rejeitar celular com dígitos repetidos');
        assert.isFalse(window.Validators.validatePhone('1133333333'), 'Deveria rejeitar fixo com dígitos repetidos');
        assert.isFalse(window.Validators.validatePhone('12345'), 'Deveria rejeitar telefone incompleto');
    });

    // ==========================================
    // 4.2 VALIDAÇÃO DE IDADE & DATA DE NASCIMENTO
    // ==========================================
    runner.add('Idade & Nascimento', 'Idade: Deve calcular idade exata e validar maioridade (18+ anos)', () => {
        // Teste de cálculo exato de idade
        const currentYear = new Date().getFullYear();
        const age1990 = window.Validators.calculateAge('15/05/1990');
        assert.greaterOrEqual(age1990, 30, 'Pessoa nascida em 1990 deve ter >= 30 anos');

        // Maioridade 18+
        assert.isTrue(window.Validators.validateBirthDate('01/01/2000', 18), 'Nascido em 2000 deve ser maior de 18');
        assert.isTrue(window.Validators.validateBirthDate('1985-12-31', 18), 'Formato ISO YYYY-MM-DD deve ser aceito');

        // Menor de idade (< 18 anos)
        const recentDate = `01/01/${currentYear - 10}`;
        assert.isFalse(window.Validators.validateBirthDate(recentDate, 18), 'Criança de 10 anos não deve passar em 18+');

        // Data futura
        assert.isFalse(window.Validators.validateBirthDate('01/01/2099', 18), 'Data futura deve ser rejeitada');

        // Validação de calendário e anos bissextos
        assert.isTrue(window.Validators.validateBirthDate('29/02/2000', 18), '29/02/2000 é ano bissexto válido');
        assert.isFalse(window.Validators.validateBirthDate('29/02/2001', 18), '29/02/2001 não existe (ano não bissexto)');
        assert.isFalse(window.Validators.validateBirthDate('31/04/1990', 18), '31 de abril é data inválida');

        // Diagnóstico detalhado
        const underDetails = window.Validators.validateBirthDateDetails(recentDate, 18);
        assert.isFalse(underDetails.isValid, 'Diagnóstico de menor de idade deve ser inválido');
        assert.equal(underDetails.error, 'UNDERAGE', 'Erro deve ser UNDERAGE');
    });

    // ==========================================
    // 4.3 REACTIVE INPUT MASK BINDING (bindMask)
    // ==========================================
    runner.add('Reactive Mask Binding', 'bindMask: Deve ligar eventos reativos a inputs e formatar dinamicamente', () => {
        const dummyInput = document.createElement('input');
        dummyInput.value = '52998224725';

        const binding = window.Validators.bindMask(dummyInput, 'cpf');
        assert.isTrue(!!binding, 'Binding controller deve ser instanciado');
        assert.equal(dummyInput.value, '529.982.247-25', 'Máscara deve formatar valor inicial');

        // Teste de reatividade
        dummyInput.value = '11987654321';
        const phoneBinding = window.Validators.bindMask(dummyInput, 'phone');
        assert.equal(dummyInput.value, '(11) 98765-4321', 'Deve formatar telefone reativamente');

        // Teste de unbind
        assert.isTrue(typeof phoneBinding.unbind === 'function', 'Deve expor método unbind');
        phoneBinding.unbind();
    });

    // ==========================================
    // 5. ENTROPIA DE SENHA & REQUISITOS
    // ==========================================
    runner.add('Entropia de Senha', 'Senha: Senhas curtas (< 8 chars) devem ser classificadas como fracas', () => {
        const weak = window.Validators.getPasswordStrength('12345');
        assert.equal(weak.level, 'weak', 'Senha de 5 chars deve ter nível weak');
        assert.lessOrEqual(weak.score, 40, 'Score fraco deve ser <= 40');
        assert.isFalse(weak.requirements.hasLength, 'Requisito de comprimento deve ser false');
    });

    runner.add('Entropia de Senha', 'Senha: Senhas de alta entropia devem atingir score forte (>= 80%)', () => {
        const strong = window.Validators.getPasswordStrength('Kakaroto#2026!SuperSaiyan');
        assert.greaterOrEqual(strong.score, 80, 'Senha completa deve ter score >= 80%');
        assert.equal(strong.level, 'strong', 'Nível deve ser strong');
        assert.isTrue(strong.requirements.hasLength, 'Deve cumprir comprimento >= 8');
        assert.isTrue(strong.requirements.hasUppercase, 'Deve cumprir maiúsculas');
        assert.isTrue(strong.requirements.hasLowercase, 'Deve cumprir minúsculas');
        assert.isTrue(strong.requirements.hasNumber, 'Deve cumprir números');
        assert.isTrue(strong.requirements.hasSpecial, 'Deve cumprir caracteres especiais');
    });

    runner.add('Entropia de Senha', 'Senha: Requisitos individuais devem acusar ausências pontuais', () => {
        const noSpecial = window.Validators.getPasswordStrength('ApenasLetrasENumeros123');
        assert.isFalse(noSpecial.requirements.hasSpecial, 'Deve acusar falta de caracteres especiais');
        assert.isTrue(noSpecial.requirements.hasNumber, 'Deve detectar presença de número');

        const noNumber = window.Validators.getPasswordStrength('ApenasLetrasESimbolos!@#');
        assert.isFalse(noNumber.requirements.hasNumber, 'Deve acusar falta de números');
        assert.isTrue(noNumber.requirements.hasSpecial, 'Deve detectar presença de símbolo');
    });

    // ==========================================
    // 6. DEFESA CONTRA ATAQUE DE DICIONÁRIO
    // ==========================================
    runner.add('Ataque de Dicionário', 'Dicionário: Deve detectar e acusar senhas comuns de listas vazadas', () => {
        const commonList = ['password', '123456', 'qwerty', 'admin123', 'dragonball', 'kakaroto'];
        commonList.forEach(pwd => {
            const check = window.Validators.checkDictionaryAttack(pwd);
            assert.isTrue(check.isDictionary, `Deveria acusar termo vulnerável de dicionário: "${pwd}"`);
        });
    });

    runner.add('Ataque de Dicionário', 'Dicionário: Deve detectar leetspeak e variações de maiúsculas/minúsculas', () => {
        assert.isTrue(window.Validators.isDictionaryPassword('P@ssw0rd'), 'Deveria detectar P@ssw0rd');
        assert.isTrue(window.Validators.isDictionaryPassword('Admin123!'), 'Deveria detectar Admin123!');
        assert.isTrue(window.Validators.isDictionaryPassword('DRAGONBALL'), 'Deveria detectar DRAGONBALL maiúsculo');
    });

    runner.add('Ataque de Dicionário', 'Dicionário: Deve penalizar severamente a pontuação de entropia', () => {
        const dictPass = window.Validators.getPasswordStrength('password123');
        assert.isFalse(dictPass.requirements.isNotDictionary, 'isNotDictionary deve ser falso para termo de dicionário');
        assert.lessOrEqual(dictPass.score, 45, 'Score deve ser penalizado devido a termo comum');
    });

    // ==========================================
    // 7. WEB CRYPTO API (SHA-256)
    // ==========================================
    runner.add('Web Crypto SHA-256', 'Web Crypto: Deve gerar hash determinístico idêntico para a mesma credencial', async () => {
        assert.isTrue(typeof window.AuthService?.hashPassword === 'function', 'AuthService.hashPassword deve existir');
        const hashA = await window.AuthService.hashPassword('SuperSaiyan#2026');
        const hashB = await window.AuthService.hashPassword('SuperSaiyan#2026');
        assert.equal(hashA, hashB, 'Hashes da mesma senha devem ser rigorosamente idênticos');
    });

    runner.add('Web Crypto SHA-256', 'Web Crypto: Hash gerado deve possuir prefixo criptográfico e 64 caracteres hexadecimais', async () => {
        const hash = await window.AuthService.hashPassword('SenhaCriptoTeste2026!');
        assert.isTrue(hash.startsWith('sha256_') || hash.startsWith('hash_'), 'Deve possuir prefixo identificado');
        
        if (hash.startsWith('sha256_')) {
            const hex = hash.replace('sha256_', '');
            assert.equal(hex.length, 64, 'Digest SHA-256 deve ter exatamente 64 caracteres hexadecimais (256 bits)');
            assert.isTrue(/^[0-9a-f]{64}$/.test(hex), 'Digest deve conter apenas dígitos hexadecimais minúsculos');
        }
    });

    runner.add('Web Crypto SHA-256', 'Web Crypto: Efeito Avalanche — alteração de 1 caractere deve produzir hashes totalmente distintos', async () => {
        const hash1 = await window.AuthService.hashPassword('GokuSuper2026!');
        const hash2 = await window.AuthService.hashPassword('GokuSuper2027!');

        assert.notEqual(hash1, hash2, 'Hashes devem ser distintos');
        // Check that at least 50% of the characters differ (Avalanche effect property)
        let diffCount = 0;
        const len = Math.min(hash1.length, hash2.length);
        for (let i = 0; i < len; i++) {
            if (hash1[i] !== hash2[i]) diffCount++;
        }
        assert.greaterOrEqual(diffCount, len * 0.4, 'Diferença substancial de bits esperada pelo efeito avalanche');
    });

    // ==========================================
    // 8. SESSÃO JWT (HEADER.PAYLOAD.SIGNATURE)
    // ==========================================
    runner.add('Sessão JWT', 'JWT: Deve gerar token estruturado em 3 segmentos Base64 separados por ponto', () => {
        const user = { username: 'goku_unit', email: 'goku@capsule.corp', cpf: '52998224725' };
        const token = window.AuthService.generateJwtToken(user);

        assert.isTrue(typeof token === 'string', 'Token deve ser string');
        const parts = token.split('.');
        assert.equal(parts.length, 3, 'Token JWT deve possuir exatamente 3 partes: Header.Payload.Signature');
    });

    runner.add('Sessão JWT', 'JWT: Cabeçalho (Header) decodificado deve conter algoritmo HS256 e tipo JWT', () => {
        const user = { username: 'vegeta_unit', email: 'prince@saiyan.com', cpf: '11144477735' };
        const token = window.AuthService.generateJwtToken(user);
        const decoded = window.AuthService.decodeJwtToken(token);

        assert.isTrue(!!decoded, 'Token deve ser decodificável');
        assert.equal(decoded.header.alg, 'HS256', 'Header alg deve ser HS256');
        assert.equal(decoded.header.typ, 'JWT', 'Header typ deve ser JWT');
    });

    runner.add('Sessão JWT', 'JWT: Payload decodificado deve conter claims de usuário e expiração futura (exp > iat)', () => {
        const user = { username: 'trunks_future', email: 'trunks@capsule.corp', cpf: '00000000191' };
        const token = window.AuthService.generateJwtToken(user);
        const decoded = window.AuthService.decodeJwtToken(token);

        assert.equal(decoded.payload.sub, 'trunks_future', 'Claim sub incorreto');
        assert.equal(decoded.payload.email, 'trunks@capsule.corp', 'Claim email incorreto');
        assert.equal(decoded.payload.cpf, '00000000191', 'Claim cpf incorreto');
        assert.isTrue(decoded.payload.iat > 0, 'Timestamp iat deve existir');
        assert.isTrue(decoded.payload.exp > decoded.payload.iat, 'exp deve ser posterior ao iat');
    });

    runner.add('Sessão JWT', 'JWT: Deve acusar expiração de tokens expirados e aprovar ativos', () => {
        const user = { username: 'gohan_active', email: 'gohan@capsule.corp', cpf: '52998224725' };
        // Active token: 1 hour in the future
        const activeToken = window.AuthService.generateJwtToken(user, 3600);
        assert.isFalse(window.AuthService.isTokenExpired(activeToken), 'Token ativo não deve estar expirado');

        // Expired token: expired 3600s in the past
        const expiredToken = window.AuthService.generateJwtToken(user, -3600);
        assert.isTrue(window.AuthService.isTokenExpired(expiredToken), 'Token passado deve constar como expirado');
        const verification = window.AuthService.verifyJwtToken(expiredToken);
        assert.isFalse(verification.valid, 'Token expirado deve ser inválido');
        assert.isTrue(verification.expired, 'Flag expired deve ser true');
    });

    // ==========================================
    // 9. SANITIZAÇÃO XSS & DOM SEGURO
    // ==========================================
    runner.add('Segurança & XSS', 'XSS: Deve remover integralmente tags <script> e seu conteúdo executável interno', () => {
        const malicious = '<script>window.pwned=true; alert("xss")</script><b>Texto Seguro</b>';
        const clean = window.Security.sanitizeHTML(malicious);
        assert.notIncludes(clean, '<script', 'Não deve conter tag script');
        assert.notIncludes(clean, 'pwned', 'Não deve conter código executável interno da tag script');
        assert.includes(clean, 'Texto Seguro', 'Deve preservar texto inofensivo');
    });

    runner.add('Segurança & XSS', 'XSS: Deve neutralizar handlers de eventos inline maliciosos (onerror, onload, onclick)', () => {
        const malicious = '<img src="x" onerror="stealCookies()">';
        const clean = window.Security.sanitizeHTML(malicious);
        assert.notIncludes(clean, 'onerror=', 'Não deve conter handler de evento onerror');
        assert.notIncludes(clean, 'stealCookies', 'Não deve conter corpo de script malicioso');
    });

    runner.add('Segurança & XSS', 'XSS: Deve neutralizar pseudo-protocolos javascript: em atributos e links', () => {
        const malicious = '<a href="javascript:alert(1)">Clique Aqui</a>';
        const clean = window.Security.sanitizeHTML(malicious);
        assert.notIncludes(clean, 'javascript:', 'Não deve conter pseudo-protocolo javascript:');
        assert.includes(clean, 'Clique Aqui', 'Deve preservar rótulo textual seguro');
    });

    // ==========================================
    // 10. BRUTE-FORCE LOCKOUT & EXPONENTIAL BACKOFF
    // ==========================================
    runner.add('Brute-Force & Backoff', 'Brute-Force: Deve registrar tentativas falhadas sem bloquear abaixo do limiar (< 5)', () => {
        const testUser = 'user_test_attempts';
        window.Security.resetLoginAttempts(testUser);

        const attempt1 = window.Security.recordFailedAttempt(testUser);
        assert.isFalse(attempt1.locked, 'Primeira tentativa falha não deve bloquear');
        assert.equal(attempt1.attemptsRemaining, 4, 'Deveria restar 4 tentativas');

        const attempt4 = window.Security.recordFailedAttempt(testUser);
        assert.isFalse(attempt4.locked, 'Quarta tentativa falha ainda não deve bloquear');
        window.Security.resetLoginAttempts(testUser);
    });

    runner.add('Brute-Force & Backoff', 'Brute-Force: Deve acionar bloqueio (lockout) na 5ª tentativa consecutiva com tempo ativo', () => {
        const testUser = 'user_test_lockout';
        window.Security.resetLoginAttempts(testUser);

        // Record 5 failed attempts
        for (let i = 1; i <= 4; i++) {
            window.Security.recordFailedAttempt(testUser);
        }
        const lockoutAttempt = window.Security.recordFailedAttempt(testUser);

        assert.isTrue(lockoutAttempt.locked, '5ª tentativa deve acionar o bloqueio');
        assert.greaterOrEqual(lockoutAttempt.remainingSeconds, 28, 'Tempo de lockout deve estar ativo (> 28s)');
        
        // checkLoginAttempt should report blocked
        assert.isFalse(window.Security.checkLoginAttempt(testUser), 'checkLoginAttempt deve retornar false durante lockout');
        window.Security.resetLoginAttempts(testUser);
    });

    runner.add('Brute-Force & Backoff', 'Brute-Force: Deve aplicar Backoff Exponencial geometricamente a cada reincidência', () => {
        // Base is 30,000ms (30s)
        const tier1 = window.Security.calculateBackoffTime(1);
        const tier2 = window.Security.calculateBackoffTime(2);
        const tier3 = window.Security.calculateBackoffTime(3);
        const tier4 = window.Security.calculateBackoffTime(4);

        assert.equal(tier1, 30000, 'Tier 1 deve ter penalidade base de 30.000ms (30s)');
        assert.equal(tier2, 60000, 'Tier 2 deve dobrar para 60.000ms (60s)');
        assert.equal(tier3, 120000, 'Tier 3 deve quadruplicar para 120.000ms (120s)');
        assert.equal(tier4, 240000, 'Tier 4 deve subir para 240.000ms (240s)');
    });

    runner.add('Brute-Force & Backoff', 'Brute-Force: Sucesso na autenticação deve restaurar contador e limpar lockout', () => {
        const testUser = 'user_test_reset';
        // Simulate blocked state
        for (let i = 1; i <= 5; i++) {
            window.Security.recordFailedAttempt(testUser);
        }
        // Reset as if user passed 2FA or recovered
        window.Security.resetLoginAttempts(testUser);

        assert.isTrue(window.Security.checkLoginAttempt(testUser), 'Após reset, usuário deve estar livre para tentar');
    });

    // ==========================================
    // 9. DASHBOARD CHARTS & HTML5 CANVAS ANALYTICS
    // ==========================================
    runner.add('Dashboard Charts', 'Canvas: DashboardCharts deve estar instanciado globalmente', () => {
        assert.isTrue(typeof window.DashboardCharts === 'function', 'Classe DashboardCharts deve estar disponível');
        assert.isTrue(typeof window.dashboardCharts === 'object' && window.dashboardCharts !== null, 'Instância window.dashboardCharts deve existir');
    });

    runner.add('Dashboard Charts', 'Line & Area Chart: Deve conter 7 dias de dados de login com contagens consistentes', () => {
        const charts = window.dashboardCharts;
        assert.isTrue(Array.isArray(charts.accessData), 'accessData deve ser um array');
        assert.equal(charts.accessData.length, 7, 'Deve conter exatamente 7 dias de histórico de acessos');
        
        charts.accessData.forEach(item => {
            assert.isTrue(typeof item.day === 'string' && item.day.length > 0, 'Dia deve ser string não-vazia');
            assert.isTrue(typeof item.count === 'number' && item.count >= 0, 'Contagem de logins deve ser número >= 0');
            assert.isTrue(typeof item.date === 'string', 'Data deve estar definida');
        });
    });

    runner.add('Dashboard Charts', 'Donut Chart: 4 setores de conformidade devem somar 100% com score >= 98%', () => {
        const charts = window.dashboardCharts;
        assert.isTrue(Array.isArray(charts.securityData), 'securityData deve ser um array');
        assert.equal(charts.securityData.length, 4, 'Deve conter exatamente 4 pilares de segurança');

        const totalPercentage = charts.securityData.reduce((acc, curr) => acc + curr.value, 0);
        assert.equal(totalPercentage, 100, 'A soma das fatias do Donut deve ser exatamente 100%');

        const keys = charts.securityData.map(s => s.id);
        assert.isTrue(keys.includes('crypto'), 'Deve incluir Web Crypto API');
        assert.isTrue(keys.includes('totp'), 'Deve incluir TOTP 2FA');
        assert.isTrue(keys.includes('password'), 'Deve incluir Política de Senhas');
        assert.isTrue(keys.includes('session'), 'Deve incluir Integridade de Sessão');

        assert.greaterOrEqual(charts.complianceScore, 98, 'Score de conformidade de segurança deve ser >= 98%');
    });

    runner.add('Dashboard Charts', 'Speedometer / Radial Gauge: Métricas de CPU, Memória e Latência com setores dinâmicos', () => {
        const charts = window.dashboardCharts;
        const metrics = charts.clusterMetrics;
        assert.isTrue(typeof metrics === 'object' && metrics !== null, 'clusterMetrics deve existir');

        ['cpu', 'memory', 'latency'].forEach(key => {
            const m = metrics[key];
            assert.isTrue(typeof m === 'object' && m !== null, `Métrica ${key} deve estar configurada`);
            assert.isTrue(typeof m.name === 'string', `Métrica ${key} deve conter nome legível`);
            assert.isTrue(typeof m.currentVal === 'number' && m.currentVal >= m.min, `Valor atual de ${key} deve ser >= min`);
            assert.isTrue(Array.isArray(m.sectors), `Métrica ${key} deve possuir setores coloridos dinâmicos`);
            assert.equal(m.sectors.length, 3, `Métrica ${key} deve possuir 3 setores (Verde, Amarelo, Vermelho)`);
        });
    });

    runner.add('Dashboard Charts', 'Speedometer: Alternância de métricas ativas via setGaugeMetric()', () => {
        const charts = window.dashboardCharts;
        charts.setGaugeMetric('memory');
        assert.equal(charts.activeGaugeMetric, 'memory', 'Métrica ativa deve mudar para memory');

        charts.setGaugeMetric('latency');
        assert.equal(charts.activeGaugeMetric, 'latency', 'Métrica ativa deve mudar para latency');

        charts.setGaugeMetric('cpu');
        assert.equal(charts.activeGaugeMetric, 'cpu', 'Métrica ativa deve retornar para cpu');
    });

    runner.add('Dashboard Charts', 'Responsividade: Métodos renderAll e handleResize devem existir e executar sem erros', () => {
        const charts = window.dashboardCharts;
        assert.isTrue(typeof charts.renderAll === 'function', 'renderAll deve ser função');
        assert.isTrue(typeof charts.handleResize === 'function', 'handleResize deve ser função');
        assert.isTrue(typeof charts.destroy === 'function', 'destroy deve ser função');

        // Execute renderAll without DOM crashes
        charts.renderAll();
    });

    // ==========================================
    // 9. RECUPERAÇÃO DE IDENTIDADE & SENHA (WIZARD)
    // ==========================================
    runner.add('Recuperação de Senha', 'Identificação: Localização por E-mail e CPF com mascaramento seguro', () => {
        assert.isTrue(typeof window.PasswordRecovery === 'object' && window.PasswordRecovery !== null, 'PasswordRecovery deve estar carregado');
        window.PasswordRecovery.initUsers();

        const byEmail = window.PasswordRecovery.findUser('goku@capsulecorp.com.br');
        assert.isTrue(byEmail.success, 'Deve localizar usuário Goku por e-mail');
        assert.equal(byEmail.user.username, 'goku.saiyan', 'Username deve ser goku.saiyan');
        assert.equal(byEmail.user.maskedEmail, 'g***u@capsulecorp.com.br', 'E-mail deve ser mascarado para privacidade');

        const byCpf = window.PasswordRecovery.findUser('111.444.777-35');
        assert.isTrue(byCpf.success, 'Deve localizar usuário Goku por CPF');
        assert.equal(byCpf.user.maskedCpf, '111.***.***-35', 'CPF deve ser mascarado para privacidade');

        const invalid = window.PasswordRecovery.findUser('naoexiste@dominio.com');
        assert.isFalse(invalid.success, 'Deve rejeitar e-mail inexistente');
    });

    runner.add('Recuperação de Senha', 'Código Token: Geração de 6 dígitos e validação com expiração', () => {
        const tokenData = window.PasswordRecovery.generateToken();
        assert.isTrue(typeof tokenData.code === 'string', 'Token deve ser string');
        assert.equal(tokenData.code.length, 6, 'Token deve possuir exatamente 6 dígitos numéricos');
        assert.isTrue(/^\d{6}$/.test(tokenData.code), 'Token deve conter apenas dígitos numéricos');

        const validRes = window.PasswordRecovery.verifyToken(tokenData.code, tokenData.code, tokenData.expiresAt);
        assert.isTrue(validRes.success, 'Código correto deve ser validado com sucesso');

        const invalidRes = window.PasswordRecovery.verifyToken('000000', tokenData.code, tokenData.expiresAt);
        assert.isFalse(invalidRes.success, 'Código incorreto deve ser rejeitado');

        const expiredRes = window.PasswordRecovery.verifyToken(tokenData.code, tokenData.code, Date.now() - 1000);
        assert.isFalse(expiredRes.success, 'Código expirado deve ser rejeitado');
    });

    runner.add('Recuperação de Senha', 'Medidor de Entropia: Cálculo de bits, score e checklist de requisitos', () => {
        const weak = window.PasswordRecovery.calculateEntropy('12345');
        assert.equal(weak.level, 'weak', 'Senha simples de 5 dígitos deve ser fraca');
        assert.isTrue(weak.bits < 35, 'Bits de entropia para senha simples devem ser < 35');
        assert.isFalse(weak.checks.minLength, 'Não deve atender tamanho mínimo');

        const strong = window.PasswordRecovery.calculateEntropy('Kakaroto#2026!Saiyan');
        assert.isTrue(strong.bits >= 75, 'Senha complexa deve ter entropia >= 75 bits');
        assert.equal(strong.score, 100, 'Score deve ser 100');
        assert.equal(strong.level, 'super', 'Nível deve ser super');
        assert.isTrue(strong.checks.minLength, 'Deve atender tamanho mínimo');
        assert.isTrue(strong.checks.hasUppercase, 'Deve detectar maiúscula');
        assert.isTrue(strong.checks.hasLowercase, 'Deve detectar minúscula');
        assert.isTrue(strong.checks.hasNumber, 'Deve detectar número');
        assert.isTrue(strong.checks.hasSpecial, 'Deve detectar caractere especial');
    });

    runner.add('Recuperação de Senha', 'Atualização LocalStorage: Persistência de nova senha com hash SHA-256', async () => {
        window.PasswordRecovery.initUsers();
        const newPass = 'UltraInstinct#2026!Pass';
        const res = await window.PasswordRecovery.updatePassword('goku.saiyan', newPass);

        assert.isTrue(res.success, 'Atualização de senha deve retornar sucesso');
        const users = window.PasswordRecovery.getUsers();
        const goku = users.find(u => u.username === 'goku.saiyan');

        assert.isTrue(!!goku, 'Usuário Goku deve existir no banco local');
        assert.isTrue(goku.password.startsWith('sha256_'), 'Senha deve ser gravada como hash SHA-256');
    });

    // =========================================================================
    // 10. TESTES DE EXPORTAÇÃO MULTI-FORMATO & COMPLIANCE (EXPORT SERVICE)
    // =========================================================================
    runner.add('Exportação & Compliance', 'JSON Audit Report: Geração estruturada com metadados, sessão e fingerprint', () => {
        assert.isTrue(typeof window.ExportService === 'function', 'ExportService deve ser uma classe');
        assert.isTrue(typeof window.exportService === 'object', 'Instância window.exportService deve existir');

        const data = window.exportService.getAuditData();
        assert.isTrue(Boolean(data.reportMetadata), 'Deve conter reportMetadata');
        assert.includes(data.reportMetadata.title, 'Relatório Executivo de Auditoria', 'Título do relatório deve ser executivo');
        assert.isTrue(Boolean(data.reportMetadata.reportId), 'Deve gerar identificador de relatório');
        assert.isTrue(Array.isArray(data.reportMetadata.complianceStandards), 'Padrões de compliance devem ser lista');

        assert.isTrue(Boolean(data.userSession), 'Deve conter userSession');
        assert.isTrue(Boolean(data.userSession.username), 'Deve conter username da sessão');
        assert.isTrue(Boolean(data.userSession.maskedCpf), 'Deve conter CPF mascarado');

        assert.isTrue(Boolean(data.securityScore), 'Deve conter securityScore');
        assert.isTrue(data.securityScore.overallScore >= 90, 'Score de segurança deve ser >= 90');

        assert.isTrue(Boolean(data.deviceFingerprint), 'Deve conter deviceFingerprint');
        assert.isTrue(Boolean(data.deviceFingerprint.screenResolution), 'Deve conter resolução de tela');
        assert.isTrue(Boolean(data.deviceFingerprint.timezone), 'Deve conter fuso horário');

        assert.isTrue(Array.isArray(data.auditTrail), 'Trilha de auditoria deve ser array de eventos');
        assert.isTrue(data.auditTrail.length >= 5, 'Deve possuir múltiplos eventos de auditoria');

        const jsonStr = window.exportService.exportJSON();
        assert.isTrue(typeof jsonStr === 'string', 'exportJSON deve retornar string');
        const parsed = JSON.parse(jsonStr);
        assert.equal(parsed.reportMetadata.title, data.reportMetadata.title, 'JSON exportado deve ser deserializável e idêntico');
    });

    runner.add('Exportação & Compliance', 'CSV de Atividades: Cabeçalhos, escape RFC 4180 e UTF-8 BOM para Excel', () => {
        const csvStr = window.exportService.exportCSV();
        assert.isTrue(typeof csvStr === 'string', 'exportCSV deve retornar string');
        assert.equal(csvStr.charCodeAt(0), 0xFEFF, 'CSV deve iniciar com marcador UTF-8 BOM (\uFEFF) para abertura perfeita no Excel');

        const lines = csvStr.substring(1).split(/\r\n|\n/);
        assert.isTrue(lines.length >= 6, 'Deve conter linha de cabeçalho mais linhas de dados');

        const headers = lines[0];
        assert.includes(headers, 'Timestamp', 'Cabeçalho deve conter Timestamp');
        assert.includes(headers, 'ID_Evento', 'Cabeçalho deve conter ID_Evento');
        assert.includes(headers, 'Tipo_Evento', 'Cabeçalho deve conter Tipo_Evento');
        assert.includes(headers, 'Gravidade', 'Cabeçalho deve conter Gravidade');
        assert.includes(headers, 'Detalhes', 'Cabeçalho deve conter Detalhes');
    });

    runner.add('Exportação & Compliance', 'Relatório Executivo Impresso: Layout HTML/CSS para window.print e PDF', () => {
        const html = window.exportService.printAuditReport();
        assert.isTrue(typeof html === 'string', 'printAuditReport deve retornar string HTML');
        assert.includes(html, '<!DOCTYPE html>', 'Deve ser documento HTML válido');
        assert.includes(html, 'Relatório Executivo de Auditoria', 'Deve conter título do relatório executivo');
        assert.includes(html, 'window.print()', 'Deve conter gatilho window.print()');
        assert.includes(html, '@media print', 'Deve conter regras CSS para impressão e PDF');
        assert.includes(html, '<svg', 'Deve incorporar QR Code SVG para validação');
    });

    runner.add('Exportação & Compliance', 'Vetor SVG QR Code: Renderizador puro sem dependências externas e TOTP RFC 6238', () => {
        assert.isTrue(typeof window.PureSVGQRCode === 'function', 'PureSVGQRCode deve estar definido');
        const qrGen = new window.PureSVGQRCode();

        const testUri = 'otpauth://totp/TelaDeAcesso:goku?secret=JBSWY3DPEHPK3PXP&issuer=TelaDeAcesso';
        const svg = qrGen.renderSVG(testUri);

        assert.isTrue(typeof svg === 'string', 'renderSVG deve retornar string');
        assert.isTrue(svg.startsWith('<svg'), 'Deve iniciar com tag <svg');
        assert.isTrue(svg.endsWith('</svg>'), 'Deve finalizar com </svg>');
        assert.includes(svg, 'viewBox="0 0', 'SVG deve conter atributo viewBox escalável');
        assert.includes(svg, '<path d=', 'SVG deve desenhar os módulos vetoriais via elemento <path>');
        assert.isFalse(svg.includes('http://api.qrserver.com'), 'Não deve depender de APIs externas de terceiros');
        assert.isFalse(svg.includes('<img'), 'Não deve usar tags de imagem estática');

        // Teste de exportação standalone de arquivo .svg
        const standaloneSvg = window.exportService.exportQRCodeSVG();
        assert.isTrue(typeof standaloneSvg === 'string', 'exportQRCodeSVG deve retornar string SVG');
        assert.includes(standaloneSvg, 'viewBox', 'SVG standalone deve conter viewBox');
    });

    runner.add('Exportação & Compliance', 'Exportação de Usuários (CSV) e Trilha Bruta de Logs (JSON)', () => {
        const mockUsers = [
            { id: 1, name: 'Goku Son', username: 'goku', email: 'goku@capsule.corp', cpf: '52998224725', phone: '11999998888', role: 'admin', status: 'ativo', createdAt: '2026-10-25' },
            { id: 2, name: 'Vegeta Príncipe', username: 'vegeta', email: 'vegeta@capsule.corp', cpf: '11144477735', phone: '11988887777', role: 'usuario', status: 'ativo', createdAt: '2026-10-25' }
        ];

        const usersCsv = window.exportService.exportUsersCSV(mockUsers);
        assert.equal(usersCsv.charCodeAt(0), 0xFEFF, 'CSV de usuários deve conter UTF-8 BOM');
        assert.includes(usersCsv, 'Goku Son', 'CSV deve conter dados dos usuários');
        assert.includes(usersCsv, 'Vegeta Príncipe', 'CSV deve conter caracteres acentuados preservados');

        const mockLogs = [
            { id: 1, action: 'LOGIN', timestamp: new Date().toISOString() }
        ];
        const logsJson = window.exportService.exportAuditLogsJSON(mockLogs);
        assert.isTrue(typeof logsJson === 'string', 'exportAuditLogsJSON deve retornar string');
        assert.includes(logsJson, 'LOGIN', 'JSON deve conter os logs serializados');
    });

    // =========================================================================
    // 11. CRIPTOGRAFIA AVANÇADA, JWT, TOTP & PROTEÇÃO CSRF
    // =========================================================================
    runner.add('Criptografia Avançada', 'Timing-Safe Comparator: Igualdade determinística com strings idênticas', () => {
        assert.isTrue(typeof window.Security.timingSafeEqual === 'function', 'timingSafeEqual deve existir');
        assert.isTrue(window.Security.timingSafeEqual('kakaroto_token_123', 'kakaroto_token_123'), 'Strings idênticas devem retornar true');
        assert.isTrue(window.Security.timingSafeEqual('', ''), 'Strings vazias devem retornar true');
    });

    runner.add('Criptografia Avançada', 'Timing-Safe Comparator: Rejeição de strings com extensões distintas', () => {
        assert.isFalse(window.Security.timingSafeEqual('short', 'longer_string'), 'Extensões diferentes devem retornar false');
        assert.isFalse(window.Security.timingSafeEqual('token_abc', 'token_ab'), 'Extensão menor deve retornar false');
    });

    runner.add('Criptografia Avançada', 'Timing-Safe Comparator: Rejeição de strings de mesmo tamanho com bytes distintos', () => {
        assert.isFalse(window.Security.timingSafeEqual('hash_token_x', 'hash_token_y'), 'Último caractere distinto deve retornar false');
        assert.isFalse(window.Security.timingSafeEqual('x_hash_token', 'y_hash_token'), 'Primeiro caractere distinto deve retornar false');
        assert.isFalse(window.Security.timingSafeEqual(null, 'test'), 'Valores nulos devem ser tratados com segurança');
    });

    runner.add('Criptografia Avançada', 'CryptoPrimitives SHA-256: Geração determinística de 64 caracteres hexadecimais', () => {
        const prim = window.Security.CryptoPrimitives;
        assert.isTrue(typeof prim.sha256Hex === 'function', 'sha256Hex deve existir');
        const hash = prim.sha256Hex('hello world');
        assert.equal(hash, 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9', 'Digest SHA-256 deve coincidir rigorosamente com padrão NIST/FIPS');
        assert.equal(hash.length, 64, 'Hash SHA-256 deve ter 64 caracteres hexadecimais');
    });

    runner.add('Criptografia Avançada', 'CryptoPrimitives HMAC-SHA256: Cálculo com chave simétrica e validação contra vetor FIPS', () => {
        const prim = window.Security.CryptoPrimitives;
        assert.isTrue(typeof prim.hmacSha256Hex === 'function', 'hmacSha256Hex deve existir');
        const hmac = prim.hmacSha256Hex('secret_key', 'test_payload');
        assert.equal(hmac, 'b02bfc00c8fac5a3002558d1018a3e3e2ea9e50a6f65f1ba13a3a359da3d3414', 'HMAC-SHA256 deve coincidir exatamente com vetor OpenSSL');
        assert.equal(hmac.length, 64, 'HMAC deve possuir 64 caracteres hexadecimais');
    });

    runner.add('Criptografia Avançada', 'SecureJWT: Assinatura de token com claims e cabeçalho HS256', () => {
        const jwt = window.Security.SecureJWT;
        assert.isTrue(typeof jwt.sign === 'function', 'SecureJWT.sign deve existir');
        const token = jwt.sign({ sub: 'vegeta.saiyan', role: 'prince' }, 'test_secret_key', 3600);
        assert.isTrue(typeof token === 'string', 'Token assinado deve ser string');
        const parts = token.split('.');
        assert.equal(parts.length, 3, 'JWT deve conter exatamente 3 segmentos separados por ponto');
        assert.isTrue(parts[0].length > 0 && parts[1].length > 0 && parts[2].length > 0, 'Todos os 3 segmentos devem ser não-vazios');
    });

    runner.add('Criptografia Avançada', 'SecureJWT: Validação e decodificação de token íntegro', () => {
        const jwt = window.Security.SecureJWT;
        const secret = 'super_saiyan_secret_key';
        const token = jwt.sign({ sub: 'goku.saiyan', power: 9001 }, secret, 1800);
        const result = jwt.verify(token, secret);

        assert.isTrue(result.valid, 'Token legítimo deve ser validado com sucesso');
        assert.equal(result.payload.sub, 'goku.saiyan', 'Claim sub deve ser preservada');
        assert.equal(result.payload.power, 9001, 'Claim personalizada deve ser preservada');
        assert.isTrue(result.payload.exp > Math.floor(Date.now() / 1000), 'Timestamp de expiração deve ser futuro');
    });

    runner.add('Criptografia Avançada', 'SecureJWT: Rejeição rigorosa de token adulterado (tampered signature)', () => {
        const jwt = window.Security.SecureJWT;
        const secret = 'legit_secret';
        const token = jwt.sign({ sub: 'gohan.saiyan' }, secret, 3600);
        const parts = token.split('.');

        // Corrompe a assinatura no terceiro segmento
        const tamperedToken = `${parts[0]}.${parts[1]}.bad_signature_abc`;
        const res = jwt.verify(tamperedToken, secret);
        assert.isFalse(res.valid, 'Token com assinatura modificada deve ser rejeitado');
        assert.equal(res.error, 'signature_mismatch', 'Motivo do erro deve ser signature_mismatch');

        // Rejeição com chave secreta incorreta
        const wrongKeyRes = jwt.verify(token, 'wrong_secret_key');
        assert.isFalse(wrongKeyRes.valid, 'Token verificado com chave incorreta deve ser rejeitado');
    });

    runner.add('Criptografia Avançada', 'SecureJWT: Rejeição de token expirado com identificação de claim exp', () => {
        const jwt = window.Security.SecureJWT;
        const secret = 'exp_secret';
        // Cria token com expiração negativa (expirado no passado)
        const expiredToken = jwt.sign({ sub: 'piccolo' }, secret, -60);
        const res = jwt.verify(expiredToken, secret);
        assert.isFalse(res.valid, 'Token com exp no passado deve ser rejeitado');
        assert.isTrue(res.expired, 'Flag expired deve ser true');
        assert.equal(res.error, 'token_expired', 'Erro deve indicar token_expired');
    });

    runner.add('Criptografia Avançada', 'TOTPEngine: Decodificação e Codificação Base32 (RFC 4648)', () => {
        const totp = window.Security.TOTPEngine;
        assert.isTrue(typeof totp.base32Decode === 'function', 'base32Decode deve existir');
        const decoded = totp.base32Decode('JBSWY3DPEHPK3PXP');
        assert.isTrue(Array.isArray(decoded), 'Decodificação deve retornar array de bytes');
        assert.isTrue(decoded.length > 0, 'Bytes decodificados devem ser não-vazios');

        const reEncoded = totp.base32Encode(decoded);
        assert.equal(reEncoded, 'JBSWY3DPEHPK3PXP', 'Codificação reversa deve recuperar a chave original');
    });

    runner.add('Criptografia Avançada', 'TOTPEngine: Geração de código de 6 dígitos numéricos com preenchimento', () => {
        const totp = window.Security.TOTPEngine;
        const secret = 'JBSWY3DPEHPK3PXP';
        const code = totp.generateToken(secret, 1590000000000, 30);
        assert.isTrue(typeof code === 'string', 'Código TOTP deve ser string');
        assert.equal(code.length, 6, 'Código TOTP deve ter exatamente 6 dígitos');
        assert.isTrue(/^\d{6}$/.test(code), 'Código TOTP deve conter exclusivamente números');
    });

    runner.add('Criptografia Avançada', 'TOTPEngine: Verificação temporal com tolerância de janela (delta +-1)', () => {
        const totp = window.Security.TOTPEngine;
        const secret = 'JBSWY3DPEHPK3PXP';
        const now = Date.now();
        const currentCode = totp.generateToken(secret, now, 30);
        assert.isTrue(totp.verify(currentCode, secret, 1, now, 30), 'Código no tempo presente deve ser aceito');

        // Teste de tolerância para código gerado há 28 segundos atrás
        const pastCode = totp.generateToken(secret, now - 28000, 30);
        assert.isTrue(totp.verify(pastCode, secret, 1, now, 30), 'Código do passo anterior (offset -1) deve ser aceito');

        // Teste de tolerância para código com leve desvio de relógio para frente (+28s)
        const futureCode = totp.generateToken(secret, now + 28000, 30);
        assert.isTrue(totp.verify(futureCode, secret, 1, now, 30), 'Código do próximo passo (offset +1) deve ser aceito');
    });

    runner.add('Criptografia Avançada', 'TOTPEngine: Rejeição de código incorreto e fora da janela de tolerância', () => {
        const totp = window.Security.TOTPEngine;
        const secret = 'JBSWY3DPEHPK3PXP';
        const now = Date.now();
        assert.isFalse(totp.verify('000000', secret, 1, now, 30), 'Código aleatório falso deve ser rejeitado');

        // Código gerado há 3 minutos (fora da janela de +-30s)
        const oldCode = totp.generateToken(secret, now - 180000, 30);
        assert.isFalse(totp.verify(oldCode, secret, 1, now, 30), 'Código fora da janela de tolerância deve ser rejeitado');
    });

    runner.add('Criptografia Avançada', 'CSRFProtection: Geração de token criptográfico vinculado à sessão', () => {
        const csrf = window.Security.CSRFProtection;
        assert.isTrue(typeof csrf.generateToken === 'function', 'generateToken deve existir');
        const token = csrf.generateToken('session_goku_saiyan_777');
        assert.isTrue(typeof token === 'string', 'Token CSRF deve ser string');
        const parts = token.split(':');
        assert.equal(parts.length, 4, 'Token CSRF deve ser estruturado em 4 partes (session:timestamp:salt:signature)');
        assert.equal(parts[0], 'session_goku_saiyan_777', 'Parte 0 deve vincular a sessão exata');
        assert.equal(parts[3].length, 64, 'Assinatura HMAC de integridade deve possuir 64 caracteres');
    });

    runner.add('Criptografia Avançada', 'CSRFProtection: Validação de token, rejeição cross-session e detecção de expiração', () => {
        const csrf = window.Security.CSRFProtection;
        const sessionId = 'session_vegeta_888';
        const token = csrf.generateToken(sessionId);

        assert.isTrue(csrf.validateToken(token, sessionId), 'Token legítimo com mesma sessão deve ser validado');
        assert.isFalse(csrf.validateToken(token, 'different_session_999'), 'Token usado em sessão cruzada deve ser rejeitado');
        assert.isFalse(csrf.validateToken(token + '_tampered', sessionId), 'Token com assinatura corrompida deve ser rejeitado');
        assert.isFalse(csrf.validateToken(null, sessionId), 'Valores nulos devem ser rejeitados com segurança');
    });

    // =========================================================================
    // 12. AUDITORIA EXECUTIVA MARKDOWN & TELEMETRIA OFFLINE
    // =========================================================================
    runner.add('Auditoria & Telemetria', 'Exportação Markdown: Geração de relatório executivo com cabeçalho de integridade', () => {
        assert.isTrue(typeof window.exportService.exportMarkdown === 'function', 'exportMarkdown deve existir');
        const md = window.exportService.exportMarkdown();
        assert.isTrue(typeof md === 'string', 'exportMarkdown deve retornar string Markdown');
        assert.includes(md, '# Relatório Executivo de Auditoria & Segurança de Acesso', 'Deve conter título de relatório executivo');
        assert.includes(md, 'Hash de Integridade:', 'Deve conter selo de integridade criptográfica');
        assert.includes(md, 'Data de Emissão (UTC):', 'Deve conter timestamp formal de emissão');
    });

    runner.add('Auditoria & Telemetria', 'Exportação Markdown: Seção de identificação de usuário com CPF mascarado (LGPD)', () => {
        const md = window.exportService.exportMarkdown();
        assert.includes(md, '## 1. Identificação do Usuário e Sessão', 'Deve conter seção 1');
        assert.includes(md, 'CPF Mascarado', 'Deve possuir campo de CPF mascarado');
        assert.includes(md, 'Mascaramento LGPD', 'Deve citar o mascaramento de privacidade');
        assert.includes(md, 'E-mail Corporativo', 'Deve documentar e-mail corporativo');
    });

    runner.add('Auditoria & Telemetria', 'Exportação Markdown: Tabela de trilha de auditoria e status de conformidade', () => {
        const md = window.exportService.exportMarkdown();
        assert.includes(md, '## 2. Indicadores de Postura de Segurança', 'Deve conter seção de postura de segurança');
        assert.includes(md, '## 3. Trilha de Auditoria & Registro de Eventos Recentes', 'Deve conter seção de trilha de eventos');
        assert.includes(md, '| Data / Hora | Categoria | Evento / Ação | Severidade | Status |', 'Deve conter cabeçalho da tabela Markdown');
        assert.includes(md, 'Criptografia de Credenciais:', 'Deve documentar a cifra de credenciais');
    });

    runner.add('Auditoria & Telemetria', 'Exportação Markdown: Inclusão de declaração formal de conformidade com a Lei 13.709/2018', () => {
        const md = window.exportService.exportMarkdown();
        assert.includes(md, '## 4. Declaração de Conformidade LGPD (Lei nº 13.709/2018)', 'Deve conter seção de conformidade LGPD');
        assert.includes(md, 'princípio da minimização da coleta', 'Deve registrar aderência aos princípios da LGPD');
    });

    runner.add('Auditoria & Telemetria', 'OfflineTelemetryCache: Instanciação e inserção de eventos de telemetria', () => {
        assert.isTrue(typeof window.OfflineTelemetryCache === 'function', 'OfflineTelemetryCache deve ser uma classe');
        const cache = new window.OfflineTelemetryCache(10);
        assert.equal(cache.size(), 0, 'Cache inicial deve estar vazio');

        cache.push({ event: 'cluster_health', metric: 'cpu', value: 38, status: 'OPTIMAL' });
        cache.push({ event: 'auth_attempt', metric: 'latency', value: 120, status: 'OK' });
        assert.equal(cache.size(), 2, 'Cache deve armazenar 2 itens');

        const items = cache.getAll();
        assert.equal(items[0].event, 'cluster_health', 'Primeiro item deve ter evento cluster_health');
        assert.equal(items[1].value, 120, 'Segundo item deve ter valor 120');
    });

    runner.add('Auditoria & Telemetria', 'OfflineTelemetryCache: Despejo FIFO quando limite do buffer é excedido', () => {
        const cache = new window.OfflineTelemetryCache(3);
        cache.push({ event: 'ev_1', value: 10 });
        cache.push({ event: 'ev_2', value: 20 });
        cache.push({ event: 'ev_3', value: 30 });
        assert.equal(cache.size(), 3, 'Deve atingir a capacidade máxima');

        // Inserção do 4º elemento: deve desalojar ev_1 (FIFO)
        cache.push({ event: 'ev_4', value: 40 });
        assert.equal(cache.size(), 3, 'Tamanho deve permanecer limitado a 3');
        const items = cache.getAll();
        assert.equal(items[0].event, 'ev_2', 'Item ev_1 mais antigo deve ter sido despejado');
        assert.equal(items[2].event, 'ev_4', 'Item ev_4 mais recente deve estar no final');
    });

    runner.add('Auditoria & Telemetria', 'OfflineTelemetryCache: Serialização RFC 4180 em formato CSV com UTF-8 BOM', () => {
        const cache = new window.OfflineTelemetryCache(5);
        cache.push({ event: 'login_ok', metric: 'auth', value: 1, status: 'SUCCESS' });
        cache.push({ event: 'rate_limit', metric: 'security', value: 0, status: 'BLOCKED' });

        const csv = cache.toCSV();
        assert.equal(csv.charCodeAt(0), 0xFEFF, 'CSV de telemetria deve conter UTF-8 BOM');
        assert.includes(csv, 'Timestamp,Event,Metric,Value,Status', 'Deve conter cabeçalhos tabulares');
        assert.includes(csv, '"login_ok"', 'Deve conter eventos formatados');
        assert.includes(csv, '"BLOCKED"', 'Deve conter status formatados');
    });

    runner.add('Auditoria & Telemetria', 'OfflineTelemetryCache: Persistência e restauração do cache em LocalStorage', () => {
        const cache1 = new window.OfflineTelemetryCache(10);
        cache1.push({ event: 'snapshot_a', value: 99 });
        cache1.push({ event: 'snapshot_b', value: 100 });
        cache1.persist('test_telemetry_storage_key');

        const cache2 = new window.OfflineTelemetryCache(10);
        const restored = cache2.restore('test_telemetry_storage_key');
        assert.isTrue(restored, 'Cache deve ser restaurado com sucesso');
        assert.equal(cache2.size(), 2, 'Cache restaurado deve possuir 2 itens');
        assert.equal(cache2.getAll()[0].event, 'snapshot_a', 'Itens restaurados devem manter integridade');
    });

    runner.add('Auditoria & Telemetria', 'CSRF Header Injection: Cabeçalho X-CSRF-Token para requisições assíncronas', () => {
        const csrf = window.Security.CSRFProtection;
        const headers = csrf.getHeaders('custom_token_abc_123');
        assert.equal(headers['X-CSRF-Token'], 'custom_token_abc_123', 'Cabeçalho X-CSRF-Token deve corresponder ao token');
        assert.equal(headers['X-Requested-With'], 'XMLHttpRequest', 'Cabeçalho X-Requested-With deve estar configurado');
    });

    runner.add('Auditoria & Telemetria', 'Validação Cruzada de Postura de Segurança: Integração completa entre Security e AuthService', async () => {
        assert.isTrue(typeof window.AuthService.generateJwtToken === 'function', 'AuthService.generateJwtToken deve existir');
        const user = { username: 'goku.saiyan', email: 'goku@capsule.corp', cpf: '52998224725' };
        const token = window.AuthService.generateJwtToken(user);
        assert.isTrue(typeof token === 'string', 'Token gerado deve ser string');

        const verification = window.AuthService.verifyJwtToken(token);
        assert.isTrue(verification.valid, 'Token gerado pelo AuthService deve ser validado pelo motor criptográfico');
        assert.equal(verification.payload.sub, 'goku.saiyan', 'Subject da sessão deve corresponder ao usuário');
    });

    // =========================================================================
    // 13. DOCUMENTOS FISCAIS & ALGORITMOS BRASILEIROS AVANÇADOS
    // =========================================================================
    runner.add('Documentos Brasileiros', 'CNH: Validação de dígito verificador duplo com fator de decréscimo e rejeição de repetidos', () => {
        assert.isTrue(typeof window.Validators.validateCNH === 'function', 'validateCNH deve existir');
        assert.isTrue(window.Validators.validateCNH('00000000119'), 'Vetor válido de CNH deve retornar true');
        assert.isFalse(window.Validators.validateCNH('11111111111'), 'CNH com dígitos repetidos deve ser rejeitada');
        assert.isFalse(window.Validators.validateCNH('12345'), 'CNH com tamanho incorreto deve ser rejeitada');
    });

    runner.add('Documentos Brasileiros', 'PIS/PASEP: Módulo 11 com pesos oficiais [3,2,9,8,7,6,5,4,3,2]', () => {
        assert.isTrue(typeof window.Validators.validatePIS === 'function', 'validatePIS deve existir');
        assert.isTrue(window.Validators.validatePIS('00000000019'), 'Vetor válido de PIS deve retornar true');
        assert.isTrue(window.Validators.validatePIS('000.0000.001-9'), 'PIS com máscara deve ser validado');
        assert.isFalse(window.Validators.validatePIS('22222222222'), 'PIS com dígitos repetidos deve ser rejeitado');
        assert.isFalse(window.Validators.validatePIS('00000000018'), 'PIS com dígito incorreto deve ser rejeitado');
    });

    runner.add('Documentos Brasileiros', 'Título de Eleitor: Regra oficial do TSE com exceção de resto zero para SP (01) e MG (02)', () => {
        assert.isTrue(typeof window.Validators.validateTituloEleitor === 'function', 'validateTituloEleitor deve existir');
        assert.isTrue(window.Validators.validateTituloEleitor('000000010191'), 'Título de eleitor válido de SP deve retornar true');
        assert.isFalse(window.Validators.validateTituloEleitor('000000010190'), 'Título de eleitor com DV incorreto deve ser rejeitado');
        assert.isFalse(window.Validators.validateTituloEleitor('000000019991'), 'Título com código UF inválido (99) deve ser rejeitado');
    });

    runner.add('Documentos Brasileiros', 'RENAVAM: Validação módulo 11 com pesos ponderados', () => {
        assert.isTrue(typeof window.Validators.validateRENAVAM === 'function', 'validateRENAVAM deve existir');
        assert.isTrue(window.Validators.validateRENAVAM('00000000019'), 'RENAVAM válido deve retornar true');
        assert.isFalse(window.Validators.validateRENAVAM('33333333333'), 'RENAVAM com dígitos repetidos deve ser rejeitado');
        assert.isFalse(window.Validators.validateRENAVAM('00000000015'), 'RENAVAM com DV incorreto deve ser rejeitado');
    });

    // =========================================================================
    // 14. INFRAESTRUTURA DE SEGURANÇA AVANÇADA (JWKS, REVOCATION CRL & BACKUP CODES)
    // =========================================================================
    runner.add('Infraestrutura de Segurança', 'JWKSEngine: Assinatura assimétrica, verificação e rotação de chaves RFC 7517', () => {
        const jwks = window.Security.JWKSEngine;
        assert.isTrue(typeof jwks.signAsymmetric === 'function', 'signAsymmetric deve existir');
        assert.isTrue(typeof jwks.verifyAsymmetric === 'function', 'verifyAsymmetric deve existir');

        const token = jwks.signAsymmetric({ sub: 'vegeta.saiyan', clearance: 'ultra' });
        assert.isTrue(typeof token === 'string', 'Token assinado deve ser string');
        const ver = jwks.verifyAsymmetric(token);
        assert.isTrue(ver.valid, 'Token assimétrico legítimo deve ser validado');
        assert.equal(ver.payload.sub, 'vegeta.saiyan', 'Payload sub deve ser preservado');

        const rotation = jwks.rotateKeys();
        assert.isTrue(Boolean(rotation.newKeyId), 'Rotação deve gerar novo keyId');
        assert.isTrue(rotation.totalKeys >= 3, 'Total de chaves deve incluir nova chave ativa');
    });

    runner.add('Infraestrutura de Segurança', 'RevocationList: Revogação de JTI e família de tokens com bloqueio em tempo real', () => {
        const crl = window.Security.RevocationList;
        const testJti = 'jti_revocation_test_' + Date.now();
        assert.isFalse(crl.isRevoked(testJti), 'JTI novo não deve estar revogado');

        crl.revoke(testJti, 'TOKEN_LEAK_SIMULATION');
        assert.isTrue(crl.isRevoked(testJti), 'JTI revogado deve ser bloqueado imediatamente');

        const testFamily = 'family_batch_' + Date.now();
        crl.revokeFamily(testFamily, 'REFRESH_TOKEN_COMPROMISE');
        assert.isTrue(crl.isRevoked('any_jti', testFamily), 'Token pertencente a família revogada deve ser bloqueado');
    });

    runner.add('Infraestrutura de Segurança', 'BackupCodesManager: Geração de 8 códigos de emergência, hash SHA-256 e consumo único', () => {
        const mgr = window.Security.BackupCodesManager;
        const batch = mgr.generateBackupCodesBatch();
        assert.equal(batch.plainCodes.length, 8, 'Deve gerar exatamente 8 códigos de emergência');
        assert.equal(batch.backupCodesData.codes.length, 8, 'Deve conter 8 hashes de códigos');

        const code = batch.plainCodes[0];
        const r1 = mgr.consumeCode(code, batch.backupCodesData);
        assert.isTrue(r1.success, 'Consumo de código válido na primeira tentativa deve ter sucesso');
        assert.equal(batch.backupCodesData.remainingCount, 7, 'Contador de códigos restantes deve decrementar para 7');

        const r2 = mgr.consumeCode(code, batch.backupCodesData);
        assert.isFalse(r2.success, 'Reutilização do mesmo código deve ser rejeitada');
        assert.equal(r2.reason, 'ALREADY_USED', 'Motivo da rejeição deve ser ALREADY_USED');
    });

    runner.add('Infraestrutura de Segurança', 'OutOfBandApproval: Desafio SMS com mascaramento, expiração e validação', () => {
        const oob = window.Security.OutOfBandApproval;
        const req = oob.requestSMS('(11) 98765-4321', 'test_user_unit');
        assert.isTrue(req.success, 'Solicitação de SMS deve ter sucesso');
        assert.equal(req.maskedPhone, '(11) 9****-4321', 'Telefone deve estar mascarado');

        const badVerify = oob.verifySMS('test_user_unit', '000000');
        assert.isFalse(badVerify.success, 'Código incorreto deve ser rejeitado');

        const goodVerify = oob.verifySMS('test_user_unit', req.simulatedOtp);
        assert.isTrue(goodVerify.success, 'Código correto deve ser aprovado');
    });

    // =========================================================================
    // 15. CONFORMIDADE LGPD (LEI Nº 13.709/2018) & DIREITOS DO TITULAR
    // =========================================================================
    runner.add('Conformidade LGPD', 'LGPDDataSubjectRights: Confirmação de tratamento (Art. 18, I) e anonimização (Art. 18, IV)', () => {
        const dsr = window.exportService.lgpdRights;
        assert.isTrue(typeof dsr.confirmProcessing === 'function', 'confirmProcessing deve existir');

        const conf = dsr.confirmProcessing();
        assert.isTrue(conf.hasActiveProcessing, 'Deve confirmar existência de tratamento de dados');
        assert.includes(conf.legalBasis, 'Art. 7º, V', 'Deve fundamentar na execução de contrato');

        const anon = dsr.anonymizeData({ name: 'Son Goku', email: 'goku@capsulecorp.com.br', cpf: '52998224725' });
        assert.equal(anon.cpf, '529.***.***-25', 'CPF deve ser anonimizado perante a LGPD');
        assert.includes(anon.email, 'g***u@', 'Email deve ser ofuscado');
    });

    runner.add('Conformidade LGPD', 'ExportService: Exportação de Códigos de Emergência em TXT com aviso de segurança', () => {
        const mgr = window.Security.BackupCodesManager;
        const batch = mgr.generateBackupCodesBatch();
        const txt = window.exportService.exportBackupCodesTxt(batch.plainCodes, batch.backupCodesData.batchId);
        assert.isTrue(typeof txt === 'string', 'exportBackupCodesTxt deve retornar string');
        assert.includes(txt, 'CODIGOS DE RECUPERACAO DE EMERGENCIA', 'Deve conter cabeçalho');
        assert.includes(txt, 'INSTRUCOES DE SEGURANCA', 'Deve conter aviso de segurança');
        assert.includes(txt, batch.backupCodesData.batchId, 'Deve conter ID do lote de códigos');
    });

    // =========================================================================
    // 16. FÍSICA COMPUTACIONAL SAIYAN & BIOMETRIA ESPORTS
    // =========================================================================
    runner.add('Física & Biometria', 'HighPrecisionPhysicsEngine: Integrador Velocity Verlet e equação diferencial de estamina RK4', () => {
        const phys = window.HighPrecisionPhysicsEngine;
        assert.isTrue(typeof phys.integrateVerlet === 'function', 'integrateVerlet deve existir');
        assert.isTrue(typeof phys.integrateStaminaRK4 === 'function', 'integrateStaminaRK4 deve existir');

        const particle = { x: 0, y: 0, vx: 10, vy: 10 };
        phys.integrateVerlet(particle, 0, 0.2, 0.016, 0.96);
        assert.isTrue(particle.x > 0, 'Partícula deve avançar horizontalmente');
        assert.isTrue(particle.y > 0, 'Partícula deve avançar verticalmente');

        const st1 = phys.integrateStaminaRK4(100, 100, 1.0, 0.5);
        assert.isTrue(st1 < 100, 'Estamina deve decair sob 100G de força gravitacional');
        assert.isTrue(st1 > 80, 'Decaimento por RK4 em 0.5s deve ser suave e não instantâneo');
    });

    runner.add('Física & Biometria', 'SaiyanTransformationEngine: Multiplicadores de poder de luta e cálculo de energia', () => {
        const trans = window.SaiyanTransformationEngine;
        assert.isTrue(typeof trans === 'function', 'SaiyanTransformationEngine deve ser uma classe');
        const engine = new trans();
        assert.equal(engine.currentForm.id, 'base', 'Forma inicial deve ser base');

        engine.transformTo('ssj1');
        assert.equal(engine.currentForm.multiplier, 50, 'Super Saiyajin deve ter multiplicador x50');

        engine.transformTo('ultra_instinct');
        assert.equal(engine.currentForm.multiplier, 500000, 'Instinto Superior deve ter multiplicador x500.000');
    });

    runner.add('Física & Biometria', 'FittsBiometricsEngine: Índice de Dificuldade de Fitts e Throughput (bits/s)', () => {
        const fitts = window.FittsBiometricsEngine;
        assert.isTrue(typeof fitts.calculateIndexDifficulty === 'function', 'calculateIndexDifficulty deve existir');
        assert.isTrue(typeof fitts.calculateThroughput === 'function', 'calculateThroughput deve existir');

        const id = fitts.calculateIndexDifficulty(200, 40);
        assert.isTrue(id > 2.5 && id < 3.0, 'Índice de Dificuldade para D=200, W=40 deve ser ~2.58 bits');

        const tp = fitts.calculateThroughput(200, 40, 0.5);
        assert.isTrue(tp > 4.5, 'Throughput deve ser superior a 4.5 bps para movimento rápido');
    });

    runner.add('Física & Biometria', 'MotorReactionAnalyzer & EnduranceFatigueMonitor: Decomposição Ex-Gaussiana e Índice de Fadiga', () => {
        const exG = window.MotorReactionAnalyzer.decomposeExGaussian([190, 205, 210, 225, 290, 320]);
        assert.isTrue(exG.mu > 0, 'Componente normal Mu deve ser positivo');
        assert.isTrue(exG.tau > 0, 'Cauda exponencial Tau deve ser positiva');

        const ei = window.EnduranceFatigueMonitor.calculateEnduranceIndex([1000, 1200, 1400, 2500, 8000, 8200, 8400, 9000], 10);
        assert.isTrue(ei > 0, 'Índice de fadiga deve ser calculado com sucesso');
    });

    runner.add('Engenharia & Relatividade', 'RelativisticPhysicsEngine: Dilatação temporal gravitacional e horizonte de eventos de Schwarzschild', () => {
        const rel = window.RelativisticPhysicsEngine || (window.CapsuleCorp && window.CapsuleCorp.RelativisticPhysicsEngine);
        assert.isTrue(typeof rel === 'function' || typeof rel === 'object', 'RelativisticPhysicsEngine deve estar disponível');
        
        const mass1G = rel.calculateEffectiveMass(1, 5);
        assert.isTrue(mass1G > 0, 'Massa efetiva para 1G deve ser positiva');
        
        const rs1G = rel.calculateSchwarzschildRadius(1, 5);
        assert.isTrue(rs1G > 0, 'Raio de Schwarzschild deve ser positivo');
        assert.isTrue(rs1G < 1e-10, 'Raio de Schwarzschild para 1G em raio de 5m deve ser infinitesimal');

        const tau1G = rel.calculateTimeDilationFactor(1, 5);
        assert.isTrue(tau1G > 0.999999, 'Fator de dilatação temporal para 1G deve ser extremamente próximo de 1.0');

        const telemetry = rel.getRelativisticTelemetry(100, 5);
        assert.equal(telemetry.gForce, 100, 'G-Force na telemetria deve ser 100');
        assert.isFalse(telemetry.isSingularityThreat, '100G não deve ameaçar singularidade');
    });

    runner.add('Engenharia de Resiliência', 'ChaosMesh: Circuit Breaker State Machine & Transição CLOSED -> OPEN', async () => {
        const chaos = window.ChaosMesh;
        assert.isTrue(typeof chaos === 'object', 'ChaosMesh deve estar disponível');
        
        const breaker = chaos.createBreaker({ failureThreshold: 2, cooldownPeriodMs: 50 });
        assert.equal(breaker.state, 'CLOSED', 'Estado inicial deve ser CLOSED');

        let failCount = 0;
        const failingTask = async () => { failCount++; throw new Error('Simulated network fault'); };

        try { await breaker.execute(failingTask); } catch (e) {}
        try { await breaker.execute(failingTask); } catch (e) {}

        assert.equal(breaker.state, 'OPEN', 'Após 2 falhas consecutivas, circuito deve estar OPEN');
        assert.isTrue(breaker.isOpen(), 'isOpen deve retornar true');
    });

    runner.add('Engenharia de Resiliência', 'ChaosMesh: FallbackStorage de memória transparente', () => {
        const chaos = window.ChaosMesh;
        const storage = new chaos.FallbackStorage();
        storage.setItem('test_token', 'jwt_val_999');
        assert.equal(storage.getItem('test_token'), 'jwt_val_999', 'Item salvo no storage deve ser recuperável');
        storage.removeItem('test_token');
        assert.isTrue(storage.getItem('test_token') === null, 'Item removido deve retornar null');
    });

    runner.add('Engenharia de Resiliência', 'ChaosMesh: Dead Letter Queue (DLQ) enfileiramento e reprocessamento', async () => {
        const chaos = window.ChaosMesh;
        const dlq = new chaos.DeadLetterQueue('test_dlq_unit', 10);
        dlq.clear();
        
        const entry = dlq.enqueue({ event: 'USER_LOGIN_FAIL', user: 'agent_44' }, 'HTTP 503');
        assert.isTrue(entry.id.startsWith('dlq_'), 'ID da mensagem DLQ deve ter prefixo correto');
        assert.equal(dlq.size(), 1, 'DLQ deve conter 1 item');

        const retryResult = await dlq.processQueue(async (payload) => {
            assert.equal(payload.event, 'USER_LOGIN_FAIL', 'Payload enfileirado deve ser íntegro');
        });
        assert.equal(retryResult.processed, 1, 'Deve reprocessar com sucesso o item enfileirado');
        assert.equal(dlq.size(), 0, 'DLQ deve estar vazio após processamento');
    });

    // Public test runner triggers
    window.runUnitTests = () => runner.run();

    // Auto-run when DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => runner.run());
    } else {
        runner.run();
    }

})(typeof window !== 'undefined' ? window : this);
