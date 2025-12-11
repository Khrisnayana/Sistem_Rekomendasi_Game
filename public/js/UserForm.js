class UserForm {
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
    const genres = formData.getAll('genres');
    const modes = formData.getAll('modes');

    const errorEl = document.getElementById('error-message');
    
    if (!username || !password) {
      if (errorEl) {
        errorEl.textContent = 'Please fill in username and password.';
        errorEl.classList.remove('hidden');
      } else {
        alert('Please fill in username and password.');
      }
      return;
    }

    if (genres.length === 0) {
      if (errorEl) {
        errorEl.textContent = 'Please select at least one preferred genre.';
        errorEl.classList.remove('hidden');
      } else {
        alert('Please select at least one preferred genre.');
      }
      return;
    }

    if (modes.length === 0) {
      if (errorEl) {
        errorEl.textContent = 'Please select at least one preferred game mode.';
        errorEl.classList.remove('hidden');
      } else {
        alert('Please select at least one preferred game mode.');
      }
      return;
    }

    if (errorEl) {
      errorEl.classList.add('hidden');
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, genres, modes })
      });

      const result = await response.json();
      if (result.success) {
        alert('Registration successful! Please login.');
        window.location.href = 'login.html';
      } else {
        if (errorEl) {
          errorEl.textContent = result.message || 'Registration failed. Please try again.';
          errorEl.classList.remove('hidden');
        } else {
          alert('Registration failed: ' + result.message);
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed');
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('register-form');
  if (form) {
    new UserForm(form);
  }
});
