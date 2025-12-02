class App {
  constructor() {
    this.user = null;
    this.gameList = null;
    this.search = null;
    this.init();
  }

  async init() {
    // Check session
    const sessionResponse = await fetch('/api/session', { credentials: 'include' });
    const sessionData = await sessionResponse.json();

    if (sessionData.loggedIn) {
      // User is logged in - show user dashboard and personalized recommendations
      this.user = sessionData.user;
      this.showUserDashboard();

      // Load personalized recommendations
      let games;
      if (this.user.genres && this.user.modes) {
        games = await Recommendation.getRecommendations(this.user);
      } else {
        // If no preferences set, show all games sorted by popularity
        games = await Recommendation.getAllGames();
        games.sort((a, b) => b.popularity - a.popularity);
      }

      // Initialize components
      this.gameList = new GameList(document.getElementById('game-list'), games);
      this.search = new Search(document.getElementById('search-input'), this.gameList);
    } else {
      // User not logged in - show guest view with all popular games
      this.showGuestView();

      // Load all games sorted by popularity (like Steam homepage)
      const games = await Recommendation.getAllGames();
      games.sort((a, b) => b.popularity - a.popularity);

      this.gameList = new GameList(document.getElementById('game-list'), games);
      this.search = new Search(document.getElementById('search-input'), this.gameList);
    }
  }

  showUserDashboard() {
    // Hide guest navigation, show user navigation
    const guestNav = document.getElementById('guest-nav');
    const userNav = document.getElementById('user-nav');
    const userGreeting = document.getElementById('user-greeting');
    const logoutBtn = document.getElementById('logout-btn');

    if (guestNav) guestNav.classList.add('hidden');
    if (userNav) userNav.classList.remove('hidden');
    if (userGreeting) userGreeting.textContent = `Welcome, ${this.user.username}!`;
    if (logoutBtn) {
      logoutBtn.addEventListener('click', this.logout.bind(this));
    }

    // Show user header, hide guest header
    const guestHeader = document.getElementById('guest-header');
    const userHeader = document.getElementById('user-header');
    if (guestHeader) guestHeader.classList.add('hidden');
    if (userHeader) userHeader.classList.remove('hidden');

    // Show user dashboard
    const dashboard = document.getElementById('user-dashboard');
    if (dashboard) {
      dashboard.classList.remove('hidden');
      // Update dashboard content
      const genresEl = document.getElementById('user-genres');
      const modesEl = document.getElementById('user-modes');
      if (genresEl) genresEl.textContent = this.user.genres.join(', ');
      if (modesEl) modesEl.textContent = this.user.modes.join(', ');
    }
  }

  showGuestView() {
    // Show guest navigation, hide user navigation
    const guestNav = document.getElementById('guest-nav');
    const userNav = document.getElementById('user-nav');

    if (guestNav) guestNav.classList.remove('hidden');
    if (userNav) userNav.classList.add('hidden');

    // Show guest header, hide user header
    const guestHeader = document.getElementById('guest-header');
    const userHeader = document.getElementById('user-header');
    if (guestHeader) guestHeader.classList.remove('hidden');
    if (userHeader) userHeader.classList.add('hidden');

    // Hide user dashboard
    const dashboard = document.getElementById('user-dashboard');
    if (dashboard) dashboard.classList.add('hidden');
  }

  async logout() {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    window.location.href = 'login.html';
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new App();
});
