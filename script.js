document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');
    const messageDiv = document.getElementById('message');
  
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const cpf = document.getElementById('cpf').value;
      const email = document.getElementById('email').value;
  
      // Validação básica
      if (!username || !password || !cpf || !email) {
        showMessage('Todos os campos são obrigatórios.', 'error');
        return;
      }
  
      if (!validateCPF(cpf)) {
        showMessage('CPF inválido.', 'error');
        return;
      }
  
      // Lógica para enviar os dados para o backend
      try {
        const response = await axios.post('/api/login', {
          username,
          password,
          cpf,
          email
        });
  
        if (response.data.success) {
          showMessage(`Bem-vindo(a), ${username}! Login realizado com sucesso.`, 'success');
        } else {
          showMessage('Erro ao realizar login.', 'error');
        }
      } catch (error) {
        showMessage('Erro no servidor. Tente novamente mais tarde.', 'error');
      }
    });
  
    function showMessage(message, type) {
      Swal.fire({
        text: message,
        icon: type === 'success' ? 'success' : 'error',
        timer: 3000,
        showConfirmButton: false
      });
    }
  
    function validateCPF(cpf) {
      cpf = cpf.replace(/[^\d]+/g, '');
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
