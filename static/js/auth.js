// auth.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const error = document.getElementById('error');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    error.textContent = '';
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    try {
      const res = await apiPost('login', { username, password });
      if (res.success) {
        window.location.href = '/dashboard';
      } else {
        error.textContent = res.message || 'Login failed';
      }
    } catch (err) {
      error.textContent = 'Server error';
    }
  });
});
