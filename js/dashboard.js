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
    function updateAvatar(name) {
      const firstLetter = ((name || 'U').charAt(0) || 'U').toUpperCase();
      const avatarEl = document.getElementById('user-avatar');
      if (avatarEl) {
        avatarEl.textContent = firstLetter;
      }
    }
    updateAvatar(username);

    // 5. Configurar Modal de Edição de Perfil
    const editNameInput = document.getElementById('edit-name');
    const editEmailInput = document.getElementById('edit-email');
    const editPhoneInput = document.getElementById('edit-phone');
    const editCpfInput = document.getElementById('edit-cpf');
    const btnSaveProfile = document.getElementById('btnSaveProfile');

    $('#editProfileModal').on('show.bs.modal', function () {
      if (editNameInput) editNameInput.value = userData.username || '';
      if (editEmailInput) editEmailInput.value = userData.email || '';
      if (editPhoneInput) editPhoneInput.value = userData.phone || '';
      if (editCpfInput) editCpfInput.value = maskCPF(userData.cpf || rawCpf);
    });

    if (editPhoneInput) {
      editPhoneInput.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '');
        if (v.length > 11) v = v.substring(0, 11);
        if (v.length > 10) {
          v = v.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (v.length > 6) {
          v = v.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
        } else if (v.length > 2) {
          v = v.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
        }
        e.target.value = v;
      });
    }

    if (btnSaveProfile) {
      btnSaveProfile.addEventListener('click', () => {
        const newName = editNameInput.value.trim();
        const newEmail = editEmailInput.value.trim();
        const newPhone = editPhoneInput.value.trim();

        if (!newName || !newEmail) {
          Swal.fire({
            icon: 'warning',
            title: 'Campos Obrigatórios',
            text: 'Nome e E-mail não podem ficar vazios.',
            confirmButtonColor: '#FF0043'
          });
          return;
        }

        userData.username = newName;
        userData.email = newEmail;
        userData.phone = newPhone;

        localStorage.setItem('user_data', JSON.stringify(userData));
        const session = JSON.parse(localStorage.getItem('mock_auth_session') || '{}');
        if (session && session.user) {
          session.user.username = newName;
          session.user.email = newEmail;
          session.user.phone = newPhone;
          localStorage.setItem('mock_auth_session', JSON.stringify(session));
        }

        if (welcomeEl) welcomeEl.textContent = newName;
        if (emailEl) emailEl.textContent = newEmail;
        updateAvatar(newName);

        $('#editProfileModal').modal('hide');

        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Perfil atualizado com sucesso!',
          showConfirmButton: false,
          timer: 2000
        });
      });
    }

    // 6. Ação do Botão de Logout
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