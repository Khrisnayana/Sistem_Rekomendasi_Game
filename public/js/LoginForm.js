class LoginForm {
  constructor(formElement) {
    this.form = formElement;
    this.init();
  }

  init() {
    this.form.addEventListener('submit', this.handleSubmit.bind(this));
  }

  async handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(this.form);
    const username = formData.get('username');
    const password = formData.get('password');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const result = await response.json();
      if (result.success) {
        window.location.href = 'index.html';
      } else {
        const errorEl = document.getElementById('error-message');
        if (errorEl) {
          errorEl.textContent = result.message || 'Invalid credentials. Please try again.';
          errorEl.classList.remove('hidden');
        } else {
          alert('Invalid credentials');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed');
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  if (form) {
    new LoginForm(form);
  }
});
