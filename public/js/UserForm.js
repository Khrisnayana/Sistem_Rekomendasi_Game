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

    if (!username || !password || genres.length === 0 || modes.length === 0) {
      alert('Please fill in all fields.');
      return;
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
        alert('Registration failed: ' + result.message);
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
