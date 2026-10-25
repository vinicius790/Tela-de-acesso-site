# 🔐 Portal de Acesso & Autenticação Segura

<p align="center">
  <img src="https://img.shields.io/badge/Status-Ativo%20%26%20Otimizado-success?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/Licença-MIT-blue?style=for-the-badge" alt="License">
  <img src="https://img.shields.io/badge/HTML5-%23E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-%231572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-ES6+-yellow?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/ViaCEP%20%2F%20BrasilAPI-Integrado-informational?style=for-the-badge" alt="API CEP">
  <img src="https://img.shields.io/badge/Web_Crypto_API-SHA--256-green?style=for-the-badge" alt="Web Crypto">
  <img src="https://img.shields.io/badge/Testes-Nativos%20em%20Navegador-blueviolet?style=for-the-badge" alt="Testes">
</p>

> **Aplicação web de alta fidelidade para login e cadastro com alternância dinâmica em abas, integração em tempo real com ViaCEP/BrasilAPI, validação matemática estrita de CPF brasileiro (módulo 11), criptografia nativa SHA-256 via Web Crypto API, painel do usuário com gráficos de auditoria em Canvas, gerador de QR Code 2FA em SVG, exportação de relatório de segurança via Blob API e modo secreto "Super Saiyan".**

---

