document.addEventListener('DOMContentLoaded', () => {
    // 1. Proteção de rota: verifica se o token ou sessão existe
    const token = localStorage.getItem('auth_token') || localStorage.getItem('mock_auth_session');
    if (!token) {
      Swal.fire({
        text: 'Acesso restrito. Por favor, realize o login para continuar.',
        icon: 'warning',
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
        window.location.href = 'index.html';
      });
      return;
    }

    // 2. Recuperar dados do usuário da sessão
    let userData = {};
    try {
      userData = JSON.parse(localStorage.getItem('user_data')) || 
                 JSON.parse(localStorage.getItem('mock_auth_session')) || {};
    } catch (e) {
      userData = {};
    }

    const username = userData.username || 'Usuário';
    const email = userData.email || 'usuario@email.com';
    const rawCpf = userData.cpf || '00000000000';

    // 3. Mascarar CPF (ex: 123.***.***-00)
    function maskCPF(cpf) {
      const cleaned = (cpf || '').replace(/\D/g, '');
      if (cleaned.length === 11) {
        return cleaned.substring(0, 3) + '.***.***-' + cleaned.substring(9, 11);
      }
      return cpf;
    }

    // 4. Preencher dados na interface
    const welcomeEl = document.getElementById('welcome-username');
    if (welcomeEl) welcomeEl.textContent = username;

    const emailEl = document.getElementById('user-email');
    if (emailEl) emailEl.textContent = email;

    const cpfEl = document.getElementById('user-cpf');
    if (cpfEl) cpfEl.textContent = maskCPF(rawCpf);

    // Gerar avatar com a inicial do usuário
    const firstLetter = (username.charAt(0) || 'U').toUpperCase();
    const avatarEl = document.getElementById('user-avatar');
    if (avatarEl) {
      avatarEl.textContent = firstLetter;
    }

    // 5. Ação do Botão de Logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        Swal.fire({
          title: 'Encerrando sessão...',
          text: 'Até logo!',
          icon: 'info',
          timer: 1200,
          showConfirmButton: false
        }).then(() => {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          localStorage.removeItem('mock_auth_session');
          window.location.href = 'index.html';
        });
      });
    }
});