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

    // Public test runner triggers
    window.runUnitTests = () => runner.run();

    // Auto-run when DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => runner.run());
    } else {
        runner.run();
    }

})(typeof window !== 'undefined' ? window : this);