## 📌 Sumário
- [Tecnologias & APIs Integradas](#-tecnologias--apis-integradas)
- [Validação e Segurança](#-validação-e-segurança)
- [Mock Backend & Gestão de Sessão (JWT)](#-mock-backend--gestão-de-sessão-jwt)
- [Painel do Usuário (Dashboard & Analytics)](#-painel-do-usuário-dashboard--analytics)
- [Suíte de Testes Unitários](#-suíte-de-testes-unitários)
- [Temas & Easter Egg Dragon Ball](#-temas--easter-egg-dragon-ball)
- [Estrutura do Repositório](#-estrutura-do-repositório)
- [Como Testar](#-como-testar)

---

## ⚡ Tecnologias & APIs Integradas

1. **APIs Públicas de Endereço (`ViaCEP` / `BrasilAPI`) em [`js/cep-service.js`](js/cep-service.js)**:
   * Consulta assíncrona automática ao preencher o CEP com 8 dígitos (`00000-000`).
   * Mecanismo de *Debouncing* e failover em cascata (BrasilAPI → ViaCEP → Cache local em memória).
   * Totalmente defensivo e tolerante a falhas (não bloqueia o cadastro se a rede oscilar).
2. **Web Cryptography API (`crypto.subtle`) em [`js/auth-service.js`](js/auth-service.js)**:
   * Hashing de senhas utilizando SHA-256 criptográfico nativo com sal.
3. **HTML5 Canvas Analytics Engine ([`js/dashboard-charts.js`](js/dashboard-charts.js))**:
   * Gráfico de área e linha em gradiente neon representando frequência de acessos nos últimos 7 dias.
   * Gráfico de rosca (*donut chart*) para pontuação de segurança e conformidade do sistema.
4. **Blob & FileSaver API ([`js/export-service.js`](js/export-service.js))**:
   * Permite ao usuário baixar um relatório estruturado de auditoria em JSON (`auditoria_sessao.json`) com timestamp e protocolos ativos.
5. **Gerador de QR Code 2FA em SVG ([`js/export-service.js`](js/export-service.js))**:
   * Renderização vetorial de QR Code para autenticadores TOTP (Google Authenticator, Authy).
6. **Progressive Web App (PWA)**:
   * Manifesto `manifest.json` e Service Worker `sw.js` para instalação no dispositivo e funcionamento offline.

---

## 🛡️ Validação e Segurança

Implementado em [`js/validators.js`](js/validators.js) e [`js/security.js`](js/security.js):
1. **Validação Estrita de CPF Brasileiro**:
   * Algoritmo de cálculo completo dos dois dígitos verificadores por multiplicação ponderada e módulo 11.
   * Rejeição automática de números inválidos com todos os dígitos idênticos (ex: `111.111.111-11`).
   * Máscara automática em tempo real (`000.000.000-00`).
2. **Medidor de Força e Entropia de Senha**:
   * Cálculo de pontuação dinâmico (0 a 100%) baseado em comprimento, presença de letras maiúsculas, minúsculas, números e caracteres especiais.
   * Feedback visual imediato com barra de progresso colorida.
3. **Proteção Contra Ataques**:
   * Sanitização estrita contra Cross-Site Scripting (XSS).
   * Sistema de bloqueio temporário (*lockout*) contra tentativas de força bruta (5 tentativas falhadas bloqueiam o formulário temporariamente).

---

## ⚙️ Mock Backend & Gestão de Sessão (JWT)

Através do [`js/auth-service.js`](js/auth-service.js), o portal intercepta chamadas assíncronas de Axios para rotas `/api/login` e `/api/register`:
* **Hashing Seguro**: Senhas armazenadas com hash criptográfico SHA-256 no `localStorage`.
* **Emissão de JWT**: Criação de token codificado em Base64 com cabeçalho (`alg: HS256`), payload (`sub, email, cpf, exp`) e assinatura.
* **Lembrar-me**: Persistência configurável de sessão entre visitas.

---

## 📊 Painel do Usuário (Dashboard & Analytics)

Após o login bem-sucedido, o usuário é direcionado para [`dashboard.html`](dashboard.html):
* Proteção de rota ativa (redireciona automaticamente ao login caso o token não esteja presente).
* Exibição de dados mascarados do usuário autenticado e avatar dinâmico com sua inicial.
* Gráficos interativos em Canvas nativo para acessos e score de conformidade.
* Chave TOTP 2FA renderizada em QR Code SVG.
* Botão para **Exportar Relatório de Auditoria** e encerramento de sessão (*Logout*).

---

## 🧪 Suíte de Testes Unitários

O projeto inclui um **Test Runner Interativo Nativo** em [`tests/index.html`](tests/index.html) e [`tests/unit-tests.js`](tests/unit-tests.js):
* Executa diretamente no navegador sem necessidade de Node.js ou instalação via npm.
* Testa exaustivamente:
  * CPFs matematicamente válidos e rejeição de inválidos/repetidos.
  * Score de complexidade de senha.
  * Máscaras de CPF, Celular e CEP.
  * Expressão regular RFC 5322 de validação de e-mail.
  * Web Cryptography API (SHA-256).
  * API de CEP (formato e validação).
  * Fluxo de cadastro, autenticação e token JWT.
  * Sanitização XSS.
* Exibe tempo de execução e status visual (Pass/Fail) em tempo real.

---

## ⚡ Temas & Easter Egg Dragon Ball

Através de [`js/theme-engine.js`](js/theme-engine.js), o usuário pode alternar entre:
* **Executive Dark**: Design corporativo em tons de ardósia escuro com azul e magenta neon.
* **Super Saiyan Mode**: Efeito temático com partículas de Ki douradas/azuis em CSS puro, bordas pulsantes em amarelo saiyan e iluminação neon.
* Preferência mantida automaticamente no `localStorage`.

---

## 📂 Estrutura do Repositório

```text
Tela-de-acesso-site/
├── index.html                  # Portal principal com abas de login e cadastro
├── goku.html                   # Modo clássico (Dragon Ball style) com correção de vínculos
├── dashboard.html              # Painel do usuário pós-autenticação com gráficos e QR Code
├── manifest.json               # Manifesto PWA para instalação no dispositivo
├── sw.js                       # Service Worker para cache e suporte offline
├── vegeta.css                  # Folha de estilos Dark Glassmorphism
├── script.js                   # Controlador principal da interface
├── styles/
│   └── particles.css           # Partículas cósmicas e efeito de aura em CSS puro
├── js/
│   ├── auth-service.js         # Backend simulado, SHA-256 e geração de JWT
│   ├── cep-service.js          # Integração resiliente com ViaCEP e BrasilAPI
│   ├── dashboard.js            # Lógica de proteção de rota e logout do dashboard
│   ├── dashboard-charts.js     # Gráficos analíticos interativos em Canvas
│   ├── export-service.js       # Exportação de relatório JSON e QR Code 2FA SVG
│   ├── notifications.js        # Wrapper SweetAlert2 e sistema leve de toasts
│   ├── security.js             # Sanitização XSS e mitigação de força bruta
│   ├── theme-engine.js         # Gerenciador de temas (Executive vs Super Saiyan)
│   └── validators.js           # Algoritmo de CPF, máscaras e força de senha
├── tests/
│   ├── index.html              # Test runner visual interativo no navegador
│   └── unit-tests.js           # Bateria de testes unitários automatizados
└── .github/
    └── workflows/
        └── ci.yml              # Pipeline de validação estática e deploy no GitHub Pages
```

---

## 🚀 Como Testar

1. Basta abrir o arquivo `index.html` em seu navegador para utilizar o portal de autenticação.
2. Abra `tests/index.html` para visualizar a execução da bateria de testes unitários em tempo real.
3. Para testar o fluxo de acesso:
   * Realize o cadastro na aba **Cadastrar** (informando qualquer CPF matematicamente válido e um CEP).
   * O sistema resolverá o endereço automaticamente via ViaCEP/BrasilAPI, salvará com SHA-256 e redirecionará para o painel em `dashboard.html`.